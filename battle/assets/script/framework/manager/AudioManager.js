const ConfigManager = require('ConfigManager');

let AudioManager = {
    bgsid: -1,
    effects: {},
    effectList: {},
    isLoad: false,

    musicVolume: 1,
    effectVolume: 1,
    musicClose: false,
    effectClose: false,

    init() {
        if (!this.isLoad) {
            let str = cc.sys.localStorage.getItem('musicVolume');
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

    _covertToValidUrl(url, callback) {
        if ('string' == typeof url) {
            if (url.indexOf('audio/') < 0) {
                url = 'audio/' + url;
            }
            cc.loader.loadRes(url, cc.AudioClip, (err, clip) => {
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

    playMusic(musicName) {
        let url = this.getUrlByName(musicName);
        if (!url) return;
        this.init();
        this._covertToValidUrl('music/' + url, (clip) => {
            // log.info('playMusic = {}', clip);
            this.stopMusic();
            this.bgsid = cc.audioEngine.play(clip, true, this._getMusicVolue());
            this.bgClip = clip;
        });

    },

    stopMusic() {
        cc.audioEngine.stop(this.bgsid);
        if (this.bgClip) cc.audioEngine.uncache(this.bgClip);
        if (this.bgClip) cc.loader.releaseAsset(this.bgClip);
        this.bgsid = -1;
    },

    releaseEffect(sid) {
        let clip = this.effects[sid];
        // cc.audioEngine.stop(sid);
        if (clip) cc.audioEngine.uncache(clip);
        if (clip) cc.loader.releaseAsset(clip);
        delete this.effects[sid];
    },

    playEffect(effectName, canBreak) {
        let url = this.getUrlByName(effectName);

        if (!url || this._getEffectVolume() == 0) {
            return;
        }

        this.init();
        if (this.breakEffect) {
            this.releaseEffect(this.breakEffect);
            this.breakEffect = null;
        }

        this._covertToValidUrl('effect/' + url, (clip) => {
            let sid = cc.audioEngine.play(clip, false, this._getEffectVolume());
            if (canBreak) this.breakEffect = sid;
            this.effects[sid] = clip;
            cc.audioEngine.setFinishCallback(sid, () => {
                // this.releaseEffect(sid);
            });
        });
    },

    playEffectSpecial(effectName, canBreak) {
        let url = this.getUrlByName(effectName);

        if (!url || this.effectList[url]) {
            return;
        }

        this.init();
        if (this.breakEffect) {
            this.releaseEffect(this.breakEffect);
            this.breakEffect = null;
        }

        this._covertToValidUrl('effect/' + url, (clip) => {
            this.effectList[url] = true;
            let sid = cc.audioEngine.play(clip, false, this._getEffectVolume());
            if (canBreak) this.breakEffect = sid;
            this.effects[sid] = clip;
            cc.audioEngine.setFinishCallback(sid, () => {
                this.effectList[url] = false;
                this.releaseEffect(sid);
            });
        });
    },

    stopAllEffects() {
        for (let sid in this.effects) {
            cc.audioEngine.stop(sid);
            cc.audioEngine.uncache(this.effects[sid]);
            delete this.effects[sid];
        }
    },

    setEffectVolume(v, isSave) {
        this.effectVolume = v;
        for (let sid in this.effects) {
            cc.audioEngine.setVolume(sid, this._getEffectVolume());
        }
        if (isSave) {
            // log.info('AudioManager setEffectVolume : {}', 1 - this.effectVolume);
            cc.sys.localStorage.setItem('effectVolume', 1 - this.effectVolume);
        }
    },

    _getEffectVolume() {
        // log.info('_getEffectVolume close : {}, volume : {}', this.effectClose, this.effectVolume);
        if (this.effectClose)
            return 0;

        return this.effectVolume;
    },

    setMusicVolume(v, isSave) {
        this.musicVolume = v;
        cc.audioEngine.setVolume(this.bgsid, this._getMusicVolue());
        if (isSave) {
            // log.info('AudioManager setMusicVolume : {}', 1 - this.musicVolume);
            cc.sys.localStorage.setItem('musicVolume', 1 - this.musicVolume);
        }
    },

    _getMusicVolue() {
        if (this.musicClose)
            return 0;

        return this.musicVolume;
    },

    setMusicClose(v) {
        this.musicClose = v ? 1 : 0;
        cc.audioEngine.setVolume(this.bgsid, this._getMusicVolue());
        cc.sys.localStorage.setItem('musicClose', 1 - this.musicClose);
    },

    setEffectClose(v) {
        this.effectClose = v ? 1 : 0;
        for (let sid in this.effects) {
            cc.audioEngine.setVolume(sid, this._getEffectVolume());
        }
        cc.sys.localStorage.setItem('effectClose', 1 - this.effectClose);
    },

    resumeMusicEffect() {
        let musicV = this._getMusicVolue();
        this.setMusicVolume(musicV, true);
        let effectV = this._getEffectVolume();
        this.setEffectVolume(effectV, true);
    },

    //获取音效资源
    getUrlByName: function (name) {
        let cfg = ConfigManager.dataMap.Music[name];
        if (!cfg) {
            return null;
        }
        let ret;
        if (cfg.indexOf(',') == -1) {
            ret = cfg;
        } else {
            let cfgArr = cfg.split(',');
            let random = Math.random();
            let index = Math.floor(random * cfgArr.length);
            ret = cfgArr[index];
        }
        return ret;
    },
}

module.exports = AudioManager;
