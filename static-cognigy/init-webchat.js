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
}