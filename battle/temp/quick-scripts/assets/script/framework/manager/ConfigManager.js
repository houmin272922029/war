(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/manager/ConfigManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'f188abk7DFI+oR89OmgXm0L', 'ConfigManager', __filename);
// script/framework/manager/ConfigManager.js

'use strict';

//配置管理类
var ConfigManager = {
    dataMap: {},

    init: function init(callback) {
        var self = this;
        cc.loader.loadRes('conf/allConf', function (err, object) {
            if (err) {
                log.error('error to read Config:' + err || err.message);
            } else {
                for (var key in object.json) {
                    self.dataMap[key] = object.json[key];
                }
            }
            if (!!callback) {
                callback(err);
            }
        });
    },

    /**
     * 
     * @param {*配置文件名} file 
     * @param {*异步加载完成回调} callback 
     */
    getConfig: function getConfig(file, callback) {
        var self = this;
        var config = self.dataMap[file];
        if (config) {
            !!callback && callback(config);
            return config;
        }

        // 缓存未找到，执行异步加载
        cc.loader.loadRes('conf/Conf' + file, function (err, object) {
            if (err) {
                log.error('ConfigManager.getConfig: file=' + file + ', err:' + err || err.message);
                return;
            }
            self.dataMap[file] = object.json;
            !!callback && callback(self.dataMap[file]);
        });
    },

    // 根据鱼Id返回鱼属性表中相应的行
    getFishConfById: function getFishConfById(fishId) {
        var fishTable = this.getConfig('FishAttribute');
        return fishTable[fishId - 1];
    },

    //根据id获得道具配置
    getItemConfById: function getItemConfById(id) {
        for (var j = 0; j < this.dataMap.Item.length; j++) {
            if (this.dataMap.Item[j].itemid === parseInt(id)) {
                return this.dataMap.Item[j];
            }
        }
        return null;
    }

};

module.exports = ConfigManager;

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
        //# sourceMappingURL=ConfigManager.js.map
        