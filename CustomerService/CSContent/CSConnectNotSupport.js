/**
 * Customer Service 客服不支持
 */

import React from 'react';

import {LNCSViews} from '../../../utils/language';

class CSConnectNotSupport extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div className='customer-service-no-support f--hcc'>
            <div className='back-logo'/>
            <div className='info'>
                <span className='notice'>{LNCSViews.noSupport}</span>
            </div>
        </div>
    }
}

module.exports = CSConnectNotSupport;