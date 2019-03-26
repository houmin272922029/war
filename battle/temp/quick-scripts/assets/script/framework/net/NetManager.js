(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/net/NetManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '6e952S1kDJBVpd/hzc42VRS', 'NetManager', __filename);
// script/framework/net/NetManager.js

'use strict';

var AudioManager = require('AudioManager');
var Global = require('Global');
var NetManager = {};

/**
 * 初始化网络相关
 */
NetManager.init = function (callBack) {

    NetCore.init(function () {
        cc.game.on(cc.game.EVENT_SHOW, function () {
            log.info('cc.game.EVENT_SHOW'); //切出后台
            AudioManager.resumeMusicEffect();
            Global.gameHide = false;
            game.EventManager.dispatchEvent('GAME_RESUME');
        });
        cc.game.on(cc.game.EVENT_HIDE, function () {
            log.info('cc.game.EVENT_HIDE'); //切入后台
            Global.gameHide = true;
            game.EventManager.dispatchEvent('GAME_PAUSE');
        });
        if (!!callBack) {
            callBack();
        }
    });
};

/**
 * 发送消息
 * @param {*消息头} msgId
 * @param {*消息体   例如(CSLogin)：{type: 1, account : 'login account'}} data
 */
/*
NetManager.sendMessage = function (msgId, data) {
    var proto = game.Protobuf.getProtoClassByID(msgId);
    if (!proto) {
        log.error('can not find proto by id = {}, messageData = {}', msgId, data);
    } else {
        var msg = new proto();
        for (var key in data) {
            var value = data[key];
            var callStr = 'set';
            // 首字母大写
            key = key.toLowerCase();
            key = key.substring(0, 1).toUpperCase() + key.substring(1);
            callStr += key;
            if (value instanceof Array) {
                callStr += 'List';
            }
            if (typeof msg[callStr] == 'function') {
                msg[callStr](value);
            } else {
                log.error('can not find caller {} in {}', callStr, proto.type);
                return;
            }
        }
        log.info('NetManager sendMessage = {}, {}', msgId, msg);
        NetCore.sendMessage(msgId, msg.serializeBinary());
    }
};
*/
NetManager.sendMessage = function (msgId, pbData) {
    var status = NetManager.sendMessageLimit(msgId);
    if (status) {
        return;
    }
    var genProto = function genProto(data) {
        var proto = null;
        if (!!data.msgId) {
            // 通过协议号查找消息
            proto = game.Protobuf.getProtoClassByID(data.msgId);
        } else {
            // 通过协议名称查找消息
            proto = require(data.protoFile)[data.messageName];
            // var msgName = data.messageName;
            // var profile = require(data.protoFile);
            // proto = profile.msgName;
        }
        if (!!proto) {
            var msg = new proto();
            for (var key in data) {
                if (key == 'msgId') continue;
                if (key == 'protoFile') continue;
                if (key == 'messageName') continue;

                var value = data[key];
                var callStr = 'set';
                // 首字母大写
                key = key.toLowerCase();
                key = key.substring(0, 1).toUpperCase() + key.substring(1);
                callStr += key;
                if (value instanceof Object) {
                    if (value instanceof Array) {
                        callStr += 'List';
                        if (value[0] instanceof Object) {
                            var arr = [];
                            var arr1 = [];
                            for (var i in value) {
                                arr.push(genProto(value[i]));
                            }
                            value = arr;
                        }
                    } else {
                        // 子协议递归
                        value = genProto(value);
                    }
                }
                if (typeof msg[callStr] == 'function') {
                    msg[callStr](value);
                } else {
                    log.error('can not find caller {} in {}', callStr, proto.type);
                    return null;
                }
            }
            return msg;
        }
        return null;
    };

    pbData.msgId = msgId;
    var msg = genProto(pbData);
    if (!!msg) {
        NetCore.sendMessage(msgId, msg.serializeBinary());
        // require('UIWaiting').show();
    } else {
        log.error('gen message failed! msgId = {}, data = {}', msgId, pbData);
    }
};

/**
 * 获取服务器地址
 */
NetManager.getGameServerAddress = function () {};

/**
 * 连接至服务器
 */
NetManager.connectToGameServer = function (url) {
    log.info("create socket long_connect");
    NetCore.Connect(url, onConnected, onMessageIn, onConnectError, onConnectClosed, onReconnectFailed);
};

//获得连接状态
NetManager.getContentStatus = function () {
    var status = 'close';
    if (NetCore.contentStatus === -1) {
        status = 'close';
    } else if (NetCore.contentStatus === 0) {
        status = 'connecting';
    } else {
        status = 'connected';
    }
    return status;
};

NetManager.socketReadyState = function () {
    return NetCore.readyState();
};

//断开连接
NetManager.disConnect = function () {
    NetCore.disConnect();
};

//重连
NetManager.reconnnet = function () {
    NetCore.disConnect();
    NetCore.ReconnectTimes = NetCore.ReconnectMaxTimes; // 设置重连次数
    NetCore.Reconnect();
};
//获得是否是断线重连上的
NetManager.getIsReconnect = function () {
    return NetCore.isReconnect;
};

//获得是否是断线重连上的
NetManager.clearReconnectStatus = function () {
    NetCore.isReconnect = false;
};

//初始化发消息时间限制数据
NetManager.initMessageLimit = function () {
    NetManager.blackList = {};
    NetManager.messageCodes = {};
};

//发送消息限制
NetManager.sendMessageLimit = function (msgId) {
    //在黑名单中不限制
    if (msgId in NetManager.blackList) {
        return false;
    }
    var bdata = NetManager.messageCodes[msgId];
    if (!!bdata) {
        if (Date.now() - bdata.time < 500) {
            cc.log(msgId, '点击太快了，请稍后', Date.now() - bdata.time, Date.now(), bdata.time);
            return true;
        }
    } else {
        bdata = { time: 0 };
        NetManager.messageCodes[msgId] = bdata;
    }
    bdata.time = Date.now();
    // cc.log(msgId,'点击太快了，请稍后11111',Date.now() - bdata.time,Date.now(),bdata.time);
    return false;
};

//添加的消息发送的黑名单
NetManager.addToBlackList = function (msgId) {
    if (!!NetManager.blackList) {
        NetManager.blackList[msgId] = true;
    } else {
        NetManager.blackList = {};
        NetManager.blackList[msgId] = true;
    }
};

//从黑名单中删除
NetManager.removeFromBlackList = function (msgId) {
    if (!!NetManager.blackList) {
        if (!!NetManager.blackList[msgId]) {
            delete NetManager.blackList[msgId];
        }
    }
};

/**
 * 网络连接成功处理
 * @param {*message} msg
 */
function onConnected(msg) {
    // 断线重连
    // if ('' != LoginData.account) {
    //     NetManager.sendMessage(game.Protobuf.CSLogin.index, { account: LoginData.account });
    // }
    game.EventManager.dispatchEvent('SOCKET_CONNECTED');
};

/**
 * 网络消息监听
 * @param {*message} msg
 */
function onMessageIn(msg) {
    if (!!msg.Data) {
        //log.info('receivedMsg.Data.length = {}, id = {}', msg.Data.length, msg.Id);
    }
    if (PBDispatcher.isCallFuncExist(msg.Id)) {
        var proto = game.Protobuf.getProtoClassByID(msg.Id);
        if (!proto) {
            log.error('onMessageIn protobuf error, protobuf is null!');
        }
        var data = proto.deserializeBinary(msg.Data);
        //log.info('NetManager.onMessageIn {}', proto.type);
        PBDispatcher.dispatchMessage(msg.Id, data);
    } else {
        var proto = game.Protobuf.getProtoClassByID(msg.Id);
        if (proto) log.info('NetManager.onMessageIn {} without func', proto.type);
    }
};

/**
 * 网络连接失败处理
 * @param {*message} msg
 */
function onConnectError(msg) {
    game.EventManager.dispatchEvent('SOCKET_CLOSE');
};

/**
 * 网络连接断开处理
 * @param {*message} msg
 */
function onConnectClosed(msg) {
    log.info("timeOut reconnect long_connect");
    //NetCore.Reconnect();
    game.EventManager.dispatchEvent('SOCKET_CLOSE');
};

/**
 * 网络连接断开处理
 * @param {*message} msg
 */
function onReconnectFailed() {
    cc.log('重连失败了++++');
    game.EventManager.dispatchEvent('SOCKET_RECONNECTFAILED');
};

module.exports = NetManager;

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
        //# sourceMappingURL=NetManager.js.map
        