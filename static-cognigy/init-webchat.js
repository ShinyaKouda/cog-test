function initMyWebchat(url){
    // URLはCognigyチャットボットのエンドポイント
    initWebchat(url, {
        settings: {
            getStartedText: '',
            getStartedPayload: '　',
            startBehavior: 'injection',
            disablePersistentHistory: true,
            disableBranding: true,
            title: "チャットボットで質問する"
        }
    }).then(webchat => {
        window.webchat = webchat;
        // webchat.open();
    });
};

function updateChatHeight() {
    const chatContainer = document.querySelector('.data-cognigy-webchat');
    if (chatContainer) {
        chatContainer.style.height = `${window.innerHeight}px`;
    }
}

// 初期化時に実行
updateChatHeight();

// 画面サイズ変更時（アドレスバー縮小・キーボード表示時など）に高さを再計算
window.addEventListener("resize", updateChatHeight);
