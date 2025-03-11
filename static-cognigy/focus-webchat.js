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

// ビューポートの高さを動的に管理するクラス（改良版）
class ViewportHeightManager {
  constructor(targetSelector) {
    this.targetSelector = targetSelector;
    this.initialViewportHeight = window.innerHeight;
    this.currentKeyboardHeight = 0;
    this.isKeyboardVisible = false;
    this.lastViewportHeight = window.innerHeight;
    this.scrollTimeoutId = null;
    
    // コンテナ参照の取得
    this.targetElements = [];
    this.resizeObserver = null;
    
    // イベントリスナーの初期化
    this.initElements();
    this.initListeners();
    
    // 初期状態で一度実行
    this.updateHeight();
  }
  
  initElements() {
    // 対象要素の取得
    this.targetElements = Array.from(document.querySelectorAll(this.targetSelector));
    
    // 対象要素がなければ再試行
    if (this.targetElements.length === 0) {
      setTimeout(() => this.initElements(), 100);
      return;
    }
    
    // ResizeObserverの設定
    this.setupResizeObserver();
  }
  
  setupResizeObserver() {
    // 要素のサイズ変化を監視
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(entries => {
        this.updateHeight();
      });
      
      this.targetElements.forEach(element => {
        this.resizeObserver.observe(element);
      });
    }
  }
  
  initListeners() {
    // visualViewport APIを使用（モダンブラウザ）
    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', this.handleViewportResize.bind(this));
      window.visualViewport.addEventListener('scroll', this.handleViewportScroll.bind(this));
    } 
    // フォールバック（旧ブラウザ）
    else {
      window.addEventListener('resize', this.handleWindowResize.bind(this));
    }
    
    // 向き変更の検出
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
    
    // フォーカスイベントの監視（より確実にキーボードを検出）
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
  }
  
  handleViewportResize() {
    // デバウンス処理（頻繁なリサイズイベントを制限）
    clearTimeout(this.resizeTimeoutId);
    this.resizeTimeoutId = setTimeout(() => {
      this.detectKeyboardHeight();
      this.updateHeight();
    }, 50);
  }
  
  handleViewportScroll() {
    // デバウンス処理（スクロールイベントを制限）
    clearTimeout(this.scrollTimeoutId);
    this.scrollTimeoutId = setTimeout(() => {
      // キーボードが表示されている場合は特別処理
      if (this.isKeyboardVisible) {
        this.fixScrollWithKeyboard();
      }
      this.updateHeight();
    }, 50);
  }
  
  handleWindowResize() {
    clearTimeout(this.resizeTimeoutId);
    this.resizeTimeoutId = setTimeout(() => {
      this.detectKeyboardHeightFallback();
      this.updateHeight();
    }, 50);
  }
  
  handleOrientationChange() {
    // 向き変更後に遅延処理
    setTimeout(() => {
      this.initialViewportHeight = window.innerHeight;
      this.detectKeyboardHeight();
      this.updateHeight();
      
      // 追加のリフレッシュ（デバイスによって遅延が異なる場合）
      setTimeout(() => this.updateHeight(), 500);
    }, 300);
  }
  
  handleFocusIn(e) {
    // 入力要素にフォーカスが当たった場合
    if (this.isInputElement(e.target)) {
      setTimeout(() => {
        this.detectKeyboardHeight();
        this.isKeyboardVisible = true;
        this.updateHeight();
      }, 300); // キーボード表示を待つための遅延
    }
  }
  
  handleFocusOut(e) {
    // 入力要素からフォーカスが外れた場合
    if (this.isInputElement(e.target)) {
      setTimeout(() => {
        this.isKeyboardVisible = false;
        this.currentKeyboardHeight = 0;
        this.updateHeight();
      }, 100);
    }
  }
  
  isInputElement(el) {
    const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT'];
    return inputTypes.includes(el.tagName) || el.isContentEditable;
  }
  
  detectKeyboardHeight() {
    if ('visualViewport' in window) {
      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      
      // visualViewportの高さとwindow.innerHeightの差が大きい場合はキーボード
      const heightDiff = windowHeight - viewportHeight;
      
      if (heightDiff > 150) { // キーボード検出の閾値（デバイスによって調整）
        this.currentKeyboardHeight = heightDiff;
        this.isKeyboardVisible = true;
      } else if (this.isKeyboardVisible && heightDiff < 50) {
        // キーボードが非表示になった場合
        this.currentKeyboardHeight = 0;
        this.isKeyboardVisible = false;
      }
      
      this.lastViewportHeight = viewportHeight;
    }
  }
  
  detectKeyboardHeightFallback() {
    const currentHeight = window.innerHeight;
    
    // 初期高さより著しく小さい場合はキーボードが表示されている可能性
    if (currentHeight < this.initialViewportHeight - 150) {
      this.currentKeyboardHeight = this.initialViewportHeight - currentHeight;
      this.isKeyboardVisible = true;
    } else {
      this.currentKeyboardHeight = 0;
      this.isKeyboardVisible = false;
    }
  }
  
  // キーボード表示時のスクロール問題を修正
  fixScrollWithKeyboard() {
    if (!this.isKeyboardVisible || this.targetElements.length === 0) return;
    
    const lastElement = this.targetElements[0];
    const chatContainer = lastElement.querySelector('.webchat-chat-history') || 
                          lastElement.querySelector('.chat-container') ||
                          lastElement;
                          
    const inputContainer = lastElement.querySelector('.webchat-input-container') ||
                          lastElement.querySelector('.input-container') ||
                          lastElement.querySelector('input, textarea');
    
    if (inputContainer && chatContainer) {
      // スクロールを最下部に固定
      chatContainer.scrollTop = chatContainer.scrollHeight;
      
      // 入力欄の位置調整
      if (window.visualViewport) {
        const offsetFromBottom = window.innerHeight - 
                               (inputContainer.getBoundingClientRect().bottom + window.visualViewport.offsetTop);
                               
        if (offsetFromBottom < this.currentKeyboardHeight) {
          // キーボードと入力欄の間に隙間がある場合は調整
          inputContainer.style.bottom = `${this.currentKeyboardHeight}px`;
        }
      }
    }
  }
  
  updateHeight() {
    if (!this.targetElements.length) return;
    
    let availableHeight;
    
    // visualViewport APIがある場合はそれを使用
    if ('visualViewport' in window) {
      availableHeight = window.visualViewport.height;
      
      // iOS Safariでのスクロール時の挙動修正
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS && this.isKeyboardVisible) {
        // iOSでのキーボード表示時は特別な処理
        availableHeight = window.visualViewport.height;
      }
    } else {
      // フォールバック計算
      availableHeight = window.innerHeight - this.currentKeyboardHeight;
    }
    
    // マイナス値防止
    availableHeight = Math.max(availableHeight, 200); // 最低高さ200px
    
    // CSSカスタムプロパティを設定
    document.documentElement.style.setProperty('--available-viewport-height', `${availableHeight}px`);
    
    // 対象の要素に適用
    this.targetElements.forEach(element => {
      // 高さを設定
      element.style.height = `${availableHeight}px`;
      
      // スクロール位置の修正（キーボード表示時）
      if (this.isKeyboardVisible) {
        const chatContainer = element.querySelector('.webchat-chat-history') || 
                              element.querySelector('.chat-container');
        if (chatContainer) {
          // 自動スクロールを適用
          setTimeout(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }, 50);
        }
      }
    });
    
    // キーボード表示中の固定位置要素調整
    if (this.isKeyboardVisible) {
      this.adjustFixedElements();
    } else {
      this.resetFixedElements();
    }
    
    // デバッグ用
    console.log(`利用可能な高さ: ${availableHeight}px (キーボード表示: ${this.isKeyboardVisible}, キーボード高さ: ${this.currentKeyboardHeight}px)`);
  }
  
  // 固定位置要素の調整（キーボード表示時）
  adjustFixedElements() {
    const fixedInputs = document.querySelectorAll('.webchat-input-container, .input-container');
    fixedInputs.forEach(el => {
      if (window.getComputedStyle(el).position === 'fixed') {
        el.style.position = 'absolute';
        el.style.bottom = `${this.currentKeyboardHeight}px`;
      }
    });
  }
  
  // 固定位置要素のリセット
  resetFixedElements() {
    const fixedInputs = document.querySelectorAll('.webchat-input-container, .input-container');
    fixedInputs.forEach(el => {
      if (el.style.position === 'absolute') {
        el.style.position = '';
        el.style.bottom = '';
      }
    });
  }
}

// WebChatが読み込まれたタイミングでインスタンスを作成
document.addEventListener('DOMContentLoaded', () => {
  // DOMが完全に読み込まれるのを待つ
  setTimeout(() => {
    const webchatManager = new ViewportHeightManager('[data-cognigy-webchat]');
  }, 300);
});
