/**
 * Customer Service 客服评论
 */

import React from 'react';

import {LNCSViews, LNCommon} from '../../utils/language';

class CSComment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stars: 5,
            comment: '',
        };

        this.onCancel = this.onCancel.bind(this);
        this.onConfirm = this.onConfirm.bind(this);

        this.onCommentChange = this.onCommentChange.bind(this);
    }

    onCancel() {
        if(this.props.onSubmitComment) {
            this.props.onSubmitComment(false, {comment: this.state.comment, stars: this.state.stars});
        }
        this.setState({
            stars: 5,
            comment: '',
        })
    }

    onConfirm() {
        if(this.props.onSubmitComment) {
            this.props.onSubmitComment(true, {comment: this.state.comment, stars: this.state.stars});
        }
        this.setState({
            stars: 5,
            comment: '',
        })
    }

    onClickStar(stars) {
        this.setState({
            stars: stars
        })
    }

    onCommentChange(e) {
        let value = e.target.value;
        this.setState({
            comment: value
        })
    }

    render() {
        let stars = (max)=>{
              let temp = [];
              for(let i=1; i<=max; i++) {
                  let className = 'btn btn-clear star-btn';
                  if (i<=this.state.stars) {
                      className += ' sparkle-star-btn';
                  }
                  let star = <button key={i} className={className} onClick={this.onClickStar.bind(this, i)}></button>;
                  temp.push(star);
             }
             return temp;
        };

        return <div className='customer-service-comment f--hcc'>
            <div className='comment-box'>
                <div className='title'>{LNCSViews.commentTitle}</div>
                <div className='desc'>{LNCSViews.commentDesc}</div>
                <div className='stars'>
                    {stars(5)}
                </div>
                <div className='content'>
                    <textarea className='content-area' placeholder={LNCSViews.commentPlaceholder}
                              value={this.state.comment} onChange={this.onCommentChange}/>
                </div>
                <div className='btn-group'>
                    <button className='btn btn-clear cancel-btn' onClick={this.onCancel}>{LNCommon.cancel}</button>
                    <button className='btn btn-clear confirm-btn' onClick={this.onConfirm}>{LNCommon.confirm}</button>
                </div>
            </div>
        </div>
    }
}

module.exports = CSComment;