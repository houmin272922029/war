(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/utils/SpriteHook.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '6d3d0k0QANHzakpT/AiCEZl', 'SpriteHook', __filename);
// script/framework/utils/SpriteHook.js

"use strict";

var SpriteHook = {};

SpriteHook.init = function (callback) {
    // 支持自定义Shader
    var renderEngine = cc.renderer.renderEngine;
    var SpriteMaterial = renderEngine.SpriteMaterial;
    var GraySpriteMaterial = renderEngine.GraySpriteMaterial;
    var STATE_CUSTOM = 101;

    // 取自定义材质
    cc.Sprite.prototype.getMaterial = function (name) {
        if (this._materials) {
            return this._materials[name];
        } else {
            return undefined;
        }
    };

    // 设置自定义材质
    cc.Sprite.prototype.setMaterial = function (name, mat) {
        if (!this._materials) {
            this._materials = {};
        }
        this._materials[name] = mat;
    };

    // 激活某个材质
    cc.Sprite.prototype.activateMaterial = function (name) {
        var mat = this.getMaterial(name);
        if (mat && mat !== this._currMaterial) {
            if (mat) {
                if (this.node) {
                    mat.color = this.node.color;
                }
                if (this.spriteFrame) {
                    mat.texture = this.spriteFrame.getTexture();
                }
                this.node._renderFlag |= cc.RenderFlow.FLAG_COLOR;
                this._currMaterial = mat;
                this._currMaterial.name = name;
                this._state = STATE_CUSTOM;
                this._activateMaterial();
            } else {
                console.error("activateMaterial - unknwon material: ", name);
            }
        }
    };

    // 取当前的材质
    cc.Sprite.prototype.getCurrMaterial = function () {
        if (this._state === STATE_CUSTOM) {
            return this._currMaterial;
        }
    };

    cc.Sprite.prototype._activateMaterial = function () {
        var spriteFrame = this._spriteFrame;

        // WebGL
        if (cc.game.renderType !== cc.game.RENDER_TYPE_CANVAS) {
            // Get material
            var material = void 0;
            if (this._state === cc.Sprite.State.GRAY) {
                if (!this._graySpriteMaterial) {
                    this._graySpriteMaterial = new GraySpriteMaterial();
                    this.node._renderFlag |= cc.RenderFlow.FLAG_COLOR;
                }
                material = this._graySpriteMaterial;
                this._currMaterial = null;
            } else if (this._state === STATE_CUSTOM) {
                if (!this._currMaterial) {
                    console.error("_activateMaterial: _currMaterial undefined!");
                    return;
                }
                material = this._currMaterial;
            } else {
                if (!this._spriteMaterial) {
                    this._spriteMaterial = new SpriteMaterial();
                    this.node._renderFlag |= cc.RenderFlow.FLAG_COLOR;
                }
                material = this._spriteMaterial;
                this._currMaterial = null;
            }
            // Set texture
            if (spriteFrame && spriteFrame.textureLoaded()) {
                var texture = spriteFrame.getTexture();
                if (material.texture !== texture) {
                    material.texture = texture;
                    this._updateMaterial(material);
                } else if (material !== this._material) {
                    this._updateMaterial(material);
                }
                if (this._renderData) {
                    this._renderData.material = material;
                }
                this.markForUpdateRenderData(true);
                this.markForRender(true);
            } else {
                this.disableRender();
            }
        }
    };

    //extentions
    cc.Node.prototype.useShader = function (name, param) {
        var sp = this.getComponent(cc.Sprite);
        if (!sp) {
            // log.error('there is no sprite to use Shader!');
            return;
        }
        var mat = sp.getMaterial(name);
        if (!mat) {
            var CustomMaterial = require("CustomMaterial");
            mat = new CustomMaterial(name, param);
            sp.setMaterial(name, mat);
        }
        sp.activateMaterial(name);
        return mat;
    };
    // 重置
    cc.Node.prototype.resetShader = function () {
        this.color = new cc.Color().fromHEX('#FFFFFF');
        var sp = this.getComponent(cc.Sprite);
        if (!sp) {
            log.error('there is no sprite to reset Shader!');
            return;
        }
        sp.spriteFrame.getTexture().update({ flipY: false });
        sp.setState(cc.Sprite.State.NORMAL);
    };

    var lib = require('ShaderLib');
    lib.addShader(require('OverlayShader'));
    if (callback) callback();
};

module.exports = SpriteHook;

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
        //# sourceMappingURL=SpriteHook.js.map
        