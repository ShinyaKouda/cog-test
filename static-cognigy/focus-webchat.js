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

function setVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// 以下のイベントリスナーを追加
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', setVh);
window.addEventListener('scroll', setVh);

// キーボード表示時のイベントを検知（iOS向け）
document.addEventListener('focusin', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        setTimeout(setVh, 100); // 少し遅延させて高さを再計算
    }
});

document.addEventListener('focusout', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        setTimeout(setVh, 100); // 少し遅延させて高さを再計算
    }
});

// 初期化
setVh();
