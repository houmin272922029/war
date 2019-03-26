(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/main/data/Global.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'a0c54n8S91O5Kdvq6jIKM06', 'Global', __filename);
// script/main/data/Global.js

'use strict';

//定义游戏的全局参数和结构体
var CodeType = {
    gameName1: 0,
    gameName2: 1,

    IsGame1: function IsGame1() {
        return require('CodeType') === this.gameName1;
    },

    IsGame2: function IsGame2() {
        return require('CodeType') === this.gameName2;
    }
};

//场景名称
var url = "http://101.200.49.234:8103/out";
var decodeUserInfoUrl = "http://101.200.49.234:8103/decodeUserInfo";
var platformType = "wx_fish";
var isHttpsWss = false;
var isSkillChangeItems = false;

var SkillItemId = cc.Enum({
    SuoDing: 1001, // 锁定
    BingDong: 1002, // 冰冻
    KuangBao: 1003, // 狂暴
    ZhaoHuan: 1004 // 召唤
});

var weaponBottomLogicPos = [cc.v2(76.566, 5.555), cc.v2(23.433, 5.555), cc.v2(23.43, 94.444), cc.v2(76.566, 94.444)];
var weaponLogicPos = [cc.v2(74.925, 3.194), cc.v2(24.839, 3.194), cc.v2(25.071, 96.805), cc.v2(75.082, 96.805)];

//debug调整
var localbulletData = {
    speed: 120, //子弹速率
    duration: 200, //时间间隔
    standardSpeed: 1536, //子弹速率
    PI: 0.017453293 //（2PI/360）


    // 状态栏高度
};var statusBarHeight = 20;

//客户端版本号
var clientVersion = 20180115;

//data
var userSeats = []; //房间内玩家的位置信息
var specialBulletArr = [[], [], [], []];
var arenaScoreFrame = []; //竞技场每一次金币掉落，记录积分变动
var catchFishFrame = [[], [], [], []]; //用户每帧的金币变化幅度 
var catchFishDiamond = [[], [], [], []]; //

var KBBoxCollisionData = ["0,45,20,20", "0,45,20,20", "0,45,20,20"];
var weaponBarrelNum = [1, 2, 3, 1, 2, 2, 1, 1, 2, 2, 1, 2];
var bulletBirth = [];
var bulletRealPos = [];
var bulletBirthParentNode = [];

var myselfPos = -1;
var localMySelfPos = -1;
var playerNums = 4;
var bulletIdSection = [[0, 10000], [10000, 20000], [20000, 30000], [30000, 40000]]; //玩家子弹id的生成区间
var FacaijinCd = 0; //发财金奖励的时间戳
var getFacaijinTimes = 0; //发财金的领取次数
var isRealyPoChan = false; //真的破产
var standSunTime = 0; // 客户端与服务器之间时间的差值
var roomLevel = [1, 30, 300, 1000, 100]; //房间类型对应炮倍率
var selfFireSwitch = true; //当前玩家的开火的开关
var maxCannonLevel = 10000; //最大开火炮倍
var autolevel = 25; //25级以上为手动解锁读取配置
var showUnlockTip = false;
var unLockRewardNum = 0; //炮解锁奖励
var palaceData = {}; //国王宝藏数据
var inCardGame = false; //当前玩家是否处于小游戏中
var inTaskReward = false; //当前玩家是否处于悬赏任务中
var inTaskUnlock = false; //悬赏任务期间解锁30倍炮
var inMinTime = false; //悬赏任务最后30秒进入
var inArenaTask = false; //竞技场幸运积分
var netDelayTime = 0; //网络延迟
var isQuickRefesh = false; //立即刷新 针对GM 测试
var curframeCatch = 0; //当前帧是否有捕获
var arenaBaseInfo = {};
var levelUpList = { 'moneys': [], 'diamonds': [], 'items': [] }; //升级道具落位后刷新
var opportunity = 1; // 1进入渔场、2进入大厅、3进入竞技场
var isMatch = false; //是否开启话费赛
var isEnterFish = false; //是否正在进入渔场
var simpleBtnEffect = "tongyong_anniudianji"; //按钮点击 音效
var simpleTipEffect = "tongyong_tanban"; //通用弹窗 音效
var gameHide = false;

var designSize = {
    width: 1280,
    height: 720
};

//ui
var curRoomLevel = 1;

//config
var weaponUnLockConfig = []; //炮倍配置文件
var weaponUnLockList = [];
var compenGoldConf = []; //发财金补助
var globalParConf = []; //补偿金公式参数配置
var FaCaiJinAdd = false; //发财金显示期间（破产中）
var curLevelIsLock = false; //是否处于未解锁的状态下
var hasCardGame = false; //是否拥有卡牌
var flyCardIng = false; //卡牌掉落过程中不允许点击小游戏按钮
var curCardGame = -1; //卡牌游戏类型


//游戏内事件分发的消息名(网络相关)
var MsgMarco = {
    newUserEnter: "newUserEnter",
    receiveToFire: "receiveToFire",
    catchFish: "catchFish",
    unlockNewLevel: "unlockNewLevel",
    adjustLevel: "adjustLevel", //调整炮倍
    logToDebugUI: "logToDebugUI", // 显示日志输出到Debug窗口
    debugShowFishInfo: "debugShowFishInfo",
    leaveRoom: "leaveRoom",
    loadingProgress: "loadingProgress",
    BigWinEvent: "BigWinEvent",
    UseSkill: "UseSkill",
    FireBorast: "FireBorast",
    updateMoney: "updateMoney",
    rewardTask: "rewardTask",
    refreshTaskCatch: "refreshTaskCatch", //悬赏任务的捕获刷新
    haveTask: "haveTask", //存在在线任务
    couponCount: "couponCount", //更新月神赐福月亮石数量
    coupon: "coupon", //更新月神赐福ui状态
    couponFly: "couponFly", //奖券(月亮石)飞的动画 
    couponFlyOther: "couponFlyOther", //奖券(月亮石)飞的动画 
    bossArrive: "bossArrive", //boss来袭
    MiniCardGame: "MiniCardGame", //小游戏开始
    cardGameEnd: "cardGameEnd", //小游戏结束
    roomBroadcast: "roomBroadcast", //渔场其他人的广播
    removeFishes: "removeFishes", //关联死亡的鱼
    specialFish: "specialFish", //炸弹 特殊鱼
    mianRightByBless: "mianRightByBless", //赐福页面刷新mainright页面
    userInfo: "userInfo", //刷新用户信息
    socketStatus: 'socketStatus', //socket连接状态
    arenaFrameUpdata: "arenaFrameUpdata", //竞技场帧消息刷新
    arenaOtherFrameUpdate: "arenaOtherFrameUpdate",
    arenaQuest: "arenaQuest", //竞技场幸运积分
    noticeNew: "noticeNew", //收到新公告
    matchInfo: "matchInfo", //话费赛初始化
    matchRank: "matchRank", //话费赛排行榜
    matchBalloon: "matchBalloon", //话费赛气球变化
    matchFinish: "matchFinish", //话费赛结算
    dunker: "dunker", //潜艇 
    superWeaponState: "superWeaponState"
};

//不同layer之间的相互 通知
var eventName = {
    buyDiamondTip: "buyDiamondTip",
    useAutoSkill: "useAutoSkill",
    lockFire: "lockFire",
    skillOver: "skillOver",
    showSkillTip: "showSkillTip",
    showSkillAnim: 'showSkillAnim',
    changeLevel: "changeLevel",
    createNewFish: 'createNewFish',
    newFishGroups: "newFishGroups",
    refreshHall: "refreshHall",
    weaponClick: "weaponClick",
    unLockTip: "unLockTip",
    autoChangeLevel: "autoChangeLevel",
    aftershop: "aftershop",
    judgeUnlock: "judgeUnlock",
    changeWeaponArm: "changeWeaponArm",
    cancleFacaijin: "cancleFacaijin",
    ItemData: "ItemData",
    refreshBag: "refreshBag",
    playerItemsChange: "playerItemsChange",
    cardGame: "cardGame",
    CardReward: "CardReward",
    startZhaoHuanAnim: "startZhaoHuanAnim",
    startXFDAnim: "startXFDAnim",
    activeState: "activeState",
    ClientActive: "ClientActive",
    showCardDown: "showCardDown",
    selectWeapon: 'selectWeapon', //选择武器d
    specialHit: "specialHit",
    showDropItem: "showDropItem",
    enterRoom: 'enterRoom', //进入房间
    canNotEnterRoom: 'canNotEnterRoom', //房间不能进入提示
    specialFishAward: 'specialFishAward', //特殊鱼奖励
    interTime: 'interTime', //整点时间通知
    loginPop: 'loginPop', //登录弹窗
    redPointStatus: 'redPointStatus', //红点状态发生变化
    refreshRank: 'refreshRank', //更新悬赏任务排名
    signSucess: 'signSucess', //签到成功
    shopBuySucess: 'shopBuySucess', //商品购买成功
    MusicMainScene: 'MusicMainScene', //渔场BGM
    hideReconnect: 'hideReconnect', //关闭重连效果
    updateGemsNum: "updateGemsNum", //更新玩家的钻石
    closeRewardBoard: "closeRewardBoard", //关闭通用奖励弹窗
    refreshMainSceneRes: "refreshMainSceneRes", //更新渔场内用户数据(针对 钻石金币及时刷新 self)
    mailClick: "mailClick", //选择邮件
    syncMoney: "syncMoney", //同步金币刷新
    arenaLuckQuest: "arenaLuckQuest", //刷新
    arenaResult: 'arenaResult', //竞技场的结算
    arenaSkillOpen: 'arenaSkillOpen', //竞技场开关  
    rightBtnAction: "rightBtnAction", //渔场右侧按钮弹出消息
    rightBtnChange: "rightBtnChange", //右侧按钮切换状态
    leftBtnChange: "leftBtnChange", //左侧按钮切换状态
    updateMatchRank: "updateMatchRank", //刷新话费赛左侧排行榜信息
    updateMatchStatus: "updateMatchStatus", //刷新话费赛顶部状态
    updateMatchTops: "updateMatchTops", //刷新话费赛顶部信息
    WelcomeContinue: "WelcomeContinue", //话费赛炮口提示
    dunkerSuccess: "dunkerSuccess", //炮口护航成功
    matchTipsEvent: "matchTipsEvent", //话费赛欢迎tips
    BanIce: "BanIce", //禁止冰冻
    HoodBelong: "HoodBelong", //占领潜艇
    virtualBossPos: 'virtualBossPos', //boss分身死亡点
    virtualBossBorn: 'virtualBossBorn', //boss分身出生
    virtualBossDie: 'virtualBossDie', //boss分身死亡
    virtualFishDie: 'virtualFishDie', //分身死亡
    realFishDie: 'realFishDie', //真身死亡
    bossSkillTip: 'bossSkillTip', //boss技能提示
    hoodHeadAction: 'hoodHeadAction' //占领游艇头像动画
};

var touchEvent = {
    touchStart: 'touch_start',
    touchMove: 'touch_move',
    touchEnd: 'touch_end',
    touchCancle: 'touch_Cancle'
};

var MsgMacroHttp = {
    oper: 'oper',
    sync: 'sync',
    signIn: 'checkin',
    namecheck: 'namecheck'

    //技能状态

};var skillState = {
    auto_skill: false,
    lock_skill: false,
    kuangBao_skill: false,
    kuangBao_level: 0
    //....
};

var SpineEffectNode = {
    jscg: '0',
    daojs: '1',
    hz: '2',
    paojs: '3',
    zhuanpan: '4',
    great: '5',
    welcome: '6'
};

var debugInfo = {
    bShowFishInfo: false,
    bShowColliderBox: false,
    bShowFPS: false
};

module.exports = {
    opportunity: opportunity,
    isMatch: isMatch,
    localbulletData: localbulletData,
    weaponBottomLogicPos: weaponBottomLogicPos,
    weaponLogicPos: weaponLogicPos,
    clientVersion: clientVersion,
    userSeats: userSeats,
    arenaScoreFrame: arenaScoreFrame,
    catchFishFrame: catchFishFrame,
    catchFishDiamond: catchFishDiamond,
    KBBoxCollisionData: KBBoxCollisionData,
    weaponBarrelNum: weaponBarrelNum,
    bulletBirth: bulletBirth,
    bulletRealPos: bulletRealPos,
    bulletBirthParentNode: bulletBirthParentNode,
    specialBulletArr: specialBulletArr,
    palaceData: palaceData,
    MsgMarco: MsgMarco,
    bulletIdSection: bulletIdSection,
    myselfPos: myselfPos,
    localMySelfPos: localMySelfPos,
    maxCannonLevel: maxCannonLevel,
    autolevel: autolevel,
    weaponUnLockConfig: weaponUnLockConfig,
    weaponUnLockList: weaponUnLockList,
    compenGoldConf: compenGoldConf,
    globalParConf: globalParConf,
    playerNums: playerNums,
    SpineEffectNode: SpineEffectNode,
    touchEvent: touchEvent,
    eventName: eventName,
    skillState: skillState,
    SkillItemId: SkillItemId,
    MsgMacroHttp: MsgMacroHttp,
    FacaijinCd: FacaijinCd,
    getFacaijinTimes: getFacaijinTimes,
    isRealyPoChan: isRealyPoChan,
    standSunTime: standSunTime,
    FaCaiJinAdd: FaCaiJinAdd,
    curLevelIsLock: curLevelIsLock,
    roomLevel: roomLevel,
    curRoomLevel: curRoomLevel,
    selfFireSwitch: selfFireSwitch,
    flyCardIng: flyCardIng,
    curCardGame: curCardGame,
    unLockRewardNum: unLockRewardNum,
    inCardGame: inCardGame,
    inTaskReward: inTaskReward,
    inTaskUnlock: inTaskUnlock,
    inArenaTask: inArenaTask,
    inMinTime: inMinTime,
    designSize: designSize,
    debugInfo: debugInfo,
    showUnlockTip: showUnlockTip,
    isQuickRefesh: isQuickRefesh,
    curframeCatch: curframeCatch,
    arenaBaseInfo: arenaBaseInfo,
    CodeType: CodeType,
    simpleBtnEffect: simpleBtnEffect,
    simpleTipEffect: simpleTipEffect,
    gameHide: gameHide,
    statusBarHeight: statusBarHeight
};

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
        //# sourceMappingURL=Global.js.map
        