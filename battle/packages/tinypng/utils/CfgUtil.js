let fs = require('fire-fs');
let path = require('fire-path');
const { remote } = require('electron');
let FileUtil = Editor.require("packages://tinypng/utils/FileUtil");


let self = module.exports = {
    cfgData: {
        key: "",
        skipFiles: "",
    },
    saveConfig(data) {
        let configFilePath = self._getAppCfgPath();
        this.cfgData.key = data.key;
        this.cfgData.skipFiles = data.skipFiles;

        fs.writeFile(configFilePath, JSON.stringify(this.cfgData), function (error) {
            if (!error) {
                Editor.log("保存配置成功!");
            }
        }.bind(this));
    },
    cleanConfig() {
        fs.unlink(this._getAppCfgPath());
    },

    getMainFestDir() {
        let userDataPath = remote.app.getPath('userData');
        return path.join(userDataPath, "resCompress-manifestOutPut");
        //输出文件不能存在在插件目录下，否则会造成插件刷新
    },
    _getAppCfgPath() {
        let userDataPath = remote.app.getPath('userData');
        let tar = Editor.libraryPath;
        tar = tar.replace(/\\/g, '-');
        tar = tar.replace(/:/g, '-');
        return path.join(userDataPath, "resCompress-cfg-" + tar + ".json");
    },
    initCfg(cb) {
        let configFilePath = this._getAppCfgPath();
        let b = FileUtil.isFileExit(configFilePath);
        if (b) {
            fs.readFile(configFilePath, 'utf-8', function (err, data) {
                if (!err) {
                    Editor.log("读取配置成功!");
                    let saveData = JSON.parse(data.toString());
                    self.cfgData = saveData;
                    if (cb) {
                        cb(saveData);
                    }
                }
            }.bind(self));
        } else {
            if (cb) {
                cb(null);
            }
        }
    }
}