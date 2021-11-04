"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createLogger = exports.Consolite = void 0;

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
}; // $& means the whole matched string


var escapeRegExp = function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

var escapeIfString = function escapeIfString(str) {
  return typeof str === 'string' ? escapeRegExp(str) : str;
};

var canBind = function canBind(prop) {
  return typeof console[prop] === 'function';
};

var Consolite = /*#__PURE__*/function () {
  function Consolite() {
    var _this = this,
        _this$prefix;

    for (var _len = arguments.length, prefix = new Array(_len), _key = 0; _key < _len; _key++) {
      prefix[_key] = arguments[_key];
    }

    _classCallCheck(this, Consolite);

    _defineProperty(this, "prefix", []);

    _defineProperty(this, "_filter", null);

    _defineProperty(this, "_level", null);

    _defineProperty(this, "_levels", {});

    _defineProperty(this, "parent", null);

    _defineProperty(this, "levels", new Proxy(this._levels, {
      get: function get(target, prop) {
        var _this$parent, _this$parent2;

        return target[prop] || target["default"] || ((_this$parent = _this.parent) === null || _this$parent === void 0 ? void 0 : _this$parent.levels[prop]) || ((_this$parent2 = _this.parent) === null || _this$parent2 === void 0 ? void 0 : _this$parent2.levels["default"]) || defaults.levels[prop] || defaults.levels["default"];
      },
      set: function set(target, prop, value) {
        return target[prop] = value;
      }
    }));

    _defineProperty(this, "create", createLogger);

    (_this$prefix = this.prefix).push.apply(_this$prefix, prefix);

    var withinLevel = function withinLevel(prop) {
      return _this.levels[prop] <= _this.level;
    };

    var passesFilter = function passesFilter() {
      return typeof _this.filter === 'function' ? _this.filter(prefix) : prefix.join('').match(escapeIfString(_this.filter));
    };

    var shouldPrint = function shouldPrint(prop) {
      return withinLevel(prop) && passesFilter() && canBind(prop);
    }; // attach console methods


    Object.keys(console).forEach(function (prop) {
      return Object.defineProperty(_this, prop, {
        get: function get() {
          var _console$prop;

          var prefixes = prefix.map(function (p) {
            return typeof p === 'string' ? p : p(prop, _this);
          });
          return shouldPrint(prop) ? (_console$prop = console[prop]).bind.apply(_console$prop, [console].concat(_toConsumableArray(prefixes))) : noop;
        }
      });
    });
  }

  _createClass(Consolite, [{
    key: "level",
    get: function get() {
      var _ref, _this$_level, _this$parent3;

      return (_ref = (_this$_level = this._level) !== null && _this$_level !== void 0 ? _this$_level : (_this$parent3 = this.parent) === null || _this$parent3 === void 0 ? void 0 : _this$parent3.level) !== null && _ref !== void 0 ? _ref : defaults.level;
    },
    set: function set(val) {
      this._level = val;
    }
  }, {
    key: "filter",
    get: function get() {
      var _ref2, _this$_filter, _this$parent4;

      return (_ref2 = (_this$_filter = this._filter) !== null && _this$_filter !== void 0 ? _this$_filter : (_this$parent4 = this.parent) === null || _this$parent4 === void 0 ? void 0 : _this$parent4.filter) !== null && _ref2 !== void 0 ? _ref2 : defaults.filter;
    },
    set: function set(val) {
      this._filter = val;
    }
  }, {
    key: "root",
    get: function get() {
      var _this$parent5;

      return ((_this$parent5 = this.parent) === null || _this$parent5 === void 0 ? void 0 : _this$parent5.root) || this;
    }
  }, {
    key: "createChild",
    value: function createChild() {
      for (var _len2 = arguments.length, prefix = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        prefix[_key2] = arguments[_key2];
      }

      var child = createLogger.apply(void 0, _toConsumableArray(this.prefix).concat(prefix));
      child.parent = this;
      return child;
    }
  }, {
    key: "createParent",
    value: function createParent() {
      for (var _len3 = arguments.length, prefix = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        prefix[_key3] = arguments[_key3];
      }

      return createLogger.apply(void 0, prefix.concat(_toConsumableArray(this.prefix)));
    }
  }]);

  return Consolite;
}();
/**
 * @callback PrefixFn
 * @param {string} method console method, eg. log, debug etc...
 */

/** @typedef {Consolite & Console} ConsoliteLogger */

/**
 * @param {(string|PrefixFn)[]} prefix
 * @returns {ConsoliteLogger}
 */


exports.Consolite = Consolite;

var createLogger = function createLogger() {
  for (var _len4 = arguments.length, prefix = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    prefix[_key4] = arguments[_key4];
  }

  return Object.assign(_construct(Consolite, prefix));
};

exports.createLogger = createLogger;
//# sourceMappingURL=index.js.map