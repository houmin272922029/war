(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/main/views/login/Login.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '88620FjvKZGxadIC6h8MoOw', 'Login', __filename);
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
        //# sourceMappingURL=Login.js.map
        