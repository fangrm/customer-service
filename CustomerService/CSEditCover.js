/**
 * Customer Service 客服编辑蒙板
 */

import React from 'react';
import $class from 'classnames';

import CSStore from '../../stores/CSStore';
import CSAction from '../../actions/CSAction';

import {LNCSViews, LNCommon} from '../../utils/language';

class CSEditCover extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            isShowModal: false,
            isCSActivate: false,
        };

        this.onCSChange = this.onCSChange.bind(this);

        this.onClickCloseBtn = this.onClickCloseBtn.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = CSStore.listen(this.onCSChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onCSChange(CSChange) {
        if(CSChange.activate&&this.state.isCSActivate!==CSChange.activate.on) {
            this.setState({
                isShow: false,
                isShowModal: false,
                isCSActivate: CSChange.activate.on,
            })
        } else if(CSChange.editMode) {
            this.setState({
                isShow: CSChange.editMode.on
            })
        }
    }

    onClickCloseBtn(e) {
        if(!this.state.isShowModal) {
            this.setState({
                isShowModal: true
            })
        }
    }

    onConfirm(shouldEnd) {
        if(shouldEnd) {
            //发送请求
            CSAction['stopAssist']();
            this.setState({
                isShow: false
            });
        }
        this.setState({
            isShowModal: false
        })
    }

    render() {
        return (<div className={$class('customer-service-edit-cover f--hcc', {'hidden': !this.state.isShow})}>
            <div className={$class('edit-cover-notice', {'hidden': this.state.isShowModal})}>
                {LNCSViews.editCoverNotice}
                <button className='btn btn-clear edit-cover-close-btn' onClick={this.onClickCloseBtn}/>
            </div>
            <div className={$class('edit-covet-modal', {'hidden': !this.state.isShowModal})}>
                <div className={$class('modal-content')}>{LNCSViews.editCoverModal}</div>
                <div className={$class('btn-group')}>
                    <button className='btn btn-clear cancel-btn' onClick={this.onConfirm.bind(this, false)}>{LNCommon.cancel}</button>
                    <button className='btn btn-clear confirm-btn' onClick={this.onConfirm.bind(this, true)}>{LNCommon.confirm}</button>
                </div>
            </div>
        </div>);
    }
}

module.exports = CSEditCover;