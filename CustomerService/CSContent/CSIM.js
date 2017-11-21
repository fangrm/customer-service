/**
 * Customer Service 客服IM
 */

import React from 'react';

import CSEmojiPanel from './CSIM/CSEmojiPanel';
import CSMessage from './CSIM/CSMessage';

import CSStore from '../../../stores/CSStore';
import CSAction from '../../../actions/CSAction';

import {CSMsgType, CSMsgOwnerType} from '../CSConfig';

import {LNCSViews} from '../../../utils/language';
import {isMac, isCmdKey} from '../../../utils/utils';

let MouseScrollEvent = require("../../../utils/addMouseScrollEvent");

class CSIM extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: '',
            messages: props.messages||[],   //消息
            showMsgNotice: false,    //新消息提醒
            enableUpload: true,      //允许上传
            uploadProgress: 0,       //上传进度
            isLoadingRecord: false,  //历史数据
            emojiPanelShow: false,   //emoji面板

            recordEnd: false,    //是否还有历史记录

            allowSendProject: props.userInfo.loginId&&props.staffInfo.uid&&!props.isInEditMode,  //是否允许发送项目
        };

        this.didPressCmdKey = false;

        this.dialogScrollHeight = 406;  //记录之前的高度

        this.recordLimit = 10; //历史记录每次的限制
        this.messageId = null;  //最后记录的messageId

        this.onInputChange = this.onInputChange.bind(this);
        this.onInputKeyDown = this.onInputKeyDown.bind(this);
        this.onInputKeyUp = this.onInputKeyUp.bind(this);

        this.onUploadImage = this.onUploadImage.bind(this);
        this.onUploadChange = this.onUploadChange.bind(this);
        this.onUploadProgress = this.onUploadProgress.bind(this);
        this.onUploadDone = this.onUploadDone.bind(this);

        this.onSendProject = this.onSendProject.bind(this);

        this.onGetMessage = this.onGetMessage.bind(this);

        this.onShowMsgNotice = this.onShowMsgNotice.bind(this);

        this.onDialogScroll = this.onDialogScroll.bind(this); //对话框滑动
        this.addMouseScrollEvent = this.addMouseScrollEvent.bind(this);
        this.onMouseScroll = this.onMouseScroll.bind(this); //鼠标的滑动

        this.onGetRecordDone = this.onGetRecordDone.bind(this); //获取记录

        this.onToggleEmojiPanel = this.onToggleEmojiPanel.bind(this); //emoji面板的显示
        this.onHideEmojiPanel = this.onHideEmojiPanel.bind(this);   //隐藏面板
    }

    componentDidMount() {
        window.addEventListener('keyup', this.onInputKeyUp);
        this.addMouseScrollEvent();
    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.onInputKeyUp);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            messages: nextProps.messages || [],   //消息
            allowSendProject: nextProps.userInfo.loginId&&nextProps.staffInfo.uid&&!nextProps.isInEditMode,
        })
    }

    onInputChange(e) {
        this.setState({
            content: e.target.value,
        })
    }

    onInputKeyDown(e) {
        if(isCmdKey(e.keyCode)) {
            this.didPressCmdKey = true;
        }
        let didPressCtrl = (isMac && this.didPressCmdKey) || (!isMac && e.ctrlKey);
        if(e.keyCode == 13 && didPressCtrl){
            // 这里实现换行
            this.setState({
                content: e.target.value += '\n',
            });
        } else if(e.keyCode == 13) {
            // 避免回车键换行
            e.preventDefault();
            if(this.state.content !== '') {
                //信息非空发送信息
                CSAction['sendMessage']({content: this.state.content, type: CSMsgType.text}, this.props.userInfo);
                this.setState({
                    content: '',
                });
            }
        }
    }

    onInputKeyUp(e) {
        if(isMac&&isCmdKey(e.keyCode)) {
            this.didPressCmdKey = false;
        }
    }

    onUploadImage(type){
        let w = this.refs['CSUploadBox'];
        w.value = '';
        w.userType = type;
        w.showProgress = this.onUploadProgress?this.onUploadProgress:null;
        w.click();
    }

    onUploadChange(e) {
        CSAction['uploadImage'](e.target, CSMsgType.image, this.props.userInfo);
        this.setState({
            enableUpload: false
        });
    }

    onUploadProgress(evt) {
        //进度 (如果需要可以添加上传进度)
        if(evt.lengthComputable) {
            this.setState({
                uploadProgress: (evt.loaded / evt.total * 100)
            });
        }
    }

    onUploadDone(upload){
        //上传成功／失败
        if(upload) {
            this.setState({
                enableUpload: true,
                uploadProgress: 0
            });
        }
    }

    onSendProject() {
        if(this.props.userInfo.loginId&&this.props.staffInfo.uid) {
            CSAction['sendProject'](this.props.staffInfo.uid, this.props.userInfo);
        }
    }

    onGetMessage(msg, success) {
        let height = this.refs['dialog'].clientHeight;
        let scrollHeight = this.refs['dialog'].scrollHeight;
        let msgOwner = CSStore.getMsgOwner(msg);
        if(success) {
            //发送成功
            if(msg) {
                if(msgOwner === CSMsgOwnerType.user || msgOwner === CSMsgOwnerType.system) {
                    //只有用户信息和系统信息才滚到底
                    if(this.dialogScrollHeight < scrollHeight) {
                        this.refs['dialog'].scrollTop = scrollHeight - height;
                    }
                } else if(msgOwner === CSMsgOwnerType.staff) {
                    //客服消息就显示
                    this.onShowMsgNotice(this.refs['dialog'], true);
                }
            }
            if(scrollHeight!=0) {
                this.dialogScrollHeight = scrollHeight;
            }
        } else {
            //发送失败
        }
    }

    onShowMsgNotice(target, show) {
        let bottomHeight = target.scrollHeight-(target.scrollTop+target.clientHeight);
        if((bottomHeight>=35&&show) || (bottomHeight<35&&!show)) {
            if(this.state.showMsgNotice !== show) {
                this.setState({
                    showMsgNotice: show
                });
            }
        }
    }

    onDialogScroll(e) {
        this.onShowMsgNotice(e.target, false);
    }

    addMouseScrollEvent() {
        let dom = document.getElementById('CSIMDialog');
        MouseScrollEvent.addEvent(dom, 'mousewheel', function(event) {
            this.onMouseScroll(event.delta, dom);
        }.bind(this));
    }

    onMouseScroll(delta, dom) {
        if(delta>5&&dom.scrollTop===0&&!this.state.isLoadingRecord) {
            //获取历史数据
            this.setState({
                isLoadingRecord: true
            });
            if(this.state.messages.length>0&&this.state.messages[0]['msg_id']) {
                this.messageId = this.state.messages[0]['msg_id'];
            }
            if(!this.state.recordEnd) {
                CSAction['getRecord'](this.messageId, this.recordLimit, this.props.userInfo);
            // } else {
                // setTimeout(function () {
                //     this.setState({
                //         isLoadingRecord: false
                //     });
                // }.bind(this), 300);
            }
        }
    }

    onGetRecordDone(record) {
        //获取记录成功／失败
        if(record) {
            if(record.success) {
                this.setState({
                    recordEnd: record.data&&record.data.length===0  //如果成功获取但data为空就是没有更多的历史记录了
                });
                let scrollHeight = this.refs['dialog'].scrollHeight;
                if(this.dialogScrollHeight<scrollHeight) {
                    this.refs['dialog'].scrollTop = scrollHeight - this.dialogScrollHeight + this.refs['dialog'].scrollTop;
                }
                if(scrollHeight!=0) {
                    this.dialogScrollHeight = scrollHeight;
                }
            }
            this.setState({
                isLoadingRecord: false
            })
        }
    }

    onToggleEmojiPanel(e) {
        e.stopPropagation();
        this.setState({
            emojiPanelShow: !this.state.emojiPanelShow
        });
    }

    onHideEmojiPanel() {
        if(this.state.emojiPanelShow) {
            this.setState({
                emojiPanelShow: !this.state.emojiPanelShow
            });
        }
    }

    render() {
        return <div className='customer-service-im'>
            <div className='dialog-area'>
                <div id='CSIMDialog' className='im-dialog' ref='dialog' onScroll={this.onDialogScroll}>
                    {
                        this.state.isLoadingRecord
                            ? <div className="im-record-loading">
                            {
                                !this.state.recordEnd
                                    ? LNCSViews.isLoadingRecords
                                    : LNCSViews.noRecords
                            }
                        </div>
                            : null
                    }
                    {
                        this.state.messages.map((message, i)=>{
                           return <CSMessage key={i} message={message} />
                        })
                    }
                </div>
                {
                    this.state.showMsgNotice
                        ? <div className="im-new-msg-notice">new</div>
                        : null
                }
            </div>
            <div className='input-area'>
                <div className='im-tool f--hlc'>
                    <button className='btn btn-clear emoji-btn' onClick={this.onToggleEmojiPanel}/>
                    <button className='btn btn-clear image-btn' disabled={!this.state.enableUpload}
                            onClick={this.onUploadImage.bind(this,'image')} />
                    <button className='btn btn-clear send-project-btn' disabled={!this.state.allowSendProject}
                            onClick={this.onSendProject}>{LNCSViews.sendProject}</button>
                    {
                        this.state.emojiPanelShow
                            ? <CSEmojiPanel userInfo={this.props.userInfo}/>
                            : null
                    }
                </div>
                <textarea className='im-input' placeholder={LNCSViews.IMPlaceholder} value={this.state.content}
                          onChange={this.onInputChange} onKeyDown={this.onInputKeyDown} onKeyUp={this.onInputKeyUp}/>
            </div>
            <input ref='CSUploadBox'
                   className='im-upload'
                   onChange={this.onUploadChange}
                   type='file' />
        </div>
    }
}

module.exports = CSIM;

