"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const https = require("https");
const qs = require("querystring");
const url = require("url");
class Request {
    static get(uri, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield this.request(Object.assign(opts, { method: 'GET', uri }));
            return content.toString();
        });
    }
    static get_json(uri, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield this.request(Object.assign(opts, { method: 'GET', uri, parseJson: true }));
            return JSON.parse(content.toString());
        });
    }
    static post(uri, postData, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield this.request(Object.assign(opts, { method: 'POST', uri, postData }));
            return content.toString();
        });
    }
    static post_json(uri, postData, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield this.request(Object.assign(opts, { method: 'POST', uri, postData, parseJson: true }));
            return JSON.parse(content.toString());
        });
    }
    static request(opts) {
        const url_data = url.parse(opts.uri);
        opts.query = Object.assign(qs.parse(url_data.query || ''), opts.query || {});
        url_data.search = qs.stringify(opts.query);
        opts.uri = url.format(url_data);
        //判断类型 http 还是 https
        let httpORs;
        if (url_data.protocol === 'http:') {
            httpORs = http;
        }
        else if (url_data.protocol === 'https:') {
            httpORs = https;
        }
        else {
            throw new Error(`请求的uri必须是http://或者https://开头,传入的[${opts.uri}]不能识别`);
        }
        return new Promise((resolve, reject) => {
            const req = httpORs.request(opts.uri, Object.assign({}, opts.other || {}, opts.auth ? { auth: `${opts.auth.user}:${opts.auth.pass}` } : {}, {
                method: opts.method,
                headers: Object.assign({
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
                }, opts.headers, opts.cookies ? { Cookie: opts.cookies.stringify() } : {}),
            }), (res) => __awaiter(this, void 0, void 0, function* () {
                if (opts.debug) {
                    console.log(res);
                }
                if (opts.cookies && res.headers['set-cookie']) {
                    opts.cookies.setRaw(res.headers['set-cookie']);
                }
                if (res.statusCode === 301 || res.statusCode === 302) { //返回跳转
                    let jumpUri = null;
                    if (res.headers.location && /https?:\/\//.test(res.headers.location)) {
                        jumpUri = res.headers.location;
                    }
                    else if (res.headers.location) {
                        jumpUri = `${url_data.protocol}//${url_data.host}${res.headers.location}`;
                    }
                    else {
                        throw new Error(`${res.statusCode}跳转,但是并未发现location`);
                    }
                    console.info(`请求[${opts.uri}]返回${res.statusCode}跳转到[${jumpUri}]`);
                    resolve(yield this.request(Object.assign({}, opts, {
                        uri: jumpUri,
                        query: {}
                    })));
                }
                else if (res.statusCode == 200 || (res.statusCode && opts.allowCode && opts.allowCode.includes(res.statusCode))) { // 返回200
                    let rawData = Buffer.alloc(0);
                    res.on('data', (chunk) => { rawData = Buffer.concat([rawData, chunk]); });
                    res.on('end', () => {
                        resolve(rawData);
                    });
                }
                else { //错误代码
                    reject(Object.assign(new Error(`返回的httpCode为${res.statusCode}`), { code: res.statusCode }));
                }
            })).on('error', e => {
                e.message = `请求[${opts.uri}]失败 ` + e.message;
                reject(e);
            });
            if (opts.method === 'POST') {
                const postRaw = Buffer.from(JSON.stringify(opts.postData));
                req.setHeader('Content-Type', 'application/json');
                req.setHeader('Content-Length', postRaw.length);
                req.write(postRaw);
            }
            req.end();
        });
    }
}
exports.Request = Request;
class Cookies {
    constructor(rows = {}) {
        this.rows = {};
        this.rows_text = '';
        Object.assign(this.rows, rows);
        this.refreshText();
    }
    refreshText() {
        this.rows_text = '';
        for (let name in this.rows) {
            this.rows_text += name + '=' + this.rows[name].toString() + '; ';
        }
        return this.rows_text;
    }
    stringify() {
        return this.rows_text;
    }
    dump() {
        return Object.assign({}, this.rows);
    }
    setRaw(setCookies) {
        if (typeof setCookies == 'string') {
            setCookies = [setCookies];
        }
        for (let oneSet of setCookies) {
            const cookie_match = oneSet.match(/^([^=]+)=([^;]+)/);
            if (cookie_match) {
                const key = cookie_match[1].trim();
                const val = cookie_match[2].trim();
                Object.assign(this.rows, { [key]: val });
            }
        }
        this.refreshText();
    }
    set(key, val) {
        Object.assign(this.rows, { [key]: val });
        this.refreshText();
    }
    sets(keyVals) {
        Object.assign(this.rows, keyVals);
        this.refreshText();
    }
    get(key) {
        if (this.rows[key] === undefined) {
            throw Object.assign(new Error(`Cookies中没有找到${key}`), { cookies: this.rows });
        }
        return this.rows[key];
    }
}
exports.Cookies = Cookies;
//# sourceMappingURL=app.js.map