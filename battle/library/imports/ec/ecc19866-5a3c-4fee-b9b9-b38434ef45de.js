"use strict";
cc._RF.push(module, 'ecc19hmWjxP7rm5s4Q070Xe', 'SpriteManager');
// script/framework/manager/SpriteManager.js

'use strict';

/**
 *  游戏内纹理管理（全局纹理以及临时纹理）
 */

module.exports = {
    inited: false,
    /**
     * 必需参数 path: 资源相对路径。
     * 可选参数 isStatic: 是否为全局静态资源(游戏启动时加载，一直保存在内存中)
     * 可选参数 isPreload: 是否需预加载(进入场景时加载，本场景内有效)
     */
    dirs: {
        // 公共
        weekCard: { path: 'texture/weekCard/', isPreload: false },
        head: { path: 'texture/personal/' },
        shop: { path: 'texture/shop/' },
        icon: { path: 'texture/icon/' },
        vip: { path: 'texture/vip/' },
        vipreward: { path: 'texture/vipreward/' },
        common: { path: 'texture/common/' },
        // 大厅
        arena: { path: 'texture/hall/arena/' },
        // 渔场
        mainCommon: { path: 'texture/mainScene/common/' },
        mainBg: { path: 'texture/mainScene/bg/' },
        fishIcon: { path: 'texture/mainScene/fishIcon/' },
        bless: { path: 'texture/mainScene/bless/' },
        vipWeapon: { path: 'texture/mainScene/vipWeapon/' },
        handBook: { path: 'texture/mainScene/handbook/' },
        bulletAndNet: { path: 'texture/mainScene/bulletAndNet/' },
        treasureFish: { path: 'texture/mainScene/treasureFish/' },
        match: { path: 'texture/mainScene/match/' },
        bill: { path: 'texture/hall/bill/' }
    },

    init: function init(callback) {
        if (this.inited) {
            log.info('SpriteManager.init: has been called');
        } else {
            this.inited = true;
            var keys = Object.keys(this.dirs);
            for (var i = 0, len = keys.length; i < len; i++) {
                var dir = keys[i];
                var value = this.dirs[dir];
                value.frames = {}; // 初始化缓存池
                if (!!value.isStatic && value.isStatic === true) {
                    this.loadDir(dir);
                }
            }
        }
        callback && callback();
    },

    // 加载一个sprite目录
    // progressCallback - 可选参数，加载过程中的回调，可不填
    loadDir: function loadDir(dir, progressCallback, completeCallback) {
        if (void 0 === completeCallback) {
            completeCallback = progressCallback;
            progressCallback = null;
        }
        var value = this.dirs[dir];
        var path = value.path;
        // 加载整个目录
        cc.loader.loadResDir(path, cc.SpriteFrame, progressCallback, function (err, objects) {
            if (err) {
                log.error('SpriteManager.loadDir: error path: ' + path + ', ' + err || err.message);
            } else {
                // log.info('SpriteManager.loadDir: success path: ' +path);
                for (var i in objects) {
                    value.frames[objects[i].name] = { frame: objects[i], ref: 1 };
                }
            }
            // 不管成功或失败，都要执行完成回调
            !!completeCallback && completeCallback();
        });
    },

    /**
     * 设置图片
     * @param {*Sprite的Node节点} node
     * @param {*dir} 静态资源类别（替代路径）
     * @param {*name} 资源名（xxx.png）
     * @param {*callback} 回调函数
     */
    setSprite: function setSprite(node, dir, name, callback) {
        if (!node || !dir || !name) {
            log.warn('setSprite: param is invalid. dir={}, name={}', dir, name);
            return null;
        }
        var sp = node.getComponent(cc.Sprite);
        if (!sp) {
            sp = node.addComponent(cc.Sprite);
        }
        this.load(dir, name, function (obj) {
            sp.spriteFrame = obj.frame;
            // this._cacheFrame(sp, obj, dir, name); // 缓存计数
            !!callback && callback(obj.frame);
        });
        return sp;
    },

    // 动态创建Sprite节点
    createSprite: function createSprite(parent, dir, name, callback) {
        var node = new cc.Node();
        node.addComponent(cc.Sprite);
        this.setSprite(node, dir, name, function (object) {
            parent.addChild(node);
            !!callback && callback(node, object);
        });
    },

    // 返回缓存的frame对象，注意：不是SpriteFrame
    _getFrame: function _getFrame(dir, name) {
        var value = this.dirs[dir];
        if (!!value && !!value.frames && !!value.frames[name]) {
            return value.frames[name];
        }
        return null;
    },

    _getPath: function _getPath(dir, name) {
        var value = this.dirs[dir];
        return value.path + name;
    },

    /**
     * 动态加载图片
     * @param {*Sprite的Node节点} node
     * @param {*path} 资源路径
     */
    load: function load(dir, name, callback, config) {
        // 首先查找缓存
        var obj = this._getFrame(dir, name);
        if (obj) {
            !!callback && callback(obj);
            return;
        }

        // 未找到缓存，执行异步加载
        var value = this.dirs[dir];
        var path = value.path + name;
        cc.loader.loadRes(path, cc.SpriteFrame, function (err, object) {
            if (err || !object) {
                log.error('SpriteManager.load: error path: ' + path + ', ' + err || err.message);
                return;
            }
            // if (!!config && !!config.cache) {
            //     // todo
            // } else {
            //     // 默认设置为场景切换时自动释放该SpriteFrame和它引用的贴图资源
            //     cc.loader.setAutoReleaseRecursively(object, true);
            // }
            value.frames[object.name] = { frame: object, ref: 0 };
            !!callback && callback(value.frames[object.name]);
        });
    },

    // 删除一个缓存索引
    removeIndex: function removeIndex(dir, name) {
        var value = this.dirs[dir];
        if (!!value && !!value.frames && !!value.frames[name]) {
            delete value.frames[name];
        }
    },

    // 释放一个SpriteFrame资源
    release: function release(dir, name) {
        var obj = this._getFrame(dir, name);
        if (obj) {
            this.removeIndex(dir, name);
            var deps = cc.loader.getDependsRecursively(obj.frame);
            if (deps) {
                cc.loader.release(deps); // 立即释放SpriteFrame和它引用的贴图资源
                // log.info('SpriteManager.release: dir={}, name={}', dir, name);
            }
        }
    },

    // 释放整个目录下的资源(包括索引缓存和实际引用资源)
    releaseDir: function releaseDir(dir) {
        var value = this.dirs[dir];
        if (!!value && !!value.frames) {
            for (var i in value.frames) {
                this.release(dir, i);
            }
            value.frames = {};
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

    _cacheFrame: function _cacheFrame(sp, obj, dir, name) {
        if (!!obj) {
            if (obj.ref < 1) {
                this._modifyDestroy(sp, obj, dir, name); // 覆盖onDestroy，自动释放
            }
            obj.ref++;
        }
    },

    // 首次动态换图修改destroy
    _modifyDestroy: function _modifyDestroy(sp, obj, dir, name) {
        if (!sp || !obj || !dir || !name) {
            return;
        }
        var self = this;
        var oldDestroy = sp.onDestroy;
        sp.onDestroy = function () {
            self._releaseFrame(dir, name);
            if (oldDestroy) {
                oldDestroy.call(this);
            }
        };
    },

    // 如果引用计数为0，则实际释放资源
    _releaseFrame: function _releaseFrame(dir, name) {
        var self = this;
        var obj = this._getFrame(dir, name);
        if (obj) {
            obj.ref--;
            if (obj.ref < 1) {
                obj.ref = 0;
                log.info('SpriteManager._releaseFrame: dir={}, name={}', dir, name);
                setTimeout(function () {
                    self.release(dir, name);
                }, 0); // 下一帧释放
            }
        }
    },

    _fullPath: function _fullPath(url) {
        var path = '';
        if (url.indexOf('resources/') < 0) {
            path = 'resources/' + url;
        }
        if (url.indexOf('.png') < 0) {
            path += '.png';
        }
        if (url.indexOf('assets/') < 0) {
            path = cc.url.raw(path);
        }
        return path;
    },

    _simplifyPath: function _simplifyPath(url) {
        var path = '';
        var index = url.indexOf('assets/');
        if (index >= 0) {
            path = url.substring(index + 7);
        }
        index = path.indexOf('resources/');
        if (index >= 0) {
            path = path.substring(index + 10);
        }
        index = path.indexOf('.png');
        if (index >= 0) {
            path = path.substring(0, path.length - 4);
        }
        index = path.indexOf('.jpg');
        if (index >= 0) {
            path = path.substring(0, path.length - 4);
        }
        return path;
    }
};

cc._RF.pop();