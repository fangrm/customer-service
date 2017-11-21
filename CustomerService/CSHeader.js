/**
 * Customer Service 客服头部
 */

import React from 'react';

import {CSConStatus, CSImgSize} from './CSConfig';
import CSStore from '../../stores/CSStore';

import {LNCSViews} from '../../utils/language';

class CSHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            conStatus: props.status || CSConStatus.disconnect,   //连接状态
            staffInfo: props.staffInfo || {}  //员工信息
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            conStatus: nextProps.status || CSConStatus.disconnect,   //连接状态
            staffInfo: nextProps.staffInfo || {}  //员工信息
        })
    }

    render() {
        return <div className='customer-service-header'>
            {
                this.state.conStatus !== CSConStatus.connectSuccess
                    ? <span className='default-header'>{LNCSViews.defaultHeader}</span>
                    : <div className='staff-info f--hlc'>
                        {
                            this.state.staffInfo.logoId
                                ? <img className='logo' src={CSStore.getImgLink(this.state.staffInfo.logoId, CSImgSize.small)}/>
                                : <div className='logo default-logo'/>
                        }
                        <div className='name'>
                            {
                                this.state.staffInfo.nickname
                                    ? this.state.staffInfo.nickname
                                    : LNCSViews.defaultStaffName
                            }
                        </div>
                </div>
            }
        </div>
    }
}

module.exports = CSHeader;