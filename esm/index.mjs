// todo delimiter

/**
 * @callback Filter
 * @param {string[]} prefixes
 */

/**
 * @typedef {Object} ConsoliteOptions
 * @prop {Object<string, function>=} methods
 */

/**
 * @typedef {PrefixFn|string} Prefix
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

export class ExtendConsole {
  _filter = null
  _level = null
  _levels = {}
  _prefix = []
  _delimiter = null
  logMethods = /** @type {Console} */ ({})

  /**
   * @param {ExtendConsole} parent
   * @param {ConsoliteOptions} options
   * @param {Prefix[]} prefix
   */
  constructor(parent, options, prefix) {
    this.parent = parent
    this.options = options
    if (!parent) this.logMethods = { ...console }
    Object.assign(this.logMethods, options?.methods)
    this._prefix = prefix
    Object.defineProperties(this, {
      _filter: { enumerable: false },
      _level: { enumerable: false },
      _levels: { enumerable: false },
      _prefix: { enumerable: false },
    })
  }

  /**
   * @template {ConsoliteOptions}  T
   * @template {ConsoliteOptions extends Object ? T['methods'] : ConsoliteOptions['methods']} Methods
   * @param {T | Prefix=} optsOrPrefix
   * @param  {...Prefix} prefix
   * @returns {ConsoliteLogger<this, Methods>}
   */
  createChild(optsOrPrefix, ...prefix) {
    const hasOptions = typeof optsOrPrefix === 'object'
    const options = hasOptions ? optsOrPrefix : {}
    if (!hasOptions && optsOrPrefix) prefix.unshift(optsOrPrefix)
    return createProxy(this, options, prefix)
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
    /** @type {ExtendConsole} */
    let parent = this
    const accumulatedPrefixes = [...this._prefix]
    while ((parent = parent.parent)) accumulatedPrefixes.unshift(...parent._prefix)
    return accumulatedPrefixes
  }

  get formattedPrefixes() {
    if (!this.delimiter) return this.prefix
    else {
      const prefixes = []
      this.prefix.forEach(prefix => prefixes.push(prefix, this.delimiter))
      return prefixes
    }
  }

  get delimiter() {
    return this.getNearest('_delimiter')
  }

  set delimiter(value) {
    this._delimiter = value
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
    return this
  }
  get root() {
    return this.parent?.root || this
  }

  levels = new Proxy(this._levels, {
    // todo could be cleaner. Might not need proxy
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
}

/**
 * @template {ConsoliteOptions} O
 * @template {ExtendConsole} P
 * @param {P} parent
 * @param {O | null} options
 * @param {(string|PrefixFn)[]} prefix
 * @returns {ConsoliteLogger<P, Console & O['methods']>}
 */
export const createProxy = (parent, options, prefix) => {
  const extendedConsole = new ExtendConsole(parent, options, prefix)
  const proxy = /** @type {ConsoliteLogger<P, Console & O['methods']>} */ (
    new Proxy(extendedConsole, {
      get(target, prop) {
        if (Reflect.has(target, prop)) return Reflect.get(target, prop)

        const fn = target.getNearest(t => t.logMethods[prop])

        if (fn) {
          const withinLevel = prop => target.levels[prop] <= target.level
          const passesFilter = () =>
            typeof target.filter === 'function'
              ? target.filter(target.prefix, prop)
              : target.prefix.join('').match(escapeIfString(target.filter))

          const canBind = typeof fn === 'function'
          const shouldPrint = withinLevel(prop) && passesFilter() && canBind
          const prefixes = target.formattedPrefixes.map(p =>
            typeof p === 'string' ? p : p(prop),
          )

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

/**
 * @template {ExtendConsole} Parent
 * @template {ConsoliteOptions['methods']} Methods
 * @typedef {Parent & Methods} ConsoliteLogger
 **/

/**
 * @template {ConsoliteOptions} O
 * @param {O | Prefix=} optsOrPrefix
 * @param {(string|PrefixFn)[]} prefix
 * @returns {ConsoliteLogger<ExtendConsole, Console & O['methods']>}
 */
export const createLogger = (optsOrPrefix, ...prefix) => {
  const hasOptions = typeof optsOrPrefix === 'object'
  const options = hasOptions ? optsOrPrefix : {}
  if (!hasOptions && optsOrPrefix) prefix.unshift(optsOrPrefix)
  return createProxy(this, options, prefix)
}

export class Consolite {
  constructor(optsOrPrefix, ...prefix) {
    return createLogger(optsOrPrefix, ...prefix)
  }
}
