export function createProxy(parent: ExtendConsole, prefix: (string | PrefixFn)[]): ConsoliteLogger;
export function createLogger(...prefix: (string | PrefixFn)[]): ConsoliteLogger;
/** @type {ConsoliteLogger} */
export class Consolite {
    constructor(...prefix: any[]);
}
export type Filter = (prefixes: string[]) => any;
export type Logger = {
    /**
     * Creates new logger.
     */
    create: (...prefix: (string | PrefixFn)[]) => ConsoliteLogger;
    /**
     * Creates a child logger. Prefix will be inherited. Level and levels will be inherited if undefined.
     */
    createChild: (...prefix: (string | PrefixFn)[]) => ConsoliteLogger;
    /**
     * Creates a parent logger. Prefix will be inherited. Level and levels will be inherited if undefined.
     */
    createParent: (...prefix: (string | PrefixFn)[]) => ConsoliteLogger;
    levels: {
        [x: string]: number;
    };
    level: number;
    filter: Filter | string | RegExp;
    root: Logger;
    parent: Logger;
};
export type PrefixFn = (method: string | symbol) => any;
export type ConsoliteLogger = ExtendConsole & Console;
declare class ExtendConsole {
    constructor(...prefix: any[]);
    prefix: any[];
    _filter: any;
    _level: any;
    _levels: {};
    parent: any;
    logMethods: Console;
    register(name: any, fn: any): void;
    set level(arg: any);
    get level(): any;
    set filter(arg: any);
    get filter(): any;
    get __self(): ExtendConsole;
    get root(): any;
    levels: {};
    createChild(...prefix: any[]): ConsoliteLogger;
    createParent(...prefix: any[]): ConsoliteLogger;
    create: (...prefix: (string | PrefixFn)[]) => ConsoliteLogger;
}
export {};
