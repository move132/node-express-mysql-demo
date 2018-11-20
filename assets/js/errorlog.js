/*
 * @Author: movecss
 * @Date: 2018-11-14 18:11:06
 * @LastEditors: movecss
 * @LastEditTime: 2018-11-14 18:11:06
 * @Description: 错误日志监控
 */

function ErrorLog(options){ 
    this.isFlag = options.isFlag||false;// false; //是否开启错误显示
    this.projectName = options.projectName||"SDSS-FRONT";//"SDSS-FRONT"; //项目名称
    this.reportUrl = options.reportUrl||"http://192.168.150.207:5000/api";
    this.ratio =  options.ratio||0.8;   // Between 0 and 1  日志收集概率
    this.bindErrorEvent();
}
ErrorLog.prototype = {
    //constructor:ErrorLog,
    bindErrorEvent:function(){
        var _this = this;
        window.onerror = function(msg, url, row, col, error) {
            var o = {
                type: "source",
                url: JSON.stringify(url),
                row: row,
                col: col,
                msg: JSON.stringify(msg),
				stack:error.stack,
                time: _this.timeParse(new Date().getTime(), "yyyy-MM-dd HH:mm:ss S"),
                tagName: "",
                cookie:document.cookie,
                projectName: _this.projectName
            };
            //console.log(o)
            _this.push(o);
            return _this.isFlag;
        };
    
        window.addEventListener( "error",function(msg) {
            var target = msg.target;
            if (target.tagName) {
                var o = {
                    type: msg.type,
                    url: target.baseURI,
                    row: "",
                    col: "",
                    msg: target.outerHTML + " 404 (Not Found)",
					stack:msg.error.stack,
                    time: _this.timeParse(new Date().getTime(),"yyyy-MM-dd HH:mm:ss S"),
                    tagName: target.tagName.toLowerCase(),
                    cookie:document.cookie,
                    projectName: _this.projectName
                };
                //console.log(o, msg);
                _this.push(o);
            }
            return _this.isFlag;
        },true);
    
        window.addEventListener("unhandledrejection", function(e) {
            //待续  //Promise.reject('promise error');
            e.preventDefault();
            //console.log('promise错误',e); 
            return _this.isFlag;
        })
    },
    push:function(error) {
        var _this = this;
        if(Math.random() < _this.ratio) { //采集错误日志概率
            new Image().src = _this.reportUrl + "?error=" + encodeURIComponent(JSON.stringify(error));
        }
    },
    timeParse:function(time, format) {
        if (time == "") {
            return "";
        }
        var t = new Date(time);
        t = t.getFullYear() > 0 ? t : new Date(Date.parse(time.replace(/-/g, "/"))); //Safari 出现日期转换的问题
        var tf = function(i) {
            return (i < 10 ? "0" : "") + i;
        };
        return format.replace(/yyyy|MM|dd|HH|mm|ss|S/g, function(a) {
            switch (a) {
                case "yyyy":
                    return tf(t.getFullYear());
                    break;
                case "MM":
                    return tf(t.getMonth() + 1);
                    break;
                case "mm":
                    return tf(t.getMinutes());
                    break;
                case "dd":
                    return tf(t.getDate());
                    break;
                case "HH":
                    return tf(t.getHours());
                    break;
                case "ss":
                    return tf(t.getSeconds());
                    break;
                case "S":
                    return t.getMilliseconds(); //毫秒
            }
        });
    }
}

var error = new ErrorLog({
    isFlag:false,
    projectName:"test",
    ratio:1
});
