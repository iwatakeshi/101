'use strict';
var clone = require('clone');
var keypather = require('keypather');
var $101 = {
    and: function (a, b) { return a && b; },
    apply: function (thisArg, args) { return (function (fn) { return fn.apply(thisArg, args); }); },
    assign: function (target, firstSource) {
        if (arguments.length === 1) {
            firstSource = arguments[0];
            return function (target) { return $101.assign(target, firstSource); };
        }
        if (target === undefined || target === null)
            throw new TypeError('Cannot convert first argument to object');
        var to = Object(target);
        for (var i = 1; i < arguments.length; i++) {
            var nextSource = arguments[i];
            if (nextSource === undefined || nextSource === null)
                continue;
            var keysArray = Object.keys(Object(nextSource));
            for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                var nextKey = keysArray[nextIndex];
                Object.getOwnPropertyDescriptor(nextSource, nextKey);
                to[nextKey] = nextSource[nextKey];
            }
        }
        return to;
    },
    bindAll: function (object, methods) {
        if (methods && !Array.isArray(methods)) {
            throw new TypeError('The second argument must be an array');
        }
        var keys = methods || $101.keysIn(object);
        keys.forEach(function (key) {
            var target = object[key];
            if (!target || !$101.isFunction(target)) {
                return;
            }
            object[key] = target.bind(object);
        });
        return object;
    },
    clone: clone,
    compose: function (f, g) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return f(g.apply(null, args));
    }; },
    converge: function (f, funcs) { return (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return (f.apply(null, funcs.map(function (g) { return g.apply(null, args); })));
    }); },
    keysIn: function (object) {
        if (!object) {
            return [];
        }
        var keys = [];
        for (var key in object) {
            keys.push(key);
        }
        return keys;
    },
    curry: function (f, n) {
        var length = n || f.length;
        var curry = function (a, b, args) { return function () {
            var args2 = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args2[_i - 0] = arguments[_i];
            }
            var slice = Array.prototype.slice;
            var curryArgs = args.concat(slice.call(args2));
            if (curryArgs.length >= b)
                return a.apply(null, curryArgs.slice(0, b));
            else
                return curry(a, b, curryArgs);
        }; };
        return curry(f, length, []);
    },
    defaults: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var target = args[0], source = args[1], deep = args[2];
        if (args.length === 1) {
            source = target;
            return function (target) { return $101.defaults(target, source); };
        }
        else if ($101.isBoolean(source)) {
            deep = source;
            source = target;
            return function (target) { return $101.defaults(target, source, deep); };
        }
        target = target || {};
        deep = deep || false;
        if (!source)
            return target;
        var reduceObject = function (a, b, c) {
            return Object.keys(b).reduce(function (a, key) {
                if ($101.isObject(a[key]) && $101.isObject(b[key]) && c) {
                    reduceObject(a[key], b[key]);
                    return a;
                }
                a[key] = $101.exists(a[key]) ? a[key] : b[key];
                return a;
            }, a);
        };
        return reduceObject(target, source, deep);
    },
    del: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var obj = args[0], key = args[1];
        var del = function (a, b) {
            var keys;
            var numberOrString = $101.passAny($101.isString, $101.isNumber);
            if ($101.isObject(a) && numberOrString(b)) {
                keypather().del(a, b);
                return a;
            }
            else if ($101.isObject(a) && Array.isArray(b)) {
                keys = b;
                for (var i = 0; i < keys.length; i++) {
                    keypather().del(a, keys[i]);
                }
                return a;
            }
            else {
                throw new TypeError('Invalid arguments: expected str, val or val, obj');
            }
        };
        if (args.length === 1) {
            key = obj;
            return function (obj) { return del(obj, key); };
        }
        else
            return del(obj, key);
    },
    envIs: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return args.some($101.equals(process.env.NODE_ENV));
    },
    equals: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var a = args[0], b = args[1];
        var equals = function (v1, v2) {
            if (v1 === 0 && v2 === 0) {
                return 1 / v1 === 1 / v2;
            }
            if (v1 !== v1) {
                return v2 !== v2;
            }
            return v1 === v2;
        };
        if (args.length === 1) {
            return equals.bind(null, a);
        }
        else
            return equals(a, b);
    },
    exists: function (val) { return val !== undefined && val !== null; },
    findIndex: function (list, predicate) {
        var findIndex = function (a, b) {
            if (!$101.exists(a && a.length)) {
                throw new TypeError('list must have length property');
            }
            if (!$101.isFunction(b)) {
                throw new TypeError('predicate must be a function');
            }
            var index = -1;
            a = Array.prototype.slice.call(a);
            a.some(function (val, i) {
                if (b(val, i, a)) {
                    index = i;
                    return true;
                }
            });
            return index;
        };
        if ($101.exists(list && list.length) && !$101.isFunction(list)) {
            return findIndex(list, predicate);
        }
        else if ($101.isFunction(list)) {
            predicate = list;
            return function (list) { return findIndex(list, predicate); };
        }
        else {
            throw new TypeError('first argument must be a list (have length) or function');
        }
    },
    isBoolean: function (val) { return typeof val === 'boolean'; },
    isFunction: function (val) { return typeof val === 'function'; },
    isNumber: function (val) { return !isNaN(val) && (typeof val === 'number' || val instanceof Number); },
    isObject: function (val) { return typeof val === 'object' && $101.exists(val) &&
        !Array.isArray(val) && !(val instanceof RegExp) &&
        !(val instanceof String) && !(val instanceof Number); },
    isString: function (val) { return typeof val === 'string' || val instanceof String; },
    passAny: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var funcs = Array.prototype.slice.call(args);
        if (!funcs.every($101.isFunction)) {
            throw new TypeError('all funcs should be functions');
        }
        return function () {
            var _this = this;
            var args2 = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args2[_i - 0] = arguments[_i];
            }
            return funcs.some(function (func) { return func.apply(_this, args2); });
        };
    }
};
module.exports = $101;
