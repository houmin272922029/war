const SpriteManager = require('SpriteManager');
const PrefabManager = require('PrefabManager');

let UIManager = {
    uimap: {},
    uuidMap: {},

    reset() {
        for (let uuid in this.uimap) {
            let ui = this.uimap[uuid].ui;
            if (ui && cc.isValid(ui)) ui.destroy();
        }
        this.uimap = {};
    },

    createUI: function (prefab, url) {
        let key = prefab.data.uuid;
        if (!!this.uimap[key]) {
            // 已有实例则不生成新ui
            return [0, this.uimap[key].ui];
        }
        let ui = cc.instantiate(prefab);
        // this._dynamicResAutoRelease(ui);
        this.uuidMap[ui.uuid] = key;
        this.uimap[key] = { ui: ui, prefab: prefab, url: url, isOpen: true };
        return [1, this.uimap[key].ui];
    },

    getUIInstance: function (uuid, isClose) {
        uuid = this.uuidMap[uuid];
        if (!!isClose) {
            if (!!this.uimap[uuid]) {
                this.uimap[uuid].isOpen = false;
            }
        }
        return this.uimap[uuid] ? this.uimap[uuid].ui : undefined;
    },

    removeUI: function (uuid) {
        // cc.loader.releaseAsset(this.uimap[uuid].prefab);
        // cc.loader.release(this.uimap[uuid].prefab);
        // let deps = cc.loader.getDependsRecursively(this.uimap[uuid].prefab);
        uuid = this.uuidMap[uuid];
        delete this.uuidMap[uuid];
        this.uimap[uuid].ui.destroy();
        delete this.uimap[uuid];
    },

    //打开ui
    showUI: function (prefabURL, data) {
        PrefabManager.load(prefabURL.dir, prefabURL.name, (prefab) => {
            let url = PrefabManager.fullPath(prefabURL.dir, prefabURL.name);
            let arr = this.createUI(prefab, url);
            if (arr && arr[0] <= 0) {
                return
            }
            let baseUINode = arr[1];
            baseUINode.inHiding = true;
            let script = baseUINode.getComponent('BaseUI');
            script.setClickOtherClose(prefabURL.clickOtherClose);
            script.onShow(prefab, data);
        });
    },

    //关闭面板
    closeUI: function (prefabURL) {
        let url = PrefabManager.fullPath(prefabURL.dir, prefabURL.name);
        if (!!prefabURL && !!url) {
            for (let key in this.uimap) {
                if (url === this.uimap[key].url) {
                    let baseUINode = this.uimap[key].ui;
                    if (cc.isValid(baseUINode)) {
                        let script = baseUINode.getComponent('BaseUI');
                        script.onClose();
                    }

                    break;
                }
            }
        }

    },

    isPanelOpen: function (item) {
        let url = PrefabManager.fullPath(item.dir, item.name);
        if (url) {
            for (let key in this.uimap) {
                if (this.uimap[key].url === url) {
                    return this.uimap[key].isOpen;
                }
            }
        }
        return false;
    },

    // 自动管理动态资源
    _dynamicResAutoRelease: function (ui) {
        this._cacheTextures(ui);
        for (let i in ui.children) {
            this._dynamicResAutoRelease(ui.children[i]);
        }
    },

    _cacheTextures: function (node) {
        let sprite = node.getComponent(cc.Sprite);
        if (sprite && sprite.spriteFrame) {
            SpriteManager._cacheTexture(sprite, SpriteManager._simplifyPath(sprite.spriteFrame._textureFilename));
        }

        let button = node.getComponent(cc.Button);
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

        let label = node.getComponent(cc.Label);
        if (label && label.font && label.font instanceof cc.BitmapFont && label.font.spriteFrame) {
            SpriteManager._cacheTexture(label.font, SpriteManager._simplifyPath(label.font.spriteFrame._textureFilename));
        }

        let richText = node.getComponent(cc.RichText);
        if (richText && richText.imageAtlas) {
            let keys = Object.keys(richText.imageAtlas._spriteFrames);
            if (keys.length > 0) {
                SpriteManager._cacheTexture(richText, SpriteManager._simplifyPath(richText.imageAtlas._spriteFrames[keys[0]]._textureFilename));
            }
        }

        let particleSystem = node.getComponent(cc.ParticleSystem);
        if (particleSystem && particleSystem._texture) {
            SpriteManager._cacheTexture(particleSystem, SpriteManager._simplifyPath(particleSystem._texture.url));
        }

        let pageViewIndicator = node.getComponent(cc.PageViewIndicator);
        if (pageViewIndicator && pageViewIndicator.spriteFrame) {
            SpriteManager._cacheTexture(pageViewIndicator, SpriteManager._simplifyPath(pageViewIndicator.spriteFrame._textureFilename));
        }

        let editBox = node.getComponent(cc.EditBox);
        if (editBox && editBox.backgroundImage) {
            SpriteManager._cacheTexture(editBox, SpriteManager._simplifyPath(editBox.backgroundImage._textureFilename));
        }

        let mask = node.getComponent(cc.Mask);
        if (mask && mask.spriteFrame) {
            SpriteManager._cacheTexture(mask, SpriteManager._simplifyPath(mask.spriteFrame._textureFilename));
        }
    }
}

module.exports = UIManager;