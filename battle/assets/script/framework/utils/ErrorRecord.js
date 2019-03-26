
let ErrorRecord = {
    _catch: {},
    _init: false,
    _url: 'http://140.143.209.62:8099/game/error',
    // _url: 'http://192.168.16.87:8098/game/error',
    init() {
        if (!this._init) {
            let _data = cc.sys.localStorage.getItem('ErrorRecord');
            if (!cc.isValid(_data) || _data == '') {
                _data = {};
            } else {
                _data = JSON.parse(_data);
            }
            this._catch = _data;
        }
        this._init = true;
    },
    report(data) {
        this.init();
        let _data = JSON.stringify(data);
        if (!this._catch[_data]) {
            this._catch[_data] = 1;
            // let http = require('HttpHelper');
            // http.httpOper(http.operType.error, null, null, _data);
            this.send(_data);

            cc.sys.localStorage.setItem('ErrorRecord', JSON.stringify(this._catch));
        }
    },

    send(data) {
        let xhr = cc.loader.getXMLHttpRequest();
        let url = this._url;
        xhr.onreadystatechange = function () {
            //readyState属性，4 表示准备就绪状态， status属性 200 表示请求成功
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    // log.info('Http.sendXHR: xhr.readyState is ready, url = {}', url);
                } else {
                    log.error('error report failed! code = {}, url = {} ', xhr.status, url);
                }

            } else {
                // log.info('Http.sendXHR: xhr.readyState is not ready!');
            }
        };
        xhr.open("POST", url, true);
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        }
        xhr.timeout = 5000;// 5 seconds for timeout
        xhr.send(data);
    }
}

if (cc.sys.isNative) {
    let __handle = window.__errorHandler;
    window.__errorHandler = function () {
        ErrorRecord.report(arguments);
        if (__handle) {
            __handle(arguments);
        }
    }

} else if (cc.sys.isBrowser) {
    let __handle = window.onerror;
    window.onerror = function () {
        ErrorRecord.report(arguments);
        if (__handle) {
            __handle(arguments);
        }
    }
}