(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/manager/UIManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '13f4aXxAalNQaZ4Al6sZ3Dt', 'UIManager', __filename);
// script/framework/manager/UIManager.js

'use strict';

var SpriteManager = require('SpriteManager');
var PrefabManager = require('PrefabManager');

var UIManager = {
    uimap: {},
    uuidMap: {},

    reset: function reset() {
        for (var uuid in this.uimap) {
            var ui = this.uimap[uuid].ui;
            if (ui && cc.isValid(ui)) ui.destroy();
        }
        this.uimap = {};
    },


    createUI: function createUI(prefab, url) {
        var key = prefab.data.uuid;
        if (!!this.uimap[key]) {
            // 已有实例则不生成新ui
            return [0, this.uimap[key].ui];
        }
        var ui = cc.instantiate(prefab);
        // this._dynamicResAutoRelease(ui);
        this.uuidMap[ui.uuid] = key;
        this.uimap[key] = { ui: ui, prefab: prefab, url: url, isOpen: true };
        return [1, this.uimap[key].ui];
    },

    getUIInstance: function getUIInstance(uuid, isClose) {
        uuid = this.uuidMap[uuid];
        if (!!isClose) {
            if (!!this.uimap[uuid]) {
                this.uimap[uuid].isOpen = false;
            }
        }
        return this.uimap[uuid] ? this.uimap[uuid].ui : undefined;
    },

    removeUI: function removeUI(uuid) {
        // cc.loader.releaseAsset(this.uimap[uuid].prefab);
        // cc.loader.release(this.uimap[uuid].prefab);
        // let deps = cc.loader.getDependsRecursively(this.uimap[uuid].prefab);
        uuid = this.uuidMap[uuid];
        delete this.uuidMap[uuid];
        this.uimap[uuid].ui.destroy();
        delete this.uimap[uuid];
    },

    //打开ui
    showUI: function showUI(prefabURL, data) {
        var _this = this;

        PrefabManager.load(prefabURL.dir, prefabURL.name, function (prefab) {
            var url = PrefabManager.fullPath(prefabURL.dir, prefabURL.name);
            var arr = _this.createUI(prefab, url);
            if (arr && arr[0] <= 0) {
                return;
            }
            var baseUINode = arr[1];
            baseUINode.inHiding = true;
            var script = baseUINode.getComponent('BaseUI');
            script.setClickOtherClose(prefabURL.clickOtherClose);
            script.onShow(prefab, data);
        });
    },

    //关闭面板
    closeUI: function closeUI(prefabURL) {
        var url = PrefabManager.fullPath(prefabURL.dir, prefabURL.name);
        if (!!prefabURL && !!url) {
            for (var key in this.uimap) {
                if (url === this.uimap[key].url) {
                    var baseUINode = this.uimap[key].ui;
                    if (cc.isValid(baseUINode)) {
                        var script = baseUINode.getComponent('BaseUI');
                        script.onClose();
                    }

                    break;
                }
            }
        }
    },

    isPanelOpen: function isPanelOpen(item) {
        var url = PrefabManager.fullPath(item.dir, item.name);
        if (url) {
            for (var key in this.uimap) {
                if (this.uimap[key].url === url) {
                    return this.uimap[key].isOpen;
                }
            }
        }
        return false;
    },

    // 自动管理动态资源
    _dynamicResAutoRelease: function _dynamicResAutoRelease(ui) {
        this._cacheTextures(ui);
        for (var i in ui.children) {
            this._dynamicResAutoRelease(ui.children[i]);
        }
    },

    _cacheTextures: function _cacheTextures(node) {
        var sprite = node.getComponent(cc.Sprite);
        if (sprite && sprite.spriteFrame) {
            SpriteManager._cacheTexture(sprite, SpriteManager._simplifyPath(sprite.spriteFrame._textureFilename));
        }

        var button = node.getComponent(cc.Button);
        if (button) {
            if (button.normalSprite && button.normalSprite.spriteFrame) {
                SpriteManager._cacheTexture(button.normalSprite, SpriteManager._simplifyPath(button.normalSprite.spriteFrame._textureFilename));
            }

            if (button.pressedSprite && button.pressedSprite.spriteFrame) {
                SpriteManager._cacheTexture(button.pressedSprite, SpriteManager._simplifyPath(button.pressedSprite.spriteFrame._textureFilename));
            }

            if (button.hoverSprite && button.hoverSprite.spriteFrame) {
                SpriteManager._cacheTexture(button.hoverSprite, SpriteManager._simplifyPath(button.hoverSprite.spriteFrame._textureFilename));
            }

            if (button.disabledSprite && button.disabledSprite.spriteFrame) {
                SpriteManager._cacheTexture(button.disabledSprite, SpriteManager._simplifyPath(button.disabledSprite.spriteFrame._textureFilename));
            }
        }

        var label = node.getComponent(cc.Label);
        if (label && label.font && label.font instanceof cc.BitmapFont && label.font.spriteFrame) {
            SpriteManager._cacheTexture(label.font, SpriteManager._simplifyPath(label.font.spriteFrame._textureFilename));
        }

        var richText = node.getComponent(cc.RichText);
        if (richText && richText.imageAtlas) {
            var keys = Object.keys(richText.imageAtlas._spriteFrames);
            if (keys.length > 0) {
                SpriteManager._cacheTexture(richText, SpriteManager._simplifyPath(richText.imageAtlas._spriteFrames[keys[0]]._textureFilename));
            }
        }

        var particleSystem = node.getComponent(cc.ParticleSystem);
        if (particleSystem && particleSystem._texture) {
            SpriteManager._cacheTexture(particleSystem, SpriteManager._simplifyPath(particleSystem._texture.url));
        }

        var pageViewIndicator = node.getComponent(cc.PageViewIndicator);
        if (pageViewIndicator && pageViewIndicator.spriteFrame) {
            SpriteManager._cacheTexture(pageViewIndicator, SpriteManager._simplifyPath(pageViewIndicator.spriteFrame._textureFilename));
        }

        var editBox = node.getComponent(cc.EditBox);
        if (editBox && editBox.backgroundImage) {
            SpriteManager._cacheTexture(editBox, SpriteManager._simplifyPath(editBox.backgroundImage._textureFilename));
        }

        var mask = node.getComponent(cc.Mask);
        if (mask && mask.spriteFrame) {
            SpriteManager._cacheTexture(mask, SpriteManager._simplifyPath(mask.spriteFrame._textureFilename));
        }
    }
};

module.exports = UIManager;

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
        //# sourceMappingURL=UIManager.js.map
        