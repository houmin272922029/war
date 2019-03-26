"use strict";
cc._RF.push(module, '88620FjvKZGxadIC6h8MoOw', 'Login');
// script/main/views/login/Login.js

'use strict';

//登录逻辑
var ViewManager = require('ViewManager');

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad: function onLoad() {},
    start: function start() {},


    initComplete: function initComplete() {
        // body...
    },

    onBtnLogin: function onBtnLogin() {
        ViewManager.loadScene(ViewManager.SceneInfo.Hall);
    }
});

cc._RF.pop();