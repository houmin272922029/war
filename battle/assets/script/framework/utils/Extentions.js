const Base64 = require('Base64');
const Global = require('Global');
const AudioManager = require('AudioManager');

// String  字符串延伸函数
String.prototype.formatLogList = function (value) {
    var args = value;
    var index = 0;
    return this.replace(/\{(\d*)\}/g, function () {
        var val = args[index];
        index++;
        if (_.isUndefined(val)) {
            return "";
        } else if (typeof val == "function") {
            return val;
        }
        try {
            var str = JSON.stringify(val);
        } catch (e) {
            str = val;
        }
        return str;
    });
};
String.prototype.formatList = function (value) {
    var args = value;
    if (typeof value != 'object' && typeof value != 'array') args = arguments;

    return this.replace(/\{(\d+)\}/g, function () {
        var val = args[arguments[1]];
        return (val == null) ? arguments[0] : val;

    });
};
String.prototype.splice = function (index, remove, str) {
    return this.slice(0, index) + str + this.slice(index + Math.abs(remove));
};
String.prototype.decodeByBase64 = function () {
    return Base64.decode(this);
};
String.prototype.encodeByBase64 = function () {
    return Base64.encode(this);
};

// 正则取0-9
String.prototype.regxToNumber = function () {
    var regx = /[^0-9]/g;
    return this.replace(regx, '');
};
// 正则取char
String.prototype.regxToChar = function () {
    var regx = /[^A-Za-z]/g;
    return this.replace(regx, '');
};
// 正则取有效
String.prototype.regxToCharAndNumber = function () {
    var regx = /[^A-Za-z0-9]/g;
    return this.replace(regx, '');
};
// 正则取name
String.prototype.regxToName = function () {
    var regx = /[^\u4e00-\u9fa5A-Za-z]/g;
    return this.replace(regx, '');
};
// 正则取邮箱账号
String.prototype.regxToMail = function () {
    var regx = /[^A-Za-z\d\@\.\-\_]/g;
    return this.replace(regx, '');
};
// 正则取有效字符
String.prototype.regxToValidString = function () {
    var regx = /[^\u4e00-\u9fa5A-Za-z0-9]/g;
    return this.replace(regx, '');
};
// 正则去除空格字符
String.prototype.deleteBlankString = function () {
    var regx = /\s|\xA0/g;
    return this.replace(regx, '');
};
//取字符串字节长度
String.prototype.GetLen = function () {
    var regEx = /^[\u4e00-\u9fa5\uf900-\ufa2d]+$/;
    if (regEx.test(this)) {
        return this.length * 2;
    } else {
        if (this.length > 0) {
            var oMatches = this.match(/[\x00-\xff]/g);
            var oLength = this.length * 2 - oMatches.length;
            return oLength;
        }
        return 0;
    }
};

String.prototype.toArtNumber = function (symbol) {
    return toArtNumber(parseInt(this), symbol);
};

let toArtNumber = function (paramNumber, symbol) {
    paramNumber *= 10000;
    if (symbol) {
        if (paramNumber > 0) paramNumber = '<' + paramNumber;
        if (paramNumber < 0) paramNumber = '=' + paramNumber;
    }
    if (paramNumber >= 100000000) {
        if (paramNumber > 100000000) {
            paramNumber += ':';
            paramNumber += ';';
        } else {
            paramNumber += ';';
        }
    } else if (paramNumber > 10000) {
        paramNumber += ':';
    } else {
        // return paramNumber;
        return '0:';
    }
    var iNumCount = (paramNumber + "").length;
    var numArray = [];
    var newString = '';
    for (i = 0; i < iNumCount; i++) {
        var num = paramNumber.charAt(i);
        numArray.push(num);
    }
    if (paramNumber.indexOf(':') > 0 && paramNumber.indexOf(';') > 0) {
        var hundredMilion = numArray[numArray.length - 1];
        var tenThousand = numArray[numArray.length - 2];
        numArray.splice(numArray.length - 2, 2);

        numArray.splice(numArray.length - 8, 0, hundredMilion);
        numArray.splice(numArray.length - 4, 0, tenThousand);
    } else if (paramNumber.indexOf(':') < 0 && paramNumber.indexOf(';') > 0) {
        var hundredMilion = numArray[numArray.length - 1];
        numArray.splice(numArray.length - 1, 1);
        numArray.splice(numArray.length - 8, 0, hundredMilion);
    } else if (paramNumber.indexOf(':') > 0 && paramNumber.indexOf(';') < 0) {
        var tenThousand = numArray[numArray.length - 1];
        numArray.splice(numArray.length - 1, 1);
        numArray.splice(numArray.length - 4, 0, tenThousand);
    }
    for (var i = 0; i < numArray.length; i++) {
        var str = numArray[i];
        newString += str;
    }
    // return newString;
    return newString.substring(0, newString.indexOf(':') + 1);
}

Number.prototype.toArtNumber = function (symbol) {
    return toArtNumber(this, symbol);
}



// cc.Node 延伸函数
cc.Node.prototype.setNodeColor = function (color) {
    let setColor = function (node, color) {
        node.color = color;
        for (let i in node.children) {
            setColor(node.children[i], color);
        }
    }
    setColor(this, color);
};

// 
cc.Node.prototype.setEnabled = function (enabled) {
    log.info("set node color gray");
    let setEnabled = function (node, enabled) {
        let btn = node.getComponent(cc.Button);
        let sprite = node.getComponent(cc.Sprite);
        if (btn) {
            btn.interactable = enabled;
        } else if (sprite) {
            sprite._sgNode.setState(enabled ? 0 : 1);
        } else {
            node.color = enabled ? cc.Color.WHITE : cc.color(175, 175, 175);
        }

        for (let i in node.children) {
            setEnabled(node.children[i], enabled);
        }
    }
    setEnabled(this, enabled);
}


// cc.Node 延伸函数
cc.Sprite.prototype.loadFromUrl = function (url) {
    if (!!url && url.length > 0) {
        let self = this;

        if (self.spriteUrl == url) return -1;

        let match = url.indexOf('.png');
        let data = null;
        if (match >= 0) {
            data = url;
        } else {
            data = { url: url, type: 'png' };
        }

        self.spriteFrame = null;
        self.spriteUrl = url;

        if (undefined == self.loadIndex) self.loadIndex = 0;
        var loadStep = {
            url: url,
            index: ++self.loadIndex,
        }

        cc.loader.load(data, function (err, texture) {
            if (err) {
                log.info('loadFrom {} failed!', data);
                cc.loader.load(cc.url.raw(url), function (err, texture) {
                    if (err) {
                        log.info('loadFromUrl raw failed! err = {}', err);
                    }
                    else {
                        if (loadStep.index == self.loadIndex) {
                            self.spriteFrame = new cc.SpriteFrame(texture);
                            self.loadIndex = 0;
                        }
                    }
                });
            } else {
                if (loadStep.index == self.loadIndex) {
                    self.spriteFrame = new cc.SpriteFrame(texture);
                    self.loadIndex = 0;
                }
            }
        });
    } else {
        log.info('loadFromUrl failed, url is undefined!', url);
    }
};

cc.Node.prototype.getScript = function () {
    if (!this._bindScript) {
        for (let i in this._components) {
            if (this._components[i]._bindToNode) {
                this._bindScript = this._components[i];
                break;
            }
        }
    }
    return this._bindScript;
};

cc.Label.prototype.onLoad = function () {
    if ('Microsoft Yahei' == this.fontFamily && !this.font) {
        this.fontFamily = 'Arial';
    }
};

cc.Widget.prototype.start = function () {
    if (1 == this.alignMode) game.EventManager.on('ON_WINDOWS_RESIZE', () => { if (cc.isValid(this.node)) this.updateAlignment(); }, this.node);
};

cc.Canvas.prototype.onLoad = function () {
    // log.error('canvas = {}, view = {}', this.designResolution, cc.view.getVisibleSize())
    if (cc.sys.isBrowser && !cc.sys.isMobile) {
        // 电脑浏览器
        this.fitWidth = true;
        this.fitHeight = true;
    } else {
        let size = cc.view.getFrameSize();
        if (size.width / size.height < 16 / 9) {
            // 窄屏
            this.fitWidth = true;
            this.fitHeight = false;
            Global.designSize.height = 720 * size.width / size.height;
        } else {
            // 宽屏
            this.fitWidth = false;
            this.fitHeight = true;
        }
    }
};

cc.Button.prototype._onTouchEnded =  function (event) {
    if (!this.interactable || !this.enabledInHierarchy) return;

    if (this._pressed) {
        cc.Component.EventHandler.emitEvents(this.clickEvents, event);
        this.node.emit('click', this);
    }
    this._pressed = false;
    this._updateState();
    event.stopPropagation();

    // 按钮点击 音效
    AudioManager.playEffect(Global.simpleBtnEffect);
    Global.simpleBtnEffect = "tongyong_anniudianji";
    game.EventManager.dispatchEvent(Global.eventName.matchTipsEvent, {});  //话费赛欢迎tips
};

// if (cc.ENGINE_VERSION.indexOf('2.') < 0) {
//     let errorTip = function (tip) {
//         log.error('该api 即将废弃，请使用.x或.y', tip);
//         cc.game.pause();
//     }
//     cc.Node.prototype.setPositionX = errorTip;
//     cc.Node.prototype.setPositionY = errorTip;
//     cc.Node.prototype.getPositionX = errorTip;
//     cc.Node.prototype.getPositionY = errorTip;
// }

// cc.Widget.prototype.onLoad = function () {
//     let size = cc.view.getVisibleSize();
//     let canvas = cc.find('Canvas');
//     if (this.node.parent === canvas) {
//         if (size.width / size.height < 16 / 9) {
//             // 窄屏
//             let offSize = size.height - 720;
//             if (this.isAlignTop) this.top -= offSize / 2;
//             if (this.isAlignBottom) this.bottom -= offSize / 2;
//         }
//     }
// };

// cc.Sprite.prototype.setTexture = function (url) {
//     let texture = cc.textureCache.getTextureForKey(url);
//     if (!texture) {
//         // 记录手动加载的纹理
//         if (!this.releaseTextureArray) this.releaseTextureArray = [];
//         this.releaseTextureArray.push(url);
//         this.releaseTextureArray.push(url);
//         let self = this;

//         let func = self.onDestroy;
//         this.onDestroy = function () {
//             //调用自身原始onDestroy
//             if (typeof func == 'function') func.call(self);
//             //释放所有手动加载过的纹理
//             for (let i in self.releaseTextureArray) {
//                 cc.loader.release(self.releaseTextureArray[i]);
//             }
//         }
//     }
//     // 切换纹理
//     this.spriteFrame = new cc.SpriteFrame(url);
// };