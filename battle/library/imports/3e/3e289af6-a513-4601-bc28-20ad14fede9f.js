"use strict";
cc._RF.push(module, '3e289r2pRNGAbwoIK0U/t6f', 'ComponentTools');
// script/framework/utils/ComponentTools.js

'use strict';

var _ComponentTools;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var il8n = require('LanguageData');
var FuncTools = require('FuncTools');
var ComponentTools = (_ComponentTools = {
    //多语言赋值
    //langKey 多语言key
    //funName 功能名称
    //force 是否强制渲染文本
    labelStringByLang: function labelStringByLang(node, langKey, langValue, funName, force) {
        var langStr = null;
        if (!!funName) {
            if (FuncTools.getFuncStatus(funName)) {
                langStr = il8n.t(langKey + '-f', langValue);
                cc.log('没有该功能对应的langKey+++++++++++++++++++++++++++++++++++++');
            } else {
                langStr = il8n.t(langKey, langValue);
            }
        } else {
            langStr = il8n.t(langKey, langValue);
        }
        this.labelString(node, langStr, force);
        return langStr;
    },

    richStringByLang: function richStringByLang(node, langKey, langValue, funName) {
        var langStr = null;
        if (!!funName) {
            if (FuncTools.getFuncStatus(funName)) {
                langStr = il8n.t(langKey + '-f', langValue);
                cc.log('richText没有该功能对应的langKey+++++++++++++++++++++++++++++++++++++');
            } else {
                langStr = il8n.t(langKey, langValue);
            }
        } else {
            langStr = il8n.t(langKey, langValue);
        }
        this.richLabelString(node, langStr);
        return langStr;
    },

    //对文本赋值
    labelString: function labelString(node, text, force) {
        if (cc.isValid(node)) {
            var label = node.getComponent(cc.Label);
            if (label) {
                label.string = text;
            }
            if (force) {
                label._updateRenderData(true);
            }
        }
    },
    getLabelString: function getLabelString(node) {
        if (cc.isValid(node)) {
            var label = node.getComponent(cc.Label);
            if (!!label) {
                return label.string;
            }
        }
        return '';
    },

    setLabelSize: function setLabelSize(node, size) {
        if (cc.isValid(node)) {
            var label = node.getComponent(cc.Label);
            if (!!label) {
                label.fontSize = size;
            }
        }
    },

    setLabelColor: function setLabelColor(node, color) {
        if (cc.isValid(node)) {
            // let label = node.getComponent(cc.Label);
            // if (label) {
            //     label.color = color;
            // }
            node.color = color;
        }
    },
    //对富文本进行赋值
    richLabelString: function richLabelString(node, text, lineHeight) {
        if (cc.isValid(node)) {
            var label = node.getComponent(cc.RichText);
            if (label) {
                if (!!lineHeight && lineHeight > 0) {
                    label.lineHeight = lineHeight;
                }
                label.string = text;
            }
        }
    },
    //拥有纹理时直接赋值
    spriteFrame: function spriteFrame(node, _spriteFrame) {
        if (cc.isValid(node)) {
            var sprite = node.getComponent(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = _spriteFrame;
            }
        }
    },

    getSpriteFrame: function getSpriteFrame(node) {
        if (cc.isValid(node)) {
            var sprite = node.getComponent(cc.Sprite);
            if (sprite) {
                return sprite.spriteFrame;
            }
        }
        return null;
    },

    clearSpriteFrame: function clearSpriteFrame(node) {
        if (cc.isValid(node)) {
            var sprite = node.getComponent(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = null;
            }
        }
    },

    //获得节点
    getChildByName: function getChildByName(node, name) {
        if (!cc.isValid(node)) {
            return null;
        }
        var childNode = node.getChildByName(name);
        return childNode;
    },

    //获得scrollView 并滑动到指定位置
    getScrollViewAndScroll: function getScrollViewAndScroll(node, x, y) {
        var scrollView = node.getComponent(cc.ScrollView);
        if (scrollView) {
            scrollView.stopAutoScroll();
            scrollView.scrollToOffset(cc.v2(x, y), 0);
        }
        return scrollView;
    },

    //滑动到顶部
    getScrollViewAndScrollTop: function getScrollViewAndScrollTop(node) {
        var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        var scrollView = node.getComponent(cc.ScrollView);
        if (scrollView) {
            scrollView.stopAutoScroll();
            scrollView.scrollToTop(time);
        }
    },

    //设置通用货币  xx万 或者 xx亿
    setCommonCurrenyLabel: function setCommonCurrenyLabel(node, count) {
        if (cc.isValid(node)) {
            var label = node.getComponent('CommonCurrencyLabel');
            if (label) {
                label.setContent(count);
            }
        }
    }

}, _defineProperty(_ComponentTools, 'setLabelColor', function setLabelColor(node, color) {
    if (cc.isValid(node)) {
        node.color = color;
    }
}), _defineProperty(_ComponentTools, 'getEditorString', function getEditorString(node) {
    if (cc.isValid(node)) {
        var editbox = node.getComponent(cc.EditBox);
        if (!!editbox) {
            return editbox.string;
        }
    }
    return '';
}), _defineProperty(_ComponentTools, 'setEditorString', function setEditorString(node, str) {
    if (cc.isValid(node)) {
        var editbox = node.getComponent(cc.EditBox);
        if (!!editbox) {
            editbox.string = str;
        }
    }
}), _defineProperty(_ComponentTools, 'setLabelOut', function setLabelOut(node, color, width) {
    if (cc.isValid(node)) {
        var labelOut = node.addComponent(cc.LabelOutline);
        labelOut.color = color;
        labelOut.width = width;
    }
}), _defineProperty(_ComponentTools, 'removeLineOut', function removeLineOut(node) {
    if (cc.isValid(node)) {
        var labelOut = node.removeComponent(cc.LabelOutline);
    }
}), _defineProperty(_ComponentTools, 'getEditBoxString', function getEditBoxString(node) {
    if (cc.isValid(node)) {
        var editBox = node.getComponent(cc.EditBox);
        if (editBox.string != editBox.placeholder) {
            return editBox.string;
        }
    }
    return null;
}), _defineProperty(_ComponentTools, 'getToggle', function getToggle(node) {
    if (cc.isValid(node)) {
        var toggle = node.getComponent(cc.Toggle);
        if (!!toggle) {
            return toggle.isChecked;
        }
    }
    return false;
}), _defineProperty(_ComponentTools, 'setToggleListener', function setToggleListener(node, func, host) {
    if (cc.isValid(node)) {
        node.on('toggle', function (e) {
            func && func.call(host, e.isChecked);
        });
    }
}), _defineProperty(_ComponentTools, 'setButtonInteractable', function setButtonInteractable(node, status) {
    if (cc.isValid(node)) {
        var button = node.getComponent(cc.Button);
        if (!!button) {
            button.interactable = status;
        }
    }
}), _defineProperty(_ComponentTools, 'getButtonInteractabel', function getButtonInteractabel(node) {
    if (cc.isValid(node)) {
        var button = node.getComponent(cc.Button);
        if (!!button) {
            return button.interactable;
        }
    }
    return true;
}), _defineProperty(_ComponentTools, 'setFlickerAction', function setFlickerAction(node, time, count) {
    if (cc.isValid(node)) {
        cc.log('开始闪烁了++++++++++++++');
        node.stopAllActions();
        node.runAction(cc.blink(time, count));
    }
}), _defineProperty(_ComponentTools, 'setHeartAction', function setHeartAction(node) {
    var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;
    var isStartBig = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var bigScale = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1.2;
    var smallScale = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0.9;

    if (cc.isValid(node)) {
        node.stopAllActions();
        var scaleBigAction = cc.scaleTo(time, bigScale, bigScale);
        var scaleSmallAction = cc.scaleTo(time, smallScale, smallScale);
        var action = isStartBig ? cc.sequence(scaleBigAction, scaleSmallAction) : cc.sequence(scaleSmallAction, scaleBigAction);
        node.runAction(cc.repeatForever(action));
    }
}), _defineProperty(_ComponentTools, 'setForEverMoveAction', function setForEverMoveAction(node) {
    var distance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
    var time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;
    var isStartBig = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    if (cc.isValid(node)) {
        node.stopAllActions();
        var pos = node.getPosition();
        var scaleBigAction = cc.moveTo(time, pos.x + distance, pos.y);
        var scaleSmallAction = cc.moveTo(time, pos.x, pos.y);
        var action = isStartBig ? cc.sequence(scaleBigAction, scaleSmallAction) : cc.sequence(scaleSmallAction, scaleBigAction);
        node.runAction(cc.repeatForever(action));
    }
}), _defineProperty(_ComponentTools, 'setLoopAction', function setLoopAction(node, callBack) {
    var axis = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'y';
    var distance = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5;
    var actionTime = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0.5;
    var duration = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 3;
    var isStartBig = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;

    if (cc.isValid(node)) {
        node.stopAllActions();
        var pos = node.getPosition();
        var scaleBigAction = axis === 'x' ? cc.moveTo(actionTime, pos.x + distance, pos.y) : cc.moveTo(actionTime, pos.x, pos.y + distance);
        var scaleSmallAction = cc.moveTo(actionTime, pos.x, pos.y);
        var action = isStartBig ? cc.sequence(scaleBigAction, scaleSmallAction) : cc.sequence(scaleSmallAction, scaleBigAction);
        var count = parseInt(duration / (actionTime * 2));
        node.runAction(cc.sequence(cc.repeat(action, count), cc.callFunc(function () {
            callBack && callBack();
        })));
    }
}), _defineProperty(_ComponentTools, 'setScaleBounce', function setScaleBounce(node, callBack) {
    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.1;
    var bduration = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.6;
    var bRadio = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1.8;

    if (cc.isValid(node)) {
        var bAction = cc.scaleTo(duration, bRadio, bRadio);
        var sAction = cc.scaleTo(bduration, 1, 1).easing(cc.easeBounceOut());
        node.runAction(cc.sequence(bAction, cc.delayTime(0.1), sAction, cc.callFunc(function () {
            callBack && callBack();
        })));
    }
}), _ComponentTools);
module.exports = ComponentTools;

cc._RF.pop();