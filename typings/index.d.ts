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
export type PrefixFn = (method: string) => any;
export type ConsoliteLogger = Consolite & Console;
export class Consolite {
    constructor(...prefix: any[]);
    prefix: any[];
    _filter: any;
    _level: any;
    _levels: {};
    parent: any;
    set level(arg: any);
    get level(): any;
    set filter(arg: any);
    get filter(): any;
    get root(): any;
    levels: {};
    createChild(...prefix: any[]): ConsoliteLogger;
    createParent(...prefix: any[]): ConsoliteLogger;
    create: (...prefix: (string | PrefixFn)[]) => ConsoliteLogger;
}
/**
 * @callback PrefixFn
 * @param {string} method console method, eg. log, debug etc...
 */
/** @typedef {Consolite & Console} ConsoliteLogger */
/**
 * @param {(string|PrefixFn)[]} prefix
 * @returns {ConsoliteLogger}
 */
export function createLogger(...prefix: (string | PrefixFn)[]): ConsoliteLogger;
