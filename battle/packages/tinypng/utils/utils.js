var path = require("path");
var fs = require("fs");

var list = [];
var compressionList = [];
var baseDir = null;
var res_path = null;
var compressBaseDir = null;
var compressionOutputDir = null;
var historyDir = null;
var tempDir = null;

let FileUtil = Editor.require("packages://tinypng/utils/FileUtil");

class utils {

    static loadPngFiles() {
        if (!res_path) return;
        let skip = {};
        if (this.skipFiles) {
            let arr = this.skipFiles.split('|')
            for (let i in arr) {
                skip[arr[i]] = 1;
            }
        }
        Editor.log('忽略: ' + JSON.stringify(skip));
        list = [];
        let state = fs.lstatSync(res_path);
        if (state.isDirectory()) {
            this.scanFiles(res_path, skip);
        }
        return list;
    }

    static initAllPath() {
        baseDir = `${Editor.projectInfo.path}`;                         // 工程根目录
        res_path = baseDir + '\\build\\' + this.project + '\\res\\raw-assets\\';  // 目标资源目录
        compressBaseDir = baseDir + '\\compression\\';                  // 压缩资源根目录
        compressionOutputDir = compressBaseDir + 'output\\';            // 压缩输出目录
        historyDir = compressBaseDir + 'history\\';                     // 历史资源对比目录
        tempDir = compressBaseDir + 'temp\\';                           // 临时资源路径

        this.loadPngFiles();// 加载资源

        try {
            fs.mkdirSync(tempDir);
        } catch (e) {
            if (e.code !== 'EEXIST') {
                throw e;
            } else {
                FileUtil.emptyDir(tempDir);
            }
        }
        try {
            fs.mkdirSync(historyDir);
            fs.mkdirSync(compressionOutputDir);
        } catch (e) {
            if (e.code !== 'EEXIST') {
                throw e;
            }
        }
    }

    static equalFile(file1, file2) {
        if (this.isPng(file1) && this.isPng(file2) || this.isJpg(file1) && this.isJpg(file2)) {
            let stats1 = fs.lstatSync(file1);
            let stats2 = fs.lstatSync(file2);
            return stats1.size == stats2.size;
        } else {
            return false;
        }
    }

    static mkDir(basePath, path) {
        let idx = path.indexOf('\\');
        let dir = null;
        if (idx >= 0) {
            dir = path.substr(0, idx);
            try {
                fs.mkdirSync(basePath + dir);
                this.mkDir(basePath + dir + '\\', path.substring(idx + 1));
            } catch (e) {
                if (e.code !== 'EEXIST') {
                    throw e;
                } else {
                    this.mkDir(basePath + dir + '\\', path.substring(idx + 1));
                }
            }
        }
    }

    static backResUp() {
        // let proj_path = Editor.projectPath;
        this.initAllPath();
        let state = fs.lstatSync(res_path);
        for (let i in list) {
            let item = list[i];
            let relative_path = item.path.substring(res_path.length);
            let cpsFile = compressionOutputDir + relative_path;

            let oldres = tempDir + relative_path;
            let hisRes = historyDir + relative_path;
            let newres = res_path + relative_path;

            // 生成相关文件夹
            this.mkDir(tempDir, relative_path);
            this.mkDir(historyDir, relative_path);
            this.mkDir(compressionOutputDir, relative_path);
            // 备份文件
            fs.createReadStream(newres).pipe(fs.createWriteStream(oldres));

            // 发现已有压缩资源
            if (FileUtil.isFileExit(hisRes) && FileUtil.isFileExit(cpsFile)) {
                // 对比历史资源是否有更新
                if (!this.equalFile(hisRes, newres)) {
                    // 不相同，放入压缩队列
                    compressionList.push({
                        resPath: item.path,
                        output: cpsFile,
                    });
                    // fs.createReadStream(newres).pipe(fs.createWriteStream(oldres)); //文件复制
                }
            } else {
                // 放入压缩队列
                compressionList.push({
                    resPath: item.path,
                    output: cpsFile,
                });
                // fs.createReadStream(newres).pipe(fs.createWriteStream(oldres)); //文件复制
            }
        }
        Editor.log('there are ' + compressionList.length + ' pictures need to compress');
    }

    static getCompressionFiles() {
        return compressionList;
    }

    // static checkIsExistProject(target) {
    //     let proj_path = Editor.projectPath;
    //     res_path = null;

    //     // proj_path = path.sep + "platformBuild" + path.sep + target;
    //     // res_path = Editor.projectInfo.path + proj_path + path.sep + "res";

    //     Editor.log(`正在检测构建工程是否存在：${Editor.projectInfo.path}${proj_path}`);
    //     try {
    //         let state = fs.lstatSync(`${Editor.projectInfo.path}${proj_path}`);
    //         Editor.log(state.isDirectory());
    //         Editor.log(res_path);
    //         return state.isDirectory();
    //     } catch (error) {
    //         Editor.error("构建工程不存在!请先构建项目...");
    //         return false;
    //     }
    // }

    static scanFiles(dir, skip) {

        let files = fs.readdirSync(dir);

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let file_path = path.join(dir, file);
            let stat = fs.lstatSync(file_path);
            if (stat.isDirectory()) {
                if (!skip[file]) this.scanFiles(file_path, skip);
            } else {
                if (this.isPng(file_path) || this.isJpg(file_path)) {
                    let item = {
                        path: file_path,
                        before_size: stat.size,
                        name: file,
                    }
                    list.push(item);
                }
            }
        }
    }

    static isPng(fileName) {
        if (path.extname(fileName).toLocaleLowerCase() == ".png") {
            return true
        } else {
            return false
        }
    }

    static isJpg(fileName) {
        if (path.extname(fileName).toLocaleLowerCase() == ".jpg") {
            return true
        } else {
            return false
        }
    }

    static replaceCompressionRes() {
        // 替换压缩资源
        for (let i in list) {
            let item = list[i];
            let relative_path = item.path.substring(res_path.length);
            let cpsFile = compressionOutputDir + relative_path;

            fs.createReadStream(cpsFile).pipe(fs.createWriteStream(item.path));
        }
    }

    static revertRes() {
        // 还原已压缩资源
        // for (let i in list) {
        //     let item = list[i];
        //     let relative_path = item.path.substring(res_path.length);
        //     let tempFile = tempDir + relative_path;

        //     fs.createReadStream(tempFile).pipe(fs.createWriteStream(item.path));
        // }

        // 替换历史
        setTimeout(() => {
            FileUtil.emptyDir(historyDir);
            setTimeout(() => {
                // 删除文件夹
                fs.rmdirSync(historyDir);
                setTimeout(() => {
                    // 重命名文件夹
                    fs.renameSync(tempDir, historyDir);
                }, 1000);
            }, 5000);
        }, 0);
    }
}

module.exports = utils
