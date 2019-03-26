"use strict";
cc._RF.push(module, '2a26cFCQfRPfJ0T3PldNVfW', 'OverlayShader');
// script/framework/utils/OverlayShader.js

"use strict";

// Shader: 纹理与颜色叠加

var overlay = {
    name: "overlay",

    defines: [],

    vert: "uniform mat4 viewProj;\n        attribute vec3 a_position;\n        attribute vec2 a_uv0;\n        varying vec2 uv0;\n        void main () {\n            vec4 pos = viewProj * vec4(a_position, 1);\n            gl_Position = pos;\n            uv0 = a_uv0;\n        }\n        ",

    frag: "uniform sampler2D texture;\n        varying vec2 uv0;\n        uniform vec4 color;\n        void main() \n        { \n            vec4 texColor = texture2D(texture, uv0);  \n            if (texColor.r <= 0.5)\n            gl_FragColor.r = 2.0 * texColor.r * color.r;\n            else\n            gl_FragColor.r = 1.0 - 2.0 * (1.0 - texColor.r) * (1.0 - color.r);\n            if (texColor.g <= 0.5)\n            gl_FragColor.g = 2.0 * texColor.g * color.g;\n            else\n            gl_FragColor.g = 1.0 - 2.0 * (1.0 - texColor.g) * (1.0 - color.g);\n            if (texColor.b <= 0.5)\n            gl_FragColor.b = 2.0 * texColor.b * color.b;\n            else\n            gl_FragColor.b = 1.0 - 2.0 * (1.0 - texColor.b) * (1.0 - color.b);\n            gl_FragColor.a = texColor.a * color.a;\n        }"
};

module.exports = overlay;

cc._RF.pop();