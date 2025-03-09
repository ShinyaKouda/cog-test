// チャットボットが初期化された後に実行
document.addEventListener('DOMContentLoaded', function() {
  // 入力欄を取得
  const inputElement = document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat].webchat .webchat-input');
  
  // 入力欄が存在する場合は非表示に
  if (inputElement) {
    inputElement.style.display = 'none';
  }
  
  // webchatが初期化されるのを待つ
  const checkWebchatInterval = setInterval(() => {
    // グローバルなwebchatオブジェクトが存在するか確認
    if (window.webchat) {
      clearInterval(checkWebchatInterval);
      
      // 既存のコードに入力欄表示ロジックを追加
      webchat.registerAnalyticsService(event => {
        // メッセージを受信したとき - 既存の処理
        if (event.type === "webchat/incoming-message") {
          // 入力欄を表示する
          if (inputElement && inputElement.style.display === 'none') {
            inputElement.style.display = '';
          }
          
          // 既存のスクロール処理
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
        
        // ユーザーがメッセージを送信開始したとき
        if (event.type === "webchat/send-message" || event.type === "webchat/start-typing") {
          // 入力欄を表示する
          if (inputElement && inputElement.style.display === 'none') {
            inputElement.style.display = '';
          }
        }
      });
      
      // チャットエリア全体をクリックした時も入力欄を表示
      const chatArea = document.querySelector('[data-cognigy-webchat-root] [data-cognigy-webchat].webchat');
      if (chatArea) {
        chatArea.addEventListener('click', function() {
          if (inputElement && inputElement.style.display === 'none') {
            inputElement.style.display = '';
          }
        });
      }
    }
  }, 100);
});

function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
setVh();
