"use strict";
cc._RF.push(module, 'a4e8d8IIZNKMJ5wvkMJmwz2', 'FishFrameData');
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