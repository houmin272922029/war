(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/main/data/FishFrameData.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'a4e8d8IIZNKMJ5wvkMJmwz2', 'FishFrameData', __filename);
// script/main/data/FishFrameData.js

"use strict";

var FishFrameData = {

    state: 0,
    frame: 0,
    fishFrame: 0,
    skillEndFrame: 0, // 美人鱼技能结束帧
    canShowSkill: false, // 是否触发伤害技能
    newGroups: [],

    reset: function reset() {
        this.newGroups = [];
    },

    init: function init() {
        this.reset();
    }

};

module.exports = FishFrameData;

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
        //# sourceMappingURL=FishFrameData.js.map
        