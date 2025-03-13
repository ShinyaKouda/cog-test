// グローバル変数の宣言
let chatbotContainer;
let chatInput;

webchat.registerAnalyticsService(event => {
    
    // 初期化処理（最初の1回だけ実行するもの）
    if (!chatbotContainer) {
        
        // DOMContentLoaded に相当する処理をここで行う
        window.setTimeout(() => {
            chatbotContainer = document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat]');

            // 見えるところだけに絞る
            chatbotContainer.style.height = `${window.visualViewport.height}px`
            
            // イベントリスナーの設定（1回だけ行う）
            setupEventListeners();

        }, 500); // 0.5秒待ってから実行
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
    
    // 以下の二つのイベントリスナーをdocumentレベルで設定
    document.addEventListener('focusin', function(e) {
        setTimeout(() => {
            chatbotContainer.style.height = `${window.visualViewport.height}px`;
        }, 500);
    });
    
    document.addEventListener('focusout', function(e) {
        setTimeout(() => {
            chatbotContainer.style.height = `500px`;
        }, 500);
    });

}
