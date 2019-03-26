(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/utils/FuncTools.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'bfa1aFxTt1K1Y9JW0vgsHen', 'FuncTools', __filename);
// script/framework/utils/FuncTools.js

'use strict';

var ConfigManager = require('ConfigManager');

var FuncTools = {
    funcNames: [{ name: 'match', toggle: 0 }, { name: 'item_send', toggle: 0 }, { name: 'item_sell', toggle: 0 }, { name: 'match_item', toggle: 0 }, { name: 'exchange', toggle: 0 }, { name: 'charge', toggle: 0 }], //功能名称
    itemIdToFuncs: { 'match_item': [1204] }, //功能对应的id
    //初始化功能开启掩码
    initFunMask: function initFunMask(code) {
        for (var i = 0; i < this.funcNames.length; i++) {
            this.funcNames[i].toggle = code & Math.pow(2, i);
            cc.log(this.funcNames[i], code);
        }
        this.exchangeItemConfig();
    },

    //获得功能开关
    getFuncStatus: function getFuncStatus(name) {
        for (var i = 0; i < this.funcNames.length; i++) {
            if (this.funcNames[i].name === name) {
                return this.funcNames[i].toggle > 0;
            }
        }
        return false;
    },

    //转换
    exchangeItemConfig: function exchangeItemConfig() {
        if (this.getFuncStatus('match_item')) {
            var itemFConfig = ConfigManager.getConfig('Item-f');
            var itemConfig = ConfigManager.getConfig('Item');
            var newConfigs = [];
            if (!!itemFConfig) {
                for (var i = 0; i < itemFConfig.length; i++) {
                    for (var j = 0; j < this.itemIdToFuncs['match_item'].length; j++) {
                        if (itemFConfig[i].itemid === this.itemIdToFuncs['match_item'][j]) {
                            newConfigs.push(itemFConfig[i]);
                            break;
                        }
                    }
                }
            }

            if (!!newConfigs && !!itemConfig) {
                for (var n = 0; n < newConfigs.length; n++) {
                    for (var m = 0; m < itemConfig.length; m++) {
                        if (newConfigs[n].itemid === itemConfig[m].itemid) {
                            itemConfig[m] = newConfigs[n];
                            break;
                        }
                    }
                }
            }
        }
    }

};
module.exports = FuncTools;

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
        //# sourceMappingURL=FuncTools.js.map
        