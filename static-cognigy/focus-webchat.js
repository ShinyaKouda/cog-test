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
        }, 1000);
    }
    
    function adjustHeightOnFocusOut(e) {
        setTimeout(() => {
            chatbotContainer.style.height = `${window.visualViewport.height}px`;//`100vh`;
        }, 1000);
    }
    
    // 初期状態でチェック
    handleMobileChange(mobileMediaQuery);
    
    // 画面サイズ変更時にもチェック
    mobileMediaQuery.addEventListener('change', handleMobileChange);
}
