export type Filter = (prefixes: string[]) => any;
export type Logger = {
    /**
     * Creates new logger.
     */
    create: (...prefix: string[]) => Consolite & Console;
    /**
     * Creates a child logger. Prefix will be inherited. Level and levels will be inherited if undefined.
     */
    createChild: (...prefix: string[]) => Consolite & Console;
    /**
     * Creates a parent logger. Prefix will be inherited. Level and levels will be inherited if undefined.
     */
    createParent: (...prefix: string[]) => Consolite & Console;
    levels: {
        [x: string]: number;
    };
    level: number;
    filter: Filter | string | RegExp;
    root: Logger;
    parent: Logger;
};
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
    create: (...prefix: string[]) => Consolite & Console;
}
/**
 * @param {string[]} prefix
 * @returns {Consolite & Console}
 */
export function createLogger(...prefix: string[]): Consolite & Console;
