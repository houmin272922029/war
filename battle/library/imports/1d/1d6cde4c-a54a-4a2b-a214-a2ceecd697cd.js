"use strict";
cc._RF.push(module, '1d6cd5MpUpKK6IUos7s1pfN', 'Http');
// script/framework/utils/Http.js

'use strict';

var Global = require('Global');
// const PlayerData = require('PlayerData');
var Alert = require('Alert');
var il8n = require('LanguageData');
var CodeType = require('CodeType');
var Base64 = require('Base64');
var md5 = require('md5');
/**
 * Http消息类
 * 用途：向服务器发送Http请求
 */
var Http = {

    //发送请求(http请求，只用于用户登录)
    sendRequest: function sendRequest(path, data, handler, extraUrl) {
        var str = "?";
        for (var k in data) {
            if (str != "?") {
                str += "&";
            }
            str += k + "=" + data[k];
        }
        if (extraUrl == null) {
            extraUrl = Global.url + '/';
        }
        var requestURL = extraUrl + path + str;
        return this.sendXHR(requestURL, function (responseText, status) {
            var ret = null;
            if (responseText) {
                ret = JSON.parse(responseText);
            }
            if (handler) {
                handler(status, ret);
            }
        });
    },

    // 向远程发送一个http请求
    // url - 输入，请求地址
    // responseHandler - 输入，回调上层的函数
    sendXHR: function sendXHR(url, responseHandler) {
        log.info('Http.sendXHR: url=' + url);
        //test_bug
        if (url.indexOf("broke") != -1) {
            log.info("gry_final_request");
        }
        var xhr = cc.loader.getXMLHttpRequest();

        xhr.onreadystatechange = function () {
            //readyState属性，4 表示准备就绪状态， status属性 200 表示请求成功
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    log.info('Http.sendXHR: xhr.readyState is ready, url = {}', url);
                    responseHandler && responseHandler(xhr.responseText, true);
                } else {
                    log.error('Http.sendXHR: xhr.requre failed! code = {}, url = {} ', xhr.status, url);
                    responseHandler && responseHandler(xhr.responseText, false);
                }
            } else {
                log.info('Http.sendXHR: xhr.readyState is not ready!');
            }
        };

        //open最多有5个参数(method,url,async(是否异步),user,password)
        xhr.open("GET", url, true);
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        }

        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = 3000; // 5 seconds for timeout
        xhr.send();
    },

    operType: {
        testcard: { type: 'testcard', time: 0 }, //贵宾卡测试接口
        itemUse: { type: 'itemUse', time: 0 }, //背包中物品使用
        checkin: { type: 'checkin', time: 0 }, //签到
        shop: { type: 'shop', time: 0 }, //shop
        itemBuy: { type: 'itemBuy', time: 0 }, //道具购买
        itemSend: { type: 'itemSend', time: 0 }, //道具赠送
        mailGA: { type: 'mailGA', time: 0 }, //邮件
        bless: { type: 'bless', time: 0 }, //祈福
        search: { type: 'search', time: 0 }, //friend
        role: { type: 'roleCG', time: 0 }, //个人信息
        mailLS: { type: 'mailLS', time: 0 }, //邮件列表
        mailCG: { type: 'mailCG', time: 0 }, //邮件状态
        red: { type: 'red', time: 0 }, //红点
        notice: { type: 'notice', time: 0 }, //跑马灯
        shopdh: { type: 'shopdh', time: 0 }, //积分兑换
        itemSell: { type: 'itemSell', time: 0 }, //积分兑换
        share: { type: 'share', time: 0 }, //通知服务器分享成功
        shareBonus: { type: 'shareBonus', time: 0 }, //领取分享奖励
        midas: { type: 'midas', time: 0 } //微信支付 米大师
    },

    //玩家数据变化
    playerDataType: {
        gold: 'gold',
        items: 'items',
        dmd: 'diamond',
        vExp: 'vipExp',
        vLvl: 'vipLevel',
        cpn: 'coupon',
        shopbuy: 'buyItems'
    },
    tryMax: 3, //如果同步数据出现问题尝试同步的最大次数
    tryCount: 0, //当前尝试的次数
    httpDelay: 500, //同一个http两次间隔时间 如果超过这个间隔可以请求，如果小于该间隔不进行处理


    //player 数据同步
    httpSync: function httpSync(callBack, self) {
        var sendData = {
            // roleId: PlayerData.uid,
            // token: PlayerData.token
        };
        Http.sendRequest(Global.MsgMacroHttp.sync, sendData, function (status, data) {
            if (status) {
                // PlayerData.updateData(data);
                game.EventManager.dispatchEvent(Global.eventName.redPointStatus);
                this.tryCount = 0;
                if (!!self) {
                    callBack && callBack.call(self);
                }
            } else {
                if (this.tryCount < this.tryMax) {
                    this.httpSync();
                    this.tryCount++;
                }
            }
        }.bind(this));
    },

    httpJoinRoom: function httpJoinRoom(callback, roomType) {
        var gameType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'buyu';

        if (Global.isEnterFish) {
            return;
        }
        if (CodeType === Global.CodeType.Fish) {
            gameType = 'buyu';
        } else {
            gameType = 'fish';
        }
        Global.isEnterFish = true;
        var sendData = { game: gameType, type: roomType };
        Http.sendRequest('room', sendData, function (status, data) {
            if (status) {
                if (!!data.data && !!data.data.ip) {
                    // PlayerData.sip = data.data.ip;
                    // PlayerData.sport = data.data.port;
                    if (!!callback) {
                        callback();
                    }
                } else {
                    Alert.show(il8n.t('room_fail'), null, true);
                    Global.isEnterFish = false;
                }
            }
        }.bind(this));
    },

    //快速登录
    httpQuick: function httpQuick(url, callBack) {
        Http.sendXHR(url, function (data, status) {
            if (status) {
                var obj = JSON.parse(data);
                // PlayerData.reset();
                // PlayerData.updateData(obj);
                if (callBack) {
                    callBack(obj);
                }
                // require('LoginHelper').updateLoginTime(PlayerData.userId);;
                // require('RedPointHelper').init();
                // require('FuncHelper').initFunMask(obj.data.fmask);
            } else {
                Alert.show(il8n.t('net_status'), null, null);
                cc.log('网络出现问题了+++');
            }
        });
    },
    //验证码
    httpCode: function httpCode(url, callBack) {
        Http.sendXHR(url, function (data, status) {
            if (status) {
                var obj = JSON.parse(data);
                if (callBack) {
                    callBack(obj, status);
                }
            } else {
                Alert.show(il8n.t('net_status'), null, null);
            }
        });
    },

    //http请求操作 短连接使用这个接口
    //添加一个点击过快的回调接口，用于处理模块功能中的逻辑
    httpOper: function httpOper(type, callBack, self, param, fcallBack) {
        if (Date.now() - type.time < this.httpDelay) {
            cc.log('http requset to first ：' + type.type);
            if (!!self) {
                fcallBack && fcallBack.call(self);
            }
            return;
        }
        if (type.type == 'broke') {
            log.info("gry——请求发财金：" + Date.now());
        }
        type.time = Date.now();
        var data = {
            oper: type.type,
            // roleId: PlayerData.uid,
            // token: PlayerData.token,
            time: Math.floor(Date.now() + Global.standSunTime)
        };
        var jsonParam = null;
        if (param) {
            jsonParam = JSON.stringify(param);
            var b64 = Base64.encode(jsonParam);
            data.param = encodeURIComponent(b64);
        }
        var sign = this.gentoken(data, jsonParam);
        data.sign = sign;
        Http.sendRequest(Global.MsgMacroHttp.oper, data, function (success, ret) {
            if (success) {
                if (ret.status === 1) {
                    if (ret.data) {
                        if (type.type == 'shop') {
                            var rewardString = ret.data['bonus'].split('|');
                            var rewardNum = rewardString[2];
                            game.EventManager.dispatchEvent(Global.eventName.aftershop, { rewardNum: rewardNum });
                        }
                        this.updatePlayerData(ret.data[type.type], type.type);
                    }
                    if (!!self) {
                        callBack && callBack.call(self, ret);
                    }
                } else {
                    if (ret.code < 2000) {
                        Global.CommomUICtl.initCreateTips({ tip: il8n.t('code_' + ret.code), time: 2 });
                    } else {
                        if (!!self) {
                            callBack && callBack.call(self, ret);
                        }
                    }
                }
            } else {
                log.error(type.type + '--请求失败 ！！！');
                Alert.show('网络出现问题，请检查网络！', null, true);
            }
        }.bind(this));
    },

    gentoken: function gentoken(data, param) {
        var sign = '';
        sign += data.oper;
        sign += data.roleId;
        sign += data.token;
        sign += data.time;
        if (!!param) {
            sign += param;
        }
        sign += '57$$8709pKjF5*$w';
        return md5(sign);
    },

    updatePlayerData: function updatePlayerData(data, type) {
        if (!!data) {
            for (var key in data) {
                if (key === 'items') {
                    var items = JSON.parse(data[key]);
                    // PlayerData.updateBagItemDataByID(items);
                } else {
                    // PlayerData[this.playerDataType[key]] = data[key];
                    //vip 升级更新发财金的领取次数
                    if (this.playerDataType[key] == 'vipLevel') {
                        // PlayerData.getTheFacaijinTimes(PlayerData.vipLevel);
                        // log.info("vip升级更新玩家的发财金领取次数，玩家当前vip：" + PlayerData.vipLevel);
                    }
                }
            }
            game.EventManager.dispatchEvent(Global.eventName.refreshHall);
            if (type != 'broken') {
                if (data.gold > 0) {
                    log.info("http update facaijin");
                    game.EventManager.dispatchEvent(Global.eventName.cancleFacaijin); //破产期间发财金变化，取消破产状态
                }
                if (type != 'search') {
                    setTimeout(function () {
                        game.EventManager.dispatchEvent(Global.eventName.refreshMainSceneRes, {});
                    }, 200);
                }
            }
        }
    }

};

module.exports = Http;

cc._RF.pop();