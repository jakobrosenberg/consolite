/**
* @typedef {Object} Logger 
* @prop {createLogger} create Creates new logger.
* @prop {createLogger} createChild Creates a child logger. Prefix will be inherited. Level and levels will be inherited if undefined.
* @prop {createLogger} createParent Creates a parent logger. Prefix will be inherited. Level and levels will be inherited if undefined.
* @prop {Object.<string, number>} levels
* @prop {number} level
* @prop {Logger} parent
*/


const defaults = {
  level: 3,
  levels: {
    default: 3,
    error: 1,
    warn: 2,
    debug: 4,
    trace: 4,
  },
};
const noop = (x) => x;

function createLogger(...prefix) {
  /** @type {Logger & console} */
  const logger = {};
  const parent = (this && this.parent) || {};
  const _levels = parent.levels ? {} : defaults.levels;
  let level = parent.level ? null : defaults.level;
  const createChild = createLogger.bind({ parent: logger });

  const levels = new Proxy(_levels, {
    get: (target, prop) => target[prop] || target.default || parent.levels[prop],
    set: (target, prop, value) => (target[prop] = value),
  });

  Object.assign(logger, {
    create: createLogger,
    createChild: (...newPrefix) => createChild(...prefix, ...newPrefix),
    createParent: (...newPrefix) => createLogger(...newPrefix, ...prefix),
    levels,
    parent,
  });

  Object.defineProperty(logger, "level", {
    get: () => level || logger.parent.level,
    set: (val) => (level = val),
  });

  const shouldShowProp = (prop) => logger.levels[prop] <= logger.level;

  const defineProp = (prop) =>
    Object.defineProperty(logger, prop, {
      get: () => (shouldShowProp(prop) ? console[prop].bind(console, ...prefix) : noop),
    });
  Object.keys(console).forEach(defineProp);

  return logger;
}

module.exports = { createLogger };
