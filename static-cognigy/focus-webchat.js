// グローバル変数の宣言
let chatbotContainer;
let chatInput;
let keyboard;
let all;

all = window.innerHeight;

webchat.registerAnalyticsService(event => {
    
    // 初期化処理（最初の1回だけ実行するもの）
    if (!chatbotContainer) {
        
        // DOMContentLoaded に相当する処理をここで行う
        window.setTimeout(() => {
            chatbotContainer = document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat]');

            // 見えるところだけに絞る？→OK
            keyboard = window.visualViewport.height
            chatbotContainer.style.height = `${keyboard}px`;
            
            
            // イベントリスナーの設定（1回だけ行う）
            setupEventListeners(all, keyboard);

        }, 1000); // 1秒待ってから実行
    }

    // メッセージを受信したときの処理
    if (event.type === "webchat/incoming-message") {
        setTimeout(() => {

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
function setupEventListeners(all, keyboard) {
    
    // 以下の二つのイベントリスナーをdocumentレベルで設定
    document.addEventListener('focusin', function(e) {
        setTimeout(() => {
            document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat]').style.height = `${keyboard}px`;
        }, 1000);
    });
    
    document.addEventListener('focusout', function(e) {
        setTimeout(() => {
            document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat]').style.height = `${all}px`;
        }, 1000);
    });

}
