(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/utils/ShaderLib.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'fc6c3+sNq1OwIIiVdFI6hUM', 'ShaderLib', __filename);
// script/framework/utils/ShaderLib.js

"use strict";

/**
 * Shader库
 */

var ShaderLib = {
    _shaders: {},

    // 增加一个新的Shader
    addShader: function addShader(shader) {
        if (this._shaders[shader.name]) {
            console.error("addShader - shader already exist: ", shader.name);
            return;
        }
        cc.renderer._forward._programLib.define(shader.name, shader.vert, shader.frag, shader.defines);
        this._shaders[shader.name] = shader;
    },

    // 取Shader的定义
    getShader: function getShader(name) {
        return this._shaders[name];
    }
};

module.exports = ShaderLib;

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
        //# sourceMappingURL=ShaderLib.js.map
        