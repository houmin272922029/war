
const ConfigManager = require('ConfigManager');

let FuncTools = {
    funcNames:[{name:'match',toggle:0},{name:'item_send',toggle:0},{name:'item_sell',toggle:0},{name:'match_item',toggle:0},{name:'exchange',toggle:0},{name:'charge',toggle:0}],//功能名称
    itemIdToFuncs:{'match_item':[1204]},//功能对应的id
    //初始化功能开启掩码
    initFunMask: function(code){
        for (let i = 0; i < this.funcNames.length; i++) {
            this.funcNames[i].toggle = code & Math.pow(2,i);
            cc.log(this.funcNames[i],code);
        }
        this.exchangeItemConfig();
    },

    //获得功能开关
    getFuncStatus: function(name){
        for (let i = 0 ; i < this.funcNames.length; i++) {
            if (this.funcNames[i].name === name) {
                return this.funcNames[i].toggle > 0;
            }
        }
        return false;
    },
    
    //转换
    exchangeItemConfig: function(){
        if (this.getFuncStatus('match_item')) {
            let itemFConfig = ConfigManager.getConfig('Item-f');
            let itemConfig = ConfigManager.getConfig('Item');
            let newConfigs = [];
            if (!!itemFConfig) {
                for (let i = 0; i < itemFConfig.length ; i++) {
                    for (let j = 0 ; j < this.itemIdToFuncs['match_item'].length; j++) {
                        if (itemFConfig[i].itemid === this.itemIdToFuncs['match_item'][j]) {
                            newConfigs.push(itemFConfig[i]);
                            break;
                        }
                    }
                }
            }

            if (!!newConfigs && !!itemConfig) {
                for (let n = 0 ; n < newConfigs.length; n++) {
                    for (let m = 0; m < itemConfig.length; m++ ) {
                        if (newConfigs[n].itemid === itemConfig[m].itemid) {
                            itemConfig[m] = newConfigs[n];
                            break;
                        }
                        
                    }        
                }
            }
            
        }
    },



};
module.exports = FuncTools;
