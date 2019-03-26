"use strict";
cc._RF.push(module, '6e1e5e9eJ9IBq8/sxyfq/N7', 'Utility');
// script/framework/utils/Utility.js

"use strict";

window.Utility = {

    //     // 震动手机
    //     vibratePhone: function(times){
    //         if(!times){
    //             log.info('times must be not null');
    //             return;
    //         }

    //         if(cc.sys.isNative){
    //             if(cc.sys.os == cc.sys.OS_ANDROID){
    //                 jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utility",
    //                     "vibratePhone", "(I)V",times);
    //             }else if(cc.sys.os == cc.sys.OS_IOS){
    //                 jsb.reflection.callStaticMethod("Utility",
    //                     "vibratePhone:",times);
    //             }else{
    //                 log.info('please call this method in native platform');
    //             }
    //         }else{
    //             log.info('please call this method in native platform');
    //         }
    //     },

    //     // 震动模式
    //     vibrateWithPattern: function(){
    //         log.info('step in vibrateWithPattern');
    //          if(cc.sys.isNative){
    //             if(cc.sys.os == cc.sys.OS_ANDROID){
    //                 jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utility",
    //                     "vibrateWithPattern", "()V");
    //             }else if(cc.sys.os == cc.sys.OS_IOS){
    //                 jsb.reflection.callStaticMethod("Utility",
    //                     "vibrateWithPattern:");
    //             }else{
    //                 log.info('please call this method in native platform');
    //             }
    //         }else{
    //             log.info('please call this method in native platform');
    //         }
    //     },

    //     // onMessage: function(funcwithparam){
    //     //     //参数 按照:拼接，第一个是方法名，后边的是参数。
    //     // },

    //     // 网络状态
    //     getNetState: function(callback){
    //         this.netStateListener = callback;

    //         if(cc.sys.isNative){
    //             if(cc.sys.os == cc.sys.OS_ANDROID){
    //                 jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utility",
    //                     "getNetState", "()V");
    //             }else if(cc.sys.os == cc.sys.OS_IOS){
    //                 jsb.reflection.callStaticMethod("Utility",
    //                     "getNetState:");
    //             }else{
    //                 log.info('please call this method in native platform');
    //             }
    //         }else{
    //             log.info('please call this method in native platform');
    //         }
    //     },

    //     // 网络状态回馈
    //     onNetState: function(State){
    //         if(this.netStateListener){
    //             this.netStateListener(State);
    //         }
    //     },

    //     // 获取电量
    //     getBatteryLevel: function(callback){
    //         this.batteryLevelListener = callback;

    //         if(cc.sys.isNative){
    //             if(cc.sys.os == cc.sys.OS_ANDROID){
    //                 jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utility",
    //                     "getBatteryLevel", "()V");
    //             }else if(cc.sys.os == cc.sys.OS_IOS){
    //                 jsb.reflection.callStaticMethod("Utility",
    //                     "getBatteryLevel:");
    //             }else{
    //                 log.info('please call this method in native platform');
    //             }
    //         }else{
    //             log.info('please call this method in native platform');
    //         }
    //     },

    //     onBatteryLevel: function(level){
    //         log.info('onBatteryLevel........');
    //         if(this.batteryLevelListener){
    //             this.batteryLevelListener(level);
    //         }
    //     },

    //     // 剩余内存
    //     getAvailMemory: function(callback){
    //         this.memoryListener = callback;
    //         if(cc.sys.isNative){
    //             if(cc.sys.os == cc.sys.OS_ANDROID){
    //                 jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utility",
    //                     "getAvailMemory", "()V");
    //             }else if(cc.sys.os == cc.sys.OS_IOS){
    //                 jsb.reflection.callStaticMethod("Utility",
    //                     "getAvailMemory:");
    //             }else{
    //                 log.info('please call this method in native platform');
    //             }
    //         }else{
    //             log.info('please call this method in native platform');
    //         }
    //     },

    //     onAvailMemory: function(memory){
    //         if(this.memoryListener){
    //             this.memoryListener(memory);
    //         }
    //     },

    //     // 剩余硬盘
    //     getAvailRom: function(callback){
    //         this.availRomListener = callback;
    //         if(cc.sys.isNative){
    //             if(cc.sys.os == cc.sys.OS_ANDROID){
    //                 jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utility",
    //                     "getAvailRom", "()V");
    //             }else if(cc.sys.os == cc.sys.OS_IOS){
    //                 jsb.reflection.callStaticMethod("Utility",
    //                     "getAvailRom:");
    //             }else{
    //                 log.info('please call this method in native platform');
    //             }
    //         }else{
    //             log.info('please call this method in native platform');
    //         }
    //     },

    //     onAvailRom: function(size){
    //         if(this.availRomListener){
    //             this.availRomListener(size);
    //         }
    //     },

    //     // 获取地址
    //     getLocation: function(callback){
    //         this.locationListener = callback;
    //         if(cc.sys.isNative){
    //             if(cc.sys.os == cc.sys.OS_ANDROID){
    //                 // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utility",
    //                 //     "getLocation", "()V");
    //             }else if(cc.sys.os == cc.sys.OS_IOS){
    //                 jsb.reflection.callStaticMethod("Utility",
    //                     "getLocation:");
    //             }else{
    //                 log.info('please call this method in native platform');
    //             }
    //         }else{
    //             log.info('please call this method in native platform');
    //         }
    //     },

    //     onLocation: function(location){
    //         if(this.locationListener){
    //             this.locationListener(location);
    //         }
    //     },

    //     onShake: function(){
    //         log.info('onShake..........');
    //         if(this.shakeListener){
    //             if(this.sharecaller) {
    //                 this.shakeListener.call(this.caller);
    //             }else {
    //                 this.shakeListener();
    //             }
    //         }
    //     },

    //     setShakeListener: function(callback, caller){
    //         this.sharecaller = caller;
    //         this.shakeListener = callback;
    //     },

    // copyToPasteboard: function (data) {
    //     if (cc.sys.isNative) {
    //         if (cc.sys.os == cc.sys.OS_ANDROID) {
    //             jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utility",
    //                 "copyToPasteboard", "(Ljava/lang/String;)V", data);
    //         } else if (cc.sys.os == cc.sys.OS_IOS) {
    //             jsb.reflection.callStaticMethod("Utility",
    //                 "copyToPasteboard:", data);
    //         } else {
    //             log.info('please call this method in native platform');
    //         }
    //     }
    // },

    switchScreenAutoLockState: function switchScreenAutoLockState(canLock) {
        if (cc.sys.isNative) {
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utility", "switchScreenAutoLockState", "(Z)V", canLock);
            } else if (cc.sys.os == cc.sys.OS_IOS) {
                jsb.reflection.callStaticMethod("Utility", "switchScreenAutoLockState:", canLock);
            } else {
                log.info('please call this method in native platform');
            }
        }
    }
};

cc._RF.pop();