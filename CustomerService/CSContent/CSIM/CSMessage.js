/**
 * Customer Service 客服IM信息
 */

import React from 'react';
import $class from 'classnames';

import twemoji from './twemoji.npm';

import CSStore from '../../../../stores/CSStore';
import CSAction from '../../../../actions/CSAction';

import {CSMsgType, CSMsgOwnerType, CSImgSize} from '../../CSConfig';

let cdn = window['ih5cdn'] || '';
let emojiImg = (path) => `${cdn}img/twemoji/${path}`;

class CSMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: props.message || {},   //消息
            msgOwner: this.getMsgOwner(props.message)
        };

        this.getMsgOwner = this.getMsgOwner.bind(this);

        this.decodeContent = this.decodeContent.bind(this);

        this.onBrowseImg = this.onBrowseImg.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            message: nextProps.message || {},   //消息
            msgOwner: this.getMsgOwner(nextProps.message)
        })
    }

    getMsgOwner(message) {
        return CSStore.getMsgOwner(message);
    }

    decodeContent(content) {
        let div = document.createElement('div');
        div.innerHTML = content;
        let output = div.innerText || div.textContent;
        div = null;
        return output;
    }

    onBrowseImg(message) {
        CSAction['activatePhotoBrowser'](true, message);
    }

    render() {
        let sysMsg = (message)=>{
            return <div className='msg msg-sys'>
                {
                    message['title']
                        ? <div className='sys-title'>{message['title']}</div>
                        : null
                }
                <div className='sys-content'>
                    {this.decodeContent(message['content'])}
                </div>
            </div>;
        };

        let textMsg = (message)=>{
            return <div className='msg msg-text'>
                {this.decodeContent(message['content'])}
            </div>;
        };

        let emojiMsg = (message)=>{
            let code = twemoji.convert.toCodePoint(message['content']);
            return <div className='msg msg-emoji'>
                <img src={emojiImg(code+'.svg')}/>
            </div>;
        };

        let imgMsg = (message)=> {
            return <div className='msg msg-img' onClick={this.onBrowseImg.bind(this, message)}>
                <img src={CSStore.getImgLink(message['content'], CSImgSize.origin, true)}></img>
            </div>;
        };

        let linkMsg = (message) => {
            return <div className='msg msg-link f--hlc'>
                <span className='link-project'></span>
                {this.decodeContent(message['content'])}
            </div>;
        };

        let timestamp = (message)=> {
            let result = null;
            // console.log(message);
            if(message['time']) {
                result = <div className='timestamp'>
                    {message['time']}
                </div>;
            }
            return result;
        };

        let msg = (message)=>{
            if(message['from'] && message['from'] === 'system') {
                return sysMsg(message);
            } else {
                switch (message['msg_type']) {
                    case CSMsgType.system:
                        if(this.state.msgOwner === CSMsgOwnerType.staff) {
                            return textMsg(message);
                        } else {
                            return sysMsg(message);
                        }
                    case CSMsgType.text:
                        return textMsg(message);
                    case CSMsgType.emoji:
                        return emojiMsg(message);
                    case CSMsgType.image:
                        return imgMsg(message);
                    case CSMsgType.link:
                        return linkMsg(message);
                    default:
                        return null;
                }
            }
        };

        let msgOwnerClassName = ()=>{
            switch (this.state.msgOwner) {
                case CSMsgOwnerType.system:
                    return 'sys-msg';
                case CSMsgOwnerType.staff:
                    return 'staff-msg';
                case CSMsgOwnerType.user:
                    return 'user-msg';
            }
        };

        return <div className='im-message'>
            {
                this.state.msgOwner === CSMsgOwnerType.system
                    ||this.state.msgOwner === CSMsgOwnerType.staff
                    ||this.state.msgOwner === CSMsgOwnerType.user
                    ? <div className={msgOwnerClassName()}>
                        {timestamp(this.state.message)}
                        {msg(this.state.message)}
                    </div>
                    : null
            }
        </div>
    }
}

module.exports = CSMessage;