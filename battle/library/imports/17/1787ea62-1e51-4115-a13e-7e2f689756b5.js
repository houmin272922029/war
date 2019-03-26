"use strict";
cc._RF.push(module, '1787epiHlFBFaE+fi9ol1a1', 'Log');
// script/framework/utils/Log.js

'use strict';

(function () {
    var log = function log(obj) {
        if (obj instanceof log) return obj;
        if (!(this instanceof log)) return new log(obj);
    };

    //接微信渠道出现作用域问题
    window.log = log;

    log.setLogLevel = function (lv) {
        var modeEnum = cc.debug.DebugMode;
        var debugMode = modeEnum.NONE;
        1 == lv && (debugMode = debugMode.ERROR);
        2 == lv && (debugMode = debugMode.WARN);
        3 == lv && (debugMode = debugMode.INFO);
        cc.debug._resetDebugSetting(debugMode);
    };

    log.error = function () {
        if (arguments.length === 0) return;
        if (this.Log_Priority < 1) return;
        this.printLog("error", arguments[0], _.rest(arguments));
    };
    log.warn = function () {
        if (arguments.length === 0) return;
        if (this.Log_Priority < 2) return;
        this.printLog("warn", arguments[0], _.rest(arguments));
    };
    log.info = function () {
        if (arguments.length === 0) return;
        if (this.Log_Priority < 3) return;
        this.printLog("log", arguments[0], _.rest(arguments));
    };
    log.node = function () {
        if (arguments.length === 0) return;
        if (this.Log_Priority < 0) return;
        this.printLog("node->", arguments[0], _.rest(arguments));
    };
    log.alert = function () {
        if (arguments.length === 0) return;
        if (this.Log_Priority < 4) return;

        var title = "";
        var content = "";
        if (arguments.length === 1) {
            content = arguments[0];
        } else if (arguments.length === 2) {
            title = arguments[0];
            content = arguments[1];
        } else {
            title = arguments[0];
            content = arguments[1].formatLogList(_.rest(arguments, 2));
        }
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            //jsb.reflection.callStaticMethod("org/cocos2dx/js_tests/AppActivity", "showAlertDialog", "(Ljava/lang/String;Ljava/lang/String;)V", title, content);
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            log.error(title + content);
        } else if (cc.sys.os == cc.sys.OS_OSX) {
            log.error(title + content);
            jsb.reflection.callStaticMethod("NativeOcClass", "callNativeUIWithTitle:andContent:", title, content);
        }
    };
    log.report = function (fmt) {
        if (arguments.length > 1) {
            var msg = fmt.formatLogList(_.rest(arguments));
        } else {
            msg = fmt;
        }

        if (reportCache.indexOf(msg) !== -1) {
            return;
        }

        reportCache.push(msg);
        var reportUrl = "http://msg.client.dreamjelly.com/send";
        HttpUtil.getInstance().simpleRequest(reportUrl, {
            mssxerror: msg
        });
    };
    log.printLog = function (tag, fmt, arr) {
        if (fmt === null) {
            return;
        }
        if (arr === null) {
            return;
        }
        var msg = arr.length != 0 ? fmt.toString().formatLogList(arr) : fmt;
        var d = new Date();
        var ts = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds();
        var logms = " [" + tag + "] " + ts + " : " + msg;
        // if (client) {
        if (!!cc[tag]) {
            cc[tag](logms);
        } else {
            cc.log(logms);
        }
    };
}).call(undefined);

cc._RF.pop();