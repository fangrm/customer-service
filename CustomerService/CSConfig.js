//消息类型
const CSMsgType = {   //msg_type
    system: 'system',
    text: 'text',
    image: 'image',
    emoji: 'emoji',
    link: 'link',
};

//系统消息类型
const CSSystemMsgType = {
    queue: 'queue', //排队信息
    conn: 'conn',   //接入消息
    notice: 'notice',   //公告消息
    group: 'group', //群发消息
    exception: 'exception', //异常小心
};

const CSImgSize = {
    origin: '',
    small: '100px',
    middle: '300px',
    large: '1000px',
};

//消息拥有者
const CSMsgOwnerType = {
    system: 'sys',  //系统de消息
    user: 'user',   //用户de消息
    staff: 'staff', //客服de消息
    nobody: 'nobody', //无人de信息
};

//链接状态
const CSConStatus= {
    noConnect: 1,   //未连接
    disconnect: 2,  //断开
    connecting: 3,  //连接
    connectSuccess: 4,  //连接成功
    connectFailed: 5,   //连接失败
    connectNotSupport: 6, //浏览器不支持socket
};

export {CSMsgType, CSSystemMsgType, CSMsgOwnerType, CSConStatus, CSImgSize};
