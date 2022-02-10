"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createProxy = exports.createLogger = exports.Consolite = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// todo delimiter

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
var defaults = {
  filter: '',
  level: 3,
  levels: {
    "default": 3,
    error: 1,
    warn: 2,
    debug: 4,
    trace: 4
  }
};

var noop = function noop(x) {
  return x;
};

var unique = function unique(v, i, a) {
  return a.indexOf(v) === i;
}; // $& means the whole matched string


var escapeRegExp = function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

var escapeIfString = function escapeIfString(str) {
  return typeof str === 'string' ? escapeRegExp(str) : str;
};

var ExtendConsole = /*#__PURE__*/function () {
  function ExtendConsole(parent, prefix) {
    var _this = this;

    _classCallCheck(this, ExtendConsole);

    _defineProperty(this, "_filter", null);

    _defineProperty(this, "_level", null);

    _defineProperty(this, "_levels", {});

    _defineProperty(this, "_prefix", []);

    _defineProperty(this, "_delimiter", null);

    _defineProperty(this, "logMethods",
    /** @type {Console} */
    {});

    _defineProperty(this, "levels", new Proxy(this._levels, {
      // todo could be cleaner. Might not need proxy
      ownKeys: function ownKeys(target) {
        var _this$parent;

        return [].concat(_toConsumableArray(Object.keys(defaults.levels)), _toConsumableArray(Object.keys(((_this$parent = _this.parent) === null || _this$parent === void 0 ? void 0 : _this$parent.levels) || {})), _toConsumableArray(Reflect.ownKeys(target))).filter(unique);
      },
      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, key) {
        return {
          value: target[key],
          enumerable: true,
          configurable: true
        };
      },
      get: function get(target, prop) {
        var _this$parent2, _this$parent3;

        return target[prop] || target["default"] || ((_this$parent2 = _this.parent) === null || _this$parent2 === void 0 ? void 0 : _this$parent2.levels[prop]) || ((_this$parent3 = _this.parent) === null || _this$parent3 === void 0 ? void 0 : _this$parent3.levels["default"]) || defaults.levels[prop] || defaults.levels["default"];
      },
      set: function set(target, prop, value) {
        return target[prop] = value;
      }
    }));

    _defineProperty(this, "create", createLogger);

    this.parent = parent;
    if (!parent) this.logMethods = console;
    this._prefix = prefix;
    Object.defineProperties(this, {
      _filter: {
        enumerable: false
      },
      _level: {
        enumerable: false
      },
      _levels: {
        enumerable: false
      },
      _prefix: {
        enumerable: false
      }
    });
  }

  _createClass(ExtendConsole, [{
    key: "register",
    value: function register(name, fn) {
      this.logMethods[name] = fn;
    }
    /**
     * get prop from self or nearest ancestor
     * @template T
     * @param {(((T)=>{})|string|symbol)} cb
     */

  }, {
    key: "getNearest",
    value: function getNearest(cb) {
      var fn = typeof cb === 'string' || _typeof(cb) === 'symbol' ? function (x) {
        return x[cb];
      } : cb;
      var result = fn(this);
      return result !== null && result !== undefined ? result : this.parent && this.parent.getNearest(fn);
    }
  }, {
    key: "prefix",
    get: function get() {
      var parent = this;

      var accumulatedPrefixes = _toConsumableArray(this._prefix);

      while (parent = parent.parent) {
        accumulatedPrefixes.unshift.apply(accumulatedPrefixes, _toConsumableArray(parent._prefix));
      }

      return accumulatedPrefixes;
    },
    set: function set(value) {
      this._prefix = Array.isArray(value) ? value : [value];
    }
  }, {
    key: "formattedPrefixes",
    get: function get() {
      var _this2 = this;

      if (!this.delimiter) return this.prefix;else {
        var prefixes = [];
        this.prefix.forEach(function (prefix) {
          return prefixes.push(prefix, _this2.delimiter);
        });
        return prefixes;
      }
    }
  }, {
    key: "delimiter",
    get: function get() {
      return this.getNearest('_delimiter');
    },
    set: function set(value) {
      this._delimiter = value;
    }
  }, {
    key: "level",
    get: function get() {
      var _this$getNearest;

      return (_this$getNearest = this.getNearest('_level')) !== null && _this$getNearest !== void 0 ? _this$getNearest : defaults.level;
    },
    set: function set(val) {
      this._level = val;
    }
  }, {
    key: "filter",
    get: function get() {
      var _this$getNearest2;

      return (_this$getNearest2 = this.getNearest('_filter')) !== null && _this$getNearest2 !== void 0 ? _this$getNearest2 : defaults.filter;
    },
    set: function set(val) {
      this._filter = val;
    }
  }, {
    key: "__self",
    get: function get() {
      // logger = proxied object, logger.__self = original object
      return this;
    }
  }, {
    key: "root",
    get: function get() {
      var _this$parent4;

      return ((_this$parent4 = this.parent) === null || _this$parent4 === void 0 ? void 0 : _this$parent4.root) || this;
    }
  }, {
    key: "createChild",
    value: function createChild() {
      for (var _len = arguments.length, prefix = new Array(_len), _key = 0; _key < _len; _key++) {
        prefix[_key] = arguments[_key];
      }

      return createProxy(this, prefix);
    }
  }]);

  return ExtendConsole;
}();
/**
 *
 * @param {ExtendConsole} parent
 * @param {(string|PrefixFn)[]} prefix
 * @returns {ConsoliteLogger}
 */


var createProxy = function createProxy(parent, prefix) {
  var extendedConsole = new ExtendConsole(parent, prefix);
  var proxy =
  /** @type {ConsoliteLogger} */
  new Proxy(extendedConsole, {
    get: function get(target, prop) {
      if (Reflect.has(target, prop)) return Reflect.get(target, prop);
      var fn = target.getNearest(function (t) {
        return t.logMethods[prop];
      });

      if (fn) {
        var withinLevel = function withinLevel(prop) {
          return target.levels[prop] <= target.level;
        };

        var passesFilter = function passesFilter() {
          return typeof target.filter === 'function' ? target.filter(target.prefix) : target.prefix.join('').match(escapeIfString(target.filter));
        };

        var canBind = typeof fn === 'function';
        var shouldPrint = withinLevel(prop) && passesFilter() && canBind;
        var prefixes = target.formattedPrefixes.map(function (p) {
          return typeof p === 'string' ? p : p(prop);
        });
        return shouldPrint ? fn.bind.apply(fn, [console].concat(_toConsumableArray(prefixes))) : noop;
      }
    },
    set: function set(target, prop, value) {
      if (Reflect.has(target, prop)) target[prop] = value;else if (value instanceof Function) target.logMethods[prop] = value;else return false;
      return true;
    },
    ownKeys: function ownKeys(target) {
      var keys = [].concat(_toConsumableArray(Reflect.ownKeys(target)), _toConsumableArray(Reflect.ownKeys(target.logMethods)));
      var parent = target;

      while (parent = parent.parent) {
        keys.push.apply(keys, _toConsumableArray(Reflect.ownKeys(parent.logMethods)));
      }

      return keys;
    },
    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, prop) {
      if (Reflect.get(target, prop)) return Object.getOwnPropertyDescriptor(target, prop);
      return parent.getNearest(function (t) {
        return Object.getOwnPropertyDescriptor(t.logMethods, prop);
      }) || undefined;
    }
  });
  return proxy;
};
/**
 * @callback PrefixFn
 * @param {string|symbol} method console method, eg. log, debug etc...
 */

/** @typedef {ExtendConsole & Console} ConsoliteLogger */

/**
 * @param {(string|PrefixFn)[]} prefix
 * @returns {ConsoliteLogger}
 */


exports.createProxy = createProxy;

var createLogger = function createLogger() {
  for (var _len2 = arguments.length, prefix = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    prefix[_key2] = arguments[_key2];
  }

  return createProxy(null, prefix);
};
/** @type {ConsoliteLogger} */


exports.createLogger = createLogger;

var Consolite = function Consolite() {
  _classCallCheck(this, Consolite);

  return createLogger.apply(void 0, arguments);
};

exports.Consolite = Consolite;
//# sourceMappingURL=index.js.map