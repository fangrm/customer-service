/**
 * Customer Service 客服连接中
 */

import React from 'react';

import {LNCSViews} from '../../../utils/language';

class CSConnecting extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div className='customer-service-connecting f--hcc'>
            <div className='back-logo'/>
            <div className='loading'>
                <div className='spinner'>
                    <div className='bounce1'></div>
                    <div className='bounce2'></div>
                    <div className='bounce3'></div>
                    <div className='bounce4'></div>
                    <div className='bounce5'></div>
                    <div className='bounce6'></div>
                </div>
                <span className='notice'>{LNCSViews.connecting}</span>
            </div>
        </div>
    }
}

module.exports = CSConnecting;