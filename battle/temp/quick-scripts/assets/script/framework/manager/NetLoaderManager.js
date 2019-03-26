(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/manager/NetLoaderManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '31844ifvhhJFJJOXSPPFajW', 'NetLoaderManager', __filename);
// script/framework/manager/NetLoaderManager.js

'use strict';

//解决GameHelper中无法引用NetHelper的问题
var ResManager = require('ResManager');
var Global = require('Global');

var NetLoaderManager = {
    netStatus: cc.Enum({ difference: 0, general: 1, good: 2 }),
    genralLevel: 250,
    goodLevel: 20,
    oldPrefabs: [{ name: 'TreasureHuntFishStartPanel', clockId: -1 }, { name: 'treasureHuntFishView', clockId: -1 }, { name: 'palaceTip', clockId: -1 }, { name: 'palace', clockId: -1 }],
    needCheckPrefabs: [],
    isInit: false,

    initPrefabs: function initPrefabs() {
        if (this.isInit) {
            return;
        }
        for (var key in ResManager.prefabURL) {
            var item = ResManager.prefabURL[key];
            // let url = PrefabManager.fullPath(item.dir, item.name);
            // let arr = url.split('/');
            // let panelName = arr[arr.length - 1];
            this.needCheckPrefabs.push({ name: item.name, clockId: -1 });
        }

        for (var i = 0; i < this.oldPrefabs.length; i++) {
            this.needCheckPrefabs.push(this.oldPrefabs[i]);
        }
        this.isInit = true;
    },

    //网络延迟大的情况下，提示玩家网络状态不好
    startCheckStatus: function startCheckStatus(url) {
        var _this = this;

        //网络状态不佳的时开启检查
        if (this.getNetPower() === this.netStatus.difference) {
            if (!!url) {
                var arr = url.split('/');
                var panelName = arr[arr.length - 1];
                if (!!panelName) {
                    var _loop = function _loop(i) {
                        if (panelName === _this.needCheckPrefabs[i].name && _this.needCheckPrefabs[i].clockId < 0) {
                            _this.needCheckPrefabs[i].clockId = setTimeout(function () {
                                // Global.CommomUICtl.initCreateTips({tip: "当前网络状态不佳!", time: 2});
                                require('UIManager').showUI(ResManager.prefabURL.reconnectionView, 1);
                                _this.needCheckPrefabs[i].clockId = -1;
                            }, 4000);
                            return 'break';
                        }
                    };

                    for (var i = 0; i < this.needCheckPrefabs.length; i++) {
                        var _ret = _loop(i);

                        if (_ret === 'break') break;
                    }
                }
            }
        }
    },

    //关闭网络延迟提示
    closeCheckStatus: function closeCheckStatus(object) {
        if (!object) {
            return;
        }
        var name = object.name;
        if (!!name) {
            for (var i = 0; i < this.needCheckPrefabs.length; i++) {
                if (name === this.needCheckPrefabs[i].name) {
                    if (this.needCheckPrefabs[i].clockId >= 0) {
                        clearTimeout(this.needCheckPrefabs[i].clockId);

                        this.needCheckPrefabs[i].clockId = -1;
                    }
                    break;
                }
            }
        }
    },

    getNetPower: function getNetPower() {
        if (Global.netDelayTime <= this.goodLevel) {
            return this.netStatus.good;
        } else if (Global.netDelayTime <= this.genralLevel) {
            return this.netStatus.general;
        } else {
            return this.netStatus.difference;
        }
        return this.netStatus.general;
    },

    clear: function clear() {
        for (var i = 0; i < this.needCheckPrefabs.length; i++) {
            if (this.needCheckPrefabs[i].clockId > -1) {
                clearTimeout(this.needCheckPrefabs[i].clockId);
                this.needCheckPrefabs[i].clockId = -1;
            }
        }
    }

};
module.exports = NetLoaderManager;

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
        //# sourceMappingURL=NetLoaderManager.js.map
        