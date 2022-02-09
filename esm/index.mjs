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
  _filter = null
  _level = null
  _levels = {}
  _prefix = []
  logMethods = /** @type {Console} */ ({})

  constructor(parent, prefix) {
    this.parent = parent
    if (!parent) this.logMethods = console
    this._prefix = prefix
    Object.defineProperties(this, {
      _filter: { enumerable: false },
      _level: { enumerable: false },
      _levels: { enumerable: false },
      _prefix: { enumerable: false },
    })
  }

  register(name, fn) {
    this.logMethods[name] = fn
  }

  /**
   * get prop from self or nearest ancestor
   * @template T
   * @param {(((T)=>{})|string|symbol)} cb
   */
  getNearest(cb) {
    const fn = typeof cb === 'string' || typeof cb === 'symbol' ? x => x[cb] : cb
    const result = fn(this)
    return result !== null && result !== undefined
      ? result
      : this.parent && this.parent.getNearest(fn)
  }

  get prefix() {
    let parent = this
    const accumulatedPrefixes = [...this._prefix]
    while ((parent = parent.parent)) accumulatedPrefixes.unshift(...parent._prefix)
    return accumulatedPrefixes
  }

  set prefix(value) {
    this._prefix = Array.isArray(value) ? value : [value]
  }

  get level() {
    return this.getNearest('_level') ?? defaults.level
  }
  set level(val) {
    this._level = val
  }
  get filter() {
    return this.getNearest('_filter') ?? defaults.filter
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
    return createProxy(this, prefix)
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
  const extendedConsole = new ExtendConsole(parent, prefix)
  const proxy = /** @type {ConsoliteLogger} */ (
    new Proxy(extendedConsole, {
      get(target, prop) {
        if (Reflect.has(target, prop)) return Reflect.get(target, prop)

        const fn = target.getNearest(t => t.logMethods[prop])

        if (fn) {
          const withinLevel = prop => target.levels[prop] <= target.level
          const passesFilter = () =>
            typeof target.filter === 'function'
              ? target.filter(target.prefix)
              : target.prefix.join('').match(escapeIfString(target.filter))

          const canBind = typeof fn === 'function'
          const shouldPrint = withinLevel(prop) && passesFilter() && canBind
          const prefixes = target.prefix.map(p => (typeof p === 'string' ? p : p(prop)))

          return shouldPrint ? fn.bind(console, ...prefixes) : noop
        }
      },
      set(target, prop, value) {
        if (Reflect.has(target, prop)) target[prop] = value
        else if (value instanceof Function) target.logMethods[prop] = value
        else return false
        return true
      },
      ownKeys(target) {
        const keys = [...Reflect.ownKeys(target), ...Reflect.ownKeys(target.logMethods)]
        let parent = target
        while ((parent = parent.parent)) keys.push(...Reflect.ownKeys(parent.logMethods))
        return keys
      },
      getOwnPropertyDescriptor(target, prop) {
        if (Reflect.get(target, prop))
          return Object.getOwnPropertyDescriptor(target, prop)

        return (
          parent.getNearest(t => Object.getOwnPropertyDescriptor(t.logMethods, prop)) ||
          undefined
        )
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
