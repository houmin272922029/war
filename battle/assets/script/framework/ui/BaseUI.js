const ViewManager = require('ViewManager');
const ConfigManager = require('ConfigManager');
const AudioManager = require('AudioManager');
const Global = require('Global');

cc.Class({
    extends: cc.Component,
    
    ctor() {
        this.parentLayer = ViewManager.getUILayerFromScene();
        this.maskOpacity = 175;
    },

    setClickOtherClose: function(isClose){
        this.clickOther = isClose;
    },

    setData: function(data){
        this.data = data;
    },

    moduleBGShow: function(){
        // 通用弹板 音效
        AudioManager.playEffect(Global.simpleTipEffect);
        Global.simpleTipEffect = "tongyong_tanban";
        let bg = this.node.getChildByName('modalbg');
        let visibleSize =  cc.view.getVisibleSize(); 
        bg.setContentSize(visibleSize.width, visibleSize.height);
        if (cc.isValid(bg)) {
            bg.opacity = 0;
            this.maskOpacity = this.maskOpacity ? this.maskOpacity : 175;
            bg.runAction(cc.sequence(cc.delayTime(0.3),cc.fadeTo(0.01,this.maskOpacity)));
            if (this.clickOther) {
                bg.on(cc.Node.EventType.TOUCH_END,this.closeByClickOther,this);    
            }
            
        }
        
    },
    //关闭面板时 先隐藏按钮
    hideCloseBtn: function(){
        let btnClose =  this.node.getChildByName('btnClose');
        if (cc.isValid(btnClose)) {
            btnClose.opacity = 0;
        }
    },

    onShow: function(prefab,data){
        let self = this;
        this.inData = data;
        ViewManager.showUI({
            prefab: prefab,
            parent: self.parentLayer,
            action: game.Types.ActionType.Jump
        });
        this.moduleBGShow();
    },

    onClose: function(config) {
        let bg = this.node.getChildByName('modalbg');
        if (cc.isValid(bg)) {
            bg.opacity = 0;
        }
        this.hideCloseBtn();
        game.EventManager.targetOff(this);
        this.node.stopAllActions();
        this.node.targetOff(this.node);
        this.unscheduleAllCallbacks();
        let self = this;
        Global.simpleBtnEffect = (config && config.simpleBtnEffect) ? config.simpleBtnEffect: "tongyong_quxiao";
        ViewManager.hideUI({uuid: self.node.uuid,action: game.Types.ActionType.Jump});
    },
    

    closeByClickOther: function(event){
        let rect = this.node.getBoundingBox();
        let clickPos = event.getLocation();
        let visibleSize =  cc.view.getVisibleSize(); 
        clickPos.x = clickPos.x - visibleSize.width/2;
        clickPos.y = clickPos.y - visibleSize.height/2;
        if (!rect.contains(clickPos)) {
            this.onClose();
        } else {
            this.clickContainer();
        }
        
    },

    clickContainer: function(){

    },

    // update (dt) {},
});



