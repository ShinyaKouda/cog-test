function initMyWebchat(url){
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
        sessionId = "session-" + Date.now() * Math.random();
        localStorage.setItem("sessionId", sessionId);
    }
    // URLはCognigyチャットボットのエンドポイント
    initWebchat(url, {
        sessionId: sessionId,
        settings: {
            getStartedText: '',
            getStartedPayload: '　',
            startBehavior: 'injection',
            disablePersistentHistory: false,
            disableBranding: true,
            title: "チャットボットで質問する"
        }
    }).then(webchat => {
        window.webchat = webchat;
        //webchat.open();
    });
}