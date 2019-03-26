"use strict";
cc._RF.push(module, '4eff2mWoBVLEI/3vyq2DsMw', 'AudioManager');
// script/framework/manager/AudioManager.js

'use strict';

var ConfigManager = require('ConfigManager');

var AudioManager = {
    bgsid: -1,
    effects: {},
    effectList: {},
    isLoad: false,

    musicVolume: 1,
    effectVolume: 1,
    musicClose: false,
    effectClose: false,

    init: function init() {
        if (!this.isLoad) {
            var str = cc.sys.localStorage.getItem('musicVolume');
            if (!cc.isValid(str) || str == "") {
                str = '0';
            }
            this.musicVolume = 1 - parseFloat(str);

            str = cc.sys.localStorage.getItem('effectVolume');
            if (!cc.isValid(str) || str == "") {
                str = '0';
            }
            this.effectVolume = 1 - parseFloat(str);

            str = cc.sys.localStorage.getItem('musicClose');
            if (!cc.isValid(str) || str == "") {
                str = '1';
            }
            this.musicClose = 1 - parseInt(str);

            str = cc.sys.localStorage.getItem('effectClose');
            if (!cc.isValid(str) || str == "") {
                str = '1';
            }
            this.effectClose = 1 - parseInt(str);

            this.isLoad = true;
            log.info('AudioManager init = {}, {}', this.musicVolume, this.effectVolume);
        }
    },
    _covertToValidUrl: function _covertToValidUrl(url, callback) {
        if ('string' == typeof url) {
            if (url.indexOf('audio/') < 0) {
                url = 'audio/' + url;
            }
            cc.loader.loadRes(url, cc.AudioClip, function (err, clip) {
                // if (url.indexOf('.mp3') < 0) {
                //     url += '.mp3'; //'.ogg';
                // }
                if (!err) {
                    callback(clip);
                } else {
                    log.error('load clip failed = {}', err.message);
                }
            });
        } else {
            callback(url);
        }
        // return url;
    },
    playMusic: function playMusic(musicName) {
        var _this = this;

        var url = this.getUrlByName(musicName);
        if (!url) return;
        this.init();
        this._covertToValidUrl('music/' + url, function (clip) {
            // log.info('playMusic = {}', clip);
            _this.stopMusic();
            _this.bgsid = cc.audioEngine.play(clip, true, _this._getMusicVolue());
            _this.bgClip = clip;
        });
    },
    stopMusic: function stopMusic() {
        cc.audioEngine.stop(this.bgsid);
        if (this.bgClip) cc.audioEngine.uncache(this.bgClip);
        if (this.bgClip) cc.loader.releaseAsset(this.bgClip);
        this.bgsid = -1;
    },
    releaseEffect: function releaseEffect(sid) {
        var clip = this.effects[sid];
        // cc.audioEngine.stop(sid);
        if (clip) cc.audioEngine.uncache(clip);
        if (clip) cc.loader.releaseAsset(clip);
        delete this.effects[sid];
    },
    playEffect: function playEffect(effectName, canBreak) {
        var _this2 = this;

        var url = this.getUrlByName(effectName);

        if (!url || this._getEffectVolume() == 0) {
            return;
        }

        this.init();
        if (this.breakEffect) {
            this.releaseEffect(this.breakEffect);
            this.breakEffect = null;
        }

        this._covertToValidUrl('effect/' + url, function (clip) {
            var sid = cc.audioEngine.play(clip, false, _this2._getEffectVolume());
            if (canBreak) _this2.breakEffect = sid;
            _this2.effects[sid] = clip;
            cc.audioEngine.setFinishCallback(sid, function () {
                // this.releaseEffect(sid);
            });
        });
    },
    playEffectSpecial: function playEffectSpecial(effectName, canBreak) {
        var _this3 = this;

        var url = this.getUrlByName(effectName);

        if (!url || this.effectList[url]) {
            return;
        }

        this.init();
        if (this.breakEffect) {
            this.releaseEffect(this.breakEffect);
            this.breakEffect = null;
        }

        this._covertToValidUrl('effect/' + url, function (clip) {
            _this3.effectList[url] = true;
            var sid = cc.audioEngine.play(clip, false, _this3._getEffectVolume());
            if (canBreak) _this3.breakEffect = sid;
            _this3.effects[sid] = clip;
            cc.audioEngine.setFinishCallback(sid, function () {
                _this3.effectList[url] = false;
                _this3.releaseEffect(sid);
            });
        });
    },
    stopAllEffects: function stopAllEffects() {
        for (var sid in this.effects) {
            cc.audioEngine.stop(sid);
            cc.audioEngine.uncache(this.effects[sid]);
            delete this.effects[sid];
        }
    },
    setEffectVolume: function setEffectVolume(v, isSave) {
        this.effectVolume = v;
        for (var sid in this.effects) {
            cc.audioEngine.setVolume(sid, this._getEffectVolume());
        }
        if (isSave) {
            // log.info('AudioManager setEffectVolume : {}', 1 - this.effectVolume);
            cc.sys.localStorage.setItem('effectVolume', 1 - this.effectVolume);
        }
    },
    _getEffectVolume: function _getEffectVolume() {
        // log.info('_getEffectVolume close : {}, volume : {}', this.effectClose, this.effectVolume);
        if (this.effectClose) return 0;

        return this.effectVolume;
    },
    setMusicVolume: function setMusicVolume(v, isSave) {
        this.musicVolume = v;
        cc.audioEngine.setVolume(this.bgsid, this._getMusicVolue());
        if (isSave) {
            // log.info('AudioManager setMusicVolume : {}', 1 - this.musicVolume);
            cc.sys.localStorage.setItem('musicVolume', 1 - this.musicVolume);
        }
    },
    _getMusicVolue: function _getMusicVolue() {
        if (this.musicClose) return 0;

        return this.musicVolume;
    },
    setMusicClose: function setMusicClose(v) {
        this.musicClose = v ? 1 : 0;
        cc.audioEngine.setVolume(this.bgsid, this._getMusicVolue());
        cc.sys.localStorage.setItem('musicClose', 1 - this.musicClose);
    },
    setEffectClose: function setEffectClose(v) {
        this.effectClose = v ? 1 : 0;
        for (var sid in this.effects) {
            cc.audioEngine.setVolume(sid, this._getEffectVolume());
        }
        cc.sys.localStorage.setItem('effectClose', 1 - this.effectClose);
    },
    resumeMusicEffect: function resumeMusicEffect() {
        var musicV = this._getMusicVolue();
        this.setMusicVolume(musicV, true);
        var effectV = this._getEffectVolume();
        this.setEffectVolume(effectV, true);
    },


    //获取音效资源
    getUrlByName: function getUrlByName(name) {
        var cfg = ConfigManager.dataMap.Music[name];
        if (!cfg) {
            return null;
        }
        var ret = void 0;
        if (cfg.indexOf(',') == -1) {
            ret = cfg;
        } else {
            var cfgArr = cfg.split(',');
            var random = Math.random();
            var index = Math.floor(random * cfgArr.length);
            ret = cfgArr[index];
        }
        return ret;
    }
};

module.exports = AudioManager;

cc._RF.pop();