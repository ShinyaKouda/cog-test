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

// ビューポートとキーボード表示を管理する改良版クラス
class ViewportHeightManager {
  constructor(targetSelector) {
    // 設定値と初期化
    this.targetSelector = targetSelector;
    this.rootSelector = '[data-cognigy-webchat-root]';
    this.chatHistorySelector = '.webchat-chat-history';
    this.inputContainerSelector = '.webchat-input-container';
    
    // 状態変数
    this.initialViewportHeight = window.innerHeight;
    this.isKeyboardVisible = false;
    this.currentKeyboardHeight = 0;
    this.previousScrollTop = 0;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.isAndroid = /Android/.test(navigator.userAgent);
    
    // 要素参照
    this.rootElement = document.querySelector(this.rootSelector);
    this.targetElement = document.querySelector(this.targetSelector);
    this.chatHistoryElement = null;
    this.inputContainerElement = null;
    
    // すべての要素が存在することを確認
    if (!this.rootElement || !this.targetElement) {
      console.warn('要素が見つかりません。DOMの読み込み完了後に再試行します。');
      setTimeout(() => this.init(), 500);
      return;
    }
    
    this.init();
  }
  
  init() {
    // 要素参照を更新
    this.rootElement = document.querySelector(this.rootSelector);
    this.targetElement = document.querySelector(this.targetSelector);
    
    if (!this.rootElement || !this.targetElement) {
      console.warn('要素が見つかりません。');
      return;
    }
    
    this.chatHistoryElement = this.targetElement.querySelector(this.chatHistorySelector);
    this.inputContainerElement = this.targetElement.querySelector(this.inputContainerSelector);
    
    if (!this.chatHistoryElement || !this.inputContainerElement) {
      console.warn('チャット履歴または入力欄が見つかりません。');
      return;
    }
    
    // イベントリスナーを設定
    this.setupEventListeners();
    
    // 初期状態で一度計算
    this.updateHeight();
    
    console.log('ViewportHeightManager 初期化完了', {
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      initialHeight: this.initialViewportHeight
    });
  }
  
  setupEventListeners() {
    // フォーカスイベントでキーボード状態を検出
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
    
    // visualViewport APIがある場合はそれを使用
    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', this.handleViewportResize.bind(this));
      window.visualViewport.addEventListener('scroll', this.handleViewportScroll.bind(this));
    } else {
      // フォールバック
      window.addEventListener('resize', this.handleWindowResize.bind(this));
    }
    
    // スクロールイベント
    if (this.chatHistoryElement) {
      this.chatHistoryElement.addEventListener('scroll', this.handleChatScroll.bind(this));
    }
    
    // 向き変更イベント
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
    
    // タッチイベント（特にiOS用）
    if (this.isIOS) {
      document.addEventListener('touchstart', this.handleTouchStart.bind(this));
      document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
  }
  
  handleFocusIn(e) {
    // 入力要素にフォーカスした場合
    if (this.isInputElement(e.target)) {
      setTimeout(() => {
        this.isKeyboardVisible = true;
        this.detectKeyboardHeight();
        this.applyKeyboardVisibleState();
        this.scrollToBottom();
      }, this.isIOS ? 300 : 100);
    }
  }
  
  handleFocusOut(e) {
    // 入力要素からフォーカスが外れた場合
    if (this.isInputElement(e.target)) {
      // 少し遅延してキーボードが完全に閉じるのを待つ
      setTimeout(() => {
        this.isKeyboardVisible = false;
        this.currentKeyboardHeight = 0;
        this.applyKeyboardVisibleState(false);
        this.updateHeight();
      }, 100);
    }
  }
  
  handleViewportResize() {
    // visualViewportのリサイズイベント
    this.detectKeyboardHeight();
    this.updateHeight();
    
    if (this.isKeyboardVisible) {
      this.scrollToBottom();
    }
  }
  
  handleViewportScroll() {
    // visualViewportのスクロールイベント（主にiOS用）
    if (this.isKeyboardVisible && this.isIOS) {
      this.scrollToBottom();
    }
  }
  
  handleWindowResize() {
    // 通常のリサイズイベント（キーボード表示/非表示を検出）
    const currentHeight = window.innerHeight;
    
    if (currentHeight < this.initialViewportHeight - 150) {
      // キーボードが表示された可能性
      this.isKeyboardVisible = true;
      this.currentKeyboardHeight = this.initialViewportHeight - currentHeight;
    } else if (currentHeight >= this.initialViewportHeight - 50) {
      // キーボードが非表示になった可能性
      this.isKeyboardVisible = false;
      this.currentKeyboardHeight = 0;
    }
    
    this.applyKeyboardVisibleState();
    this.updateHeight();
  }
  
  handleChatScroll() {
    // チャット履歴のスクロールイベント
    if (this.chatHistoryElement) {
      this.previousScrollTop = this.chatHistoryElement.scrollTop;
    }
  }
  
  handleOrientationChange() {
    // 向き変更イベント
    setTimeout(() => {
      this.initialViewportHeight = window.innerHeight;
      this.isKeyboardVisible = false;
      this.currentKeyboardHeight = 0;
      this.applyKeyboardVisibleState(false);
      this.updateHeight();
      
      // 向き変更後にスクロール位置をリセット
      this.scrollToBottom();
      
      // さらに遅延してもう一度更新（デバイスによって必要）
      setTimeout(() => {
        this.updateHeight();
        this.scrollToBottom();
      }, 500);
    }, 300);
  }
  
  handleTouchStart() {
    // タッチ開始（主にiOS用）
    if (this.chatHistoryElement) {
      this.previousScrollTop = this.chatHistoryElement.scrollTop;
    }
  }
  
  handleTouchEnd() {
    // タッチ終了（主にiOS用）
    if (this.isKeyboardVisible && this.isIOS) {
      // キーボード表示中にタッチ操作があった場合、スクロール位置を調整
      setTimeout(() => this.scrollToBottom(false), 300);
    }
  }
  
  isInputElement(el) {
    // 入力要素かどうかを判定
    const inputTags = ['INPUT', 'TEXTAREA', 'SELECT'];
    return inputTags.includes(el.tagName) || el.isContentEditable;
  }
  
  detectKeyboardHeight() {
    // キーボードの高さを検出
    if ('visualViewport' in window) {
      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      
      // キーボードの高さを計算（視覚的ビューポートとウィンドウの差）
      const heightDiff = windowHeight - viewportHeight;
      
      if (heightDiff > 100) {
        // 100px以上の差があればキーボードが表示されていると判断
        this.currentKeyboardHeight = heightDiff;
        this.isKeyboardVisible = true;
      } else if (heightDiff < 50 && this.isKeyboardVisible) {
        // 差が小さくなったらキーボードが非表示になったと判断
        this.currentKeyboardHeight = 0;
        this.isKeyboardVisible = false;
      }
    } else {
      // フォールバック: 現在のウィンドウの高さと初期高さを比較
      const currentHeight = window.innerHeight;
      if (currentHeight < this.initialViewportHeight - 150) {
        this.currentKeyboardHeight = this.initialViewportHeight - currentHeight;
        this.isKeyboardVisible = true;
      }
    }
  }
  
  applyKeyboardVisibleState(isVisible = this.isKeyboardVisible) {
    // キーボード表示状態をDOMに反映
    if (this.rootElement) {
      if (isVisible) {
        this.rootElement.classList.add('keyboard-visible');
      } else {
        this.rootElement.classList.remove('keyboard-visible');
      }
    }
  }
  
  updateHeight() {
    // 利用可能な高さを計算して適用
    let availableHeight;
    
    if (this.isKeyboardVisible) {
      if ('visualViewport' in window) {
        // visualViewport APIがある場合
        availableHeight = window.visualViewport.height;
        
        // iOSの場合は特別な計算が必要
        if (this.isIOS) {
          // 入力コンテナに視覚的な調整を適用
          if (this.inputContainerElement) {
            this.inputContainerElement.style.paddingBottom = 
              `${Math.max(8, window.visualViewport.offsetTop)}px`;
          }
        }
      } else {
        // フォールバック
        availableHeight = window.innerHeight - this.currentKeyboardHeight;
      }
    } else {
      // キーボードが非表示の場合
      availableHeight = this.initialViewportHeight;
      
      // 入力コンテナのパディングをリセット
      if (this.inputContainerElement) {
        this.inputContainerElement.style.paddingBottom = '8px';
      }
    }
    
    // 最小値を確保
    availableHeight = Math.max(availableHeight, 300);
    
    // CSSカスタムプロパティを設定
    document.documentElement.style.setProperty('--available-viewport-height', `${availableHeight}px`);
    
    // ログ出力
    console.log(`高さ更新: ${availableHeight}px (キーボード: ${this.isKeyboardVisible ? 'あり' : 'なし'}, 高さ: ${this.currentKeyboardHeight}px)`);
  }
  
  scrollToBottom(instant = true) {
    // チャット履歴を最下部にスクロール
    if (this.chatHistoryElement) {
      const scrollOptions = {
        behavior: instant ? 'auto' : 'smooth'
      };
      
      this.chatHistoryElement.scrollTop = this.chatHistoryElement.scrollHeight;
      
      // 一部のブラウザではもう一度遅延実行が必要
      setTimeout(() => {
        this.chatHistoryElement.scrollTop = this.chatHistoryElement.scrollHeight;
      }, 50);
    }
  }
}

// DOMの読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
  // 初期化を少し遅延（DOMが完全に構築されるのを待つ）
  setTimeout(() => {
    const manager = new ViewportHeightManager('[data-cognigy-webchat]');
  }, 500);
});
