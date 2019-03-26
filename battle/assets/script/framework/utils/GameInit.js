/**
 * 因为pop()，逆向遍历，注意初始化顺序
 */
let allParts = [
    // 'UIWaiting',
    // 'TrackMgr',
    'NetManager',
    'PrefabManager',
    'SpriteManager',
    'SpineManager',
    'AnimManager',
    'ConfigManager',
    'SpriteHook',
    //'Environment',
];

//微信小游戏 作用域问题
if (CC_WECHATGAME) {
    window.proto = {};
    proto.proto = {};
    proto.message = {};
    proto.message.DVector2 = {};
    proto.message.DVector3 = {};
}

let GameInit = {
    /**
     * 加载游戏模块
     * @param {*加载成功回调} callback 
     */
    loadModule: function (callback) {
        let now = Date.now();
        let part = allParts.pop();
        require(part).init(() => {
            log.info('module ({}) is loaded, time:{}', part, (Date.now() - now));
            if (allParts.length > 0) {
                this.loadModule(callback);
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
    init: function (callback) {
        if (!!this.bInited) {
            if (callback) {
                callback();
            }
        } else {
            this.loadModule(callback);
            this.bInited = true;
        }
    },
}

module.exports = GameInit;
