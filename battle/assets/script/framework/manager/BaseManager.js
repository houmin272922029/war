
let BaseManager = cc.Class({
     
    statics: {

        getPath: function (dirs, dir, name) {
            let path = null;
            let value = dirs[dir];
            if (value && !!value.path) {
                path = value.path + name;
            }
            return path;
        },

        getData: function (dirs, dir, name) {
            let data = null;
            let value = dirs[dir];
            if (value && !!value.datas && value.datas[name]) {
                data = value.datas[name];
            }
            return data;
        },

        newData(object, refCount) {
            return { object, refCount };
        },

        resetData(data) {
            if (!!data) {
                data.object = null;
                data.refCount = 0;
            }
        },

        getObject(data) {
            let obj = null;
            if (!!data && !!data.object) {
                obj = data.object;
            }
            return obj;
        },

        addRefCount(data) {
            if (!!data) {
                data.refCount++;
            }
        },

        subRefCount(data) {
            if (!!data) {
                data.refCount--;
            }
        },

        getRefCount(data) {
            return data.refCount;
        },

        // 删除一个缓存索引
        removeIndex: function (dirs, dir, name) {
            let value = dirs[dir];
            if (value && !!value.datas && value.datas[name]) {
                delete value.datas[name];
            }
        },

        // 释放实际资源
        releaseObject(object) {
            if (!!object) {
                let deps = cc.loader.getDependsRecursively(object);
                if (deps) {
                    cc.loader.release(deps); 
                }
            }
        },

        // 释放一项资源
        releaseOne: function (dirs, dir, name, config) {
            let bReleased = false;
            let data = this.getData(dirs, dir, name);
            if (data) {
                this.subRefCount(data);
                if (data.refCount <= 0 || (!!config && config.force === true)) {
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
        releaseDir: function (dirs, dir) {
            let value = dirs[dir];
            if (value && !!value.datas) {
                for (let key in value.datas) {
                    this.releaseOne(dirs, dir, key, { force:true });
                }
                value.datas = {};
            }
        },
    },

});