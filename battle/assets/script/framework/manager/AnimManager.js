
/**
 * 全局序列帧Animation管理类
 */
let AnimManager = {
    inited: false,
    /**
     * 必需参数 path: 资源相对路径。
     * 可选参数 isStatic: 是否为全局静态资源(游戏启动时加载，一直保存在内存中)
     * 可选参数 isPreload: 是否需预加载(进入场景时加载，本场景内有效)
     */
    dirs: {
        fish: { path: 'fish/anim/', isStatic: false },
        net: { path: 'anim/clip/mainScene/weapon/', isPreload: true },
    },

    reset: function () {

    },

    init: function (callback) {
        let self = this;
        if (self.inited) {
            log.info('AnimManager.init: has been called');
        } else {
            self.inited = true;
            let keys = Object.keys(this.dirs);
            for (let i = 0, len = keys.length; i < len; i++) {
                let dir = keys[i];
                let value = this.dirs[dir];
                value.anims = {}; // 初始化缓存池
                if (!!value.isStatic && value.isStatic === true) {
                    this.loadDir(dir);
                }
            }
        }
        callback && callback();
    },

    // 加载一个anim目录
    // dir - 必需参数。要加载的anim文件目录
    // progressCallback - 可选参数。加载过程的回调，可为null
    // completeCallback - 可选参数。加载完成的回调，可为null
    // config - 可选参数。子目录名(目前用于鱼资源加载,一条鱼就是一个目录)
    loadDir: function (dir, progressCallback, completeCallback, config) {
        if (!dir) {
            log.warn('AnimManager.loadDir: invalid dir.');
            return;
        }
        let value = this.dirs[dir];
        let path = value.path;
        // 如果有子目录则加上
        if (!!config && !!config.subDir) {
            path += config.subDir;
        }
        // 加载整个目录
        cc.loader.loadResDir(path, cc.AnimationClip, progressCallback, (err, objects) => {
            if (err) {
                log.error('AnimManager.loadDir: error path: ' + path + ', ' + err || err.message);
            } else {
                // log.info('AnimManager.loadDir: success path: ' +path);
                for (let i in objects) {
                    value.anims[objects[i].name] = objects[i];
                }
            }
            // 不管成功或失败，都要执行回调
            completeCallback && completeCallback();
        });
    },

    // 在指定node上动态加载并播放一个anim文件
    // dir - 文件目录
    // name - anim名字
    // callback - 可选参数，执行anim播放完后的回调
    // config - 可选参数。子目录名(目前用于鱼资源加载,一条鱼就是一个目录)
    play: function (node, dir, name, callback, config) {
        if (!node || !dir || !name) {
            log.warn('AnimManager.play: invalid params. dir={}, name={}', dir, name);
            return;
        }
        let sp = node.getComponent(cc.Sprite);
        if (!sp) {
            sp = node.addComponent(cc.Sprite);
        }
        sp.sizeMode = cc.Sprite.SizeMode.RAW; // 序列帧动画需使用原始尺寸
        sp.trim = false;

        let animCtrl = node.getComponent(cc.Animation);
        if (!animCtrl) {
            animCtrl = node.addComponent(cc.Animation);
            animCtrl._clips = [];
        }

        this._load(dir, name, (clip) => {
            // log.info('AnimManager.play: load: dir={}, name={}', dir, name);
            let animState = animCtrl.addClip(clip);
            if (animState) {
                animState = animCtrl.playAdditive(name);
                if (animState) {
                    // 注册该动画播放结束的回调
                    animCtrl.once('stop', () => {
                        arguments[2] == name && callback && callback(clip);
                    }, this);
                } else {
                    log.warn('AnimManager.play: failed to play. dir={}, name={}', dir, name);
                    return;
                }
            } else {
                log.warn('AnimManager.addClip: failed to add. dir={}, name={}', dir, name);
                return;
            }
        }, config);
    },

    // 在指定节点上播放一个静态绑定的动画
    // node: 播放动画的节点
    // name：动画名称
    // callback：播放结束后的回调函数。可选参数
    play2: function (node, name, callback) {
        if (!node || !name) {
            log.warn('AnimManager.play2: invalid params. name={}', name);
            return;
        }
        let anim = node.getComponent(cc.Animation);
        if (anim) {
            let animState = anim.playAdditive(name);
            if (animState) {
                // 注册该动画播放结束的回调
                anim.once('stop', () => {
                    arguments[1] == name && callback && callback(); // 执行回调
                }, this);
            } else {
                log.warn('AnimManager.play2: failed to play. name={}', name);
                return;
            }
        }
    },

    // 加载一个anim文件
    // dir - 文件目录
    // name - anim名字
    // callback - 可选参数，加载anim完成后的回调
    // config - 可选参数。子目录名(目前用于鱼资源加载,一条鱼就是一个目录)
    _load: function (dir, name, callback, config) {
        // 首先查找缓存
        let object = this.getAnim(dir, name);
        if (object) {
            !!callback && callback(object);
            return;
        }

        // 未找到缓存，将进行异步加载

        if (!!config && !!config.subDir) {
            log.info('AnimManager._load: will load subDir={}', config.subDir);
            // 如果定义了子目录，则按目录方式加载，再返回单个anim对象
            this.loadDir(dir, null, () => {
                let object = this.getAnim(dir, name);
                callback && callback(object);
            }, config);
        } else {
            // 加载单个anim文件
            let value = this.dirs[dir];
            let path = value.path + name;
            cc.loader.loadRes(path, cc.AnimationClip, (err, object) => {
                if (err || !object) {
                    log.error('AnimManager._load: error path: ' + path + ', ' + err || err.message);
                    return;
                }
                // 设置场景切换时自动释放该anim和它引用的贴图资源
                // cc.loader.setAutoReleaseRecursively(object, true);
                value.anims[object.name] = object; // 加载成功，置缓存
                !!callback && callback(object);
            });
        }
    },

    getAnim: function (dir, name) {
        let value = this.dirs[dir];
        if (!!value && !!value.anims && value.anims[name]) {
            return value.anims[name];
        }
        return null;
    },

    // 删除一个带有Animation组件的节点
    destroy: function (node) {
        if (!!node) {
            node.removeComponent(cc.Animation);
            node.destroy();
        }
    },

    // 删除一个缓存索引
    removeIndex: function (dir, name) {
        let value = this.dirs[dir];
        if (!!value && !!value.anims && value.anims[name]) {
            delete value.anims[name];
        }
    },

    // 释放一个Anim资源
    release: function (dir, name) {
        let obj = this.getAnim(dir, name);
        if (obj) {
            this.removeIndex(dir, name);
            let deps = cc.loader.getDependsRecursively(obj);
            if (deps) {
                cc.loader.release(deps);
                // log.info('AnimManager.release: dir={}, name={}', dir, name);
            }
        }
    },

    // 释放整个目录下的资源(包括索引缓存和实际引用资源)
    releaseDir: function (dir) {
        let value = this.dirs[dir];
        if (value && !!value.anims) {
            for (let i in value.anims) {
                this.release(dir, i);
            }
            value.anims = {};
        }
    },

    // 释放指定场景的所有资源
    releaseScene: function (name) {
        let str = '/' + name + '/';
        let keys = Object.keys(this.dirs);
        for (let i = 0, len = keys.length; i < len; i++) {
            let dir = keys[i];
            let value = this.dirs[dir];
            if (value.path.indexOf(str) >= 0) {
                this.releaseDir(dir);
            }
        }
    },

}

module.exports = AnimManager;
