let FishFrameData = {

    state: 0,
    frame: 0,
    fishFrame: 0,
    skillEndFrame: 0, // 美人鱼技能结束帧
    canShowSkill: false,    // 是否触发伤害技能
    newGroups: [],

    reset: function () {
        this.newGroups = [];
    },

    init: function () {
        this.reset();
    }

}

module.exports = FishFrameData;
