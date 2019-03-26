"use strict";
cc._RF.push(module, '7e215xdb6pPS6i7vwCxMEc2', 'ResLoadManager');
// script/framework/manager/ResLoadManager.js

'use strict';

var PrefabManager = require('PrefabManager');
var SpineManager = require('SpineManager');
var SpriteManager = require('SpriteManager');
var AnimManager = require('AnimManager');
var TrackManager = require('TrackManager');
var ConfigManager = require('ConfigManager');
var Global = require('Global');

var ResLoadManager = {
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
        MainBg: 7 // 渔场背景(特殊处理，根据房间类型决定加载哪张图片)
    }),

    // 加载进度的状态
    Status: cc.Enum({
        JoinRoomSuccess: 1 // 服务器回复成功进入房间
    }),

    reset: function reset() {
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

    init: function init(ctrl) {
        this.reset();
        this.ctrl = ctrl;
    },

    // 加载指定场景的资源
    loadSceneRes: function loadSceneRes(sceneInfo, config) {
        if (!this.ctrl || !sceneInfo || !sceneInfo.name) {
            log.error('ResLoader.loadSceneRes: error param.');
            return;
        }

        var info = cc.director._getSceneUuid(sceneInfo.name);
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
            this.reqItemIndex = this.createItem({ total: 1 });
            game.EventManager.on(Global.MsgMarco.loadingProgress, this._eventLoadingProgress, this);
        }

        // 加载场景自身资源
        var self = this;
        var index = this.createItem();
        cc.loader.load({ uuid: info.uuid, type: 'uuid' }, function (completedCount, totalCount, item) {
            self.showLoading(index, completedCount, totalCount, item);
        }, function (err, asset) {
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
    showLoading: function showLoading(index, completed, total, item) {
        var _this = this;

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

        var obj = this.itemArray[index];
        // 总数量每次只增加差值，避免反复计算
        var subCompleted = completed - obj.completed;
        var subTotal = total - obj.total;
        this.completedCount += subCompleted;
        this.totalCount += subTotal;
        // 存储新值
        obj.completed = completed;
        obj.total = total;

        // 如果新增完成数小于等于0，说明完成进度没有更新，可直接返回
        if (subCompleted <= 0) {
            return;
        }

        var completedCount = this.completedCount;
        var totalCount = this.totalCount;
        if (completedCount + 1 === totalCount && !this.bReqRoom) {
            this.bReqRoom = true;
            if (this.ctrl.isMainScene(this.nextScene.name)) {
                this.requestMainScene();
            }
        } else if (completedCount === totalCount && !this.bLoadFinish) {
            this.bLoadFinish = true;
            setTimeout(function () {
                !!_this.ctrl && _this.ctrl.enterScene(_this.nextScene);
            }, 0);
        }

        var progress = cc.misc.clamp01(completedCount / totalCount);
        var percent = Math.floor(progress * 100);
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
    requestMainScene: function requestMainScene() {
        require('NetHelper').connectRoomServer(1);
    },

    // loading进度条过程的事件处理
    _eventLoadingProgress: function _eventLoadingProgress(event) {
        var status = event.data.status;
        log.info('eventLoadingProgress: is called({})', status);
        switch (status) {
            case this.Status.JoinRoomSuccess:
                if (this.ctrl && this.ctrl.isMainScene(this.nextScene.name)) {
                    this.showLoading(this.reqItemIndex, 1, 1, null);
                    game.EventManager.off(Global.MsgMarco.loadingProgress, this._eventLoadingProgress, this);
                }
                break;
        }
    },

    // 创建一个进度统计对象，返回该对象在数组中的索引
    createItem: function createItem(data) {
        var _createObj = function _createObj(completedCount, totalCount) {
            var obj = { completed: completedCount, total: totalCount };
            return obj;
        };
        var total = 0;
        if (!!data && !!data.total) {
            total = data.total;
        }
        this.totalCount += total;
        var len = this.itemArray.push(_createObj(0, total));
        // log.info('ResLoader.createItem: len={}, total={}', len, total);
        return len - 1;
    },

    // 获取指定场景已定义好的预加载项
    getPreloadsByScene: function getPreloadsByScene(type, dirs, name, items) {
        var str = '/' + name + '/';
        for (var dir in dirs) {
            var value = dirs[dir];
            if (value.path.indexOf(str) >= 0 && value.hasOwnProperty('isPreload') && value.isPreload === true) {
                var item = { type: type, dir: dir };
                items.push(item);
            }
        }
    },

    // 返回目标场景所有需要预加载的资源
    getAllPreloads: function getAllPreloads(sceneInfo) {
        var items = [];
        // 获取所有定义好的预加载资源
        this.getPreloadsByScene(this.Type.Prefab, PrefabManager.dirs, sceneInfo.name, items);
        this.getPreloadsByScene(this.Type.Anim, AnimManager.dirs, sceneInfo.name, items);
        this.getPreloadsByScene(this.Type.Spine, SpineManager.dirs, sceneInfo.name, items);
        this.getPreloadsByScene(this.Type.Sprite, SpriteManager.dirs, sceneInfo.name, items);
        // 获取需特别处理的预加载资源
        if (!!sceneInfo.preload) {
            for (var i = 0, _len = sceneInfo.preload.length; i < _len; i++) {
                items.push(sceneInfo.preload[i]);
            }
        }
        return items;
    },

    // bShowLoading - 是否显示进度条(一般是需要，但Postload目录不需要)
    preloadResource: function preloadResource(sceneInfo, bShowLoading) {
        var _this2 = this;

        var allItems = this.getAllPreloads(sceneInfo);

        var _loop = function _loop(i, _len2) {
            var item = allItems[i];
            if (item.hasOwnProperty('delay') && item.delay > 0) {
                setTimeout(function () {
                    _this2.preloadDir(item, bShowLoading);
                }, item.delay);
            } else {
                _this2.preloadDir(item, bShowLoading);
            }
        };

        for (var i = 0, _len2 = allItems.length; i < _len2; i++) {
            _loop(i, _len2);
        }
    },

    preloadDir: function preloadDir(item, bShowLoading) {
        var _progressCallback = null;
        var _completeCallback = null;

        if (bShowLoading) {
            var self = this;
            var index = this.createItem();
            _progressCallback = function _progressCallback(completedCount, totalCount, item) {
                self.showLoading(index, completedCount, totalCount, item);
            };
        }

        switch (item.type) {
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
    _loadFishDir: function _loadFishDir(dir, progressCallback, completeCallback) {
        var animNames = TrackManager.getRoomFishesByType(1);
        var len = animNames.length;
        var complete = 0;
        // 先把应加载的资源数量发送给UI
        !!progressCallback && progressCallback(complete, len, null);

        var _localCallback = function _localCallback() {
            complete += 1;
            !!progressCallback && progressCallback(complete, len, null);
        };

        for (var i = 0; i < len; i++) {
            var obj = animNames[i];
            var config = { subDir: obj.name };
            if (obj.bSpine) {
                SpineManager.loadDir(dir, null, _localCallback, config);
            } else {
                AnimManager.loadDir(dir, null, _localCallback, config);
            }
        }
    },

    // 加载渔场的入场欢迎动画
    _loadWelcome: function _loadWelcome(dir, progressCallback, completeCallback) {
        SpineManager.loadDir(dir, progressCallback, completeCallback);
    },

    // 加载渔场背景
    _loadMainBg: function _loadMainBg(dir, progressCallback, completeCallback) {
        var self = this;
        ConfigManager.getConfig('RoomRules', function (conf) {
            var bgName = conf[1].bgName;
            if (bgName) {
                SpriteManager.load(dir, bgName, null, { cache: true });
            }
        });
    }
};

module.exports = ResLoadManager;

cc._RF.pop();