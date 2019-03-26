(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/manager/LocalStorageManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'bd82bCpIP9HCYQY5WcTggNG', 'LocalStorageManager', __filename);
// script/framework/manager/LocalStorageManager.js

"use strict";

//本地存储 包括一个时间计算

var LocalStorageManager = {

    setItem: function setItem(key, value) {
        cc.sys.localStorage.setItem(key, value);
    },

    getItem: function getItem(key) {
        return cc.sys.localStorage.getItem(key);
    },

    setJsonItem: function setJsonItem(key, jsonData) {
        cc.sys.localStorage.setItem(key, JSON.stringify(jsonData));
    },

    getJsonItem: function getJsonItem(key) {
        var str = cc.sys.localStorage.getItem(key);
        if (!!str) {
            return JSON.parse(str);
        }
        return null;
    },

    removeItem: function removeItem(key) {
        cc.sys.localStorage.removeItem(key);
    },

    //检查当前key存储的数据是否是在当前天
    //需要存储的格式{time:xxxx,count:xxxx}
    isSameDay: function isSameDay(key) {
        var data = this.getJsonItem(key);
        if (!!data && !!data.time) {
            var nowDate = new Date(Date.now());
            var saveDate = new Date(data.time);
            if (nowDate.getFullYear() != saveDate.getFullYear() || nowDate.getMonth() != saveDate.getMonth() || nowDate.getDate() != saveDate.getDate()) {
                return false;
            }
        }
        return true;
    }

};
module.exports = LocalStorageManager;

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
        //# sourceMappingURL=LocalStorageManager.js.map
        