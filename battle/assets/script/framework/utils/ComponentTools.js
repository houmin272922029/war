const il8n = require('LanguageData');
const FuncTools = require('FuncTools');
let ComponentTools = {
    //多语言赋值
    //langKey 多语言key
    //funName 功能名称
    //force 是否强制渲染文本
    labelStringByLang: function(node,langKey,langValue,funName,force){
        let langStr = null;
        if (!!funName) {
            if (FuncTools.getFuncStatus(funName)) {
                langStr = il8n.t(langKey+'-f',langValue);
                cc.log('没有该功能对应的langKey+++++++++++++++++++++++++++++++++++++');
            } else {
                langStr = il8n.t(langKey,langValue);
            }
        } else {
            langStr = il8n.t(langKey,langValue);
        }
        this.labelString(node,langStr,force);
        return langStr;
    },

    richStringByLang: function(node,langKey,langValue,funName){
        let langStr = null;
        if (!!funName) {
            if (FuncTools.getFuncStatus(funName)) {
                langStr = il8n.t(langKey+'-f',langValue);
                cc.log('richText没有该功能对应的langKey+++++++++++++++++++++++++++++++++++++');
            } else {
                langStr = il8n.t(langKey,langValue);
            }
        } else {
            langStr = il8n.t(langKey,langValue);
        }
        this.richLabelString(node,langStr);
        return langStr;
    },

    //对文本赋值
    labelString: function(node,text,force){
        if (cc.isValid(node)) {
            let label = node.getComponent(cc.Label);
            if (label) {
                label.string = text;
            }
            if (force) {
                label._updateRenderData(true);
            }
            
        }
    },
    getLabelString: function(node) {
        if (cc.isValid(node)) {
            let label = node.getComponent(cc.Label);
            if (!!label) {
                return label.string;
            }
        }
        return '';
    },

    setLabelSize: function(node,size){
        if (cc.isValid(node)) {
            let label = node.getComponent(cc.Label);
            if (!!label) {
                label.fontSize = size;
            }
        }
    },

    setLabelColor: function(node,color){
        if (cc.isValid(node)) {
            // let label = node.getComponent(cc.Label);
            // if (label) {
            //     label.color = color;
            // }
            node.color = color;
        }
    },
    //对富文本进行赋值
    richLabelString: function(node,text,lineHeight){
        if (cc.isValid(node)) {
            let label = node.getComponent(cc.RichText);
            if (label) {
                if (!!lineHeight && lineHeight > 0) {
                    label.lineHeight = lineHeight;
                }
                label.string = text;
            }
        }
    },
    //拥有纹理时直接赋值
    spriteFrame: function(node,spriteFrame){
        if (cc.isValid(node)) {
            let sprite = node.getComponent(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = spriteFrame;
            }
        }
    },

    getSpriteFrame: function(node){
        if (cc.isValid(node)) {
            let sprite = node.getComponent(cc.Sprite);
            if (sprite) {
                return sprite.spriteFrame;
            }
        }
        return null;
    },

    clearSpriteFrame: function(node){
        if (cc.isValid(node)) {
            let sprite = node.getComponent(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = null;
            }
        }
    },

    //获得节点
    getChildByName: function(node,name){
        if (!cc.isValid(node)){
            return null;
        }
        let childNode = node.getChildByName(name);
        return childNode;
    },

    //获得scrollView 并滑动到指定位置
    getScrollViewAndScroll: function(node,x,y){
        let scrollView = node.getComponent(cc.ScrollView);
        if (scrollView) {
            scrollView.stopAutoScroll();
            scrollView.scrollToOffset(cc.v2(x, y), 0);
        }
        return scrollView;
    },

    //滑动到顶部
    getScrollViewAndScrollTop : function(node,time=0) {
        let scrollView = node.getComponent(cc.ScrollView);
        if (scrollView) {
            scrollView.stopAutoScroll();
            scrollView.scrollToTop(time);
        }
    },

    //设置通用货币  xx万 或者 xx亿
    setCommonCurrenyLabel: function(node,count){
        if (cc.isValid(node)) {
            let label = node.getComponent('CommonCurrencyLabel');
            if (label) {
                label.setContent(count);
            }
        }
    },

    setLabelColor: function(node,color){
        if (cc.isValid(node)) {
            node.color = color;
        }
    },

    getEditorString: function(node){
        if (cc.isValid(node)) {
            let editbox = node.getComponent(cc.EditBox);
            if (!!editbox) {
                return editbox.string;
            }
        }
        return '';
    },

    setEditorString: function(node,str){
        if (cc.isValid(node)) {
            let editbox = node.getComponent(cc.EditBox);
            if (!!editbox) {
                editbox.string = str;
            }
        }
    },

    //设置文字描边
    setLabelOut: function(node,color,width){
        if (cc.isValid(node)) {
            let labelOut = node.addComponent(cc.LabelOutline);
            labelOut.color = color;
            labelOut.width = width;
        }
    },

    //移除描边
    removeLineOut: function(node){
        if (cc.isValid(node)) {
            let labelOut = node.removeComponent(cc.LabelOutline);
            
        }
    },

    //获得输入框的内容
    getEditBoxString: function(node){
        if (cc.isValid(node)) {
            let editBox = node.getComponent(cc.EditBox);
            if (editBox.string != editBox.placeholder) {
                return editBox.string;
            }
        }
        return null;
    },

     //获得checkbox的选择状态
     getToggle: function(node){
        if (cc.isValid(node)) {
            let toggle = node.getComponent(cc.Toggle);
            if (!!toggle) {
                return toggle.isChecked;
            }
        }
        return false;
    },

    setToggleListener: function(node,func,host){
        if (cc.isValid(node)) {
            node.on('toggle',(e)=>{
                func && func.call(host,e.isChecked);
            })
        }
    },

    setButtonInteractable: function(node,status){
        if (cc.isValid(node)) {
            let button = node.getComponent(cc.Button);
            if (!!button) {
                button.interactable = status;
            }
        }
    },

    getButtonInteractabel: function(node){
        if (cc.isValid(node)) {
            let button = node.getComponent(cc.Button);
            if (!!button) {
                return button.interactable;
            }
        }
        return true;
    },

    //闪烁Action 
    setFlickerAction: function(node,time,count){
        if (cc.isValid(node)) {
            cc.log('开始闪烁了++++++++++++++');
            node.stopAllActions();
            node.runAction(cc.blink(time,count));
        }
    },

    //heartAction 心跳
    setHeartAction: function(node,time=0.5,isStartBig=false,bigScale = 1.2,smallScale = 0.9){
        if (cc.isValid(node)) {
            node.stopAllActions();
            let scaleBigAction = cc.scaleTo(time,bigScale,bigScale);
            let scaleSmallAction = cc.scaleTo(time,smallScale,smallScale);
            let action =  isStartBig ? cc.sequence(scaleBigAction,scaleSmallAction) : cc.sequence(scaleSmallAction,scaleBigAction)
            node.runAction(cc.repeatForever(action));
        }
    },

    //某个方向循环移动 TODO 现在只有左右方向
    //distance循环移动的距离
    setForEverMoveAction: function(node,distance=5,time = 0.5,isStartBig=false){
        if (cc.isValid(node)) {
            node.stopAllActions();
            let pos = node.getPosition();
            let scaleBigAction = cc.moveTo(time,pos.x + distance, pos.y);
            let scaleSmallAction = cc.moveTo(time,pos.x, pos.y);
            let action =  isStartBig ? cc.sequence(scaleBigAction,scaleSmallAction) : cc.sequence(scaleSmallAction,scaleBigAction)
            node.runAction(cc.repeatForever(action));
        }
    },

    //循环移动 播放指定时间
    setLoopAction: function(node,callBack,axis='y', distance=5,actionTime=0.5,duration=3,isStartBig=false){
        if (cc.isValid(node)) {
            node.stopAllActions();
            let pos = node.getPosition();
            let scaleBigAction = axis === 'x' ? cc.moveTo(actionTime,pos.x + distance, pos.y) : cc.moveTo(actionTime,pos.x, pos.y + distance);
            let scaleSmallAction = cc.moveTo(actionTime,pos.x, pos.y);
            let action =  isStartBig ? cc.sequence(scaleBigAction,scaleSmallAction) : cc.sequence(scaleSmallAction,scaleBigAction);
            let count = parseInt(duration / (actionTime * 2));
            node.runAction(cc.sequence(cc.repeat(action,count),cc.callFunc(function(){
                callBack&&callBack();
            })));
        }
    },

    //缩放显示回弹
    setScaleBounce: function(node,callBack,duration=0.1,bduration=0.6, bRadio=1.8){
        if(cc.isValid(node)) {
            let bAction = cc.scaleTo(duration,bRadio,bRadio);
            let sAction = cc.scaleTo(bduration,1,1).easing(cc.easeBounceOut());
            node.runAction(cc.sequence(bAction,cc.delayTime(0.1),sAction,cc.callFunc(function(){
                callBack&&callBack();
            })));
        }
    },
    
}
module.exports = ComponentTools;