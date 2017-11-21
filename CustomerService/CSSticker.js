/**
 * Customer Service 客服
 */

import React from 'react';
import $class from 'classnames';

import CSStore from '../../stores/CSStore';
import CSAction from '../../actions/CSAction';

class CSSticker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,  //是否显示sticker
            isCSShow: false,
            isCSActivate: false,

            showMsgDot: false,  //是否显示绿点
        };
        this.onCSChange = this.onCSChange.bind(this);

        //客服面板的显示和隐藏
        this.onToggleCSShow = this.onToggleCSShow.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = CSStore.listen(this.onCSChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onCSChange(CSChange) {
        if(CSChange.show&&this.state.isCSShow!==CSChange.show.on) {
            //显示和消失
            this.setState({
                isShow: !CSChange.show.on,
                isCSShow: CSChange.show.on
            })
        } else if(CSChange.activate&&this.state.isCSActivate!==CSChange.activate.on) {
            this.setState({
                isShow: false,
                isCSShow: CSChange.activate.on,
                isCSActivate: CSChange.activate.on,
                showMsgDot: false
            })
        } else if (CSChange.message&&CSChange.message.success&&this.state.isShow) {
            this.setState({
                showMsgDot: true
            })
        }
    }

    onToggleCSShow() {
        this.setState({
            isShow: !this.state.isShow,
            isCSShow: !this.state.isCSShow,
            showMsgDot: false
        }, ()=>{
            CSAction['showCS'](this.state.isCSShow);
        });
    }

    render() {
        return <div className={$class('customer-service-sticker', {'hidden': !this.state.isShow})}>
            <button className='btn btn-clear sticker-btn' onClick={this.onToggleCSShow}>
                <div className='status normal-status'></div>
                <div className={$class('status message-status', {'hidden': !this.state.showMsgDot})}></div>
            </button>
        </div>
    }
}

module.exports = CSSticker;