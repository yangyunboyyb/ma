
// import { _ } from "../config";
const INT = Math.floor;
// let cc
// try { cc = window['cc'] || {} } catch (e) { cc = {} }
//  window['cc']||{}
// (function() {
// Baseline setup
// --------------
// Establish the root object, `window` in the browser, or `exports` on the server.
var root = this;

var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
// Create quick reference variables for speed access to core prototypes.
var
    push = ArrayProto.push,
    slice = ArrayProto.slice,
    concat = ArrayProto.concat,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;
var Utils: any = function (obj) {
    if (obj instanceof Utils) return obj;
    if (!(this instanceof Utils)) return new Utils(obj);
    this._wrapped = obj;
};
// Extracts the result from a wrapped and chained object.
Utils.prototype.value = function () {
    return this._wrapped;
};
// Add a "chain" function. Start chaining a wrapped Underscore object.
function chain(obj) {
    var instance = Utils(obj);
    instance._chain = true;
    return instance;
};
Utils.chain = chain;

//把一个异步func(err,...,callback)函数包装成一个异步Promise
export function newPromise(func, args?) {
    return new Promise((resolve, reject) => {
        args.push((err, result) => {
            if (err) reject(err); else resolve(result);
        })
        func.apply(null, args);
    })
}
Utils.newPromise = newPromise;
//把一个异步func(err,...,callback)函数包装成一个异步async方法
export function newAsync(func, args) {
    return (async () => {
        return await new Promise((resolve, reject) => {
            args.push((err, result) => {
                if (err) reject(err); else resolve(result);
            })
            func.apply(null, args);
        })
    })();
}
Utils.newAsync = newAsync;
// 挂起等待异步
export async function sleep(timeMS: number): Promise<any> {
    let p = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, timeMS);
    });
    // setTimeout(()=>{
    //     Promise.resolve(p)
    // }, timeMS)
    return await p;
    // return await new Promise<any>((resolve, reject) => {setTimeout(resolve, timeMS)});
}
Utils.sleep = sleep;

// 挂起等待异步
export async function waiting(condition, target, timeoutMS = 0, step = 0) {
    if (isFinite(condition)) {
        return await sleep(condition);
    }
    if (!isObject(condition)) {
        return;
    }
    let isFunc = isFunction(condition);
    timeoutMS = timeoutMS || 6000000;
    step = step || 100;
    return await new Promise<any>(async (resolve, reject) => {
        for (let t = 0; t < timeoutMS; t += step) {
            if (isFunc) {
                if (condition.call(target)) {
                    return resolve();
                }
            } else if (condition['ready'] || condition['ok']) {
                return resolve();
            }
            await sleep(step);
        }
    });
}
Utils.waiting = waiting;

/**
 * 在指定时间内，做一件或多件事情
 * @param timeoutMS
 */
export async function doOntime(timeoutMS: number, ...args:Promise<any>[]): Promise<{r:any, err?:string}> {
    if (args.length===0) {
        return {r:[]}
    }
    let err, r
    await Promise.race([
        sleep(timeoutMS).then(v=>err=999),
        Promise.all(args).then(v=>r=v)
    ])
    return {r:r, err:err}
}
Utils.doOntime = doOntime;


export function callFunc(obj, funcName, ...args) {
    if (obj) {
        let func = obj[funcName];
        if (typeof func === 'function') {
            return func.apply(obj, args);
        }
    }
}
Utils.callFunc = callFunc;
export async function callAsyncFunc(obj, funcName, ...args) {
    if (obj) {
        let func = obj[funcName];
        if (typeof func === 'function') {
            return await func.apply(obj, args);
        }
    }
}
Utils.callAsyncFunc = callAsyncFunc;

// 不考虑字母
function s2i(s) {
    return s.split('').reduce(function (a, c) {
        var code = c.charCodeAt(0);
        if (48 <= code && code < 58) {
            a.push(code - 48);
        }
        return a;
    }, []).reduce(function (a, c) {
        return 10 * a + c;
    }, 0);
}
export function versionCmp(s1, s2) {
    if (!s1 || !s2) return 0
    var a = s1.split('.').map(function (s) {
        return s2i(s);
    });
    var b = s2.split('.').map(function (s) {
        return s2i(s);
    });
    var n = a.length < b.length ? a.length : b.length;
    for (var i = 0; i < n; i++) {
        if (a[i] < b[i]) {
            return -1;
        } else if (a[i] > b[i]) {
            return 1;
        }
    }
    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    var last1 = s1.charCodeAt(s1.length - 1) | 0x20,
        last2 = s2.charCodeAt(s2.length - 1) | 0x20;
    return last1 > last2 ? 1 : last1 < last2 ? -1 : 0;
}
Utils.versionCmp = versionCmp;

//检查中国名字是否正确
export function checkChineseName(name) {
    return /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/.test(name);
}
Utils.checkChineseName = checkChineseName;
//检查手机号码是不是合法
export function checkPhoneNumber(phoneString) {
    let testOk = /^1[3-9][0-9]{9}$/.test(phoneString);
    if (testOk) {
        let head = Number(phoneString.slice(0, 3));
        for (let h of [133, 149, 153, 173, 177, 180, 181, 189, 199, 130, 131, 132, 145, 155, 156, 166, 175, 176, 185, 186,
            134, 135, 136, 137, 138, 139, 147, 150, 151, 152, 157, 158, 159, 178, 182, 183, 184, 187, 188, 198,
            170, 171]) {
            if (h == head) {
                return true;
            }
        }
    }
    return false;
}
Utils.checkPhoneNumber = checkPhoneNumber;

// 验证身份证号码是否符合规则
// 函数参数必须是字符串，因为二代身份证号码是十八位，而在javascript中，十八位的数值会超出计算范围，造成不精确的结果，导致最后两位和计算的值不一致，从而该函数出现错误。
// 详情查看javascript的数值范围
export function checkIDCard(idcode) {
    /// 加权因子
    let weight_factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    // 校验码
    let check_code = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    let code = idcode + "";
    let last = idcode[17];// 最后一个
    let seventeen = code.substring(0, 17);
    // ISO 7064:1983.MOD 11-2
    // 判断最后一位校验码是否正确
    let arr: any = seventeen.split("");
    let len = arr.length;
    let num = 0;
    for (let i = 0; i < len; i++) {
        num = num + arr[i] * weight_factor[i];
    }
    // 获取余数
    let resisue = num % 11;
    let last_no = check_code[resisue];
    // 格式的正则
    // 正则思路
    /*
        第一位不可能是0
        第二位到第六位可以是0-9
        第七位到第十位是年份，所以七八位为19或者20
        十一位和十二位是月份，这两位是01-12之间的数值
        十三位和十四位是日期，是从01-31之间的数值
        十五，十六，十七都是数字0-9
        十八位可能是数字0-9，也可能是X
    */
    let idcard_patter = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/;
    // 判断格式是否正确
    let format = idcard_patter.test(idcode);
    // 返回验证结果，校验码和格式同时正确才算是合法的身份证号码
    return (last === last_no && format);
}
Utils.checkIDCard = checkIDCard;


/**
 * 获取两个经纬度之间的距离
 * @param lat1 第一点的纬度
 * @param lng1 第一点的经度
 * @param lat2 第二点的纬度
 * @param lng2 第二点的经度
 * @returns {Number}
 */
export function getDistanceLBS(lat1, lng1, lat2, lng2) {
    var f = ((lat1 + lat2) / 2) * Math.PI / 180.0;
    var g = ((lat1 - lat2) / 2) * Math.PI / 180.0;
    var l = ((lng1 - lng2) / 2) * Math.PI / 180.0;
    var sg = Math.sin(g);
    var sl = Math.sin(l);
    var sf = Math.sin(f);
    var s, c, w, r, d, h1, h2;
    var a = 6378137.0;// The Radius of eath in meter.
    var fl = 1 / 298.257;
    sg = sg * sg;
    sl = sl * sl;
    sf = sf * sf;
    s = sg * (1 - sl) + (1 - sf) * sl;
    c = (1 - sg) * (1 - sl) + sf * sl;
    if (s === 0 || c === 0) return 0;
    w = Math.atan(Math.sqrt(s / c));
    if (w <= 0) return 0;
    r = Math.sqrt(s * c) / w;
    d = 2 * w * a;
    h1 = (3 * r - 1) / 2 / c;
    h2 = (3 * r + 1) / 2 / s;
    s = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
    // s = s/1000;
    s = s.toFixed(2);// 指定小数点后的位数
    return s;
}
Utils.getDistanceLBS = getDistanceLBS;

//获得本周的开端日期   
export function getWeekDate(day = 1) {
    var now = new Date(); //当前日期   
    var nowDayOfWeek = now.getDay(); //今天本周的第几天   
    if (nowDayOfWeek == 0) nowDayOfWeek = 7;
    var nowDay = now.getDate(); //当前日 
    var nowMonth = now.getMonth(); //当前月   
    var nowYear = now.getFullYear(); //当前年 
    var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + day);
    return weekStartDate;
}
Utils.getWeekDate = getWeekDate;
//获得本月的开端日期   
export function getMonthDate(day = 1) {
    var now = new Date(); //当前日期   
    var nowMonth = now.getMonth(); //当前月   
    var nowYear = now.getFullYear(); //当前年 
    var monthStartDate = new Date(nowYear, nowMonth, day);
    return monthStartDate;
}
Utils.getMonthDate = getMonthDate;
//计算传入时间与当前日期是否为同一周
export function isSameWeek(old, now) {
    var oneDayTime = 1000 * 60 * 60 * 24;
    var old_count = Math.floor(old.getTime() / oneDayTime);
    var now_other = Math.floor(now.getTime() / oneDayTime);
    return Math.floor((old_count + 4) / 7) == Math.floor((now_other + 4) / 7);
}
Utils.isSameWeek = isSameWeek;
//时间对象转字符串"yyyy-MM-dd hh:mm:ss"
export function dateString(date?, mode:'YMD'|'S'|'MS' = 'S'): string {
    if (date == undefined) {
        date = new Date();
    } else {
        date = isDate(date) ? date : newDate(date);
    }
    let m = date.getMonth() + 1;
    let d = date.getDate();
    if (mode==='YMD') {
        return `${date.getFullYear()}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`
    } else {
        let hh = date.getHours();
        let mm = date.getMinutes();
        let ss = date.getSeconds();
        let r = `${date.getFullYear()}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d} ${hh < 10 ? '0' + hh : hh}:${mm < 10 ? '0' + mm : mm}:${ss < 10 ? '0' + ss : ss}`
        if (mode==='MS') return `${r}:${date.getMilliseconds()}`
        else return r
    }
}
Utils.dateString = dateString;
//时间字符串转对象"yyyy-MM-dd hh:mm:ss"
export function stringDate(strDate: string): Date {
    if (!strDate) return new Date();
    return new Date(strDate.replace("/\-/g", "/"));
}
Utils.stringDate = stringDate;
//转换ip字符串
export function ipString(ip: string): string {
    if (ip != null && ip.length > 4) {
        var ipS = ip;
        if (ipS.substring(0, 7) == '::ffff:') {
            return ipS.substring(7);
        }
    }
    return ip;
}
Utils.ipString = ipString;
export function timeString(timeMS:number, isShowMS=false) {
    let ms = timeMS%1000;
    let s = (0|(timeMS/1000))%60;
    let min = (0|(timeMS/60000))%60;
    let h = 0|(timeMS/3600000);
    return isShowMS ? `${h}:${min}:${s}:${ms}` : `${h}:${min}:${s}`;
}
Utils.timeString = timeString;
/**
 * 数字转换成带单位字符串，
 * 比如_.bigNumberUnitString(1000000) 返回 '100万'
 * bigNumberUnitString  (s:number, limitLength:number = 4):string {
 */
export function bigNumberUnitString(s, limitLength = 4) {
    if (s > 10000 && s < 100000000 || s < -10000 && s > -100000000) {
        return parseFloat((s / 10000).toString().slice(0, limitLength)).toString() + '万';
    } else if (s > 100000000 || s < -100000000) {
        return parseFloat((s / 100000000).toString().slice(0, limitLength)).toString() + '亿'
    } else
        return s.toString();
}
Utils.bigNumberUnitString = bigNumberUnitString;
/**
 * 数字转换成中文大写字符串，
 */
export function bigNumberChineseString(num) {
    if (!/^\d*(\.\d*)?$/.test(num)) { Error("Number is wrong!"); return "Number is wrong!"; }
    var AA = new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖");
    var BB = new Array("", "拾", "佰", "仟", "萬", "億", "点", "");
    var a = ("" + num).replace(/(^0*)/g, "").split("."), k = 0, re = "";
    for (var i = a[0].length - 1; i >= 0; i--) {
        switch (k) {
            case 0: re = BB[7] + re; break;
            case 4: if (!new RegExp("0{4}\\d{" + (a[0].length - i - 1) + "}$").test(a[0]))
                re = BB[4] + re; break;
            case 8: re = BB[5] + re; BB[7] = BB[5]; k = 0; break;
        }
        if (k % 4 == 2 && a[0].charAt(i + 2) != '0' && a[0].charAt(i + 1) == '0') re = AA[0] + re;
        if (a[0].charAt(i) != '0') re = AA[a[0].charAt(i)] + BB[k % 4] + re; k++;
    }
    if (a.length > 1) { //加上小数部分(如果有小数部分
        re += BB[6];
        for (var i = 0; i < a[1].length; i++) re += AA[a[1].charAt(i)];
    }
    return re;
}
Utils.bigNumberChineseString = bigNumberChineseString;
/**
 * 日期转换成中文字符串，
 */
export function DataChinese(yearOrDate: number | Date, month: number, date: number) {
    var chinese = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    var y, m, d;
    if (typeof yearOrDate != 'number') {
        yearOrDate = yearOrDate || new Date();
        y = yearOrDate.getFullYear().toString();
        m = (yearOrDate.getMonth() + 1).toString();
        d = yearOrDate.getDate().toString();
    } else {
        y = yearOrDate.toString();
        m = limit(month, 1, 12).toString();
        d = limit(date, 1, 31).toString();
    }
    var result = "";
    for (var i = 0; i < y.length; i++) {
        result += chinese[y.charAt(i)];
    }
    result += "年";
    if (m.length == 2) {
        if (m.charAt(0) == "1") {
            result += ("十" + chinese[m.charAt(1)] + "月");
        }
    }
    else {
        result += (chinese[m.charAt(0)] + "月");
    }
    if (d.length == 2) {
        result += (chinese[d.charAt(0)] + "十" + chinese[d.charAt(1)] + "日");
    }
    else {
        result += (chinese[d.charAt(0)] + "日");
    }
    return result;
};
Utils.DataChinese = DataChinese;
/**
 * 数字转换成逗号分隔字符串，
 * 比如_.bigNumberString(1000000) 返回 '1,000,000'
 */
export function bigNumberString(s: number | string, isDecimalis?: boolean): string {
    if (s < 0)
        return '-' + bigNumberString(-s, isDecimalis);
    if (/[^0-9\.]/.test(s.toString()))
        return "0";
    if (s == null || s == "")
        return "0";
    s = s.toString().replace(/^(\d*)$/, "$1.");
    s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
    s = s.replace(".", ",");
    var re = /(\d)(\d{3},)/;
    while (re.test(s))
        s = s.replace(re, "$1,$2");
    s = s.replace(/,(\d\d)$/, ".$1");
    if (!isDecimalis) {// 不带小数位(默认不带小数位)
        var a = s.split(".");
        if (a[1] == "00") {
            s = a[0];
        }
    }
    return s;
};
Utils.bigNumberString = bigNumberString;


export function parseEscape(str:string, decorate = '$') {
    let code2Symbol = ')!@#$%^&*('
    let rstr = ''
    let len = str.length
    for(let i=0; i<len; i++) {
        let c = str.charAt(i)
        if (i>0 && c===decorate) {
            let cc = str.charAt(i+1)
            if (i+3<len && cc==='x') {
                let code = parseInt(str.slice(i+2, i+4), 16)
                rstr+= String.fromCharCode(code)
                i+=3
            }else if (i+1<len && cc>='0' && cc<='9'){
                let code = Number(cc)
                if (!isNaN(code)) {
                    rstr+=code2Symbol[code]
                    i+=1
                }else{
                    rstr+=c
                }
            }else{
                rstr+=c
            }
        }else{
            rstr+=c
        }
    }
    return rstr
}
Utils.parseEscape = parseEscape;

export function stringEscape(str:string, decorate = '$') {
    let code2Symbol = ')!@#$%^&*('
    let rstr = ''
    let len = str.length
    for(let i=0; i<len; i++) {
        let c = str.charAt(i)
        if (i===0 || c>='0' && c<='9' || c>='a' && c<='z' || c>='A' && c<='Z' || c==='_' || c>'~') {
            rstr+=c
        }else{
            let idx = code2Symbol.indexOf(c)
            if (idx>=0) {
                rstr+=`${decorate}${idx}`
            }else{
                rstr+=`${decorate}x${str.charCodeAt(i).toString(16)}`
            }
        }
    }
    return rstr
}
Utils.stringEscape = stringEscape;



/**
 * 格式化字符串
 * 类似c++的 sprintf %d 参数用法
 * 举例 nString(‘aaa%02d’, 1) 返回‘aaa%001’
 */
export function nPrintf(fmt: string, ...args: any[]): string {
    var as = [].slice.call(arguments), i = 0;
    as.shift()
    return fmt.replace(/%(\w)?(\d)?([dfsx])/ig, function (_, a, b, c) {
        var s = b ? new Array(b - 0 + 1).join(a || '') : '';
        if (c == 'd') s += parseInt(as[i++]);
        return (b && b < s.length) ? s.slice(b * -1) : s;
    })
}
Utils.nPrintf = nPrintf;
/**
 * 格式化字符串，回调返回false终止回调
 * 举例 nString(‘aaa%02d,5’， funciton(str)(这里的str为‘aaa%000'、‘aaa%000'...‘aaa%005'});
 */
export function nString(str: string, func?: (...string) => boolean, limit?: number): number | string | string[] {
    var ret;
    if (/%(\w)?(\d)?([dfsx])/ig.test(str)) {
        ret = [];
        let cnt = 0;
        (function (s, begin, end) {
            if (end === undefined) {
                end = begin ? parseInt(begin) : undefined;
                if (end < 0) {
                    begin = -end;
                    end = 0
                } else
                    begin = 0;
            } else {
                begin = begin ? parseInt(begin) : 0;
                end = parseInt(end);
            }
            limit = limit || 9999999;
            for (var i = begin; ;) {
                let strItem = nPrintf(s, i);
                cnt++;
                if (func && func(strItem) === false)
                    break;
                else
                    ret.push(strItem);
                if (limit && --limit <= 0)
                    break;
                if (i === end)
                    break;
                if (end === undefined || end > i)
                    i++;
                else
                    i--;
            }
        }).apply(null, str.split(',') as any);
        return func ? cnt : ret;
    } else {
        if (func) {
            func(str);
            return 1;
        } else
            return str;
    }
}
Utils.nString = nString;
/**
 * C++的sprintf
 */
export function sprintf(format: string, ...args: any[]): string {
    function str_repeat(i, m) {
        for (var o: any[] = []; m > 0; o[--m] = i);
        return o.join('');
    }
    var i = 0, a, f = arguments[i++], o: any[] = [], m, p, c, x, s = '';
    while (f) {
        if (m = /^[^\x25]+/.exec(f)) {
            o.push(m[0]);
        }
        else if (m = /^\x25{2}/.exec(f)) {
            o.push('%');
        }
        else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f)) {
            if (((a = arguments[m[1] || i++]) == null) || (a == undefined)) {
                throw ('Too few arguments.');
            }
            if (/[^s]/.test(m[7]) && (typeof (a) != 'number')) {
                throw ('Expecting number but found ' + typeof (a));
            }
            switch (m[7]) {
                case 'b': a = a.toString(2); break;
                case 'c': a = String.fromCharCode(a); break;
                case 'd': a = parseInt(a); break;
                case 'e': a = m[6] ? a.toExponential(m[6]) : a.toExponential(); break;
                case 'f': a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a); break;
                case 'o': a = a.toString(8); break;
                case 's': a = ((a = String(a)) && m[6] ? a.substring(0, m[6]) : a); break;
                case 'u': a = Math.abs(a); break;
                case 'x': a = a.toString(16); break;
                case 'X': a = a.toString(16).toUpperCase(); break;
            }
            a = (/[def]/.test(m[7]) && m[2] && a >= 0 ? '+' + a : a);
            c = m[3] ? m[3] == '0' ? '0' : m[3].charAt(1) : ' ';
            x = m[5] - String(a).length - s.length;
            p = m[5] ? str_repeat(c, x) : '';
            o.push(s + (m[4] ? a + p : p + a));
        }
        else {
            throw ('Huh ?!');
        }
        f = f.substring(m[0].length);
    }
    return o.join('');
}
Utils.sprintf = sprintf;

// // import _sscanf = require('sscanf')
// export let sscanf:(input:string, ...formats:string[])=>string|number|(string|number)[]|{[k:string]:string|number} = require('sscanf')
// // export function sscanf(input:string, ...formats:string[]):string|number|(string|number)[]|{[k:string]:string|number}{
// //     return _sscanf(input, ...formats)
// // };
// Utils.sscanf = sscanf;

var MT: Array<number> = [];
var index = 0;
function initialize_generator(seed) {
    MT[0] = seed;
    index = 0;
    for (var i = 1; i < 624; i++) {
        MT[i] = 0xffffffff & (0x6c078965 * (MT[i - 1] ^ (MT[i - 1] >> 30)) + i);
    }
}
function generate_numbers() {
    if (MT.length === 0) {
        initialize_generator(new Date().getTime());
    }
    for (var i = 0; i < 624; i++) {
        var y = (MT[i] & 0x80000000) + (MT[(i + 1) % 624] & 0x7fffffff);
        MT[i] = MT[(i + 397) % 624] ^ (y >> 1);
        if (y % 2 != 0) {
            MT[i] ^= 0x9908b0df;
        }
    }
}
function extract_number() {
    if (index == 0) {
        generate_numbers();
    }
    var y = MT[index];
    //y ^= (y >> 11);
    //y ^= ((y << 7) & 0x9d2c5680);
    //y ^= ((y << 15) & 0xefc60000);
    //y ^= (y >> 18);
    index = (index + 1) % 624;
    //return y;
    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= (y >>> 18);

    return y >>> 0;
}
function mt_random() {
    return extract_number() / 4294967296.0;
}

//序列化
export function serialize(value, replacer?, format?) {
    if (!format || typeof format == 'number') {
        return JSON.stringify(value, replacer, format);
    } else {
        let typeofFormat = typeof format;
        if (typeofFormat == 'function') {
            return format(value);
        }
    }
};
Utils.serialize = serialize;
//反序列化
export function unserialize(text, reviver?, format?) {
    if (!text || text == '' || typeof text != 'string' || text.slice(0, 5) == '<xml>') {
        return text;
    }
    if (!format) {
        try {
            return JSON.parse(text, reviver);
        } catch (e) {
            return text;
        }
    } else {
        let typeofFormat = typeof format;
        if (typeofFormat == 'function') {
            return format(text, reviver);
        }
    }
};
Utils.unserialize = unserialize;
//序列化对象属性
export function serializeProperty(obj, replacer?, format?) {
    let ret = {};
    for (let k in obj) {
        switch (typeof obj[k]) {
            case 'object':
                ret[k] = serialize(obj[k]);
                break;
            default:
                ret[k] = obj[k];
                break;
        }
    }
    return ret;
};
Utils.serializeProperty = serializeProperty;
//反序列化对象属性
export function unserializeProperty(obj, replacer, format) {
    let ret = {};
    for (let k in obj) {
        switch (typeof obj[k]) {
            case 'string':
                ret[k] = unserialize(obj[k]);
                break;
            default:
                ret[k] = obj[k];
                break;
        }
    }
    return ret;
};
Utils.unserializeProperty = unserializeProperty;
// Internal function that returns an efficient (for current engines) version
// of the passed-in callback, to be repeatedly applied in other Underscore
// functions.
var createCallback = function (func, context, argCount?) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
        case 1: return function (value) {
            return func.call(context, value);
        };
        case 2: return function (value, other) {
            return func.call(context, value, other);
        };
        case 3: return function (value, index, collection) {
            return func.call(context, value, index, collection);
        };
        case 4: return function (accumulator, value, index, collection) {
            return func.call(context, accumulator, value, index, collection);
        };
    }
    return function () {
        return func.apply(context, arguments);
    };
};
// A mostly-internal function to generate callbacks that can be applied
// to each element in a collection, returning the desired result — either
// identity, an arbitrary callback, a property matcher, or a property accessor.
export function iteratee(value, context, argCount?) {
    if (value == null) return Utils.identity;
    if (isFunction(value)) return createCallback(value, context, argCount);
    if (isObject(value)) return matches(value);
    return property(value);
};
Utils.iteratee = iteratee;
var iterateeFunc = iteratee;
// The cornerstone, an `each` implementation, aka `forEach`.
// Handles raw objects in addition to array-likes. Treats all
// sparse array-likes as if they were dense.
export function each(obj, iteratee, context?) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
        for (i = 0; i < length; i++) {
            iteratee(obj[i], i, obj);
        }
    } else {
        var _keys = keys(obj);
        for (i = 0, length = _keys.length; i < length; i++) {
            iteratee(obj[_keys[i]], _keys[i], obj);
        }
    }
    return obj;
};
Utils.each = each;
// Return the results of applying the iteratee to each element.
export function map(obj, iteratee, context?) {
    if (obj == null) return [];
    iteratee = iterateeFunc(iteratee, context);
    var _keys = obj.length !== +obj.length && keys(obj),
        length = (_keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
        currentKey = _keys ? _keys[index] : index;
        results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
};
Utils.map = map;

export function identity(value) {
    return value;
};
Utils.identity = identity;
export function constant(value) {
    return function () {
        return value;
    };
};
Utils.constant = constant;
export function property(key) {
    return function (obj) {
        return obj[key];
    };
};
Utils.property = property;
// Returns a predicate for checking whether an object has a given set of `key:value` pairs.
export function matches(attrs) {
    var pairs = pairs(attrs), length = pairs.length;
    return function (obj) {
        if (obj == null) return !length;
        obj = new Object(obj);
        for (var i = 0; i < length; i++) {
            var pair = pairs[i], key = pair[0];
            if (pair[1] !== obj[key] || !(key in obj)) return false;
        }
        return true;
    };
};
Utils.matches = matches;
export function pairs(obj) {
    var _keys = keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
        pairs[i] = [_keys[i], obj[_keys[i]]];
    }
    return pairs;
};
Utils.pairs = pairs;
// Return a sorted list of the function names available on the object.
// Aliased as `methods`
export function functions(obj) {
    var names: string[] = [];
    for (var key in obj) {
        if (isFunction(obj[key])) names.push(key);
    }
    return names.sort();
};
Utils.functions = functions;

//判断是不是原生单纯的对象（），
export function isPureType(obj) {
    let classType = Object.prototype.toString.call(obj);
    return classType !== '[object Object]' && classType !== '[object Function]' || obj.__proto__ && obj.__proto__.__proto__ == null;
};
Utils.isPureType = isPureType;
//判断是不是类对象，
export function isClass(obj, Class?) {
    var type = typeof obj;
    Class = Class || obj;
    return type === 'function' && typeof obj.__proto__ == 'function' && obj.prototype && obj.prototype.constructor && (obj.prototype.constructor == Class || obj.prototype.constructor.name == Class || isClass(obj.__proto__, Class));
};
Utils.isClass = isClass;

export function getClassName(obj): string {
    if (obj && obj.constructor && obj.constructor.toString()) {
        if (obj.constructor.name) {
            return obj.constructor.name;
        }
        let str = obj.constructor.toString();
        let arr;
        if (str.charAt(0) == '[') {
            arr = str.match(/\w+\s∗(\w+)\w+\s∗(\w+)/);
        } else {
            arr = str.match(/function\s*(\w+)/);
        }
        if (arr && arr.length == 2) {
            return arr[1];
        }
    }
    return '';
}
Utils.getClassName = getClassName;
//判断是不是类实例，
export function isClassInstance(obj, Class?) {
    var type = typeof obj;
    let proto = Object.getPrototypeOf(obj)
    return type === 'object' && proto && isClass(proto.constructor, Class);
};
Utils.isClassInstance = isClassInstance;

export function staticClass2Object(staticClass, exceptClass?) {
    let ret: any = {};
    // let o = staticClass;
    // while (o.__proto__ && (typeof o.__proto__!='function' || o.__proto__.name != '') && o.__proto__.__proto__ != null) {
    //     for (let k of Object.getOwnPropertyNames(o.__proto__)) {
    //         if ((!onlyPublic || k[0] != '_') && k != 'constructor' && isFunction(o[k])) {
    //             arrayUniquePush(ret, k);
    //         }
    //     }
    //     o = o.__proto__;
    // }
    if (staticClass.prototype && staticClass !== exceptClass && staticClass !== Object) {
        ret = staticClass2Object(staticClass.prototype, exceptClass)
    }
    // console.log(Object.getOwnPropertyNames(staticClass))
    for (let k of Object.getOwnPropertyNames(staticClass)) {
        if (k !== 'constructor' && k !== 'prototype') {
            ret[k] = staticClass[k]
        }
    }
    for (let k in staticClass) {
        ret[k] = staticClass[k]
    }
    return ret;
};
Utils.staticClass2Object = staticClass2Object;
export function class2Object(classObj, exceptClass?, _isRecursion = false) {
    let ret: any = {};
    let o = classObj;
    let proto = Object.getPrototypeOf(o)
    if (o && o !== exceptClass && o !== Object && proto && Object.getPrototypeOf(proto) != null) {
        if(typeof proto != 'function' || proto.name != '') ret = class2Object(proto, exceptClass, true)
        for (let k of Object.getOwnPropertyNames(o.prototype)) {
            if (k !== 'constructor' && k !== 'prototype') {
                ret[k] = o.prototype[k]
            }
        }
        // o = o.__proto__;
        if (!_isRecursion) {
            let obj = new classObj
            for (let k in obj) {
                ret[k] = obj[k]
            }
        }
    }
    // if (staticClass.prototype && staticClass!==exceptClass && staticClass!==Object) {
    //     ret = staticClass2Object(staticClass.prototype, exceptClass)
    // }
    // // console.log(Object.getOwnPropertyNames(staticClass))
    // for(let k of Object.getOwnPropertyNames(staticClass)){
    //     if (k!=='constructor' && k!== 'prototype' ) {
    //         ret[k] = staticClass[k]
    //     }
    // }
    return ret;
};
Utils.class2Object = class2Object;

//获取对象的方法名列表
export function getMethodNames(obj, regExp?:RegExp, onlyPublic = true) {
    let ret = [];
    let o = obj;
    let proto = Object.getPrototypeOf(o)
    while (proto && (typeof proto != 'function' || proto.name != '') && Object.getPrototypeOf(proto) != null) {
        for (let k of Object.getOwnPropertyNames(proto)) {
            if ((!onlyPublic || k[0] != '_') && k != 'constructor' && (!regExp || regExp.test(k)) && isFunction(obj[k])) {
                arrayUniquePush(ret, k);
            }
        }
        o = proto;
        proto = Object.getPrototypeOf(o)
    }
    for (let k of Object.getOwnPropertyNames(obj)) {
        if ((!onlyPublic || k[0] != '_') && (!regExp || regExp.test(k)) && isFunction(obj[k])) {
            arrayUniquePush(ret, k);
        }
    }
    for (let k in obj) {
        if ((!onlyPublic || k[0] != '_') && (!regExp || regExp.test(k)) && isFunction(obj[k])) {
            arrayUniquePush(ret, k);
        }
    }
    return ret;
};
Utils.getMethodNames = getMethodNames;
//判断obj是不是对象，数组、函数、类、object都是对象，
export function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};
Utils.isObject = isObject;

export function isDate(obj) {
    return obj && toString.call(obj) == '[object Date]'
}
Utils.isDate = isDate
// 是不是数组
export function isArray(obj) {
    if (Array.isArray) return Array.isArray(obj);
    return Object.prototype.toString.call(obj) === '[object Array]';
};
Utils.isArray = isArray;
//是不是参数
export function isArguments(obj) {
    return has(obj, 'callee');
};
Utils.isArguments = isArguments;
//是不是函数
export function isFunction(obj) {
    return typeof obj == 'function' || false;
};
Utils.isFunction = isFunction;
export function isPromiseLike(obj){
    return obj !== null && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}
Utils.isPromiseLike = isPromiseLike;
//是不是有限数字
//   export function isFinite(obj) {
//     return isFinite(obj) && !isNaN(parseFloat(obj));
//   };
Utils.isFinite = isFinite;
//是不是非法的数字，自己不等于自己的数
export function isNaN(obj) {
    return typeof (obj) == 'number' && obj !== +obj;
}
Utils.isNaN = isNaN;
//是不是布尔值
export function isBoolean(obj) {
    return obj === true || obj === false || Object.prototype.toString.call(obj) === '[object Boolean]';
};
Utils.isBoolean = isBoolean;
//是不是null
export function isNull(obj) {
    return obj === null;
}
Utils.isNull = isNull;
//是不是undefined
export function isUndefined(obj) {
    return obj === void 0;
}
Utils.isUndefined = isUndefined;
//是不是null
export function isVoid(obj) {
    return obj === null || obj === undefined;
}
Utils.isVoid = isVoid;
//是不是有效
export function isValid(obj) {
    return obj !== null && obj !== undefined && (isFunction(obj.isValid) ? obj.isValid() : obj.isValid)
}
Utils.isValid = isValid;

//判断obj是不是有key属性，
//如果obj是数组，则判断是不是有为key的值
//key可以是数组
export function has(obj, key) {
    if (obj === key)
        return true;
    if (!obj)
        return false;
    if (Array.isArray(obj)) {
        for (let v of obj) {
            if (has(key, v))
                return true;
        }
        return false;
    } else if (Array.isArray(key)) {
        for (let v of key) {
            if (has(obj, v))
                return true;
        }
        return false;
    } else if (typeof obj == 'object') {
        return Object.prototype.hasOwnProperty.call(obj, key);
    } else
        return false;
};
// Internal recursive comparison function for `isEqual`.
var eq = function (a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof Utils) a = a._wrapped;
    if (b instanceof Utils) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
        // Strings, numbers, regular expressions, dates, and booleans are compared by value.
        case '[object RegExp]':
        // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
        case '[object String]':
            // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
            // equivalent to `new String("5")`.
            return '' + a === '' + b;
        case '[object Number]':
            // `NaN`s are equivalent, but non-reflexive.
            // Object(NaN) is equivalent to NaN
            if (+a !== +a) return +b !== +b;
            // An `egal` comparison is performed for other numeric values.
            return +a === 0 ? 1 / +a === 1 / b : +a === +b;
        case '[object Date]':
        case '[object Boolean]':
            // Coerce dates and booleans to numeric primitive values. Dates are compared by their
            // millisecond representations. Note that invalid dates with millisecond representations
            // of `NaN` are not equivalent.
            return +a === +b;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
        // Linear search. Performance is inversely proportional to the number of
        // unique nested structures.
        if (aStack[length] === a) return bStack[length] === b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (
        aCtor !== bCtor &&
        // Handle Object.create(x) cases
        'constructor' in a && 'constructor' in b &&
        !(isFunction(aCtor) && aCtor instanceof aCtor &&
            isFunction(bCtor) && bCtor instanceof bCtor)
    ) {
        return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
        // Compare array lengths to determine if a deep comparison is necessary.
        size = a.length;
        result = size === b.length;
        if (result) {
            // Deep compare the contents, ignoring non-numeric properties.
            while (size--) {
                if (!(result = eq(a[size], b[size], aStack, bStack))) break;
            }
        }
    } else {
        // Deep compare objects.
        var _keys = keys(a);
        let key;
        size = _keys.length;
        // Ensure that both objects contain the same number of properties before comparing deep equality.
        result = keys(b).length === size;
        if (result) {
            while (size--) {
                // Deep compare each member
                key = _keys[size];
                if (!(result = has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
            }
        }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
};
//判断两个对象是不是完全相等
export function isEqual(a, b) {
    return eq(a, b, [], []);
};
Utils.isEqual = isEqual;

//反转
//如果obj是对象，把对象的key和value反转
//如果obj是数组，把对应数组的元素反转
export function invert(obj: any): any {
    if (isArray(obj)) {
        var ret = new Array(obj.length);
        let l = obj.length - 1;
        for (var i = 0; i < obj.length; i++) {
            ret[l - i] = obj[i];
        }
        return ret;
    } else {
        var result = {};
        var _keys = keys(obj);
        for (var i = 0, length = _keys.length; i < length; i++) {
            result[obj[_keys[i]]] = _keys[i];
        }
        return result;
    }
};
Utils.invert = invert;

//生成类似python的range()的数字数组
// Generate an integer Array containing an arithmetic progression. A port of
// the native Python `range()` function. See
// [the Python documentation](http://docs.python.org/library/functions.html#range).
export function range(start, stop, step?) {
    if (arguments.length <= 1) {
        stop = start || 0;
        start = 0;
    }
    if (start == stop)
        return [];
    step = step || ((start > stop) ? -1 : 1);

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++ , start += step) {
        range[idx] = start;
    }

    return range;
};
Utils.range = range;

//查找对象中的value
//    把查找结果返回数组，如果找不到，返回null
//    如果count为0，查找全部符合的
//    如果count为数字，则查找对应数量的结果
//    如果count为负数，反向查找
//    value_or_SelectFunc是函数时可以指定查找逻辑函数
export function search(obj, value, values_or_SelectFunc?, count?) {
    count = count || 0;
    let cnt = count >= 0 ? count : -count;
    let ret: any[] = [];
    if (isArray(obj)) {
        let idx, step;
        if (count >= 0) {
            idx = 0; step = 1;
        } else {
            idx = obj.length - 1; step = 1;
        }
        for (var i = 0; i < obj.length; i++) {
            if (obj[idx] === value || typeof values_or_SelectFunc == 'function' && values_or_SelectFunc(obj[idx]) || has(values_or_SelectFunc, obj[idx])) {
                ret.push(idx);
                if (count != 0) {
                    cnt--;
                    if (cnt <= 0)
                        break;
                }
            }
            idx += step;
        }
    } else {
        for (let k in obj) {
            if (obj[k] === value || typeof values_or_SelectFunc == 'function' && values_or_SelectFunc(obj[k]) || has(values_or_SelectFunc, obj[k])) {
                ret.push(k);
                if (count != 0) {
                    cnt--;
                    if (cnt <= 0)
                        break;
                }
            }
        }
    }
    if (ret.length == 0) {
        return null;
        // }else if (ret.length==1){
        //     return ret[0];
    } else
        return ret;
};
Utils.search = search;

//压缩数组，相同的值只保留一个
export function zip(...arrays) {
    var ret: any[] = [];
    for (var a of arrays) {
        // if (!isObject(a))
        //     a = [a];
        for (let b of values(a)) {
            if (!search(ret, b)) {
                ret.push(b);
            }
        }
    }
    return ret;
};
Utils.zip = zip;
/**
 * 深复制 an object
 * eliminate为要剔除的属性或者数组值,可以是数组或对象，或者函数
 * copy(origin:object):object {
 * _circleObjects 防止传入循环引用
 */
export function copy(origin, eliminate?, _circleObjects?) {
    if (!origin || typeof (origin) !== 'object') {
        return origin;
    }
    _circleObjects = _circleObjects || [];
    _circleObjects.push(origin);
    let obj = Array.isArray(origin) ? [] : {};
    for (let f in origin) {
        if (origin.hasOwnProperty(f) && (!has(eliminate, f) || isFunction(eliminate) && !eliminate(f, origin[f]))) {
            switch (typeof (origin[f])) {
                case 'object':
                    if (_circleObjects.indexOf(origin[f]) == -1) {
                        obj[f] = copy(origin[f], eliminate, _circleObjects);
                    }
                    break;
                case 'string':
                    obj[f] = origin[f].slice(0);
                    break;
                default:
                    obj[f] = origin[f];
                    break;
            }
        }
    }
    return obj;
}
Utils.copy = copy;
/**
 * 深复制 公有属性，（凡是'_'开头的属性都认为是私有，并剔除掉）
 * eliminate为要剔除的属性或者数组值,可以是数组或对象，或者函数
 * copy(origin:object):object {
 */
export function copyPublic(origin, eliminate, _circleObjects?) {
    if (!origin || typeof (origin) !== 'object') {
        return origin;
    }
    _circleObjects = _circleObjects || [];
    _circleObjects.push(origin);
    let obj = Array.isArray(origin) ? [] : {};
    for (let f in origin) {
        if (f[0] != '_' && origin.hasOwnProperty(f) && (!has(eliminate, f) || isFunction(eliminate) && !eliminate(f, origin[f]))) {
            switch (typeof (origin[f])) {
                case 'object':
                    if (_circleObjects.indexOf(origin[f]) == -1) {
                        obj[f] = copyPublic(origin[f], eliminate, _circleObjects);
                    }
                    break;
                case 'string':
                    obj[f] = origin[f].slice(0);
                    break;
                default:
                    obj[f] = origin[f];
                    break;
            }
        }
    }
    return obj;
}
Utils.copyPublic = copyPublic;
/**
 * 深复制 an object 只复制原生的object
 * eliminate为要剔除的属性或者数组值,可以是数组或对象，或者函数
 * copy(origin:object):object {
 */
export function copyPure(origin, eliminate, _circleObjects) {
    if (!origin || typeof (origin) !== 'object') {
        return origin;
    }
    _circleObjects = _circleObjects || [];
    _circleObjects.push(origin);
    let obj = Array.isArray(origin) ? [] : {};
    for (let f in origin) {
        if (origin.hasOwnProperty(f) && isPureType(origin[f]) && (!has(eliminate, f) || isFunction(eliminate) && !eliminate(f, origin[f]))) {
            switch (typeof (origin[f])) {
                case 'object':
                    if (_circleObjects.indexOf(origin[f]) == -1) {
                        obj[f] = copyPure(origin[f], eliminate, _circleObjects);
                    }
                    break;
                case 'string':
                    obj[f] = origin[f].slice(0);
                    break;
                default:
                    obj[f] = origin[f];
                    break;
            }
        }
    }
    return obj;
}
Utils.copyPure = copyPure;
/**
 * 获取对象的属性数量，
 */
export function size(obj: object): number {
    if (!obj) {
        return 0;
    }
    var s = 0;
    for (var f in obj) {
        if (obj.hasOwnProperty(f)) {
            s++;
        }
    }
    return s;
};
Utils.size = size;

/**
 * 获取对象的属性名的数组，
 * keys(obj:object):any[] {
 */
export function keys(obj: object): string[] {
    if (!isObject(obj)) return [];
    if (Object.keys) return Object.keys(obj);
    var _keys: string[] = [];
    for (var key in obj) if (Object.prototype.hasOwnProperty.call(obj, key)) _keys.push(key);
    return _keys;
};
Utils.keys = keys;
/**
 * 获取对象的属性值的数组，
 * values(obj:object):any[] {
 */
export function values(obj: object): any[] {
    if (!obj) {
        return [];
    }
    var ret: any[] = [];
    for (var f in obj) {
        if (obj.hasOwnProperty(f)) {
            ret.push(obj[f]);
        }
    }
    return ret;
};
Utils.values = values;
/**
 * 返回范围约束的数值， 范围min, max可以是一个数组形式
 * 如果n是对象，则返回min指定或者存在的属性的对象
 * 如果min是对象，n中的属性会自动适应转换为min中对应属性的类型
 * 如果n和min都是数组，则返回n和min的交集
 */
export function limit(n, min, max?) {
    let typeN = typeof n;
    if (typeN == 'object') {
        var ret = {};
        if (Array.isArray(min)) {
            if (Array.isArray(n)) {
                let r: any[] = []
                for (let v of n) {
                    if (min.indexOf(v) != -1) {
                        r.push(v);
                    }
                }
                return r;
            } else {
                for (let v of min) {
                    if (n.hasOwnProperty(v)) {
                        ret[v] = n[v]
                    }
                }
            }
            return ret;
        } else if (typeof min == 'object') {
            for (let k in n) {
                if (n.hasOwnProperty(k) && min.hasOwnProperty(k)) {
                    let v = n[k], typeN = typeof (v), typeM = typeof (min[k]);
                    if (typeN == typeM || typeM == 'string' && typeN == 'number') {
                        ret[k] = v;
                    } else if (typeN == 'number' && isDate(min[k])) {
                        ret[k] = newDate(v);
                    } else if (typeN == 'string') {
                        if (typeM == 'number') {
                            ret[k] = Number(v);
                        } else if (typeM == 'object') {
                            if (v[0] == '{' && v[v.length - 1] == '}' || v[0] == '[' && v[v.length - 1] == ']') {
                                ret[k] = unserialize(v);
                            } else if (isDate(min[k])) {
                                ret[k] = newDate(v);
                            }
                        } else if (typeM == 'boolean') {
                            ret[k] = (v != '' && v != '0' && v != 'false');
                        }
                    } else if (typeM == 'string' && typeN == 'object') {
                        ret[k] = serialize(v);
                    }
                }
            }
            return ret;
        } else
            return n;
    } else {
        let typeM = typeof min;
        if (typeN !== 'number') {
            if (typeN === typeM) {
                return n;
            } else if (isDate(min)) {
                return newDate(n);
            }
            n = 0;
        }
        if (typeM === 'number') {
            if (max === undefined)
                return limit(n, 0, min);
            if (n < min)
                return min;
            if (n > max)
                return max;
            return n;
        } else if (isArray(min) && min.length >= 2) {
            return limit(n, min[0], min[1]);
        } else if (isDate(min)) {
            return newDate(n);
        } else
            return n;
    }
};
Utils.limit = limit;
/*
* 删除数组指定位置元素的方法。
* 		idx 位置  如果idx不指定则随机删除一个元素，如果idx为负数则返回反向删除的第idx个元素
* 		count 删除几个
*/
export function arrayDelByIndex(array, idx, count = 1) {
    if (idx === undefined) {
        idx = 0 | Math.random() * (array.length);
    } else if (idx < 0)
        idx = limit(array.length + idx, 0, array.length);
    array.splice(array, idx, count || 1);
    return true;
};
Utils.arrayDel = arrayDel;
/*
* 删除数组指定元素的方法。
* 		item 相同的元素
* 		count 删除几个
*/
export function arrayDel(array, item, count = 1) {
    let deleteCount = 0;
    for (let i = 0; i < array.length; i++) {
        if (array[i] === item) {
            array.splice(i, 1);
            i--;
            deleteCount++;
            if (count > 0 && deleteCount >= count) return deleteCount;
        }
    }
    return deleteCount;
};
Utils.arrayDel = arrayDel;
/**
 * 返回数组中指定位置的元素
 * 		如果idx不指定则随机选择一个元素，
 * 		如果idx为负数则返回反向选择的第idx个元素
 */
export function arrayGet(array, idx) {
    if (array) {
        if (idx === undefined) {
            return array[0 | Math.random() * (array.length)];
        } else if (idx < 0)
            return array[limit(array.length + idx, 0, array.length - 1)];
        else
            return array[limit(idx, 0, array.length - 1)];
    }
};
Utils.arrayGet = arrayGet;
/**
 * 给数组添加一个不重复的元素
 * 		如果idx不指定则随机选择一个元素，
 * 		如果idx为负数则返回反向选择的第idx个元素
 */
export function arrayUniquePush(array, value) {
    if (array) {
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] === value)
                return false;
        }
        array.push(value);
    }
    return true
};
Utils.arrayUniquePush = arrayUniquePush;
/**
 * 创建二维数组
 * 		length 长度
 */
export function arrayCreate(length, value?) {
    let ret = new Array(length);
    if (value !== undefined) {
        for (let j = 0; j < length; j++) {
            ret[j] = value;
        }
    }
    return ret;
};
Utils.arrayCreate = arrayCreate;
/**
 * 创建二维数组
 * 		row 行
 * 		col 列
 */
export function arrayCreate2(row, col, value?) {
    let ret = new Array(row);
    for (let i = 0; i < row; i++) {
        let arr = ret[i] = new Array(col);
        if (value !== undefined) {
            for (let j = 0; j < col; j++) {
                arr[j] = value;
            }
        }
    }
    return ret;
};
Utils.arrayCreate2 = arrayCreate2;
/**
 * 随机打乱容器中的元素，返回新的数组
 * 		
 */
export function shuffle(obj: any[], n?: number): any[] {
    var set = obj && obj.length === +obj.length ? obj : values(obj);
    var length = set.length;
    n = n || length;
    if (n > length) n = length;
    var shuffled = new Array(n);
    for (var index = 0, r; index < n; index++) {
        r = rand(0, index);
        if (r !== index) shuffled[index] = shuffled[r];
        shuffled[r] = set[index];
    }
    return shuffled;
};
Utils.shuffle = shuffle;
/**
 * 智能随机
 * 		如果只指定n，返回0~n随机值，
 * 		如果n是数组而且不指定m，返回数组中随机一个元素
 * 		如果n是数组而且指定m，则随机从n中抽取m个元素打乱后返回新的数组
 */
export function rand(n: number | any[], m?: number) {
    if (n instanceof Array) {
        var len = n.length;
        if (m == null) {
            return n[0 | Math.random() * (len)];
        } else {
            var ret = shuffle(n);
            return ret.slice(0, m);
        }
    }
    else if (!isVoid(n)) {
        m = m || 0;
        return 0 | (n + Math.random() * (m - n));
    } else {
        return 0 | Math.random() * 100;
    }
};
Utils.rand = rand;
export function randFloat(n: number | any[], m?: number) {
    if (n instanceof Array) {
        var len = n.length;
        if (m == null) {
            return n[0 | Math.random() * (len)];
        } else {
            var ret = shuffle(n);
            return ret.slice(0, m);
        }
    }
    else if (!isVoid(n)) {
        m = m || 0;
        return (n + Math.random() * (m - n));
    } else {
        return Math.random();
    }
};
Utils.randFloat = randFloat;
export function randDiffent(arrFrom, arrDiffent) {
    let idx = rand(arrFrom.length);
    for (let i = 0; i < arrFrom.length; i++) {
        let item = arrFrom[(i + idx) % arrFrom.length];
        if (arrDiffent.indexOf(item) < 0) {
            return item;
        }
    }
    return null;
}
Utils.randDiffent = randDiffent;

export function randText(len=1, type?:'cn'|'en'|'number') {
    if (len<=0) return ''
    if (!type) {
        return randText(len, rand(['cn', 'en', 'number']))
    }else if (type==='cn') {
        let i=0;
        let _str = "";
        let _base = 20000;
        let _range = 1000;
        for(let i=0; i < len; i++){
            if (len>3 && i===len-1) {
                _str += '。'
            }else{
                let c = rand(_range+i>2?100:0)
                if (c>=_range) {
                    _str += '，'
                }else{
                    let _lower = parseInt(''+ c );
                    _str += String.fromCharCode(_base + _lower);                
                }
            }
        }
        return _str;
    }else if(type==='en'){
        let _str = "";
        for(let i=0; i < len; i++){
            let c = rand(97, i>3?130:123)
            _str += c>=123?' ':String.fromCharCode(c)
        }
        return _str;
    }else{
         return '' + (len>1?rand(Math.pow(10, len-1), Math.pow(10, len)):rand(10))
    }
}
Utils.randDiffent = randDiffent;

/**
 * 智能随机
 * 		如果只指定n，返回0~n随机值，
 * 		如果n是数组而且不指定m，返回数组中随机一个元素
 * 		如果n是数组而且指定m，则随机从n中抽取m个元素打乱后返回新的数组
 */
export function MTseed(seed: number): void {
    if (isVoid(seed))
        seed = new Date().getTime();
    initialize_generator(seed);
};
Utils.MTseed = MTseed;
export function MTshuffle(obj: any[], n: number): any[] {
    var set = obj && obj.length === +obj.length ? obj : values(obj);
    var length = set.length;
    n = n || length;
    if (n > length) n = length;
    var shuffled = new Array(n);
    for (var index = 0, rand; index < n; index++) {
        rand = MTrand(0, index);
        if (rand !== index) shuffled[index] = shuffled[rand];
        shuffled[rand] = set[index];
    }
    return shuffled;
};
Utils.MTshuffle = MTshuffle;
export function MTrand(n: number | any[], m?: number) {
    if (n instanceof Array) {
        var len = n.length;
        if (m == null) {
            return n[0 | mt_random() * (len)];
        } else {
            return MTshuffle(n, m);
        }
    }
    else if (!isVoid(n)) {
        m = m || 0;
        return (0 | (n + mt_random() * (m - n)));
    } else {
        return extract_number();
    }
};
Utils.MTrand = MTrand;
export function MTrandFloat(n: number | any[], m?: number) {
    if (n instanceof Array) {
        var len = n.length;
        if (m == null) {
            return n[0 | mt_random() * (len)];
        } else {
            return MTshuffle(n, m);
        }
    }
    else if (!isVoid(n)) {
        m = m || 0;
        return (n + mt_random() * (m - n));
    } else {
        return mt_random();
    }
};
Utils.MTrandFloat = MTrandFloat;

export function MTrandDiffent(arrFrom, arrDiffent) {
    let idx = MTrand(arrFrom.length);
    for (let i = 0; i < arrFrom.length; i++) {
        let item = arrFrom[(i + idx) % arrFrom.length];
        if (arrDiffent.indexOf(item) < 0) {
            return item;
        }
    }
    return null;
}
Utils.MTrandDiffent = MTrandDiffent;
/**
 * 合并,会修改a
 * 		把b的属性或者值合并到a中去
 * @param {any} a
 * @param {any} b
 * @param {boolean} isCanChangeProperty 是否允许改变a的属性（增加或者改变类型）
 * @return {any} 返回a
 */
export function merge(a: any, b: any, isCanChangeProperty = false): any {
    if (b === undefined || b === null)
        return a;
    if (a == null) {
        a = copy(b);
        return a;
    }
    //如果a,b的类型不一致，则直接覆盖      
    let typeA = typeof (a), typeB = typeof (b);
    let isObjectA = (typeA == 'object' || typeA == 'function');
    let isObjectB = (typeB == 'object' || typeB == 'function');
    if (isObjectA && isObjectB) {
        //如果ab都是对象，则对属性进行合并
        for (var k in b) {
            if (b.hasOwnProperty(k)) {
                if (a.hasOwnProperty(k)) {
                    let objTypeA = toString.call(a[k]);
                    let objTypeB = toString.call(b[k]);
                    if (objTypeA == objTypeB) {
                        if (objTypeA === '[object Object]') a[k] = merge(a[k], b[k], true);
                        else a[k] = copy(b[k]);
                    } else
                        a[k] = merge(a[k], b[k], isCanChangeProperty);
                } else if (isCanChangeProperty) {
                    a[k] = copy(b[k]);
                }
            }
        }
    } else if (typeA !== typeB) {
        //如果a,b类型不同，尝试转换类型或者直接覆盖
        if (isCanChangeProperty) {//能修改类型，直接拷贝
            a = copy(b);
        } else {//不能修改类型，尝试转换以适应类型，转换不了放弃合并属性
            if (typeA == 'string' && typeB == 'number') {
                a = '' + b;
            } else if (typeB == 'string') {
                if (typeA == 'number') {
                    a = Number(b);
                } else if (typeA == 'object') {
                    if (b[0] == '{' && b[b.length - 1] == '}' || b[0] == '[' && b[b.length - 1] == ']')
                        a = unserialize(b);
                }
            } else if (typeA == 'string' && typeB == 'object') {
                a = serialize(b);
            }
        }
    } else {
        a = copy(b);
    }
    return a;
};
Utils.merge = merge;
/**
 * 测试obj是否拥有jsonProperty中定义的属性
 * 		如果出现obj中没有jsonProperty里的属性，则会根据nameWarning参数输出日志
 * @param {any} obj
 * @param {any} jsonProperty
 * @param {string} nameWarning 需要日志警告的对象名（如果nameWarning为空，则不打日志）
 * @return {any} 返回没有定义的属性的数组
 */
export function checkProperty(obj: object, jsonProperty: object, nameWarning?: string): any[] {
    var ret: any[] = [];
    for (var k in jsonProperty) {
        if (jsonProperty.hasOwnProperty(k)) {
            if (!obj.hasOwnProperty(k)) {
                ret.push(k);
                if (nameWarning) {
                    console.log(nameWarning + ' WARNING: ' + k + '  not define');
                }
            }
        }
    }
    return ret;
}
Utils.checkProperty = checkProperty;
/**
 * 把对象输出为字符串，可以显示有循环引用的对象
 */
var _classToString = function (obj) {
    let className = getClassName(obj)
    if (className && className!=='Object' && className!=='Array'){
        if (className==="cc_Node") {
            return `<cc.Node: name:${obj._name} pos:${obj._position}>`;
        }else{
            return `<class ${className}>`
        }
    }

    return null;
}
export function j(obj: any, showAllProperty?: boolean, tabStr?: string, tab?: number, circleObjs?: any[]) {
    if (circleObjs)
        circleObjs.push(obj);
    else
        circleObjs = [obj];

    if (obj === undefined)
        return 'undefined';
    else if (obj === null)
        return 'null';
    let typeObj = typeof (obj);
    if (typeObj !== 'object' && !(typeObj == 'function' && size(obj) > 0))
        return '' + obj;
    tabStr = tabStr || '   ';
    tab = tab || 0;
    var sTab = '';
    for (var i = 0; i <= tab - 1; i++)
        sTab += tabStr;
    var str = '';
    var idx = 0;
    var hasSubObject = false;
    var isArray = Array.isArray(obj);
    var s;
    if (isArray) {
        s = obj.length;
        if (s > 30) {
            str += '[...(' + s + ')]';
        } else {
            var prevStr = '';
            var sameCount = 0;
            //				for(var f=0; f<obj.length; f++){
            var i = 0;
            for (var f in obj) {
                var _str = '';
                var objString = toString.call(obj[f]);
                if (idx > 0)
                    _str += sTab + tabStr;
                if (parseInt(f) !== i)
                    _str += f + ': ';
                if (obj[f] === undefined) {
                    _str += 'undefined';
                } else if (obj[f] === null) {
                    _str += 'null';
                } else if (typeof (obj[f]) == 'function') {
                    _str += 'function';
                } else if (objString == '[object Date]') {
                    _str += objString + ' ' + dateString(obj[f]);
                } else if (Array.isArray(obj[f]) || isObject(obj[f]) || objString == '[object Object]' || objString == '[object Object],' || objString == '[Object]') {
                    if (circleObjs.indexOf(obj[f]) !== -1) {
                        _str += obj[f] + '(circle)';;
                    } else if (obj[f]['_className']) {
                        _str += '[object ' + obj[f]['_className'] + ']';
                    } else if (has(obj[f], '$id')) {
                        _str += '{class : ' + obj[f].$id + '}';
                    } else {
                        let ccn = _classToString(obj[f]);
                        if (ccn) {
                            _str += ccn;
                        } else if (objString == '[object Object]' || objString == '[object Array]' || objString == '[object Function]') {
                            hasSubObject = true;
                            _str += j(obj[f], showAllProperty, tabStr, tab + 1, circleObjs);
                        } else {
                            _str += objString;
                        }
                    }
                }
                else if (typeof (obj[f]) == 'string')
                    _str += "'" + obj[f] + "'";
                else
                    _str += obj[f];
                //				if (prevStr === _str){
                //					sameCount ++;
                //				}else{
                //					if (sameCount>0){
                //						str += ' ... (x' + sameCount+1 + ')';
                //						idx++;
                //						if ( s>1)
                //							str += ',\n';				
                //					}
                str += _str;
                //					prevStr = _str;
                //					sameCount = 0;
                idx++;
                if (s > idx && s > 1)
                    str += ',\n';
                //				}
                i++;
            }
            //			if (sameCount>0){
            //				str += ' ... (x' + sameCount+1 + ')';
            //				idx++;
            //				if ( s>1)
            //					str += ',\n';				
            //			}		
        }
    } else {
        if (toString.call(obj) == '[object Date]') {
            return dateString(obj);
        }
        s = 0;
        for (var f in obj) {
            if (showAllProperty || obj.hasOwnProperty(f))
                s++;
        }
        for (var f in obj) {
            if (showAllProperty || obj.hasOwnProperty(f)) {
                var objString = toString.call(obj[f]);
                if (idx > 0)
                    str += sTab + tabStr;
                if (!obj.hasOwnProperty(f))
                    str += 'prototype.';
                if (obj[f] === undefined) {
                    str += f + ': ' + 'undefined';
                } else if (f.substr(0, 2) === '__') {
                    str += f + ': ' + obj[f];
                } else if (obj[f] === null) {
                    str += f + ': ' + 'null';
                } else if (typeof (obj[f]) == 'function') {
                    str += f + ': ' + 'function';
                } else if (objString == '[object Date]') {
                    str += objString + ' ' + dateString(obj[f]);
                } else if (Array.isArray(obj[f]) || isObject(obj[f]) || objString == '[object Object]' || objString == '[object Object],' || objString == '[Object]') {
                    if (circleObjs.indexOf(obj[f]) !== -1) {
                        str += f + ': ' + obj[f] + '(circle)';
                    } else if (obj[f]['_className']) {
                        str += f + ': ' + '[object ' + obj[f]['_className'] + ']';
                    } else if (has(obj[f], '$id')) {
                        str += f + ': ' + '{class : ' + obj[f].$id + '}';
                    } else {
                        let ccn = _classToString(obj[f]);
                        if (ccn) {
                            str += f + ': ' + ccn;
                        } else if (objString == '[object Object]' || objString == '[object Array]' || objString == '[object Function]') {
                            hasSubObject = true;
                            str += f + ': ' + j(obj[f], showAllProperty, tabStr, tab + 1, circleObjs);
                        } else {
                            str += f + ': ' + objString;
                        }
                    }
                }
                else if (typeof (obj[f]) == 'string')
                    str += f + ': ' + "'" + obj[f] + "'";
                else
                    str += f + ': ' + obj[f];
                idx++;
                if (s > idx && s > 1)
                    str += ',\n';
            }
        }
    }
    var objName = toString.call(obj);
    var l = ((objName != '[object Object]' && objName != '[object Array]') ? objName + '  ' : '') + (isArray ? '[' : '{');
    var r = isArray ? ']' : '}';
    if (str.indexOf('\n') === -1) {
        return l + str + r;
    } else {
        var ret = l + '\n' + sTab + (tab >= 0 ? tabStr : '') + str + '\n' + sTab + r;
        if (!hasSubObject && ret.length < 100) {
            // if (tab>=0){
            //     return (j(obj, showAllProperty, tabStr, -1).replace(/\n/g, '')).replace(new RegExp(tabStr,"gm"),'');
            // }else
            return ret.replace(/\n/g, '').replace(new RegExp(tabStr, "gm"), '').replace(',', ', ');
        } else
            return ret;
    }
};
Utils.j = j;
/**
 * 根据给定的属性列表生成一个字典（对象）
 */
export function dict(_keys: string[], value: string[] | any): object {
    if (!Array.isArray(_keys))
        return {};
    var ret = {};
    for (let k = 0; k < _keys.length; k++) {
        let v = _keys[k];
        if (value === undefined)
            ret[v] = undefined;
        else if (Array.isArray(value)) {
            if (k < value.length)
                ret[v] = value[k];
            else
                ret[v] = undefined;
        } else
            ret[v] = value;
    }
    return ret;
};
Utils.dict = dict;
// var _now = Date.now();
//获取当前时间毫秒数（从程序启动开始算）
export function now(): number { return Date.now() };
Utils.now = now;
export function nowSec(): number { return INT(Date.now() / 1000) };
Utils.nowSec = nowSec;
const _tick2018 = new Date(2018, 1, 1).getTime()
export const MS_day = 86400000;
Utils.MS_day = MS_day;
export const MS_hour = 3600000;
Utils.MS_hour = MS_hour;
export function nowDay(hour = 0): number { return INT((Date.now() - _tick2018 - hour * MS_hour) / MS_day) };
Utils.nowDay = nowDay;
export function nowDayMS(hour = 0, dayOffset = 0): number { return (nowDay() + dayOffset) * MS_day + _tick2018 + hour * MS_hour };
Utils.nowDayMS = nowDayMS;
export function newDate(date) {
    let ret = new Date(date);
    if (!ret.getTime()) {
        return new Date();
    } else {
        return ret;
    }
};
Utils.newDate = newDate;
var TEMP = {};
/*
 * 自动开关，每调用一次自动切换开关状态并返回
 */
export function on_off(name: string): boolean {
    if (!TEMP[name])
        TEMP[name] = true;
    else
        TEMP[name] = !TEMP[name];
    return TEMP[name];
};
Utils.on_off = on_off;
/*
 * 自动循环取数
 * 	每调用一次数值在范围内循环自增
 *  参数：min max 最大最小值， 
 *  	也可以用[min,max]数组作为参数
 *  	如果max不传入，则范围为0~min之间
 */
export function loop(name: string, min: any, max?: any): number {
    if (isVoid(max)) {
        if (!isVoid(min) && min.length > 1) {
            max = min[1];
            min = min[0];
        } else {
            max = min;
            min = 0;
        }
    }
    if (TEMP[name] === undefined) {
        TEMP[name] = min;
    } else {
        if (min < max)
            TEMP[name] = (TEMP[name] + 1) % (max - min);
        else if (min > max)
            TEMP[name] = (TEMP[name] - 1) % (min - max);
    }
    //_.log(name, min, max, TEMP[name]);
    return TEMP[name];
};
Utils.loop = loop;
/**
 * 根据时间衰减，在timeMs时间内从1.0衰减到0
 * @param timeMs
 * @param callBack
 */
export function decay(timeMs: any, callBack: any): void {
    if (typeof timeMs === 'function') {
        callBack = timeMs;
        timeMs = 1000;
    }
    var t = now();
    var i = setInterval(function () {
        var tt = 1 - (now() - t) / timeMs;
        if (tt > 0) {
            callBack(tt);
        } else {
            callBack(0);
            clearInterval(i);
        }
    }, 10);
};
Utils.decay = decay;

/**
 * 数字增加效果
 * @param timeMs
 * @param callBack
 */
export async function incNum(from: number, to: number, maxStep: number, stepMS: number, stepCallback: (v: number) => void) {
    let inc = to - from;
    let absInc = inc > 0 ? inc : -inc;
    let step = maxStep > absInc ? maxStep = absInc : maxStep;
    let incStep = inc / step;
    for (let i = 1; i <= maxStep; i++) {
        if (stepMS > 0) await sleep(stepMS);
        stepCallback(i === maxStep ? to : from + incStep * i);
    }
};
Utils.incNum = incNum;

//计算一个点是否在多边形里,参数:点,多边形数组
export function isPointInPoly(pt: { x: number, y: number }, poly: { x: number, y: number }[]): boolean {
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
            && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
            && (c = !c);
    return c;
};
Utils.isPointInPoly = isPointInPoly;


// /**
//  * 获取文件扩展名
//  * 返回 文件扩展名
//  */
// export function parseExt (path:string) {
//     let i = path.lastIndexOf('/');
//     let p = path.split(/\/|\\|\//g);
//     let file = p[p.length-1];
//     let i = file.lastIndexOf('.');
//     if (i<0) i=file.length;
//     return {
//         isUrl:p[0].slice(0, 4)==='http',
//         paths:p,
//         name:file.slice(0, i),
//         ext:file.slice(i),
//     }
// }
// Utils.parseExt     = parseExt;
/**
 * 分析路径
 * 返回 路径数组，是否url，文件名，扩展名
 */
export function parsePath(path: string) {
    let p = path.split(/\/|\\|\//g);
    let file = p[p.length - 1];
    let i = file.lastIndexOf('.');
    if (i < 0) i = file.length;
    return {
        isUrl: p[0].slice(0, 4) === 'http',
        paths: p,
        name: file.slice(0, i),
        ext: file.slice(i + 1),
    }
}
Utils.parsePath = parsePath;
/*
 * 屏蔽掉与自己无关的日志的做法：
 * 1、修改res/log.json, ignoreAll设置为true，让后在logers里加入自己的日志名字，比如"aaa": {"ignore":false},表示忽略全部日志，但打开名为"aaa"的日志
 * {
 * "enable" : true,
 * "ignoreAll" : true,
 * "notIgnoreStrings" : [],
 * "logers": {
 * "aaa": {"ignore":true},
 * }
 * }
 * 2、输出日志时用大写的LOG输出日志，第一个参数为'aaa'，这样只能看到自己的日志，别人的日志都会被隐藏
 * _.LOG( 'aaa', message);
 *   如果配置了notIgnoreStrings，表示只要日志里包含了notIgnoreStrings里的字符串的日志都不隐藏
 *
 * 注意：有部分日志是引擎底层打印的，无法屏蔽
 */
var LOG_MODE = 1;
var mylog;
var stackKey;
var stackPos;
var _logConfig;
var _beginTick = now();
var _lastTick = _beginTick;
let isChromeDebug = null;
mylog = console.log;
stackKey = '/script/';
stackPos = isChromeDebug ? 4 : 3;
// _logConfig	= cc.loader.getRes("res/log.json"); 
_logConfig = _logConfig || { logers: {} };

export function configureLog(jsonObj) {
    _logConfig = merge(_logConfig, jsonObj);
}
Utils.configureLog = configureLog;
export function setLogMode(logMode) {
    LOG_MODE = logMode;
}
Utils.setLogMode = setLogMode;
/**
 * 获取调用堆栈
 * 返回 调用文件名及行数组成的数组
 */
export function getStack(isFullPath?) {
    var err = new Error();
    var stacks = (err.stack || '').split('\n');
    if (isFullPath)
        return stacks;
    var fileLines: any[] = [];
    for (var i = 0; i < stacks.length - 1; i++) {
        var a = stacks[i].split(stackKey);
        if (a && a.length > 1) {
            fileLines[i] = a[1];
        } else {
            fileLines[i] = stacks[i];
        }
    }
    return fileLines;
}
Utils.getStack = getStack;
/**
 * 获取调用文件及行号
 * 返回 调用文件及行号字符串
 */
export function getCallFileNameAndLine(callerLevel = 0) {
    var stacks = getStack();
    if (stacks.length > stackPos + callerLevel) {
        var ret = stacks[stackPos + callerLevel];
        //if (ret.length>20){
        var a = ret.split(/\\|\//g);
        ret = a[a.length - 1];
        //}
        var flr = ret.split(':');
        return flr[0].split('.')[0] + ':' + flr[1];
    } else
        return undefined;
}
Utils.getCallFileNameAndLine = getCallFileNameAndLine;
/**
 * 获取当前文件名
 * 返回 当前文件名字符串
 */
export function getFileName(callerLevel = 0) {
    var stacks = getStack();
    if (stacks.length > stackPos + callerLevel) {
        return stacks[stackPos + callerLevel].split(':')[0].split('.')[0];
    } else
        return undefined;
}
Utils.getFileName = getFileName;
/**
 * 获取当前行号
 * 返回 当前行号
 */
export function getFileLine(callerLevel = 0) {
    var stacks = getStack();
    if (stacks.length > stackPos + callerLevel) {
        return parseInt(stacks[stackPos + callerLevel].split(':')[1]);
    }
    return undefined;
}
Utils.getFileLine = getFileLine;

interface Logger{
    name?:string,
    showDate?:boolean,
    showStack?:boolean,
    showPass?:boolean,
    callerLevel?:number,
    [k:string]:any,
}
let __logger = {
    name : '',
    showDate:false,
    showStack:false,
    showPass:true,
    callerLevel:0
}
export function setLogger(logger:Logger|string) {
    if (typeof logger==='string') {
        __logger.name = logger
    }else{
        for(let k in logger) {
            logger[k]!==undefined && (__logger[k] = logger[k])
        }        
    }
}
Utils.setLogger = setLogger;
export function logger(level:''|'ALL'|'TRACE'|'DEBUG'|'INFO'|'WARN'|'ERROR'|'FATAL'|'OFF'='', logger?:Logger) {
    //strTick += (_lastTick-_beginTick)%1000;
    if (!logger) logger = __logger
    let callerLevel = logger.callerLevel||0
    if(callerLevel>=0) {
        let funcs:string[] = []
        let fileNameAndLine = ''
        var stacks = getStack();
        if (stacks.length > stackPos + callerLevel) {
            var ret:string = stacks[stackPos + callerLevel];
            for(let n=0; n<1; n++) {
                let s:string = stacks[stackPos + callerLevel + n]
                if(s){
                    let i = s.indexOf('at ')
                    if (i>=0){
                        let j = s.indexOf(' (', i+3)
                        if (j>0) {
                            let f = s.slice(i+3, j)
                            if (f.indexOf('Function.')===0) f = f.slice(9)
                            else if (f.indexOf('new ')===0) f = f.slice(4)
                            else if (/^(process.|Module.|Object.|Timeout.)/.test(f)) continue
                            funcs.unshift(f)
                        }
                    }                     
                }
            }
            let i = ret.lastIndexOf('\\')
            if (i>0) {
                let j = ret.lastIndexOf(':')
                fileNameAndLine = ret.slice(i+1, j)
            }
        }
        let arr = logger.showDate ?  [dateString(undefined, 'MS')]:[]
        logger.name && arr.push(`${logger.name}`)
        if (logger.showPass) {
            var passTick = now() - _lastTick;
            _lastTick = now();
            // var strTick = '',
            //     curSec = 0 | ((_lastTick - _beginTick) / 1000);
            // strTick += (0 | (curSec / 60)) + ':';
            // strTick += curSec % 60 + ' ';
            logger.showPass && arr.push(`${passTick} `)            
        }
        level && level!=='INFO' && arr.push(`${level}`)
        logger.showStack&&funcs.length && arr.push(`${funcs.join('-')}`)
        if (logger.showStack) {
            fileNameAndLine && arr.push(`${fileNameAndLine}`)
        }else{
            fileNameAndLine && arr.push(`${fileNameAndLine.split('.')[0]}`)
        }
        let str = `[${arr.join(' ')}${logger.showStack?'\n':''}]`
        return str?`${str}      `:''
    }else{
    }
    return ''
}
Utils.logger = logger;

/**
 * 打日志
 */
export function log(obj: any, isShowAllProperty = false, callerLevel = 0): string {
    if (!LOG_MODE)
        return obj;
    var msg;
    if (isChromeDebug) {
        msg = '  ';
    } else if (isObject(obj)) {
        let str = j(obj, isShowAllProperty, '---');
        msg = ((str.indexOf('\n') != -1 ? '\n' : '') + str).replace(/\n/g, "\n ---");
    } else {
        msg = '' + obj;
    }
    var passTick = now() - _lastTick;
    _lastTick = now();
    var strTick = '',
        curSec = 0 | ((_lastTick - _beginTick) / 1000);
    strTick += (0 | (curSec / 60)) + ':';
    strTick += curSec % 60 + ' ';
    //strTick += (_lastTick-_beginTick)%1000;
    var fileNameAndLine = getCallFileNameAndLine(callerLevel);
    if (fileNameAndLine) {
        msg = '---【' + strTick + fileNameAndLine + ' ' + passTick + '】 ' + msg;
    }
    var checkIgnore = true;
    if (_logConfig.notIgnoreStrings) {
        for (var i = 0; i < _logConfig.notIgnoreStrings.length; i++) {
            if (msg.indexOf(_logConfig.notIgnoreStrings[i]) !== -1) {
                checkIgnore = false;
                break;
            }
        }
    }
    if (checkIgnore && _logConfig.ignoreAll === true) {
        return obj;
    }
    if (isChromeDebug) {
        console.log(msg, obj);
    } else {
        mylog(msg);
    }

    return obj;
};
Utils.log = log;
export function getLogString(obj, isShowAllProperty = false, callerLevel = 0) {
    var msg;
    if (isObject(obj)) {
        let str = j(obj, isShowAllProperty, '---');
        msg = ((str.indexOf('\n') != -1 ? '\n---' : '') + str).replace(/\n/g, "\n ---");
    } else {
        msg = '' + obj;
    }
    var fileNameAndLine = getCallFileNameAndLine(callerLevel);
    if (fileNameAndLine) {
        msg = '【' + fileNameAndLine + '】' + msg;
    }
    return msg;
};
Utils.getLogString = getLogString;
export function LOG(logName, obj, isShowAllProperty = false, callerLevel = 0) {
    if (!LOG_MODE)
        return obj;
    if (arguments.length < 2) {
        logName = '';
        obj = '';
    }
    var msg;
    if (isChromeDebug) {
        msg = '  ';
    } else if (isObject(obj)) {
        let str = j(obj, isShowAllProperty, '---');
        msg = ((str.indexOf('\n') != -1 ? '\n---' : '') + str).replace(/\n/g, "\n ---");
    } else {
        msg = '' + obj;
    }
    var passTick = now() - _lastTick;
    _lastTick = now();
    var strTick = '',
        curSec = 0 | ((_lastTick - _beginTick) / 1000);
    strTick += (0 | (curSec / 60)) + ':';
    strTick += curSec % 60 + ' ';
    //strTick += (_lastTick-_beginTick)%1000;
    var fileNameAndLine = getCallFileNameAndLine(callerLevel);
    if (fileNameAndLine) {
        msg = (logName ? ('---【' + logName + ':') : '---【') + strTick + fileNameAndLine + ' ' + passTick + '】 ' + msg;
    }
    // if (arguments.length > 2){
    //     var arg = [msg];
    //     for (var i = 2; i < arguments.length; i++) {
    //         if (isObject(arguments[i])){
    //             arg[i-1] = j(arguments[i]);
    //         }else{
    //             arg[i-1] = arguments[i];
    //         }
    //     }
    //     msg = cc.js.formatStr.apply(null, arg);
    // }
    var checkIgnore = true;
    if (_logConfig.notIgnoreStrings) {
        for (var i = 0; i < _logConfig.notIgnoreStrings.length; i++) {
            if (msg.indexOf(_logConfig.notIgnoreStrings[i]) !== -1) {
                checkIgnore = false;
                break;
            }
        }
    }
    if (checkIgnore && _logConfig.ignoreAll === true && !_logConfig.logers.has(logName)) {
        return obj;
    }
    if (checkIgnore && _logConfig.logers.has(logName) && _logConfig.logers[logName].ignore === true) {
        return obj;
    }
    if (isChromeDebug) {
        console.log(msg, obj);
    } else {
        mylog(msg);
    }
    return obj;
};
Utils.LOG = LOG;
/*
* 打印调用堆栈
    */
export function logStack() {
    if (!LOG_MODE)
        return;
    log(getStack().slice(stackPos - 1), false, 1);
};
Utils.logStack = logStack;
export function LOGSTACK(logName) {
    if (!LOG_MODE)
        return;
    LOG(logName, getStack().slice(stackPos - 1), false, 1);
};
Utils.LOGSTACK = LOGSTACK;


// OOP
// ---------------
// If Underscore is called as a function, it returns a wrapped object that
// can be used OO-style. This wrapper holds altered versions of all the
// underscore functions. Wrapped objects may be chained.

// Helper function to continue chaining intermediate results.
var result = function (obj) {
    return this._chain ? Utils(obj).chain() : obj;
};
// Add your own custom functions to the Underscore object.
export function mixin(obj) {
    each(functions(obj), function (name) {
        var func = Utils[name] = obj[name];
        Utils.prototype[name] = function () {
            var args = [this._wrapped];
            push.apply(args, arguments as any);
            return result.call(this, func.apply(Utils, args));
        };
    });
};
Utils.mixin = mixin;
// Add all of the Underscore functions to the wrapper object.
Utils.mixin(Utils);

// Add all mutator Array functions to the wrapper.
Utils.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
    var method = ArrayProto[name];
    Utils.prototype[name] = function () {
        var obj = this._wrapped;
        method.apply(obj, arguments);
        if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
        return result.call(this, obj);
    };
});

// Add all accessor Array functions to the wrapper.
Utils.each(['concat', 'join', 'slice'], function (name) {
    var method = ArrayProto[name];
    Utils.prototype[name] = function () {
        return result.call(this, method.apply(this._wrapped, arguments));
    };
});

// Extracts the result from a wrapped and chained object.
Utils.prototype.value = function () {
    return this._wrapped;
};



//   var _checkWordMap = null;
//   // var m_wordList = ["ab", "bad", "abc", "ddd", "aaa", "ccc", "bbb", "adsf", "edsdf", "ss", "fff", "aaa"]; // @private
//    var   _wordBuildMap = function () {
//       let wordList = ["福音会", "中国教徒", "统一教", "观音法门", "清海无上师", "盘古", "李洪志", "志洪李", "李宏志", "轮功", "法轮", "轮法功", "三去车仑", "氵去车仑", "发论工", "法x功", "法o功", "法0功", "法一轮一功", "轮子功", "车仑工力", "法lun", "fa轮", "法lg", "flg", "fl功", "falungong", "大法弟子", "大纪元", "dajiyuan", "明慧网", "明慧周报", "正见网", "新唐人", "伪火", "退党", "tuidang", "退dang", "超越红墙", "自fen", "真善忍", "九评", "9评", "9ping", "九ping", "jiuping", "藏字石", "集体自杀", "自sha", "zi杀", "suicide", "titor", "逢8必灾", "逢八必灾", "逢9必乱", "逢九必乱", "朱瑟里诺", "根达亚文明", "诺查丹玛斯", "人类灭亡进程表", "按照马雅历法", "推背图", "推bei图", "济世灵文", "诸世纪", "电狗", "电话定位器", "电话拦截器", "电话窃听", "电话监", "电话交友", "电话追杀系统", "电击枪", "电鸡", "电警棒", "枪出售", "枪的制", "枪货到", "枪决女犯", "枪模", "枪手", "枪销售", "枪械制", "枪子弹", "售步枪", "售纯度", "售单管", "售弹簧刀", "售防身", "售狗子", "售虎头", "售火药", "售假币", "售健卫", "售军用", "售猎枪", "售氯胺", "售麻醉", "售枪支", "售热武", "售三棱", "售手枪", "售五四", "售一元硬", "售子弹", "售左轮", "亚砷（酸）酐", "亚砷酸钾", "亚砷酸钠", "亚硒酸", "亚硒酸二钠", "亚硒酸镁", "亚硒酸钠", "亚硒酸氢钠", "亚硝酸乙酯", "亚硝酰乙氧", "氧化二丁基锡", "氧化汞", "氧化铊", "氧化亚铊", "氧氯化磷", "原装弹", "原子弹方法", "原子弹清单", "安眠酮", "代血浆", "普萘洛尔", "呋塞米", "西布曲明", "testosterone", "胰岛素样生长因子", "促红细胞生成素", "地西泮", "尼可刹米", "甲睾酮", "adrenaline", "erythropoietin", "地奈德", "莫达非尼", "氯噻嗪", "苯巴比妥", "促性腺激素", "泼尼松", "麻黄草", "雄烯二醇", "地塞米松", "tamoxifen", "strychnine", "androst", "新型毒品", "杜冷丁", "兴奋剂", "mdma", "海洛因", "海luo因", "heroin", "diamorphine", "diacetylmorphine", "鸦片", "阿芙蓉", "咖啡因", "cocain", "三唑仑", "美沙酮", "麻古", "k粉", "凯他敏", "ketamine", "冰毒", "苯丙胺", "cannabis", "大麻", "爱他死", "氯胺酮", "benzodiazepines", "甲基安非他明", "安非他命", "吗啡", "腐败中国", "三个呆婊", "你办事我放心", "社会主义灭亡", "打倒中国", "打倒共产党", "打倒共产主义", "打倒胡锦涛", "打倒江泽民", "打倒江主席", "打倒李鹏", "打倒罗干", "打倒温家宝", "打倒中共", "打倒朱镕", "抵制共产党", "抵制共产主义", "抵制胡锦涛", "抵制江泽民", "抵制江主席", "抵制李鹏", "抵制罗干", "抵制温家宝", "抵制中共", "抵制朱镕基", "灭亡中国", "亡党亡国", "粉碎四人帮", "激流中国", "特供", "特贡", "特共", "zf大楼", "殃视", "贪污腐败", "强制拆除", "形式主义", "政治风波", "太子党", "上海帮", "北京帮", "清华帮", "红色贵族", "权贵集团", "河蟹社会", "喝血社会", "九风", "9风", "十七大", "十7大", "17da", "九学", "9学", "四风", "4风", "双规", "南街村", "最淫官员", "警匪", "官匪", "独夫民贼", "官商勾结", "城管暴力执法", "强制捐款", "毒豺", "一党执政", "一党专制", "一党专政", "专制政权", "宪法法院", "胡平", "苏晓康", "贺卫方", "谭作人", "焦国标", "万润南", "张志新", "辛灝年", "高勤荣", "王炳章", "高智晟", "司马璐", "刘晓竹", "刘宾雁", "魏京生", "寻找林昭的灵魂", "别梦成灰", "谁是新中国", "讨伐中宣部", "异议人士", "民运人士", "启蒙派", "选国家主席", "民一主", "min主", "民竹", "民珠", "民猪", "chinesedemocracy", "大赦国际", "国际特赦", "da选", "投公", "公头", "宪政", "平反", "党章", "维权", "昝爱宗", "宪章", "08宪", "08xz", "抿主", "敏主", "人拳", "人木又", "人quan", "renquan", "中国人权", "中国新民党", "群体事件", "群体性事件", "上中央", "去中央", "讨说法", "请愿", "请命", "公开信", "联名上书", "万人大签名", "万人骚动", "截访", "上访", "shangfang", "信访", "访民", "集合", "集会", "组织集体", "静坐", "静zuo", "jing坐", "示威", "示wei", "游行", "you行", "油行", "游xing", "youxing", "官逼民反", "反party", "反共", "抗议", "亢议", "抵制", "低制", "底制", "di制", "抵zhi", "dizhi", "boycott", "血书", "焚烧中国国旗", "baoluan", "流血冲突", "出现暴动", "发生暴动", "引起暴动", "baodong", "灭共", "杀毙", "罢工", "霸工", "罢考", "罢餐", "霸餐", "罢参", "罢饭", "罢吃", "罢食", "罢课", "罢ke", "霸课", "ba课", "罢教", "罢学", "罢运", "网特", "网评员", "网络评论员", "五毛党", "五毛们", "5毛党", "戒严", "jieyan", "jie严", "戒yan", "8的平方事件", "知道64", "八九年", "贰拾年", "2o年", "20和谐年", "贰拾周年", "六四", "六河蟹四", "六百度四", "六和谐四", "陆四", "陆肆", "198964", "5月35", "89年春夏之交", "64惨案", "64时期", "64运动", "4事件", "四事件", "北京风波", "学潮", "学chao", "xuechao", "学百度潮", "门安天", "天按门", "坦克压大学生", "民主女神", "历史的伤口", "高自联", "北高联", "血洗京城", "四二六社论", "王丹", "柴玲", "沈彤", "封从德", "王超华", "王维林", "吾尔开希", "吾尔开西", "侯德健", "阎明复", "方励之", "蒋捷连", "丁子霖", "辛灏年", "蒋彦永", "严家其", "陈一咨", "中华局域网", "党的喉舌", "互联网审查", "当局严密封锁", "新闻封锁", "封锁消息", "爱国者同盟", "关闭所有论坛", "网络封锁", "金盾工程", "gfw", "无界浏览", "无界网络", "自由门", "何清涟", "中国的陷阱", "汪兆钧", "记者无疆界", "境外媒体", "维基百科", "纽约时报", "bbc中文网", "华盛顿邮报", "世界日报", "东森新闻网", "东森电视", "星岛日报", "wikipedia", "youtube", "googleblogger", "美国广播公司", "英国金融时报", "自由亚洲", "自由时报", "中国时报", "反分裂", "威胁论", "左翼联盟", "钓鱼岛", "保钓组织", "主权", "弓单", "火乍", "木仓", "石肖", "核蛋", "步qiang", "bao炸", "爆zha", "baozha", "zha药", "zha弹", "炸dan", "炸yao", "zhadan", "zhayao", "hmtd", "三硝基甲苯", "六氟化铀", "炸药配方", "弹药配方", "炸弹配方", "皮箱炸弹", "火药配方", "人体炸弹", "人肉炸弹", "解放军", "兵力部署", "军转", "军事社", "8341部队", "第21集团军", "七大军区", "7大军区", "北京军区", "沈阳军区", "济南军区", "成都军区", "广州军区", "南京军区", "兰州军区", "颜色革命", "规模冲突", "塔利班", "基地组织", "恐怖分子", "恐怖份子", "三股势力", "印尼屠华", "印尼事件", "蒋公纪念歌", "马英九", "mayingjiu", "李天羽", "苏贞昌", "林文漪", "陈水扁", "陈s扁", "陈随便", "阿扁", "a扁", "告全国同胞书", "台百度湾", "台完", "台wan", "taiwan", "台弯", "湾台", "台湾国", "台湾共和国", "台军", "台独", "台毒", "台du", "taidu", "twdl", "一中一台", "打台湾", "两岸战争", "攻占台湾", "支持台湾", "进攻台湾", "占领台湾", "统一台湾", "收复台湾", "登陆台湾", "解放台湾", "解放tw", "解决台湾", "光复民国", "台湾独立", "台湾问题", "台海问题", "台海危机", "台海统一", "台海大战", "台海战争", "台海局势", "入联", "入耳关", "中华联邦", "国民党", "x民党", "民进党", "青天白日", "闹独立", "duli", "fenlie", "日本万岁", "小泽一郎", "劣等民族", "汉人", "汉维", "维汉", "维吾", "吾尔", "热比娅", "伊力哈木", "疆独", "东突厥斯坦解放组织", "东突解放组织", "蒙古分裂分子", "列确", "阿旺晋美", "藏人", "臧人", "zang人", "藏民", "藏m", "达赖", "赖达", "dalai", "哒赖", "dl喇嘛", "丹增嘉措", "打砸抢", "西独", "藏独", "葬独", "臧独", "藏毒", "藏du", "zangdu", "支持zd", "藏暴乱", "藏青会", "雪山狮子旗", "拉萨", "啦萨", "啦沙", "啦撒", "拉sa", "lasa", "la萨", "西藏", "藏西", "藏春阁", "藏獨", "藏独", "藏独立", "藏妇会", "藏青会", "藏字石", "xizang", "xi藏", "x藏", "西z", "tibet", "希葬", "希藏", "硒藏", "稀藏", "西脏", "西奘", "西葬", "西臧", "援藏", "bjork", "王千源", "安拉", "回教", "回族", "回回", "回民", "穆斯林", "穆罕穆德", "穆罕默德", "默罕默德", "伊斯兰", "圣战组织", "清真", "清zhen", "qingzhen", "真主", "阿拉伯", "高丽棒子", "韩国狗", "满洲第三帝国", "满狗", "鞑子", "江丑闻", "江嫡系", "江毒", "江独裁", "江蛤蟆", "江核心", "江黑心", "江胡内斗", "江祸心", "江家帮", "江绵恒", "江派和胡派", "江派人马", "江泉集团", "江人马", "江三条腿", "江氏集团", "江氏家族", "江氏政治局", "江氏政治委员", "江梳头", "江太上", "江戏子", "江系人", "江系人马", "江宰民", "江贼", "江贼民", "江主席", "麻果丸", "麻将透", "麻醉弹", "麻醉狗", "麻醉枪", "麻醉槍", "麻醉药", "麻醉藥", "台独", "台湾版假币", "台湾独立", "台湾国", "台湾应该独立", "台湾有权独立", "天灭中共", "中共帮凶", "中共保命", "中共裁", "中共党文化", "中共腐败", "中共的血旗", "中共的罪恶", "中共帝国", "中共独裁", "中共封锁", "中共封网", "中共腐败", "中共黑", "中共黑帮", "中共解体", "中共近期权力斗争", "中共恐惧", "中共权力斗争", "中共任用", "中共退党", "中共洗脑", "中共邪教", "中共邪毒素", "中共政治游戏", "打人", "打人", "拆迁", "拆迁", "纠纷", "纠纷", "盗窃", "盗窃", "安眠酮", "代药物毒品类：血浆", "普萘洛尔", "呋塞米", "西布曲明", "testosterone", "胰岛素样生长因子", "促红细胞生成素", "地西泮", "尼可刹米", "甲睾酮", "adrenaline", "erythropoietin", "地奈德", "莫达非尼", "氯噻嗪", "苯巴比妥", "促性腺激素", "泼尼松", "麻黄草", "雄烯二醇", "地塞米松", "tamoxifen", "strychnine", "androst", "新型毒品", "杜冷丁", "兴奋剂", "mdma", "海洛因", "海luo因", "heroin", "diamorphine", "diacetylmorphine", "鸦片", "阿芙蓉", "咖啡因", "cocain", "三唑仑", "美沙酮", "麻古", "k粉", "凯他敏", "ketamine", "冰毒", "苯丙胺", "cannabis", "大麻", "爱他死", "氯胺酮", "benzodiazepines", "甲基安非他明", "安非他命", "吗啡", "morphine", "摇头丸", "迷药", "乖乖粉", "narcotic", "麻醉药", "精神药品", "专业代理", "帮忙点一下", "帮忙点下", "请点击进入", "详情请进入", "私人侦探", "私家侦探", "针孔摄象", "调查婚外情", "信用卡提现", "无抵押贷款", "广告代理", "原音铃声", "借腹生子", "找个妈妈", "找个爸爸", "代孕妈妈", "代生孩子", "代开发票", "腾讯客服电话", "销售热线", "免费订购热线", "低价出售", "款到发货", "回复可见", "连锁加盟", "加盟连锁", "免费二级域名", "免费使用", "免费索取", "蚁力神", "婴儿汤", "售肾", "刻章办", "买小车", "套牌车", "玛雅网", "电脑传讯", "视频来源", "下载速度", "高清在线", "全集在线", "在线播放", "txt下载", "六位qq", "6位qq", "位的qq", "个qb", "送qb", "用刀横向切腹", "完全自杀手册", "四海帮", "足球投注", "地下钱庄", "中国复兴党", "阿波罗网", "曾道人", "六合彩", "改卷内幕", "替考试", "隐形耳机", "出售答案", "考中答案", "答an", "da案", "资金周转", "救市", "股市圈钱", "崩盘", "资金短缺", "证监会", "质押贷款", "小额贷款", "周小川", "刘明康", "尚福林", "孔丹", "汉芯造假", "杨树宽", "中印边界谈判结果", "喂奶门", "摸nai门", "酒瓶门", "脱裤门", "75事件", "乌鲁木齐", "新疆骚乱", "针刺", "打针", "食堂涨价", "饭菜涨价", "h1n1", "瘟疫爆发", "yangjia", "y佳", "yang佳", "杨佳", "杨j", "袭警", "杀警", "武侯祠", "川b26931", "贺立旗", "周正毅", "px项目", "骂四川", "家l福", "家le福", "加了服", "麦当劳被砸", "豆腐渣", "这不是天灾", "龙小霞", "震其国土", "yuce", "提前预测", "地震预测", "隐瞒地震", "李四光预测", "蟾蜍迁徙", "地震来得更猛烈", "八级地震毫无预报", "踩踏事故", "聂树斌", "万里大造林", "陈相贵", "张丹红", "尹方明", "李树菲", "王奉友", "零八奥运艰", "惨奥", "奥晕", "凹晕", "懊运", "懊孕", "奥孕", "奥你妈的运", "反奥", "628事件", "weng安", "wengan", "翁安", "瓮安事件", "化工厂爆炸", "讨回工资", "代办发票", "代办各", "代办文", "代办学", "代办制", "代辦", "代表烦", "代开发票", "代開", "代考", "代理发票", "代理票据", "代您考", "代讨债", "代写毕", "代写论文", "代孕", "代追债", "考后付款", "考机构", "考考邓", "考联盟", "考前答案", "考前付", "考前密卷", "考前预测", "考试,答案", "考试,作弊器", "考试包过", "考试保", "考试答案", "考试机构", "考试联盟", "考试枪", "考试作弊", "考试作弊器", "考研考中", "考中答案", "透视功能", "透视镜", "透视扑", "透视器", "透视眼睛", "透视眼镜", "透视药", "透视仪", "打死经过", "打死人", "打砸办公", "打砸抢", "安眠酮", "代血浆", "普萘洛尔", "呋塞米", "西布曲明", "testosterone", "胰岛素样生长因子", "促红细胞生成素", "地西泮", "尼可刹米", "甲睾酮", "adrenaline", "erythropoietin", "地奈德", "莫达非尼", "氯噻嗪", "苯巴比妥", "促性腺激素", "泼尼松", "麻黄草", "雄烯二醇", "地塞米松", "tamoxifen", "strychnine", "androst", "新型毒品", "杜冷丁", "兴奋剂", "mdma", "海洛因", "海luo因", "heroin", "diamorphine", "diacetylmorphine", "鸦片", "阿芙蓉", "咖啡因", "cocain", "三唑仑", "美沙酮", "麻古", "k粉", "凯他敏", "ketamine", "冰毒", "苯丙胺", "cannabis", "大麻", "爱他死", "氯胺酮", "benzodiazepines", "甲基安非他明", "安非他命", "吗啡", "KC短信", "KC嘉年华", "短信广告", "短信群发", "短信群发器", "小6灵通", "短信商务广告", "段录定", "无界浏览", "无界浏览器", "无界", "无网界", "无网界浏览", "无帮国", "KC提示", "KC网站", "UP8新势力", "白皮书", "UP新势力", "移民", "易达网络卡", "安魂网", "罢工", "罢课", "纽崔莱七折", "手机复制", "手机铃声", "网关", "神通加持法", "全1球通", "如6意通", "清仓", "灵动卡", "答案卫星接收机", "高薪养廉", "考后付款", "佳静安定片", "航空母舰", "航空售票", "号码百事通", "考前发放", "成本价", "诚信通手机商城", "高利贷", "联4通", "黑庄", "黑手党", "黑车", "联通贵宾卡", "联总", "联总这声传单", "联总之声传单", "高息贷款", "高干子弟", "恭喜你的号码", "恭喜您的号码", "高干子女", "各个银行全称", "各种发票", "高官", "高官互调", "高官子女", "喝一送一", "卡号", "复制", "监听王", "传单", "旦科", "钓鱼岛", "钓鱼台", "当官靠后台", "党校安插亲信", "传九促三", "客户端非法字符", "刻章", "大麻树脂", "大麻油", "大法", "大法弟子", "dpp大法", "fa lun", "falu", "发抡", "发抡功", "洗脑", "下法轮", "发轮", "发伦", "发伦功", "发仑", "发沦", "发纶", "发论", "发论功", "发论公", "发正念", "发囵", "发愣", "发瞟", "罚抡", "罚伦", "罚仑", "罚沦", "罚纶", "罚囵", "筏抡", "筏轮", "筏伦", "筏仑", "筏沦", "筏纶", "筏论", "筏囵", "伐抡", "伐轮", "伐伦", "伐仑", "伐沦", "伐论", "伐囵", "乏抡", "乏轮", "乏伦", "乏仑", "乏沦", "乏纶", "乏论", "乏囵", "阀抡", "阀伦", "阀仑", "阀沦", "阀纶", "阀论", "阀囵", "法 轮 功", "法*功", "法.轮.功", "法L功", "法lun功", "法功", "法会", "法抡", "法抡功", "法轮", "法轮大法", "法轮佛法", "法轮功", "法伦", "法仑", "法沦", "法纶", "法论", "法十轮十功", "法西斯", "法院", "法正", "法谪", "法谪功", "法輪", "法囵", "法愣", "珐.輪功", "珐抡", "珐轮", "珐伦", "珐仑", "珐沦", "五不", "五不争鸣论坛", "五出三进", "五套功法", "邝锦文", "垡抡", "垡轮", "垡伦", "垡仑", "垡沦", "垡纶", "垡论", "垡囵", "茳澤民", "荭志", "闳志", "闵维方", "氵去", "氵去车仑工力", "转法轮", "砝抡", "砝轮", "砝伦", "砝仑", "砝沦", "砝纶", "真、善、忍", "真理教", "真善美", "真善忍", "砝论", "砝囵", "泓志", "屙民", "珐纶", "珐论", "珐囵", "falun", "Falundafa", "fa轮", "Flg", "弟子", "地下教会", "炼功", "梦网洪志", "轮大", "抡功", "轮功", "伦功", "摩门教", "三水法轮", "三唑仑", "天皇", "天怒", "天葬", "车臣", "达赖", "功法", "讲法", "基督", "基督教", "护法", "回教", "教徒", "功友", "大师", "达赖喇嘛", "虹志", "鸿志", "洪传", "贯通两极法", "光祖", "洪吟", "洪哲胜", "洪志", "宏法", "观世音", "宏志", "弘志", "古兰经", "红志", "车库", "车仑", "经文", "穴海", "协警", "纳米比亚", "专业调查", "有华龙", "jq的来", "电信路", "第一夫人", "党鞭", "黄巨", "荡尽天下", "家元自称玉皇大帝", "主席李世民", "何祚庥", "刘刚", "不要沉默", "后勤集团", "食堂涨价", "发国难财", "浪漫邂逅", "红满堂", "张小洋", "炸学校", "子宫", "叫晶晶的女孩", "回派", "社会黑暗", "国之母", "国母", "国姆", "东方微点", "震惊全球", "nowto", "chengdu", "徐明", "六月飞雪", "暴力虐待", "暴力袭击", "天府广场", "粮荒", "洗脑班", "李愚蠢", "中国猪", "台湾猪", "进化不完全的生命体", "震死他们", "", "10010", "10086", "10159", "13423205670", "13725516608", "13875448369", "15112886328", "189", "6-4tianwang", "64", "68170802", "6a6.net", "7.31", "7.310", "89-64cdjp", "8945212", "23条", "259o", "381929279", "3P", "4-Jun", "AV", "BJ", "CBD", "CCTV", "CDMA", "DICK", "Dick", "FLG", "FOCUSC", "FUCK", "Fuck", "GAMEMASTER", "GCD", "GameMaster", "IP17908", "KEY_TEXT", "NMD", "QQb", "SM", "Soccer01.com", "TMD", "UltraSurf", "bignews", "Bitch", "boxun", "Chinaliberal", "chinamz", "Chinesenewsnet", "cnd", "Creaders", "dafa", "Dajiyuan", "df'd", "Dfdz", "die", "dpp", "Freechina", "freedom", "Freenet", "fuck", "fuck your mother", "hongzhi", "hrichina", "huanet", "hypermart.net", "incest", "jiangdongriji", "l2590803027", "lihongzhi", "ma", "making", "minghui", "minghuinews", "nacb", "na?ve", "nmis", "paper64", "peacehall", "piao", "playboy", "renminbao", "renmingbao", "rfa", "safeweb", "sex", "shit", "simple", "svdc", "taip", "tibetalk", "triangle", "triangleboy", "txwq.net", "unixbox", "ustibet", "voa", "voachinese", "wangce", "wstaiji", "www", "xinsheng", "yuming", "yy通讯录", "zhengjian", "zhengjianwang", "zhenshanren", "zhuanfalu", "zhuanfalun", "八九", "八老", "爱女人", "爱液", "按摩棒", "拔出来", "爆草", "包二奶", "暴干", "暴奸", "暴乳", "爆乳", "暴淫", "屄", "被操", "被插", "被干", "逼奸", "仓井空", "插暴", "操逼", "操黑", "操烂", "肏你", "肏死", "操死", "操我", "厕奴", "插比", "插b", "插逼", "插进", "插你", "插我", "插阴", "潮吹", "潮喷", "成人dv", "成人电影", "成人论坛", "成人小说", "成人电", "成人电影", "成人卡通", "成人聊", "成人片", "成人视", "成人图", "成人文", "成人小", "成人电影", "成人论坛", "成人色情", "成人网站", "成人文学", "成人小说", "艳情小说", "成人游戏", "吃精", "赤裸", "抽插", "扌由插", "抽一插", "春药", "大波", "大力抽送", "大乳", "荡妇", "荡女", "盗撮", "多人轮", "发浪", "放尿", "肥逼", "粉穴", "封面女郎", "风月大陆", "干死你", "干穴", "肛交", "肛门", "龟头", "裹本", "国产av", "好嫩", "豪乳", "黑逼", "后庭", "后穴", "虎骑", "花花公子", "换妻俱乐部", "黄片", "几吧", "鸡吧", "鸡巴", "鸡奸", "寂寞男", "寂寞女", "妓女", "激情", "集体淫", "奸情", "叫床", "脚交", "金鳞岂是池中物", "金麟岂是池中物", "精液", "就去日", "巨屌", "菊花洞", "菊门", "巨奶", "巨乳", "菊穴", "开苞", "口爆", "口活", "口交", "口射", "口淫", "裤袜", "狂操", "狂插", "浪逼", "浪妇", "浪叫", "浪女", "狼友", "聊性", "流淫", "铃木麻", "凌辱", "漏乳", "露b", "乱交", "乱伦", "轮暴", "轮操", "轮奸", "裸陪", "买春", "美逼", "美少妇", "美乳", "美腿", "美穴", "美幼", "秘唇", "迷奸", "密穴", "蜜穴", "蜜液", "摸奶", "摸胸", "母奸", "奈美", "奶子", "男奴", "内射", "嫩逼", "嫩女", "嫩穴", "捏弄", "女优", "炮友", "砲友", "喷精", "屁眼", "品香堂", "前凸后翘", "强jian", "强暴", "强奸处女", "情趣用品", "情色", "拳交", "全裸", "群交", "惹火身材", "人妻", "人兽", "日逼", "日烂", "肉棒", "肉逼", "肉唇", "肉洞", "肉缝", "肉棍", "肉茎", "肉具", "揉乳", "肉穴", "肉欲", "乳爆", "乳房", "乳沟", "乳交", "乳头", "三级片", "骚逼", "骚比", "骚女", "骚水", "骚穴", "色逼", "色界", "色猫", "色盟", "色情网站", "色区", "色色", "色诱", "色欲", "色b", "少年阿宾", "少修正", "射爽", "射颜", "食精", "释欲", "兽奸", "兽交", "手淫", "兽欲", "熟妇", "熟母", "熟女", "爽片", "爽死我了", "双臀", "死逼", "丝袜", "丝诱", "松岛枫", "酥痒", "汤加丽", "套弄", "体奸", "体位", "舔脚", "舔阴", "调教", "偷欢", "偷拍", "推油", "脱内裤", "文做", "我就色", "无码", "舞女", "无修正", "吸精", "夏川纯", "相奸", "小逼", "校鸡", "小穴", "小xue", "写真", "性感妖娆", "性感诱惑", "性虎", "性饥渴", "性技巧", "性交", "性奴", "性虐", "性息", "性欲", "胸推", "穴口", "学生妹", "穴图", "亚情", "颜射", "阳具", "杨思敏", "要射了", "夜勤病栋", "一本道", "一夜欢", "一夜情", "一ye情", "阴部", "淫虫", "阴唇", "淫荡", "阴道", "淫电影", "阴阜", "淫妇", "淫河", "阴核", "阴户", "淫贱", "淫叫", "淫教师", "阴茎", "阴精", "淫浪", "淫媚", "淫糜", "淫魔", "淫母", "淫女", "淫虐", "淫妻", "淫情", "淫色", "淫声浪语", "淫兽学园", "淫书", "淫术炼金士", "淫水", "淫娃", "淫威", "淫亵", "淫样", "淫液", "淫照", "阴b", "应召", "幼交", "幼男", "幼女", "欲火", "欲女", "玉女心经", "玉蒲团", "玉乳", "欲仙欲死", "玉穴", "援交", "原味内衣", "援助交际", "张筱雨", "招鸡", "招妓", "中年美妇", "抓胸", "自拍", "自慰", "作爱", "18禁", "99bb", "a4u", "a4y", "adult", "amateur", "anal", "a片", "fuck", "gay片", "g点", "g片", "hardcore", "h动画", "h动漫", "incest", "porn", "secom", "sexinsex", "sm女王", "xiao77", "xing伴侣", "tokyohot", "yin荡", "贱人", "装b", "大sb", "傻逼", "傻b", "煞逼", "煞笔", "刹笔", "傻比", "沙比", "欠干", "婊子养的", "我日你", "我操", "我草", "卧艹", "卧槽", "爆你菊", "艹你", "cao你", "你他妈", "真他妈", "别他吗", "草你吗", "草你丫", "操你妈", "擦你妈", "操你娘", "操他妈", "日你妈", "干你妈", "干你娘", "娘西皮", "狗操", "狗草", "狗杂种", "狗日的", "操你祖宗", "操你全家", "操你大爷", "妈逼", "你麻痹", "麻痹的", "妈了个逼", "马勒", "狗娘养", "贱比", "贱b", "下贱", "死全家", "全家死光", "全家不得好死", "全家死绝", "白痴", "无耻", "sb", "杀b", "你吗b", "你妈的", "婊子", "贱货", "人渣", "混蛋", "媚外", "和弦", "兼职", "限量", "铃声", "性伴侣", "男公关", "火辣", "精子", "射精", "诱奸", "强奸", "做爱", "性爱", "发生关系", "按摩", "快感", "处男", "猛男", "少妇", "屌", "屁股", "下体", "a片", "内裤", "浑圆", "咪咪", "发情", "刺激", "白嫩", "粉嫩", "兽性", "风骚", "呻吟", "sm", "阉割", "高潮", "裸露", "不穿", "一丝不挂", "脱光", "干你", "干死", "我干", "裙中性运动", "乱奸", "乱伦", "乱伦类", "乱伦小", "伦理大", "伦理电影", "伦理毛", "伦理片", "裸聊", "裸聊网", "裸体写真", "裸舞视", "裸照", "美女裸体", "美女写真", "美女上门", "美艳少妇", "妹按摩", "妹上门", "迷幻药", "迷幻藥", "迷昏口", "迷昏药", "迷昏藥", "迷魂香", "迷魂药", "迷魂藥", "迷奸粉", "迷奸药", "迷情粉", "迷情水", "迷情药", "迷药", "迷藥", "谜奸药", "骚妇", "骚货", "骚浪", "骚女", "骚嘴", "色电影", "色妹妹", "色情表演", "色情电影", "色情服务", "色情图片", "色情小说", "色情影片", "色情表演", "色情电影", "色情服务", "色情片", "色视频", "色小说", "性伴侣", "性服务", "性福情", "性感少", "性伙伴", "性交", "性交视频", "性交图片", "性奴", "性奴集中营", "性虐", "阴唇", "阴道", "阴蒂", "阴户", "阴间来电", "阴茎", "阴茎增大", "阴茎助勃", "阴毛", "陰唇", "陰道", "陰戶", "淫荡", "淫荡美女", "淫荡视频", "淫荡照片", "淫乱", "淫靡", "淫魔", "淫魔舞", "淫女", "淫情女", "淫肉", "淫騷妹", "淫兽", "淫兽学", "淫水", "淫穴", "morphine", "摇头丸", "迷药", "乖乖粉", "narcotic", "麻醉药", "精神药品", "爱女人", "爱液", "按摩棒", "拔出来", "爆草", "包二奶", "暴干", "暴奸", "暴乳", "爆乳", "暴淫", "屄", "被操", "被插", "被干", "逼奸", "仓井空", "插暴", "操逼", "操黑", "操烂", "肏你", "肏死", "操死", "操我", "厕奴", "插比", "插b", "插逼", "插进", "插你", "插我", "插阴", "潮吹", "潮喷", "成人电影", "成人论坛", "成人色情", "成人网站", "成人文学", "成人小说", "艳情小说", "成人游戏", "吃精", "赤裸", "抽插", "扌由插", "抽一插", "春药", "大波", "大力抽送", "大乳", "荡妇", "荡女", "盗撮", "多人轮", "发浪", "放尿", "肥逼", "粉穴", "封面女郎", "风月大陆", "干死你", "干穴", "肛交", "肛门", "龟头", "裹本", "国产av", "好嫩", "豪乳", "黑逼", "后庭", "后穴", "虎骑", "花花公子", "换妻俱乐部", "黄片", "几吧", "鸡吧", "鸡巴", "鸡奸", "寂寞男", "寂寞女", "妓女", "激情", "集体淫", "奸情", "叫床", "脚交", "金鳞岂是池中物", "金麟岂是池中物", "精液", "就去日", "巨屌", "菊花洞", "菊门", "巨奶", "巨乳", "菊穴", "开苞", "口爆", "口活", "口交", "口射", "口淫", "裤袜", "狂操", "狂插", "浪逼", "浪妇", "浪叫", "浪女", "狼友", "聊性", "流淫", "铃木麻", "凌辱", "漏乳", "露b", "乱交", "乱伦", "轮暴", "轮操", "轮奸", "裸陪", "买春", "美逼", "美少妇", "美乳", "美腿", "美穴", "美幼", "秘唇", "迷奸", "密穴", "蜜穴", "蜜液", "摸奶", "摸胸", "母奸", "奈美", "奶子", "男奴", "内射", "嫩逼", "嫩女", "嫩穴", "捏弄", "女优", "炮友", "砲友", "喷精", "屁眼", "品香堂", "前凸后翘", "强jian", "强暴", "强奸处女", "情趣用品", "情色", "拳交", "全裸", "群交", "惹火身材", "人妻", "人兽", "日逼", "日烂", "肉棒", "肉逼", "肉唇", "肉洞", "肉缝", "肉棍", "肉茎", "肉具", "揉乳", "肉穴", "肉欲", "乳爆", "乳房", "乳沟", "乳交", "乳头", "三级片", "骚逼", "骚比", "骚女", "骚水", "骚穴", "色逼", "色界", "色猫", "色盟", "色情网站", "色区", "色色", "色诱", "色欲", "色b", "少年阿宾", "少修正", "射爽", "射颜", "食精", "释欲", "兽奸", "兽交", "手淫", "兽欲", "熟妇", "熟母", "熟女", "爽片", "爽死我了", "双臀", "死逼", "丝袜", "丝诱", "松岛枫", "酥痒", "汤加丽", "套弄", "体奸", "体位", "舔脚", "舔阴", "调教", "偷欢", "偷拍", "推油", "脱内裤", "文做", "我就色", "无码", "舞女", "无修正", "吸精", "夏川纯", "相奸", "小逼", "校鸡", "小穴", "小xue", "写真", "性感妖娆", "性感诱惑", "性虎", "性饥渴", "性技巧", "性交", "性奴", "性虐", "性息", "性欲", "胸推", "穴口", "学生妹", "穴图", "亚情", "颜射", "阳具", "杨思敏", "要射了", "夜勤病栋", "一本道", "一夜欢", "一夜情", "一ye情", "阴部", "淫虫", "阴唇", "淫荡", "阴道", "淫电影", "阴阜", "淫妇", "淫河", "阴核", "阴户", "淫贱", "淫叫", "淫教师", "阴茎", "阴精", "淫浪", "淫媚", "淫糜", "淫魔", "淫母", "淫女", "淫虐", "淫妻", "淫情", "淫色", "淫声浪语", "淫兽学园", "淫书", "淫术炼金士", "淫水", "淫娃", "淫威", "淫亵", "淫样", "淫液", "淫照", "阴b", "应召", "幼交", "幼男", "幼女", "欲火", "欲女", "玉女心经", "玉蒲团", "玉乳", "欲仙欲死", "玉穴", "援交", "原味内衣", "援助交际", "张筱雨", "招鸡", "招妓", "中年美妇", "抓胸", "自拍", "自慰", "作爱", "18禁", "99bb", "a4u", "a4y", "adult", "amateur", "anal", "a片", "fuck", "gay片", "g点", "g片", "hardcore", "h动画", "h动漫", "incest", "porn", "secom", "sexinsex", "sm女王", "xiao77", "xing伴侣", "tokyohot", "yin荡", "腐败", "贪污", "gcd", "共贪党", "gongchandang", "阿共", "共一产一党", "产党共", "公产党", "工产党", "共c党", "共x党", "共铲", "供产", "共惨", "供铲党", "供铲谠", "供铲裆", "共残党", "共残主义", "共产主义的幽灵", "拱铲", "老共", "中珙", "中gong", "gc党", "贡挡", "gong党", "g产", "狗产蛋", "共残裆", "恶党", "邪党", "共产专制", "共产王朝", "裆中央", "土共", "土g", "共狗", "g匪", "共匪", "仇共", "共产党", "共产党腐败", "共产党专制", "共产党的报应", "共产党的末日", "共产党专制", "communistparty", "症腐", "政腐", "政付", "正府", "政俯", "政f", "zhengfu", "政zhi", "挡中央", "档中央", "中国zf", "中央zf", "国wu院", "中华帝国", "gong和", "大陆官方", "北京政权", "刘志军", "张曙", "刘志军", "买别墅", "玩女人", "贪20亿", "许宗衡", "贪财物", "李启红", "贪腐财富", "落马", "高官名单", "陈希同", "贪污", "玩忽职守", "有期徒刑", "陈良宇", "受贿罪", "滥用职权", "有期徒刑", "没收个人财产", "成克杰", "死刑", "程维高", "严重违纪", "开除党籍", "撤销职务", "刘方仁", "无期徒刑", "倪献策", "徇私舞弊", "梁湘", "以权谋私", "撤职。", "李嘉廷", "死刑缓期", "张国光", "韩桂芝", "宋平顺", "自杀", "黄瑶", "双规", "陈绍基", "判处死刑", "剥夺政治权利终身", "没收个人全部财产", "石兆彬", "侯伍杰", "王昭耀", "剥夺政治权利", "杜世成", "沈图", "叛逃美国", "罗云光", "起诉", "张辛泰", "李效时", "边少斌", "徐鹏航", "违纪", "收受股票", "王乐毅", "李纪周", "郑光迪", "田凤山。", "邱晓华", "郑筱萸", "孙鹤龄", "蓝田造假案", "于幼军", "留党察看", "何洪达", "朱志刚", "杨汇泉", "官僚主义", "徐炳松", "托乎提沙比尔", "王宝森", "经济犯罪", "畏罪自杀。", "陈水文", "孟庆平", "胡长清", "朱川", "许运鸿", "丘广钟", "刘知炳", "丛福奎", "王怀忠", "巨额财产", "来源不明罪", "李达昌", "刘长贵", "王钟麓", "阿曼哈吉", "付晓光", "自动辞", "刘克田", "吕德彬", "刘维明", "双开", "刘志华", "孙瑜", "李堂堂", "韩福才 青海", "欧阳德 广东", "韦泽芳 海南", "铁英 北京", "辛业江 海南", "于飞 广东", "姜殿武 河北", "秦昌典 重庆", "范广举 黑龙江", "张凯广东", "王厚宏海南", "陈维席安徽", "王有杰河南", "王武龙江苏", "米凤君吉林", "宋勇辽宁", "张家盟浙江", "马烈孙宁夏", "黄纪诚北京", "常征贵州", "王式惠重庆", "周文吉", "王庆录广西", "潘广田山东", "朱作勇甘肃", "孙善武河南", "宋晨光江西", "梁春禄广西政协", "鲁家善 中国交通", "金德琴 中信", "李大强 神华", "吴文英 纺织", "查克明 华能", "朱小华光大", "高严 国家电力", "王雪冰", "林孔兴", "刘金宝", "张恩照", "陈同海", "康日新", "王益", "张春江", "洪清源", "平义杰", "李恩潮", "孙小虹", "陈忠", "慕绥新", "田凤岐", "麦崇楷", "柴王群", "吴振汉", "张秋阳", "徐衍东", "徐发 黑龙江", "张宗海", "丁鑫发", "徐国健", "李宝金", "单平", "段义和", "荆福生", "陈少勇", "黄松有", "皮黔生", "王华元", "王守业", "刘连昆", "孙晋美", "邵松高", "肖怀枢", "刘广智 空军", "姬胜德 总参", "廖伯年 北京"];
//       var result = {};
//       var count = wordList.length;
//       // 遍历单词
//       for (var i = 0; i < count; ++i) {
//           var map = result;
//           var word = wordList[i];
//           var wordLength = word.length;
//           // 遍历单词的每个字母
//           for (var j = 0; j < wordLength; ++j) {
//               var ch = word.charAt(j);
//               var stateInfo = map[ch];
//               if (stateInfo == null) {
//                   stateInfo = {};
//                   map[ch] = stateInfo;
//               }
//               // 如果是最后一个字母，设置一个完结标识
//               if (j == wordLength - 1) {
//                   stateInfo["isFinish"] = true;
//               }
//               else {
//                   map = stateInfo;
//               }
//           }
//       }
//       return result;
//   }

//   // 找出 content 中的敏感词，会返回一个包含敏感词的列表
//   export function wordCheck (content, isGetWords?):any {
//       let map = _checkWordMap || _wordBuildMap();
//       var result = [];
//       var count = content.length;
//       var stack = [];
//       var point = map;
//       // 用于标记找到关键词的标记
//       var isFound = false;
//       var foundStack = null;
//       for (var i = 0; i < count; ++i) {
//           var ch = content.charAt(i);
//           var item = point[ch];
//           // 如果没找到则复位，让主循环
//           if (item == null) {
//               if (isFound) {
//                   isFound = false;
//                   i = i - (stack.length - foundStack.length + 1); // 计算回退距离
//                   if (isGetWords){
//                     result.push(foundStack.join("")); // 把单个的字母数组连成一串字符串    
//                   }else
//                     return false;
//               }
//               else {
//                   i = i - stack.length; // 计算回退距离
//               }
//               stack = []; // 清空字符堆栈
//               point = map;
//           }
//           else if (item["isFinish"]) {
//               stack.push(ch);
//               point = item;
//               // 标记找到了目标词
//               isFound = true;
//               foundStack = stack.concat(); // 复制数组
//           }
//           else {
//               stack.push(ch);
//               point = item;
//           }
//       }
//       if (isGetWords){
//         // 这里还要补充检查
//         if (isFound) {
//             result.push(foundStack.join("")); // 把单个的字母数组连成一串字符串
//         }          
//         return result;
//       }else
//         return !isFound;
//   }
//   Utils.wordCheck     = wordCheck;

//   // 替换 str 中的敏感词为 replaceStr, step 为筛选强度， 最小为 0，最大为 5
//   export function  wordFilter  (str, replaceStr, step=5) {
//       if (str == undefined) {
//           return "";
//       }
//       if (step > 5) {
//           step = 5;
//       }else if (step < 0) {
//           step = 0;
//       }
//       for (var j = 0; j < step; j++) {
//           var result = wordCheck(str, true);
//           var len = result.length;
//           if (len == 0) {
//               break;
//           }
//           // 排序结果，长度长的在前面
//           result.sort(function (a, b) {
//               return b.length - a.length
//           });
//           for (var i = 0; i < len; i++) {
//               str = str.replace(result[i], replaceStr);
//           }
//       }
//       return str;
//   }
//   Utils.wordFilter     = wordFilter;

//export = Utils;
// }.call(this));


export function defineProperty<T=any>(getter?:(v:T)=>T, setter?:(v:T, pre:T)=>T) {
    return function (target: any, propertyKey: string) {
        let key = Symbol(propertyKey) // `__${propertyKey}`
        target[key] = target[propertyKey]
        delete target[propertyKey]
        Object.defineProperty(target, propertyKey, {
            get:  ()=> {
                let v = target[key]
                if (getter) v = getter.call(target, v)
                return v
            },
            set:  (v)=> {
                if (setter) v = setter.call(target, v, target[key])
                target[key] = v
                console.log(`set ${propertyKey}  = ${v}`)
            },
            enumerable: true,
            configurable: true
        });
        // console.log('--------------', target , propertyKey);
    };
}

// type Constructor<T> = new (...args: any[]) => T
// // declare function mixClass<T1, T2>(c1:Constructor<T1>, c2:Constructor<T2>): Constructor<T1 & T2>;
// declare function mixClass<T1, T2, T3={}, T4={}, T5={}>(c1: Constructor<T1>, c2: Constructor<T2>, c3: Constructor<T2>, c4: Constructor<T2>, c5: Constructor<T2>): Constructor<T1 & T2 & T3 & T4 & T5>;


