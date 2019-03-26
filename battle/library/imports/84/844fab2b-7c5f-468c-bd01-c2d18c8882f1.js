"use strict";
cc._RF.push(module, '844fasrfF9GjL0BwtGMiILx', 'CommonUtil');
// script/framework/utils/CommonUtil.js

"use strict";

var SCREEN_RATIO = 100;
var CommonUtil = {

    framesPerSecond: 20, // 默认每秒20帧(服务器帧率)
    secondsPerFrame: 1.0 / 20,

    localFramesPerSecond: 4.0, // 鱼本地帧率/每秒和服务器同步几次
    secondsPerLocalFrame: 1 / 4.0, // 每个本地帧消耗的时间

    // 得到当前内存中所有纹理所占内存大小(单位为M)
    getAllTextureSize: function getAllTextureSize() {
        var allRes = cc.textureCache.getAllTextures();
        var fileLimit = 1024 * 1024;
        var totalSize = 0;
        for (var k = 0; k < allRes.length; k++) {
            var psize = parseInt(allRes[k].width) * parseInt(allRes[k].height) * 4;
            totalSize += psize;
        }
        return Math.round(totalSize / fileLimit); // 四舍五入取整
    },

    // 把帧数量转换为时间秒数(例如：当前游戏设定为每秒20帧，则100帧应该返回5秒)
    calcSecondByFrame: function calcSecondByFrame(frame) {
        return frame * this.secondsPerFrame;
    },

    // 把秒数转换为帧数量(例如：当前游戏设定为每秒20帧，则5秒应该返回100帧)
    calcFrameBySecond: function calcFrameBySecond(sec) {
        return Math.floor(sec * this.framesPerSecond); // 向下取整
    },

    // 把秒数转换为本地帧数量
    localFrameBySecond: function localFrameBySecond(sec) {
        return Math.floor(sec * this.localFramesPerSecond);
    },

    // 把服务器帧数量转换为本地帧数量
    // 例如：服务器每秒20帧，本地每秒30帧，则5个服务器帧相当于7.5个本地帧
    frame2LocalFrame: function frame2LocalFrame(frames) {
        return Math.floor(frames * (this.localFramesPerSecond / this.framesPerSecond));
    },

    // 返回1970-01-01至今的毫秒数
    getTick: function getTick() {
        var d = new Date();
        return d.getTime();
    },

    visibleSize: cc.size(0, 0),
    visibleRect: cc.rect(0, 0, 0, 0),
    invalidPos: -10000,

    init: function init() {
        this.visibleSize = cc.view.getVisibleSize();
        this.winSize = cc.winSize;
        var origin = cc.view.getVisibleOrigin();
        this.visibleRect = cc.rect(origin.x, origin.y, this.visibleSize.width, this.visibleSize.height);
    },

    // 根据当前时间进度返回三阶贝塞尔曲线的实时点位置
    getCubicBezierVertex: function getCubicBezierVertex(p0, p1, p2, p3, t) {
        var x = p0.x * Math.pow(1 - t, 3) + 3 * p1.x * t * Math.pow(1 - t, 2) + 3 * p2.x * t * t * (1 - t) + p3.x * t * t * t;
        var y = p0.y * Math.pow(1 - t, 3) + 3 * p1.y * t * Math.pow(1 - t, 2) + 3 * p2.y * t * t * (1 - t) + p3.y * t * t * t;
        return { x: x, y: y };
    },

    // 根据输入小段数返回当前贝塞尔曲线切分成该小段数量后相应点的位置
    getBezierVertices: function getBezierVertices(start, ctrl1, ctrl2, end, segment) {
        var t = 0;
        var vecs = [];

        for (var i = 0; i < segment; i++) {
            var pt = this.getCubicBezierVertex(start, ctrl1, ctrl2, end, t);
            vecs.push(pt);
            t += 1.0 / segment;
        }

        vecs.push({ x: end.x, y: end.y });
        return vecs;
    },

    // 根据起点和终点自动生成控制点
    // 输入：points为Vec2数组（起点、终点）
    // 输出：ctrls为{x,y,z,w}数组（控制点）
    genAutoControls: function genAutoControls(points, ctrls) {
        var RATIO = this.vx2px(60); // 原为50,现先转换为逻辑坐标
        var len = points.length;
        if (len - 1 != ctrls.length) {
            return;
        }

        if (len === 1) {
            var pt = points[0];
            ctrls.push({ x: pt.x, y: pt.y, z: pt.x, w: pt.y });
            return;
        }

        // len >= 2
        var dir2 = points[len - 1].sub(points[len - 2]).normalize();

        // len == 2
        if (len === 2) {
            var _p1c = points[0].add(dir2.mul(RATIO));
            var _p2c = points[1].sub(dir2.mul(RATIO));
            ctrls[0].z = _p1c.x;
            ctrls[0].w = _p1c.y;
            ctrls.push({ x: _p2c.x, y: _p2c.y, z: points[1].x, w: points[1].y });
            return;
        }

        // len > 2
        var dir3 = points[len - 1].sub(points[len - 3]).normalize();
        var p1c1 = points[len - 2].sub(dir3.mul(RATIO));
        var p1c2 = points[len - 2].add(dir3.mul(RATIO));
        ctrls[len - 2] = { x: p1c1.x, y: p1c1.y, z: p1c2.x, w: p1c2.y };

        var p2c1 = points[len - 1].sub(dir2.mul(RATIO));
        ctrls.push({ x: p2c1.x, y: p2c1.y, z: points[len - 1].x, w: points[len - 1].y });
    },

    // 得到两点之间的旋转角度(顺时针方向为正)
    // 默认鱼图片头朝右，往右下方向游，角度应为正；往右上方向游，角度应为负
    getVecAngle: function getVecAngle(currVec, nextVec) {
        // let p1 = (180 / Math.PI);
        var vec = cc.v2(nextVec).sub(cc.v2(currVec));
        var a1 = -Math.atan2(vec.y, vec.x);
        //let r1 = a1 * p1 + 180; // 图片本身头朝左，角度需要加180
        var r1 = a1 * cc.macro.DEG;
        return r1;
    },

    // 把二元向量中的浮点数格式化为小数点后只带2位
    formatVec2: function formatVec2(v2) {
        var x = v2.x.toFixed(2);
        var y = v2.y.toFixed(2);
        return { x: x, y: y };
    },

    // 把四元向量中的浮点数格式化为小数点后只带2位
    formatVec4: function formatVec4(v4) {
        var x = v4.x.toFixed(2);
        var y = v4.y.toFixed(2);
        var z = v4.z.toFixed(2);
        var w = v4.w.toFixed(2);
        return { x: x, y: y, z: z, w: w };
    },

    vx2px: function vx2px(vx) {
        var vsize = cc.view.getVisibleSize();
        return vx / vsize.width * SCREEN_RATIO;
        // return (vx / this.visibleSize.width * SCREEN_RATIO);
    },

    vy2py: function vy2py(vy) {
        var vsize = cc.view.getVisibleSize();
        return vy / vsize.height * SCREEN_RATIO;
        // return (vy / this.visibleSize.height * SCREEN_RATIO);
    },

    px2vx: function px2vx(px) {
        var vsize = cc.view.getVisibleSize();
        return px * vsize.width / SCREEN_RATIO;
        // return (px * this.visibleSize.width / SCREEN_RATIO);
    },

    py2vy: function py2vy(py) {
        var vsize = cc.view.getVisibleSize();
        return py * vsize.height / SCREEN_RATIO;
        // return (py * this.visibleSize.height / SCREEN_RATIO);
    },

    // 把屏幕坐标转换为逻辑坐标
    v2p: function v2p(v) {
        var p = { x: this.vx2px(v.x), y: this.vy2py(v.y) };
        return p;
    },

    // 把逻辑坐标转换为屏幕坐标
    p2v: function p2v(p) {
        var v = { x: this.px2vx(p.x), y: this.py2vy(p.y) };
        return v;
    },

    // 限制x的值在a和b之间，小于a则返回a，大于b则返回b
    clamp: function clamp(x, a, b) {
        return x < a ? a : x > b ? b : x;
    },

    // 保留小数点后2位，输入参数为字符串
    keepTwoFromStr: function keepTwoFromStr(str) {
        var num = parseFloat(str);
        return this.keepTwoFromNum(num);
    },

    // 保留小数点后2位，输入参数为浮点数
    keepTwoFromNum: function keepTwoFromNum(num) {
        var ret = Math.round(num * 100) / 100;
        return ret;
    },

    // 坐标是否在屏幕内
    posInScreen: function posInScreen(pos) {
        return this.visibleRect.contains(pos);
        // let vsize = cc.view.getVisibleSize();
        // return (pos.x >= 0 && pos.x < vsize.width && pos.y >= 0 && pos.y < vsize.height) ? true : false;
    },

    // 矩形是否在屏幕内
    rectInScreen: function rectInScreen(rc) {
        // let b = this.visibleRect.intersects(rc);
        // log.info('rectInScreen: ret=' +b +', screen={}, rc={}', this.visibleRect, rc);
        // return b;
        return this.visibleRect.intersects(rc); // 两矩形有相交即认为在屏幕内
    },

    //是否在圆形的爆炸半径内
    containsInBoomArea: function containsInBoomArea(pos, radius, argPos) {
        var disX = pos.x - argPos.x;
        var disY = pos.y - argPos.y;
        var distancePow = Math.pow(disX, 2) + Math.pow(disY, 2);
        var distance = Math.sqrt(distancePow);
        if (distance < radius) {
            return true;
        } else {
            return false;
        }
    },

    //计算两点距离
    getDistanceByPoint: function getDistanceByPoint(pos1, pos2) {
        var param = Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2);
        var distance = Math.sqrt(param);
        return Math.abs(distance);
    }
};

module.exports = CommonUtil;

cc._RF.pop();