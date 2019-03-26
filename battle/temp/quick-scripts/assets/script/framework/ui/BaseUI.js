(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/ui/BaseUI.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '64a0eokzyRKuaH4TApLluP9', 'BaseUI', __filename);
// script/framework/ui/BaseUI.js

'use strict';

var ViewManager = require('ViewManager');
var ConfigManager = require('ConfigManager');
var AudioManager = require('AudioManager');
var Global = require('Global');

cc.Class({
    extends: cc.Component,

    ctor: function ctor() {
        this.parentLayer = ViewManager.getUILayerFromScene();
        this.maskOpacity = 175;
    },


    setClickOtherClose: function setClickOtherClose(isClose) {
        this.clickOther = isClose;
    },

    setData: function setData(data) {
        this.data = data;
    },

    moduleBGShow: function moduleBGShow() {
        // 通用弹板 音效
        AudioManager.playEffect(Global.simpleTipEffect);
        Global.simpleTipEffect = "tongyong_tanban";
        var bg = this.node.getChildByName('modalbg');
        var visibleSize = cc.view.getVisibleSize();
        bg.setContentSize(visibleSize.width, visibleSize.height);
        if (cc.isValid(bg)) {
            bg.opacity = 0;
            this.maskOpacity = this.maskOpacity ? this.maskOpacity : 175;
            bg.runAction(cc.sequence(cc.delayTime(0.3), cc.fadeTo(0.01, this.maskOpacity)));
            if (this.clickOther) {
                bg.on(cc.Node.EventType.TOUCH_END, this.closeByClickOther, this);
            }
        }
    },
    //关闭面板时 先隐藏按钮
    hideCloseBtn: function hideCloseBtn() {
        var btnClose = this.node.getChildByName('btnClose');
        if (cc.isValid(btnClose)) {
            btnClose.opacity = 0;
        }
    },

    onShow: function onShow(prefab, data) {
        var self = this;
        this.inData = data;
        ViewManager.showUI({
            prefab: prefab,
            parent: self.parentLayer,
            action: game.Types.ActionType.Jump
        });
        this.moduleBGShow();
    },

    onClose: function onClose(config) {
        var bg = this.node.getChildByName('modalbg');
        if (cc.isValid(bg)) {
            bg.opacity = 0;
        }
        this.hideCloseBtn();
        game.EventManager.targetOff(this);
        this.node.stopAllActions();
        this.node.targetOff(this.node);
        this.unscheduleAllCallbacks();
        var self = this;
        Global.simpleBtnEffect = config && config.simpleBtnEffect ? config.simpleBtnEffect : "tongyong_quxiao";
        ViewManager.hideUI({ uuid: self.node.uuid, action: game.Types.ActionType.Jump });
    },

    closeByClickOther: function closeByClickOther(event) {
        var rect = this.node.getBoundingBox();
        var clickPos = event.getLocation();
        var visibleSize = cc.view.getVisibleSize();
        clickPos.x = clickPos.x - visibleSize.width / 2;
        clickPos.y = clickPos.y - visibleSize.height / 2;
        if (!rect.contains(clickPos)) {
            this.onClose();
        } else {
            this.clickContainer();
        }
    },

    clickContainer: function clickContainer() {}

    // update (dt) {},
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=BaseUI.js.map
        