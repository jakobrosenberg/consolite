export type Filter = (prefixes: string[]) => any;
export type Logger = {
    /**
     * Creates new logger.
     */
    create: (...prefix: (string | PrefixFn)[]) => Consolite & Console;
    /**
     * Creates a child logger. Prefix will be inherited. Level and levels will be inherited if undefined.
     */
    createChild: (...prefix: (string | PrefixFn)[]) => Consolite & Console;
    /**
     * Creates a parent logger. Prefix will be inherited. Level and levels will be inherited if undefined.
     */
    createParent: (...prefix: (string | PrefixFn)[]) => Consolite & Console;
    levels: {
        [x: string]: number;
    };
    level: number;
    filter: Filter | string | RegExp;
    root: Logger;
    parent: Logger;
};
export type PrefixFn = (method: string) => any;
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
    createChild(...prefix: any[]): Consolite & Console;
    createParent(...prefix: any[]): Consolite & Console;
    create: (...prefix: (string | PrefixFn)[]) => Consolite & Console;
}
/**
 * @callback PrefixFn
 * @param {string} method console method, eg. log, debug etc...
 */
/**
 * @param {(string|PrefixFn)[]} prefix
 * @returns {Consolite & Console}
 */
export function createLogger(...prefix: (string | PrefixFn)[]): Consolite & Console;
