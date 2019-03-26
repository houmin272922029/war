//登录逻辑
const ViewManager = require('ViewManager');

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad () {

    },

    start () {

    },

    initComplete: function () {
        // body...
    },

    onBtnLogin:function() {
        ViewManager.loadScene(ViewManager.SceneInfo.Hall);
    }
});
