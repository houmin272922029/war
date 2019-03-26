"use strict";
cc._RF.push(module, '2ff84coyMJJEKnJGBcZ+G4I', 'HotUpdate');
// script/framework/hotupdate/HotUpdate.js

'use strict';

var i18n = require('LanguageData');

cc.Class({
    'extends': cc.Component,

    properties: {
        skip: true,

        updatePanel: {
            'default': null,
            type: cc.Node,
            displayName: "热更新Node",
            tooltip: "热更新脚本"
        },

        percent: {
            default: null,
            type: cc.Label,
            displayName: "百分比Label",
            tooltip: "百分比"
        },

        progressBar: {
            default: null,
            type: cc.ProgressBar,
            displayName: "进度条Progress",
            tooltip: "进度条"
        }
    },

    checkCb: function checkCb(event) {
        var self = this;
        log.info('Code: ' + event.getEventCode());
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                log.info(i18n.t(14));
                cc.eventManager.removeListener(this._checkListener);
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                log.info(i18n.t(13));
                cc.eventManager.removeListener(this._checkListener);
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                log.info(i18n.t(12));
                cc.eventManager.removeListener(this._checkListener);
                setTimeout(function () {
                    self.doLogin();
                }, 0);
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                this._needUpdate = true;
                this.updatePanel.active = true;
                this.percent.string = '00.00%';
                this.progressBar.progress = 0;
                cc.eventManager.removeListener(this._checkListener);
                setTimeout(function () {
                    self.hotUpdate();
                }, 0);
                break;
            default:
                break;
        }
    },

    updateCb: function updateCb(event) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                log.info(i18n.t(14)); //"No local manifest file found, hot update skipped."
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                var percent = event.getPercent();
                var percentByFile = event.getPercentByFile();
                percentByFile = cc.clampf(percentByFile, 0, 100);

                var msg = event.getMessage();
                if (msg) {
                    log.info(msg);
                }
                var str = 'download: ' + (100 * percentByFile).toFixed(2) + '% | install: ' + (100 * percent).toFixed(2) + '%';
                // let str = (100 * percent).toFixed(2) + '%';
                this.percent.string = str;
                this.progressBar.progress = Math.max(percentByFile, percent);
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                log.info(i18n.t(13)); //"Fail to download manifest file, hot update skipped."
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                log.info(i18n.t(12)); //"Already up to date with the latest remote version."
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                log.info(i18n.t(15)); //'Update finished. '
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                log.info(i18n.t(16)); //'Update failed. '

                this._failCount++;
                if (this._failCount < 5) {
                    log.info('Download failed assets ...');
                    this._am.downloadFailedAssets();
                } else {
                    log.info('Reach maximum fail count, exit update process');
                    this._failCount = 0;
                    failed = true;
                }
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                var errstr = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                log.info(errstr);
                //log.info(errstr);
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                log.info(event.getMessage());
                //log.info(event.getMessage());
                break;
            default:
                break;
        }

        if (failed) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            this.updatePanel.active = false;
        }

        if (needRestart) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            // Prepend the manifest's search path
            var searchPaths = cc.sys.localStorage.getItem('BaseSearchPaths');
            if (!searchPaths) searchPaths = jsb.fileUtils.getSearchPaths();else searchPaths = JSON.parse(searchPaths);
            // 原始路径
            cc.sys.localStorage.setItem('BaseSearchPaths', JSON.stringify(searchPaths));

            var localManifest = this._am.getLocalManifest();
            var newPaths = [];
            if (!!localManifest) newPaths = localManifest.getSearchPaths();

            // 热更路径
            cc.sys.localStorage.setItem('RemotePaths', JSON.stringify(newPaths));

            // 原始路径+热更路径
            Array.prototype.unshift(searchPaths, newPaths);
            // 全路径
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.

            jsb.fileUtils.setSearchPaths(searchPaths);
            setTimeout(function () {
                require('AudioManager').stopMusic();
                cc.game.restart();
            }, 0);
        }
    },

    hotUpdate: function hotUpdate() {
        if (this._am && this._needUpdate) {
            this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));
            cc.eventManager.addListener(this._updateListener, 1);

            this._failCount = 0;
            this._am.update();
        }
    },

    // use this for initialization
    onLoad: function onLoad() {},


    start: function start() {
        log.info('HotUpdate.start: is called');
        // cc._initDebugSetting(cc.DebugMode.INFO);
        var self = this;

        //check network
        this.checkNetWork();
    },

    checkNetWork: function checkNetWork() {
        log.info('MessageBoxType.select:' + game.Types.MessageBoxType.select);
        var self = this;
        // if (cc.sys.isNative) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            // window.Utility.getNetState(function(state) {
            // if(state == 'NO_INTERNET') {
            //     UIMessageBox.show('','当前网络不可用，请重试！', game.Types.MessageBoxType.select, function() {cc.game.restart()}, function() {cc.game.end()});
            //     return;
            // }
            setTimeout(function () {
                self.initGame();
            }, 0);
            // });
        } else {
            setTimeout(function () {
                self.initGame();
            }, 0);
        }
        // } else {
        //     alert('is not native');
        // }
    },

    doLogin: function doLogin() {},

    initGame: function initGame() {
        log.info('start initGame');

        // 测试多语言
        i18n.init('zh');
        var sVer = i18n.t('jinbi');
        var self = this;
        var now = Date.now();
        require('GameInit').init(function () {
            log.info('GameInit time : ' + (Date.now() - now));
            var loginLayer = self.getComponent('Login');
            if (loginLayer) {
                loginLayer.initComplete();
            }

            //是否进行热更新检查
            if (!cc.sys.isNative || self.skip) {
                log.info('skip checkVersion');
                // self.doLogin();
                // self.login.active = true;
                // self.updatePanel.active = false;
                return;
            }
            setTimeout(function () {
                require('CheckVersion').check(self.manifestUrl, function (ret) {
                    log.info('CheckVersion status = {}', ret);
                    if (!ret) {
                        // UIMessageBox.show('', '版本检查失败');
                        return;
                    }
                    // Hot update is only available in Native build
                    if (!cc.sys.isNative) {
                        self.doLogin();
                    } else {
                        self.createUpdater();
                    }
                });
            }, 0);
        });
    },

    createUpdater: function createUpdater() {
        var storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset';
        log.info('Storage path for remote asset : ' + storagePath);

        // log.info('Local manifest URL : ' + this.manifestUrl);
        this._am = new jsb.AssetsManager(this.manifestUrl.nativeUrl, storagePath);
        this._am.retain();

        this._needUpdate = false;
        var localManifest = this._am.getLocalManifest();
        if (!!localManifest && localManifest.isLoaded()) {
            this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));
            cc.eventManager.addListener(this._checkListener, 1);
            this._am.checkUpdate();
        }
    },

    onDestroy: function onDestroy() {
        if (this._updateListener) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
        if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.release();
        }
    }
});

cc._RF.pop();