"use strict";
cc._RF.push(module, 'cc095LuCF5FPacccwCN0/mm', 'ViewManager');
// script/framework/manager/ViewManager.js

'use strict';

var AudioManager = require('AudioManager');
var UIManager = require('UIManager');
var ResLoadManager = require('ResLoadManager');
var Global = require('Global');
var PrefabManager = require('PrefabManager');
var AnimManager = require('AnimManager');
var SpineManager = require('SpineManager');
var SpriteManager = require('SpriteManager');

var ViewManager = {

    prevScene: null, // 上一场景
    nextScene: null, // 下一场景

    // 当前场景数据 
    // name:场景名称, instance:场景对象实例(通过instance.node可得到场景节点)
    currentScene: { name: '', instance: null },

    // 游戏中所有场景的文件名和脚本名
    // preload: 定义本场景内需预加载的资源，以目录为单位，暂不支持单个文件
    SceneInfo: {
        Login: { name: "login", comName: 'Login' },
        JumpScene: { name: "jumpScene", comName: 'JumpScene' },
        LoadingScene: { name: "loadingScene", comName: 'LoadingScene' },
        // 大厅
        Hall: { name: "hall", comName: 'Hall' },
        // 主渔场
        MainScene: {
            name: "mainScene", comName: 'MainScene',
            preload: [{ type: ResLoadManager.Type.Welcome, dir: 'welcome' }, { type: ResLoadManager.Type.MainBg, dir: 'mainBg' }, { type: ResLoadManager.Type.Spine, dir: 'boss' }, { type: ResLoadManager.Type.Fish, dir: 'fish', delay: 100 }]
        }
    },

    // 主渔场的子节点
    MainScene: {
        // path:节点路径(可以有层级)，comName:节点对象实例名(脚本组件名)，layer:实例对象缓存
        // 第1层
        BgLayer: { path: 'bgLayer', comName: 'BgLayer', layer: null }, // 背景层
        BaseLayer: { path: 'baseLayer', comName: 'BaseLayer', layer: null }, // 基础视图层(鱼、子弹、渔网)
        PlayerLayer: { path: 'playerLayer', comName: 'PlayerLayer', layer: null }, // 玩家层(UI按钮、炮台、金币特效)
        UILayer: { path: 'uiLayer', comName: 'UILayer', layer: null }, // UI层(各个UI面板)
        PopupLayer: { path: 'popupLayer', comName: 'PopupLayer', layer: null }, // 弹窗层(各种弹窗)
        GameLayer: { path: 'gameLayer', comName: 'GameLayer', layer: null }, //小游戏层
        // FishLayer: { path: 'bgLayer', comName: 'FishLayer', layer: null }, //鱼的游动层
        // 第2层
        BulletLayer: { path: 'baseLayer/bulletLayer', comName: 'BulletLayer', layer: null }, // 子弹层
        WeaponLayer: { path: 'playerLayer/weaponLayer', comName: 'WeaponLayer', layer: null }, // 炮台
        FishLayer: { path: 'baseLayer/fishLayer', comName: 'FishLayer', layer: null }, //渔场层
        ZhaoHuanLayer: { path: 'playerLayer/zhaoHuanLayer', comName: 'zhaoHuanLayer', layer: null }, //召唤层级
        CoinLayer: { path: 'playerLayer/coinLayer', comName: 'CoinEffectLayer', layer: null }, // 特效层
        SuperWeaponLayer: { path: 'playerLayer/superWeaponLayer', comName: 'SuperWeaponLayer', layer: null }, //轰炸机特效层
        SkillLayer: { path: 'playerLayer/skillLayer', comName: 'SkillLayer', layer: null }, // 技能按钮层
        ArenaLayer: { path: 'playerLayer/arenaLayer', comName: 'ArenaLayer', layer: null }, //竞技场
        SwitchBtn: { path: 'playerLayer/switchBtn', comName: 'SwitchBtn', layer: null //左右适配的按钮
        } },

    /**
     * 切换场景
     * @param {*场景数据} sceneInfo 
     * @param {*其它属性} data 
     */
    loadScene: function loadScene(sceneInfo, data) {
        this._setPreScene();
        ResLoadManager.init(this);
        this.nextScene = sceneInfo;
        if (sceneInfo.name == 'hall') {
            Global.opportunity = 2; // 1进入渔场、2进入大厅、3进入竞技场
        }
        // 先进入Loading场景
        this.enterScene(this.SceneInfo.LoadingScene);
    },

    // 所有资源加载完毕，真正进入场景
    enterScene: function enterScene(sceneInfo) {
        var _this = this;

        log.info('ViewManager.enterScene: {}', sceneInfo.name);

        cc.director.loadScene(sceneInfo.name, function (err, scene) {
            if (err) {
                log.error('ViewManager.enterScene: error to load scene: ' + err);
                return;
            }

            UIManager.reset();
            _this.releaseOldScene(_this.currentScene.name);
            _this.setCurrentScene(sceneInfo, scene);
        });
    },

    // 释放旧场景资源
    releaseOldScene: function releaseOldScene(name) {
        if (!name) {
            return;
        }

        AnimManager.releaseScene(name);
        SpineManager.releaseScene(name);
        // SpriteManager.releaseScene(name);
        // PrefabManager.releaseScene(name);

        // 如果从主渔场退出，还需释放所有鱼资源
        if (this.isMainScene(name)) {
            AnimManager.releaseDir('fish');
            SpineManager.releaseDir('fish');

            this.resetLayersFromMainScene();
        }

        cc.sys.garbageCollect(); // 调用垃圾回收
    },

    // 切换渔场时重置layer缓存
    resetLayersFromMainScene: function resetLayersFromMainScene() {
        for (var name in this.MainScene) {
            if (this.MainScene[name]) {
                this.MainScene[name].layer = null;
            }
        }
    },

    setCurrentScene: function setCurrentScene(sceneInfo, scene) {
        log.info('ViewManager.setCurrentScene: {}', sceneInfo.name);

        // 场景节点的根节点是Canvas
        var node = scene.getChildByName('Canvas');
        if (node) {
            this.currentScene.name = sceneInfo.name;
            this.currentScene.instance = node.getComponent(sceneInfo.comName);
        } else {
            this.currentScene.name = '';
            this.currentScene.instance = null;
        }
    },

    getCurrentScene: function getCurrentScene() {
        return this.currentScene.instance;
    },

    // 判断指定场景是否当前正在运行的场景
    isCurrentScene: function isCurrentScene(sceneInfo) {
        return this.currentScene.instance && this.currentScene.name === sceneInfo.name ? true : false;
    },

    // 判断指定场景是否主渔场
    isMainScene: function isMainScene(name) {
        return !!name && name === this.SceneInfo.MainScene.name;
    },

    // 判断指定场景是否竞技场
    isArenaScene: function isArenaScene(name) {},

    // 返回当前场景节点的对象实例
    getScene: function getScene(sceneInfo) {
        var scene = null;
        if (this.isCurrentScene(sceneInfo)) {
            scene = this.currentScene.instance;
        }
        return scene;
    },

    //返回当前场景的canvas
    getCanvas: function getCanvas() {
        return cc.director.getScene().getChildByName('Canvas');
    },

    // 根据节点路径返回主渔场内相应layer节点，如果失败返回null
    getNodeFromMainScene: function getNodeFromMainScene(layerInfo) {
        var node = null;
        if (this.isCurrentScene(this.SceneInfo.MainScene)) {
            node = cc.find(layerInfo.path, this.currentScene.instance.node);
        }
        return node;
    },

    // 根据节点路径返回主渔场内相应layer节点的对象实例，如果失败返回null
    getLayerFromMainScene: function getLayerFromMainScene(layerInfo) {
        if (!layerInfo) {
            return null;
        }
        if (!layerInfo.layer) {
            var node = this.getNodeFromMainScene(layerInfo);
            if (node) {
                layerInfo.layer = node.getComponent(layerInfo.comName);
            }
        }
        return layerInfo.layer;
    },

    //获得的UI显示层 有些面板即要显示在大厅，又要显示在渔场中
    getUILayerFromScene: function getUILayerFromScene() {
        var layer = null;
        if (!!this.currentScene.instance && cc.isValid(this.currentScene.instance.node)) {
            layer = cc.find(this.MainScene.UILayer.path, this.currentScene.instance.node);
            if (!cc.isValid(layer)) {
                var layerNode = new cc.Node('uiLayer');
                layerNode.setContentSize(1280, 720);
                layerNode.parent = this.currentScene.instance.node;
                layer = layerNode;
            }
        }
        return layer;
    },

    //获得的弹出层
    getPopLayerFromScene: function getPopLayerFromScene() {
        var layer = null;
        if (!!this.currentScene.instance && cc.isValid(this.currentScene.instance.node)) {
            layer = cc.find(this.MainScene.PopupLayer.path, this.currentScene.instance.node);
            if (!cc.isValid(layer)) {
                var layerNode = new cc.Node('popupLayer');
                layerNode.setContentSize(1280, 720);
                layerNode.parent = this.currentScene.instance.node;
                layer = layerNode;
            }
        } else {
            //登录界面中的弹窗
            var canvas = this.getCanvas();
            if (!!canvas) {
                layer = canvas.getChildByName('popupLayer');
                if (!cc.isValid(layer)) {
                    var _layerNode = new cc.Node('popupLayer');
                    _layerNode.setContentSize(1280, 720);
                    _layerNode.parent = canvas;
                    layer = _layerNode;
                }
            }
        }
        return layer;
    },

    /**
     * 游戏截屏
     * @param {*截屏成功回调} func 
     */
    // screenShot: function (func) {
    //     if (!cc.sys.isNative) return;
    //     let dirpath = 'share.jpg';
    //     let size = cc.winSize;
    //     let rt = cc.RenderTexture.create(size.width, size.height, cc.Texture2D.PIXEL_FORMAT_RGBA8888, gl.DEPTH24_STENCIL8_OES);
    //     cc.director.getScene()._sgNode.addChild(rt);
    //     rt.setVisible(false);
    //     rt.begin();
    //     cc.director.getScene()._sgNode.visit();
    //     rt.end();
    //     jsb.fileUtils.removeFile(jsb.fileUtils.getWritablePath() + dirpath);
    //     rt.saveToFile(dirpath, cc.ImageFormat.JPG, true, function (renderTexture, path) {
    //         rt.destroy(true);
    //         if (func) {
    //             func(dirpath);
    //         }
    //     });
    // },

    /**
     * 显示UI
     * config = {prefab: cc.Prefab, type:ShowType, ui:cc.Node, zIndex: zIndex, action: ActionType, backPrefab: cc.Prefab}
     */
    showUI: function showUI(config) {
        log.info('showUI {}', config.prefab._name);
        if (!config || !config.prefab) return;
        // 创建ui实例,  createUI内 uid判断是否存在， 避免多次创建
        var ret = UIManager.createUI(config.prefab);
        var ui = ret[1];

        if (!ret[0]) {
            if (!ui.inHiding) {
                return ui;
            }
            ui.stopAllActions();
        }
        // 处理显示父节点
        // if (config.type == game.Types.ShowType.ShowByNode) {
        //     ui.parent = config.ui;
        // }
        // if (config.type == game.Types.ShowType.ShowByLayer) {
        //     ui.parent = cc.find('Canvas');
        //     if (config.zIndex > 0) {
        //         ui.zIndex = config.zIndex;
        //     }
        // }

        ui.active = true;
        if (!!config.parent) {
            ui.parent = config.parent;
        }
        if (undefined === config.action) {
            config.action = game.Types.ActionType.Default;
        }
        ui.opacity = config.action > 0 ? 0 : 255;

        // 处理显示动画
        // utils.keepActionFPS(0.4, 60);
        if (game.Types.ActionType.Fade == config.action || game.Types.ActionType.Default == config.action) {
            var func = cc.callFunc(function () {
                ui.opacity = 0.2;
                ui.runAction(cc.fadeIn(0.3));
            });
            ui.runAction(cc.sequence(cc.delayTime(0.1), func));
        }
        if (game.Types.ActionType.Jump == config.action) {
            var _func = cc.callFunc(function () {
                ui.scale = 0;
                ui.opacity = 255;
                ui.runAction(cc.scaleTo(0.2, 1));
            });
            ui.runAction(cc.sequence(cc.delayTime(0.1), _func));
        }
        // ui.emit('show', {});
        return ui;
    },

    /**
     * 
     * @param {*} config 
     * @param {*是否从UIManager中移除} remove 
     */
    hideUI: function hideUI(config, remove) {
        var node = UIManager.getUIInstance(config.uuid, true);
        if (!node) {
            return;
        }
        log.info('hideUI {}', node._name);
        var root = node.root ? node.root : node;
        remove || (remove = false);
        if (remove) {
            UIManager.removeUI(config.uuid);
        }
        var end = cc.callFunc(function () {
            UIManager.removeUI(config.uuid);
            if (config.nextBgMusic) {
                AudioManager.playMusic(config.nextBgMusic);
            }
        }.bind(node));

        if (!config.action || config.action == game.Types.ActionType.Default) {
            config.action = game.Types.ActionType.Fade;
        }

        // utils.keepActionFPS(0.2, 60);
        if (game.Types.ActionType.Jump == config.action) {
            root.inHiding = true;
            root.runAction(cc.sequence(cc.scaleTo(0.2, 0), end));
        }
        if (game.Types.ActionType.Fade == config.action) {
            root.inHiding = true;
            root.runAction(cc.sequence(cc.fadeOut(0.2), end));
        }
    },

    _setPreScene: function _setPreScene() {
        if (this.currentScene.name === 'mainScene') {
            this.prevScene = { name: "mainScene" };
        } else if (this.currentScene.name === 'hall') {
            this.prevScene = { name: "hall" };
        } else {
            this.prevScene = { name: "login" };
        }
        // this.prevScene = 
    }

};

module.exports = ViewManager;

cc._RF.pop();