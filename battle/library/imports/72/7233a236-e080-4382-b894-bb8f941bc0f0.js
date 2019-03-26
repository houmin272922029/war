"use strict";
cc._RF.push(module, '7233aI24IBDgriUu4+UG8Dw', 'TrackManager');
// script/framework/manager/TrackManager.js

'use strict';

var CommonUtil = require('CommonUtil');
var ConfigManager = require('ConfigManager');
var Global = require('Global');
var FishFrameData = require('FishFrameData');

var TrackManager = {
    paths: {},
    tracks: {},
    cacheTracks: [], // 服务器下发的鱼群信息缓存
    pathInited: false,
    animInited: false,
    fishLayerInited: false, // fishLayer是否已准备好刷鱼

    init: function init(callback) {
        this._loadPath();
        game.EventManager.on(Global.eventName.newFishGroups, this._eventNewFishGroups, this);
        !!callback && callback();
    },

    uninit: function uninit() {
        game.EventManager.off(Global.eventName.newFishGroups, this._eventNewFishGroups, this);
    },

    reset: function reset() {
        this.cacheTracks = [];
        this.fishLayerInited = false;
    },

    setLayerInited: function setLayerInited(bVal) {
        this.fishLayerInited = bVal;
    },


    // 加载鱼路径配置文件
    _loadPath: function _loadPath() {
        if (this.pathInited) {
            log.info("TrackMgr._loadPath: has been called");
            return;
        }
        this.pathInited = true;
        var self = this;

        // 读取path文件
        cc.loader.loadRes('fish/path/path', function (err, object) {
            if (err) {
                log.error('TrackMgr.loadPath: error:' + err || err.message);
                return;
            }
            // 读取成功后解析path
            self.parsePath(object.json);
            log.info('success to init path info.');
        });

        // 读取track文件
        cc.loader.loadResDir('fish/track', function (err, objects, urls) {
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
    parsePath: function parsePath(data) {
        this.paths = this.parsePathFile(data);
        for (var key in this.paths) {
            var path = this.paths[key];
            this.calcPathVertices(path); // 计算好路径上所有点的坐标
        }
    },

    parsePathFile: function parsePathFile(data) {
        if (!data) {
            log.warn('parsePathFile: data is invalid');
            return [];
        }

        var paths = {};
        try {
            for (var key in data) {
                var arr = data[key].split(';');
                var speeds = this.parseSpeeds(arr[0]);

                var _parsePoints = this.parsePoints(arr[1]),
                    points = _parsePoints.points,
                    ctrls = _parsePoints.ctrls;

                var pathId = parseInt(key);
                paths[pathId] = { speeds: speeds, points: points, ctrls: ctrls };
            }
        } catch (e) {
            log.error('parsePathFile: error to parse path');
        }

        return paths;
    },
    parsePoints: function parsePoints(str) {
        var points = [];
        var ctrls = [];
        try {
            var arrs = str.split('|');
            for (var i = 0, len = arrs.length; i < len; i++) {
                var arr = arrs[i].split(',');
                var pt = cc.v2(parseFloat(arr[0]), parseFloat(arr[1]));
                points.push(pt);
                // 根据数据点自动生成控制点
                CommonUtil.genAutoControls(points, ctrls);
            }
        } catch (e) {
            log.error('parsePoints: str is invalid');
        }
        return { points: points, ctrls: ctrls };
    },
    parseSpeeds: function parseSpeeds(str) {
        var speeds = [];
        try {
            var arr = str.split('|');
            for (var i = 0, len = arr.length; i < len; i++) {
                speeds[i] = parseFloat(arr[i]);
            }
        } catch (e) {
            log.error('parseSpeeds: str is invalid');
        }
        return speeds;
    },


    // 解析从文件中读取的track数据
    parseTracks: function parseTracks(objects, urls) {
        var self = this;
        // for (let i = 0; i < urls.length; i++) {
        //     let index = urls[i].indexOf('_') + 1; // 取文件名并跳过'track_'
        //     let name = urls[i].substring(index);
        //     self.tracks[name] = objects[i].json;
        // }
        for (var key in objects[0].json) {
            var track = this.parseTrackFile(objects[0].json[key]);
            if (track.length > 0) {
                self.tracks[key] = track;
            }
        }
    },

    parseTrackFile: function parseTrackFile(str) {
        var track = [];
        if (str && str.length > 0) {
            try {
                var arrs = str.split('#');
                for (var i = 0, len = arrs.length; i < len; i++) {
                    var arr = arrs[i].split(';');
                    track[i] = { fishId: parseInt(arr[0]), pathId: parseInt(arr[1]), enterTime: parseFloat(arr[2]), exitTime: parseFloat(arr[3]) };
                }
            } catch (e) {
                log.error('parseTrackFile: error to parse track file');
            }
        }
        return track;
    },


    // 从缓存中寻找指定id的鱼
    findFromCacheTracks: function findFromCacheTracks(uid) {
        if (!uid) {
            return null;
        }
        for (var i = 0; i < this.cacheTracks.length; i++) {
            var group = this.cacheTracks[i].group;
            for (var j = 0; j < group.fishes.length; j++) {
                var servFish = group.fishes[j];
                if (uid === servFish.uid) {
                    return servFish;
                }
            }
        }
        return null;
    },

    // 检查缓存中是否有新的track(如果track开始帧小于等于当前鱼帧)
    checkCacheTracks: function checkCacheTracks() {
        if (!this.fishLayerInited) {
            return;
        }

        var removes = [];
        for (var i = 0; i < this.cacheTracks.length; i++) {
            var trackObj = this.cacheTracks[i];
            if (trackObj.group.endFishFrame <= FishFrameData.fishFrame) {
                // 如果track结束帧小于等于鱼帧，代表该track已过期，可以从数组移除了
                removes.push(i);
            } else if (trackObj.group.beginFishFrame <= FishFrameData.fishFrame) {
                this._checkSpecialTrack(trackObj);
                this._checkCacheTrack(trackObj.group);
            }
        }
        // 从后往前删
        for (var j = removes.length - 1; j >= 0; j--) {
            this.cacheTracks.splice(removes[j], 1);
        }
    },

    _checkCacheTrack: function _checkCacheTrack(group) {
        if (!group) {
            return;
        }

        for (var i = 0; i < group.fishes.length; i++) {
            var servFish = group.fishes[i];
            if (!servFish.handled && servFish.endFishFrame <= FishFrameData.fishFrame) {
                servFish.handled = true;
                log.warn('_checkCacheTrack: fish is expired. begin={}, end={}, fishFrame={}', servFish.beginFishFrame, servFish.endFishFrame, FishFrameData.fishFrame);
            } else if (!servFish.handled && !servFish.state && servFish.beginFishFrame <= FishFrameData.fishFrame) {
                // state为0表示存活，1表示死亡
                // 如果鱼开始帧小于等于鱼帧，代表该鱼应开始创建。但此时该项还不能从数组移除，
                // 因为数组索引也是该鱼wave在track中的索引，所以置已处理标记，一直保留到整个group过期删除。
                servFish.handled = true;
                game.EventManager.dispatchEvent(Global.eventName.createNewFish, { servFish: servFish, group: group, index: i });
            }
        }
    },

    // 检查是否特殊鱼，做相应处理
    _checkSpecialTrack: function _checkSpecialTrack(trackObj) {
        if (!trackObj || trackObj.handled) {
            return;
        }

        var group = trackObj.group;
        // 如果track开始帧小于当前帧，则直接返回，避免退出渔场重进后再次播放动画
        // 但因为GM中使用testtrack命令后收到的开始帧已经晚1帧，所以+2做为容错
        if (group.beginFishFrame + 2 < FishFrameData.fishFrame) {
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
            var wave = this.getWaveByGroupIndex(group, 0);
            if (!wave) {
                log.error('_checkSpecialTrack: wave(track={},index=0) is not exist', group.tempId);
                return;
            }
            var path = this.getPathById(wave.pathId); // 根据pathId找到对应path
            if (!path) {
                log.error('_checkSpecialTrack: path(id={}) is not exist', wave.pathId);
                return;
            }

            var zhaoHuanPos = path.vertices[0];
            if (wave.fishId == 47) {
                game.EventManager.dispatchEvent(Global.eventName.startXFDAnim, { pos: zhaoHuanPos, source: group.sourcePos });
            } else {
                game.EventManager.dispatchEvent(Global.eventName.startZhaoHuanAnim, { pos: zhaoHuanPos, source: group.sourcePos, trackId: group.tempId });
            }
        } else {
            // 如果是BOSS鱼，则发送通知播放动画
            var index = Math.floor(group.tempId / 100);
            if (index === 2 || index === 5) {
                trackObj.handled = true;
                game.EventManager.dispatchEvent(Global.MsgMarco.bossArrive, { trackId: group.tempId });
            }

            // 如果是分身鱼
            if (8 == index) {
                trackObj.handled = true;
                var posArr = [];
                for (var i = 0; i < group.fishes.length; i++) {
                    var _wave = this.getWaveByGroupIndex(group, i);
                    if (!_wave) {
                        log.error('_checkSpecialTrack: wave(track={},index=0) is not exist', group.tempId);
                        return;
                    }
                    var _path = this.getPathById(_wave.pathId); // 根据pathId找到对应path
                    if (!_path) {
                        log.error('_checkSpecialTrack: path(id={}) is not exist', _wave.pathId);
                        return;
                    }
                    posArr.push(_path.vertices[0]);
                }
                setTimeout(function () {
                    game.EventManager.dispatchEvent(Global.eventName.virtualBossBorn, posArr);
                }, 1000);
            }
        }
    },

    // 接收服务器下发的鱼群信息
    _eventNewFishGroups: function _eventNewFishGroups(event) {
        var groups = event.data;
        for (var i = 0, len = groups.length; i < len; i++) {
            var group = groups[i];
            var trackObj = { handled: false, group: group };
            this.cacheTracks.push(trackObj);
            log.info('_eventNewFishGroups: recv track_{}(begin={},end={},count={}) from server, frame={}', group.tempId, group.beginFishFrame, group.endFishFrame, group.fishes.length, FishFrameData.fishFrame);
        }
    },

    // 根据group和索引返回相应的wave对象
    getWaveByGroupIndex: function getWaveByGroupIndex(group, waveIndex) {
        var wave = null;

        if (!group || waveIndex < 0) {
            log.warn('getWaveByGroupIndex: group={}, index={}', group, waveIndex);
            return wave;
        }

        var track = this.getTrackByName(group.tempId); // 找到对应track
        if (!track) {
            log.error('error to get track by id={}', group.tempId);
            return wave;
        }

        wave = track[waveIndex]; // 按顺序索引找到对应wave
        return wave;
    },

    // 根据路径ID返回该路径下的所有鱼名字
    _getAnimNamesByTrackId: function _getAnimNamesByTrackId(id) {
        if (!id) {
            log.warn('TrackMgr: Invalid trackid({})', id);
            return null;
        }
        var track = this.getTrackByName(id);
        if (!track) {
            log.warn('TrackMgr: failed to get track by name({})', id);
            return null;
        }
        var names = [];
        var confFishes = ConfigManager.dataMap.FishAttribute;
        for (var i = 0, len = track.length; i < len; i++) {
            var wave = track[i];
            var conf = confFishes[wave.fishId - 1];
            names.push({ name: conf.name, bSpine: conf.isSpine, bUse: true });
        }
        return names;
    },

    // 查找指定名字在数组中是否已经存在
    _findAnimName: function _findAnimName(anims, name) {
        for (var i = 0, len = anims.length; i < len; i++) {
            var obj = anims[i];
            if (obj.name === name) {
                return obj;
            }
        }
        return null;
    },

    // 根据渔场级别得到该渔场所有鱼的名字
    getRoomFishesByType: function getRoomFishesByType(roomType) {
        if (!roomType) {
            log.warn('TrackMgr: Invalid roomType({})', roomType);
            return null;
        }

        var animNames = [];
        var confTrack = ConfigManager.dataMap.TrackAttribute;
        for (var i = 0, len = confTrack.length; i < len; i++) {
            var track = confTrack[i];
            var key = 'roomType' + roomType;
            if (1 === track[key]) {
                var anims = this._getAnimNamesByTrackId(track.trackid);
                if (anims) {
                    for (var j = 0, len2 = anims.length; j < len2; j++) {
                        var anim = anims[j];
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
    getTrackByName: function getTrackByName(name) {
        var track = null;
        if (!!name && !!this.tracks) {
            track = this.tracks[name];
        }
        return track;
    },

    // 根据pathId在返回相应的path数据
    getPathById: function getPathById(pathId) {
        var path = null;
        if (pathId > 0 && this.paths) {
            path = this.paths[pathId];
        }
        return path;
    },

    // 计算整条路径上所有贝塞尔曲线各自切分成多个小段后所有点的坐标，并返回总时间
    calcPathVertices: function calcPathVertices(currPath) {
        var points = currPath.points;
        var ctrls = currPath.ctrls;
        currPath.vertices = [];
        currPath.times = [0];
        var waveTime = 0;

        // points数组存放的是逻辑坐标，vertices需要的是实际坐标
        var pos = CommonUtil.p2v(points[0]);
        currPath.vertices[0] = cc.v2(pos.x, pos.y);

        for (var i = 0, len = points.length - 1; i < len; i++) {
            var speed = currPath.speeds[i];

            var p1c2 = cc.v2(ctrls[i].z, ctrls[i].w);
            var p2c1 = cc.v2(ctrls[i + 1].x, ctrls[i + 1].y);
            var vecs = CommonUtil.getBezierVertices(points[i], p1c2, p2c1, points[i + 1], 10 /*frames*/);

            // 因为vecs的第1个和最后1个点必定是起点和终点，而第1段线段的终点也是第2段线段的起点，
            // 所以存储时需要从第2个点开始，相当于去重。
            // vecs数组存放的是逻辑坐标，vertices需要的是实际坐标
            for (var _i = 1, _len = vecs.length; _i < _len; _i++) {
                pos = CommonUtil.p2v(vecs[_i]);
                currPath.vertices.push(cc.v2(pos.x, pos.y));
            }

            for (var _i2 = 0, _len2 = vecs.length - 1; _i2 < _len2; _i2++) {
                var pt1 = cc.v2(vecs[_i2].x, vecs[_i2].y);
                var pt2 = cc.v2(vecs[_i2 + 1].x, vecs[_i2 + 1].y);
                var dist = pt1.sub(pt2).mag();
                var t = dist / speed;
                waveTime += t;
                // 保存每小段时间到数组，避免鱼游动时重复运算(注意：时间不是均等的)
                currPath.times.push(waveTime);
            }
        }
        return waveTime;
    },

    // 计算整条路径上所有贝塞尔曲线各自切分成多个小段后所有点的坐标，并返回总时间
    // 这个方法暂时不用
    calcWaveTime: function calcWaveTime(currWave, currPath) {
        var points = currPath.points;
        var ctrls = currPath.ctrls;
        currPath.vertices = [];
        currPath.times = [0];
        var waveTime = 0;

        // points数组存放的是逻辑坐标，vertices需要的是实际坐标
        currPath.vertices[0] = CommonUtil.p2v(points[0]);

        for (var i = 0, len = points.length - 1; i < len; i++) {
            var p1c2 = cc.v2(ctrls[i].z, ctrls[i].w);
            var p2c1 = cc.v2(ctrls[i + 1].x, ctrls[i + 1].y);

            var vecs = CommonUtil.getBezierVertices(points[i], p1c2, p2c1, points[i + 1], 10);
            // 因为vecs的第1个和最后1个点必定是起点和终点，而第1段线段的终点也是第2段线段的起点，
            // 所以存储时需要从第2个点开始，相当于去重。
            // vecs数组存放的是逻辑坐标，vertices需要的是实际坐标
            for (var _i3 = 1, _len3 = vecs.length; _i3 < _len3; _i3++) {
                currPath.vertices.push(CommonUtil.p2v(vecs[_i3]));
            }

            var speed = currPath.speeds[i];
            for (var _i4 = 0, _len4 = vecs.length - 1; _i4 < _len4; _i4++) {
                var pt1 = cc.v2(vecs[_i4].x, vecs[_i4].y);
                var pt2 = cc.v2(vecs[_i4 + 1].x, vecs[_i4 + 1].y);
                var dist = pt1.sub(pt2).mag();
                var t = dist / speed;
                waveTime += Math.round(CommonUtil.calcFrameBySecond(t)); // 四舍五入取整
                // 保存每小段时间到数组，避免鱼游动时重复运算
                currPath.times.push(waveTime);
            }
        }
        return waveTime;
    }
};

module.exports = TrackManager;

cc._RF.pop();