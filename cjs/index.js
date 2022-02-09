"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createProxy = exports.createLogger = exports.Consolite = void 0;

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

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
  function ExtendConsole() {
    var _this = this,
        _this$prefix;

    _classCallCheck(this, ExtendConsole);

    _defineProperty(this, "prefix", []);

    _defineProperty(this, "_filter", null);

    _defineProperty(this, "_level", null);

    _defineProperty(this, "_levels", {});

    _defineProperty(this, "parent", null);

    _defineProperty(this, "logMethods", console);

    _defineProperty(this, "levels", new Proxy(this._levels, {
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

    (_this$prefix = this.prefix).push.apply(_this$prefix, arguments);
  }

  _createClass(ExtendConsole, [{
    key: "register",
    value: function register(name, fn) {
      this.logMethods[name] = fn;
    }
  }, {
    key: "level",
    get: function get() {
      var _ref, _this$_level, _this$parent4;

      return (_ref = (_this$_level = this._level) !== null && _this$_level !== void 0 ? _this$_level : (_this$parent4 = this.parent) === null || _this$parent4 === void 0 ? void 0 : _this$parent4.level) !== null && _ref !== void 0 ? _ref : defaults.level;
    },
    set: function set(val) {
      this._level = val;
    }
  }, {
    key: "filter",
    get: function get() {
      var _ref2, _this$_filter, _this$parent5;

      return (_ref2 = (_this$_filter = this._filter) !== null && _this$_filter !== void 0 ? _this$_filter : (_this$parent5 = this.parent) === null || _this$parent5 === void 0 ? void 0 : _this$parent5.filter) !== null && _ref2 !== void 0 ? _ref2 : defaults.filter;
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
      var _this$parent6;

      return ((_this$parent6 = this.parent) === null || _this$parent6 === void 0 ? void 0 : _this$parent6.root) || this;
    }
  }, {
    key: "createChild",
    value: function createChild() {
      for (var _len = arguments.length, prefix = new Array(_len), _key = 0; _key < _len; _key++) {
        prefix[_key] = arguments[_key];
      }

      var child = createLogger.apply(void 0, _toConsumableArray(this.prefix).concat(prefix));
      child.parent = this;
      return child;
    }
  }, {
    key: "createParent",
    value: function createParent() {
      for (var _len2 = arguments.length, prefix = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        prefix[_key2] = arguments[_key2];
      }

      return createProxy(this, [].concat(prefix, _toConsumableArray(this.prefix)));
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
  var extendedConsole = _construct(ExtendConsole, _toConsumableArray(prefix));

  var proxy =
  /** @type {ConsoliteLogger} */
  new Proxy(extendedConsole, {
    get: function get(target, prop) {
      if (Reflect.has(target, prop)) return Reflect.get(target, prop);
      var fnContext = target;
      var fn = target.logMethods[prop];

      while (!fn && fnContext) {
        var _fnContext;

        fnContext = fnContext.parent;
        fn = (_fnContext = fnContext) === null || _fnContext === void 0 ? void 0 : _fnContext.logMethods[prop];
      }

      if (fn) {
        var _fn;

        var withinLevel = function withinLevel(prop) {
          return target.levels[prop] <= target.level;
        };

        var passesFilter = function passesFilter() {
          return typeof target.filter === 'function' ? target.filter(prefix) : prefix.join('').match(escapeIfString(target.filter));
        };

        var canBind = typeof fn === 'function';
        var shouldPrint = withinLevel(prop) && passesFilter() && canBind;
        var prefixes = prefix.map(function (p) {
          return typeof p === 'string' ? p : p(prop);
        });
        return shouldPrint ? (_fn = fn).bind.apply(_fn, [console].concat(_toConsumableArray(prefixes))) : noop;
      }
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
  for (var _len3 = arguments.length, prefix = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    prefix[_key3] = arguments[_key3];
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