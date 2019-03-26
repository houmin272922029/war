(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/framework/hotupdate/CheckVersion.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '305adTbyIJFsp+q9H7lBbhA', 'CheckVersion', __filename);
// script/framework/hotupdate/CheckVersion.js

'use strict';

var i18n = require('LanguageData');

var Checker = {
    // URL_ANDROID : '818Android.html',
    // URL_IOS : '818iOS.html',
    URL: '818.html'
};

function downloadData(url, callback) {
    var xhr = cc.loader.getXMLHttpRequest();
    var timedout = false;
    var timer = setTimeout(function () {
        timedout = true;
        xhr.abort();
        // require('NetCore').showReconnect();
    }, 10000);
    xhr.onreadystatechange = function () {
        if (timedout) {
            return;
        }
        clearInterval(timer);
        if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
            if (callback) {
                callback(true, xhr.responseText);
            }
        } else {
            if (callback) {
                callback(false);
            }
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
};

/**
 * 检测是否有大版本更新
 */
Checker.check = function (manifest, callback) {
    log.info('manifest : ' + manifest);
    cc.loader.load(manifest, function (err, asset) {
        if (err) {
            log.info('Checker load manifest failed : ' + manifest);
            return;
        }

        var js = JSON.parse(asset);
        var remoteVersionUrl = js.remoteManifestUrl;
        var localVersion = js.version;
        var localBigVer = localVersion.split('.')[0];
        log.info('local version : ' + localVersion + ', big : ' + localBigVer);

        cc.find('Canvas/version').getComponent(cc.Label).string = 'Version:' + localVersion;

        downloadData(remoteVersionUrl, function (result, asset) {
            if (result) {
                var _js = JSON.parse(asset);
                var remoteVersion = _js.version;
                var remoteBigVer = remoteVersion.split('.')[0];
                log.info('remote version : ' + remoteVersion + ', big : ' + remoteBigVer);
                if (localBigVer <= remoteBigVer) {
                    require('UIMessageBox').show({
                        text: i18n.t(17).formatList(localVersion, remoteVersion),
                        type: 1,
                        yesCB: function yesCB() {
                            var removePaths = cc.sys.localStorage.getItem('RemotePaths');
                            // 删除历史热更记录
                            if (!!removePaths) {
                                var arr = JSON.parse(removePaths);
                                for (var i in arr) {
                                    log.info('hotUpdate : remove {}', arr[i]);
                                    jsb.fileUtils.removeDirectory(arr[i]);
                                }
                            }

                            cc.sys.openURL(_js.packageUrl + Checker.URL);
                            cc.game.end();
                        },
                        noCB: function noCB() {
                            cc.game.end();
                        }
                    });
                }

                if (callback) {
                    callback(localBigVer >= remoteBigVer);
                }
            } else {
                log.info('getVersion failed!');
            }
        });
    });
};

module.exports = Checker;

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
        //# sourceMappingURL=CheckVersion.js.map
        