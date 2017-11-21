/**
 * Customer Service 客服IM表情选择面板
 */

import React from 'react';
import $class from 'classnames';

import CSAction from '../../../../actions/CSAction';
import {CSMsgType} from '../../CSConfig';

import twemoji from './twemoji.npm';

let cdn = window['ih5cdn'] || '';
let emojiImg = (path) => `${cdn}img/twemoji/${path}`;

let MouseScrollEvent = require("../../../../utils/addMouseScrollEvent");

class CSEmojiPanel extends React.Component {
    constructor(props) {
        super(props);
        this.emojList = [
            ['1f60a','1f60b','1f60c','1f60d','1f60e','1f60f','1f61b'],
            ['1f61c','1f61d','1f61e','1f61f','1f62a','1f62b','1f62c'],
            ['1f62d','1f62e','1f62f','1f600','1f601','1f602','1f642'],
            ['1f604','1f605','1f606','1f607','1f608','1f609','1f610'],
            ['1f611','1f612','1f613','1f614','1f615','1f616','1f618'],
            ['1f620','1f621','1f622','1f623','1f624','1f625','1f629'],
            ['1f630','1f631','1f632','1f633','1f634','1f635','1f636'],
            ['1f637','1f641','1f643','1f644','1f910','1f911','1f912'],
            ['1f913','1f914','1f915','1f917','1f924','1f925','1f927'],
            ['1f923','1f922','1f44c','1f339','1f940','1f495','1f494'],
            ['1f4a9','1f48a','1f48b','1f4aa','270c', '1f918','1f919'],
            ['1f44d','1f44e','1f44f','1f44b','1f91a','1f91c','1f91d'],
            ['1f64c','1f64f','1f34c','1f34e','1f35c','1f37b','1f349'],
            ['1f381','1f385','1f480','1f528','1f575']
        ];

        this.state = {
            emojiList: this.emojList,
        };

        this.onGetEmojiImgList = this.onGetEmojiImgList.bind(this);
        this.onSelectEmoji = this.onSelectEmoji.bind(this);
        this.addMouseScrollEvent = this.addMouseScrollEvent.bind(this);
    }

    componentDidMount() {
        this.addMouseScrollEvent();
    }

    addMouseScrollEvent() {
        let dom = document.getElementById('emojiGroup');
        MouseScrollEvent.addEvent(dom, 'mousewheel', function(event) {
            dom.scrollTop += event.deltaY;
        }.bind(this));
    }

    onGetEmojiImgList() {
        let list = [];
        this.state.emojiList.forEach(v=> {
            v.forEach(v2=> {
                let src = emojiImg(v2+'.svg');
                list.push(<img key={v2} src={src} onClick={this.onSelectEmoji.bind(this, v2)}/>);
            })
        });
        return list;
    }

    onSelectEmoji(emoji){
        let code = twemoji.convert.fromCodePoint(emoji);
        CSAction['sendMessage']({content: code, type: CSMsgType.emoji}, this.props.userInfo);
    }

    render(){
        return <div className='im-emoji-panel'>
            <div className="triangle"></div>
            <div className='emoji-group' id='emojiGroup'>
                {
                    this.onGetEmojiImgList()
                }
            </div>
        </div>
    }
}

module.exports = CSEmojiPanel;
