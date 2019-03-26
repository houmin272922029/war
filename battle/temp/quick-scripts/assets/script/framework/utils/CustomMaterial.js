(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/utils/CustomMaterial.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'daba5mut7RNZpm6tgoGRwUO', 'CustomMaterial', __filename);
// script/framework/utils/CustomMaterial.js

'use strict';

/**
 * 自定义材质
 */

var renderEngine = cc.renderer.renderEngine;
var renderer = renderEngine.renderer;
var gfx = renderEngine.gfx;
var Material = renderEngine.Material;

var CustomMaterial = function (Material$$1) {
	function CustomMaterial(shaderName, params, defines) {
		Material$$1.call(this, false);

		var pass = new renderer.Pass(shaderName);
		pass.setDepth(false, false);
		pass.setCullMode(gfx.CULL_NONE);
		pass.setBlend(gfx.BLEND_FUNC_ADD, gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA, gfx.BLEND_FUNC_ADD, gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA);

		var techParams = [{ name: 'texture', type: renderer.PARAM_TEXTURE_2D }, { name: 'color', type: renderer.PARAM_COLOR4 }];
		if (params) {
			techParams = techParams.concat(params);
		}
		var mainTech = new renderer.Technique(['transparent'], techParams, [pass]);

		this.name = shaderName;
		this._color = { r: 1, g: 1, b: 1, a: 1 };
		this._effect = new renderer.Effect([mainTech], {}, defines);

		this._mainTech = mainTech;
		this._texture = null;
	}

	if (Material$$1) CustomMaterial.__proto__ = Material$$1;
	CustomMaterial.prototype = Object.create(Material$$1 && Material$$1.prototype);
	CustomMaterial.prototype.constructor = CustomMaterial;

	var prototypeAccessors = { effect: { configurable: true }, texture: { configurable: true }, color: { configurable: true } };

	prototypeAccessors.effect.get = function () {
		return this._effect;
	};

	prototypeAccessors.texture.get = function () {
		return this._texture;
	};

	prototypeAccessors.texture.set = function (val) {
		if (this._texture !== val) {
			this._texture = val;
			this._effect.setProperty('texture', val.getImpl());
			this._texIds['texture'] = val.getId();
		}
	};

	prototypeAccessors.color.get = function () {
		return this._color;
	};

	prototypeAccessors.color.set = function (val) {
		var color = this._color;
		color.r = val.r / 255;
		color.g = val.g / 255;
		color.b = val.b / 255;
		color.a = val.a / 255;
		this._effect.setProperty('color', color);
	};

	CustomMaterial.prototype.clone = function clone() {
		var copy = new CustomMaterial();
		copy.texture = this.texture;
		copy.color = this.color;
		copy.updateHash();
		return copy;
	};

	// 设置自定义参数的值
	CustomMaterial.prototype.setParamValue = function (name, value) {
		this._effect.setProperty(name, value);
	};

	// 设置定义值
	CustomMaterial.prototype.setDefine = function (name, value) {
		this._effect.define(name, value);
	};

	Object.defineProperties(CustomMaterial.prototype, prototypeAccessors);

	return CustomMaterial;
}(Material);

module.exports = CustomMaterial;

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
        //# sourceMappingURL=CustomMaterial.js.map
        