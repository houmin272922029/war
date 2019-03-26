"use strict";
cc._RF.push(module, 'e968dbN8EtGkZPlG4i0u6zx', 'PrefabManager');
// script/framework/manager/PrefabManager.js

'use strict';

var NetLoaderManager = require('NetLoaderManager');

/**
 * 全局预制体管理类
 */
var PrefabManager = {
    inited: false,

    dirs: {
        // first: { path: 'prefab/first/', isStatic: true },
        // common: { path: 'prefab/common/', isPreload: false },
        // //登陆
        // login: { path: 'prefab/login/', isPreload: false },
        // // 大厅
        // hallCommon: { path: 'prefab/hall/common/', isPreload: true },
        // hallArena: { path: 'prefab/hall/arena/', isPreload: true },
        // weekCard: { path: 'prefab/hall/weekCard/', isPreload: true },
        // shop: { path: 'prefab/hall/shop/', isPreload: true },
        // vip: { path: 'prefab/hall/vip/', isPreload: true },
        // signin: { path: 'prefab/hall/signin/', isPreload: true },
        // mail: { path: 'prefab/hall/mail/', isPreload: false },
        // bag: { path: 'prefab/hall/bag/', isPreload: false },
        // personal: { path: 'prefab/hall/personal/', isPreload: true },
        // bill: { path: 'prefab/bill/', isPreload: false },
        // sevenday: { path: 'prefab/hall/sevenday/', isPreload: true },

        // // 主渔场
        // mainPreload: { path: 'prefab/mainScene/preload/', isPreload: true },
        // mainCommon: { path: 'prefab/mainScene/common/', isPreload: true },
        // weapon: { path: 'prefab/mainScene/weapon/', isPreload: true },
        // skill: { path: 'prefab/mainScene/skill/', isPreload: true },
        // tip: { path: 'prefab/mainScene/tip/' },
        // bless: { path: 'prefab/mainScene/bless/', isPreload: true },
        // palace: { path: 'prefab/mainScene/palace/', isPreload: true },
        // debug: { path: 'prefab/mainScene/debug/' },
        // arena: { path: 'prefab/mainScene/arena/' },
        // task: { path: 'prefab/mainScene/task/' },
        // buttonCom: { path: 'prefab/mainScene/buttonCom/' },
        // treasureHuntFish: { path: 'prefab/mainScene/treasureHuntFish/', isPreload: true },
        // match: { path: 'prefab/mainScene/match/' },
        // fish: { path: 'fish/prefab/', isPreload: true },
    },

    init: function init(callback) {
        var self = this;
        if (self.inited) {
            log.info('PrefabManager.init: has been called');
            callback && callback();
            return;
        }
        self.inited = true;

        var keys = Object.keys(this.dirs);
        for (var i = 0, len = keys.length; i < len; i++) {
            var dir = keys[i];
            var value = this.dirs[dir];
            value.prefabs = {};
            if (!!value.isStatic && value.isStatic === true) {
                this.loadDir(dir);
            }
        }
        callback && callback();
    },

    // 加载一个prefab目录
    // progressCallback - 过程中回调，可跳过直接填完成回调
    loadDir: function loadDir(dir, progressCallback, completeCallback) {
        if (void 0 === completeCallback) {
            completeCallback = progressCallback;
            progressCallback = null;
        }
        var value = this.dirs[dir];
        // 加载整个目录
        cc.loader.loadResDir(value.path, cc.Prefab, progressCallback, function (err, objects) {
            if (err && err.status) {
                log.error('PrefabManager.loadDir: error path = {}, err = {}', value.path, err);
            } else {
                for (var i in objects) {
                    value.prefabs[objects[i].name] = objects[i];
                }
            }
            // 不管成功或失败，都要执行回调
            completeCallback && completeCallback();
        });
    },

    // 加载一个prefab文件
    // callback - 可选参数。加载完成后执行回调
    // config - 可选参数。附加选项
    load: function load(dir, name, callback, config) {
        var object = this.getPrefab(dir, name);
        if (object) {
            // 在缓存中找到
            !!callback && callback(object);
            return;
        }

        // 未找到，执行异步加载
        var value = this.dirs[dir];
        var path = value.path + name;
        cc.loader.loadRes(path, cc.Prefab, function (err, object) {
            if (err && err.status || !object) {
                log.error('PrefabManager._load: error path = {}, err = {}', path, err);
                return;
            }
            value.prefabs[object.name] = object; // 置缓存
            !!callback && callback(object);
            NetLoaderManager.closeCheckStatus(object);
            // cc.loader.setAutoReleaseRecursively(object, true);
        });
        NetLoaderManager.startCheckStatus(path);
    },

    // 返回完整路径
    fullPath: function fullPath(dir, name) {
        var path = '';
        var value = this.dirs[dir];
        if (!value) {
            log.warn('PrefabManager.fullPath: error dir={}, name={}', dir, name);
            return path;
        }
        path = value.path + name;
        return path;
    },

    getPrefab: function getPrefab(dir, name) {
        var value = this.dirs[dir];
        if (!!value && !!value.prefabs && value.prefabs[name]) {
            return value.prefabs[name];
        }
        return false;
    },

    // 删除一个缓存索引
    removeIndex: function removeIndex(dir, name) {
        var value = this.dirs[dir];
        if (!!value && !!value.prefabs && value.prefabs[name]) {
            delete value.prefabs[name];
        }
    },

    // 释放一个Prefab资源
    release: function release(dir, name) {
        var obj = this.getPrefab(dir, name);
        if (obj) {
            this.removeIndex(dir, name);
            var deps = cc.loader.getDependsRecursively(obj);
            if (deps) {
                cc.loader.release(deps);
                // log.info('PrefabManager.release: dir={}, name={}', dir, name);
            }
        }
    },

    // 释放整个目录下的资源(包括索引缓存和实际引用资源)
    releaseDir: function releaseDir(dir) {
        var value = this.dirs[dir];
        if (value && !!value.prefabs) {
            for (var i in value.prefabs) {
                this.release(dir, i);
            }
            value.prefabs = {};
        }
    },

    // 释放指定场景的所有资源
    releaseScene: function releaseScene(name) {
        var str = '/' + name + '/';
        var keys = Object.keys(this.dirs);
        for (var i = 0, len = keys.length; i < len; i++) {
            var dir = keys[i];
            var value = this.dirs[dir];
            if (value.path.indexOf(str) >= 0) {
                this.releaseDir(dir);
            }
        }
    },

    /**
     * root prefab 预制件父节点
     * category 预制件 key
     * idx      预制件名
     */
    createInstance: function createInstance(root, category, idx) {
        if (!root) {
            log.info('PrefabManager createInstance root in null');
            return;
        }
        var prefab = this.getPrefab(category, idx);
        if (prefab) {
            var obj = cc.instantiate(prefab);
            obj.parent = root;
            return obj;
        }
    }
};

module.exports = PrefabManager;

cc._RF.pop();