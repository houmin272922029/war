(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/utils/GameInit.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'b2f1bifDOpJypwBchbzfPFn', 'GameInit', __filename);
// script/framework/utils/GameInit.js

'use strict';

/**
 * 因为pop()，逆向遍历，注意初始化顺序
 */
var allParts = [
// 'UIWaiting',
// 'TrackMgr',
'NetManager', 'PrefabManager', 'SpriteManager', 'SpineManager', 'AnimManager', 'ConfigManager', 'SpriteHook'];

//微信小游戏 作用域问题
if (CC_WECHATGAME) {
    window.proto = {};
    proto.proto = {};
    proto.message = {};
    proto.message.DVector2 = {};
    proto.message.DVector3 = {};
}

var GameInit = {
    /**
     * 加载游戏模块
     * @param {*加载成功回调} callback 
     */
    loadModule: function loadModule(callback) {
        var _this = this;

        var now = Date.now();
        var part = allParts.pop();
        require(part).init(function () {
            log.info('module ({}) is loaded, time:{}', part, Date.now() - now);
            if (allParts.length > 0) {
                _this.loadModule(callback);
            } else {
                if (callback) {
                    callback();
                }
            }
        });
    },

    /**
     * 初始化游戏
     * @param {*初始化成功回调} callback 
     */
    init: function init(callback) {
        if (!!this.bInited) {
            if (callback) {
                callback();
            }
        } else {
            this.loadModule(callback);
            this.bInited = true;
        }
    }
};

module.exports = GameInit;

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
        //# sourceMappingURL=GameInit.js.map
        