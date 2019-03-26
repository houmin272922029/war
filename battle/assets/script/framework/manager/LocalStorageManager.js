
//本地存储 包括一个时间计算
            
let LocalStorageManager = {

    setItem: function(key,value){
        cc.sys.localStorage.setItem(key, value);
    },

    getItem: function(key){
        return cc.sys.localStorage.getItem(key);
    },


    setJsonItem: function(key,jsonData){
        cc.sys.localStorage.setItem(key, JSON.stringify(jsonData));
    },

    getJsonItem: function(key){
        let str = cc.sys.localStorage.getItem(key);
        if (!!str) {
            return JSON.parse(str);
        }
        return null;
    },

    removeItem: function(key){
        cc.sys.localStorage.removeItem(key);
    },


    //检查当前key存储的数据是否是在当前天
    //需要存储的格式{time:xxxx,count:xxxx}
    isSameDay: function(key){
        let data = this.getJsonItem(key);
        if (!!data && !!data.time) {
            let nowDate = new Date(Date.now());
            let saveDate = new Date(data.time);
            if (nowDate.getFullYear() != saveDate.getFullYear() || nowDate.getMonth() != saveDate.getMonth() || nowDate.getDate() != saveDate.getDate()) {
                return false;
            }
        }
        return true;
    },

};
module.exports = LocalStorageManager;