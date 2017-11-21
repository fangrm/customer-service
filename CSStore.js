/**
 * Customer Service 客服
 */

import Reflux from 'reflux';
import WidgetStore from '../stores/WidgetStore';
import Action from '../actions/CSAction';
import {isDevMode, isDevPort, getCookie} from '../utils/utils';
import {CSImgSize, CSMsgOwnerType, CSMsgType} from '../component/CustomerService/CSConfig';
import {CSApi} from '../api/CSApi';
import {userApi} from '../api/UserApi';

import bridge from 'bridge';

export default Reflux.createStore({
    init: function () {
        this.listenTo(Action['activateCS'], this.activateCS);
        this.listenTo(Action['showCS'], this.showCS);

        this.listenTo(Action['userInfo'], this.userInfo);
        this.listenTo(Action['userToken'], this.userToken);
        this.listenTo(Action['userLogin'], this.userLogin);
        this.listenTo(Action['userConnect'], this.userConnect);
        this.listenTo(Action['userOnline'], this.userOnline);
        this.listenTo(Action['userDisconnect'], this.userDisconnect);

        this.listenTo(Action['submitEval'], this.submitEval);

        this.listenTo(Action['sendMessage'], this.sendMessage);
        this.listenTo(Action['uploadImage'], this.uploadImage);
        this.listenTo(Action['sendProject'], this.sendProject);

        this.listenTo(Action['getRecord'], this.getRecord);

        this.listenTo(Action['activatePhotoBrowser'], this.activatePhotoBrowser);

        this.listenTo(Action['tryPolling'], this.tryPolling);

        this.listenTo(Action['stopAssist'], this.stopAssist);

        this.socket = null; //web socket

        this.server = CSApi.server;
        this.ws = CSApi.socket;
        if(isDevMode) {
            if(!isDevPort) {
                this.server = 'cs/'
            } else {
                this.server = 'http://im.hiyime.com/';
            }
            this.ws = 'ws://42.51.194.11:8282';
        } else if (window.META_CONFIG) {
            //测试服
            this.server = 'http://im.hiyime.com/';
            this.ws = 'ws://42.51.194.11:8282';
        }

        this.pollingLoginId = null;

        this.token = null;

        this.user = {};
    },

    activateCS: function(activate) {
        //激活客服组件
        if(activate) {
            this.pollingLoginId = null;
        }
        if(!activate) {
            this.user = {};
        }
        this.trigger({activate: {on: activate}});
    },

    showCS: function(show) {
        //显示客服组件
        this.trigger({show: {on: show}});
    },

    tryPolling: function() {
        if(this.pollingLoginId == null) {
            this.userToken(function (loginId) {
                this.pollingLoginId = loginId;
                this.getPollingMessage();
            }.bind(this));
        } else {
            this.getPollingMessage();
        }
    },

    getPollingMessage: function () {
        let URLEncode = (sStr)=>{
            let temp = escape(sStr).replace(/\+/g, '%2B').replace(/\"/g,'%22').replace(/\'/g, '%27').replace(/\//g,'%2F');
            return temp;
        };

        this.ajaxSend('GET', CSApi.polling+URLEncode(this.pollingLoginId), null, function(result){
            if(result&&result['level']==='success') {
                // bridge.log('polling');
                // bridge.log(result['data']);
                let data = result['data'];
                if(data) {
                    data.forEach(v=>{
                        if(v['msg_type'] === CSMsgType.image) {
                            this.trigger({imgMsg: {success: true, data: v}});
                        }
                        this.trigger({message: {success:true, type: v['msg_type'], data: v, isPolling: true}});
                    });
                }
            }
        }.bind(this));
    },

    stopAssist: function () {
        if(this.user.loginId&&this.user.connectId) {
            let sendData = {'login_id': this.user.loginId, 'id': this.user.connectId};
            this.ajaxSend('POST', CSApi.project.assist.close, sendData, function(result){
                if(result&&result['level']==='success') {
                    this.trigger({editMode: {on: false}});
                } else {
                    this.trigger({editMode: {on: false}});
                }
            }.bind(this));
        }
    },

    //用户信息
    userInfo: function(userInfo) {
        this.user = userInfo;
    },

    //用户token
    userToken: function (callBack) {
        if(this.token) {
            this.userLogin(callBack);
        } else {
            this.ajaxSend('POST', userApi.token, {'userApi': true}, function(result){
                if(result) {
                    this.token = result['token'];
                    this.userLogin(callBack);
                } else {
                    if(!callBack) {
                        this.trigger({login: {success: false}});
                    }
                }
            }.bind(this));
        }
    },

    //连接相关
    userLogin: function(pollingCallBack) {
        let token = this.token;
        let sendData = {'token': token};
        this.ajaxSend('POST', CSApi.auth.login, sendData, function(result){
           if(result&&(result['level'] === 'success')) {
               let loginId = result.data;
               if(pollingCallBack) {
                   pollingCallBack(loginId);
               } else {
                   this.trigger({login: {success: true, loginId: loginId}});
                   this.userConnect(loginId);
               }
           } else {
               if(!pollingCallBack) {
                   this.trigger({login: {success: false}});
               }
           }
        }.bind(this));
    },

    userConnect: function(loginId) {
        //连接socket
        this.socket = new WebSocket(this.ws);

        this.socket.onopen = function(result) {
        }.bind(this);

        this.socket.onerror = function(result) {
            bridge.log(result);
            this.trigger({connect: {success: false}});
        }.bind(this);

        this.socket.onmessage = function(result) {
            let data = JSON.parse(result['data']);
            let clientId = data['client_id'];
            let type = data['type'] || '';
            switch(type) {
                case 'init':
                    this.trigger({connect: {success: true, clientId: clientId}});
                    this.userOnline(loginId, clientId);
                    break;
                case 'msg':
                    //message处理 (获取消息)
                    // bridge.log('socket');
                    // bridge.log(data);
                    if(data['msg_type'] === CSMsgType.image) {
                        this.trigger({imgMsg: {success: true, data: data}});
                    }
                    this.trigger({message: {success: true, type:data['msg_type'], data:data}});
                    break;
                case 'action':
                    //作品结束编辑通知
                    if(data['handle'] === 'close_assist') {
                        this.trigger({editMode: {on: false}});
                    }
                    break;
                default:
                    //其他状况
                    // bridge.log(data);
                    break;
            }
        }.bind(this);
    },

    userOnline: function(loginId, clientId) {
        let sendData = {'login_id': loginId, 'client_id': clientId};
        this.ajaxSend('POST', CSApi.auth.online, sendData, function(result){
            if(result&&(result['level'] === 'success')) {
                let data = result['data'];
                let connectId = data['id'];
                this.trigger({online: {success: true, connectId: connectId}});
            } else {
                this.trigger({online: {success: false}});
            }
        }.bind(this));
    },

    sendMessage: function(message, userInfo, isSendProject) {
        //content msg_type login_id id
        let sendData = {'msg_type': message.type, 'content': message.content, 'login_id': userInfo.loginId, 'id': userInfo.connectId};
        this.ajaxSend('POST', CSApi.message.send, sendData, function(result){
            if(result&&result['level']==='success') {
                // bridge.log('ajax');
                // bridge.log(result['data']);
                let data = result['data'];
                if(data['msg_type'] === CSMsgType.image) {
                    this.trigger({imgMsg: {success: true, data: data}});
                }
                this.trigger({message: {success:true, type: message.type, data: data}});
                if(isSendProject) {
                    this.trigger({editMode: {on: true}});
                }
            } else {
                this.trigger({message: {success:false, type: message.type, data: message}});
            }
        }.bind(this));
    },

    uploadImage: function(w, type, userInfo) {
        if(w.files&&w.files.length>0) {
            let allowExt = null;
            if (w.userType == type) {
                allowExt = ['png', 'jpg', 'jpeg', 'gif'];
            }
            let dot =  w.files[0]['name'].lastIndexOf('.');
            if (dot <= 0) {
                return;
            }
            let name = w.files[0]['name'];
            let ext = name.substr(dot + 1);
            if (allowExt && allowExt.indexOf(ext) >= 0) {
                let sendData = {'photo': w.files[0], 'fileName': w.files[0].name, 'isUpload': true};
                this.ajaxSend('POST', CSApi.image.upload, sendData, function (result) {
                    if (result && result['level'] === 'success') {
                        let data = result['data'];
                        //上传成功后发送信息
                        this.trigger({upload: {success: true, type: type}});
                        this.sendMessage({content: data['key'], type: type}, userInfo);
                    } else {
                        //上传失败
                        this.trigger({upload: {success: false, type: type}});
                    }
                }.bind(this), w.showProgress);
            }
        }
    },

    sendProject: function(uid, userInfo) {
        let nid = WidgetStore.getWorkNid();//localStorage.getItem('workNid');
        if(nid) {
            let sendData = {'uid': uid, 'nid': nid, 'url': window.document.location.href, 'userApi': true};
            this.ajaxSend('POST', CSApi.project.send, sendData, function (result) {
                if(result&&result['d']) {
                    this.sendMessage({content: result['d'], type: CSMsgType.link}, userInfo, true);
                }
            }.bind(this));
        }
    },

    getRecord: function(messageID, limit, userInfo) {
        let uri = CSApi.record+userInfo.loginId+'&limit='+limit;
        if(messageID !== null) {
            uri += '&msg_id='+messageID;
        }
        this.ajaxSend('GET', uri, null, function(result){
            if (result && result['level'] === 'success') {
                //获取记录成功
                //反转一下记录
                let data = result['data'].reverse();
                //图片信息
                let imgData = [];
                data.forEach(v=>{
                    if(v['msg_type'] === CSMsgType.image) {
                        imgData.push(v);
                    }
                });
                if(imgData.length>0) {
                    this.trigger({imgRecord: {success: true, data: data}});
                }
                this.trigger({record: {success: true, data: data}});
            } else {
                //获取记录失败
                this.trigger({record: {success: false}});
            }
        }.bind(this));
    },

    //评价
    submitEval: function(comment, loginId, staffId, callback) {
        let sendData = {'login_id': loginId, 'c_user_id': staffId, 'content':comment.comment, 'score':comment.stars};
        this.ajaxSend('POST', CSApi.eval, sendData, function(result){
            if(result&&(result['level'] === 'success')&&callback) {
                callback();
            }
        }.bind(this));
    },

    //激活图片浏览器
    activatePhotoBrowser: function (active, msg) {
        this.trigger({activatePhotoBrowser:{on: active, data: msg}});
    },

    //断开
    userDisconnect: function() {
        if(this.socket) {
            this.socket.close();
            this.socket = null;
        }
    },

    ajaxSend(method, url, sendData, callback, updateProgress) {
        let data = null;
        let xhr = new XMLHttpRequest();
        let isUpload = sendData&&sendData['isUpload'];
        if(isUpload) {
            data = new FormData();
            data.append('name', sendData['fileName']);
            data.append('file_name', sendData['fileName']);
            data.append('photo', sendData['photo']);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    callback(JSON.parse(xhr.responseText));
                }
            };
        } else {
            data = JSON.stringify(sendData);
            xhr.onload = function() {
                if (xhr['status'] > 300) {
                    callback(null);
                } else if(xhr.responseText) {
                    callback(JSON.parse(xhr.responseText));
                } else {
                    callback(null);
                }
            };
        }

        let sUrl = this.server+url;
        if(sendData&&sendData['userApi']) {
            sUrl = url;
            delete sendData['userApi'];
        }
        xhr.open(method, sUrl);
        if ((data&&!isUpload) || (sendData&&sendData['userApi'])) {
            xhr.setRequestHeader('Content-Type', 'application/json');
        }
        if(updateProgress){
            xhr.upload.onprogress = updateProgress;
        }
        xhr.send(data);
    },

    getImgLink(content, imgSize, isKey) {
        if(isKey) {
            if(imgSize !== CSImgSize.origin) {
                return this.server+CSApi.image.keyDisplay+content+'&size='+imgSize;
            }
            return this.server+CSApi.image.keyDisplay+content;
        }
        return this.server+CSApi.image.display+content+'/'+imgSize;
    },

    getMsgOwner(message) {
        let msgOwner = CSMsgOwnerType.nobody;
        if(message) {
            if(message['from']){
                if(message['from'] === 'system') {
                    msgOwner = CSMsgOwnerType.system;
                } else {
                    msgOwner = CSMsgOwnerType.staff;
                }
            }
            if(message['send_type']) {
                if(message['send_type'].charAt(0) === 'v'){
                    msgOwner = CSMsgOwnerType.user;
                } else if(message['send_type'].charAt(0) === 'c') {
                    msgOwner = CSMsgOwnerType.staff;
                }
            }
        }
        return msgOwner;
    }
});