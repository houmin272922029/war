const SpriteManager = require('SpriteManager');
const ComponentTools = require('ComponentTools');
const i18n = require('LanguageData');
const ConfigManager = require('ConfigManager');
// const WeaponHelper = require('WeaponHelper');
// const PlayerData = require('PlayerData');

//获得资源路径
let ResManager = {
    //资源路径
    prefabURL: {
        // 公共
        // 大厅
        signView: { dir: 'signin', name: 'signInView', clickOtherClose: true },//签到
        shopView: { dir: 'shop', name: 'shopView', clickOtherClose: true },            //商城信息
        vipView: { dir: 'vip', name: 'vipView', clickOtherClose: true },            //vip
        weekDayView: { dir: 'weekCard', name: 'weekDayView', clickOtherClose: false },//贵宾卡奖励
        vipReward: { dir: 'vip', name: 'vipReward', clickOtherClose: false },//vip道具补充
        alert: { dir: 'hallCommon', name: 'alert', clickOtherClose: false },//alert
        bagView: { dir: 'bag', name: 'bagView', clickOtherClose: true },//背包
        personal: { dir: 'personal', name: 'personal', clickOtherClose: true },      //个人信息
        errorPanel: { dir: 'common', name: 'errorPanel', clickOtherClose: false },     //error
        mailView: { dir: 'mail', name: 'mailView', clickOtherClose: true },//邮件
        changeHead: { dir: 'personal', name: 'changeHead', clickOtherClose: false },//个人信息 修改头像
        changeName: { dir: 'personal', name: 'changeName', clickOtherClose: false },//个人信息 修改名字
        sceneUnlockTip: { dir: 'hallCommon', name: 'sceneUnlockTip', clickOtherClose: false },        //场景解锁
        buyItem: { dir: 'bag', name: 'buyItem', clickOtherClose: false },//购买
        bagGiftOrBuy: { dir: 'bag', name: 'bagGiftOrBuy', clickOtherClose: false },//赠送
        sallItem: { dir: 'bag', name: 'sallItem', clickOtherClose: false }, //出售
        weekView: { dir: 'weekCard', name: 'weekView', clickOtherClose: true },//周卡
        weekRewardView: { dir: 'weekCard', name: 'weekRewardView', clickOtherClose: false },//贵宾卡奖励展示
        arenaView: { dir: 'hallArena', name: 'arenaView', clickOtherClose: true },//竞技场
        arenaWeekRank: { dir: 'hallArena', name: 'arenaweekchampionPanel', clickOtherClose: false },//竞技场周排行 和昨日排行
        arenaTask: { dir: 'hallArena', name: 'arenaTaskPanel', clickOtherClose: false },//竞技场任务
        arenaInfo: { dir: 'hallArena', name: 'arenaInfoPanel', clickOtherClose: false },//竞技场信息
        billView: { dir: 'bill', name: 'billView', clickOtherClose: true },//话费赛
        billInfoPanel: { dir: 'bill', name: 'billInfoPanel', clickOtherClose: false },//话费赛信息面板
        billrewardPanel: { dir: 'bill', name: 'billrewardPanel', clickOtherClose: false },//话费赛奖励面板
        billExchangePanel: { dir: 'bill', name: 'billExchangePanel', clickOtherClose: false },//话费赛奖励面板
        billAddressPanel: { dir: 'bill', name: 'billAddressPanel', clickOtherClose: false },//兑换输入地址
        billPhonePanel: { dir: 'bill', name: 'billPhonePanel', clickOtherClose: false },//兑换输入电话号码
        sevenDayLift: { dir: 'sevenday', name: 'sevenDayLift', clickOtherClose: false },//七日登录分享礼包

        // 渔场
        blessTip: { dir: 'bless', name: 'blessTip', clickOtherClose: false },//月神赐福
        reconnectionView: { dir: 'mainCommon', name: 'reconnectionView', clickOtherClose: false },//重连提示
        handBook: { dir: 'mainCommon', name: 'handBook', clickOtherClose: true },//图鉴
        setting: { dir: 'mainCommon', name: 'setting', clickOtherClose: false },
        vipUnlockLayer: { dir: 'weapon', name: 'vipUnlockLayer', clickOtherClose: true },//
        rageUnlockTip: { dir: 'skill', name: 'rageUnlockTip', clickOtherClose: false },
        sceneIdleTip: { dir: 'tip', name: 'sceneIdleTip', clickOtherClose: false },
        //起航礼包
        startGift:{ dir: 'hallCommon', name: 'startGift', clickOtherClose: false },
        startGuide:{ dir: 'hallCommon', name: 'startGuide', clickOtherClose: false },
        //登陆
        accountLoginPanel: { dir: 'login', name: 'accountLoginPanel', clickOtherClose: false },//账号登陆
        pwdLoginPanel: { dir: 'login', name: 'pwdLoginPanel', clickOtherClose: false },//密码登陆
        rePwdLoginPanel: { dir: 'login', name: 'rePwdLoginPanel', clickOtherClose: false },//重置密码
        selectLoginPanel: { dir: 'login', name: 'selectLoginPanel', clickOtherClose: false },//选择登陆
        accountRegisterPanel: { dir: 'login', name: 'accountRegisterPanel', clickOtherClose: false },//账号注册
        bindAccountPanel: { dir: 'login', name: 'bindAccountPanel', clickOtherClose: false },//绑定
         
    },

    clickOtherClosePrefab: {
        signView: true,
        weekView: true,
        personal: true,
        shopView: true,
        vipView: true,
        bagView: true,
        handBook: true,
        mailView: true,
        blessTip: true,
    },

    isSameURL: function (src, dest) {
        return (!!src && !!dest && src.dir === dest.dir && src.name === dest.name);
    },

    getIsCloseByOther: function (url) {
        for (let key in this.prefabURL) {
            if (this.prefabURL[key] === url) {
                return this.clickOtherClosePrefab[key];
            }
        }
        return false;
    },
    ItemType: { item: 2, currency: 1 },

    //获得炮的动画路径
    //index 是基础炮多少管
    getWeaponURLByLevel: function (level, index = 1) {
        return level > 0 ? 'anim_VIP' + level : ('anim_VIP0_' + index);
    },

    //获得自己当前炮的形象
    getSelfWeaponURL: function () {
        let url = null;
        // if (PlayerData.armAvatar > WeaponHelper.jichuValue) {
        //     url = 'ui_huanpao_pao_0' + (PlayerData.armAvatar - WeaponHelper.jichuValue);
        // } else {
        //     url = 'ui_huanpao_pao_0' + WeaponHelper.getBaseWeapinSkin(0);
        // }
        return url;

    },

    //获取当前炮音效 type 1 开火 2 爆炸
    getEffectBgType: function (type) {
        let str = (type && type == 2) ? '_baozha' : '_kaihuo';
        let effect = null;
        // if (PlayerData.armAvatar > WeaponHelper.jichuValue) {
        //     effect = 'vip' + (PlayerData.armAvatar - WeaponHelper.jichuValue) + str;
        // } else {
        //     effect = 'vip' + WeaponHelper.getBaseWeapEffect(0) + str;
        // }
        return effect;
    },

    //根据配置数据，获得道具数据 道具名称 道具图标
    //@iteminfo 服务器配置
    //@itemIcon icon图标 item 或者货币
    //@nameLabel 名称label
    //@countLabel 数量label
    //@descLabel 描述label
    //@merge 是否合并名字和数量
    //@uint 合并后是否带单位
    //@countUint 艺术字 特殊符号
    //@ CongraNode 恭喜获得
    setCommonItemData: function (iteminfo, itemIcon, nameLabel, countLabel, descLabel, merge, uint, countUint, CongraNode, special) {
        if (iteminfo) {
            let items = iteminfo.split('|');
            if (items.length > 0) {
                let itemConf = ConfigManager.dataMap.Item;
                for (let j = 0; j < itemConf.length; j++) {
                    if (itemConf[j].itemid === parseInt(items[1])) {
                        if (cc.isValid(itemIcon)) {
                            SpriteManager.setSprite(itemIcon, 'icon', itemConf[j].name);
                        }
                        let itemName = i18n.t(itemConf[j].nameLanguage);
                        if (!!merge && merge === true) {
                            if (!!merge && typeof uint === 'string') {
                                itemName = itemName + 'x' + items[2] + '/' + uint;
                            } else {
                                itemName = itemName + ' x' + items[2];
                                if (special) {
                                    ComponentTools.labelString(countLabel, itemName);
                                    return;
                                }
                            }
                        }
                        if (special) {
                            ComponentTools.labelString(countLabel, items[2].split('"')[0]);
                            return;
                        }
                        if (CongraNode) {
                            ComponentTools.labelString(CongraNode, itemName);
                        }
                        ComponentTools.labelString(nameLabel, itemName);
                        ComponentTools.labelString(descLabel, i18n.t(itemConf[j].suoding_des));
                        break;
                    }
                }
                if (!!countUint) {
                    ComponentTools.labelString(countLabel, countUint + items[2]);
                } else {
                    ComponentTools.labelString(countLabel, items[2]);
                }

            }
            return items;
        }
        return null;
    },

    //设置背包中的数据
    setBagItemData: function (iteminfo, itemIcon, nameLabel, countLabel, descLabel) {
        if (iteminfo) {
            let items = iteminfo;
            let itemConf
            if (items.length > 0) {
                itemConf = ConfigManager.dataMap.Item;
                for (let j = 0; j < itemConf.length; j++) {
                    if (itemConf[j].itemid === parseInt(items[0])) {
                        if (cc.isValid(itemIcon)) {
                            SpriteManager.setSprite(itemIcon, 'icon', itemConf[j].name);
                        }
                        ComponentTools.labelString(nameLabel, i18n.t(itemConf[j].nameLanguage));
                        ComponentTools.labelString(descLabel, i18n.t(itemConf[j].suoding_des));
                        break;
                    }
                }
                ComponentTools.labelString(countLabel, items[1]);
            }
            return itemConf;
        }
        return null;
    },

    //设置道具图标
    setCommonIcon: function (iteminfo, itemIcon) {
        if (iteminfo) {
            let items = iteminfo.split('|');
            if (items.length > 0) {
                let itemConf = ConfigManager.dataMap.Item;
                for (let j = 0; j < itemConf.length; j++) {
                    if (itemConf[j].itemid === parseInt(items[1])) {
                        if (cc.isValid(itemIcon)) {
                            SpriteManager.setSprite(itemIcon, 'icon', itemConf[j].name);
                        }
                        break;
                    }
                }
            }
            return items;
        }
    },

    //获得道具的名称
    getCommonItemName: function (iteminfo, isNotCount) {
        if (iteminfo) {
            let items = iteminfo.split('|');
            if (items.length > 0) {
                let itemConf = ConfigManager.dataMap.Item;
                for (let j = 0; j < itemConf.length; j++) {
                    if (itemConf[j].itemid === parseInt(items[1])) {
                        if (!!isNotCount) {
                            return i18n.t(itemConf[j].nameLanguage);
                        } else {

                            if (parseInt(items[2]) <= 0) {
                                return i18n.t(itemConf[j].nameLanguage);
                            } else {
                                return i18n.t(itemConf[j].nameLanguage) + 'x' + items[2];
                            }
                        }

                    }
                }

            }

        }
        return "";
    },

    //获得道具的名称
    getCommonItemNameByID: function (itemId) {
        if (itemId) {
            let itemConf = ConfigManager.dataMap.Item;
            for (let j = 0; j < itemConf.length; j++) {
                if (itemConf[j].itemid === parseInt(itemId)) {
                    return i18n.t(itemConf[j].nameLanguage)
                }
            }
        }
        return "";
    },

    //特殊样式的道具 货币不显示名称 数量1时不显示数量
    setCommonItemData2: function (iteminfo, itemIcon, nameLabel, countLabel, merge, countUint) {
        if (iteminfo) {
            let items = iteminfo.split('|');
            if (items.length > 0) {
                let itemConf = ConfigManager.dataMap.Item;
                for (let j = 0; j < itemConf.length; j++) {
                    if (itemConf[j].itemid === parseInt(items[1])) {

                        if (cc.isValid(itemIcon)) {
                            SpriteManager.setSprite(itemIcon, 'icon', itemConf[j].name);
                        }
                        //不是货币时 显示名称，  是货币 不显示名称
                        if (parseInt(items[0]) != this.ItemType.currency) {
                            let itemName = i18n.t(itemConf[j].nameLanguage);
                            if (!!merge && merge === true) {
                                if (!!merge && typeof uint === 'string') {
                                    itemName = itemName + 'x' + items[2] + '/' + uint;
                                } else {
                                    itemName = itemName + 'x' + items[2];
                                }
                            }
                            ComponentTools.labelString(nameLabel, itemName, true);
                        }

                        break;
                    }
                }
                if (items[2] > 1) {
                    if (!!countUint) {
                        ComponentTools.labelString(countLabel, countUint + items[2], true);
                    } else {
                        ComponentTools.labelString(countLabel, items[2], true);
                    }
                }


            }
            return items;
        }
        return null;
    },

}

module.exports = ResManager;
