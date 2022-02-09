/**
 * @callback Filter
 * @param {string[]} prefixes
 */

/**
 * @typedef {Object} Logger
 * @prop {createLogger} create Creates new logger.
 * @prop {createLogger} createChild Creates a child logger. Prefix will be inherited. Level and levels will be inherited if undefined.
 * @prop {createLogger} createParent Creates a parent logger. Prefix will be inherited. Level and levels will be inherited if undefined.
 * @prop {Object.<string, number>} levels
 * @prop {number} level
 * @prop {Filter|string|RegExp} filter
 * @prop {Logger} root
 * @prop {Logger} parent
 */

const defaults = {
  filter: '',
  level: 3,
  levels: {
    default: 3,
    error: 1,
    warn: 2,
    debug: 4,
    trace: 4,
  },
}

const noop = x => x
const unique = (v, i, a) => a.indexOf(v) === i

// $& means the whole matched string
const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const escapeIfString = str => (typeof str === 'string' ? escapeRegExp(str) : str)

class ExtendConsole {
  prefix = []
  _filter = null
  _level = null
  _levels = {}
  parent = null
  logMethods = console

  constructor(...prefix) {
    this.prefix.push(...prefix)
  }

  register(name, fn) {
    this.logMethods[name] = fn
  }

  get level() {
    return this._level ?? this.parent?.level ?? defaults.level
  }
  set level(val) {
    this._level = val
  }
  get filter() {
    return this._filter ?? this.parent?.filter ?? defaults.filter
  }
  set filter(val) {
    this._filter = val
  }
  get __self() {
    // logger = proxied object, logger.__self = original object
    return this
  }
  get root() {
    return this.parent?.root || this
  }

  levels = new Proxy(this._levels, {
    ownKeys: target =>
      [
        ...Object.keys(defaults.levels),
        ...Object.keys(this.parent?.levels || {}),
        ...Reflect.ownKeys(target),
      ].filter(unique),
    getOwnPropertyDescriptor: (target, key) => ({
      value: target[key],
      enumerable: true,
      configurable: true,
    }),
    get: (target, prop) =>
      target[prop] ||
      target.default ||
      this.parent?.levels[prop] ||
      this.parent?.levels.default ||
      defaults.levels[prop] ||
      defaults.levels.default,
    set: (target, prop, value) => (target[prop] = value),
  })

  createChild(...prefix) {
    const child = createLogger(...this.prefix, ...prefix)
    child.parent = this
    return child
  }

  createParent(...prefix) {
    return createProxy(this, [...prefix, ...this.prefix])
  }

  create = createLogger
}

/**
 *
 * @param {ExtendConsole} parent
 * @param {(string|PrefixFn)[]} prefix
 * @returns {ConsoliteLogger}
 */
export const createProxy = (parent, prefix) => {
  const extendedConsole = new ExtendConsole(...prefix)
  const proxy = /** @type {ConsoliteLogger} */ (
    new Proxy(extendedConsole, {
      get(target, prop) {
        if (Reflect.has(target, prop)) return Reflect.get(target, prop)

        let fnContext = target
        let fn = target.logMethods[prop]
        while (!fn && fnContext) {
          fnContext = fnContext.parent
          fn = fnContext?.logMethods[prop]
        }

        if (fn) {
          const withinLevel = prop => target.levels[prop] <= target.level
          const passesFilter = () =>
            typeof target.filter === 'function'
              ? target.filter(prefix)
              : prefix.join('').match(escapeIfString(target.filter))

          const canBind = typeof fn === 'function'
          const shouldPrint = withinLevel(prop) && passesFilter() && canBind
          const prefixes = prefix.map(p => (typeof p === 'string' ? p : p(prop)))

          return shouldPrint ? fn.bind(console, ...prefixes) : noop
        }
      },
    })
  )
  return proxy
}

/**
 * @callback PrefixFn
 * @param {string|symbol} method console method, eg. log, debug etc...
 */

/** @typedef {ExtendConsole & Console} ConsoliteLogger */

/**
 * @param {(string|PrefixFn)[]} prefix
 * @returns {ConsoliteLogger}
 */
export const createLogger = (...prefix) => {
  return createProxy(null, prefix)
}

/** @type {ConsoliteLogger} */
export class Consolite {
  constructor(...prefix) {
    return createLogger(...prefix)
  }
}
