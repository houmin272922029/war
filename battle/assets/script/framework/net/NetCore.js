"use strict";

(function () {

    var root = this;
    var NetCore = function NetCore(obj) {
        if (obj instanceof NetCore) return NetCore;
        if (!(this instanceof NetCore)) return new NetCore(obj);
    };

    // if (typeof exports !== 'undefined') {
    //     if (typeof module !== 'undefined' && module.exports) {
    //         exports = module.exports = NetCore;
    //     }
    //     exports.NetCore = NetCore;
    // } else {
    //     root.NetCore = NetCore;
    // }

    window.NetCore = NetCore;

    NetCore.OPEN = -1;
    NetCore.CLOSE = -2;
    NetCore.ERROR = -3;
    NetCore.contentStatus = -1;//连接状态
    NetCore.onConnected = undefined;
    NetCore.onMsgIn = undefined;
    NetCore.onError = undefined;
    NetCore.onClosed = undefined;
    NetCore.onReconnectFailed = undefined;

    NetCore.ReconnectMaxTimes = 4;     // 最大重连次数 多出来一次，如果最后一次开始重连时还没有连上就关闭
    NetCore.ReconnectInterval = 5;      // 重连间隔/s
    NetCore.ReconnectTimes = 4;        // 剩余重连次数
    NetCore.isReconnect = false;       //是否是断线重连上的
    NetCore.canReconnnet = true;       //是否能断线重连
    NetCore.reconnetID = -1;           //重连timeid
    /** 
     * 初始化网络库
     * @param {*初始化成功回调函数} callback 
     */
    NetCore.init = function (callback) {
        if (callback) {
            callback();
        }
    };

    // 反序列化数据
    NetCore.deserializeMsg = function (buf) {
        var id = 0;
        id += (buf[0] & 0x000000ff) << 24;
        id += (buf[1] & 0x000000ff) << 16;
        id += (buf[2] & 0x000000ff) << 8;
        id += buf[3] & 0x000000ff;
        var msg = { Id: id, Data: buf.subarray(4) };
        this.onMsgIn && this.onMsgIn(msg);
    }

    // 序列化数据
    NetCore.serializeMsg = function (id, data) {
        var buf = new Uint8Array(data.length + 4);
        buf[0] = id >> 24 & 0xff;
        buf[1] = id >> 16 & 0xff;
        buf[2] = id >> 8 & 0xff;
        buf[3] = id & 0xff;
        buf.set(data, 4);
        this.ws.send(buf.buffer);
    }

    /**
     * 建立websocket连接
     * @param {*连接地址} url 
     * @param {*连接成功回调} onConnected 
     * @param {*收到消息回调} onMsgIn 
     * @param {*连接失败回调} onError 
     * @param {*连接断开回调} onClosed 
     */
    NetCore.Connect = function (url, onConnected, onMsgIn, onError, onClosed, onReconnectFailed) {
        var _this = this;
        NetCore.contentStatus = 0;
        this.onConnected = onConnected;
        this.onMsgIn = onMsgIn;
        this.onError = onError;
        this.onClosed = onClosed;
        this.onReconnectFailed = onReconnectFailed;

        log.info("NetCore: trying to connect server {} ", url);
        if (cc.sys.isObjectValid(this.ws)) {
            if (this.ws.readyState < 2) {
                cc.log('有链接正在进行，请稍等！');
                return;
            }
        }
        this.ws = new WebSocket(url);

        this.url = url;

        this.ws.onopen = function (event) {
            log.info('NetCore: websocket onopen.  {}', event);
            clearInterval(NetCore.reconnetID);
            var msg = { Id: _this.OPEN };
            if (!!NetCore.onConnected) {
                NetCore.onConnected(msg);
            }
            NetCore.contentStatus = 1;
            // 重置重连次数
            NetCore.ReconnectTimes = 0;
            NetCore.isReconnect = false;
        };

        this.ws.onmessage = (received) => {
            if (CC_WECHATGAME) {
                this.deserializeMsg(new Uint8Array(received.data));
            } else if (!cc.sys.isNative) {
                (() => {
                    var reader = new FileReader();
                    reader.readAsArrayBuffer(received.data);
                    reader.onload = (e) => {
                        this.deserializeMsg(new Uint8Array(reader.result));
                    }
                })();
            } else {
                this.deserializeMsg(new Uint8Array(received.data));
            }
        };

        this.ws.onclose = function (event) {
            log.info('NetCore: websocket onclose: {}, reconnect: {}', event, NetCore.ReconnectTimes);
            var msg = { Id: _this.CLOSE };
            if (!!NetCore.onClosed && NetCore.contentStatus === -1) {
                if (NetCore.ReconnectTimes < 0) {
                    // -1 : 重连超时
                    NetCore.ReconnectTimes = 0;
                    if (NetCore.onReconnectFailed) NetCore.onReconnectFailed();
                } else {
                    NetCore.onClosed(msg);
                }
            }
            NetCore.contentStatus = -1;
        };

        this.ws.onerror = function (event) {
            log.info('NetCore: websocket onerror :', event);
            var msg = { Id: _this.ERROR };
            if (!!NetCore.onError) {
                NetCore.onError(msg);
            }
            NetCore.contentStatus = -1;
            // NetCore.isReconnect = false;
        };
    };

    NetCore.readyState = function () {
        if (!!this.ws) {
            return this.ws.readyState;
        }
        return 0;
    };
    /**
     * 重新建立连接
     */
    NetCore.Reconnect = function () {
        log.info('NetCore Reconnect times = {}', NetCore.ReconnectTimes);
        if (NetCore.ReconnectTimes > 0) {
            (function () {
                // 每5秒重试一次
                NetCore.reconnetID = setInterval(function () {
                    cc.log('尝试重连+++', NetCore.reconnetID);
                    NetCore.disConnect();
                    --NetCore.ReconnectTimes;
                    if (0 == NetCore.ReconnectTimes) {
                        // 重连超时
                        NetCore.ReconnectTimes = -1;
                        clearInterval(NetCore.reconnetID);
                        NetCore.ReconnectTimes = 0;
                        if (NetCore.onReconnectFailed) NetCore.onReconnectFailed();
                    } else {
                        NetCore.isReconnect = true;
                        NetCore.Connect(NetCore.url, NetCore.onConnected, NetCore.onMsgIn, NetCore.onError, NetCore.onClosed, NetCore.onReconnectFailed);
                    }
                }, NetCore.ReconnectInterval * 1000);
            })();
        }
    };

    /**
     * 断开连接
     */
    NetCore.disConnect = function () {
        log.info('NetCore disConnect!');
        if (cc.sys.isObjectValid(this.ws)) {
            this.ws.close();
            this.ws.onclose = null;
            delete this.ws;
            this.ws = null;
            cc.log('disconnet+++++')
        }
        NetCore.contentStatus = -1;
        NetCore.isReconnect = false;
    };

    /**
     * 发送消息
     * @param {*消息头} id 
     * @param {*消息体} data 
     */
    NetCore.sendMessage = function (id, data) {
        if (cc.sys.isObjectValid(this.ws) && this.ws.readyState == WebSocket.OPEN) {
            this.serializeMsg(id, data);
        } else {
            setTimeout(function () {
                NetCore.sendMessage(id, data);
            }, 500);
            if (cc.sys.isObjectValid(this.ws)) {
                log.error('NetCore: SendMsg error readState:' + this.ws.readyState);
            } else {
                log.warn('NetCore: SendMsg error ws is null');
            }
        }
    };
}).call(this);