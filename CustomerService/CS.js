/**
 * Customer Service 客服组件
 */

import React from 'react';
import $class from 'classnames';

import CSStore from '../../stores/CSStore';
import CSAction from '../../actions/CSAction';

import CSHeader from './CSHeader';

import CSNoConnect from './CSContent/CSNoConnect';
import CSConnecting from './CSContent/CSConnecting';
import CSConnectNotSupport from './CSContent/CSConnectNotSupport';

import CSIM from './CSContent/CSIM';

import CSComment from './CSComment';

import {CSConStatus, CSSystemMsgType} from './CSConfig';

import {dragdrop} from '../PropertyView/MoudleMove';

class CS extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActivate: false,  //是否激活
            isShow: false,  //是否显示
            conStatus: CSConStatus.noConnect, //初始为未连接

            userInfo: {},  //用户信息  {login_id: loginId}
            staffInfo: {}, //客服信息  {c_user_id: staffId}

            messages: [],   //消息

            showComment: false, //显示comment

            isInEditMode: false, //是否在编辑模式
        };

        this.onCSChange = this.onCSChange.bind(this);

        this.onHide = this.onHide.bind(this); //隐藏
        this.onClose = this.onClose.bind(this); //关闭

        this.doConnect = this.doConnect.bind(this); //连接
        this.doDisconnect = this.doDisconnect.bind(this); //断连
        this.doReconnect = this.doReconnect.bind(this); //重连

        this.onShowComment = this.onShowComment.bind(this); //呼出评论框
        this.onSubmitComment = this.onSubmitComment.bind(this); //提交评论

        this.onCSPanelClick = this.onCSPanelClick.bind(this); //点击面板

        //移动面板
        this.onCSTitleDragStart = this.onCSTitleDragStart.bind(this);
        this.onCSTitleDragging = this.onCSTitleDragging.bind(this);
        this.onCSTitleDragEnd = this.onCSTitleDragEnd.bind(this);
        this.isDragging = false;    //是否移动中

        //获取通知的方法
        this.didShowCS = this.didShowCS.bind(this);   //显示隐藏
        this.didActivate = this.didActivate.bind(this); //激活，非激活
        this.didLogin = this.didLogin.bind(this); //登录
        this.didConnect = this.didConnect.bind(this); //连接
        this.didOnline = this.didOnline.bind(this); //上线
        this.didGetMessage = this.didGetMessage.bind(this);   //获取消息
        this.didUpload = this.didUpload.bind(this); //上传
        this.didGetRecord = this.didGetRecord.bind(this);   //历史记录
    }

    componentDidMount() {
        this.unsubscribe = CSStore.listen(this.onCSChange.bind(this));
        //绑定
        this.dragDrop = dragdrop(document.getElementById('CSPanelTitle'), document,
            this.onCSTitleDragStart, this.onCSTitleDragging, this.onCSTitleDragEnd);
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.dragDrop();
    }

    onCSChange(CS) {
        if(CS.show&&this.state.isShow!==CS.show.on) {
            this.didShowCS(CS.show);
        } else if(CS.activate&&this.state.isActivate!==CS.activate.on) {
            this.didActivate(CS.activate);
        } else if (CS.login) {
            this.didLogin(CS.login);
        } else if (CS.connect) {
            this.didConnect(CS.connect);
        } else if (CS.online) {
            this.didOnline(CS.online);
        } else if (CS.message) {
            this.didGetMessage(CS.message);
        } else if (CS.upload) {
            this.didUpload(CS.upload);
        } else if (CS.record) {
            this.didGetRecord(CS.record);
        } else if (CS.editMode) {
            this.didGetEditMode(CS.editMode);
        }
    }

    didShowCS(show) {
        //显示和消失
        this.setState({
            isShow: show.on,
        })
    }

    didActivate(activate) {
        //激活和去掉
        let messages = this.state.messages;
        if(!activate.on){
            messages = [];
        }
        this.setState({
            userInfo: {},
            clientInfo: {},
            messages: messages,
            isShow: activate.on,  //加载的同时会影响显示状态
            isActivate: activate.on,
            isInEditMode: false,
        },()=>{
            if(activate.on) {
                this.doConnect();
            } else {
                this.doDisconnect();
            }
        });
    }

    didLogin(login) {
        //登录
        if(login.success) {
            let userInfo = {loginId: login.loginId};//登录id
            this.setState({
                userInfo: userInfo
            })
        } else {
            this.setState({
                conStatus: CSConStatus.connectFailed
            })
        }
    }

    didConnect(connect) {
        //连接
        if(connect.success) {
            let userInfo = this.state.userInfo;
            userInfo.clientId = connect.clientId;//客户id
            this.setState({
                userInfo: userInfo
            })
        } else {
            this.setState({
                conStatus: CSConStatus.connectFailed
            })
        }
    }

    didOnline(online) {
        //尝试在线
        let conStatus = CSConStatus.connectFailed;
        if(online.success) {
            let userInfo = this.state.userInfo;
            userInfo.connectId = online.connectId;//连接id
            conStatus = CSConStatus.connectSuccess;
            this.setState({
                userInfo: userInfo
            }, ()=>{
                CSAction['userInfo'](this.state.userInfo);
            });
        }
        this.setState({
            conStatus: conStatus
        });
    }

    didGetMessage(msg) {
        if(msg.success) {
            //有新消息
            let message = msg.data;
            let messages = this.state.messages;
            let lastIndex = messages.length-1;
            if(messages.length>0 && message['sys_msg_type'] === CSSystemMsgType.queue
                && messages[lastIndex]['sys_msg_type'] === CSSystemMsgType.queue) {
                //排队消息
                messages.splice(lastIndex, 1, message);
            } else if(message['sys_msg_type'] === CSSystemMsgType.conn){
                //连接消息
                if(message['from']&&message['from']['user_id']) {
                    let staffInfo = {
                        uid: message['from']['uid'],
                        staffId: message['from']['user_id'],
                        nickname: message['from']['nickname'],
                        logoId: message['from']['img_id'],
                        isOnline: message['from']['is_online']
                    };
                    this.setState({
                        staffInfo: staffInfo
                    })
                }
                messages.push(message);
            } else {
                messages.push(message);
            }
            this.setState({
                messages: messages
            }, ()=>{
                this.refs['CSIM'].onGetMessage(message, msg.success);
            });
        } else {
            //发送信息失败
            this.refs['CSIM'].onGetMessage(msg.data, msg.success);
        }
    }

    didUpload(upload) {
        this.refs['CSIM'].onUploadDone(upload);
    }

    didGetRecord(record) {
        if(record.success&&record.data&&record.data.length>0) {
            let messages = this.state.messages;
            messages = record.data.concat(messages);
            this.setState({
                messages: messages
            })
        }
        this.refs['CSIM'].onGetRecordDone(record);
    }

    didGetEditMode(editMode) {
        this.setState({
            isInEditMode: editMode.on
        });
    }

    //显示相关
    onHide() {
        this.setState({
            isShow: false
        }, ()=>{
            CSAction['showCS'](false);
        });
    }

    onClose() {
        //连接了客服才能评论，不然就直接关闭
        if(this.state.conStatus === CSConStatus.connectSuccess
            && this.state.staffInfo.staffId) {
            this.onShowComment(true);
        } else {
            this.doDisconnect();
        }
    }

    //连接相关
    doConnect() {
        this.setState({
            conStatus: CSConStatus.connecting,
        }, ()=>{
            //相关socket的操作
            if(window.WebSocket) {
                CSAction['userToken']();
            } else {
                this.setState({
                    conStatus: CSConStatus.connectNotSupport
                })
            }
        });
    }

    doDisconnect() {
        //相关socket的操作
        CSAction['activateCS'](false);
        CSAction['userDisconnect']();
        this.setState({
            isActivate: false,
            isShow: false,
            showComment: false,
            conStatus: CSConStatus.noConnect,
            messages: [],
        });
    }

    doReconnect() {
        this.setState({
            conStatus: CSConStatus.connecting,
        }, ()=>{
            //相关socket的操作
            if(this.state.userInfo&&this.state.userInfo.loginId) {
                CSAction['userConnect'](this.state.userInfo.loginId);
            } else {
                CSAction['userToken']();
            }
        });
    }

    //评论相关
    onShowComment(showComment) {
        this.setState({
            showComment: showComment
        });
    }

    onSubmitComment(shouldSubmit, comment) {
        if(shouldSubmit) {
            if(this.state.userInfo.loginId && this.state.staffInfo.staffId) {
                CSAction['submitEval'](comment, this.state.userInfo.loginId, this.state.staffInfo.staffId);
            }
            this.doDisconnect();
        } else {
            this.onShowComment(false);
        }
    }

    //点击面板
    onCSPanelClick() {
        this.refs['CSIM'].onHideEmojiPanel();
    }

    //左键抓紧移动
    onCSTitleDragStart(e) {
        if(e.button === 0&&!this.isDragging){
            this.isDragging = true;
            e.target.style.cursor = 'move';
            this.titleDragX = e.clientX;
            this.titleDragY = e.clientY;
            if(this.right === undefined) {
                this.right = 36;
            }
            if(this.bottom === undefined) {
                this.bottom = 45;
            }
        }
    }

    onCSTitleDragging(e) {
        if(this.isDragging) {
            let dom = document.getElementById('CSPanel');
            let deltaX = this.titleDragX - e.clientX;
            let deltaY = this.titleDragY - e.clientY;
            this.right += deltaX;
            this.bottom += deltaY;
            dom.style.right = this.right + 'px';
            dom.style.bottom = this.bottom + 'px';
            //设值
            this.titleDragX = e.clientX;
            this.titleDragY = e.clientY;
        }
    }

    onCSTitleDragEnd(e) {
        if(e.button === 0&&this.isDragging) {
            this.isDragging = false;
            e.target.style.cursor = 'default';
            this.titleDragX = e.clientX;
            this.titleDragY = e.clientY;
            let dom = document.getElementById('CSPanel');
            if(this.right<36&&this.bottom<45) {
                this.right = 36;
                this.bottom = 45;
                dom.style.right = this.right + 'px';
                dom.style.bottom = this.bottom + 'px';
            }
        }
    }

    render() {
        return <div id='CSPanel' className={$class('customer-service', {'hidden': !this.state.isShow})} onClick={this.onCSPanelClick}>
            <div className='cs-layout'>
                <div className='cs-title f--hlc' id='CSPanelTitle'>
                    <div className='main-title'>
                        <CSHeader status={this.state.conStatus} staffInfo={this.state.staffInfo}/>
                    </div>
                    <div className='btn-group f--hlc'>
                        <button className='btn btn-clear zoom-btn' onClick={this.onHide}/>
                        <button className='btn btn-clear close-btn' onClick={this.onClose}/>
                    </div>
                </div>
                <div className='cs-content'>
                    {
                        this.state.conStatus === CSConStatus.disconnect
                        || this.state.conStatus === CSConStatus.connectFailed
                            ? <CSNoConnect reconnect={this.doReconnect}/>
                            : this.state.conStatus === CSConStatus.connecting
                            ? <CSConnecting />
                            : this.state.conStatus === CSConStatus.connectNotSupport
                            ? <CSConnectNotSupport />
                            : null
                    }
                    <div className={$class('cs-im',{'hidden': this.state.conStatus !== CSConStatus.connectSuccess})}>
                        <CSIM ref='CSIM'
                              isInEditMode={this.state.isInEditMode}
                              userInfo={this.state.userInfo}
                              staffInfo={this.state.staffInfo}
                              messages={this.state.messages}/>
                    </div>
                </div>
                {
                    this.state.showComment
                        ? <div className='cs-comment f--hcc'>
                        <CSComment onSubmitComment={this.onSubmitComment}/>
                    </div>
                        : null
                }
            </div>
        </div>
    }
}

module.exports = CS;