(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/manager/BaseManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '15f9bw8a85LornjF27Yt28W', 'BaseManager', __filename);
// script/framework/manager/BaseManager.js

"use strict";

var BaseManager = cc.Class({

    statics: {

        getPath: function getPath(dirs, dir, name) {
            var path = null;
            var value = dirs[dir];
            if (value && !!value.path) {
                path = value.path + name;
            }
            return path;
        },

        getData: function getData(dirs, dir, name) {
            var data = null;
            var value = dirs[dir];
            if (value && !!value.datas && value.datas[name]) {
                data = value.datas[name];
            }
            return data;
        },

        newData: function newData(object, refCount) {
            return { object: object, refCount: refCount };
        },
        resetData: function resetData(data) {
            if (!!data) {
                data.object = null;
                data.refCount = 0;
            }
        },
        getObject: function getObject(data) {
            var obj = null;
            if (!!data && !!data.object) {
                obj = data.object;
            }
            return obj;
        },
        addRefCount: function addRefCount(data) {
            if (!!data) {
                data.refCount++;
            }
        },
        subRefCount: function subRefCount(data) {
            if (!!data) {
                data.refCount--;
            }
        },
        getRefCount: function getRefCount(data) {
            return data.refCount;
        },


        // 删除一个缓存索引
        removeIndex: function removeIndex(dirs, dir, name) {
            var value = dirs[dir];
            if (value && !!value.datas && value.datas[name]) {
                delete value.datas[name];
            }
        },

        // 释放实际资源
        releaseObject: function releaseObject(object) {
            if (!!object) {
                var deps = cc.loader.getDependsRecursively(object);
                if (deps) {
                    cc.loader.release(deps);
                }
            }
        },


        // 释放一项资源
        releaseOne: function releaseOne(dirs, dir, name, config) {
            var bReleased = false;
            var data = this.getData(dirs, dir, name);
            if (data) {
                this.subRefCount(data);
                if (data.refCount <= 0 || !!config && config.force === true) {
                    this.removeIndex(dirs, dir, name); // 删除资源的缓存索引
                    this.releaseObject(data.object);
                    // log.info('BaseManager.release: dir={}, name={}', dir, name);
                    this.resetData(data);
                    bReleased = true;
                }
            }
            return bReleased;
        },

        // 释放整个目录下的资源(包括索引缓存和实际资源)
        releaseDir: function releaseDir(dirs, dir) {
            var value = dirs[dir];
            if (value && !!value.datas) {
                for (var key in value.datas) {
                    this.releaseOne(dirs, dir, key, { force: true });
                }
                value.datas = {};
            }
        }
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
        //# sourceMappingURL=BaseManager.js.map
        