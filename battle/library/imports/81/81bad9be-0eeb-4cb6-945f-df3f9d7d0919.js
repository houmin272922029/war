"use strict";
cc._RF.push(module, '81badm+DutMtpRf3z+dfQkZ', 'LoadingLayer');
// script/main/views/loading/LoadingLayer.js

'use strict';

// const ConfigManager = require('ConfigManager');
// const il8n = require('LanguageData');
var ResLoadManager = require('ResLoadManager');
var ViewManager = require('ViewManager');
// const Global = require('Global');
// const Alert = require('Alert');

cc.Class({
    extends: cc.Component,

    properties: {},

    // LIFE-CYCLE CALLBACKS:

    onLoad: function onLoad() {
        log.info('LoadingLayer.onLoad: is called');

        this.progressBar = null;
        this.percentLabel = null;
        this.tipLabel = null;
        this.showNetErrorNum = 0;
        this.completedCount = 0;
        this.lastCompletedCount = 0;
    },
    start: function start() {
        // this.initUI();
        // this.showTip();

        var self = this;
        this.scheduleOnce(function () {
            // 开始加载下一场景资源
            ResLoadManager.loadSceneRes(ViewManager.nextScene, { layer: self });
        }, 0);
        this.schedule(function () {
            // this.updateNetStatus();
        }, 3);
    },
    onDestroy: function onDestroy() {
        log.info('LoadingLayer.onDestroy: is called');
        // game.EventManager.dispatchEvent(Global.eventName.hideAlert, {});
        // this.netStatus && clearTimeout(this.netStatus);
        // this.refreshStatus && clearTimeout(this.refreshStatus);
        // ResLoader.reset();
    },


    // update (dt) {},

    // custom functions

    // initUI: function() {
    //     this.maskNode = this.node.getChildByName('mask');
    //     let vSize = cc.view.getVisibleSize(); 
    //     // this.maskNode.setContentSize(vSize.width, vSize.height);
    //     utils.matchBgSize(this.maskNode);

    //     this.progressBar = this.node.getChildByName('progressBar').getComponent(cc.ProgressBar);
    //     this.progressBar.progress = 0;

    //     this.percentLabel = this.progressBar.node.getChildByName('percentLabel').getComponent(cc.Label);
    //     this.percentLabel.string = 0;

    //     this.tipLabel = this.node.getChildByName('tipLabel').getComponent(cc.Label);
    //     this.tipLabel.string = '';

    //     this.node.getChildByName('tipLabel2').getComponent(cc.Label).string = il8n.t('loding_down');
    //     this.btnRestart = this.node.getChildByName('btnRestart');
    //     this.loadingNum = this.node.getChildByName('loadingNum').getComponent(cc.Label);

    //     this.dizuo = this.node.getChildByName('dizuo');
    //     this.arrow = this.node.getChildByName('arrow');
    //     this.dizuo.runAction(cc.repeatForever( cc.sequence(cc.scaleTo(0.33,1.2,1.2),cc.scaleTo(0.33,0.9,0.9)) ));
    //     this.arrow.runAction(cc.repeatForever( cc.sequence(cc.moveBy(0.33,cc.v2(0,-11)),cc.moveBy(0.33,cc.v2(0,11))) ));

    //     //强制刷新按钮ui
    //     this.refreshIcon = this.node.getChildByName('refreshIcon');
    //     this.gold = this.refreshIcon.getChildByName('gold');
    //     this.eyelight = this.refreshIcon.getChildByName('eyelight');
    //     this.eyeright = this.refreshIcon.getChildByName('eyeright');
    // },

    // showTip: function() {
    //     let confLoading = [];
    //     let cfg = ConfigManager.dataMap.Loading;
    //     for (let i = 0; i < cfg.length; i++) {
    //         let element = cfg[i];
    //         if(element.Opportunity.split(',').indexOf(Global.opportunity + "") != -1){
    //             confLoading.push(element);
    //         }
    //     }

    //     let tipIndex = Math.floor(Math.random() * (confLoading.length - 1));
    //     let item = confLoading[tipIndex];
    //     if (item && this.tipLabel) {
    //         this.tipLabel.string = item.tip;
    //     }
    // },

    // // 点击更换一条tip
    // onBtnMask: function(event, eventData) {
    //     this.showTip();
    // },

    // 更新UI上的显示进度
    // progress - 实际进度（0-1的浮点数）
    // percent - 百分比进度（0-100的整数）
    updatePercent: function updatePercent(progress, percent) {
        // this.progressBar.progress = progress;
        // this.percentLabel.string = percent;
    }

    // // 刷新下载文件数量
    // updateCompletedCount : function(count){
    //     this.completedCount = count;
    //     this.isCheckNetStatus = (cc.sys.isBrowser || CC_WECHATGAME) ? true : false;
    //     this.loadingNum.string = 'ceshi测试下载数量：'+count;
    // },

    // // 刷新网络状态
    // updateNetStatus : function(){
    //     if(this.completedCount == this.lastCompletedCount){
    //         let confGlobalPar = ConfigManager.dataMap.GlobalPar;
    //         let timeArr = confGlobalPar[56].value.split(',');
    //         let time1 = parseInt(timeArr[this.showNetErrorNum]);
    //         let time2 = parseInt(confGlobalPar[57].value);
    //         this.netStatus && clearTimeout(this.netStatus);
    //         this.isCheckNetStatus = false;
    //         this.netStatus = setTimeout(()=>{
    //             this.showNetErrorNum++;
    //             if(this.showNetErrorNum>2){
    //                 this.showNetErrorNum = 2;
    //             }

    //             this.netStatus && clearTimeout(this.netStatus);
    //             Alert.show(il8n.t('loadingStopTips'), function () {
    //                 this.updateNetStatus();
    //             }.bind(this), false);
    //         }, time1*1000);

    //         if(!this.btnRestart.active){
    //             this.refreshStatus && clearTimeout(this.refreshStatus);
    //             this.refreshStatus = setTimeout(()=>{
    //                 this.updateRefreshStatus(true);
    //             }, time2*1000);
    //         }
    //     } else {
    //         game.EventManager.dispatchEvent(Global.eventName.hideAlert, {});
    //         this.netStatus && clearTimeout(this.netStatus);
    //         this.refreshStatus && clearTimeout(this.refreshStatus);
    //         this.updateRefreshStatus(false);
    //     }
    //     this.lastCompletedCount = this.completedCount;
    // },

    // // 刷新按钮的显示逻辑
    // updateRefreshStatus : function(status){
    //     this.btnRestart.stopAllActions();
    //     this.btnRestart.active = status;
    //     this.refreshIcon.active = status;
    //     // this.btnRestart.runAction(cc.repeatForever( cc.sequence(cc.scaleTo(0.33,1.2,1.2),cc.scaleTo(0.33,0.9,0.9)) ));
    // },

    // // 弹出网络延迟弹窗
    // onBtnCloseGame : function(){
    //     this.refreshAction();

    // },

    // // 强制按钮逻辑动画
    // refreshAction : function( ) {

    //     this.gold.active = true;
    //     this.gold.opacity = 255;
    //     this.gold.runAction(cc.sequence( cc.rotateBy(1, -360),cc.fadeOut(0.1),cc.callFunc(()=>{
    //         Alert.show(il8n.t('loadingStopRefresh'), function () {
    //             if(CC_WECHATGAME){
    //                 wx.exitMiniProgram();
    //             } else if(cc.sys.isBrowser){
    //                 window.location.reload();
    //             }
    //         }.bind(this), true,()=>{
    //             this.netStatus && clearTimeout(this.netStatus);
    //             this.refreshStatus && clearTimeout(this.refreshStatus);
    //             this.isCheckNetStatus = (cc.sys.isBrowser || CC_WECHATGAME) ? true : false;
    //         }, 0, true);
    //     }) ) );
    //     this.eyelight.runAction(cc.rotateBy(1, -360) );
    //     this.eyeright.runAction(cc.rotateBy(1, -360) );
    // },
});

cc._RF.pop();