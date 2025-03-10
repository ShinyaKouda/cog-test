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

// ビューポートの高さを動的に管理するクラス
class ViewportHeightManager {
  constructor(targetSelector) {
    this.targetSelector = targetSelector;
    this.initialViewportHeight = window.innerHeight;
    this.currentKeyboardHeight = 0;
    this.currentAddressBarHeight = 0;
    this.lastViewportHeight = window.innerHeight;
    
    // イベントリスナーの初期化
    this.initListeners();
    
    // 初期状態で一度実行
    this.updateHeight();
  }
  
  initListeners() {
    // リサイズイベントの監視（キーボードの表示/非表示）
    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', () => {
        this.detectKeyboardHeight();
        this.updateHeight();
      });
    } else {
      // visualViewport APIがない場合のフォールバック
      window.addEventListener('resize', () => {
        this.detectKeyboardHeightFallback();
        this.updateHeight();
      });
    }
    
    // スクロールイベントの監視（アドレスバーの表示/非表示）
    window.addEventListener('scroll', () => {
      this.detectAddressBarHeight();
      this.updateHeight();
    });
    
    // 向き変更の検出
    window.addEventListener('orientationchange', () => {
      // 向き変更後に少し遅延を入れて処理
      setTimeout(() => {
        this.initialViewportHeight = window.innerHeight;
        this.detectAddressBarHeight();
        this.detectKeyboardHeight();
        this.updateHeight();
      }, 300);
    });
  }
  
  // 最新のvisualViewport APIを使用したキーボード高さの検出
  detectKeyboardHeight() {
    if ('visualViewport' in window) {
      const viewportHeight = window.visualViewport.height;
      
      // 前回より小さくなったらキーボードが表示された可能性
      if (viewportHeight < this.lastViewportHeight && 
          this.lastViewportHeight - viewportHeight > 100) { // 誤検出を避けるため100px以上の変化で判定
        this.currentKeyboardHeight = this.lastViewportHeight - viewportHeight;
      } 
      // 前回より大きくなったらキーボードが非表示になった可能性
      else if (viewportHeight > this.lastViewportHeight && 
               viewportHeight - this.lastViewportHeight > 100) {
        this.currentKeyboardHeight = 0;
      }
      
      this.lastViewportHeight = viewportHeight;
    }
  }
  
  // visualViewport APIがない環境用のフォールバック
  detectKeyboardHeightFallback() {
    const currentHeight = window.innerHeight;
    
    // 初期高さより小さい場合はキーボードが表示されている可能性
    if (currentHeight < this.initialViewportHeight - 100) {
      this.currentKeyboardHeight = this.initialViewportHeight - currentHeight;
    } else {
      this.currentKeyboardHeight = 0;
    }
  }
  
  // アドレスバーの高さを検出
  detectAddressBarHeight() {
    // スクロール後とスクロール前の高さを比較
    const currentHeight = window.innerHeight;
    
    if (currentHeight > this.initialViewportHeight) {
      // アドレスバーが隠れた場合
      this.currentAddressBarHeight = 0;
    } else if (currentHeight < this.initialViewportHeight && this.currentKeyboardHeight === 0) {
      // アドレスバーが表示されている場合（キーボードが表示されていないとき）
      this.currentAddressBarHeight = this.initialViewportHeight - currentHeight;
    }
  }
  
  // 実際の高さを更新
  updateHeight() {
    const availableHeight = this.initialViewportHeight - this.currentAddressBarHeight - this.currentKeyboardHeight;
    
    // CSSカスタムプロパティを設定
    document.documentElement.style.setProperty('--available-viewport-height', `${availableHeight}px`);
    
    // 対象の要素に直接適用する場合
    const targetElements = document.querySelectorAll(this.targetSelector);
    targetElements.forEach(element => {
      element.style.height = `${availableHeight}px`;
    });
    
    // デバッグ用
    console.log(`利用可能な高さ: ${availableHeight}px (アドレスバー: ${this.currentAddressBarHeight}px, キーボード: ${this.currentKeyboardHeight}px)`);
  }
}

// WebChatが読み込まれたタイミングでインスタンスを作成
document.addEventListener('DOMContentLoaded', () => {
  const webchatManager = new ViewportHeightManager('[data-cognigy-webchat]');
});
