webchat.registerAnalyticsService(event => {
    // チャット履歴のスクロール可能なコンテナ
    const chatContainer = document.querySelector('.webchat-chat-history');

    // 受信メッセージ時の処理
    if (event.type === "webchat/incoming-message") {
        setTimeout(() => {
            // 最後に投稿されたユーザーのメッセージ要素を取得
            const userMessages = document.querySelectorAll('.regular-message.user');
            const lastUserMessage = userMessages[userMessages.length - 1];
            
            if (lastUserMessage && chatContainer) {
                /**
                 * 「一番上」は可視領域の最上部なので、
                 * chatContainer.scrollTop に "lastUserMessage の先頭部分" が来るように設定。
                 * 
                 * offsetTop は「(親要素から)ユーザー要素の先頭までの距離」。
                 * chatContainer.scrollTop を lastUserMessage.offsetTop にすることで、
                 * ユーザー要素の先頭がコンテナの可視領域の上端に来る。
                 */
                chatContainer.scrollTop = lastUserMessage.offsetTop;
            }
        }, 50); // 遅延を入れて描画完了を待つ
    }

    // 送信メッセージ時の処理
    if (event.type === "webchat/outgoing-message") {
        setTimeout(() => {
            // 最後に投稿されたユーザーのメッセージ要素を取得
            const userMessages = document.querySelectorAll('.regular-message.user');
            const lastUserMessage = userMessages[userMessages.length - 1];
            
            if (lastUserMessage && chatContainer) {
                /**
                 * 「一番下」は可視領域の最下部なので、
                 * （lastUserMessage の末端）が (chatContainer.scrollTop + 可視領域の高さ) に来るように。
                 * 
                 * → chatContainer.scrollTop = lastUserMessage.offsetTop + lastUserMessage.offsetHeight - chatContainer.clientHeight
                 * 
                 * ここで clientHeight は「スクロールバー除く、コンテナの可視領域の高さ」。
                 */
                chatContainer.scrollTop =
                    lastUserMessage.offsetTop + lastUserMessage.offsetHeight - chatContainer.clientHeight - 50;
            }
        }, 50);
    }
});
