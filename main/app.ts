import http = require('http')
import https = require('https')
import qs = require('querystring')
import url = require('url')

type stringQuery = { [x: string]: string }
type baseQuery = { [x: string]: string | number }
type superQuery = { [x: string]: string | number | superQuery }

interface request_opts {
    method: 'GET' | 'POST',
    uri: string
    query?: baseQuery
    postData?: superQuery

    parseJson?: boolean
    cookies?: Cookies
    headers?: baseQuery

    auth?: {
        user: string
        pass: string
    }

    debug?: boolean
    allowCode?: number[],
    other?: http.RequestOptions | https.RequestOptions
}

export class Request {

    static async get(uri: string, opts: { [x in keyof request_opts]?: request_opts[x] } = {}) {
        const content = await this.request(Object.assign(opts, { method: 'GET', uri }))
        return content.toString()
    }

    static async get_json<T extends Object>(uri: string, opts: { [x in keyof request_opts]?: request_opts[x] } = {}) {
        const content = await this.request(Object.assign(opts, { method: 'GET', uri, parseJson: true })) as any as Promise<T>
        return JSON.parse(content.toString())
    }

    static async post(uri: string, postData: superQuery, opts: { [x in keyof request_opts]?: request_opts[x] } = {}) {
        const content = await this.request(Object.assign(opts, { method: 'POST', uri, postData }))
        return content.toString()
    }

    static async post_json<T extends Object>(uri: string, postData: superQuery, opts: { [x in keyof request_opts]?: request_opts[x] } = {}) {
        const content = await this.request(Object.assign(opts, { method: 'POST', uri, postData, parseJson: true })) as any as Promise<T>
        return JSON.parse(content.toString())
    }

    static request(opts: request_opts) {
        const url_data = url.parse(opts.uri)
        opts.query = Object.assign(qs.parse(url_data.query || ''), opts.query || {})
        url_data.search = qs.stringify(opts.query)
        opts.uri = url.format(url_data)
        //判断类型 http 还是 https
        let httpORs: (typeof http | typeof https)
        if (url_data.protocol === 'http:') {
            httpORs = http
        } else if (url_data.protocol === 'https:') {
            httpORs = https
        } else {
            throw new Error(`请求的uri必须是http://或者https://开头,传入的[${opts.uri}]不能识别`)
        }

        return new Promise<Buffer>((resolve, reject) => {
            const req = httpORs.request(opts.uri, Object.assign(
                {},
                opts.other || {},
                opts.auth ? { auth: `${opts.auth.user}:${opts.auth.pass}` } : {},
                {
                    method: opts.method,
                    headers: Object.assign(
                        {
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
                        },
                        opts.headers,
                        opts.cookies ? { Cookie: opts.cookies.stringify() } : {}
                    ),
                }
            ), async (res) => {
                if (opts.debug) {
                    console.log(res)
                }
                if (opts.cookies && res.headers['set-cookie']) {
                    opts.cookies.setRaw(res.headers['set-cookie'])
                }
                if (res.statusCode === 301 || res.statusCode === 302) { //返回跳转
                    let jumpUri = null
                    if (res.headers.location && /https?:\/\//.test(res.headers.location)) {
                        jumpUri = res.headers.location
                    } else if (res.headers.location) {
                        jumpUri = `${url_data.protocol}//${url_data.host}${res.headers.location}`
                    } else {
                        throw new Error(`${res.statusCode}跳转,但是并未发现location`)
                    }
                    console.info(`请求[${opts.uri}]返回${res.statusCode}跳转到[${jumpUri}]`)
                    resolve(await this.request(Object.assign({}, opts, {
                        uri: jumpUri,
                        query: {}
                    })))
                } else if (
                    res.statusCode == 200 || (
                        res.statusCode && opts.allowCode && opts.allowCode.includes(res.statusCode)
                    )
                ) { // 返回200
                    let rawData = Buffer.alloc(0);
                    res.on('data', (chunk) => { rawData = Buffer.concat([rawData, chunk]) });
                    res.on('end', () => {
                        resolve(rawData)
                    })
                } else { //错误代码
                    reject(Object.assign(
                        new Error(`返回的httpCode为${res.statusCode}`),
                        { code: res.statusCode }
                    ))
                }
            }).on('error', e => {
                e.message = `请求[${opts.uri}]失败 ` + e.message
                reject(e)
            })
            if (opts.method === 'POST') {
                const postRaw = Buffer.from(JSON.stringify(opts.postData))
                req.setHeader('Content-Type', 'application/json')
                req.setHeader('Content-Length', postRaw.length)
                req.write(postRaw)
            }
            req.end()
        })
    }

}

export class Cookies {
    private rows: stringQuery = {}
    private rows_text = ''
    private refreshText() {
        this.rows_text = ''
        for (let name in this.rows) {
            this.rows_text += name + '=' + this.rows[name].toString() + '; '
        }
        return this.rows_text
    }
    constructor(rows: stringQuery = {}) {
        Object.assign(this.rows, rows)
        this.refreshText()
    }
    stringify() {
        return this.rows_text
    }
    dump() {
        return Object.assign({}, this.rows)
    }

    setRaw(setCookies: string | string[]) {
        if (typeof setCookies == 'string') {
            setCookies = [setCookies]
        }
        for (let oneSet of setCookies) {
            const cookie_match = oneSet.match(/^([^=]+)=([^;]+)/)
            if (cookie_match) {
                const key = cookie_match[1].trim()
                const val = cookie_match[2].trim()
                Object.assign(this.rows, { [key]: val })
            }
        }
        this.refreshText()
    }

    set(key: string, val: string | number) {
        Object.assign(this.rows, { [key]: val })
        this.refreshText()
    }

    sets(keyVals: stringQuery) {
        Object.assign(this.rows, keyVals)
        this.refreshText()
    }

    get(key: string) {
        if (this.rows[key] === undefined) {
            throw Object.assign(new Error(`Cookies中没有找到${key}`), { cookies: this.rows })
        }
        return this.rows[key]
    }
}