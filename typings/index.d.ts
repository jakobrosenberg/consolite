export function createProxy<O extends ConsoliteOptions, P extends ExtendConsole>(parent: P, options: O, prefix: (string | PrefixFn)[]): ConsoliteLogger<P, Console & O["methods"]>;
export function createLogger<O extends ConsoliteOptions, P extends ExtendConsole>(optsOrPrefix: Prefix | O, ...prefix: (string | PrefixFn)[]): ConsoliteLogger<P, Console & O["methods"]>;
export class Consolite {
    constructor(optsOrPrefix: any, ...prefix: any[]);
}
export type Filter = (prefixes: string[]) => any;
export type ConsoliteOptions = {
    methods?: {
        [x: string]: (...prefix: any[]) => string;
    };
};
export type Prefix = PrefixFn | string;
export type PrefixFn = (method: string | symbol) => any;
export type ConsoliteLogger<Parent extends ExtendConsole, Methods extends {
    [x: string]: (...prefix: any[]) => string;
}> = Parent & Methods;
declare class ExtendConsole {
    /**
     *
     * @param {ExtendConsole} parent
     * @param {ConsoliteOptions} options
     * @param {Prefix[]} prefix
     */
    constructor(parent: ExtendConsole, options: ConsoliteOptions, prefix: Prefix[]);
    _filter: any;
    _level: any;
    _levels: {};
    _prefix: any[];
    _delimiter: any;
    logMethods: Console;
    parent: ExtendConsole;
    options: ConsoliteOptions;
    /**
     * @template {ConsoliteOptions}  T
     * @template {ConsoliteOptions extends Object ? T['methods'] : ConsoliteOptions['methods']} Methods
     * @param {T | Prefix} optsOrPrefix
     * @param  {...Prefix} prefix
     * @returns {ConsoliteLogger<this, Methods>}
     */
    createChild<T extends ConsoliteOptions, Methods extends T["methods"]>(optsOrPrefix: Prefix | T, ...prefix: Prefix[]): ConsoliteLogger<ExtendConsole, Methods>;
    register(name: any, fn: any): void;
    /**
     * get prop from self or nearest ancestor
     * @template T
     * @param {(((T)=>{})|string|symbol)} cb
     */
    getNearest<T_1>(cb: string | symbol | ((T: any) => {})): any;
    set prefix(arg: any[]);
    get prefix(): any[];
    get formattedPrefixes(): any[];
    set delimiter(arg: any);
    get delimiter(): any;
    set level(arg: any);
    get level(): any;
    set filter(arg: any);
    get filter(): any;
    get __self(): ExtendConsole;
    get root(): any;
    levels: any;
}
export {};
