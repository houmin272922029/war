(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/net/errorCode.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'af489uJTcZPco34pX9r4lK8', 'errorCode', __filename);
// script/framework/net/errorCode.js

'use strict';

module.exports.errCode = {
    argError: '1', //参数错误
    unOperator: '2', //操作不存在
    repeatName: '1001', //名字重复
    RoleNonExistent: '1002', //角色不存在
    RoomNonExistent: '1003', //房间不存在
    nonOnline: '1004', //不在线
    noBankruptcy: '1005', //不处于破产状态
    noCompensate: '1006', //没有补偿金次数
    atCompensate: '1007' //补偿金cd中
};

module.exports.errCodeMsg = {};

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
        //# sourceMappingURL=errorCode.js.map
        