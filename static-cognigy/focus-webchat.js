// グローバル変数の宣言
let chatbotContainer;
let chatInput;
let originalHeight;

webchat.registerAnalyticsService(event => {
    // 初期化処理（最初の1回だけ実行するもの）
    if (!chatbotContainer) {
        chatbotContainer = document.querySelector('[data-cognigy-webchat-root]');
        chatInput = document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat].webchat .webchat-input');
        originalHeight = window.innerHeight;
        
        // イベントリスナーの設定（1回だけ行う）
        setupEventListeners();
        // デバッグパネルを作成
        createDebugPanel();
    }

    // メッセージを受信したときの処理
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
                if (botMessages.length > 0) {
                    targetElement = botMessages[0];
                }
            }

            if (targetElement) {
                // 要素の上端の位置を取得してスクロールする
                var topPosition = targetElement.offsetTop - targetElement.offsetHeight;
                chatContainer.scrollTop = topPosition;
            }
        }, 100);
    }
});

// イベントリスナーの設定を行う関数
function setupEventListeners() {
    if (!chatInput) return;

    // 入力欄がアクティブになったとき
    chatInput.addEventListener('focus', () => {
        // 初期の高さを保存
        originalHeight = window.innerHeight;
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
}

// デバッグパネルを作成する関数
function createDebugPanel() {
    // すでに存在する場合は作成しない
    if (document.getElementById('debug-panel')) return;

    // コントロールパネル（ボタン用のコンテナ）を作成
    const controlPanel = document.createElement('div');
    controlPanel.id = 'debug-control-panel';
    controlPanel.style.cssText = `
    position: fixed;
    bottom: 60px; /* チャット入力欄の上にくるように位置調整 */
    left: 0;
    width: 100%;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: flex-end;
    z-index: 10001;
  `;
    document.body.appendChild(controlPanel);

    // クリアボタンを追加
    const clearButton = document.createElement('button');
    clearButton.textContent = 'クリア';
    clearButton.style.cssText = `
    padding: 5px 10px;
    margin-right: 10px;
    background: #d9534f;
    color: white;
    border: none;
    border-radius: 3px;
  `;
    controlPanel.appendChild(clearButton);

    // パネルの表示/非表示切り替えボタン
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '非表示';
    toggleButton.style.cssText = `
    padding: 5px 10px;
    background: #5bc0de;
    color: white;
    border: none;
    border-radius: 3px;
  `;
    controlPanel.appendChild(toggleButton);

    // ログパネル要素の作成
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';

    // スタイルの設定 - コントロールパネルの上に配置
    debugPanel.style.cssText = `
    position: fixed;
    bottom: 95px; /* コントロールパネル+入力欄の高さ分の上に配置 */
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

    // ボタンの機能を設定
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

    clearButton.onclick = function () {
        debugPanel.innerHTML = '';
    };

    return debugPanel;
}
