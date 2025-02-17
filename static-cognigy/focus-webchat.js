webchat.registerAnalyticsService(event => {

    // メッセージを受信したときは、最後のユーザーのメッセージが一番上に来るようにする
    if (event.type === "webchat/incoming-message") {
        setTimeout(() => {
            var chatContainer = document.querySelector('.webchat-chat-history');
            var elements = document.querySelectorAll('.regular-message.user');
            var lastElement = elements[elements.length-1];
            
            if (lastElement) {
                var topPosition = lastElement.offsetTop - lastElement.offsetHeight; // 最後のメッセージの上端の位置を取得
                chatContainer.scrollTop = topPosition;
            }
        }, 5);
    }

    // メッセージを送信したときは、最後のユーザーのメッセージが一番下に来るようにする
    if (event.type === "webchat/outgoing-message") {
        setTimeout(() => {
            var chatContainer = document.querySelector('.webchat-chat-history');
            var elements = document.querySelectorAll('.regular-message.user');
            var lastElement = elements[elements.length-1];
            
            if (lastElement) {
                var bottomPosition = lastElement.offsetTop + lastElement.offsetHeight - lastElement.offsetHeight; // 最後のメッセージの下端の位置を取得
                var offset = chatContainer.offsetHeight;
                chatContainer.scrollTop = bottomPosition - offset;
            }
        }, 5);
    }

});