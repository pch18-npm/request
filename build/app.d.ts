/// <reference types="node" />
import http = require('http');
import https = require('https');
declare type stringQuery = {
    [x: string]: string;
};
declare type baseQuery = {
    [x: string]: string | number;
};
declare type superQuery = {
    [x: string]: string | number | superQuery;
};
interface request_opts {
    method: 'GET' | 'POST';
    uri: string;
    query?: baseQuery;
    postData?: superQuery;
    parseJson?: boolean;
    cookies?: Cookies;
    headers?: baseQuery;
    auth?: {
        user: string;
        pass: string;
    };
    debug?: boolean;
    allowCode?: number[] | ((code: number) => boolean);
    other?: http.RequestOptions | https.RequestOptions;
}
export declare class Request {
    static get(uri: string, opts?: {
        [x in keyof request_opts]?: request_opts[x];
    }): Promise<string>;
    static get(uri: string, opts: {
        [x in keyof request_opts]?: request_opts[x];
    } & {
        raw: true;
    }): Promise<{
        code: number;
        headers: http.IncomingHttpHeaders;
        data: string;
        buffer: Buffer;
    }>;
    static get_json<T>(uri: string, opts?: {
        [x in keyof request_opts]?: request_opts[x];
    }): Promise<T>;
    static get_json<T>(uri: string, opts: {
        [x in keyof request_opts]?: request_opts[x];
    } & {
        raw: true;
    }): Promise<{
        code: number;
        headers: http.IncomingHttpHeaders;
        data: T;
        buffer: Buffer;
    }>;
    static post(uri: string, postData: superQuery, opts?: {
        [x in keyof request_opts]?: request_opts[x];
    }): Promise<string>;
    static post(uri: string, postData: superQuery, opts: {
        [x in keyof request_opts]?: request_opts[x];
    } & {
        raw: true;
    }): Promise<{
        code: number;
        headers: http.IncomingHttpHeaders;
        data: string;
        buffer: Buffer;
    }>;
    static post_json<T>(uri: string, postData: superQuery, opts?: {
        [x in keyof request_opts]?: request_opts[x];
    }): Promise<T>;
    static post_json<T>(uri: string, postData: superQuery, opts: {
        [x in keyof request_opts]?: request_opts[x];
    } & {
        raw: true;
    }): Promise<{
        code: number;
        headers: http.IncomingHttpHeaders;
        data: T;
        buffer: Buffer;
    }>;
    static request(opts: request_opts): Promise<{
        buffer: Buffer;
        res: http.IncomingMessage;
    }>;
}
export declare class Cookies {
    private rows;
    private rows_text;
    private refreshText;
    constructor(rows?: stringQuery);
    stringify(): string;
    dump(): stringQuery;
    setRaw(setCookies: string | string[]): void;
    set(key: string, val: string | number): void;
    sets(keyVals: stringQuery): void;
    get(key: string): string;
}
export {};
//# sourceMappingURL=app.d.ts.map