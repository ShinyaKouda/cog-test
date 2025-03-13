// グローバル変数の宣言
let chatbotContainer;
let chatInput;
let originalHeight;

webchat.registerAnalyticsService(event => {
    
    console.log(`Analytics event detected: ${event.type}`);
    
    // 初期化処理（最初の1回だけ実行するもの）
    if (!chatbotContainer) {
        // デバッグパネルを作成
        //createDebugPanel();
        
        // DOMContentLoaded に相当する処理をここで行う
        window.setTimeout(() => {
            chatbotContainer = document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat]');
            
            if (chatbotContainer) {
                console.log("chatbotContainer を取得しました");
            } else {
                console.log("chatbotContainer の取得に失敗しました");
            }
            
            chatInput = document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat].webchat .webchat-input');
            
            if (chatInput) {
                console.log("chatInput を取得しました");
            } else {
                console.log("chatInput の取得に失敗しました");
                // もっと一般的なセレクタを試してみる
                chatInput = document.querySelector('input') || document.querySelector('textarea');
                if (chatInput) {
                    console.log("代替の入力要素を取得しました");
                }
            }
            
            originalHeight = window.innerHeight;
            console.log(`初期の高さ: ${originalHeight}px`);
            
            // ウィンドウサイズ変更イベント
            //window.addEventListener('resize', throttle(function() {
            //    console.log(`ウィンドウサイズ変更: ${window.innerWidth}x${window.innerHeight}`);
            //}, 500));
            
            // イベントリスナーの設定（1回だけ行う）
            setupEventListeners();

        }, 1000); // 1秒待ってから実行
    }

    // メッセージを受信したときの処理
    if (event.type === "webchat/incoming-message") {
        setTimeout(() => {

            chatbotContainer.style.height = `${window.visualViewport.height}px`;

            var chatContainer = document.querySelector('.webchat-chat-history');
            if (!chatContainer) {
                console.log("chatContainer が見つかりません");
                return;
            }
            
            var userMessages = document.querySelectorAll('.regular-message.user');
            var targetElement;

            if (userMessages.length > 0) {
                console.log(`ユーザーメッセージを ${userMessages.length} 件見つけました`);
                // ユーザーメッセージがある場合は最後のユーザーメッセージを取得
                targetElement = userMessages[userMessages.length - 1];
            } else {
                console.log("ユーザーメッセージが見つからないため、ボットメッセージを探します");
                // ユーザーメッセージがない場合は最初のボットのメッセージを取得
                var botMessages = document.querySelectorAll('.regular-message.bot');
                if (botMessages.length > 0) {
                    console.log(`ボットメッセージを ${botMessages.length} 件見つけました`);
                    targetElement = botMessages[0];
                }
            }

            if (targetElement) {
                console.log("スクロール位置を調整します");
                // 要素の上端の位置を取得してスクロールする
                var topPosition = targetElement.offsetTop - targetElement.offsetHeight;
                chatContainer.scrollTop = topPosition;
            } else {
                console.log("スクロール対象の要素が見つかりません");
            }
        }, 100);
    }
});

// イベントリスナーの設定を行う関数
function setupEventListeners() {
    
    if (!chatInput) {
        console.log("chatInput が未取得のためイベントリスナーは設定できません");
        return;
    }
    
    // 以下の二つのイベントリスナーをdocumentレベルで設定
    document.addEventListener('focusin', function(e) {
        chatbotContainer.style.height = `${window.visualViewport.height}px`;
    });
    
    document.addEventListener('focusout', function(e) {
        chatbotContainer.style.height = `${window.innerHeight}px`;
    });
}

// デバッグパネルを作成する関数
function createDebugPanel() {
    // すでに存在する場合は作成しない
    if (document.getElementById('debug-panel')) return;
    
    console.log("デバッグパネルを作成します");

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

    // テストボタンを追加
    const testButton = document.createElement('button');
    testButton.textContent = 'イベントテスト';
    testButton.style.cssText = `
    padding: 5px 10px;
    margin-right: 10px;
    background: #5cb85c;
    color: white;
    border: none;
    border-radius: 3px;
  `;
    testButton.onclick = function() {
        console.log("テストボタンがクリックされました");
        // 強制的にイベントを発火させてみる
        if (chatInput) {
            chatInput.focus();
            console.log("chatInput に強制フォーカスしました");
            setTimeout(() => {
                document.body.click();
                console.log("bodyをクリックしてフォーカスを外しました");
            }, 1000);
        } else {
            console.log("chatInput が取得できていないためテストできません");
        }
    };
    controlPanel.appendChild(testButton);

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
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return "[Object]";
                }
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

    // エラーもキャプチャする
    window.onerror = function (message, source, lineno, colno, error) {
        console.log(`ERROR: ${message} at ${source}:${lineno}:${colno}`);
        return false; // デフォルトのエラー処理も実行
    };

    // ボタンの機能を設定
    let isPanelVisible = true;
    toggleButton.onclick = function () {
        console.log("表示/非表示ボタンがクリックされました");
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
        console.log("クリアボタンがクリックされました");
        debugPanel.innerHTML = '';
    };

    console.log("デバッグパネルの作成が完了しました");
    return debugPanel;
}

// ヘルパー関数: イベント発火頻度を制限する throttle 関数
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}
