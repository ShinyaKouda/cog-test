// グローバル変数の宣言
let chatbotContainer;
let chatInput;

webchat.registerAnalyticsService(event => {
    
    // 初期化処理（最初の1回だけ実行するもの）
    if (!chatbotContainer) {

        createDebugPanel();
        
        // DOMContentLoaded に相当する処理をここで行う
        window.setTimeout(() => {
            chatbotContainer = document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat]');

            // 見えるところだけに絞る
            chatbotContainer.style.height = `100px`
            console.log('初期高さ：100pxに変更')
            
            // イベントリスナーの設定（1回だけ行う）
            setupEventListeners();

        }, 1000); // 1秒待ってから実行
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
    // モバイル向けのメディアクエリ
    const mobileMediaQuery = window.matchMedia('(max-width: 768px)');
    
    // メディアクエリのリスナー関数
    function handleMobileChange(e) {
        if (e.matches) {
            // モバイルサイズの場合、イベントリスナーを追加
            document.addEventListener('focusin', adjustHeightOnFocusIn);
            document.addEventListener('focusout', adjustHeightOnFocusOut);
            console.log('モバイルのイベントリスナーを追加')
        } else {
            // モバイルサイズではない場合、イベントリスナーを削除
            document.removeEventListener('focusin', adjustHeightOnFocusIn);
            document.removeEventListener('focusout', adjustHeightOnFocusOut);
        }
    }
    
    // 関数を分離して、追加/削除を容易にする
    function adjustHeightOnFocusIn(e) {
        setTimeout(() => {
            chatbotContainer.style.height = `${window.visualViewport.height}px`;
            console.log('フォーカスイン：チャットの高さを${chatbotContainer.style.height}に変更')
        }, 1000);
    }
    
    function adjustHeightOnFocusOut(e) {
        setTimeout(() => {
            chatbotContainer.style.height = `${window.visualViewport.height}px`;//`100vh`;
            console.log('フォーカスアウト：チャットの高さを${chatbotContainer.style.height}に変更')
        }, 1000);
    }
    
    // 初期状態でチェック
    handleMobileChange(mobileMediaQuery);
    
    // 画面サイズ変更時にもチェック
    mobileMediaQuery.addEventListener('change', handleMobileChange);
};

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
    bottom: 265px;
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
    bottom: 300px;
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
