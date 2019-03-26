(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/utils/Types.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'af0f5GYVyZBmYdC25jrfzgp', 'Types', __filename);
// script/framework/utils/Types.js

"use strict";

window.game || (window.game = {});

game.Types = {};

game.Types.Direction = cc.Enum({
    top: 0,
    bottom: 1,
    left: 2,
    right: 3,
    horizontal: 4, //水平
    vertical: 5 //垂直
});

game.Types.MessageBoxType = cc.Enum({
    message: 0, //确定
    select: 1 //确定 + 取消
});

game.Types.UICallBackType = cc.Enum({
    cancel: 0,
    confirm: 1,
    boost: 2,
    back: 3,
    create: 4,
    jumpto: 5
});

game.Types.ActionType = cc.Enum({
    None: 0,
    Fade: 1,
    Jump: 2,
    Default: 3
});

game.Types.ShowType = cc.Enum({
    ShowByNode: 0,
    ShowByLayer: 1
});

game.Types.AudioType = cc.Enum({
    Effect: 0,
    BgSound: 1,
    ShowVoice: 2
});

game.Types.Language = cc.Enum({
    ZH: 0,
    EN: 1
});

game.Types.LandClickType = cc.Enum({
    Normal: 0,
    Build: 1,
    Move: 2,
    Trade: 3
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
        //# sourceMappingURL=Types.js.map
        