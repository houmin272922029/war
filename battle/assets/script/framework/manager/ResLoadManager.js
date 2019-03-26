const PrefabManager = require('PrefabManager');
const SpineManager = require('SpineManager');
const SpriteManager = require('SpriteManager');
const AnimManager = require('AnimManager');
const TrackManager = require('TrackManager');
const ConfigManager = require('ConfigManager');
const Global = require('Global');

let ResLoadManager = {
    bInited: false,
    reqItemIndex: 0,
    completedCount: 0,
    totalCount: 0,
    lastPercent: 0,
    itemArray: [],
    bReqRoom: false,
    bLoadFinish: false,
    loadingLayer: null,
    ctrl: null,
    nextScene: null,
    
    // 需要加载的资源类型
    Type: cc.Enum({
        Prefab: 1, // 普通Prefab
        Anim: 2, // 普通序列帧动画
        Spine: 3, // 普通Spine动画
        Sprite: 4, // 普通Sprite图片
        Fish: 5, // 鱼资源(特殊处理，包括序列帧和Spine动画)
        Welcome: 6, // 进入渔场的欢迎动画(特殊处理，根据登录次数决定是否加载)
        MainBg: 7, // 渔场背景(特殊处理，根据房间类型决定加载哪张图片)
    }),

    // 加载进度的状态
    Status: cc.Enum({
        JoinRoomSuccess: 1, // 服务器回复成功进入房间
    }),

    
    reset: function() {
        this.completedCount = 0;
        this.totalCount = 0;
        this.reqItemIndex = 0;
        this.lastPercent = 0;
        this.itemArray = [];
        this.bReqRoom = false;
        this.bLoadFinish = false;
        this.loadingLayer = null;
        this.ctrl = null;
        this.nextScene = null;
    },

    init: function(ctrl) {
        this.reset();
        this.ctrl = ctrl;
    },

    // 加载指定场景的资源
    loadSceneRes: function(sceneInfo, config) {
        if (!this.ctrl || !sceneInfo || !sceneInfo.name) {
            log.error('ResLoader.loadSceneRes: error param.');
            return;
        }

        let info = cc.director._getSceneUuid(sceneInfo.name);
        if (!info) {
            log.error('ResLoader.loadSceneRes: cannot find scene: {}', sceneInfo.name);
            return;
        }

        this.nextScene = sceneInfo;
        if (!!config && !!config.layer) {
            this.loadingLayer = config.layer;
        }

        // 如果将要进入的是主渔场，创建一个请求进入房间的进度项
        if (this.ctrl.isMainScene(sceneInfo.name)) {
            this.reqItemIndex = this.createItem({ total: 1});
            game.EventManager.on(Global.MsgMarco.loadingProgress, this._eventLoadingProgress, this);
        }
        
        // 加载场景自身资源
        let self = this;
        let index = this.createItem();
        cc.loader.load({uuid:info.uuid, type:'uuid'}, (completedCount, totalCount, item) => {
            self.showLoading(index, completedCount, totalCount, item);
        }, (err, asset) => {
            if (err) {
                log.error('ResLoader.loadSceneRes: error to load uuid');
                return;
            }
        });

        // 加载该场景需要预加载的资源
        cc.macro.DOWNLOAD_MAX_CONCURRENT = 8;
        this.preloadResource(sceneInfo, true);
    },

    // 显示进度
    showLoading: function(index, completed, total, item) {
        if (!this.loadingLayer || !this.ctrl) {
            log.warn('ResLoader.showLoading: invalid param(layer or ctrl is null)');
            return;
        }
        if (completed === 0 && total === 0) {
            log.warn('ResLoader.showLoading: invalid param(comp and total is 0)');
            return;
        }
        if (index < 0 || index >= this.itemArray.length) {
            log.warn('ResLoader.showLoading: param is invalid. index={}, len={}', index, len);
            return;
        }

        let obj = this.itemArray[index];
        // 总数量每次只增加差值，避免反复计算
        let subCompleted = completed - obj.completed;
        let subTotal = total - obj.total;
        this.completedCount += subCompleted;
        this.totalCount += subTotal;
        // 存储新值
        obj.completed = completed;
        obj.total = total;
        
        // 如果新增完成数小于等于0，说明完成进度没有更新，可直接返回
        if (subCompleted <= 0) {
            return;
        }

        let completedCount = this.completedCount;
        let totalCount = this.totalCount;
        if ((completedCount+1) === totalCount && !this.bReqRoom) {
            this.bReqRoom = true;
            if (this.ctrl.isMainScene(this.nextScene.name)) {
                this.requestMainScene();
            }
        } else if (completedCount === totalCount && !this.bLoadFinish) {
            this.bLoadFinish = true;
            setTimeout(() => {
                !!this.ctrl && this.ctrl.enterScene(this.nextScene);
            }, 0);
        }

        let progress = cc.misc.clamp01(completedCount / totalCount);
        let percent = Math.floor(progress * 100);
        // 只有大于当前进度才更新，保证进度的UI显示不会回退
        if (percent > this.lastPercent) {
            log.info('loading: per={}, complete={}, total={}', percent, completedCount, totalCount);
            if (this.loadingLayer) {
                this.loadingLayer.updatePercent(progress, percent);
            }
            this.lastPercent = percent;
        }
    },

    // 向服务器发送请求进入主渔场
    requestMainScene: function() {
        require('NetHelper').connectRoomServer(1);
    },

    // loading进度条过程的事件处理
    _eventLoadingProgress: function(event) {
        let status = event.data.status;
        log.info('eventLoadingProgress: is called({})', status);
        switch(status) {
            case this.Status.JoinRoomSuccess:
                if (this.ctrl && this.ctrl.isMainScene(this.nextScene.name)) {
                    this.showLoading(this.reqItemIndex, 1, 1, null);
                    game.EventManager.off(Global.MsgMarco.loadingProgress, this._eventLoadingProgress, this);
                }
                break;
        }
    },

    // 创建一个进度统计对象，返回该对象在数组中的索引
    createItem: function(data) {
        let _createObj = function(completedCount, totalCount) {
            let obj = {completed:completedCount, total:totalCount};
            return obj;
        };
        let total = 0;
        if (!!data && !!data.total) {
            total = data.total;
        }
        this.totalCount += total;
        let len = this.itemArray.push(_createObj(0, total));
        // log.info('ResLoader.createItem: len={}, total={}', len, total);
        return (len-1);
    },

    // 获取指定场景已定义好的预加载项
    getPreloadsByScene: function(type, dirs, name, items) {
        let str = '/' + name + '/';
        for (let dir in dirs) {
            let value = dirs[dir];
            if (value.path.indexOf(str) >= 0 && value.hasOwnProperty('isPreload') && value.isPreload === true) {
                let item = {type:type, dir:dir};
                items.push(item);
            }
        }
    },

    // 返回目标场景所有需要预加载的资源
    getAllPreloads: function(sceneInfo) {
        let items = [];
        // 获取所有定义好的预加载资源
        this.getPreloadsByScene(this.Type.Prefab, PrefabManager.dirs, sceneInfo.name, items);
        this.getPreloadsByScene(this.Type.Anim, AnimManager.dirs, sceneInfo.name, items);
        this.getPreloadsByScene(this.Type.Spine, SpineManager.dirs, sceneInfo.name, items);
        this.getPreloadsByScene(this.Type.Sprite, SpriteManager.dirs, sceneInfo.name, items);
        // 获取需特别处理的预加载资源
        if (!!sceneInfo.preload) {
            for (let i = 0, len = sceneInfo.preload.length; i < len; i++) {
                items.push(sceneInfo.preload[i]);
            }
        }
        return items;
    },

    // bShowLoading - 是否显示进度条(一般是需要，但Postload目录不需要)
    preloadResource: function(sceneInfo, bShowLoading) {
        let allItems = this.getAllPreloads(sceneInfo);
        for (let i = 0, len = allItems.length; i < len; i++) {
            let item = allItems[i];
            if (item.hasOwnProperty('delay') && item.delay > 0) {
                setTimeout(() => {
                    this.preloadDir(item, bShowLoading);
                }, item.delay);
            } else {
                this.preloadDir(item, bShowLoading);
            }
        }
    },

    preloadDir: function(item, bShowLoading) {
        let _progressCallback = null;
        let _completeCallback = null;
        
        if (bShowLoading) {
            let self = this;
            let index = this.createItem();
            _progressCallback = function(completedCount, totalCount, item) {
                self.showLoading(index, completedCount, totalCount, item);
            };
        }

        switch(item.type) {
            case this.Type.Fish:
                this._loadFishDir(item.dir, _progressCallback, _completeCallback);
                break;
            case this.Type.Prefab:
                PrefabManager.loadDir(item.dir, _progressCallback, _completeCallback);
                break;
            case this.Type.Anim:
                AnimManager.loadDir(item.dir, _progressCallback, _completeCallback);
                break;
            case this.Type.Spine:
                SpineManager.loadDir(item.dir, _progressCallback, _completeCallback);
                break;
            case this.Type.Welcome:
                this._loadWelcome(item.dir, _progressCallback, _completeCallback);
                break;
            case this.Type.MainBg:
                this._loadMainBg(item.dir, _progressCallback, _completeCallback);
                break;
        }
    },

    // 加载指定渔场的精灵资源
    _loadFishDir: function(dir, progressCallback, completeCallback) {
        let animNames = TrackManager.getRoomFishesByType(1);
        let len = animNames.length;
        let complete = 0;
        // 先把应加载的资源数量发送给UI
        !!progressCallback && progressCallback(complete, len, null);

        let _localCallback = function() {
            complete += 1;
            !!progressCallback && progressCallback(complete, len, null);
        };

        for (let i = 0; i < len; i++) {
            let obj = animNames[i];
            let config = { subDir: obj.name };
            if (obj.bSpine) {
                SpineManager.loadDir(dir, null, _localCallback, config);
            } else {
                AnimManager.loadDir(dir, null, _localCallback, config);
            }
        }
    },

    // 加载渔场的入场欢迎动画
    _loadWelcome: function(dir, progressCallback, completeCallback) {
        SpineManager.loadDir(dir, progressCallback, completeCallback);
    },

    // 加载渔场背景
    _loadMainBg: function(dir, progressCallback, completeCallback) {
        let self = this;
        ConfigManager.getConfig('RoomRules', (conf) => {
            let bgName = conf[1].bgName;
            if (bgName) {
                SpriteManager.load(dir, bgName, null, {cache:true});
            }
        });
    },
}

module.exports = ResLoadManager;
