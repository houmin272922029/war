(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/manager/SpineManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'a23fad1TSpGNIGfbjhA6VLn', 'SpineManager', __filename);
// script/framework/manager/SpineManager.js

'use strict';

var BaseManager = require('BaseManager');

var SpineManager = cc.Class({
    extends: BaseManager,

    ctor: function ctor() {},


    statics: {

        inited: false,
        /**
         * 必需参数 path: 资源相对路径。
         * 可选参数 isStatic: 是否为全局静态资源(游戏启动时加载，一直保存在内存中)
         * 可选参数 isPreload: 是否需预加载(进入场景时加载，本场景内有效)
         */
        dirs: {
            // 公共
            common: { path: 'spine/common/', isStatic: false },
            fish: { path: 'fish/anim/', isStatic: false },

            // 大厅
            hallPreload: { path: 'spine/hall/preload/', isPreload: true },
            boss: { path: 'spine/hall/boss/', isPreload: true },

            // 渔场
            mainPreload: { path: 'spine/mainScene/preload/', isPreload: true, releaseAfterLoad: true },
            mainCommon: { path: 'spine/mainScene/common/' },
            mainBg: { path: 'spine/mainScene/bg/' },
            welcome: { path: 'spine/mainScene/welcome/' },
            skill: { path: 'spine/mainScene/skill/' },
            bless: { path: 'spine/mainScene/bless/' },
            unlock: { path: 'spine/mainScene/unlock/', isPreload: true, releaseAfterLoad: true },
            jiangli: { path: 'spine/mainScene/jiangli/' },
            bankruptcy: { path: 'spine/mainScene/bankruptcy/' }, // 破产补助
            xuanshang: { path: 'spine/mainScene/xuanshang/' },
            gun: { path: 'spine/mainScene/gun/' },
            bossPlay: { path: 'spine/mainScene/boss/', isPreload: true, releaseAfterLoad: true }, // boss玩法

            palace: { path: 'spine/mainScene/palace/' },
            area: { path: 'spine/mainScene/area/' },
            match: { path: 'spine/mainScene/match/' }, //话费赛相关
            superWeapon: { path: 'spine/mainScene/superWeapon/' },
            coolround: { path: 'spine/mainScene/coolRound/', isPreload: true, releaseAfterLoad: true }

        },

        init: function init(callback) {
            var self = this;
            if (self.inited) {
                log.info('SpineManager.init: has been called');
            } else {
                self.inited = true;
                for (var dir in this.dirs) {
                    var value = this.dirs[dir];
                    value.datas = {};
                    if (value.hasOwnProperty('isStatic') && value.isStatic === true) {
                        this.loadDir(dir);
                    }
                }
            }
            !!callback && callback();
        },

        // 加载一个spine目录
        // progressCallback - 过程中回调，可跳过直接填完成回调
        // config - 可选参数。主要针对鱼资源加载
        loadDir: function loadDir(dir, progressCallback, completeCallback, config) {
            var _this = this;

            if (!dir) {
                log.warn('SpineManager.loadDir: invalid dir.');
                return;
            }
            var value = this.dirs[dir];
            var path = value.path;
            // 如果有子目录则加上
            if (!!config && config.hasOwnProperty('subDir')) {
                path += config.subDir;
            }
            // 加载整个目录
            cc.loader.loadResDir(path, sp.SkeletonData, progressCallback, function (err, objects) {
                if (err) {
                    log.error('SpineManager.loadDir: ' + err || err.message);
                } else {
                    if (value.hasOwnProperty('releaseAfterLoad') && value.releaseAfterLoad) {
                        for (var i in objects) {
                            _this.releaseObject(objects[i]);
                        }
                    } else {
                        for (var _i in objects) {
                            value.datas[objects[_i].name] = _this.newData(objects[_i], 0);
                        }
                    }
                }
                // 不管成功或失败，都要执行回调
                !!completeCallback && completeCallback();
            });
        },

        // 加载一个spine文件
        // config - 可选参数
        _load: function _load(dir, name, callback, config) {
            var _this2 = this;

            // 首先查找缓存
            var data = this.getData(this.dirs, dir, name);
            if (data) {
                !!callback && callback(data);
                return;
            }

            // 缓存中未找到，则执行异步加载
            if (!!config && !!config.subDir) {
                log.info('SpineManager._load: will load subDir={}', config.subDir);
                // 如果定义了子目录，则按目录方式加载，再返回单个对象
                this.loadDir(dir, null, function () {
                    data = _this2.getData(_this2.dirs, dir, name);
                    !!callback && callback(data);
                }, config);
            } else {
                // 加载单个Spine对象
                var value = this.dirs[dir];
                var path = value.path + name;
                cc.loader.loadRes(path, sp.SkeletonData, function (err, object) {
                    if (err || !object) {
                        log.error('SpineManager._load: error: ' + err || err.message);
                        return;
                    }

                    data = _this2.getData(_this2.dirs, dir, name);
                    if (!data) {
                        data = _this2.newData(object, 0);
                        value.datas[object.name] = data;
                    }
                    !!callback && callback(data);
                });
            }
        },

        // 删除一个带有Spine组件的节点
        destroy: function destroy(node) {
            if (!!node) {
                node.removeComponent(sp.Skeleton);
                node.destroy();
            }
        },

        // 释放指定场景的所有资源
        releaseScene: function releaseScene(name) {
            var str = '/' + name + '/';
            for (var dir in this.dirs) {
                var value = this.dirs[dir];
                if (value.path.indexOf(str) >= 0) {
                    this.releaseDir(this.dirs, dir);
                }
            }
        },

        // 释放一项资源
        release: function release(dir, name, config) {
            return this.releaseOne(this.dirs, dir, name, config);
        },


        // 创建新节点并播放spine动画
        // callback - 可选参数。动画播放完后的回调，其中返回的回调第1个参数是新节点对象
        // config - 可选参数。需要传入的附加选项
        //      release - 是否Spine播放完即释放，默认为true
        create: function create(parent, dir, name, anim, loop, callback, config) {
            if (!!parent) {
                var node = new cc.Node();
                parent.addChild(node);
                return this.play(node, dir, name, anim, loop, function (object) {
                    // 回调
                    !!callback && callback(object);

                    // 播放完成，默认释放临时节点，除非指定不释放
                    if (!config || config.release !== false) {
                        cc.isValid(node, true) && node.destroy();
                    }
                }, config);
            }
        },

        // 在指定节点上异步加载并播放spine动画
        // node - 播放Spine动画的节点
        // dir - Spine文件所在目录
        // name - Spine文件名
        // anim - Spine文件中要播放的动画名
        // loop - 是否循环
        // callback - 可选参数，播放完成后执行该回调
        // config - 可选参数，可指定Spine的skin等其它选项，目前支持：
        //      skin - skin
        //      premultipliedAlpha - 是否开启预乘
        //      subDir - 子目录名(目前用于鱼资源加载,一条鱼就是一个目录)
        //      release - 播放完是否减引用计数，默认为true
        //      force - 是否强制释放而不管引用计数，默认为flase
        //      removeComp - 播放完是否移除spine组件(仅针对临时添加的)，默认为true
        play: function play(node, dir, name, anim, loop, callback, config) {
            var _this3 = this;

            if (!node || !dir || !name || !anim) {
                log.warn('SpineManager.play: param is invalid. dir={}, name={}', dir, name);
                return;
            }

            var bRemove = false;
            var spine = node.getComponent(sp.Skeleton);
            if (!spine) {
                spine = node.addComponent(sp.Skeleton);
                bRemove = true;
            }

            this._load(dir, name, function (data) {
                // 可选参数
                if (!!config && config.hasOwnProperty('config.skin')) {
                    spine.setSkin(config.skin);
                }
                if (!!config && config.hasOwnProperty('premultipliedAlpha')) {
                    spine.premultipliedAlpha = config.premultipliedAlpha;
                }
                if (!!config && config.hasOwnProperty('timeScale')) {
                    spine.timeScale = config.timeScale;
                }

                // 增加引用计数
                _this3.addRefCount(data);
                spine.skeletonData = _this3.getObject(data);
                spine.setAnimation(0, anim, loop);
                // 如果是循环播放则无需处理回调
                if (loop) {
                    return;
                }

                spine.setCompleteListener(function (trackEntry, loopCount) {
                    spine.setCompleteListener(null);

                    var animName = trackEntry.animation ? trackEntry.animation.name : '';
                    if (animName === anim) {
                        // 回调
                        !!callback && callback(_this3.getObject(data));

                        // 动画播放完成，默认移除spine组件
                        // 除非指定不移除，或者spine引用计数大于1
                        if (!!config && config.removeComp === true) {
                            cc.isValid(node, true) && node.removeComponent(sp.Skeleton);
                        } else if (bRemove && (!config || config.removeComp !== false) && _this3.getRefCount(data) <= 1) {
                            cc.isValid(node, true) && node.removeComponent(sp.Skeleton);
                            bRemove = false;
                        }

                        // 默认spine播放完即减引用计数，除非指定不减
                        if (!config || config.release !== false) {
                            _this3.release(dir, name, config);
                        }
                    }
                });
                // this._cacheSpineRes(spine, oldData, this._getPath(dir, name));
            }, config);
        },

        // 停止指定节点上的Spine动画
        stop: function stop(node) {
            if (!!node) {
                var spine = node.getComponent(sp.Skeleton);
                if (spine) {
                    spine.clearTracks();
                }
            }
        }

        // _cacheSpineRes: function (skeleton, data, url) {
        //     let self = this;
        //     if (!self.spineResCache) {
        //         self.spineResCache = {};
        //     }
        //     if (!self.spineResCache[url]) {
        //         self.spineResCache[url] = 1;
        //     } else {
        //         self.spineResCache[url] += 1;
        //     }

        //     if (skeleton.releaseUrl) {
        //         self._releaseSpineRes(skeleton.releaseUrl, data);
        //     } else {
        //         let oldDestroy = skeleton.onDestroy;
        //         skeleton.onDestroy = function () {
        //             if (oldDestroy) {
        //                 oldDestroy.call(skeleton);
        //             }
        //             self._releaseSpineRes(skeleton.releaseUrl, skeleton.skeletonData);  //场景销毁时内存释放
        //         }
        //     }
        //     skeleton.releaseUrl = url;
        // },

        // _releaseSpineRes: function (url, data) {
        //     // if (cc.loader.isAutoRelease(data)) return;
        //     if (!this.spineResCache[url]) {
        //         return;
        //     }
        //     this.spineResCache[url] -= 1;
        //     if (this.spineResCache[url] < 1) {
        //         // cc.loader.releaseRes(url, sp.SkeletonData);
        //         let deps = cc.loader.getDependsRecursively(data);
        //         cc.loader.release(deps);
        //         this.spineResCache[url] = 0;
        //     }
        // }
    }

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
        //# sourceMappingURL=SpineManager.js.map
        