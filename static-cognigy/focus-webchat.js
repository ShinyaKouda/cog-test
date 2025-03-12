webchat.registerAnalyticsService(event => {

    // メッセージを受信したときは、ユーザーのメッセージがある場合は最後のユーザーのメッセージが一番上に、
    // 無い場合は最初のボットのメッセージが一番上に来るようにする
    if (event.type === "webchat/incoming-message") {
        setTimeout(() => {

            let chatbotContainer = document.querySelector('[data-cognigy-webchat-root]');
            let chatInput = document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat].webchat .webchat-input');
            console.log(chatInput);

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
    
    // 入力欄がアクティブになったとき
    chatInput.addEventListener('focus', () => {


        // 初期の高さを保存
        let originalHeight = window.innerHeight;
        chatbotContainer.style.height = `${originalHeight}px`;

        // 少し遅延させて、キーボードが表示された後の高さを取得
        console.log('Cognigy 入力欄がアクティブになりました！！！');
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
});






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



// デバッグパネルを作成する関数
function createDebugPanel() {
    // パネル要素の作成
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';

    // スタイルの設定
    debugPanel.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: 40vh;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    font-family: monospace;
    font-size: 12px;
    padding: 10px;
    overflow-y: auto;
    z-index: 10000;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.5);
  `;

    // ボディに追加
    document.body.appendChild(debugPanel);

    // 元のconsole.logメソッドを保存
    const originalLog = console.log;

    // console.logをオーバーライド
    console.log = function () {
        // 元のconsole.logを呼び出し
        originalLog.apply(console, arguments);

        // 引数を文字列化
        const message = Array.from(arguments).map(arg => {
            if (typeof arg === 'object' && arg !== null) {
                return JSON.stringify(arg);
            }
            return String(arg);
        }).join(' ');

        // メッセージをパネルに追加
        const logLine = document.createElement('div');
        logLine.style.borderBottom = '1px solid #444';
        logLine.style.padding = '4px 0';
        logLine.textContent = message;

        // タイムスタンプを追加（オプション）
        const timestamp = new Date().toTimeString().split(' ')[0];
        logLine.textContent = `[${timestamp}] ${message}`;

        // パネルに追加
        debugPanel.appendChild(logLine);

        // 自動スクロール
        debugPanel.scrollTop = debugPanel.scrollHeight;
    };

    // エラーもキャプチャする（オプション）
    window.onerror = function (message, source, lineno, colno, error) {
        console.log(`ERROR: ${message} at ${source}:${lineno}:${colno}`);
        return false; // デフォルトのエラー処理も実行
    };

    // クリアボタンを追加
    const clearButton = document.createElement('button');
    clearButton.textContent = 'クリア';
    clearButton.style.cssText = `
    position: fixed;
    bottom: 40vh;
    right: 10px;
    padding: 5px 10px;
    background: #d9534f;
    color: white;
    border: none;
    border-radius: 3px;
    z-index: 10001;
  `;
    clearButton.onclick = function () {
        debugPanel.innerHTML = '';
    };
    document.body.appendChild(clearButton);

    // パネルの表示/非表示切り替えボタン
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '非表示';
    toggleButton.style.cssText = `
    position: fixed;
    bottom: 40vh;
    right: 70px;
    padding: 5px 10px;
    background: #5bc0de;
    color: white;
    border: none;
    border-radius: 3px;
    z-index: 10001;
  `;

    let isPanelVisible = true;
    toggleButton.onclick = function () {
        if (isPanelVisible) {
            debugPanel.style.display = 'none';
            toggleButton.textContent = '表示';
        } else {
            debugPanel.style.display = 'block';
            toggleButton.textContent = '非表示';
        }
        isPanelVisible = !isPanelVisible;
    };
    document.body.appendChild(toggleButton);

    return debugPanel;
}

// ページ読み込み完了時にデバッグパネルを作成
document.addEventListener('DOMContentLoaded', function () {
    createDebugPanel();
    console.log('デバッグパネルが初期化されました');
});
