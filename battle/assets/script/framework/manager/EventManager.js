

//事件管理类
window.game || (window.game = {});

game.EventManager = {
    eventTarget: null,
    referenceMap: {},
    init: function () {
        if (!this.eventTarget) {
            this.eventTarget = new cc.EventTarget();
        }
    },

    on: function (event, callback, target) {
        if(!event){
            return;
        }
        this.init();
        this.eventTarget.on(event, callback, target);
        this.autoTargetOff(target);

        if (!this.referenceMap[event]) this.referenceMap[event] = 1;
    },

    once: function (event, callback, target) {
        this.init();
        this.eventTarget.once(event, callback, target);
    },

    off: function (event, callback, target) {
        this.init();
        this.eventTarget.off(event, callback, target);
    },

    targetOff: function (target) {
        this.init();
        this.eventTarget.targetOff(target);
    },

    // 自动释放监听事件
    autoTargetOff: function (target) {
        let self = this;
        if (target instanceof cc.Component) {
            // 已存在onDestroy，覆写
            if (!!target.onDestroy) {
                let func = target.onDestroy;
                target.onDestroy = function () {
                    log.info('EventManager: destroy and remove target {}', target.name);
                    self.targetOff(target);
                    func.call(target);
                }
            } else {
                target.onDestroy = function () {
                    log.info('EventManager: remove target {}', target.name);
                    self.targetOff(target);
                }
            }
        }
    },

    dispatchEvent: function (type, data) {
        this.init();
        // 从对象池取事件对象
        let eventObj = cc.Event.EventCustom.get(type);
        eventObj.data = data;
        this.eventTarget.dispatchEvent(eventObj);
        delete eventObj.data;
        cc.Event.EventCustom.put(eventObj);
    }
}
