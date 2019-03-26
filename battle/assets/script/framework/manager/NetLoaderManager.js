//解决GameHelper中无法引用NetHelper的问题
const ResManager = require('ResManager');
const Global = require('Global');

let NetLoaderManager = {
    netStatus:cc.Enum({difference:0,general:1,good:2}),
    genralLevel:250,
    goodLevel:20,
    oldPrefabs:[
        {name:'TreasureHuntFishStartPanel',clockId:-1},
        {name:'treasureHuntFishView',clockId:-1},
        {name:'palaceTip',clockId:-1},
        {name:'palace',clockId:-1},
    ],
    needCheckPrefabs:[
    ],
    isInit:false,
    
    initPrefabs: function(){
        if (this.isInit) {
            return;
        }
        for (let key in ResManager.prefabURL) {
            let item = ResManager.prefabURL[key];
            // let url = PrefabManager.fullPath(item.dir, item.name);
            // let arr = url.split('/');
            // let panelName = arr[arr.length - 1];
            this.needCheckPrefabs.push({name:item.name,clockId:-1});
        }

        for (let i = 0; i < this.oldPrefabs.length; i++) {
            this.needCheckPrefabs.push(this.oldPrefabs[i]);
        }
        this.isInit = true;
    },

    //网络延迟大的情况下，提示玩家网络状态不好
    startCheckStatus: function(url) {
        //网络状态不佳的时开启检查
        if (this.getNetPower() === this.netStatus.difference) {
            if (!!url) {
                let arr = url.split('/');
                let panelName = arr[arr.length - 1];
                if(!!panelName) {
                    for (let i = 0; i < this.needCheckPrefabs.length;i++) {
                        if (panelName === this.needCheckPrefabs[i].name && this.needCheckPrefabs[i].clockId < 0) {
                            this.needCheckPrefabs[i].clockId = setTimeout(() => {
                                // Global.CommomUICtl.initCreateTips({tip: "当前网络状态不佳!", time: 2});
                                require('UIManager').showUI(ResManager.prefabURL.reconnectionView,1);
                                this.needCheckPrefabs[i].clockId = -1;
                            }, 4000);
                            break;
                        }
                    }
                }
            }
        }
    },

    //关闭网络延迟提示
    closeCheckStatus: function(object){
        if (!object) {
            return;
        }
        let name = object.name;
        if(!!name) {
            for (let i = 0; i < this.needCheckPrefabs.length;i++) {
                if (name === this.needCheckPrefabs[i].name) {
                    if (this.needCheckPrefabs[i].clockId >= 0) {
                        clearTimeout(this.needCheckPrefabs[i].clockId);
                        
                        this.needCheckPrefabs[i].clockId = -1;
                    }
                    break;
                }
            }
        }
    },

    getNetPower: function(){
        if (Global.netDelayTime <= this.goodLevel ) {
            return this.netStatus.good;
        }else if (Global.netDelayTime <= this.genralLevel) {
            return this.netStatus.general;
        }else {
            return this.netStatus.difference;
        }
        return this.netStatus.general;

    },

    clear: function(){
        for (let i = 0; i < this.needCheckPrefabs.length; i++) {
            if (this.needCheckPrefabs[i].clockId > -1) {
                clearTimeout(this.needCheckPrefabs[i].clockId);
                this.needCheckPrefabs[i].clockId = -1;
            }
        }
    }


};
module.exports = NetLoaderManager;