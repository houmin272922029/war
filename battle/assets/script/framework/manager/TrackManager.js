const CommonUtil = require('CommonUtil');
const ConfigManager = require('ConfigManager');
const Global = require('Global');
const FishFrameData = require('FishFrameData');

let TrackManager = {
    paths: {},
    tracks: {},
    cacheTracks: [], // 服务器下发的鱼群信息缓存
    pathInited: false,
    animInited: false,
    fishLayerInited: false, // fishLayer是否已准备好刷鱼

    init: function (callback) {
        this._loadPath();
        game.EventManager.on(Global.eventName.newFishGroups, this._eventNewFishGroups, this);
        !!callback && callback();
    },

    uninit: function () {
        game.EventManager.off(Global.eventName.newFishGroups, this._eventNewFishGroups, this);
    },

    reset: function () {
        this.cacheTracks = [];
        this.fishLayerInited = false;
    },

    setLayerInited(bVal) {
        this.fishLayerInited = bVal;
    },

    // 加载鱼路径配置文件
    _loadPath: function () {
        if (this.pathInited) {
            log.info("TrackMgr._loadPath: has been called");
            return;
        }
        this.pathInited = true;
        let self = this;

        // 读取path文件
        cc.loader.loadRes('fish/path/path', (err, object) => {
            if (err) {
                log.error('TrackMgr.loadPath: error:' + err || err.message);
                return;
            }
            // 读取成功后解析path
            self.parsePath(object.json);
            log.info('success to init path info.');
        });

        // 读取track文件
        cc.loader.loadResDir('fish/track', (err, objects, urls) => {
            if (err) {
                log.error('TrackMgr.loadTrack: error:' + err || err.message);
                return;
            }
            // 读取成功后解析track
            self.parseTracks(objects, urls);
            log.info('success to init track info.');
        });
    },

    // 解析从文件中读取的path数据
    parsePath: function (data) {
        this.paths = this.parsePathFile(data);
        for (let key in this.paths) {
            let path = this.paths[key];
            this.calcPathVertices(path); // 计算好路径上所有点的坐标
        }
    },

    parsePathFile(data) {
        if (!data) {
            log.warn('parsePathFile: data is invalid');
            return [];
        }

        let paths = {};
        try {
            for (let key in data) {
                let arr = data[key].split(';');
                let speeds = this.parseSpeeds(arr[0]);
                let { points, ctrls } = this.parsePoints(arr[1]);
                let pathId = parseInt(key);
                paths[pathId] = { speeds, points, ctrls };
            }
        } catch (e) {
            log.error('parsePathFile: error to parse path');
        }

        return paths;
    },

    parsePoints(str) {
        let points = [];
        let ctrls = [];
        try {
            let arrs = str.split('|');
            for (let i = 0, len = arrs.length; i < len; i++) {
                let arr = arrs[i].split(',');
                let pt = cc.v2(parseFloat(arr[0]), parseFloat(arr[1]));
                points.push(pt);
                // 根据数据点自动生成控制点
                CommonUtil.genAutoControls(points, ctrls);
            }
        } catch (e) {
            log.error('parsePoints: str is invalid');
        }
        return { points, ctrls };
    },

    parseSpeeds(str) {
        let speeds = [];
        try {
            let arr = str.split('|');
            for (let i = 0, len = arr.length; i < len; i++) {
                speeds[i] = parseFloat(arr[i]);
            }
        } catch (e) {
            log.error('parseSpeeds: str is invalid');
        }
        return speeds;
    },

    // 解析从文件中读取的track数据
    parseTracks: function (objects, urls) {
        let self = this;
        // for (let i = 0; i < urls.length; i++) {
        //     let index = urls[i].indexOf('_') + 1; // 取文件名并跳过'track_'
        //     let name = urls[i].substring(index);
        //     self.tracks[name] = objects[i].json;
        // }
        for (let key in objects[0].json) {
            let track = this.parseTrackFile(objects[0].json[key]);
            if (track.length > 0) {
                self.tracks[key] = track;
            }
        }
    },

    parseTrackFile(str) {
        let track = [];
        if (str && str.length > 0) {
            try {
                let arrs = str.split('#');
                for (let i = 0, len = arrs.length; i < len; i++) {
                    let arr = arrs[i].split(';');
                    track[i] = { fishId: parseInt(arr[0]), pathId: parseInt(arr[1]), enterTime: parseFloat(arr[2]), exitTime: parseFloat(arr[3]) };
                }
            } catch (e) {
                log.error('parseTrackFile: error to parse track file');
            }
        }
        return track;
    },

    // 从缓存中寻找指定id的鱼
    findFromCacheTracks: function (uid) {
        if (!uid) {
            return null;
        }
        for (let i = 0; i < this.cacheTracks.length; i++) {
            let group = this.cacheTracks[i].group;
            for (let j = 0; j < group.fishes.length; j++) {
                let servFish = group.fishes[j];
                if (uid === servFish.uid) {
                    return servFish;
                }
            }
        }
        return null;
    },

    // 检查缓存中是否有新的track(如果track开始帧小于等于当前鱼帧)
    checkCacheTracks: function () {
        if (!this.fishLayerInited) {
            return;
        }

        let removes = [];
        for (let i = 0; i < this.cacheTracks.length; i++) {
            let trackObj = this.cacheTracks[i];
            if (trackObj.group.endFishFrame <= FishFrameData.fishFrame) {
                // 如果track结束帧小于等于鱼帧，代表该track已过期，可以从数组移除了
                removes.push(i);
            } else if (trackObj.group.beginFishFrame <= FishFrameData.fishFrame) {
                this._checkSpecialTrack(trackObj);
                this._checkCacheTrack(trackObj.group);
            }
        }
        // 从后往前删
        for (let j = removes.length - 1; j >= 0; j--) {
            this.cacheTracks.splice(removes[j], 1);
        }
    },

    _checkCacheTrack: function (group) {
        if (!group) {
            return;
        }

        for (let i = 0; i < group.fishes.length; i++) {
            let servFish = group.fishes[i];
            if (!servFish.handled && servFish.endFishFrame <= FishFrameData.fishFrame) {
                servFish.handled = true;
                log.warn('_checkCacheTrack: fish is expired. begin={}, end={}, fishFrame={}', servFish.beginFishFrame, servFish.endFishFrame,
                    FishFrameData.fishFrame);
            } else if (!servFish.handled && !servFish.state && servFish.beginFishFrame <= FishFrameData.fishFrame) {
                // state为0表示存活，1表示死亡
                // 如果鱼开始帧小于等于鱼帧，代表该鱼应开始创建。但此时该项还不能从数组移除，
                // 因为数组索引也是该鱼wave在track中的索引，所以置已处理标记，一直保留到整个group过期删除。
                servFish.handled = true;
                game.EventManager.dispatchEvent(Global.eventName.createNewFish,
                    { servFish: servFish, group: group, index: i });
            }
        }
    },

    // 检查是否特殊鱼，做相应处理
    _checkSpecialTrack: function (trackObj) {
        if (!trackObj || trackObj.handled) {
            return;
        }

        let group = trackObj.group;
        // 如果track开始帧小于当前帧，则直接返回，避免退出渔场重进后再次播放动画
        // 但因为GM中使用testtrack命令后收到的开始帧已经晚1帧，所以+2做为容错
        if ((group.beginFishFrame + 2) < FishFrameData.fishFrame) {
            // let index = Math.floor(group.tempId / 100);
            // if (index === 2 || index === 5) {
            //     log.warn('_checkSpecialTrack: ignore boss track={}, begin={}, frame={}', group.tempId,
            //         group.beginFishFrame, FishFrameData.fishFrame);
            // }
            return;
        }

        // 如果是召唤鱼，则记录它的出生位置，并播放召唤动画
        if (group.sourcePos > 0) {
            trackObj.handled = true;
            let wave = this.getWaveByGroupIndex(group, 0);
            if (!wave) {
                log.error('_checkSpecialTrack: wave(track={},index=0) is not exist', group.tempId);
                return;
            }
            let path = this.getPathById(wave.pathId); // 根据pathId找到对应path
            if (!path) {
                log.error('_checkSpecialTrack: path(id={}) is not exist', wave.pathId);
                return;
            }

            let zhaoHuanPos = path.vertices[0];
            if (wave.fishId == 47) {
                game.EventManager.dispatchEvent(Global.eventName.startXFDAnim, { pos: zhaoHuanPos, source: group.sourcePos });
            } else {
                game.EventManager.dispatchEvent(Global.eventName.startZhaoHuanAnim, { pos: zhaoHuanPos, source: group.sourcePos, trackId: group.tempId });
            }
        } else {
            // 如果是BOSS鱼，则发送通知播放动画
            let index = Math.floor(group.tempId / 100);
            if (index === 2 || index === 5) {
                trackObj.handled = true;
                game.EventManager.dispatchEvent(Global.MsgMarco.bossArrive, { trackId: group.tempId });
            }

            // 如果是分身鱼
            if (8 == index) {
                trackObj.handled = true;
                let posArr = [];
                for (let i = 0; i < group.fishes.length; i++) {
                    let wave = this.getWaveByGroupIndex(group, i);
                    if (!wave) {
                        log.error('_checkSpecialTrack: wave(track={},index=0) is not exist', group.tempId);
                        return;
                    }
                    let path = this.getPathById(wave.pathId); // 根据pathId找到对应path
                    if (!path) {
                        log.error('_checkSpecialTrack: path(id={}) is not exist', wave.pathId);
                        return;
                    }
                    posArr.push(path.vertices[0]);
                }
                setTimeout(() => {
                    game.EventManager.dispatchEvent(Global.eventName.virtualBossBorn, posArr);
                }, 1000);
            }
        }
    },

    // 接收服务器下发的鱼群信息
    _eventNewFishGroups: function (event) {
        let groups = event.data;
        for (let i = 0, len = groups.length; i < len; i++) {
            let group = groups[i];
            let trackObj = { handled: false, group: group };
            this.cacheTracks.push(trackObj);
            log.info('_eventNewFishGroups: recv track_{}(begin={},end={},count={}) from server, frame={}',
                group.tempId, group.beginFishFrame, group.endFishFrame, group.fishes.length, FishFrameData.fishFrame);
        }
    },

    // 根据group和索引返回相应的wave对象
    getWaveByGroupIndex: function (group, waveIndex) {
        let wave = null;

        if (!group || waveIndex < 0) {
            log.warn('getWaveByGroupIndex: group={}, index={}', group, waveIndex);
            return wave;
        }

        let track = this.getTrackByName(group.tempId); // 找到对应track
        if (!track) {
            log.error('error to get track by id={}', group.tempId);
            return wave;
        }

        wave = track[waveIndex]; // 按顺序索引找到对应wave
        return wave;
    },

    // 根据路径ID返回该路径下的所有鱼名字
    _getAnimNamesByTrackId: function (id) {
        if (!id) {
            log.warn('TrackMgr: Invalid trackid({})', id);
            return null;
        }
        let track = this.getTrackByName(id);
        if (!track) {
            log.warn('TrackMgr: failed to get track by name({})', id);
            return null;
        }
        let names = [];
        let confFishes = ConfigManager.dataMap.FishAttribute;
        for (let i = 0, len = track.length; i < len; i++) {
            let wave = track[i];
            let conf = confFishes[wave.fishId - 1];
            names.push({ name: conf.name, bSpine: conf.isSpine, bUse: true });
        }
        return names;
    },

    // 查找指定名字在数组中是否已经存在
    _findAnimName: function (anims, name) {
        for (let i = 0, len = anims.length; i < len; i++) {
            let obj = anims[i];
            if (obj.name === name) {
                return obj;
            }
        }
        return null;
    },

    // 根据渔场级别得到该渔场所有鱼的名字
    getRoomFishesByType: function (roomType) {
        if (!roomType) {
            log.warn('TrackMgr: Invalid roomType({})', roomType);
            return null;
        }

        let animNames = [];
        let confTrack = ConfigManager.dataMap.TrackAttribute;
        for (let i = 0, len = confTrack.length; i < len; i++) {
            let track = confTrack[i];
            let key = 'roomType' + roomType;
            if (1 === track[key]) {
                let anims = this._getAnimNamesByTrackId(track.trackid);
                if (anims) {
                    for (let j = 0, len2 = anims.length; j < len2; j++) {
                        let anim = anims[j];
                        if (!this._findAnimName(animNames, anim.name)) {
                            animNames.push(anim);
                        }
                    }
                }
            }
        }
        log.info('getRoomFishesByType: length={}, type={}', animNames.length, roomType);
        return animNames;
    },

    // 根据track名称返回相应的track数据
    getTrackByName: function (name) {
        let track = null;
        if (!!name && !!this.tracks) {
            track = this.tracks[name];
        }
        return track;
    },

    // 根据pathId在返回相应的path数据
    getPathById: function (pathId) {
        let path = null;
        if (pathId > 0 && this.paths) {
            path = this.paths[pathId];
        }
        return path;
    },

    // 计算整条路径上所有贝塞尔曲线各自切分成多个小段后所有点的坐标，并返回总时间
    calcPathVertices: function (currPath) {
        let points = currPath.points;
        let ctrls = currPath.ctrls;
        currPath.vertices = [];
        currPath.times = [0];
        let waveTime = 0;

        // points数组存放的是逻辑坐标，vertices需要的是实际坐标
        let pos = CommonUtil.p2v(points[0]);
        currPath.vertices[0] = cc.v2(pos.x, pos.y);

        for (let i = 0, len = points.length - 1; i < len; i++) {
            let speed = currPath.speeds[i];

            let p1c2 = cc.v2(ctrls[i].z, ctrls[i].w);
            let p2c1 = cc.v2(ctrls[i + 1].x, ctrls[i + 1].y);
            let vecs = CommonUtil.getBezierVertices(points[i], p1c2, p2c1, points[i + 1], 10/*frames*/);

            // 因为vecs的第1个和最后1个点必定是起点和终点，而第1段线段的终点也是第2段线段的起点，
            // 所以存储时需要从第2个点开始，相当于去重。
            // vecs数组存放的是逻辑坐标，vertices需要的是实际坐标
            for (let i = 1, len = vecs.length; i < len; i++) {
                pos = CommonUtil.p2v(vecs[i]);
                currPath.vertices.push(cc.v2(pos.x, pos.y));
            }

            for (let i = 0, len = vecs.length - 1; i < len; i++) {
                let pt1 = cc.v2(vecs[i].x, vecs[i].y);
                let pt2 = cc.v2(vecs[i + 1].x, vecs[i + 1].y);
                let dist = pt1.sub(pt2).mag();
                let t = dist / speed;
                waveTime += t;
                // 保存每小段时间到数组，避免鱼游动时重复运算(注意：时间不是均等的)
                currPath.times.push(waveTime);
            }
        }
        return waveTime;
    },

    // 计算整条路径上所有贝塞尔曲线各自切分成多个小段后所有点的坐标，并返回总时间
    // 这个方法暂时不用
    calcWaveTime: function (currWave, currPath) {
        let points = currPath.points;
        let ctrls = currPath.ctrls;
        currPath.vertices = [];
        currPath.times = [0];
        let waveTime = 0;

        // points数组存放的是逻辑坐标，vertices需要的是实际坐标
        currPath.vertices[0] = CommonUtil.p2v(points[0]);

        for (let i = 0, len = points.length - 1; i < len; i++) {
            let p1c2 = cc.v2(ctrls[i].z, ctrls[i].w);
            let p2c1 = cc.v2(ctrls[i + 1].x, ctrls[i + 1].y);

            let vecs = CommonUtil.getBezierVertices(points[i], p1c2, p2c1, points[i + 1], 10);
            // 因为vecs的第1个和最后1个点必定是起点和终点，而第1段线段的终点也是第2段线段的起点，
            // 所以存储时需要从第2个点开始，相当于去重。
            // vecs数组存放的是逻辑坐标，vertices需要的是实际坐标
            for (let i = 1, len = vecs.length; i < len; i++) {
                currPath.vertices.push(CommonUtil.p2v(vecs[i]));
            }

            let speed = currPath.speeds[i];
            for (let i = 0, len = vecs.length - 1; i < len; i++) {
                let pt1 = cc.v2(vecs[i].x, vecs[i].y);
                let pt2 = cc.v2(vecs[i + 1].x, vecs[i + 1].y);
                let dist = pt1.sub(pt2).mag();
                let t = dist / speed;
                waveTime += Math.round(CommonUtil.calcFrameBySecond(t)); // 四舍五入取整
                // 保存每小段时间到数组，避免鱼游动时重复运算
                currPath.times.push(waveTime);
            }
        }
        return waveTime;
    },
}

module.exports = TrackManager;
