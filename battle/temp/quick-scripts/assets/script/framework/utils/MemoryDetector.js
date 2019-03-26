(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/utils/MemoryDetector.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '443b4JrA0FMZKkN+V/9fx/z', 'MemoryDetector', __filename);
// script/framework/utils/MemoryDetector.js

'use strict';

var MemoryDetector = {
    _inited: false,

    showMemoryStatus: function showMemoryStatus() {
        if (cc.sys.isNative) {
            return;
        }

        if (this._inited) {
            return;
        }

        var _memLabel = null;
        var profiler = cc.profiler;
        profiler.showStats();

        var createMemLabel = function createMemLabel() {
            _memLabel = document.createElement('div');
            profiler._fps = document.getElementById('fps');
            profiler._fps.style.height = '100px';

            log.info();
            var style = _memLabel.style;
            style.color = 'rgb(0, 255, 255)';
            style.font = 'bold 12px Helvetica, Arial';
            style.lineHeight = '20px;';
            style.width = '100%';
            profiler._fps.appendChild(_memLabel);
        };

        createMemLabel();

        var afterVisit = function afterVisit() {
            var count = 0;
            var totalBytes = 0;
            var locTexrues = cc.textureCache._textures;
            for (var key in locTexrues) {
                var selTexture = locTexrues[key];
                count++;
                totalBytes += selTexture.getPixelWidth() * selTexture.getPixelHeight() * 4;
            }

            var locTextureColorsCache = cc.textureCache._textureColorsCache;

            for (var _key in locTextureColorsCache) {
                var selCanvasColorsArr = locTextureColorsCache[_key];
                for (var selCanvasKey in selCanvasColorsArr) {
                    var selCanvas = selCanvasColorsArr[selCanvasKey];
                    count++;
                    totalBytes += selCanvas.width * selCanvas.height * 4;
                }
            }
            _memLabel.innerHTML = "  Memory  " + (totalBytes / (1024.0 * 1024.0)).toFixed(2) + " M";
        };

        cc.director.on(cc.Director.EVENT_AFTER_VISIT, afterVisit);

        this._inited = true;
    }
};

module.exports = MemoryDetector;

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
        //# sourceMappingURL=MemoryDetector.js.map
        