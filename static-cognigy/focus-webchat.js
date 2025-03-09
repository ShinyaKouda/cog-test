webchat.registerAnalyticsService(event => {
    // メッセージを受信したときは、ユーザーのメッセージがある場合は最後のユーザーのメッセージが一番上に、
    // 無い場合は最初のボットのメッセージが一番上に来るようにする
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
                targetElement = botMessages[0];
            }
            
            if (targetElement) {
                // 要素の上端の位置を取得してスクロールする
                var topPosition = targetElement.offsetTop - targetElement.offsetHeight;
                chatContainer.scrollTop = topPosition;
            }
        }, 100);
    }
});

/*
function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
setVh();
*/

function adjustChatInput() {
  const chatInput = document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat].webchat .webchat-input');
  if (!chatInput) return;
  
  // visualViewport が対応している場合、オフセットを取得
  const offsetTop = window.visualViewport ? window.visualViewport.offsetTop : 0;
  // 例: キーボードが表示されると、offsetTop にキーボードの高さ分の値が入る場合があるため、それを bottom に反映
  chatInput.style.bottom = offsetTop + 'px';
}

window.visualViewport && window.visualViewport.addEventListener('resize', adjustChatInput);
window.addEventListener('resize', adjustChatInput); // 万が一 visualViewport が使えない場合にも対応
adjustChatInput();

