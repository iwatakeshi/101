'use strict';
import clone = require('clone');
import keypather = require('keypather');
declare const process: any;
const $101 = {
  /**
   * Functional version of &&
   * @function module:101/and
   * @param {*} a - any value
   * @param {*} b - any value
   * @return {*} a && b
   */
  and: (a, b) => a && b,
  /**
   * Functional version of function.apply
   * @function module:101/apply
   * @param {*} thisArg - Context applied to fn
   * @param {array} args - Arguments applied to fn
   * @return {function} function which accepts a function, fn, and applies thisArg, and args to it. Returns fn.apply(thisArg, args).
   */
  apply: (thisArg, args) => ((fn) => fn.apply(thisArg, args)),
  /**
   * Copies enumerable and own properties from a source object(s) to a target object, aka extend.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
   * I added functionality to support assign as a partial function
   * @function module:101/assign
   * @param {object} [target] - object which source objects are extending (being assigned to)
   * @param {object} sources... - objects whose properties are being assigned to the source object
   * @return {object} source with extended properties
   */
  assign: function (target, firstSource) {
    if (arguments.length === 1) {
      firstSource = arguments[0];
      return (target) => $101.assign(target, firstSource);
    }
    if (target === undefined || target === null)
      throw new TypeError('Cannot convert first argument to object');
    var to = Object(target);
    for (let i = 1; i < arguments.length; i++) {
      var nextSource = arguments[i];
      if (nextSource === undefined || nextSource === null) continue;
      var keysArray = Object.keys(Object(nextSource));
      for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
        let nextKey = keysArray[nextIndex];
        Object.getOwnPropertyDescriptor(nextSource, nextKey);
        // I changed the following line to get 100% test coverage.
        // if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
        // I was unable to find a scenario where desc was undefined or that desc.enumerable was false:
        //   1) Object.defineProperty does not accept undefined as a desc
        //   2) Object.keys does not return non-enumerable keys.
        // Let me know if this is a cross browser thing.
        to[nextKey] = nextSource[nextKey];
      }
    }
    return to;
  },
  /**
   * Bind a passed object methods.
   * If methods name to bing are not specified, all the object methods are binded
   * @function module:101/bind-all
   *
   * @param {object} object - object to bind
   * @param {array|string} [methods] - array or space-separated string containing the names of the methods to bind
   * @return {object} the binded object
   */
  bindAll:(object, methods) => {
    if (methods && !Array.isArray(methods)) {
      throw new TypeError('The second argument must be an array');
    }

    let keys = methods || $101.keysIn(object);

    // Bind all the specified methods
    keys.forEach(key => {
      let target = object[key];
      // skip for non-functions and when the target does not exist
      if (!target || !$101.isFunction(target)) { return; }
      object[key] = target.bind(object);
    });

    return object;
  },
  /** Just exporting https://www.npmjs.org/package/clone */
  // Only bc 101 uses it internally and it is a nice util
  clone: clone,
  /**
   * [compose description]
   * @function module:101/compose
   * @param {function} f
   * @param {function} g
   * @return {function}
   */
  compose: (f, g) => (...args) => f(g.apply(null, args)),
  /**
   * Converges an array of functions into one
   * @function module:101/converge
   * @param {function} f
   * @param {Array} array of functions
   * @return {function}
   */
  converge:(f, funcs) => ((...args) => (f.apply(null, funcs.map(g => g.apply(null, args))))),
  /**
   * Get all the keys compositing an object, including the `Object.prototype`
   * @function module:101/keys-in
   *
   * @param {object} object - the object from which to extract the keys
   * @return {array} array of keys
   */
  keysIn: (object) => {
    if (!object) { return []; }
    let keys = [];
    for (let key in object) {
      keys.push(key);
    }
    return keys;
  },
  /**
   * Returns a curried function
   * @function module:101/curry
   * @param {function} f - function to be curried
   * @param {integer} [n] - how many arguments to curry
   * @return {function}
   */
  curry: (f, n) => {
    let length = n || f.length;
      const curry = (a, b, args) => (...args2) => {
        const slice = Array.prototype.slice;
        let curryArgs = args.concat(slice.call(args2));
        if (curryArgs.length >= b) return a.apply(null, curryArgs.slice(0, b));
        else return curry(a, b, curryArgs);
      }
    return curry(f, length, []);
  },
  /**
   * Mixes in properties from source into target when
   * the property is not a property of `target`
   * @param  {Object} [target] Mix into
   * @param  {Object} source The defaults description
   * @return {Object}        THe resulting target
   */
  defaults: (...args) => {
    let target = args[0], source = args[1], deep = args[2];
    if (args.length === 1) {
      source = target;
      return (target) => $101.defaults(target, source);
    } else if ($101.isBoolean(source)) {
      deep = source;
      source = target;
      return (target) => $101.defaults(target, source, deep);
    }
    target = target || {};
    deep = deep || false;
    if (!source) return target;
    const reduceObject = (a, b, c?) => {
      return Object.keys(b).reduce(function (a, key) {
        if ($101.isObject(a[key]) && $101.isObject(b[key]) && c) {
          reduceObject(a[key], b[key]);
          return a;
        }
        a[key] = $101.exists(a[key]) ? a[key] : b[key];
        return a;
      }, a);
    }
    return reduceObject(target, source, deep);
  },
  /**
   * Functional version of delete obj[key].
   * When only a key is specified del returns a partial-function which accepts obj.
   * @function module:101/del
   * @param {*} [obj] - object on which the values will be del
   * @param {string} key - key of the value being del on obj
   * @return {*|function} The same obj without the deleted key or Partial-function del (which accepts obj) and returns the same obj without the deleted key.
   */
  del: (...args) => {
    let obj = args[0], key = args[1];
    const del = (a, b) => {
      var keys;
      var numberOrString = $101.passAny($101.isString, $101.isNumber);
      if ($101.isObject(a) && numberOrString(b)) {
        // (obj, key)
        keypather().del(a, b);
        return a;
      }
      else if ($101.isObject(a) && Array.isArray(b)) {
        // (obj, keys)
        keys = b;
        for (var i = 0; i < keys.length; i++) { keypather().del(a, keys[i]); }
        return a;
      }
      else {
        throw new TypeError('Invalid arguments: expected str, val or val, obj');
      }
    };
    if (args.length === 1) {
      // (key)
      key = obj;
      return (obj) => del(obj, key);
    } else return del(obj, key);
  },
  /**
   * Functional version of str === process.env.NODE_ENV. Or's multiple environments.
   * @function module:101/env-is
   * @param {*} array - Array of environments to check
   * @return {boolean} Any of the supplied arguments exists in process.env.NODE_ENV
   */
  envIs: (...args) => args.some($101.equals(process.env.NODE_ENV)),
  /**
   * Functional implementation of Object.is with polyfill for browsers without implementations of Object.is
   * @function module:101/equals
   * @param {*} a - any value
   * @param {*} b - any value
   * @return {boolean} Object.is(a, b)
   */
  equals: (...args) => {
    let a = args[0], b = args[1];
    const equals = (v1, v2) => {
      // ES6 Object.is polyfill
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
      if (v1 === 0 && v2 === 0) {
        return 1 / v1 === 1 / v2;
      }
      if (v1 !== v1) {
        return v2 !== v2;
      }
      return v1 === v2;
    }
    if (args.length === 1) {
      return equals.bind(null, a);
    }
    else return equals(a, b);
  },
  /**
   * Returns false for null and undefined, true for everything else.
   * @function module:101/exists
   * @param val {*} - value to be existance checked
   * @return {boolean} whether the value exists or not
   */
  exists: val => val !== undefined && val !== null,
  /**
   * Finds the first value in the list that passes the given function (predicate) and returns it's index.
   * If list is not provided findIndex will return a partial-function which accepts a list as the first argument.
   * @function module:101/find-index
   *
   * @param {array|string} list - list to be searched
   * @param {function} predicate - executed on each item in the list and returns true when the item is found
   * @return {number} - index of first item which passes predicate
   *
   * @param {function} predicate - executed on each item in the list and returns true when the item is found
   * @return {function} - partial function (accepts list and returns index of first item that passes predicate)
   */
  findIndex: (list, predicate) : any => {
    const findIndex = (a, b) => {
      if (!$101.exists(a && a.length)) {
        throw new TypeError('list must have length property');
      }
      if (!$101.isFunction(b)) {
        throw new TypeError('predicate must be a function');
      }

      let index = -1;
      a = Array.prototype.slice.call(a); // cast as array to use some.
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
      return list => findIndex(list, predicate);
    }
    else {
      throw new TypeError('first argument must be a list (have length) or function');
    }
  },
  /**
   * Functional version of val typeof 'boolean'
   * @function module:101/is-boolean
   * @param {*} val - value checked to be a boolean
   * @return {boolean} Whether the value is a boolean or not
   */
  isBoolean: val => typeof val === 'boolean',
  /**
   * Functional version of val typeof 'function'
   * @function module:101/is-function
   * @param {*} val - value checked to be a function
   * @return {boolean} Whether the value is a function or not
   */
  isFunction: val => typeof val === 'function',
  /**
   * Functional version of val typeof 'number'
   * @function module:101/is-number
   * @param {*} val - value checked to be a string
   * @return {boolean} Whether the value is an string or not
   */
  isNumber: val => !isNaN(val) && (typeof val === 'number' || val instanceof Number),
  /**
   * @function module:101/is-object
   * @param {*} val - value checked to be an object
   * @return {boolean} Whether the value is an object or not
   */
  isObject: val => typeof val === 'object' && $101.exists(val) &&
  !Array.isArray(val) && !(val instanceof RegExp) &&
  !(val instanceof String) && !(val instanceof Number),
  /**
   * Functional version of val typeof 'string'
   * @function module:101/is-string
   * @param {*} val - value checked to be a string
   * @return {boolean} Whether the value is an string or not
   */
  isString: val => typeof val === 'string' || val instanceof String,
  /**
   * Muxes arguments across many functions and ||'s the results
   * @function module:101/pass-any
   * @param {function} funcs... - functions which return a boolean
   * @return {function} function which accepts args which it applies to funcs and ||s the results
   */
  passAny: (...args/* funcs */) => {
    var funcs = Array.prototype.slice.call(args);
    if (!funcs.every($101.isFunction)) {
      throw new TypeError('all funcs should be functions');
    }
    return function (...args2) {
      return funcs.some(func => func.apply(this, args2));
    };
  }

};

export = $101;
