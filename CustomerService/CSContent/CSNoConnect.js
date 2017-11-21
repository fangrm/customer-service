/**
 * Customer Service 客服无连接
 */

import React from 'react';

import {LNCSViews} from '../../../utils/language';

class CSNoConnect extends React.Component {
    constructor(props) {
        super(props);

        this.doReconnect = this.doReconnect.bind(this);
    }

    doReconnect() {
        if(this.props.reconnect) {
            this.props.reconnect();
        }
    }

    render() {
        return <div className='customer-service-no-connect f--hcc'>
            <div className='back-logo'/>
            <div className='info'>
                <span className='notice'>{LNCSViews.noConnect}</span>
                <button className='btn btn-clear reconnect-btn' onClick={this.doReconnect}>{LNCSViews.reconnect}</button>
            </div>
        </div>
    }
}

module.exports = CSNoConnect;
