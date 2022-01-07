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

export class Consolite {
  prefix = []
  _filter = null
  _level = null
  _levels = {}
  parent = null

  constructor(...prefix) {
    this.prefix.push(...prefix)

    const withinLevel = prop => this.levels[prop] <= this.level
    const passesFilter = () =>
      typeof this.filter === 'function'
        ? this.filter(prefix)
        : prefix.join('').match(escapeIfString(this.filter))

    this.register = (prop, fn) =>
      Object.defineProperty(this, prop, {
        get: () => {
          const canBind = typeof fn === 'function'
          const shouldPrint = withinLevel(prop) && passesFilter() && canBind
          const prefixes = prefix.map(p => (typeof p === 'string' ? p : p(prop, this)))

          return shouldPrint ? fn.bind(console, ...prefixes) : noop
        },
      })
    
    // attach console methods
    Object.keys(console).forEach(prop => this.register(prop, console[prop]))
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
    return createLogger(...prefix, ...this.prefix)
  }

  create = createLogger
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
export const createLogger = (...prefix) => Object.assign(new Consolite(...prefix))
