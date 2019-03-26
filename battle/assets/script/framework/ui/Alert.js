//Alert 弹窗
const BaseUI = require('BaseUI');
const UIManager = require('UIManager');
const ResManager = require('ResManager');
const ComponentTools = require('ComponentTools');
const ViewManager = require('ViewManager');
cc.Class({
    extends: BaseUI,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:
    statics: {
        show: function (content, onok, needcancel, oncancel, lineHeight = 33) {
            let alertData = { content, onok, needcancel, oncancel, lineHeight };
            UIManager.showUI(ResManager.prefabURL.alert, alertData);
        }
    },

    onLoad: function () {
        this.parentLayer = ViewManager.getPopLayerFromScene();
        this._bgSprite = this.node.getChildByName("public_frame_a");                   // 背景图片
        this._content = cc.find('content/richText', this.node)                         // 提示的内容 label
        this._btnOK = this.node.getChildByName("btn_ok");                              // 确定按钮
        this._btnCancel = this.node.getChildByName("btn_cancel");                      // 取消按钮
    },


    onShow: function (prefab, data) {
        this._super(prefab, data);
        this.show(data.content, data.onok, data.needcancel, data.oncancel, data.lineHeight);
    },

    /** 按钮点击 回调 */
    onBtnClicked: function (event, data) {
        if (parseInt(data) === 0) {
            if (this._onok) {
                this._onok();
            }
            this.onClose({ simpleBtnEffect: "tongyong_anniudianji" });
        } else {
            if (this._oncancel) {
                this._oncancel();
            }
            this.onClose();
        }
    },

    /**
     *  弹窗显示
     * @param content 内容
     * @param onok 确定按钮 回调函数
     * @param needcancel 是否需要 取消按钮
     * @param oncancel 取消按钮 回调函数
     */
    show: function (content, onok, needcancel, oncancel, lineHeight) {
        this._onok = onok;
        ComponentTools.richLabelString(this._content, content, lineHeight);
        if (needcancel) {
            this._btnCancel.active = true;
            this._btnOK.x = this._bgSprite.width * 0.25;
            this._btnCancel.x = -this._bgSprite.width * 0.25;
            if (oncancel) {
                this._oncancel = oncancel;
            }
        }
        else {
            this._btnCancel.active = false;
            this._btnOK.x = 0;
        }
    },

    // update (dt) {},
});
