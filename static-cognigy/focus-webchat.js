webchat.registerAnalyticsService(event => {

    // チャット履歴のコンテナを取得
    var chatContainer = document.querySelector('.webchat-chat-history');

    // メッセージを受信したとき
    if (event.type === "webchat/incoming-message") {
        setTimeout(() => {
            var elements = document.querySelectorAll('.regular-message.user');
            var lastElement = elements[elements.length - 1];

            if (lastElement) {
                lastElement.scrollIntoView({ behavior: "smooth", block: "end" });
            }
        }, 50); // 遅延を50msに増加
    }

    // メッセージを送信したとき
    if (event.type === "webchat/outgoing-message") {
        setTimeout(() => {
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }, 50); // 遅延を50msに増加
    }

});

// メッセージの追加を監視するための MutationObserver
document.addEventListener("DOMContentLoaded", () => {
    var chatContainer = document.querySelector('.webchat-chat-history');
    
    if (chatContainer) {
        const observer = new MutationObserver(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        });

        observer.observe(chatContainer, { childList: true, subtree: true });
    }
});
