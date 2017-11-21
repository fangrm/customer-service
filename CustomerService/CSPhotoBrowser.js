/**
 * Customer Service 客服图片浏览
 */

import React from 'react';
import $class from 'classnames';

import {CSImgSize} from './CSConfig';

import CSStore from '../../stores/CSStore';

import {LNCSViews} from '../../utils/language';

import {dragdrop} from '../PropertyView/MoudleMove';

class CSPhotoBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActivate: false,  //显示图片浏览
            imgMsgs: [],    //图片消息列表
            currentIndex: -1,

            enableLeftBtn: true,    //左选择按钮
            enableRightBtn: true,   //右选择按钮

            zoomPercent: 100, //缩放比例
            isAbsolute: true, //是否绝对定位
        };
        this.currentImgMsg = null;

        this.onCSChange = this.onCSChange.bind(this);

        this.didActivatePhotoBrowser = this.didActivatePhotoBrowser.bind(this); //激活浏览图片
        this.didReceiveImgMsg = this.didReceiveImgMsg.bind(this);   //图片信息
        this.didReceiveImgRecord = this.didReceiveImgRecord.bind(this); //图片记录

        this.onSetCurrentImgMsg = this.onSetCurrentImgMsg.bind(this);   //设置当前图片
        this.onGetCurrentImgMsgLink = this.onGetCurrentImgMsgLink.bind(this); //获取图片链接
        this.getCurrentImgMsgIndex = this.getCurrentImgMsgIndex.bind(this); //获取当前图片index

        this.onZoomImg = this.onZoomImg.bind(this); //放缩图片

        this.onCloseBrowser = this.onCloseBrowser.bind(this);  //关闭按钮

        this.onCenterCSPhotoBrowser = this.onCenterCSPhotoBrowser.bind(this); //居中图片浏览

        //拖拉
        this.onCSPhotoBrowserDragStart = this.onCSPhotoBrowserDragStart.bind(this);
        this.onCSPhotoBrowserDragging = this.onCSPhotoBrowserDragging.bind(this);
        this.onCSPhotoBrowserDragEnd = this.onCSPhotoBrowserDragEnd.bind(this);
        this.isDragging = false;    //是否移动中
    }

    componentDidMount() {
        this.unsubscribe = CSStore.listen(this.onCSChange.bind(this));
        //绑定
        this.dragDrop = dragdrop(document.getElementById('CSPhotoBrowserBar'), document,
            this.onCSPhotoBrowserDragStart, this.onCSPhotoBrowserDragging, this.onCSPhotoBrowserDragEnd);
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.dragDrop();
    }

    onCSChange(CS) {
        if(CS.activatePhotoBrowser) {
            this.didActivatePhotoBrowser(CS.activatePhotoBrowser);
        } else if(CS.show&&!CS.show.on || CS.activate&&!CS.activate.on) {
            this.onCloseBrowser();
        } else if(CS.imgMsg) {
            this.didReceiveImgMsg(CS.imgMsg.data);
        } else if(CS.imgRecord) {
            this.didReceiveImgRecord(CS.imgRecord.data);
        }
    }

    didActivatePhotoBrowser(PB) {
        this.setState({
            isActivate: PB.on,
            zoomPercent: 100,
            isAbsolute: true
        }, ()=>{
            if(this.state.isActivate) {
                this.onCenterCSPhotoBrowser();
                this.onSetCurrentImgMsg(PB.data);
            }
        });
    }

    didReceiveImgMsg(imgMsg) {
        let imgMsgs = this.state.imgMsgs;
        imgMsgs.push(imgMsg);
        this.setState({
            imgMsgs: imgMsgs
        },()=>{
            this.onSetCurrentImgMsg(this.currentImgMsg);
        })
    }

    didReceiveImgRecord(record) {
        let imgMsgs = this.state.imgMsgs;
        imgMsgs = record.concat(imgMsgs);
        this.setState({
            imgMsgs: imgMsgs
        },()=>{
            this.onSetCurrentImgMsg(this.currentImgMsg);
        })
    }

    onSetCurrentImgMsg(msg, delta) {
        let index = this.state.currentIndex;
        //更新图片索引
        let updateIndex = (index, fromDelta)=>{
            this.setState({
                enableLeftBtn: index !== 0
            });
            this.setState({
                enableRightBtn: index !== this.state.imgMsgs.length-1
            });
            if(fromDelta) {
                this.setState({
                    currentIndex: index,
                    zoomPercent: 100,
                    isAbsolute: true
                })
            } else {
                this.setState({
                    currentIndex: index
                })
            }
        };

        if(msg != undefined) {
            if (this.currentImgMsg&&this.currentImgMsg['msg_id'] !== msg['msg_id']) {
                this.setState({
                    zoomPercent: 100,
                    isAbsolute: true
                })
            }
            this.currentImgMsg = msg;
            index = this.getCurrentImgMsgIndex();
            updateIndex(index, false);
        } else if(delta != undefined) {
            if((index+delta>=0) && (index+delta<this.state.imgMsgs.length)) {
                index+=delta;
                this.currentImgMsg = this.state.imgMsgs[index];
                updateIndex(index, true);
            }
        }
    }

    onGetCurrentImgMsgLink() {
        let content = null;
        if(this.state.currentIndex>=0&&this.state.imgMsgs.length>this.state.currentIndex) {
            content = this.state.imgMsgs[this.state.currentIndex]['content'];
        }
        return CSStore.getImgLink(content, CSImgSize.origin, true);
    }

    getCurrentImgMsgIndex() {
        let index = -1;
        if(this.currentImgMsg&&this.state.imgMsgs) {
            for(let i = 0; i<this.state.imgMsgs.length; i++){
                if (this.currentImgMsg['msg_id'] === this.state.imgMsgs[i]['msg_id']) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    }

    onZoomImg(delta, e) {
        let zoomPercent = this.state.zoomPercent;
        if(zoomPercent+delta>=10&&zoomPercent+delta<=990) {
            let isAbsolute = true;
            let imgHeight = this.refs['pbImg'].clientHeight/zoomPercent*(zoomPercent+delta); //放大后的图片高度
            if(imgHeight > this.refs['pbImgContainer'].clientHeight) {
              isAbsolute = false;
            }
            this.setState({
                zoomPercent: zoomPercent+delta,
                isAbsolute: isAbsolute
            })
        }
    }

    onCloseBrowser() {
        this.onCenterCSPhotoBrowser();
        this.setState({
            currentIndex: -1,
            isActivate: false,
            zoomPercent: 100,
            isAbsolute: true,
            enableLeftBtn: true,
            enableRightBtn: true,
        });
        this.currentImgMsg = null;
    }

    onCSPhotoBrowserDragStart(e) {
        if(e.button === 0&&!this.isDragging){
            this.isDragging = true;
            this.targetCursor = e.target.style.cursor;
            this.dragX = e.clientX;
            this.dragY = e.clientY;
        }
    }

    onCSPhotoBrowserDragging(e) {
        if(this.isDragging) {
            e.target.style.cursor = 'move';
            let dom = document.getElementById('CSPhotoBrowser');
            let deltaX = e.clientX-this.dragX;
            let deltaY = e.clientY-this.dragY;
            let dragX = dom.offsetLeft + deltaX;
            let dragY = dom.offsetTop + deltaY;
            dom.style.left = dragX + 'px';
            dom.style.top = dragY + 'px';
            dom.style.margin = 'initial';
            this.dragX = e.clientX;
            this.dragY = e.clientY;
        }
    }

    onCSPhotoBrowserDragEnd(e) {
        if(e.button === 0&&this.isDragging) {
            this.isDragging = false;
            e.target.style.cursor = this.targetCursor;
            this.dragX = e.clientX;
            this.dragY = e.clientY;
        }
    }

    onCenterCSPhotoBrowser() {
        let dom = document.getElementById('CSPhotoBrowser');
        dom.style.left = 0;
        dom.style.top = 0;
        dom.style.margin = 'auto';
    }

    render() {
        return <div id='CSPhotoBrowser' className={$class('customer-service-photo-browser', {'hidden': !this.state.isActivate})}>
            <div className='pb-bar f--hlc' id='CSPhotoBrowserBar'>
                <div className='pb-title f--hlc'>
                    <div className='title-logo' />
                    <span>{LNCSViews.photoBrowser}</span>
                </div>
                <div className='pb-tool f--hlc'>
                    <div className='tool-select f--hlc'>
                        <button className='btn btn-clear tool-btn tool-btn-left' disabled={!this.state.enableLeftBtn}
                                onClick={this.onSetCurrentImgMsg.bind(this, undefined, -1)}/>
                        <div className='btn-seperator'></div>
                        <button className='btn btn-clear tool-btn tool-btn-right' disabled={!this.state.enableRightBtn}
                                onClick={this.onSetCurrentImgMsg.bind(this, undefined, 1)}/>
                    </div>
                    <div className='tool-zoom f--hlc'>
                        <button className='btn btn-clear tool-btn tool-btn-zoom-out' onClick={this.onZoomImg.bind(this, 10)}/>
                        <div className='btn-seperator'></div>
                        <span className='zoom-percent'>{this.state.zoomPercent+'%'}</span>
                        <div className='btn-seperator'></div>
                        <button className='btn btn-clear tool-btn tool-btn-zoom-in' onClick={this.onZoomImg.bind(this, -10)}/>
                    </div>
                </div>
                <button className='btn btn-clear pb-close' onClick={this.onCloseBrowser}></button>
            </div>
            <div className='pb-content'>
                <div className='content-container' ref='pbImgContainer'>
                    <img src={this.onGetCurrentImgMsgLink()} ref='pbImg'
                         style={{'maxWidth': this.state.zoomPercent+'%',
                             'maxHeight': this.state.zoomPercent+'%',
                             'position': this.state.isAbsolute?'absolute':'relative'}}/>
                </div>
            </div>
        </div>
    }
}

module.exports = CSPhotoBrowser;

