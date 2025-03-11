webchat.registerAnalyticsService(event => {
    // メッセージを受信したときは、ユーザーのメッセージがある場合は最後のユーザーのメッセージが一番上に、
    // 無い場合は最初のボットのメッセージが一番上に来るようにする
    if (event.type === "webchat/incoming-message") {
        setTimeout(() => {
            var chatContainer = document.querySelector('.webchat-chat-history');
            var userMessages = document.querySelectorAll('.regular-message.user');
            var targetElement;
            
            if (userMessages.length > 0) {
                // ユーザーメッセージがある場合は最後のユーザーメッセージを取得
                targetElement = userMessages[userMessages.length - 1];
            } else {
                // ユーザーメッセージがない場合は最初のボットのメッセージを取得
                var botMessages = document.querySelectorAll('.regular-message.bot');
                targetElement = botMessages[0];
            }
            
            if (targetElement) {
                // 要素の上端の位置を取得してスクロールする
                var topPosition = targetElement.offsetTop - targetElement.offsetHeight;
                chatContainer.scrollTop = topPosition;
            }
        }, 100);
    }
});

// Cognigyウェブチャットの初期化を待つ関数
function initChatHeightAdjustment() {
  // Cognigyウェブチャットの要素を取得
  const chatbotContainer = document.querySelector('[data-cognigy-webchat-root]');
  const chatInput = document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat].webchat .webchat-input');
  
  // 要素が見つからない場合は、再試行する
  if (!chatbotContainer || !chatInput) {
    console.log('Cognigy要素がまだ読み込まれていません。再試行します...');
    setTimeout(initChatHeightAdjustment, 500); // 500ミリ秒後に再試行
    return;
  }
  
  console.log('Cognigy要素が見つかりました。リスナーを設定します。');
  
  // 初期の高さを保存
  let originalHeight = window.innerHeight;
  chatbotContainer.style.height = `${originalHeight}px`;

  // 入力欄がアクティブになったとき
  chatInput.addEventListener('focus', () => {
    // 少し遅延させて、キーボードが表示された後の高さを取得
    setTimeout(() => {
      // visualViewport APIが利用可能であれば使用（より正確）
      if (window.visualViewport) {
        chatbotContainer.style.height = `${window.visualViewport.height}px`;
          console.log('Cognigy 入力欄がアクティブになり高さがvisualViewportに調整されました');
      } else {
        // フォールバックとしてinnerHeightを使用
        chatbotContainer.style.height = `${window.innerHeight}px`;
        console.log('Cognigy 入力欄がアクティブになり高さがフォールバックに調整されました');
      }
    }, 300); // キーボード表示のアニメーションが完了するのを待つ
    console.log('Cognigy 入力欄がアクティブになり高さが調整されました');
  });

  // 入力欄が非アクティブになったとき
  chatInput.addEventListener('blur', () => {
    // 元の高さに戻す
    setTimeout(() => {
      chatbotContainer.style.height = `${originalHeight}px`;
    }, 100); // 少し遅延させて、UIの更新タイミングを調整
  });

  // 画面サイズが変わったとき（向きの変更など）
  window.addEventListener('resize', () => {
    // アクティブ要素がチャット入力欄でない場合のみ基準値を更新
    if (document.activeElement !== chatInput) {
      originalHeight = window.innerHeight;
      chatbotContainer.style.height = `${originalHeight}px`;
    }
  });

  // visualViewport APIが使える場合は、より精密な調整が可能
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      // 入力欄がアクティブな場合のみ高さを調整
      if (document.activeElement === chatInput) {
        chatbotContainer.style.height = `${window.visualViewport.height}px`;
      }
    });
  }
  
  console.log('Cognigy チャットボット高さ調整スクリプトが初期化されました');
}

// MutationObserverを使用して動的に追加される要素を検知
function watchForChatElements() {
  const observer = new MutationObserver((mutations) => {
    if (document.querySelector('[data-cognigy-webchat-root]')) {
      observer.disconnect(); // 要素が見つかったら監視を停止
      initChatHeightAdjustment(); // 初期化処理を実行
    }
  });
  
  // DOM全体の変更を監視
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// DOMコンテンツロード時に初期化処理を開始
document.addEventListener('DOMContentLoaded', () => {
  // すでに要素が存在しているか確認
  if (document.querySelector('[data-cognigy-webchat-root]')) {
    initChatHeightAdjustment();
  } else {
    // 存在していない場合はMutationObserverで監視
    watchForChatElements();
  }
});

// すでにDOMコンテンツが読み込まれている場合の対応
if (document.readyState === 'loading') {
  // まだ読み込み中
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-cognigy-webchat-root]')) {
      initChatHeightAdjustment();
    } else {
      watchForChatElements();
    }
  });
} else {
  // すでに読み込み完了
  if (document.querySelector('[data-cognigy-webchat-root]')) {
    initChatHeightAdjustment();
  } else {
    watchForChatElements();
  }
}
