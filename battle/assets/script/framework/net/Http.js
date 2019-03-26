const Global = require("Global");
/**
 * Http消息类
 * 用途：向服务器发送Http请求
 */
let Http = {

    //发送请求(http请求，只用于用户登录)
    sendRequest: function (path, data, handler, extraUrl) {
        let str = "?";
        for (let k in data) {
            if (str != "?") {
                str += "&";
            }
            str += k + "=" + data[k];
        }
        if (extraUrl == null) {
            extraUrl = Global.url + '/';
        }
        let requestURL = extraUrl + path + str;
        return this.sendXHR(requestURL, (responseText, status) => {
            let ret = null;
            if (responseText) {
                ret = JSON.parse(responseText);
            }
            if (handler) {
                handler(status, ret);
            }
        });
    },

    // 向远程发送一个http请求
    // url - 输入，请求地址
    // responseHandler - 输入，回调上层的函数
    sendXHR: function (url, responseHandler) {
        log.info('Http.sendXHR: url=' + url);
        //test_bug
        if(url.indexOf("broke") != -1 ) {
            log.info("gry_final_request");
        }
        var xhr = cc.loader.getXMLHttpRequest();

        xhr.onreadystatechange = function () {
            //readyState属性，4 表示准备就绪状态， status属性 200 表示请求成功
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    log.info('Http.sendXHR: xhr.readyState is ready, url = {}', url);
                    responseHandler && responseHandler(xhr.responseText, true);
                } else {
                    log.error('Http.sendXHR: xhr.requre failed! code = {}, url = {} ', xhr.status, url);
                    responseHandler && responseHandler(xhr.responseText, false);
                }

            } else {
                log.info('Http.sendXHR: xhr.readyState is not ready!');
            }
        };

        //open最多有5个参数(method,url,async(是否异步),user,password)
        xhr.open("GET", url, true);
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        }

        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = 3000;// 5 seconds for timeout
        xhr.send();
    }

}

module.exports = Http;
