declare type stringQuery = {
    [x: string]: string;
};
declare type baseQuery = {
    [x: string]: string | number;
};
declare type superQuery = {
    [x: string]: baseQuery;
};
interface request_opts {
    method: 'GET' | 'POST';
    uri: string;
    query?: baseQuery;
    postData?: superQuery;
    parseJson?: boolean;
    cookies?: Cookies;
    headers?: baseQuery;
}
export declare class Request {
    static get(uri: string, opts?: {
        [x in keyof request_opts]?: request_opts[x];
    }): Promise<string>;
    static get_json<T extends Object>(uri: string, opts?: {
        [x in keyof request_opts]?: request_opts[x];
    }): Promise<T>;
    static post(uri: string, postData: superQuery, opts?: {
        [x in keyof request_opts]?: request_opts[x];
    }): Promise<string>;
    static post_json<T extends Object>(uri: string, postData: superQuery, opts?: {
        [x in keyof request_opts]?: request_opts[x];
    }): Promise<T>;
    static request(opts: request_opts): Promise<string>;
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