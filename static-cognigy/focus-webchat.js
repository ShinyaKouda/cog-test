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

// Cognigyウェブチャットの要素を取得
const chatbotContainer = document.querySelector('[data-cognigy-webchat-root]');
const chatInput = document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat].webchat .webchat-input');

// 初期の高さを保存
let originalHeight = window.innerHeight;

// 入力欄がアクティブになったとき
chatInput.addEventListener('focus', () => {
  // 少し遅延させて、キーボードが表示された後の高さを取得
  setTimeout(() => {
    // visualViewport APIが利用可能であれば使用（より正確）
    if (window.visualViewport) {
      chatbotContainer.style.height = `${window.visualViewport.height}px`;
    } else {
      // フォールバックとしてinnerHeightを使用
      chatbotContainer.style.height = `${window.innerHeight}px`;
    }
  }, 300); // キーボード表示のアニメーションが完了するのを待つ
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

// DOMコンテンツロード時に初期化
document.addEventListener('DOMContentLoaded', () => {
  // 初期高さを設定
  originalHeight = window.innerHeight;
  chatbotContainer.style.height = `${originalHeight}px`;
  
  console.log('Cognigy チャットボット高さ調整スクリプトが初期化されました');
});
