const CSApi = {
    server: 'http://kefu.ih5.cn/',  //客服地址
    socket: 'ws://116.62.25.93:8282', //socket地址
    auth: {
        login: 'api/auth/get-loginid',
        online: 'api/im/visitor-online',
    },
    message: {
        send: 'api/im/v-send-msg',
    },
    image: {
        upload: 'api/image/upload-image',
        display: 'api/image/show/',
        keyDisplay: 'api/image/show?key='
    },
    eval: 'api/user/eval-custom',
    record: 'api/message/visitor/get-chat-record?login_id=',
    polling: 'api/message/visitor/get-sys-msg?login_id=',
    project: {
        send: 'app/setSwitchUser',
        assist: {
            close: 'api/im/v-close-assist',
        }
    }
};

export {CSApi};