require('./sourcemap-register.js');module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(429);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Share = void 0;
const CurlShareOption_1 = __webpack_require__(358);
const bindings = __webpack_require__(367);
/**
 * This is a Node.js wrapper around the binding {@link EasyNativeBinding | native Easy class}.
 *
 * The only extra is that it provides a static field `option` and `lock`.
 *
 * @public
 */
let Share = /** @class */ (() => {
    class Share extends bindings.Share {
    }
    /**
     * Options to be used with {@link setOpt | `setOpt`}.
     *
     * See the official documentation of [`curl_share_setopt()`](http://curl.haxx.se/libcurl/c/curl_share_setopt.html)
     *  for reference.
     *
     * `CURLSHOPT_SHARE` becomes `Share.option.SHARE`
     *
     * @deprecated Use {@link CurlShareOption|`CurlShareOption`} directly instead.
     */
    Share.option = CurlShareOption_1.CurlShareOption;
    return Share;
})();
exports.Share = Share;
//# sourceMappingURL=Share.js.map

/***/ }),
/* 2 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const os = __webpack_require__(87);
const macosRelease = __webpack_require__(118);
const winRelease = __webpack_require__(49);

const osName = (platform, release) => {
	if (!platform && release) {
		throw new Error('You can\'t specify a `release` without specifying `platform`');
	}

	platform = platform || os.platform();

	let id;

	if (platform === 'darwin') {
		if (!release && os.platform() === 'darwin') {
			release = os.release();
		}

		const prefix = release ? (Number(release.split('.')[0]) > 15 ? 'macOS' : 'OS X') : 'macOS';
		id = release ? macosRelease(release).name : '';
		return prefix + (id ? ' ' + id : '');
	}

	if (platform === 'linux') {
		if (!release && os.platform() === 'linux') {
			release = os.release();
		}

		id = release ? release.replace(/^(\d+\.\d+).*/, '$1') : '';
		return 'Linux' + (id ? ' ' + id : '');
	}

	if (platform === 'win32') {
		if (!release && os.platform() === 'win32') {
			release = os.release();
		}

		id = release ? winRelease(release) : '';
		return 'Windows' + (id ? ' ' + id : '');
	}

	return platform;
};

module.exports = osName;


/***/ }),
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var once = __webpack_require__(969);

var noop = function() {};

var isRequest = function(stream) {
	return stream.setHeader && typeof stream.abort === 'function';
};

var isChildProcess = function(stream) {
	return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3
};

var eos = function(stream, opts, callback) {
	if (typeof opts === 'function') return eos(stream, null, opts);
	if (!opts) opts = {};

	callback = once(callback || noop);

	var ws = stream._writableState;
	var rs = stream._readableState;
	var readable = opts.readable || (opts.readable !== false && stream.readable);
	var writable = opts.writable || (opts.writable !== false && stream.writable);
	var cancelled = false;

	var onlegacyfinish = function() {
		if (!stream.writable) onfinish();
	};

	var onfinish = function() {
		writable = false;
		if (!readable) callback.call(stream);
	};

	var onend = function() {
		readable = false;
		if (!writable) callback.call(stream);
	};

	var onexit = function(exitCode) {
		callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
	};

	var onerror = function(err) {
		callback.call(stream, err);
	};

	var onclose = function() {
		process.nextTick(onclosenexttick);
	};

	var onclosenexttick = function() {
		if (cancelled) return;
		if (readable && !(rs && (rs.ended && !rs.destroyed))) return callback.call(stream, new Error('premature close'));
		if (writable && !(ws && (ws.ended && !ws.destroyed))) return callback.call(stream, new Error('premature close'));
	};

	var onrequest = function() {
		stream.req.on('finish', onfinish);
	};

	if (isRequest(stream)) {
		stream.on('complete', onfinish);
		stream.on('abort', onclose);
		if (stream.req) onrequest();
		else stream.on('request', onrequest);
	} else if (writable && !ws) { // legacy streams
		stream.on('end', onlegacyfinish);
		stream.on('close', onlegacyfinish);
	}

	if (isChildProcess(stream)) stream.on('exit', onexit);

	stream.on('end', onend);
	stream.on('finish', onfinish);
	if (opts.error !== false) stream.on('error', onerror);
	stream.on('close', onclose);

	return function() {
		cancelled = true;
		stream.removeListener('complete', onfinish);
		stream.removeListener('abort', onclose);
		stream.removeListener('request', onrequest);
		if (stream.req) stream.req.removeListener('finish', onfinish);
		stream.removeListener('end', onlegacyfinish);
		stream.removeListener('close', onlegacyfinish);
		stream.removeListener('finish', onfinish);
		stream.removeListener('exit', onexit);
		stream.removeListener('end', onend);
		stream.removeListener('error', onerror);
		stream.removeListener('close', onclose);
	};
};

module.exports = eos;


/***/ }),
/* 10 */,
/* 11 */
/***/ (function(module) {

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}


/***/ }),
/* 12 */,
/* 13 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);
var bind = __webpack_require__(271);
var Axios = __webpack_require__(779);
var mergeConfig = __webpack_require__(825);
var defaults = __webpack_require__(529);

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(826);
axios.CancelToken = __webpack_require__(137);
axios.isCancel = __webpack_require__(732);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(879);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */
/***/ (function(module) {

module.exports = eval("require")("encoding");


/***/ }),
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.





var Schema = __webpack_require__(733);


module.exports = new Schema({
  include: [
    __webpack_require__(581)
  ],
  implicit: [
    __webpack_require__(809),
    __webpack_require__(228),
    __webpack_require__(44),
    __webpack_require__(417)
  ]
});


/***/ }),
/* 24 */,
/* 25 */,
/* 26 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var enhanceError = __webpack_require__(369);

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */
/***/ (function(module) {

module.exports = require("https");

/***/ }),
/* 35 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(271);

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),
/* 36 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeChunks = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * This function is used to merge the buffers
 *  that were stored while the request was being processed.
 *
 * @internal
 */
function mergeChunks(chunks, length) {
    // We init the whole buffer below, so no need to use, the slower, Buffer.alloc
    const buffer = Buffer.allocUnsafe(length);
    const chunksLen = chunks.length;
    let currentPos = 0;
    for (let i = 0; i < chunksLen; i += 1) {
        const chunk = chunks[i];
        chunk.copy(buffer, currentPos);
        currentPos += chunk.length;
    }
    return buffer;
}
exports.mergeChunks = mergeChunks;
//# sourceMappingURL=mergeChunks.js.map

/***/ }),
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


module.exports = {
  copySync: __webpack_require__(110)
}


/***/ }),
/* 44 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var common = __webpack_require__(740);
var Type   = __webpack_require__(945);

function isHexCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
}

function isOctCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
}

function isDecCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
}

function resolveYamlInteger(data) {
  if (data === null) return false;

  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;

  if (!max) return false;

  ch = data[index];

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index];

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (ch !== '0' && ch !== '1') return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }

    // base 8
    for (; index < max; index++) {
      ch = data[index];
      if (ch === '_') continue;
      if (!isOctCode(data.charCodeAt(index))) return false;
      hasDigits = true;
    }
    return hasDigits && ch !== '_';
  }

  // base 10 (except 0) or base 60

  // value should not start with `_`;
  if (ch === '_') return false;

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') continue;
    if (ch === ':') break;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }

  // Should have digits and should not end with `_`
  if (!hasDigits || ch === '_') return false;

  // if !base60 - done;
  if (ch !== ':') return true;

  // base60 almost not used, no needs to optimize
  return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
}

function constructYamlInteger(data) {
  var value = data, sign = 1, ch, base, digits = [];

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1;
    value = value.slice(1);
    ch = value[0];
  }

  if (value === '0') return 0;

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
    if (value[1] === 'x') return sign * parseInt(value, 16);
    return sign * parseInt(value, 8);
  }

  if (value.indexOf(':') !== -1) {
    value.split(':').forEach(function (v) {
      digits.unshift(parseInt(v, 10));
    });

    value = 0;
    base = 1;

    digits.forEach(function (d) {
      value += (d * base);
      base *= 60;
    });

    return sign * value;

  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return (Object.prototype.toString.call(object)) === '[object Number]' &&
         (object % 1 === 0 && !common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
    octal:       function (obj) { return obj >= 0 ? '0'  + obj.toString(8) : '-0'  + obj.toString(8).slice(1); },
    decimal:     function (obj) { return obj.toString(10); },
    /* eslint-disable max-len */
    hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});


/***/ }),
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=CurlGlobalInit.js.map

/***/ }),
/* 49 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const os = __webpack_require__(87);
const execa = __webpack_require__(675);

// Reference: https://www.gaijin.at/en/lstwinver.php
const names = new Map([
	['10.0', '10'],
	['6.3', '8.1'],
	['6.2', '8'],
	['6.1', '7'],
	['6.0', 'Vista'],
	['5.2', 'Server 2003'],
	['5.1', 'XP'],
	['5.0', '2000'],
	['4.9', 'ME'],
	['4.1', '98'],
	['4.0', '95']
]);

const windowsRelease = release => {
	const version = /\d+\.\d/.exec(release || os.release());

	if (release && !version) {
		throw new Error('`release` argument doesn\'t match `n.n`');
	}

	const ver = (version || [])[0];

	// Server 2008, 2012, 2016, and 2019 versions are ambiguous with desktop versions and must be detected at runtime.
	// If `release` is omitted or we're on a Windows system, and the version number is an ambiguous version
	// then use `wmic` to get the OS caption: https://msdn.microsoft.com/en-us/library/aa394531(v=vs.85).aspx
	// If `wmic` is obsoloete (later versions of Windows 10), use PowerShell instead.
	// If the resulting caption contains the year 2008, 2012, 2016 or 2019, it is a server version, so return a server OS name.
	if ((!release || release === os.release()) && ['6.1', '6.2', '6.3', '10.0'].includes(ver)) {
		let stdout;
		try {
			stdout = execa.sync('wmic', ['os', 'get', 'Caption']).stdout || '';
		} catch (_) {
			stdout = execa.sync('powershell', ['(Get-CimInstance -ClassName Win32_OperatingSystem).caption']).stdout || '';
		}

		const year = (stdout.match(/2008|2012|2016|2019/) || [])[0];

		if (year) {
			return `Server ${year}`;
		}
	}

	return names.get(ver);
};

module.exports = windowsRelease;


/***/ }),
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = __webpack_require__(13);

/***/ }),
/* 54 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
// Adapted from https://github.com/sindresorhus/make-dir
// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const fs = __webpack_require__(869)
const path = __webpack_require__(622)
const atLeastNode = __webpack_require__(159)

const useNativeRecursiveOption = atLeastNode('10.12.0')

// https://github.com/nodejs/node/issues/8987
// https://github.com/libuv/libuv/pull/1088
const checkPath = pth => {
  if (process.platform === 'win32') {
    const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path.parse(pth).root, ''))

    if (pathHasInvalidWinCharacters) {
      const error = new Error(`Path contains invalid characters: ${pth}`)
      error.code = 'EINVAL'
      throw error
    }
  }
}

const processOptions = options => {
  const defaults = { mode: 0o777 }
  if (typeof options === 'number') options = { mode: options }
  return { ...defaults, ...options }
}

const permissionError = pth => {
  // This replicates the exception of `fs.mkdir` with native the
  // `recusive` option when run on an invalid drive under Windows.
  const error = new Error(`operation not permitted, mkdir '${pth}'`)
  error.code = 'EPERM'
  error.errno = -4048
  error.path = pth
  error.syscall = 'mkdir'
  return error
}

module.exports.makeDir = async (input, options) => {
  checkPath(input)
  options = processOptions(options)

  if (useNativeRecursiveOption) {
    const pth = path.resolve(input)

    return fs.mkdir(pth, {
      mode: options.mode,
      recursive: true
    })
  }

  const make = async pth => {
    try {
      await fs.mkdir(pth, options.mode)
    } catch (error) {
      if (error.code === 'EPERM') {
        throw error
      }

      if (error.code === 'ENOENT') {
        if (path.dirname(pth) === pth) {
          throw permissionError(pth)
        }

        if (error.message.includes('null bytes')) {
          throw error
        }

        await make(path.dirname(pth))
        return make(pth)
      }

      try {
        const stats = await fs.stat(pth)
        if (!stats.isDirectory()) {
          // This error is never exposed to the user
          // it is caught below, and the original error is thrown
          throw new Error('The path is not a directory')
        }
      } catch {
        throw error
      }
    }
  }

  return make(path.resolve(input))
}

module.exports.makeDirSync = (input, options) => {
  checkPath(input)
  options = processOptions(options)

  if (useNativeRecursiveOption) {
    const pth = path.resolve(input)

    return fs.mkdirSync(pth, {
      mode: options.mode,
      recursive: true
    })
  }

  const make = pth => {
    try {
      fs.mkdirSync(pth, options.mode)
    } catch (error) {
      if (error.code === 'EPERM') {
        throw error
      }

      if (error.code === 'ENOENT') {
        if (path.dirname(pth) === pth) {
          throw permissionError(pth)
        }

        if (error.message.includes('null bytes')) {
          throw error
        }

        make(path.dirname(pth))
        return make(pth)
      }

      try {
        if (!fs.statSync(pth).isDirectory()) {
          // This error is never exposed to the user
          // it is caught below, and the original error is thrown
          throw new Error('The path is not a directory')
        }
      } catch {
        throw error
      }
    }
  }

  return make(path.resolve(input))
}


/***/ }),
/* 55 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const u = __webpack_require__(676).fromPromise
const jsonFile = __webpack_require__(469)

jsonFile.outputJson = u(__webpack_require__(695))
jsonFile.outputJsonSync = __webpack_require__(628)
// aliases
jsonFile.outputJSON = jsonFile.outputJson
jsonFile.outputJSONSync = jsonFile.outputJsonSync
jsonFile.writeJSON = jsonFile.writeJson
jsonFile.writeJSONSync = jsonFile.writeJsonSync
jsonFile.readJSON = jsonFile.readJson
jsonFile.readJSONSync = jsonFile.readJsonSync

module.exports = jsonFile


/***/ }),
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlTimeCond = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be82545348/include/curl/curl.h#L2058
/**
 * Object with constants for option `TIMECONDITION`
 *
 * `CURL_TIMECOND_IFMODSINCE` becomes `CurlTimeCond.IfModSince`
 *
 * @public
 */
var CurlTimeCond;
(function (CurlTimeCond) {
    CurlTimeCond[CurlTimeCond["None"] = 0] = "None";
    CurlTimeCond[CurlTimeCond["IfModSince"] = 1] = "IfModSince";
    CurlTimeCond[CurlTimeCond["IfUnmodSince"] = 2] = "IfUnmodSince";
    CurlTimeCond[CurlTimeCond["LastMod"] = 3] = "LastMod";
})(CurlTimeCond = exports.CurlTimeCond || (exports.CurlTimeCond = {}));
//# sourceMappingURL=CurlTimeCond.js.map

/***/ }),
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */
/***/ (function(module) {

"use strict";


module.exports = string => {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string');
	}

	// Escape characters with special meaning either inside or outside character sets.
	// Use a simple backslash escape when it’s always valid, and a \unnnn escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
	return string
		.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
		.replace(/-/g, '\\x2d');
};


/***/ }),
/* 80 */,
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Module dependencies.
 */

const tty = __webpack_require__(867);
const util = __webpack_require__(669);

/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = __webpack_require__(247);

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util.format(...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = __webpack_require__(486)(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts)
		.replace(/\s*\n\s*/g, ' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts);
};


/***/ }),
/* 82 */
/***/ (function(__unusedmodule, exports) {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */
/***/ (function(module) {

module.exports = require("os");

/***/ }),
/* 88 */
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = which
which.sync = whichSync

var isWindows = process.platform === 'win32' ||
    process.env.OSTYPE === 'cygwin' ||
    process.env.OSTYPE === 'msys'

var path = __webpack_require__(622)
var COLON = isWindows ? ';' : ':'
var isexe = __webpack_require__(742)

function getNotFoundError (cmd) {
  var er = new Error('not found: ' + cmd)
  er.code = 'ENOENT'

  return er
}

function getPathInfo (cmd, opt) {
  var colon = opt.colon || COLON
  var pathEnv = opt.path || process.env.PATH || ''
  var pathExt = ['']

  pathEnv = pathEnv.split(colon)

  var pathExtExe = ''
  if (isWindows) {
    pathEnv.unshift(process.cwd())
    pathExtExe = (opt.pathExt || process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM')
    pathExt = pathExtExe.split(colon)


    // Always test the cmd itself first.  isexe will check to make sure
    // it's found in the pathExt set.
    if (cmd.indexOf('.') !== -1 && pathExt[0] !== '')
      pathExt.unshift('')
  }

  // If it has a slash, then we don't bother searching the pathenv.
  // just check the file itself, and that's it.
  if (cmd.match(/\//) || isWindows && cmd.match(/\\/))
    pathEnv = ['']

  return {
    env: pathEnv,
    ext: pathExt,
    extExe: pathExtExe
  }
}

function which (cmd, opt, cb) {
  if (typeof opt === 'function') {
    cb = opt
    opt = {}
  }

  var info = getPathInfo(cmd, opt)
  var pathEnv = info.env
  var pathExt = info.ext
  var pathExtExe = info.extExe
  var found = []

  ;(function F (i, l) {
    if (i === l) {
      if (opt.all && found.length)
        return cb(null, found)
      else
        return cb(getNotFoundError(cmd))
    }

    var pathPart = pathEnv[i]
    if (pathPart.charAt(0) === '"' && pathPart.slice(-1) === '"')
      pathPart = pathPart.slice(1, -1)

    var p = path.join(pathPart, cmd)
    if (!pathPart && (/^\.[\\\/]/).test(cmd)) {
      p = cmd.slice(0, 2) + p
    }
    ;(function E (ii, ll) {
      if (ii === ll) return F(i + 1, l)
      var ext = pathExt[ii]
      isexe(p + ext, { pathExt: pathExtExe }, function (er, is) {
        if (!er && is) {
          if (opt.all)
            found.push(p + ext)
          else
            return cb(null, p + ext)
        }
        return E(ii + 1, ll)
      })
    })(0, pathExt.length)
  })(0, pathEnv.length)
}

function whichSync (cmd, opt) {
  opt = opt || {}

  var info = getPathInfo(cmd, opt)
  var pathEnv = info.env
  var pathExt = info.ext
  var pathExtExe = info.extExe
  var found = []

  for (var i = 0, l = pathEnv.length; i < l; i ++) {
    var pathPart = pathEnv[i]
    if (pathPart.charAt(0) === '"' && pathPart.slice(-1) === '"')
      pathPart = pathPart.slice(1, -1)

    var p = path.join(pathPart, cmd)
    if (!pathPart && /^\.[\\\/]/.test(cmd)) {
      p = cmd.slice(0, 2) + p
    }
    for (var j = 0, ll = pathExt.length; j < ll; j ++) {
      var cur = p + pathExt[j]
      var is
      try {
        is = isexe.sync(cur, { pathExt: pathExtExe })
        if (is) {
          if (opt.all)
            found.push(cur)
          else
            return cur
        }
      } catch (ex) {}
    }
  }

  if (opt.all && found.length)
    return found

  if (opt.nothrow)
    return null

  throw getNotFoundError(cmd)
}


/***/ }),
/* 89 */,
/* 90 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlSslOpt = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be8254534898fccafc5d6cd04f6235f283cfbd/include/curl/curl.h#L7
/**
 * Object with constants for option `SSL_OPTIONS` and/or `PROXY_SSL_OPTIONS`
 *
 * `CURLSSLOPT_ALLOW_BEAST` becomes `CurlSslOpt.AllowBeast`
 *
 * @public
 */
var CurlSslOpt;
(function (CurlSslOpt) {
    /**
     * Tells libcurl to allow the BEAST SSL vulnerability in the
     * name of improving interoperability with older servers. Some SSL libraries
     * have introduced work-arounds for this flaw but those work-arounds sometimes
     * make the SSL communication fail. To regain functionality with those broken
     * servers, a user can this way allow the vulnerability back.
     */
    CurlSslOpt[CurlSslOpt["AllowBeast"] = 1] = "AllowBeast";
    /**
     * Tells libcurl to disable certificate revocation checks for those
     * SSL backends where such behavior is present.
     */
    CurlSslOpt[CurlSslOpt["NoRevoke"] = 2] = "NoRevoke";
    /**
     * Tells libcurl to *NOT* accept a partial certificate chain
     * if possible. The OpenSSL backend has this ability.
     */
    CurlSslOpt[CurlSslOpt["NoPartialChain"] = 4] = "NoPartialChain";
})(CurlSslOpt = exports.CurlSslOpt || (exports.CurlSslOpt = {}));
//# sourceMappingURL=CurlSslOpt.js.map

/***/ }),
/* 91 */,
/* 92 */,
/* 93 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var Stream = __webpack_require__(413).Stream

module.exports = legacy

function legacy (fs) {
  return {
    ReadStream: ReadStream,
    WriteStream: WriteStream
  }

  function ReadStream (path, options) {
    if (!(this instanceof ReadStream)) return new ReadStream(path, options);

    Stream.call(this);

    var self = this;

    this.path = path;
    this.fd = null;
    this.readable = true;
    this.paused = false;

    this.flags = 'r';
    this.mode = 438; /*=0666*/
    this.bufferSize = 64 * 1024;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.encoding) this.setEncoding(this.encoding);

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.end === undefined) {
        this.end = Infinity;
      } else if ('number' !== typeof this.end) {
        throw TypeError('end must be a Number');
      }

      if (this.start > this.end) {
        throw new Error('start must be <= end');
      }

      this.pos = this.start;
    }

    if (this.fd !== null) {
      process.nextTick(function() {
        self._read();
      });
      return;
    }

    fs.open(this.path, this.flags, this.mode, function (err, fd) {
      if (err) {
        self.emit('error', err);
        self.readable = false;
        return;
      }

      self.fd = fd;
      self.emit('open', fd);
      self._read();
    })
  }

  function WriteStream (path, options) {
    if (!(this instanceof WriteStream)) return new WriteStream(path, options);

    Stream.call(this);

    this.path = path;
    this.fd = null;
    this.writable = true;

    this.flags = 'w';
    this.encoding = 'binary';
    this.mode = 438; /*=0666*/
    this.bytesWritten = 0;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.start < 0) {
        throw new Error('start must be >= zero');
      }

      this.pos = this.start;
    }

    this.busy = false;
    this._queue = [];

    if (this.fd === null) {
      this._open = fs.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
      this.flush();
    }
  }
}


/***/ }),
/* 94 */,
/* 95 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(598)
const path = __webpack_require__(622)
const copySync = __webpack_require__(43).copySync
const removeSync = __webpack_require__(723).removeSync
const mkdirpSync = __webpack_require__(727).mkdirpSync
const stat = __webpack_require__(127)

function moveSync (src, dest, opts) {
  opts = opts || {}
  const overwrite = opts.overwrite || opts.clobber || false

  const { srcStat } = stat.checkPathsSync(src, dest, 'move')
  stat.checkParentPathsSync(src, srcStat, dest, 'move')
  mkdirpSync(path.dirname(dest))
  return doRename(src, dest, overwrite)
}

function doRename (src, dest, overwrite) {
  if (overwrite) {
    removeSync(dest)
    return rename(src, dest, overwrite)
  }
  if (fs.existsSync(dest)) throw new Error('dest already exists.')
  return rename(src, dest, overwrite)
}

function rename (src, dest, overwrite) {
  try {
    fs.renameSync(src, dest)
  } catch (err) {
    if (err.code !== 'EXDEV') throw err
    return moveAcrossDevice(src, dest, overwrite)
  }
}

function moveAcrossDevice (src, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true
  }
  copySync(src, dest, opts)
  return removeSync(src)
}

module.exports = moveSync


/***/ }),
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var Type = __webpack_require__(945);

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;

  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

module.exports = new Type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});


/***/ }),
/* 101 */,
/* 102 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__webpack_require__(747));
const os = __importStar(__webpack_require__(87));
const utils_1 = __webpack_require__(82);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(598)
const path = __webpack_require__(622)
const mkdirsSync = __webpack_require__(727).mkdirsSync
const utimesMillisSync = __webpack_require__(946).utimesMillisSync
const stat = __webpack_require__(127)

function copySync (src, dest, opts) {
  if (typeof opts === 'function') {
    opts = { filter: opts }
  }

  opts = opts || {}
  opts.clobber = 'clobber' in opts ? !!opts.clobber : true // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`)
  }

  const { srcStat, destStat } = stat.checkPathsSync(src, dest, 'copy')
  stat.checkParentPathsSync(src, srcStat, dest, 'copy')
  return handleFilterAndCopy(destStat, src, dest, opts)
}

function handleFilterAndCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  const destParent = path.dirname(dest)
  if (!fs.existsSync(destParent)) mkdirsSync(destParent)
  return startCopy(destStat, src, dest, opts)
}

function startCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  return getStats(destStat, src, dest, opts)
}

function getStats (destStat, src, dest, opts) {
  const statSync = opts.dereference ? fs.statSync : fs.lstatSync
  const srcStat = statSync(src)

  if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts)
  else if (srcStat.isFile() ||
           srcStat.isCharacterDevice() ||
           srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts)
  else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts)
}

function onFile (srcStat, destStat, src, dest, opts) {
  if (!destStat) return copyFile(srcStat, src, dest, opts)
  return mayCopyFile(srcStat, src, dest, opts)
}

function mayCopyFile (srcStat, src, dest, opts) {
  if (opts.overwrite) {
    fs.unlinkSync(dest)
    return copyFile(srcStat, src, dest, opts)
  } else if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`)
  }
}

function copyFile (srcStat, src, dest, opts) {
  fs.copyFileSync(src, dest)
  if (opts.preserveTimestamps) handleTimestamps(srcStat.mode, src, dest)
  return setDestMode(dest, srcStat.mode)
}

function handleTimestamps (srcMode, src, dest) {
  // Make sure the file is writable before setting the timestamp
  // otherwise open fails with EPERM when invoked with 'r+'
  // (through utimes call)
  if (fileIsNotWritable(srcMode)) makeFileWritable(dest, srcMode)
  return setDestTimestamps(src, dest)
}

function fileIsNotWritable (srcMode) {
  return (srcMode & 0o200) === 0
}

function makeFileWritable (dest, srcMode) {
  return setDestMode(dest, srcMode | 0o200)
}

function setDestMode (dest, srcMode) {
  return fs.chmodSync(dest, srcMode)
}

function setDestTimestamps (src, dest) {
  // The initial srcStat.atime cannot be trusted
  // because it is modified by the read(2) system call
  // (See https://nodejs.org/api/fs.html#fs_stat_time_values)
  const updatedSrcStat = fs.statSync(src)
  return utimesMillisSync(dest, updatedSrcStat.atime, updatedSrcStat.mtime)
}

function onDir (srcStat, destStat, src, dest, opts) {
  if (!destStat) return mkDirAndCopy(srcStat.mode, src, dest, opts)
  if (destStat && !destStat.isDirectory()) {
    throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`)
  }
  return copyDir(src, dest, opts)
}

function mkDirAndCopy (srcMode, src, dest, opts) {
  fs.mkdirSync(dest)
  copyDir(src, dest, opts)
  return setDestMode(dest, srcMode)
}

function copyDir (src, dest, opts) {
  fs.readdirSync(src).forEach(item => copyDirItem(item, src, dest, opts))
}

function copyDirItem (item, src, dest, opts) {
  const srcItem = path.join(src, item)
  const destItem = path.join(dest, item)
  const { destStat } = stat.checkPathsSync(srcItem, destItem, 'copy')
  return startCopy(destStat, srcItem, destItem, opts)
}

function onLink (destStat, src, dest, opts) {
  let resolvedSrc = fs.readlinkSync(src)
  if (opts.dereference) {
    resolvedSrc = path.resolve(process.cwd(), resolvedSrc)
  }

  if (!destStat) {
    return fs.symlinkSync(resolvedSrc, dest)
  } else {
    let resolvedDest
    try {
      resolvedDest = fs.readlinkSync(dest)
    } catch (err) {
      // dest exists and is a regular file or directory,
      // Windows may throw UNKNOWN error. If dest already exists,
      // fs throws error anyway, so no need to guard against it here.
      if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return fs.symlinkSync(resolvedSrc, dest)
      throw err
    }
    if (opts.dereference) {
      resolvedDest = path.resolve(process.cwd(), resolvedDest)
    }
    if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) {
      throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`)
    }

    // prevent copy if src is a subdir of dest since unlinking
    // dest in this case would result in removing src contents
    // and therefore a broken symlink would be created.
    if (fs.statSync(dest).isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) {
      throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`)
    }
    return copyLink(resolvedSrc, dest)
  }
}

function copyLink (resolvedSrc, dest) {
  fs.unlinkSync(dest)
  return fs.symlinkSync(resolvedSrc, dest)
}

module.exports = copySync


/***/ }),
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const os = __webpack_require__(87);

const nameMap = new Map([
	[20, ['Big Sur', '11']],
	[19, ['Catalina', '10.15']],
	[18, ['Mojave', '10.14']],
	[17, ['High Sierra', '10.13']],
	[16, ['Sierra', '10.12']],
	[15, ['El Capitan', '10.11']],
	[14, ['Yosemite', '10.10']],
	[13, ['Mavericks', '10.9']],
	[12, ['Mountain Lion', '10.8']],
	[11, ['Lion', '10.7']],
	[10, ['Snow Leopard', '10.6']],
	[9, ['Leopard', '10.5']],
	[8, ['Tiger', '10.4']],
	[7, ['Panther', '10.3']],
	[6, ['Jaguar', '10.2']],
	[5, ['Puma', '10.1']]
]);

const macosRelease = release => {
	release = Number((release || os.release()).split('.')[0]);

	const [name, version] = nameMap.get(release);

	return {
		name,
		version
	};
};

module.exports = macosRelease;
// TODO: remove this in the next major version
module.exports.default = macosRelease;


/***/ }),
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlSslVersionMax = exports.CurlSslVersion = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be82545348/include/curl/curl.h#L2015
/**
 * Object with constants for option `SSLVERSION`
 *
 * `CURL_SSLVERSION_DEFAULT` becomes `CurlSslVersion.Default`
 *
 * @public
 */
var CurlSslVersion;
(function (CurlSslVersion) {
    CurlSslVersion[CurlSslVersion["Default"] = 0] = "Default";
    CurlSslVersion[CurlSslVersion["TlsV1"] = 1] = "TlsV1";
    CurlSslVersion[CurlSslVersion["SslV2"] = 2] = "SslV2";
    CurlSslVersion[CurlSslVersion["SslV3"] = 3] = "SslV3";
    CurlSslVersion[CurlSslVersion["TlsV1_0"] = 4] = "TlsV1_0";
    CurlSslVersion[CurlSslVersion["TlsV1_1"] = 5] = "TlsV1_1";
    CurlSslVersion[CurlSslVersion["TlsV1_2"] = 6] = "TlsV1_2";
    CurlSslVersion[CurlSslVersion["TlsV1_3"] = 7] = "TlsV1_3";
})(CurlSslVersion = exports.CurlSslVersion || (exports.CurlSslVersion = {}));
/**
 * Object with constants for option `SSLVERSION`
 *
 * The maximum TLS version can be set by using one of the `CurlSslVersionMax` fields of this Enum.
 * It is also possible to OR one of the `CurlSslVersion` fields with one of `CurlSslVersionMax`
 *
 * `CURL_SSLVERSION_MAX_TLSv1_0` becomes `CurlSslVersionMax.TlsV1_0`
 *
 * @public
 */
var CurlSslVersionMax;
(function (CurlSslVersionMax) {
    CurlSslVersionMax[CurlSslVersionMax["None"] = 0] = "None";
    CurlSslVersionMax[CurlSslVersionMax["Default"] = 65536] = "Default";
    CurlSslVersionMax[CurlSslVersionMax["TlsV1_0"] = 262144] = "TlsV1_0";
    CurlSslVersionMax[CurlSslVersionMax["TlsV1_1"] = 327680] = "TlsV1_1";
    CurlSslVersionMax[CurlSslVersionMax["TlsV1_2"] = 393216] = "TlsV1_2";
    CurlSslVersionMax[CurlSslVersionMax["TlsV1_3"] = 458752] = "TlsV1_3";
})(CurlSslVersionMax = exports.CurlSslVersionMax || (exports.CurlSslVersionMax = {}));
//# sourceMappingURL=CurlSslVersion.js.map

/***/ }),
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(869)
const path = __webpack_require__(622)
const util = __webpack_require__(669)
const atLeastNode = __webpack_require__(159)

const nodeSupportsBigInt = atLeastNode('10.5.0')
const stat = (file) => nodeSupportsBigInt ? fs.stat(file, { bigint: true }) : fs.stat(file)
const statSync = (file) => nodeSupportsBigInt ? fs.statSync(file, { bigint: true }) : fs.statSync(file)

function getStats (src, dest) {
  return Promise.all([
    stat(src),
    stat(dest).catch(err => {
      if (err.code === 'ENOENT') return null
      throw err
    })
  ]).then(([srcStat, destStat]) => ({ srcStat, destStat }))
}

function getStatsSync (src, dest) {
  let destStat
  const srcStat = statSync(src)
  try {
    destStat = statSync(dest)
  } catch (err) {
    if (err.code === 'ENOENT') return { srcStat, destStat: null }
    throw err
  }
  return { srcStat, destStat }
}

function checkPaths (src, dest, funcName, cb) {
  util.callbackify(getStats)(src, dest, (err, stats) => {
    if (err) return cb(err)
    const { srcStat, destStat } = stats
    if (destStat && areIdentical(srcStat, destStat)) {
      return cb(new Error('Source and destination must not be the same.'))
    }
    if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
      return cb(new Error(errMsg(src, dest, funcName)))
    }
    return cb(null, { srcStat, destStat })
  })
}

function checkPathsSync (src, dest, funcName) {
  const { srcStat, destStat } = getStatsSync(src, dest)
  if (destStat && areIdentical(srcStat, destStat)) {
    throw new Error('Source and destination must not be the same.')
  }
  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return { srcStat, destStat }
}

// recursively check if dest parent is a subdirectory of src.
// It works for all file types including symlinks since it
// checks the src and dest inodes. It starts from the deepest
// parent and stops once it reaches the src parent or the root path.
function checkParentPaths (src, srcStat, dest, funcName, cb) {
  const srcParent = path.resolve(path.dirname(src))
  const destParent = path.resolve(path.dirname(dest))
  if (destParent === srcParent || destParent === path.parse(destParent).root) return cb()
  const callback = (err, destStat) => {
    if (err) {
      if (err.code === 'ENOENT') return cb()
      return cb(err)
    }
    if (areIdentical(srcStat, destStat)) {
      return cb(new Error(errMsg(src, dest, funcName)))
    }
    return checkParentPaths(src, srcStat, destParent, funcName, cb)
  }
  if (nodeSupportsBigInt) fs.stat(destParent, { bigint: true }, callback)
  else fs.stat(destParent, callback)
}

function checkParentPathsSync (src, srcStat, dest, funcName) {
  const srcParent = path.resolve(path.dirname(src))
  const destParent = path.resolve(path.dirname(dest))
  if (destParent === srcParent || destParent === path.parse(destParent).root) return
  let destStat
  try {
    destStat = statSync(destParent)
  } catch (err) {
    if (err.code === 'ENOENT') return
    throw err
  }
  if (areIdentical(srcStat, destStat)) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return checkParentPathsSync(src, srcStat, destParent, funcName)
}

function areIdentical (srcStat, destStat) {
  if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
    if (nodeSupportsBigInt || destStat.ino < Number.MAX_SAFE_INTEGER) {
      // definitive answer
      return true
    }
    // Use additional heuristics if we can't use 'bigint'.
    // Different 'ino' could be represented the same if they are >= Number.MAX_SAFE_INTEGER
    // See issue 657
    if (destStat.size === srcStat.size &&
        destStat.mode === srcStat.mode &&
        destStat.nlink === srcStat.nlink &&
        destStat.atimeMs === srcStat.atimeMs &&
        destStat.mtimeMs === srcStat.mtimeMs &&
        destStat.ctimeMs === srcStat.ctimeMs &&
        destStat.birthtimeMs === srcStat.birthtimeMs) {
      // heuristic answer
      return true
    }
  }
  return false
}

// return true if dest is a subdir of src, otherwise false.
// It only checks the path strings.
function isSrcSubdir (src, dest) {
  const srcArr = path.resolve(src).split(path.sep).filter(i => i)
  const destArr = path.resolve(dest).split(path.sep).filter(i => i)
  return srcArr.reduce((acc, cur, i) => acc && destArr[i] === cur, true)
}

function errMsg (src, dest, funcName) {
  return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`
}

module.exports = {
  checkPaths,
  checkPathsSync,
  checkParentPaths,
  checkParentPathsSync,
  isSrcSubdir
}


/***/ }),
/* 128 */,
/* 129 */
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var Cancel = __webpack_require__(826);

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var debug;
try {
  /* eslint global-require: off */
  debug = __webpack_require__(784)("follow-redirects");
}
catch (error) {
  debug = function () { /* */ };
}
module.exports = debug;


/***/ }),
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const u = __webpack_require__(676).fromCallback
const path = __webpack_require__(622)
const fs = __webpack_require__(598)
const mkdir = __webpack_require__(727)

function createFile (file, callback) {
  function makeFile () {
    fs.writeFile(file, '', err => {
      if (err) return callback(err)
      callback()
    })
  }

  fs.stat(file, (err, stats) => { // eslint-disable-line handle-callback-err
    if (!err && stats.isFile()) return callback()
    const dir = path.dirname(file)
    fs.stat(dir, (err, stats) => {
      if (err) {
        // if the directory doesn't exist, make it
        if (err.code === 'ENOENT') {
          return mkdir.mkdirs(dir, err => {
            if (err) return callback(err)
            makeFile()
          })
        }
        return callback(err)
      }

      if (stats.isDirectory()) makeFile()
      else {
        // parent is not a directory
        // This is just to cause an internal ENOTDIR error to be thrown
        fs.readdir(dir, err => {
          if (err) return callback(err)
        })
      }
    })
  })
}

function createFileSync (file) {
  let stats
  try {
    stats = fs.statSync(file)
  } catch {}
  if (stats && stats.isFile()) return

  const dir = path.dirname(file)
  try {
    if (!fs.statSync(dir).isDirectory()) {
      // parent is not a directory
      // This is just to cause an internal ENOTDIR error to be thrown
      fs.readdirSync(dir)
    }
  } catch (err) {
    // If the stat call above failed because the directory doesn't exist, create it
    if (err && err.code === 'ENOENT') mkdir.mkdirsSync(dir)
    else throw err
  }

  fs.writeFileSync(file, '')
}

module.exports = {
  createFile: u(createFile),
  createFileSync
}


/***/ }),
/* 150 */,
/* 151 */
/***/ (function(module) {

"use strict";

const alias = ['stdin', 'stdout', 'stderr'];

const hasAlias = opts => alias.some(x => Boolean(opts[x]));

module.exports = opts => {
	if (!opts) {
		return null;
	}

	if (opts.stdio && hasAlias(opts)) {
		throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${alias.map(x => `\`${x}\``).join(', ')}`);
	}

	if (typeof opts.stdio === 'string') {
		return opts.stdio;
	}

	const stdio = opts.stdio || [];

	if (!Array.isArray(stdio)) {
		throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
	}

	const result = [];
	const len = Math.max(stdio.length, alias.length);

	for (let i = 0; i < len; i++) {
		let value = null;

		if (stdio[i] !== undefined) {
			value = stdio[i];
		} else if (opts[alias[i]] !== undefined) {
			value = opts[alias[i]];
		}

		result[i] = value;
	}

	return result;
};


/***/ }),
/* 152 */,
/* 153 */,
/* 154 */,
/* 155 */,
/* 156 */,
/* 157 */,
/* 158 */,
/* 159 */
/***/ (function(module) {

module.exports = r => {
  const n = process.versions.node.split('.').map(x => parseInt(x, 10))
  r = r.split('.').map(x => parseInt(x, 10))
  return n[0] > r[0] || (n[0] === r[0] && (n[1] > r[1] || (n[1] === r[1] && n[2] >= r[2])))
}


/***/ }),
/* 160 */,
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlFileType = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be8254534898/include/curl/curl.h#L264
/**
 * Object with constants on the {@link FileInfo | `FileInfo`} object,
 *  used alongside the `CHUNK_BGN_FUNCTION` option
 *
 * `CURLFILETYPE_DEVICE_BLOCK` becomes `CurlFileType.DeviceBlock`
 *
 * @public
 */
var CurlFileType;
(function (CurlFileType) {
    CurlFileType[CurlFileType["File"] = 0] = "File";
    CurlFileType[CurlFileType["Directory"] = 1] = "Directory";
    CurlFileType[CurlFileType["Symlink"] = 2] = "Symlink";
    CurlFileType[CurlFileType["DeviceBlock"] = 3] = "DeviceBlock";
    CurlFileType[CurlFileType["DeviceChar"] = 4] = "DeviceChar";
    CurlFileType[CurlFileType["NamedPipe"] = 5] = "NamedPipe";
    CurlFileType[CurlFileType["Socket"] = 6] = "Socket";
    CurlFileType[CurlFileType["Door"] = 7] = "Door";
})(CurlFileType = exports.CurlFileType || (exports.CurlFileType = {}));
//# sourceMappingURL=CurlFileType.js.map

/***/ }),
/* 166 */,
/* 167 */,
/* 168 */,
/* 169 */,
/* 170 */,
/* 171 */
/***/ (function(module) {

"use strict";

module.exports = /^#!.*/;


/***/ }),
/* 172 */,
/* 173 */,
/* 174 */,
/* 175 */,
/* 176 */,
/* 177 */,
/* 178 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const escapeStringRegexp = __webpack_require__(79);
const transliterate = __webpack_require__(648);
const builtinOverridableReplacements = __webpack_require__(272);

const decamelize = string => {
	return string
		// Separate capitalized words.
		.replace(/([A-Z]{2,})(\d+)/g, '$1 $2')
		.replace(/([a-z\d]+)([A-Z]{2,})/g, '$1 $2')

		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2');
};

const removeMootSeparators = (string, separator) => {
	const escapedSeparator = escapeStringRegexp(separator);

	return string
		.replace(new RegExp(`${escapedSeparator}{2,}`, 'g'), separator)
		.replace(new RegExp(`^${escapedSeparator}|${escapedSeparator}$`, 'g'), '');
};

const slugify = (string, options) => {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a string, got \`${typeof string}\``);
	}

	options = {
		separator: '-',
		lowercase: true,
		decamelize: true,
		customReplacements: [],
		preserveLeadingUnderscore: false,
		...options
	};

	const shouldPrependUnderscore = options.preserveLeadingUnderscore && string.startsWith('_');

	const customReplacements = new Map([
		...builtinOverridableReplacements,
		...options.customReplacements
	]);

	string = transliterate(string, {customReplacements});

	if (options.decamelize) {
		string = decamelize(string);
	}

	let patternSlug = /[^a-zA-Z\d]+/g;

	if (options.lowercase) {
		string = string.toLowerCase();
		patternSlug = /[^a-z\d]+/g;
	}

	string = string.replace(patternSlug, options.separator);
	string = string.replace(/\\/g, '');
	if (options.separator) {
		string = removeMootSeparators(string, options.separator);
	}

	if (shouldPrependUnderscore) {
		string = `_${string}`;
	}

	return string;
};

const counter = () => {
	const occurrences = new Map();

	const countable = (string, options) => {
		string = slugify(string, options);

		if (!string) {
			return '';
		}

		const stringLower = string.toLowerCase();
		const numberless = occurrences.get(stringLower.replace(/(?:-\d+?)+?$/, '')) || 0;
		const counter = occurrences.get(stringLower);
		occurrences.set(stringLower, typeof counter === 'number' ? counter + 1 : 1);
		const newCounter = occurrences.get(stringLower) || 2;
		if (newCounter >= 2 || numberless > 2) {
			string = `${string}-${newCounter}`;
		}

		return string;
	};

	countable.reset = () => {
		occurrences.clear();
	};

	return countable;
};

module.exports = slugify;
module.exports.counter = counter;


/***/ }),
/* 179 */,
/* 180 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";



var common = __webpack_require__(740);


function Mark(name, buffer, position, line, column) {
  this.name     = name;
  this.buffer   = buffer;
  this.position = position;
  this.line     = line;
  this.column   = column;
}


Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
  var head, start, tail, end, snippet;

  if (!this.buffer) return null;

  indent = indent || 4;
  maxLength = maxLength || 75;

  head = '';
  start = this.position;

  while (start > 0 && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(start - 1)) === -1) {
    start -= 1;
    if (this.position - start > (maxLength / 2 - 1)) {
      head = ' ... ';
      start += 5;
      break;
    }
  }

  tail = '';
  end = this.position;

  while (end < this.buffer.length && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(end)) === -1) {
    end += 1;
    if (end - this.position > (maxLength / 2 - 1)) {
      tail = ' ... ';
      end -= 5;
      break;
    }
  }

  snippet = this.buffer.slice(start, end);

  return common.repeat(' ', indent) + head + snippet + tail + '\n' +
         common.repeat(' ', indent + this.position - start + head.length) + '^';
};


Mark.prototype.toString = function toString(compact) {
  var snippet, where = '';

  if (this.name) {
    where += 'in "' + this.name + '" ';
  }

  where += 'at line ' + (this.line + 1) + ', column ' + (this.column + 1);

  if (!compact) {
    snippet = this.getSnippet();

    if (snippet) {
      where += ':\n' + snippet;
    }
  }

  return where;
};


module.exports = Mark;


/***/ }),
/* 181 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var Type = __webpack_require__(945);

var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _toString       = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (data === null) return true;

  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if (_toString.call(pair) !== '[object Object]') return false;

    for (pairKey in pair) {
      if (_hasOwnProperty.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }

    if (!pairHasKey) return false;

    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }

  return true;
}

function constructYamlOmap(data) {
  return data !== null ? data : [];
}

module.exports = new Type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});


/***/ }),
/* 182 */,
/* 183 */,
/* 184 */,
/* 185 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlProtocol = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be8254534898fccafc5d6cd04f6235f283cfbd/include/curl/curl.h#L893
// not following Enum name convention here because it feels more natural that way
/**
 * Object with the protocols supported by libcurl, as bitmasks.
 * Should be used when setting `PROTOCOLS` and `REDIR_PROTOCOLS` options.
 *
 * `CURLPROTO_HTTP` becomes `CurlProtocol.HTTP`
 *
 * @public
 */
var CurlProtocol;
(function (CurlProtocol) {
    CurlProtocol[CurlProtocol["HTTP"] = 1] = "HTTP";
    CurlProtocol[CurlProtocol["HTTPS"] = 2] = "HTTPS";
    CurlProtocol[CurlProtocol["FTP"] = 4] = "FTP";
    CurlProtocol[CurlProtocol["FTPS"] = 8] = "FTPS";
    CurlProtocol[CurlProtocol["SCP"] = 16] = "SCP";
    CurlProtocol[CurlProtocol["SFTP"] = 32] = "SFTP";
    CurlProtocol[CurlProtocol["TELNET"] = 64] = "TELNET";
    CurlProtocol[CurlProtocol["LDAP"] = 128] = "LDAP";
    CurlProtocol[CurlProtocol["LDAPS"] = 256] = "LDAPS";
    CurlProtocol[CurlProtocol["DICT"] = 512] = "DICT";
    CurlProtocol[CurlProtocol["FILE"] = 1024] = "FILE";
    CurlProtocol[CurlProtocol["TFTP"] = 2048] = "TFTP";
    CurlProtocol[CurlProtocol["IMAP"] = 4096] = "IMAP";
    CurlProtocol[CurlProtocol["IMAPS"] = 8192] = "IMAPS";
    CurlProtocol[CurlProtocol["POP3"] = 16384] = "POP3";
    CurlProtocol[CurlProtocol["POP3S"] = 32768] = "POP3S";
    CurlProtocol[CurlProtocol["SMTP"] = 65536] = "SMTP";
    CurlProtocol[CurlProtocol["SMTPS"] = 131072] = "SMTPS";
    CurlProtocol[CurlProtocol["RTSP"] = 262144] = "RTSP";
    CurlProtocol[CurlProtocol["RTMP"] = 524288] = "RTMP";
    CurlProtocol[CurlProtocol["RTMPT"] = 1048576] = "RTMPT";
    CurlProtocol[CurlProtocol["RTMPE"] = 2097152] = "RTMPE";
    CurlProtocol[CurlProtocol["RTMPTE"] = 4194304] = "RTMPTE";
    CurlProtocol[CurlProtocol["RTMPS"] = 8388608] = "RTMPS";
    CurlProtocol[CurlProtocol["RTMPTS"] = 16777216] = "RTMPTS";
    CurlProtocol[CurlProtocol["GOPHER"] = 33554432] = "GOPHER";
    CurlProtocol[CurlProtocol["SMB"] = 67108864] = "SMB";
    CurlProtocol[CurlProtocol["SMBS"] = 134217728] = "SMBS";
    CurlProtocol[CurlProtocol["ALL"] = -1] = "ALL";
})(CurlProtocol = exports.CurlProtocol || (exports.CurlProtocol = {}));
//# sourceMappingURL=CurlProtocol.js.map

/***/ }),
/* 186 */,
/* 187 */,
/* 188 */,
/* 189 */,
/* 190 */,
/* 191 */,
/* 192 */,
/* 193 */,
/* 194 */
/***/ (function(__unusedmodule, exports) {

"use strict";

// https://github.com/hughsk/fresh-require
Object.defineProperty(exports, "__esModule", { value: true });
function freshRequire(file) {
    const resolvedFile = require.resolve(file);
    const temp = require.cache[resolvedFile];
    delete require.cache[resolvedFile];
    const modified = require(resolvedFile);
    require.cache[resolvedFile] = temp;
    return modified;
}
exports.freshRequire = freshRequire;
//# sourceMappingURL=freshRequire.js.map

/***/ }),
/* 195 */,
/* 196 */,
/* 197 */
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = isexe
isexe.sync = sync

var fs = __webpack_require__(747)

function isexe (path, options, cb) {
  fs.stat(path, function (er, stat) {
    cb(er, er ? false : checkStat(stat, options))
  })
}

function sync (path, options) {
  return checkStat(fs.statSync(path), options)
}

function checkStat (stat, options) {
  return stat.isFile() && checkMode(stat, options)
}

function checkMode (stat, options) {
  var mod = stat.mode
  var uid = stat.uid
  var gid = stat.gid

  var myUid = options.uid !== undefined ?
    options.uid : process.getuid && process.getuid()
  var myGid = options.gid !== undefined ?
    options.gid : process.getgid && process.getgid()

  var u = parseInt('100', 8)
  var g = parseInt('010', 8)
  var o = parseInt('001', 8)
  var ug = u | g

  var ret = (mod & o) ||
    (mod & g) && gid === myGid ||
    (mod & u) && uid === myUid ||
    (mod & ug) && myUid === 0

  return ret
}


/***/ }),
/* 198 */,
/* 199 */,
/* 200 */,
/* 201 */,
/* 202 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlHttpVersion = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be825453/include/curl/curl.h#L1964
/**
 * Object with constants to be used with the `HTTP_VERSION` option.
 *
 * `CURL_HTTP_VERSION_NONE` becomes `CurlHttpVersion.None`
 *   and `CURL_HTTP_VERSION_1_0` becomes `CurlHttpVersion.V1_0`
 *
 * @public
 */
var CurlHttpVersion;
(function (CurlHttpVersion) {
    /**
     * Setting this means we don't care, and that we'd
     * like the library to choose the best possible
     * for us!
     */
    CurlHttpVersion[CurlHttpVersion["None"] = 0] = "None";
    CurlHttpVersion[CurlHttpVersion["V1_0"] = 1] = "V1_0";
    CurlHttpVersion[CurlHttpVersion["V1_1"] = 2] = "V1_1";
    CurlHttpVersion[CurlHttpVersion["V2_0"] = 3] = "V2_0";
    /**
     * Use version 2 for HTTPS, version 1.1 for HTTP
     */
    CurlHttpVersion[CurlHttpVersion["V2Tls"] = 4] = "V2Tls";
    /**
     * Use HTTP 2 without HTTP/1.1 Upgrade
     */
    CurlHttpVersion[CurlHttpVersion["V2PriorKnowledge"] = 5] = "V2PriorKnowledge";
    CurlHttpVersion[CurlHttpVersion["v3"] = 6] = "v3";
})(CurlHttpVersion = exports.CurlHttpVersion || (exports.CurlHttpVersion = {}));
//# sourceMappingURL=CurlHttpVersion.js.map

/***/ }),
/* 203 */,
/* 204 */,
/* 205 */,
/* 206 */,
/* 207 */,
/* 208 */,
/* 209 */,
/* 210 */,
/* 211 */
/***/ (function(__unusedmodule, exports) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

function getUserAgent() {
  if (typeof navigator === "object" && "userAgent" in navigator) {
    return navigator.userAgent;
  }

  if (typeof process === "object" && "version" in process) {
    return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
  }

  return "<environment undetectable>";
}

exports.getUserAgent = getUserAgent;
//# sourceMappingURL=index.js.map


/***/ }),
/* 212 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlProxy = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be8254534898f/include/curl/curl.h#L692
/**
 * Object with constants for option `PROXYTYPE`
 *
 * `CURLPROXY_HTTP` becomes `CurlProxy.Http`
 *
 * @public
 */
var CurlProxy;
(function (CurlProxy) {
    CurlProxy[CurlProxy["Http"] = 0] = "Http";
    CurlProxy[CurlProxy["Http_1_0"] = 1] = "Http_1_0";
    CurlProxy[CurlProxy["Https"] = 2] = "Https";
    CurlProxy[CurlProxy["Socks4"] = 4] = "Socks4";
    CurlProxy[CurlProxy["Socks5"] = 5] = "Socks5";
    CurlProxy[CurlProxy["Socks4A"] = 6] = "Socks4A";
    CurlProxy[CurlProxy["Socks5Hostname"] = 7] = "Socks5Hostname";
})(CurlProxy = exports.CurlProxy || (exports.CurlProxy = {}));
//# sourceMappingURL=CurlProxy.js.map

/***/ }),
/* 213 */,
/* 214 */,
/* 215 */,
/* 216 */,
/* 217 */,
/* 218 */,
/* 219 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);
var settle = __webpack_require__(564);
var cookies = __webpack_require__(864);
var buildURL = __webpack_require__(133);
var buildFullPath = __webpack_require__(960);
var parseHeaders = __webpack_require__(631);
var isURLSameOrigin = __webpack_require__(688);
var createError = __webpack_require__(26);

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    if (
      (utils.isBlob(requestData) || utils.isFile(requestData)) &&
      requestData.type
    ) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = unescape(encodeURIComponent(config.auth.password)) || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),
/* 220 */,
/* 221 */,
/* 222 */,
/* 223 */,
/* 224 */,
/* 225 */,
/* 226 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


module.exports = {
  // Export promiseified graceful-fs:
  ...__webpack_require__(869),
  // Export extra methods:
  ...__webpack_require__(43),
  ...__webpack_require__(774),
  ...__webpack_require__(615),
  ...__webpack_require__(472),
  ...__webpack_require__(55),
  ...__webpack_require__(727),
  ...__webpack_require__(959),
  ...__webpack_require__(353),
  ...__webpack_require__(517),
  ...__webpack_require__(322),
  ...__webpack_require__(723)
}

// Export fs.promises as a getter property so that we don't trigger
// ExperimentalWarning before fs.promises is actually accessed.
const fs = __webpack_require__(747)
if (Object.getOwnPropertyDescriptor(fs, 'promises')) {
  Object.defineProperty(module.exports, 'promises', {
    get () { return fs.promises }
  })
}


/***/ }),
/* 227 */,
/* 228 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var Type = __webpack_require__(945);

function resolveYamlBoolean(data) {
  if (data === null) return false;

  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
}

function constructYamlBoolean(data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE';
}

function isBoolean(object) {
  return Object.prototype.toString.call(object) === '[object Boolean]';
}

module.exports = new Type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  defaultStyle: 'lowercase'
});


/***/ }),
/* 229 */,
/* 230 */,
/* 231 */,
/* 232 */,
/* 233 */,
/* 234 */
/***/ (function(module) {

"use strict";


// See http://www.robvanderwoude.com/escapechars.php
const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;

function escapeCommand(arg) {
    // Escape meta chars
    arg = arg.replace(metaCharsRegExp, '^$1');

    return arg;
}

function escapeArgument(arg, doubleEscapeMetaChars) {
    // Convert to string
    arg = `${arg}`;

    // Algorithm below is based on https://qntm.org/cmd

    // Sequence of backslashes followed by a double quote:
    // double up all the backslashes and escape the double quote
    arg = arg.replace(/(\\*)"/g, '$1$1\\"');

    // Sequence of backslashes followed by the end of the string
    // (which will become a double quote later):
    // double up all the backslashes
    arg = arg.replace(/(\\*)$/, '$1$1');

    // All other backslashes occur literally

    // Quote the whole thing:
    arg = `"${arg}"`;

    // Escape meta chars
    arg = arg.replace(metaCharsRegExp, '^$1');

    // Double escape meta chars if necessary
    if (doubleEscapeMetaChars) {
        arg = arg.replace(metaCharsRegExp, '^$1');
    }

    return arg;
}

module.exports.command = escapeCommand;
module.exports.argument = escapeArgument;


/***/ }),
/* 235 */,
/* 236 */,
/* 237 */,
/* 238 */,
/* 239 */,
/* 240 */,
/* 241 */,
/* 242 */,
/* 243 */,
/* 244 */,
/* 245 */,
/* 246 */,
/* 247 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const os = __webpack_require__(87);
const hasFlag = __webpack_require__(364);

const env = process.env;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false')) {
	forceColor = false;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = true;
}
if ('FORCE_COLOR' in env) {
	forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(stream) {
	if (forceColor === false) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (stream && !stream.isTTY && forceColor !== true) {
		return 0;
	}

	const min = forceColor ? 1 : 0;

	if (process.platform === 'win32') {
		// Node.js 7.5.0 is the first version of Node.js to include a patch to
		// libuv that enables 256 color output on Windows. Anything earlier and it
		// won't work. However, here we target Node.js 8 at minimum as it is an LTS
		// release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
		// release that supports 256 colors. Windows 10 build 14931 is the first release
		// that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(process.versions.node.split('.')[0]) >= 8 &&
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	if (env.TERM === 'dumb') {
		return min;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream);
	return translateLevel(level);
}

module.exports = {
	supportsColor: getSupportLevel,
	stdout: getSupportLevel(process.stdout),
	stderr: getSupportLevel(process.stderr)
};


/***/ }),
/* 248 */,
/* 249 */,
/* 250 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var constants = __webpack_require__(619)

var origCwd = process.cwd
var cwd = null

var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform

process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process)
  return cwd
}
try {
  process.cwd()
} catch (er) {}

var chdir = process.chdir
process.chdir = function(d) {
  cwd = null
  chdir.call(process, d)
}

module.exports = patch

function patch (fs) {
  // (re-)implement some things that are known busted or missing.

  // lchmod, broken prior to 0.6.2
  // back-port the fix here.
  if (constants.hasOwnProperty('O_SYMLINK') &&
      process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs)
  }

  // lutimes implementation, or no-op
  if (!fs.lutimes) {
    patchLutimes(fs)
  }

  // https://github.com/isaacs/node-graceful-fs/issues/4
  // Chown should not fail on einval or eperm if non-root.
  // It should not fail on enosys ever, as this just indicates
  // that a fs doesn't support the intended operation.

  fs.chown = chownFix(fs.chown)
  fs.fchown = chownFix(fs.fchown)
  fs.lchown = chownFix(fs.lchown)

  fs.chmod = chmodFix(fs.chmod)
  fs.fchmod = chmodFix(fs.fchmod)
  fs.lchmod = chmodFix(fs.lchmod)

  fs.chownSync = chownFixSync(fs.chownSync)
  fs.fchownSync = chownFixSync(fs.fchownSync)
  fs.lchownSync = chownFixSync(fs.lchownSync)

  fs.chmodSync = chmodFixSync(fs.chmodSync)
  fs.fchmodSync = chmodFixSync(fs.fchmodSync)
  fs.lchmodSync = chmodFixSync(fs.lchmodSync)

  fs.stat = statFix(fs.stat)
  fs.fstat = statFix(fs.fstat)
  fs.lstat = statFix(fs.lstat)

  fs.statSync = statFixSync(fs.statSync)
  fs.fstatSync = statFixSync(fs.fstatSync)
  fs.lstatSync = statFixSync(fs.lstatSync)

  // if lchmod/lchown do not exist, then make them no-ops
  if (!fs.lchmod) {
    fs.lchmod = function (path, mode, cb) {
      if (cb) process.nextTick(cb)
    }
    fs.lchmodSync = function () {}
  }
  if (!fs.lchown) {
    fs.lchown = function (path, uid, gid, cb) {
      if (cb) process.nextTick(cb)
    }
    fs.lchownSync = function () {}
  }

  // on Windows, A/V software can lock the directory, causing this
  // to fail with an EACCES or EPERM if the directory contains newly
  // created files.  Try again on failure, for up to 60 seconds.

  // Set the timeout this long because some Windows Anti-Virus, such as Parity
  // bit9, may lock files for up to a minute, causing npm package install
  // failures. Also, take care to yield the scheduler. Windows scheduling gives
  // CPU to a busy looping process, which can cause the program causing the lock
  // contention to be starved of CPU by node, so the contention doesn't resolve.
  if (platform === "win32") {
    fs.rename = (function (fs$rename) { return function (from, to, cb) {
      var start = Date.now()
      var backoff = 0;
      fs$rename(from, to, function CB (er) {
        if (er
            && (er.code === "EACCES" || er.code === "EPERM")
            && Date.now() - start < 60000) {
          setTimeout(function() {
            fs.stat(to, function (stater, st) {
              if (stater && stater.code === "ENOENT")
                fs$rename(from, to, CB);
              else
                cb(er)
            })
          }, backoff)
          if (backoff < 100)
            backoff += 10;
          return;
        }
        if (cb) cb(er)
      })
    }})(fs.rename)
  }

  // if read() returns EAGAIN, then just try it again.
  fs.read = (function (fs$read) {
    function read (fd, buffer, offset, length, position, callback_) {
      var callback
      if (callback_ && typeof callback_ === 'function') {
        var eagCounter = 0
        callback = function (er, _, __) {
          if (er && er.code === 'EAGAIN' && eagCounter < 10) {
            eagCounter ++
            return fs$read.call(fs, fd, buffer, offset, length, position, callback)
          }
          callback_.apply(this, arguments)
        }
      }
      return fs$read.call(fs, fd, buffer, offset, length, position, callback)
    }

    // This ensures `util.promisify` works as it does for native `fs.read`.
    read.__proto__ = fs$read
    return read
  })(fs.read)

  fs.readSync = (function (fs$readSync) { return function (fd, buffer, offset, length, position) {
    var eagCounter = 0
    while (true) {
      try {
        return fs$readSync.call(fs, fd, buffer, offset, length, position)
      } catch (er) {
        if (er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++
          continue
        }
        throw er
      }
    }
  }})(fs.readSync)

  function patchLchmod (fs) {
    fs.lchmod = function (path, mode, callback) {
      fs.open( path
             , constants.O_WRONLY | constants.O_SYMLINK
             , mode
             , function (err, fd) {
        if (err) {
          if (callback) callback(err)
          return
        }
        // prefer to return the chmod error, if one occurs,
        // but still try to close, and report closing errors if they occur.
        fs.fchmod(fd, mode, function (err) {
          fs.close(fd, function(err2) {
            if (callback) callback(err || err2)
          })
        })
      })
    }

    fs.lchmodSync = function (path, mode) {
      var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode)

      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      var threw = true
      var ret
      try {
        ret = fs.fchmodSync(fd, mode)
        threw = false
      } finally {
        if (threw) {
          try {
            fs.closeSync(fd)
          } catch (er) {}
        } else {
          fs.closeSync(fd)
        }
      }
      return ret
    }
  }

  function patchLutimes (fs) {
    if (constants.hasOwnProperty("O_SYMLINK")) {
      fs.lutimes = function (path, at, mt, cb) {
        fs.open(path, constants.O_SYMLINK, function (er, fd) {
          if (er) {
            if (cb) cb(er)
            return
          }
          fs.futimes(fd, at, mt, function (er) {
            fs.close(fd, function (er2) {
              if (cb) cb(er || er2)
            })
          })
        })
      }

      fs.lutimesSync = function (path, at, mt) {
        var fd = fs.openSync(path, constants.O_SYMLINK)
        var ret
        var threw = true
        try {
          ret = fs.futimesSync(fd, at, mt)
          threw = false
        } finally {
          if (threw) {
            try {
              fs.closeSync(fd)
            } catch (er) {}
          } else {
            fs.closeSync(fd)
          }
        }
        return ret
      }

    } else {
      fs.lutimes = function (_a, _b, _c, cb) { if (cb) process.nextTick(cb) }
      fs.lutimesSync = function () {}
    }
  }

  function chmodFix (orig) {
    if (!orig) return orig
    return function (target, mode, cb) {
      return orig.call(fs, target, mode, function (er) {
        if (chownErOk(er)) er = null
        if (cb) cb.apply(this, arguments)
      })
    }
  }

  function chmodFixSync (orig) {
    if (!orig) return orig
    return function (target, mode) {
      try {
        return orig.call(fs, target, mode)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }


  function chownFix (orig) {
    if (!orig) return orig
    return function (target, uid, gid, cb) {
      return orig.call(fs, target, uid, gid, function (er) {
        if (chownErOk(er)) er = null
        if (cb) cb.apply(this, arguments)
      })
    }
  }

  function chownFixSync (orig) {
    if (!orig) return orig
    return function (target, uid, gid) {
      try {
        return orig.call(fs, target, uid, gid)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }

  function statFix (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options, cb) {
      if (typeof options === 'function') {
        cb = options
        options = null
      }
      function callback (er, stats) {
        if (stats) {
          if (stats.uid < 0) stats.uid += 0x100000000
          if (stats.gid < 0) stats.gid += 0x100000000
        }
        if (cb) cb.apply(this, arguments)
      }
      return options ? orig.call(fs, target, options, callback)
        : orig.call(fs, target, callback)
    }
  }

  function statFixSync (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options) {
      var stats = options ? orig.call(fs, target, options)
        : orig.call(fs, target)
      if (stats.uid < 0) stats.uid += 0x100000000
      if (stats.gid < 0) stats.gid += 0x100000000
      return stats;
    }
  }

  // ENOSYS means that the fs doesn't support the op. Just ignore
  // that, because it doesn't matter.
  //
  // if there's no getuid, or if getuid() is something other
  // than 0, and the error is EINVAL or EPERM, then just ignore
  // it.
  //
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  //
  // When running as root, or if other types of errors are
  // encountered, then it's strict.
  function chownErOk (er) {
    if (!er)
      return true

    if (er.code === "ENOSYS")
      return true

    var nonroot = !process.getuid || process.getuid() !== 0
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true
    }

    return false
  }
}


/***/ }),
/* 251 */,
/* 252 */,
/* 253 */,
/* 254 */,
/* 255 */,
/* 256 */,
/* 257 */
/***/ (function(module) {

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match Latin Unicode letters (excluding mathematical operators). */
var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

/** Used to compose unicode character classes. */
var rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
    rsComboSymbolsRange = '\\u20d0-\\u20f0';

/** Used to compose unicode capture groups. */
var rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']';

/**
 * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
 * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
 */
var reComboMark = RegExp(rsCombo, 'g');

/** Used to map Latin Unicode letters to basic Latin letters. */
var deburredLetters = {
  // Latin-1 Supplement block.
  '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
  '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
  '\xc7': 'C',  '\xe7': 'c',
  '\xd0': 'D',  '\xf0': 'd',
  '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
  '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
  '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
  '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
  '\xd1': 'N',  '\xf1': 'n',
  '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
  '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
  '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
  '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
  '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
  '\xc6': 'Ae', '\xe6': 'ae',
  '\xde': 'Th', '\xfe': 'th',
  '\xdf': 'ss',
  // Latin Extended-A block.
  '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
  '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
  '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
  '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
  '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
  '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
  '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
  '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
  '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
  '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
  '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
  '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
  '\u0134': 'J',  '\u0135': 'j',
  '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
  '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
  '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
  '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
  '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
  '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
  '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
  '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
  '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
  '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
  '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
  '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
  '\u0163': 't',  '\u0165': 't', '\u0167': 't',
  '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
  '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
  '\u0174': 'W',  '\u0175': 'w',
  '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
  '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
  '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
  '\u0132': 'IJ', '\u0133': 'ij',
  '\u0152': 'Oe', '\u0153': 'oe',
  '\u0149': "'n", '\u017f': 'ss'
};

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * The base implementation of `_.propertyOf` without support for deep paths.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyOf(object) {
  return function(key) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
 * letters to basic Latin letters.
 *
 * @private
 * @param {string} letter The matched letter to deburr.
 * @returns {string} Returns the deburred letter.
 */
var deburrLetter = basePropertyOf(deburredLetters);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Symbol = root.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Deburrs `string` by converting
 * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
 * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
 * letters to basic Latin letters and removing
 * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to deburr.
 * @returns {string} Returns the deburred string.
 * @example
 *
 * _.deburr('déjà vu');
 * // => 'deja vu'
 */
function deburr(string) {
  string = toString(string);
  return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
}

module.exports = deburr;


/***/ }),
/* 258 */,
/* 259 */,
/* 260 */
/***/ (function(module, __unusedexports, __webpack_require__) {

// Note: since nyc uses this module to output coverage, any lines
// that are in the direct sync flow of nyc's outputCoverage are
// ignored, since we can never get coverage for them.
var assert = __webpack_require__(357)
var signals = __webpack_require__(654)
var isWin = /^win/i.test(process.platform)

var EE = __webpack_require__(614)
/* istanbul ignore if */
if (typeof EE !== 'function') {
  EE = EE.EventEmitter
}

var emitter
if (process.__signal_exit_emitter__) {
  emitter = process.__signal_exit_emitter__
} else {
  emitter = process.__signal_exit_emitter__ = new EE()
  emitter.count = 0
  emitter.emitted = {}
}

// Because this emitter is a global, we have to check to see if a
// previous version of this library failed to enable infinite listeners.
// I know what you're about to say.  But literally everything about
// signal-exit is a compromise with evil.  Get used to it.
if (!emitter.infinite) {
  emitter.setMaxListeners(Infinity)
  emitter.infinite = true
}

module.exports = function (cb, opts) {
  assert.equal(typeof cb, 'function', 'a callback must be provided for exit handler')

  if (loaded === false) {
    load()
  }

  var ev = 'exit'
  if (opts && opts.alwaysLast) {
    ev = 'afterexit'
  }

  var remove = function () {
    emitter.removeListener(ev, cb)
    if (emitter.listeners('exit').length === 0 &&
        emitter.listeners('afterexit').length === 0) {
      unload()
    }
  }
  emitter.on(ev, cb)

  return remove
}

module.exports.unload = unload
function unload () {
  if (!loaded) {
    return
  }
  loaded = false

  signals.forEach(function (sig) {
    try {
      process.removeListener(sig, sigListeners[sig])
    } catch (er) {}
  })
  process.emit = originalProcessEmit
  process.reallyExit = originalProcessReallyExit
  emitter.count -= 1
}

function emit (event, code, signal) {
  if (emitter.emitted[event]) {
    return
  }
  emitter.emitted[event] = true
  emitter.emit(event, code, signal)
}

// { <signal>: <listener fn>, ... }
var sigListeners = {}
signals.forEach(function (sig) {
  sigListeners[sig] = function listener () {
    // If there are no other listeners, an exit is coming!
    // Simplest way: remove us and then re-send the signal.
    // We know that this will kill the process, so we can
    // safely emit now.
    var listeners = process.listeners(sig)
    if (listeners.length === emitter.count) {
      unload()
      emit('exit', null, sig)
      /* istanbul ignore next */
      emit('afterexit', null, sig)
      /* istanbul ignore next */
      if (isWin && sig === 'SIGHUP') {
        // "SIGHUP" throws an `ENOSYS` error on Windows,
        // so use a supported signal instead
        sig = 'SIGINT'
      }
      process.kill(process.pid, sig)
    }
  }
})

module.exports.signals = function () {
  return signals
}

module.exports.load = load

var loaded = false

function load () {
  if (loaded) {
    return
  }
  loaded = true

  // This is the number of onSignalExit's that are in play.
  // It's important so that we can count the correct number of
  // listeners on signals, and don't wait for the other one to
  // handle it instead of us.
  emitter.count += 1

  signals = signals.filter(function (sig) {
    try {
      process.on(sig, sigListeners[sig])
      return true
    } catch (er) {
      return false
    }
  })

  process.emit = processEmit
  process.reallyExit = processReallyExit
}

var originalProcessReallyExit = process.reallyExit
function processReallyExit (code) {
  process.exitCode = code || 0
  emit('exit', process.exitCode, null)
  /* istanbul ignore next */
  emit('afterexit', process.exitCode, null)
  /* istanbul ignore next */
  originalProcessReallyExit.call(process, process.exitCode)
}

var originalProcessEmit = process.emit
function processEmit (ev, arg) {
  if (ev === 'exit') {
    if (arg !== undefined) {
      process.exitCode = arg
    }
    var ret = originalProcessEmit.apply(this, arguments)
    emit('exit', process.exitCode, null)
    /* istanbul ignore next */
    emit('afterexit', process.exitCode, null)
    return ret
  } else {
    return originalProcessEmit.apply(this, arguments)
  }
}


/***/ }),
/* 261 */,
/* 262 */,
/* 263 */,
/* 264 */,
/* 265 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlGssApi = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be8254534898fccafc5d6cd04f6235f283cfbd/include/curl/curl.h#L7
/**
 * Object with constants for option `GSSAPI_DELEGATION`
 *
 * `CURLGSSAPI_DELEGATION_FLAG` becomes `CurlGssApi.DelegationFlag`
 *
 * @public
 */
var CurlGssApi;
(function (CurlGssApi) {
    /**
     * None, default
     */
    CurlGssApi[CurlGssApi["None"] = 0] = "None";
    /**
     * if permitted by policy
     */
    CurlGssApi[CurlGssApi["PolicyFlag"] = 1] = "PolicyFlag";
    /**
     * delegate always
     */
    CurlGssApi[CurlGssApi["DelegationFlag"] = 2] = "DelegationFlag";
})(CurlGssApi = exports.CurlGssApi || (exports.CurlGssApi = {}));
//# sourceMappingURL=CurlGssApi.js.map

/***/ }),
/* 266 */,
/* 267 */,
/* 268 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(422);
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * node-libcurl
 * @packageDocumentation
 */
var Curl_1 = __webpack_require__(412);
Object.defineProperty(exports, "Curl", { enumerable: true, get: function () { return Curl_1.Curl; } });
var Easy_1 = __webpack_require__(309);
Object.defineProperty(exports, "Easy", { enumerable: true, get: function () { return Easy_1.Easy; } });
var Multi_1 = __webpack_require__(302);
Object.defineProperty(exports, "Multi", { enumerable: true, get: function () { return Multi_1.Multi; } });
var Share_1 = __webpack_require__(1);
Object.defineProperty(exports, "Share", { enumerable: true, get: function () { return Share_1.Share; } });
var curly_1 = __webpack_require__(397);
Object.defineProperty(exports, "curly", { enumerable: true, get: function () { return curly_1.curly; } });
// enums
tslib_1.__exportStar(__webpack_require__(591), exports);
tslib_1.__exportStar(__webpack_require__(665), exports);
tslib_1.__exportStar(__webpack_require__(989), exports);
tslib_1.__exportStar(__webpack_require__(824), exports);
tslib_1.__exportStar(__webpack_require__(165), exports);
tslib_1.__exportStar(__webpack_require__(587), exports);
tslib_1.__exportStar(__webpack_require__(707), exports);
tslib_1.__exportStar(__webpack_require__(538), exports);
tslib_1.__exportStar(__webpack_require__(48), exports);
tslib_1.__exportStar(__webpack_require__(265), exports);
tslib_1.__exportStar(__webpack_require__(686), exports);
tslib_1.__exportStar(__webpack_require__(202), exports);
tslib_1.__exportStar(__webpack_require__(380), exports);
tslib_1.__exportStar(__webpack_require__(373), exports);
tslib_1.__exportStar(__webpack_require__(800), exports);
tslib_1.__exportStar(__webpack_require__(814), exports);
tslib_1.__exportStar(__webpack_require__(390), exports);
tslib_1.__exportStar(__webpack_require__(286), exports);
tslib_1.__exportStar(__webpack_require__(185), exports);
tslib_1.__exportStar(__webpack_require__(212), exports);
tslib_1.__exportStar(__webpack_require__(624), exports);
tslib_1.__exportStar(__webpack_require__(856), exports);
tslib_1.__exportStar(__webpack_require__(854), exports);
tslib_1.__exportStar(__webpack_require__(728), exports);
tslib_1.__exportStar(__webpack_require__(358), exports);
tslib_1.__exportStar(__webpack_require__(806), exports);
tslib_1.__exportStar(__webpack_require__(90), exports);
tslib_1.__exportStar(__webpack_require__(122), exports);
tslib_1.__exportStar(__webpack_require__(62), exports);
tslib_1.__exportStar(__webpack_require__(528), exports);
tslib_1.__exportStar(__webpack_require__(644), exports);
tslib_1.__exportStar(__webpack_require__(396), exports);
tslib_1.__exportStar(__webpack_require__(279), exports);
//# sourceMappingURL=index.js.map

/***/ }),
/* 269 */,
/* 270 */,
/* 271 */
/***/ (function(module) {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),
/* 272 */
/***/ (function(module) {

"use strict";


module.exports = [
	['&', ' and '],
	['🦄', ' unicorn '],
	['♥', ' love ']
];


/***/ }),
/* 273 */,
/* 274 */,
/* 275 */,
/* 276 */,
/* 277 */,
/* 278 */,
/* 279 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketState = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * This will be the type of the second parameter passed to the callback set with
 *  {@link "Easy".Easy.onSocketEvent|`Easy#onSocketEvent`}.
 * @public
 */
var SocketState;
(function (SocketState) {
    SocketState[SocketState["Readable"] = 1] = "Readable";
    SocketState[SocketState["Writable"] = 2] = "Writable";
})(SocketState = exports.SocketState || (exports.SocketState = {}));
//# sourceMappingURL=SocketState.js.map

/***/ }),
/* 280 */
/***/ (function(module) {

module.exports = register

function register (state, name, method, options) {
  if (typeof method !== 'function') {
    throw new Error('method for before hook must be a function')
  }

  if (!options) {
    options = {}
  }

  if (Array.isArray(name)) {
    return name.reverse().reduce(function (callback, name) {
      return register.bind(null, state, name, callback, options)
    }, method)()
  }

  return Promise.resolve()
    .then(function () {
      if (!state.registry[name]) {
        return method(options)
      }

      return (state.registry[name]).reduce(function (method, registered) {
        return registered.hook.bind(null, method, options)
      }, method)()
    })
}


/***/ }),
/* 281 */,
/* 282 */,
/* 283 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),
/* 284 */,
/* 285 */,
/* 286 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlProgressFunc = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/8bd863f97b6c79f561bc063e634cecdf4badf776/include/curl/curl.h#L214-L216
/**
 * To be used with the progress callback
 *
 * `CURL_PROGRESSFUNC_CONTINUE` becomes `CurlProgressFunc.Continue`
 *
 * @public
 */
var CurlProgressFunc;
(function (CurlProgressFunc) {
    /**
     * This is a return code for the progress callback that, when returned, will
     * signal libcurl to continue executing the default progress function
     * Added on libcurl 7.68
     */
    CurlProgressFunc[CurlProgressFunc["Continue"] = 268435457] = "Continue";
})(CurlProgressFunc = exports.CurlProgressFunc || (exports.CurlProgressFunc = {}));
//# sourceMappingURL=CurlProgressFunc.js.map

/***/ }),
/* 287 */,
/* 288 */,
/* 289 */,
/* 290 */,
/* 291 */,
/* 292 */,
/* 293 */,
/* 294 */,
/* 295 */,
/* 296 */,
/* 297 */,
/* 298 */,
/* 299 */
/***/ (function(__unusedmodule, exports) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

const VERSION = "2.3.0";

/**
 * Some “list” response that can be paginated have a different response structure
 *
 * They have a `total_count` key in the response (search also has `incomplete_results`,
 * /installation/repositories also has `repository_selection`), as well as a key with
 * the list of the items which name varies from endpoint to endpoint.
 *
 * Octokit normalizes these responses so that paginated results are always returned following
 * the same structure. One challenge is that if the list response has only one page, no Link
 * header is provided, so this header alone is not sufficient to check wether a response is
 * paginated or not.
 *
 * We check if a "total_count" key is present in the response data, but also make sure that
 * a "url" property is not, as the "Get the combined status for a specific ref" endpoint would
 * otherwise match: https://developer.github.com/v3/repos/statuses/#get-the-combined-status-for-a-specific-ref
 */
function normalizePaginatedListResponse(response) {
  const responseNeedsNormalization = "total_count" in response.data && !("url" in response.data);
  if (!responseNeedsNormalization) return response; // keep the additional properties intact as there is currently no other way
  // to retrieve the same information.

  const incompleteResults = response.data.incomplete_results;
  const repositorySelection = response.data.repository_selection;
  const totalCount = response.data.total_count;
  delete response.data.incomplete_results;
  delete response.data.repository_selection;
  delete response.data.total_count;
  const namespaceKey = Object.keys(response.data)[0];
  const data = response.data[namespaceKey];
  response.data = data;

  if (typeof incompleteResults !== "undefined") {
    response.data.incomplete_results = incompleteResults;
  }

  if (typeof repositorySelection !== "undefined") {
    response.data.repository_selection = repositorySelection;
  }

  response.data.total_count = totalCount;
  return response;
}

function iterator(octokit, route, parameters) {
  const options = typeof route === "function" ? route.endpoint(parameters) : octokit.request.endpoint(route, parameters);
  const requestMethod = typeof route === "function" ? route : octokit.request;
  const method = options.method;
  const headers = options.headers;
  let url = options.url;
  return {
    [Symbol.asyncIterator]: () => ({
      next() {
        if (!url) {
          return Promise.resolve({
            done: true
          });
        }

        return requestMethod({
          method,
          url,
          headers
        }).then(normalizePaginatedListResponse).then(response => {
          // `response.headers.link` format:
          // '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
          // sets `url` to undefined if "next" URL is not present or `link` header is not set
          url = ((response.headers.link || "").match(/<([^>]+)>;\s*rel="next"/) || [])[1];
          return {
            value: response
          };
        });
      }

    })
  };
}

function paginate(octokit, route, parameters, mapFn) {
  if (typeof parameters === "function") {
    mapFn = parameters;
    parameters = undefined;
  }

  return gather(octokit, [], iterator(octokit, route, parameters)[Symbol.asyncIterator](), mapFn);
}

function gather(octokit, results, iterator, mapFn) {
  return iterator.next().then(result => {
    if (result.done) {
      return results;
    }

    let earlyExit = false;

    function done() {
      earlyExit = true;
    }

    results = results.concat(mapFn ? mapFn(result.value, done) : result.value.data);

    if (earlyExit) {
      return results;
    }

    return gather(octokit, results, iterator, mapFn);
  });
}

/**
 * @param octokit Octokit instance
 * @param options Options passed to Octokit constructor
 */

function paginateRest(octokit) {
  return {
    paginate: Object.assign(paginate.bind(null, octokit), {
      iterator: iterator.bind(null, octokit)
    })
  };
}
paginateRest.VERSION = VERSION;

exports.paginateRest = paginateRest;
//# sourceMappingURL=index.js.map


/***/ }),
/* 300 */,
/* 301 */,
/* 302 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Multi = void 0;
const bindings = __webpack_require__(367);
/**
 * This is a Node.js wrapper around the binding {@link MultiNativeBinding | native Multi class}.
 *
 * The only extra is that it provides a static field `option`.
 *
 * @public
 */
let Multi = /** @class */ (() => {
    class Multi extends bindings.Multi {
    }
    /**
     * Options to be used with {@link setOpt | `setOpt`}.
     *
     * See the official documentation of [`curl_multi_setopt()`](http://curl.haxx.se/libcurl/c/curl_multi_setopt.html)
     *  for reference.
     *
     * `CURLMOPT_MAXCONNECTS` becomes `Multi.option.MAXCONNECTS`
     */
    Multi.option = bindings.Curl.multi;
    return Multi;
})();
exports.Multi = Multi;
//# sourceMappingURL=Multi.js.map

/***/ }),
/* 303 */,
/* 304 */
/***/ (function(module) {

module.exports = require("string_decoder");

/***/ }),
/* 305 */,
/* 306 */,
/* 307 */,
/* 308 */,
/* 309 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Easy = void 0;
const bindings = __webpack_require__(367);
/**
 * This is a Node.js wrapper around the binding {@link EasyNativeBinding | native Easy class}
 *
 * @public
 */
class Easy extends bindings.Easy {
}
exports.Easy = Easy;
//# sourceMappingURL=Easy.js.map

/***/ }),
/* 310 */,
/* 311 */,
/* 312 */,
/* 313 */,
/* 314 */,
/* 315 */,
/* 316 */,
/* 317 */
/***/ (function(module) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),
/* 318 */,
/* 319 */,
/* 320 */,
/* 321 */,
/* 322 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const u = __webpack_require__(676).fromPromise
const fs = __webpack_require__(869)

function pathExists (path) {
  return fs.access(path).then(() => true).catch(() => false)
}

module.exports = {
  pathExists: u(pathExists),
  pathExistsSync: fs.existsSync
}


/***/ }),
/* 323 */,
/* 324 */,
/* 325 */,
/* 326 */,
/* 327 */,
/* 328 */,
/* 329 */,
/* 330 */,
/* 331 */,
/* 332 */,
/* 333 */,
/* 334 */,
/* 335 */,
/* 336 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(747);
const shebangCommand = __webpack_require__(998);

function readShebang(command) {
    // Read the first 150 bytes from the file
    const size = 150;
    let buffer;

    if (Buffer.alloc) {
        // Node.js v4.5+ / v5.10+
        buffer = Buffer.alloc(size);
    } else {
        // Old Node.js API
        buffer = new Buffer(size);
        buffer.fill(0); // zero-fill
    }

    let fd;

    try {
        fd = fs.openSync(command, 'r');
        fs.readSync(fd, buffer, 0, size, 0);
        fs.closeSync(fd);
    } catch (e) { /* Empty */ }

    // Attempt to extract shebang (null is returned if not a shebang)
    return shebangCommand(buffer.toString());
}

module.exports = readShebang;


/***/ }),
/* 337 */,
/* 338 */,
/* 339 */,
/* 340 */,
/* 341 */,
/* 342 */,
/* 343 */,
/* 344 */,
/* 345 */,
/* 346 */,
/* 347 */,
/* 348 */
/***/ (function(module) {

"use strict";


const isWin = process.platform === 'win32';

function notFoundError(original, syscall) {
    return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
        code: 'ENOENT',
        errno: 'ENOENT',
        syscall: `${syscall} ${original.command}`,
        path: original.command,
        spawnargs: original.args,
    });
}

function hookChildProcess(cp, parsed) {
    if (!isWin) {
        return;
    }

    const originalEmit = cp.emit;

    cp.emit = function (name, arg1) {
        // If emitting "exit" event and exit code is 1, we need to check if
        // the command exists and emit an "error" instead
        // See https://github.com/IndigoUnited/node-cross-spawn/issues/16
        if (name === 'exit') {
            const err = verifyENOENT(arg1, parsed, 'spawn');

            if (err) {
                return originalEmit.call(cp, 'error', err);
            }
        }

        return originalEmit.apply(cp, arguments); // eslint-disable-line prefer-rest-params
    };
}

function verifyENOENT(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, 'spawn');
    }

    return null;
}

function verifyENOENTSync(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, 'spawnSync');
    }

    return null;
}

module.exports = {
    hookChildProcess,
    verifyENOENT,
    verifyENOENTSync,
    notFoundError,
};


/***/ }),
/* 349 */,
/* 350 */,
/* 351 */,
/* 352 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var esprima;

// Browserified version does not have esprima
//
// 1. For node.js just require module as deps
// 2. For browser try to require mudule via external AMD system.
//    If not found - try to fallback to window.esprima. If not
//    found too - then fail to parse.
//
try {
  // workaround to exclude package from browserify list.
  var _require = require;
  esprima = _require('esprima');
} catch (_) {
  /* eslint-disable no-redeclare */
  /* global window */
  if (typeof window !== 'undefined') esprima = window.esprima;
}

var Type = __webpack_require__(945);

function resolveJavascriptFunction(data) {
  if (data === null) return false;

  try {
    var source = '(' + data + ')',
        ast    = esprima.parse(source, { range: true });

    if (ast.type                    !== 'Program'             ||
        ast.body.length             !== 1                     ||
        ast.body[0].type            !== 'ExpressionStatement' ||
        (ast.body[0].expression.type !== 'ArrowFunctionExpression' &&
          ast.body[0].expression.type !== 'FunctionExpression')) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

function constructJavascriptFunction(data) {
  /*jslint evil:true*/

  var source = '(' + data + ')',
      ast    = esprima.parse(source, { range: true }),
      params = [],
      body;

  if (ast.type                    !== 'Program'             ||
      ast.body.length             !== 1                     ||
      ast.body[0].type            !== 'ExpressionStatement' ||
      (ast.body[0].expression.type !== 'ArrowFunctionExpression' &&
        ast.body[0].expression.type !== 'FunctionExpression')) {
    throw new Error('Failed to resolve function');
  }

  ast.body[0].expression.params.forEach(function (param) {
    params.push(param.name);
  });

  body = ast.body[0].expression.body.range;

  // Esprima's ranges include the first '{' and the last '}' characters on
  // function expressions. So cut them out.
  if (ast.body[0].expression.body.type === 'BlockStatement') {
    /*eslint-disable no-new-func*/
    return new Function(params, source.slice(body[0] + 1, body[1] - 1));
  }
  // ES6 arrow functions can omit the BlockStatement. In that case, just return
  // the body.
  /*eslint-disable no-new-func*/
  return new Function(params, 'return ' + source.slice(body[0], body[1]));
}

function representJavascriptFunction(object /*, style*/) {
  return object.toString();
}

function isFunction(object) {
  return Object.prototype.toString.call(object) === '[object Function]';
}

module.exports = new Type('tag:yaml.org,2002:js/function', {
  kind: 'scalar',
  resolve: resolveJavascriptFunction,
  construct: constructJavascriptFunction,
  predicate: isFunction,
  represent: representJavascriptFunction
});


/***/ }),
/* 353 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const u = __webpack_require__(676).fromCallback
module.exports = {
  move: u(__webpack_require__(500))
}


/***/ }),
/* 354 */,
/* 355 */,
/* 356 */
/***/ (function(module) {

function stringify (obj, options = {}) {
  const EOL = options.EOL || '\n'

  const str = JSON.stringify(obj, options ? options.replacer : null, options.spaces)

  return str.replace(/\n/g, EOL) + EOL
}

function stripBom (content) {
  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  if (Buffer.isBuffer(content)) content = content.toString('utf8')
  return content.replace(/^\uFEFF/, '')
}

module.exports = { stringify, stripBom }


/***/ }),
/* 357 */
/***/ (function(module) {

module.exports = require("assert");

/***/ }),
/* 358 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlShareOption = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be82545348/include/curl/curl.h#L2685
// not following enum naming convention on this one to keep consistent with other curl options
/**
 * Options to be used with {@link "Share".Share.setOpt | `Share#setOpt`}.
 *
 * @public
 */
var CurlShareOption;
(function (CurlShareOption) {
    CurlShareOption[CurlShareOption["SHARE"] = 1] = "SHARE";
    CurlShareOption[CurlShareOption["UNSHARE"] = 2] = "UNSHARE";
})(CurlShareOption = exports.CurlShareOption || (exports.CurlShareOption = {}));
//# sourceMappingURL=CurlShareOption.js.map

/***/ }),
/* 359 */,
/* 360 */,
/* 361 */
/***/ (function(module) {

module.exports = {"name":"axios","version":"0.20.0","description":"Promise based HTTP client for the browser and node.js","main":"index.js","scripts":{"test":"grunt test && bundlesize","start":"node ./sandbox/server.js","build":"NODE_ENV=production grunt build","preversion":"npm test","version":"npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json","postversion":"git push && git push --tags","examples":"node ./examples/server.js","coveralls":"cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js","fix":"eslint --fix lib/**/*.js"},"repository":{"type":"git","url":"https://github.com/axios/axios.git"},"keywords":["xhr","http","ajax","promise","node"],"author":"Matt Zabriskie","license":"MIT","bugs":{"url":"https://github.com/axios/axios/issues"},"homepage":"https://github.com/axios/axios","devDependencies":{"bundlesize":"^0.17.0","coveralls":"^3.0.0","es6-promise":"^4.2.4","grunt":"^1.0.2","grunt-banner":"^0.6.0","grunt-cli":"^1.2.0","grunt-contrib-clean":"^1.1.0","grunt-contrib-watch":"^1.0.0","grunt-eslint":"^20.1.0","grunt-karma":"^2.0.0","grunt-mocha-test":"^0.13.3","grunt-ts":"^6.0.0-beta.19","grunt-webpack":"^1.0.18","istanbul-instrumenter-loader":"^1.0.0","jasmine-core":"^2.4.1","karma":"^1.3.0","karma-chrome-launcher":"^2.2.0","karma-coverage":"^1.1.1","karma-firefox-launcher":"^1.1.0","karma-jasmine":"^1.1.1","karma-jasmine-ajax":"^0.1.13","karma-opera-launcher":"^1.0.0","karma-safari-launcher":"^1.0.0","karma-sauce-launcher":"^1.2.0","karma-sinon":"^1.0.5","karma-sourcemap-loader":"^0.3.7","karma-webpack":"^1.7.0","load-grunt-tasks":"^3.5.2","minimist":"^1.2.0","mocha":"^5.2.0","sinon":"^4.5.0","typescript":"^2.8.1","url-search-params":"^0.10.0","webpack":"^1.13.1","webpack-dev-server":"^1.14.1"},"browser":{"./lib/adapters/http.js":"./lib/adapters/xhr.js"},"jsdelivr":"dist/axios.min.js","unpkg":"dist/axios.min.js","typings":"./index.d.ts","dependencies":{"follow-redirects":"^1.10.0"},"bundlesize":[{"path":"./dist/axios.min.js","threshold":"5kB"}],"_resolved":"https://registry.npmjs.org/axios/-/axios-0.20.0.tgz","_integrity":"sha512-ANA4rr2BDcmmAQLOKft2fufrtuvlqR+cXNNinUmvfeSNCOF98PZL+7M/v1zIdGo7OLjEA9J2gXJL+j4zGsl0bA==","_from":"axios@0.20.0"};

/***/ }),
/* 362 */,
/* 363 */,
/* 364 */
/***/ (function(module) {

"use strict";

module.exports = (flag, argv) => {
	argv = argv || process.argv;
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const pos = argv.indexOf(prefix + flag);
	const terminatorPos = argv.indexOf('--');
	return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};


/***/ }),
/* 365 */,
/* 366 */,
/* 367 */
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = require(__webpack_require__.ab + "lib/binding/node_libcurl.node")

/***/ }),
/* 368 */,
/* 369 */
/***/ (function(module) {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),
/* 370 */,
/* 371 */,
/* 372 */,
/* 373 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlIpResolve = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be825453489/include/curl/curl.h#L1954
/**
 * Object with constants for option `IPRESOLVE`
 *
 * `CURL_IPRESOLVE_V4` becomes `Curl.ipresolve.V4`
 *
 * @public
 */
var CurlIpResolve;
(function (CurlIpResolve) {
    CurlIpResolve[CurlIpResolve["Whatever"] = 0] = "Whatever";
    CurlIpResolve[CurlIpResolve["V4"] = 1] = "V4";
    CurlIpResolve[CurlIpResolve["V6"] = 2] = "V6";
})(CurlIpResolve = exports.CurlIpResolve || (exports.CurlIpResolve = {}));
//# sourceMappingURL=CurlIpResolve.js.map

/***/ }),
/* 374 */,
/* 375 */,
/* 376 */,
/* 377 */,
/* 378 */,
/* 379 */,
/* 380 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlInfoDebug = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be8254534898/include/curl/curl.h#L452
/**
 * When the option `DEBUGFUNCTION` is set,
 *  the first argument to the callback will be one of these.
 *
 * `CURLINFO_SSL_DATA_IN` becomes `CurlInfoDebug.SslDataOut`
 *
 * @public
 */
var CurlInfoDebug;
(function (CurlInfoDebug) {
    CurlInfoDebug[CurlInfoDebug["Text"] = 0] = "Text";
    CurlInfoDebug[CurlInfoDebug["HeaderIn"] = 1] = "HeaderIn";
    CurlInfoDebug[CurlInfoDebug["HeaderOut"] = 2] = "HeaderOut";
    CurlInfoDebug[CurlInfoDebug["DataIn"] = 3] = "DataIn";
    CurlInfoDebug[CurlInfoDebug["DataOut"] = 4] = "DataOut";
    CurlInfoDebug[CurlInfoDebug["SslDataIn"] = 5] = "SslDataIn";
    CurlInfoDebug[CurlInfoDebug["SslDataOut"] = 6] = "SslDataOut";
})(CurlInfoDebug = exports.CurlInfoDebug || (exports.CurlInfoDebug = {}));
//# sourceMappingURL=CurlInfoDebug.js.map

/***/ }),
/* 381 */,
/* 382 */,
/* 383 */,
/* 384 */,
/* 385 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var isPlainObject = _interopDefault(__webpack_require__(696));
var universalUserAgent = __webpack_require__(562);

function lowercaseKeys(object) {
  if (!object) {
    return {};
  }

  return Object.keys(object).reduce((newObj, key) => {
    newObj[key.toLowerCase()] = object[key];
    return newObj;
  }, {});
}

function mergeDeep(defaults, options) {
  const result = Object.assign({}, defaults);
  Object.keys(options).forEach(key => {
    if (isPlainObject(options[key])) {
      if (!(key in defaults)) Object.assign(result, {
        [key]: options[key]
      });else result[key] = mergeDeep(defaults[key], options[key]);
    } else {
      Object.assign(result, {
        [key]: options[key]
      });
    }
  });
  return result;
}

function merge(defaults, route, options) {
  if (typeof route === "string") {
    let [method, url] = route.split(" ");
    options = Object.assign(url ? {
      method,
      url
    } : {
      url: method
    }, options);
  } else {
    options = Object.assign({}, route);
  } // lowercase header names before merging with defaults to avoid duplicates


  options.headers = lowercaseKeys(options.headers);
  const mergedOptions = mergeDeep(defaults || {}, options); // mediaType.previews arrays are merged, instead of overwritten

  if (defaults && defaults.mediaType.previews.length) {
    mergedOptions.mediaType.previews = defaults.mediaType.previews.filter(preview => !mergedOptions.mediaType.previews.includes(preview)).concat(mergedOptions.mediaType.previews);
  }

  mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map(preview => preview.replace(/-preview/, ""));
  return mergedOptions;
}

function addQueryParameters(url, parameters) {
  const separator = /\?/.test(url) ? "&" : "?";
  const names = Object.keys(parameters);

  if (names.length === 0) {
    return url;
  }

  return url + separator + names.map(name => {
    if (name === "q") {
      return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
    }

    return `${name}=${encodeURIComponent(parameters[name])}`;
  }).join("&");
}

const urlVariableRegex = /\{[^}]+\}/g;

function removeNonChars(variableName) {
  return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
}

function extractUrlVariableNames(url) {
  const matches = url.match(urlVariableRegex);

  if (!matches) {
    return [];
  }

  return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
}

function omit(object, keysToOmit) {
  return Object.keys(object).filter(option => !keysToOmit.includes(option)).reduce((obj, key) => {
    obj[key] = object[key];
    return obj;
  }, {});
}

// Based on https://github.com/bramstein/url-template, licensed under BSD
// TODO: create separate package.
//
// Copyright (c) 2012-2014, Bram Stein
// All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
// EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/* istanbul ignore file */
function encodeReserved(str) {
  return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
    if (!/%[0-9A-Fa-f]/.test(part)) {
      part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
    }

    return part;
  }).join("");
}

function encodeUnreserved(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

function encodeValue(operator, value, key) {
  value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value);

  if (key) {
    return encodeUnreserved(key) + "=" + value;
  } else {
    return value;
  }
}

function isDefined(value) {
  return value !== undefined && value !== null;
}

function isKeyOperator(operator) {
  return operator === ";" || operator === "&" || operator === "?";
}

function getValues(context, operator, key, modifier) {
  var value = context[key],
      result = [];

  if (isDefined(value) && value !== "") {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      value = value.toString();

      if (modifier && modifier !== "*") {
        value = value.substring(0, parseInt(modifier, 10));
      }

      result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
    } else {
      if (modifier === "*") {
        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function (value) {
            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
          });
        } else {
          Object.keys(value).forEach(function (k) {
            if (isDefined(value[k])) {
              result.push(encodeValue(operator, value[k], k));
            }
          });
        }
      } else {
        const tmp = [];

        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function (value) {
            tmp.push(encodeValue(operator, value));
          });
        } else {
          Object.keys(value).forEach(function (k) {
            if (isDefined(value[k])) {
              tmp.push(encodeUnreserved(k));
              tmp.push(encodeValue(operator, value[k].toString()));
            }
          });
        }

        if (isKeyOperator(operator)) {
          result.push(encodeUnreserved(key) + "=" + tmp.join(","));
        } else if (tmp.length !== 0) {
          result.push(tmp.join(","));
        }
      }
    }
  } else {
    if (operator === ";") {
      if (isDefined(value)) {
        result.push(encodeUnreserved(key));
      }
    } else if (value === "" && (operator === "&" || operator === "?")) {
      result.push(encodeUnreserved(key) + "=");
    } else if (value === "") {
      result.push("");
    }
  }

  return result;
}

function parseUrl(template) {
  return {
    expand: expand.bind(null, template)
  };
}

function expand(template, context) {
  var operators = ["+", "#", ".", "/", ";", "?", "&"];
  return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
    if (expression) {
      let operator = "";
      const values = [];

      if (operators.indexOf(expression.charAt(0)) !== -1) {
        operator = expression.charAt(0);
        expression = expression.substr(1);
      }

      expression.split(/,/g).forEach(function (variable) {
        var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
        values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
      });

      if (operator && operator !== "+") {
        var separator = ",";

        if (operator === "?") {
          separator = "&";
        } else if (operator !== "#") {
          separator = operator;
        }

        return (values.length !== 0 ? operator : "") + values.join(separator);
      } else {
        return values.join(",");
      }
    } else {
      return encodeReserved(literal);
    }
  });
}

function parse(options) {
  // https://fetch.spec.whatwg.org/#methods
  let method = options.method.toUpperCase(); // replace :varname with {varname} to make it RFC 6570 compatible

  let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{+$1}");
  let headers = Object.assign({}, options.headers);
  let body;
  let parameters = omit(options, ["method", "baseUrl", "url", "headers", "request", "mediaType"]); // extract variable names from URL to calculate remaining variables later

  const urlVariableNames = extractUrlVariableNames(url);
  url = parseUrl(url).expand(parameters);

  if (!/^http/.test(url)) {
    url = options.baseUrl + url;
  }

  const omittedParameters = Object.keys(options).filter(option => urlVariableNames.includes(option)).concat("baseUrl");
  const remainingParameters = omit(parameters, omittedParameters);
  const isBinaryRequset = /application\/octet-stream/i.test(headers.accept);

  if (!isBinaryRequset) {
    if (options.mediaType.format) {
      // e.g. application/vnd.github.v3+json => application/vnd.github.v3.raw
      headers.accept = headers.accept.split(/,/).map(preview => preview.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/, `application/vnd$1$2.${options.mediaType.format}`)).join(",");
    }

    if (options.mediaType.previews.length) {
      const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
      headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map(preview => {
        const format = options.mediaType.format ? `.${options.mediaType.format}` : "+json";
        return `application/vnd.github.${preview}-preview${format}`;
      }).join(",");
    }
  } // for GET/HEAD requests, set URL query parameters from remaining parameters
  // for PATCH/POST/PUT/DELETE requests, set request body from remaining parameters


  if (["GET", "HEAD"].includes(method)) {
    url = addQueryParameters(url, remainingParameters);
  } else {
    if ("data" in remainingParameters) {
      body = remainingParameters.data;
    } else {
      if (Object.keys(remainingParameters).length) {
        body = remainingParameters;
      } else {
        headers["content-length"] = 0;
      }
    }
  } // default content-type for JSON if body is set


  if (!headers["content-type"] && typeof body !== "undefined") {
    headers["content-type"] = "application/json; charset=utf-8";
  } // GitHub expects 'content-length: 0' header for PUT/PATCH requests without body.
  // fetch does not allow to set `content-length` header, but we can set body to an empty string


  if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
    body = "";
  } // Only return body/request keys if present


  return Object.assign({
    method,
    url,
    headers
  }, typeof body !== "undefined" ? {
    body
  } : null, options.request ? {
    request: options.request
  } : null);
}

function endpointWithDefaults(defaults, route, options) {
  return parse(merge(defaults, route, options));
}

function withDefaults(oldDefaults, newDefaults) {
  const DEFAULTS = merge(oldDefaults, newDefaults);
  const endpoint = endpointWithDefaults.bind(null, DEFAULTS);
  return Object.assign(endpoint, {
    DEFAULTS,
    defaults: withDefaults.bind(null, DEFAULTS),
    merge: merge.bind(null, DEFAULTS),
    parse
  });
}

const VERSION = "6.0.5";

const userAgent = `octokit-endpoint.js/${VERSION} ${universalUserAgent.getUserAgent()}`; // DEFAULTS has all properties set that EndpointOptions has, except url.
// So we use RequestParameters and add method as additional required property.

const DEFAULTS = {
  method: "GET",
  baseUrl: "https://api.github.com",
  headers: {
    accept: "application/vnd.github.v3+json",
    "user-agent": userAgent
  },
  mediaType: {
    format: "",
    previews: []
  }
};

const endpoint = withDefaults(null, DEFAULTS);

exports.endpoint = endpoint;
//# sourceMappingURL=index.js.map


/***/ }),
/* 386 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var Type = __webpack_require__(945);

function resolveJavascriptUndefined() {
  return true;
}

function constructJavascriptUndefined() {
  /*eslint-disable no-undefined*/
  return undefined;
}

function representJavascriptUndefined() {
  return '';
}

function isUndefined(object) {
  return typeof object === 'undefined';
}

module.exports = new Type('tag:yaml.org,2002:js/undefined', {
  kind: 'scalar',
  resolve: resolveJavascriptUndefined,
  construct: constructJavascriptUndefined,
  predicate: isUndefined,
  represent: representJavascriptUndefined
});


/***/ }),
/* 387 */,
/* 388 */,
/* 389 */,
/* 390 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlPipe = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/7e35eb77292f/include/curl/multi.h#L84
/**
 * Object with bit constants to be used with the multi handle option `PIPELINING`
 * Those are available starting with libcurl 7.43.0.
 *
 * `CURLPIPE_NOTHING` becomes `CurlPipe.Nothing`
 *
 * @public
 */
var CurlPipe;
(function (CurlPipe) {
    CurlPipe[CurlPipe["Nothing"] = 0] = "Nothing";
    /**
     * Deprecated and has no effect since version 7.62.0
     */
    CurlPipe[CurlPipe["Http1"] = 1] = "Http1";
    /**
     * If this bit is set, libcurl will try to multiplex the new transfer over an existing connection if possible. This requires HTTP/2.
     *
     * This is enabled by default starting with version 7.62.0
     */
    CurlPipe[CurlPipe["Multiplex"] = 2] = "Multiplex";
})(CurlPipe = exports.CurlPipe || (exports.CurlPipe = {}));
//# sourceMappingURL=CurlPipe.js.map

/***/ }),
/* 391 */,
/* 392 */,
/* 393 */,
/* 394 */,
/* 395 */,
/* 396 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlWriteFunc = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be8254534898fccafc5d6cd04f6235f283cfbd/include/curl/curl.h#L252
/**
 * Special return codes for `WRITEFUNCTION` option
 *
 * `CURL_WRITEFUNC_PAUSE` becomes `CurlWriteFunc.Pause`
 *
 * @public
 */
var CurlWriteFunc;
(function (CurlWriteFunc) {
    CurlWriteFunc[CurlWriteFunc["Pause"] = 268435457] = "Pause";
})(CurlWriteFunc = exports.CurlWriteFunc || (exports.CurlWriteFunc = {}));
//# sourceMappingURL=CurlWriteFunc.js.map

/***/ }),
/* 397 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.curly = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const CurlOption_1 = __webpack_require__(533);
const Curl_1 = __webpack_require__(412);
// This is basically http.METHODS
const methods = [
    'acl',
    'bind',
    'checkout',
    'connect',
    'copy',
    'delete',
    'get',
    'head',
    'link',
    'lock',
    'm-search',
    'merge',
    'mkactivity',
    'mkcalendar',
    'mkcol',
    'move',
    'notify',
    'options',
    'patch',
    'post',
    'propfind',
    'proppatch',
    'purge',
    'put',
    'rebind',
    'report',
    'search',
    'source',
    'subscribe',
    'trace',
    'unbind',
    'unlink',
    'unlock',
    'unsubscribe',
];
const create = () => {
    function curly(url, options = {}) {
        const curlHandle = new Curl_1.Curl();
        curlHandle.setOpt('URL', url);
        for (const key of Object.keys(options)) {
            const keyTyped = key;
            const optionName = keyTyped in CurlOption_1.CurlOptionCamelCaseMap
                ? CurlOption_1.CurlOptionCamelCaseMap[keyTyped]
                : keyTyped;
            // @ts-ignore @TODO Try to type this
            curlHandle.setOpt(optionName, options[key]);
        }
        return new Promise((resolve, reject) => {
            try {
                curlHandle.on('end', (statusCode, data, headers) => {
                    curlHandle.close();
                    resolve({
                        statusCode: statusCode,
                        data: data,
                        headers: headers,
                    });
                });
                curlHandle.on('error', (error, errorCode) => {
                    curlHandle.close();
                    // @ts-ignore
                    error.code = errorCode;
                    reject(error);
                });
                curlHandle.perform();
            }
            catch (error) {
                curlHandle.close();
                reject(error);
            }
        });
    }
    curly.create = create;
    const httpMethodOptionsMap = {
        get: null,
        post: (_m, o) => ({
            post: true,
            ...o,
        }),
        head: (_m, o) => ({
            nobody: true,
            ...o,
        }),
        _: (m, o) => ({
            customRequest: m,
            ...o,
        }),
    };
    for (const httpMethod of methods) {
        const httpMethodOptionsKey = httpMethodOptionsMap.hasOwnProperty(httpMethod)
            ? httpMethod
            : '_';
        const httpMethodOptions = httpMethodOptionsMap[httpMethodOptionsKey];
        // @ts-ignore
        curly[httpMethod] =
            httpMethodOptions === null
                ? curly
                : (url, options = {}) => curly(url, {
                    ...httpMethodOptions(httpMethod, options),
                });
    }
    // @ts-ignore
    return curly;
};
/**
 * Curly function
 *
 * @public
 */
exports.curly = create();
//# sourceMappingURL=curly.js.map

/***/ }),
/* 398 */,
/* 399 */,
/* 400 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const cp = __webpack_require__(129);
const parse = __webpack_require__(510);
const enoent = __webpack_require__(348);

function spawn(command, args, options) {
    // Parse the arguments
    const parsed = parse(command, args, options);

    // Spawn the child process
    const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);

    // Hook into child process "exit" event to emit an error if the command
    // does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    enoent.hookChildProcess(spawned, parsed);

    return spawned;
}

function spawnSync(command, args, options) {
    // Parse the arguments
    const parsed = parse(command, args, options);

    // Spawn the child process
    const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);

    // Analyze if the command does not exist, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);

    return result;
}

module.exports = spawn;
module.exports.spawn = spawn;
module.exports.sync = spawnSync;

module.exports._parse = parse;
module.exports._enoent = enoent;


/***/ }),
/* 401 */,
/* 402 */,
/* 403 */,
/* 404 */,
/* 405 */,
/* 406 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const path = __webpack_require__(622);
const pathKey = __webpack_require__(829);

module.exports = opts => {
	opts = Object.assign({
		cwd: process.cwd(),
		path: process.env[pathKey()]
	}, opts);

	let prev;
	let pth = path.resolve(opts.cwd);
	const ret = [];

	while (prev !== pth) {
		ret.push(path.join(pth, 'node_modules/.bin'));
		prev = pth;
		pth = path.resolve(pth, '..');
	}

	// ensure the running `node` binary is used
	ret.push(path.dirname(process.execPath));

	return ret.concat(opts.path).join(path.delimiter);
};

module.exports.env = opts => {
	opts = Object.assign({
		env: process.env
	}, opts);

	const env = Object.assign({}, opts.env);
	const path = pathKey({env});

	opts.path = env[path];
	env[path] = module.exports(opts);

	return env;
};


/***/ }),
/* 407 */,
/* 408 */,
/* 409 */,
/* 410 */,
/* 411 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),
/* 412 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Curl = void 0;
const tslib_1 = __webpack_require__(422);
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const events_1 = __webpack_require__(614);
const string_decoder_1 = __webpack_require__(304);
const assert_1 = tslib_1.__importDefault(__webpack_require__(357));
const pkg = __webpack_require__(699);
const Easy_1 = __webpack_require__(309);
const Multi_1 = __webpack_require__(302);
const mergeChunks_1 = __webpack_require__(36);
const parseHeaders_1 = __webpack_require__(954);
const CurlCode_1 = __webpack_require__(989);
const CurlFeature_1 = __webpack_require__(824);
const bindings = __webpack_require__(367);
// tslint:disable-next-line
const { Curl: _Curl, CurlVersionInfo } = bindings;
if (!process.env.NODE_LIBCURL_DISABLE_GLOBAL_INIT_CALL ||
    process.env.NODE_LIBCURL_DISABLE_GLOBAL_INIT_CALL !== 'true') {
    // We could just pass nothing here, CurlGlobalInitEnum.All is the default anyway.
    const globalInitResult = _Curl.globalInit(3 /* All */);
    assert_1.default(globalInitResult === 0 || 'Libcurl global init failed.');
}
const decoder = new string_decoder_1.StringDecoder('utf8');
// Handle used by curl instances created by the Curl wrapper.
const multiHandle = new Multi_1.Multi();
const curlInstanceMap = new WeakMap();
multiHandle.onMessage((error, handle, errorCode) => {
    multiHandle.removeHandle(handle);
    const curlInstance = curlInstanceMap.get(handle);
    assert_1.default(curlInstance, 'Could not retrieve curl instance from easy handle on onMessage callback');
    if (error) {
        curlInstance.onError(error, errorCode);
    }
    else {
        curlInstance.onEnd();
    }
});
/**
 * Wrapper around {@link "Easy".Easy | `Easy`} class with a more *nodejs-friendly* interface.
 *
 * This uses an internal {@link "Multi".Multi | `Multi`} instance to asynchronous fire the requests.
 *
 * @public
 */
let Curl = /** @class */ (() => {
    class Curl extends events_1.EventEmitter {
        /**
         * @param cloneHandle {@link "Easy".Easy | `Easy`} handle that should be used instead of creating a new one.
         */
        constructor(cloneHandle) {
            super();
            const handle = cloneHandle || new Easy_1.Easy();
            this.handle = handle;
            // callbacks called by libcurl
            handle.setOpt(Curl.option.WRITEFUNCTION, this.defaultWriteFunction.bind(this));
            handle.setOpt(Curl.option.HEADERFUNCTION, this.defaultHeaderFunction.bind(this));
            handle.setOpt(Curl.option.USERAGENT, Curl.defaultUserAgent);
            this.chunks = [];
            this.chunksLength = 0;
            this.headerChunks = [];
            this.headerChunksLength = 0;
            this.features = 0;
            this.isRunning = false;
            curlInstanceMap.set(handle, this);
        }
        /**
         * This is the default callback passed to {@link setOpt | `setOpt('WRITEFUNCTION', cb)`}.
         */
        defaultWriteFunction(chunk, size, nmemb) {
            if (!(this.features & CurlFeature_1.CurlFeature.NoDataStorage)) {
                this.chunks.push(chunk);
                this.chunksLength += chunk.length;
            }
            this.emit('data', chunk, this);
            return size * nmemb;
        }
        /**
         * This is the default callback passed to {@link setOpt | `setOpt('HEADERFUNCTION', cb)`}.
         */
        defaultHeaderFunction(chunk, size, nmemb) {
            if (!(this.features & CurlFeature_1.CurlFeature.NoHeaderStorage)) {
                this.headerChunks.push(chunk);
                this.headerChunksLength += chunk.length;
            }
            this.emit('header', chunk, this);
            return size * nmemb;
        }
        /**
         * Callback called when an error is thrown on this handle.
         *
         * This is called from the internal callback we use with the {@link "Multi".Multi.onMessage | `onMessage`}
         *  method of the global {@link "Multi".Multi | `Multi`} handle used by all `Curl` instances.
         */
        onError(error, errorCode) {
            this.isRunning = false;
            this.chunks = [];
            this.chunksLength = 0;
            this.headerChunks = [];
            this.headerChunksLength = 0;
            this.emit('error', error, errorCode, this);
        }
        /**
         * Callback called when this handle has finished the request.
         *
         * This is called from the internal callback we use with the {@link "Multi".Multi.onMessage | `onMessage`}
         *  method of the global {@link "Multi".Multi | `Multi`} handle used by all `Curl` instances.
         */
        onEnd() {
            const isHeaderStorageEnabled = !(this.features & CurlFeature_1.CurlFeature.NoHeaderStorage);
            const isDataStorageEnabled = !(this.features & CurlFeature_1.CurlFeature.NoDataStorage);
            const isHeaderParsingEnabled = !(this.features & CurlFeature_1.CurlFeature.NoHeaderParsing) && isHeaderStorageEnabled;
            const isDataParsingEnabled = !(this.features & CurlFeature_1.CurlFeature.NoDataParsing) && isDataStorageEnabled;
            this.isRunning = false;
            const dataRaw = isDataStorageEnabled
                ? mergeChunks_1.mergeChunks(this.chunks, this.chunksLength)
                : Buffer.alloc(0);
            const headersRaw = isHeaderStorageEnabled
                ? mergeChunks_1.mergeChunks(this.headerChunks, this.headerChunksLength)
                : Buffer.alloc(0);
            this.chunks = [];
            this.chunksLength = 0;
            this.headerChunks = [];
            this.headerChunksLength = 0;
            const data = isDataParsingEnabled ? decoder.write(dataRaw) : dataRaw;
            const headers = isHeaderParsingEnabled
                ? parseHeaders_1.parseHeaders(decoder.write(headersRaw))
                : headersRaw;
            const { code, data: status } = this.handle.getInfo(Curl.info.RESPONSE_CODE);
            if (code !== CurlCode_1.CurlCode.CURLE_OK) {
                const error = new Error('Could not get status code of request');
                this.emit('error', error, code, this);
            }
            else {
                this.emit('end', status, data, headers, this);
            }
        }
        /**
         * Enables a feature, must not be used while a request is running.
         *
         * Use {@link CurlFeature | `CurlFeature`} for predefined constants.
         */
        enable(bitmask) {
            if (this.isRunning) {
                throw new Error('You should not change the features while a request is running.');
            }
            this.features |= bitmask;
            return this;
        }
        /**
         * Disables a feature, must not be used while a request is running.
         *
         * Use {@link CurlFeature | `CurlFeature`} for predefined constants.
         */
        disable(bitmask) {
            if (this.isRunning) {
                throw new Error('You should not change the features while a request is running.');
            }
            this.features &= ~bitmask;
            return this;
        }
        /**
         * Sets an option the handle.
         *
         * This overloaded method has `never` as type for the arguments
         *  because one of the other overloaded signatures must be used.
         *
         *
         * Official libcurl documentation: [`curl_easy_setopt()`](http://curl.haxx.se/libcurl/c/curl_easy_setopt.html)
         *
         * @param optionIdOrName Option name or integer value. Use {@link Curl.option | `Curl.option`} for predefined constants.
         * @param optionValue The value of the option, value type depends on the option being set.
         */
        setOpt(optionIdOrName, optionValue) {
            // special case for WRITEFUNCTION and HEADERFUNCTION callbacks
            //  since if they are set back to null, we must restore the default callback.
            let value = optionValue;
            if ((optionIdOrName === Curl.option.WRITEFUNCTION ||
                optionIdOrName === 'WRITEFUNCTION') &&
                !optionValue) {
                value = this.defaultWriteFunction.bind(this);
            }
            else if ((optionIdOrName === Curl.option.HEADERFUNCTION ||
                optionIdOrName === 'HEADERFUNCTION') &&
                !optionValue) {
                value = this.defaultHeaderFunction.bind(this);
            }
            const code = this.handle.setOpt(optionIdOrName, value);
            if (code !== CurlCode_1.CurlCode.CURLE_OK) {
                throw new Error(code === CurlCode_1.CurlCode.CURLE_UNKNOWN_OPTION
                    ? 'Unknown option given. First argument must be the option internal id or the option name. You can use the Curl.option constants.'
                    : Easy_1.Easy.strError(code));
            }
            return this;
        }
        /**
         * Retrieves some information about the last request made by a handle.
         *
         *
         * Official libcurl documentation: [`curl_easy_getinfo()`](http://curl.haxx.se/libcurl/c/curl_easy_getinfo.html)
         *
         * @param infoNameOrId Info name or integer value. Use {@link Curl.info | `Curl.info`} for predefined constants.
         */
        getInfo(infoNameOrId) {
            const { code, data } = this.handle.getInfo(infoNameOrId);
            if (code !== CurlCode_1.CurlCode.CURLE_OK) {
                throw new Error(`getInfo failed. Error: ${Easy_1.Easy.strError(code)}`);
            }
            return data;
        }
        /**
         * The option `XFERINFOFUNCTION` was introduced in curl version `7.32.0`,
         *  versions older than that should use `PROGRESSFUNCTION`.
         * If you don't want to mess with version numbers you can use this method,
         * instead of directly calling {@link Curl.setOpt | `Curl#setOpt`}.
         *
         * `NOPROGRESS` should be set to false to make this function actually get called.
         */
        setProgressCallback(cb) {
            if (Curl.VERSION_NUM >= 0x072000) {
                this.handle.setOpt(Curl.option.XFERINFOFUNCTION, cb);
            }
            else {
                this.handle.setOpt(Curl.option.PROGRESSFUNCTION, cb);
            }
            return this;
        }
        /**
         * Add this instance to the processing queue.
         * This method should be called only one time per request,
         *  otherwise it will throw an error.
         *
         * @remarks
         *
         * This basically calls the {@link "Multi".Multi.addHandle | `Multi#addHandle`} method.
         */
        perform() {
            if (this.isRunning) {
                throw new Error('Handle already running!');
            }
            this.isRunning = true;
            multiHandle.addHandle(this.handle);
            return this;
        }
        /**
         * Perform any connection upkeep checks.
         *
         *
         * Official libcurl documentation: [`curl_easy_upkeep()`](http://curl.haxx.se/libcurl/c/curl_easy_upkeep.html)
         */
        upkeep() {
            const code = this.handle.upkeep();
            if (code !== CurlCode_1.CurlCode.CURLE_OK) {
                throw new Error(Easy_1.Easy.strError(code));
            }
            return this;
        }
        /**
         * Use this function to pause / unpause a connection.
         *
         * The bitmask argument is a set of bits that sets the new state of the connection.
         *
         * Use {@link CurlPause | `CurlPause`} for predefined constants.
         *
         *
         * Official libcurl documentation: [`curl_easy_pause()`](http://curl.haxx.se/libcurl/c/curl_easy_pause.html)
         */
        pause(bitmask) {
            const code = this.handle.pause(bitmask);
            if (code !== CurlCode_1.CurlCode.CURLE_OK) {
                throw new Error(Easy_1.Easy.strError(code));
            }
            return this;
        }
        /**
         * Reset this handle options to their defaults.
         *
         * This will put the handle in a clean state, as if it was just created.
         *
         *
         * Official libcurl documentation: [`curl_easy_reset()`](http://curl.haxx.se/libcurl/c/curl_easy_reset.html)
         */
        reset() {
            this.removeAllListeners();
            this.handle.reset();
            // add callbacks back as reset will remove them
            this.handle.setOpt(Curl.option.WRITEFUNCTION, this.defaultWriteFunction.bind(this));
            this.handle.setOpt(Curl.option.HEADERFUNCTION, this.defaultHeaderFunction.bind(this));
            return this;
        }
        /**
         * Duplicate this handle with all their options.
         * Keep in mind that, by default, this also means all event listeners.
         *
         *
         * Official libcurl documentation: [`curl_easy_duphandle()`](http://curl.haxx.se/libcurl/c/curl_easy_duphandle.html)
         *
         * @param shouldCopyEventListeners If you don't want to copy the event listeners, set this to `false`.
         */
        dupHandle(shouldCopyEventListeners = true) {
            const duplicatedHandle = new Curl(this.handle.dupHandle());
            const eventsToCopy = ['end', 'error', 'data', 'header'];
            duplicatedHandle.features = this.features;
            if (shouldCopyEventListeners) {
                for (let i = 0; i < eventsToCopy.length; i += 1) {
                    const listeners = this.listeners(eventsToCopy[i]);
                    for (let j = 0; j < listeners.length; j += 1) {
                        duplicatedHandle.on(eventsToCopy[i], listeners[j]);
                    }
                }
            }
            return duplicatedHandle;
        }
        /**
         * Close this handle.
         *
         * **NOTE:** After closing the handle, it must not be used anymore. Doing so will throw an error.
         *
         *
         * Official libcurl documentation: [`curl_easy_cleanup()`](http://curl.haxx.se/libcurl/c/curl_easy_cleanup.html)
         */
        close() {
            curlInstanceMap.delete(this.handle);
            this.removeAllListeners();
            if (this.handle.isInsideMultiHandle) {
                multiHandle.removeHandle(this.handle);
            }
            this.handle.setOpt(Curl.option.WRITEFUNCTION, null);
            this.handle.setOpt(Curl.option.HEADERFUNCTION, null);
            this.handle.close();
        }
    }
    /**
     * Calls [`curl_global_init()`](http://curl.haxx.se/libcurl/c/curl_global_init.html).
     *
     * For **flags** see the the enum {@link CurlGlobalInit | `CurlGlobalInit`}.
     *
     * This is automatically called when the addon is loaded, to disable this, set the environment variable
     *  `NODE_LIBCURL_DISABLE_GLOBAL_INIT_CALL=false`
     */
    Curl.globalInit = _Curl.globalInit;
    /**
     * Calls [`curl_global_cleanup()`](http://curl.haxx.se/libcurl/c/curl_global_cleanup.html)
     *
     * This is automatically called when the process is exiting.
     */
    Curl.globalCleanup = _Curl.globalCleanup;
    /**
     * Returns libcurl version string.
     *
     * The string shows which libraries libcurl was built with and their versions, example:
     * ```
     * libcurl/7.69.1-DEV OpenSSL/1.1.1d zlib/1.2.11 WinIDN libssh2/1.9.0_DEV nghttp2/1.40.0
     * ```
     */
    Curl.getVersion = _Curl.getVersion;
    /**
     * Returns an object with a representation of the current libcurl version and their features/protocols.
     *
     * This is basically [`curl_version_info()`](https://curl.haxx.se/libcurl/c/curl_version_info.html)
     */
    Curl.getVersionInfo = () => CurlVersionInfo;
    /**
     * Returns a string that looks like the one returned by
     * ```bash
     * curl -V
     * ```
     * Example:
     * ```
     * Version: libcurl/7.69.1-DEV OpenSSL/1.1.1d zlib/1.2.11 WinIDN libssh2/1.9.0_DEV nghttp2/1.40.0
     * Protocols: dict, file, ftp, ftps, gopher, http, https, imap, imaps, ldap, ldaps, pop3, pop3s, rtsp, scp, sftp, smb, smbs, smtp, smtps, telnet, tftp
     * Features: AsynchDNS, IDN, IPv6, Largefile, SSPI, Kerberos, SPNEGO, NTLM, SSL, libz, HTTP2, HTTPS-proxy
     * ```
     */
    Curl.getVersionInfoString = () => {
        const version = Curl.getVersion();
        const protocols = CurlVersionInfo.protocols.join(', ');
        const features = CurlVersionInfo.features.join(', ');
        return [
            `Version: ${version}`,
            `Protocols: ${protocols}`,
            `Features: ${features}`,
        ].join('\n');
    };
    /**
     * Useful if you want to check if the current libcurl version is greater or equal than another one.
     * @param x major
     * @param y minor
     * @param z patch
     */
    Curl.isVersionGreaterOrEqualThan = (x, y, z = 0) => {
        return _Curl.VERSION_NUM >= (x << 16) + (y << 8) + z;
    };
    /**
     * This is the default user agent that is going to be used on all `Curl` instances.
     *
     * You can overwrite this in a per instance basis, calling `curlHandle.setOpt('USERAGENT', 'my-user-agent/1.0')`, or
     *  by directly changing this property so it affects all newly created `Curl` instances.
     *
     * To disable this behavior set this property to `null`.
     */
    Curl.defaultUserAgent = `node-libcurl/${pkg.version}`;
    /**
     * Returns the number of handles currently open in the internal {@link "Multi".Multi | `Multi`} handle being used.
     */
    Curl.getCount = multiHandle.getCount;
    /**
     * Integer representing the current libcurl version.
     *
     * It was built the following way:
     * ```
     * <8 bits major number> | <8 bits minor number> | <8 bits patch number>.
     * ```
     * Version `7.69.1` is therefore returned as `0x074501` / `476417`
     */
    Curl.VERSION_NUM = _Curl.VERSION_NUM;
    /**
     * This is a object with members resembling the `CURLINFO_*` libcurl constants.
     *
     * It can be used with {@link "Easy".Easy.getInfo | `Easy#getInfo`} or {@link getInfo | `Curl#getInfo`}.
     *
     * See the official documentation of [`curl_easy_getinfo()`](http://curl.haxx.se/libcurl/c/curl_easy_getinfo.html)
     *  for reference.
     *
     * `CURLINFO_EFFECTIVE_URL` becomes `Curl.info.EFFECTIVE_URL`
     */
    Curl.info = _Curl.info;
    /**
     * This is a object with members resembling the `CURLOPT_*` libcurl constants.
     *
     * It can be used with {@link "Easy".Easy.setOpt | `Easy#setOpt`} or {@link setOpt | `Curl#setOpt`}.
     *
     * See the official documentation of [`curl_easy_setopt()`](http://curl.haxx.se/libcurl/c/curl_easy_setopt.html)
     *  for reference.
     *
     * `CURLOPT_URL` becomes `Curl.option.URL`
     */
    Curl.option = _Curl.option;
    return Curl;
})();
exports.Curl = Curl;
//# sourceMappingURL=Curl.js.map

/***/ }),
/* 413 */
/***/ (function(module) {

module.exports = require("stream");

/***/ }),
/* 414 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";



var yaml = __webpack_require__(819);


module.exports = yaml;


/***/ }),
/* 415 */,
/* 416 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const path = __webpack_require__(622);
const which = __webpack_require__(88);
const pathKey = __webpack_require__(829)();

function resolveCommandAttempt(parsed, withoutPathExt) {
    const cwd = process.cwd();
    const hasCustomCwd = parsed.options.cwd != null;

    // If a custom `cwd` was specified, we need to change the process cwd
    // because `which` will do stat calls but does not support a custom cwd
    if (hasCustomCwd) {
        try {
            process.chdir(parsed.options.cwd);
        } catch (err) {
            /* Empty */
        }
    }

    let resolved;

    try {
        resolved = which.sync(parsed.command, {
            path: (parsed.options.env || process.env)[pathKey],
            pathExt: withoutPathExt ? path.delimiter : undefined,
        });
    } catch (e) {
        /* Empty */
    } finally {
        process.chdir(cwd);
    }

    // If we successfully resolved, ensure that an absolute path is returned
    // Note that when a custom `cwd` was used, we need to resolve to an absolute path based on it
    if (resolved) {
        resolved = path.resolve(hasCustomCwd ? parsed.options.cwd : '', resolved);
    }

    return resolved;
}

function resolveCommand(parsed) {
    return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
}

module.exports = resolveCommand;


/***/ }),
/* 417 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var common = __webpack_require__(740);
var Type   = __webpack_require__(945);

var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  '^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
  // .2e4, .2
  // special case, seems not from spec
  '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
  // 20:59
  '|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*' +
  // .inf
  '|[-+]?\\.(?:inf|Inf|INF)' +
  // .nan
  '|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (data === null) return false;

  if (!YAML_FLOAT_PATTERN.test(data) ||
      // Quick hack to not allow integers end with `_`
      // Probably should update regexp & check speed
      data[data.length - 1] === '_') {
    return false;
  }

  return true;
}

function constructYamlFloat(data) {
  var value, sign, base, digits;

  value  = data.replace(/_/g, '').toLowerCase();
  sign   = value[0] === '-' ? -1 : 1;
  digits = [];

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }

  if (value === '.inf') {
    return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  } else if (value === '.nan') {
    return NaN;

  } else if (value.indexOf(':') >= 0) {
    value.split(':').forEach(function (v) {
      digits.unshift(parseFloat(v, 10));
    });

    value = 0.0;
    base = 1;

    digits.forEach(function (d) {
      value += d * base;
      base *= 60;
    });

    return sign * value;

  }
  return sign * parseFloat(value, 10);
}


var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
      case 'lowercase': return '.nan';
      case 'uppercase': return '.NAN';
      case 'camelcase': return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '.inf';
      case 'uppercase': return '.INF';
      case 'camelcase': return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '-.inf';
      case 'uppercase': return '-.INF';
      case 'camelcase': return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10);

  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return (Object.prototype.toString.call(object) === '[object Number]') &&
         (object % 1 !== 0 || common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});


/***/ }),
/* 418 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

// Older verions of Node.js might not have `util.getSystemErrorName()`.
// In that case, fall back to a deprecated internal.
const util = __webpack_require__(669);

let uv;

if (typeof util.getSystemErrorName === 'function') {
	module.exports = util.getSystemErrorName;
} else {
	try {
		uv = process.binding('uv');

		if (typeof uv.errname !== 'function') {
			throw new TypeError('uv.errname is not a function');
		}
	} catch (err) {
		console.error('execa/lib/errname: unable to establish process.binding(\'uv\')', err);
		uv = null;
	}

	module.exports = code => errname(uv, code);
}

// Used for testing the fallback behavior
module.exports.__test__ = errname;

function errname(uv, code) {
	if (uv) {
		return uv.errname(code);
	}

	if (!(code < 0)) {
		throw new Error('err >= 0');
	}

	return `Unknown system error ${code}`;
}



/***/ }),
/* 419 */
/***/ (function(module) {

"use strict";


module.exports = [
	// German umlauts
	['ß', 'ss'],
	['ä', 'ae'],
	['Ä', 'Ae'],
	['ö', 'oe'],
	['Ö', 'Oe'],
	['ü', 'ue'],
	['Ü', 'Ue'],

	// Latin
	['À', 'A'],
	['Á', 'A'],
	['Â', 'A'],
	['Ã', 'A'],
	['Ä', 'Ae'],
	['Å', 'A'],
	['Æ', 'AE'],
	['Ç', 'C'],
	['È', 'E'],
	['É', 'E'],
	['Ê', 'E'],
	['Ë', 'E'],
	['Ì', 'I'],
	['Í', 'I'],
	['Î', 'I'],
	['Ï', 'I'],
	['Ð', 'D'],
	['Ñ', 'N'],
	['Ò', 'O'],
	['Ó', 'O'],
	['Ô', 'O'],
	['Õ', 'O'],
	['Ö', 'Oe'],
	['Ő', 'O'],
	['Ø', 'O'],
	['Ù', 'U'],
	['Ú', 'U'],
	['Û', 'U'],
	['Ü', 'Ue'],
	['Ű', 'U'],
	['Ý', 'Y'],
	['Þ', 'TH'],
	['ß', 'ss'],
	['à', 'a'],
	['á', 'a'],
	['â', 'a'],
	['ã', 'a'],
	['ä', 'ae'],
	['å', 'a'],
	['æ', 'ae'],
	['ç', 'c'],
	['è', 'e'],
	['é', 'e'],
	['ê', 'e'],
	['ë', 'e'],
	['ì', 'i'],
	['í', 'i'],
	['î', 'i'],
	['ï', 'i'],
	['ð', 'd'],
	['ñ', 'n'],
	['ò', 'o'],
	['ó', 'o'],
	['ô', 'o'],
	['õ', 'o'],
	['ö', 'oe'],
	['ő', 'o'],
	['ø', 'o'],
	['ù', 'u'],
	['ú', 'u'],
	['û', 'u'],
	['ü', 'ue'],
	['ű', 'u'],
	['ý', 'y'],
	['þ', 'th'],
	['ÿ', 'y'],
	['ẞ', 'SS'],

	// Vietnamese
	['à', 'a'],
	['À', 'A'],
	['á', 'a'],
	['Á', 'A'],
	['â', 'a'],
	['Â', 'A'],
	['ã', 'a'],
	['Ã', 'A'],
	['è', 'e'],
	['È', 'E'],
	['é', 'e'],
	['É', 'E'],
	['ê', 'e'],
	['Ê', 'E'],
	['ì', 'i'],
	['Ì', 'I'],
	['í', 'i'],
	['Í', 'I'],
	['ò', 'o'],
	['Ò', 'O'],
	['ó', 'o'],
	['Ó', 'O'],
	['ô', 'o'],
	['Ô', 'O'],
	['õ', 'o'],
	['Õ', 'O'],
	['ù', 'u'],
	['Ù', 'U'],
	['ú', 'u'],
	['Ú', 'U'],
	['ý', 'y'],
	['Ý', 'Y'],
	['ă', 'a'],
	['Ă', 'A'],
	['Đ', 'D'],
	['đ', 'd'],
	['ĩ', 'i'],
	['Ĩ', 'I'],
	['ũ', 'u'],
	['Ũ', 'U'],
	['ơ', 'o'],
	['Ơ', 'O'],
	['ư', 'u'],
	['Ư', 'U'],
	['ạ', 'a'],
	['Ạ', 'A'],
	['ả', 'a'],
	['Ả', 'A'],
	['ấ', 'a'],
	['Ấ', 'A'],
	['ầ', 'a'],
	['Ầ', 'A'],
	['ẩ', 'a'],
	['Ẩ', 'A'],
	['ẫ', 'a'],
	['Ẫ', 'A'],
	['ậ', 'a'],
	['Ậ', 'A'],
	['ắ', 'a'],
	['Ắ', 'A'],
	['ằ', 'a'],
	['Ằ', 'A'],
	['ẳ', 'a'],
	['Ẳ', 'A'],
	['ẵ', 'a'],
	['Ẵ', 'A'],
	['ặ', 'a'],
	['Ặ', 'A'],
	['ẹ', 'e'],
	['Ẹ', 'E'],
	['ẻ', 'e'],
	['Ẻ', 'E'],
	['ẽ', 'e'],
	['Ẽ', 'E'],
	['ế', 'e'],
	['Ế', 'E'],
	['ề', 'e'],
	['Ề', 'E'],
	['ể', 'e'],
	['Ể', 'E'],
	['ễ', 'e'],
	['Ễ', 'E'],
	['ệ', 'e'],
	['Ệ', 'E'],
	['ỉ', 'i'],
	['Ỉ', 'I'],
	['ị', 'i'],
	['Ị', 'I'],
	['ọ', 'o'],
	['Ọ', 'O'],
	['ỏ', 'o'],
	['Ỏ', 'O'],
	['ố', 'o'],
	['Ố', 'O'],
	['ồ', 'o'],
	['Ồ', 'O'],
	['ổ', 'o'],
	['Ổ', 'O'],
	['ỗ', 'o'],
	['Ỗ', 'O'],
	['ộ', 'o'],
	['Ộ', 'O'],
	['ớ', 'o'],
	['Ớ', 'O'],
	['ờ', 'o'],
	['Ờ', 'O'],
	['ở', 'o'],
	['Ở', 'O'],
	['ỡ', 'o'],
	['Ỡ', 'O'],
	['ợ', 'o'],
	['Ợ', 'O'],
	['ụ', 'u'],
	['Ụ', 'U'],
	['ủ', 'u'],
	['Ủ', 'U'],
	['ứ', 'u'],
	['Ứ', 'U'],
	['ừ', 'u'],
	['Ừ', 'U'],
	['ử', 'u'],
	['Ử', 'U'],
	['ữ', 'u'],
	['Ữ', 'U'],
	['ự', 'u'],
	['Ự', 'U'],
	['ỳ', 'y'],
	['Ỳ', 'Y'],
	['ỵ', 'y'],
	['Ỵ', 'Y'],
	['ỷ', 'y'],
	['Ỷ', 'Y'],
	['ỹ', 'y'],
	['Ỹ', 'Y'],

	// Arabic
	['ء', 'e'],
	['آ', 'a'],
	['أ', 'a'],
	['ؤ', 'w'],
	['إ', 'i'],
	['ئ', 'y'],
	['ا', 'a'],
	['ب', 'b'],
	['ة', 't'],
	['ت', 't'],
	['ث', 'th'],
	['ج', 'j'],
	['ح', 'h'],
	['خ', 'kh'],
	['د', 'd'],
	['ذ', 'dh'],
	['ر', 'r'],
	['ز', 'z'],
	['س', 's'],
	['ش', 'sh'],
	['ص', 's'],
	['ض', 'd'],
	['ط', 't'],
	['ظ', 'z'],
	['ع', 'e'],
	['غ', 'gh'],
	['ـ', '_'],
	['ف', 'f'],
	['ق', 'q'],
	['ك', 'k'],
	['ل', 'l'],
	['م', 'm'],
	['ن', 'n'],
	['ه', 'h'],
	['و', 'w'],
	['ى', 'a'],
	['ي', 'y'],
	['َ‎', 'a'],
	['ُ', 'u'],
	['ِ‎', 'i'],
	['٠', '0'],
	['١', '1'],
	['٢', '2'],
	['٣', '3'],
	['٤', '4'],
	['٥', '5'],
	['٦', '6'],
	['٧', '7'],
	['٨', '8'],
	['٩', '9'],

	// Persian / Farsi
	['چ', 'ch'],
	['ک', 'k'],
	['گ', 'g'],
	['پ', 'p'],
	['ژ', 'zh'],
	['ی', 'y'],
	['۰', '0'],
	['۱', '1'],
	['۲', '2'],
	['۳', '3'],
	['۴', '4'],
	['۵', '5'],
	['۶', '6'],
	['۷', '7'],
	['۸', '8'],
	['۹', '9'],

	// Pashto
	['ټ', 'p'],
	['ځ', 'z'],
	['څ', 'c'],
	['ډ', 'd'],
	['ﺫ', 'd'],
	['ﺭ', 'r'],
	['ړ', 'r'],
	['ﺯ', 'z'],
	['ږ', 'g'],
	['ښ', 'x'],
	['ګ', 'g'],
	['ڼ', 'n'],
	['ۀ', 'e'],
	['ې', 'e'],
	['ۍ', 'ai'],

	// Urdu
	['ٹ', 't'],
	['ڈ', 'd'],
	['ڑ', 'r'],
	['ں', 'n'],
	['ہ', 'h'],
	['ھ', 'h'],
	['ے', 'e'],

	// Russian
	['А', 'A'],
	['а', 'a'],
	['Б', 'B'],
	['б', 'b'],
	['В', 'V'],
	['в', 'v'],
	['Г', 'G'],
	['г', 'g'],
	['Д', 'D'],
	['д', 'd'],
	['Е', 'E'],
	['е', 'e'],
	['Ж', 'Zh'],
	['ж', 'zh'],
	['З', 'Z'],
	['з', 'z'],
	['И', 'I'],
	['и', 'i'],
	['Й', 'J'],
	['й', 'j'],
	['К', 'K'],
	['к', 'k'],
	['Л', 'L'],
	['л', 'l'],
	['М', 'M'],
	['м', 'm'],
	['Н', 'N'],
	['н', 'n'],
	['О', 'O'],
	['о', 'o'],
	['П', 'P'],
	['п', 'p'],
	['Р', 'R'],
	['р', 'r'],
	['С', 'S'],
	['с', 's'],
	['Т', 'T'],
	['т', 't'],
	['У', 'U'],
	['у', 'u'],
	['Ф', 'F'],
	['ф', 'f'],
	['Х', 'H'],
	['х', 'h'],
	['Ц', 'Cz'],
	['ц', 'cz'],
	['Ч', 'Ch'],
	['ч', 'ch'],
	['Ш', 'Sh'],
	['ш', 'sh'],
	['Щ', 'Shh'],
	['щ', 'shh'],
	['Ъ', ''],
	['ъ', ''],
	['Ы', 'Y'],
	['ы', 'y'],
	['Ь', ''],
	['ь', ''],
	['Э', 'E'],
	['э', 'e'],
	['Ю', 'Yu'],
	['ю', 'yu'],
	['Я', 'Ya'],
	['я', 'ya'],
	['Ё', 'Yo'],
	['ё', 'yo'],

	// Romanian
	['ă', 'a'],
	['Ă', 'A'],
	['ș', 's'],
	['Ș', 'S'],
	['ț', 't'],
	['Ț', 'T'],
	['ţ', 't'],
	['Ţ', 'T'],

	// Turkish
	['ş', 's'],
	['Ş', 'S'],
	['ç', 'c'],
	['Ç', 'C'],
	['ğ', 'g'],
	['Ğ', 'G'],
	['ı', 'i'],
	['İ', 'I'],

	// Armenian
	['ա', 'a'],
	['բ', 'b'],
	['գ', 'g'],
	['դ', 'd'],
	['ե', 'ye'],
	['զ', 'z'],
	['է', 'e'],
	['ը', 'u'],
	['թ', 't'],
	['ժ', 'zh'],
	['ի', 'i'],
	['լ', 'l'],
	['խ', 'kh'],
	['ծ', 'ts'],
	['կ', 'k'],
	['հ', 'h'],
	['ձ', 'dz'],
	['ղ', 'r'],
	['ճ', 'j'],
	['մ', 'm'],
	['յ', 'j'],
	['ն', 'n'],
	['շ', 'sh'],
	['ո', 'vo'],
	['չ', 'ch'],
	['պ', 'p'],
	['ջ', 'j'],
	['ռ', 'r'],
	['ս', 's'],
	['վ', 'v'],
	['տ', 't'],
	['ր', 're'],
	['ց', 'ts'],
	['ու', 'u'],
	['ւ', 'v'],
	['փ', 'p'],
	['ք', 'q'],
	['օ', 'o'],
	['ֆ', 'f'],
	['և', 'yev'],

	// Georgian
	['ა', 'a'],
	['ბ', 'b'],
	['გ', 'g'],
	['დ', 'd'],
	['ე', 'e'],
	['ვ', 'v'],
	['ზ', 'z'],
	['თ', 't'],
	['ი', 'i'],
	['კ', 'k'],
	['ლ', 'l'],
	['მ', 'm'],
	['ნ', 'n'],
	['ო', 'o'],
	['პ', 'p'],
	['ჟ', 'zh'],
	['რ', 'r'],
	['ს', 's'],
	['ტ', 't'],
	['უ', 'u'],
	['ფ', 'ph'],
	['ქ', 'q'],
	['ღ', 'gh'],
	['ყ', 'k'],
	['შ', 'sh'],
	['ჩ', 'ch'],
	['ც', 'ts'],
	['ძ', 'dz'],
	['წ', 'ts'],
	['ჭ', 'tch'],
	['ხ', 'kh'],
	['ჯ', 'j'],
	['ჰ', 'h'],

	// Czech
	['č', 'c'],
	['ď', 'd'],
	['ě', 'e'],
	['ň', 'n'],
	['ř', 'r'],
	['š', 's'],
	['ť', 't'],
	['ů', 'u'],
	['ž', 'z'],
	['Č', 'C'],
	['Ď', 'D'],
	['Ě', 'E'],
	['Ň', 'N'],
	['Ř', 'R'],
	['Š', 'S'],
	['Ť', 'T'],
	['Ů', 'U'],
	['Ž', 'Z'],

	// Dhivehi
	['ހ', 'h'],
	['ށ', 'sh'],
	['ނ', 'n'],
	['ރ', 'r'],
	['ބ', 'b'],
	['ޅ', 'lh'],
	['ކ', 'k'],
	['އ', 'a'],
	['ވ', 'v'],
	['މ', 'm'],
	['ފ', 'f'],
	['ދ', 'dh'],
	['ތ', 'th'],
	['ލ', 'l'],
	['ގ', 'g'],
	['ޏ', 'gn'],
	['ސ', 's'],
	['ޑ', 'd'],
	['ޒ', 'z'],
	['ޓ', 't'],
	['ޔ', 'y'],
	['ޕ', 'p'],
	['ޖ', 'j'],
	['ޗ', 'ch'],
	['ޘ', 'tt'],
	['ޙ', 'hh'],
	['ޚ', 'kh'],
	['ޛ', 'th'],
	['ޜ', 'z'],
	['ޝ', 'sh'],
	['ޞ', 's'],
	['ޟ', 'd'],
	['ޠ', 't'],
	['ޡ', 'z'],
	['ޢ', 'a'],
	['ޣ', 'gh'],
	['ޤ', 'q'],
	['ޥ', 'w'],
	['ަ', 'a'],
	['ާ', 'aa'],
	['ި', 'i'],
	['ީ', 'ee'],
	['ު', 'u'],
	['ޫ', 'oo'],
	['ެ', 'e'],
	['ޭ', 'ey'],
	['ޮ', 'o'],
	['ޯ', 'oa'],
	['ް', ''],

	// Greek
	['α', 'a'],
	['β', 'v'],
	['γ', 'g'],
	['δ', 'd'],
	['ε', 'e'],
	['ζ', 'z'],
	['η', 'i'],
	['θ', 'th'],
	['ι', 'i'],
	['κ', 'k'],
	['λ', 'l'],
	['μ', 'm'],
	['ν', 'n'],
	['ξ', 'ks'],
	['ο', 'o'],
	['π', 'p'],
	['ρ', 'r'],
	['σ', 's'],
	['τ', 't'],
	['υ', 'y'],
	['φ', 'f'],
	['χ', 'x'],
	['ψ', 'ps'],
	['ω', 'o'],
	['ά', 'a'],
	['έ', 'e'],
	['ί', 'i'],
	['ό', 'o'],
	['ύ', 'y'],
	['ή', 'i'],
	['ώ', 'o'],
	['ς', 's'],
	['ϊ', 'i'],
	['ΰ', 'y'],
	['ϋ', 'y'],
	['ΐ', 'i'],
	['Α', 'A'],
	['Β', 'B'],
	['Γ', 'G'],
	['Δ', 'D'],
	['Ε', 'E'],
	['Ζ', 'Z'],
	['Η', 'I'],
	['Θ', 'TH'],
	['Ι', 'I'],
	['Κ', 'K'],
	['Λ', 'L'],
	['Μ', 'M'],
	['Ν', 'N'],
	['Ξ', 'KS'],
	['Ο', 'O'],
	['Π', 'P'],
	['Ρ', 'R'],
	['Σ', 'S'],
	['Τ', 'T'],
	['Υ', 'Y'],
	['Φ', 'F'],
	['Χ', 'X'],
	['Ψ', 'PS'],
	['Ω', 'O'],
	['Ά', 'A'],
	['Έ', 'E'],
	['Ί', 'I'],
	['Ό', 'O'],
	['Ύ', 'Y'],
	['Ή', 'I'],
	['Ώ', 'O'],
	['Ϊ', 'I'],
	['Ϋ', 'Y'],

	// Disabled as it conflicts with German and Latin.
	// Hungarian
	// ['ä', 'a'],
	// ['Ä', 'A'],
	// ['ö', 'o'],
	// ['Ö', 'O'],
	// ['ü', 'u'],
	// ['Ü', 'U'],
	// ['ű', 'u'],
	// ['Ű', 'U'],

	// Latvian
	['ā', 'a'],
	['ē', 'e'],
	['ģ', 'g'],
	['ī', 'i'],
	['ķ', 'k'],
	['ļ', 'l'],
	['ņ', 'n'],
	['ū', 'u'],
	['Ā', 'A'],
	['Ē', 'E'],
	['Ģ', 'G'],
	['Ī', 'I'],
	['Ķ', 'K'],
	['Ļ', 'L'],
	['Ņ', 'N'],
	['Ū', 'U'],
	['č', 'c'],
	['š', 's'],
	['ž', 'z'],
	['Č', 'C'],
	['Š', 'S'],
	['Ž', 'Z'],

	// Lithuanian
	['ą', 'a'],
	['č', 'c'],
	['ę', 'e'],
	['ė', 'e'],
	['į', 'i'],
	['š', 's'],
	['ų', 'u'],
	['ū', 'u'],
	['ž', 'z'],
	['Ą', 'A'],
	['Č', 'C'],
	['Ę', 'E'],
	['Ė', 'E'],
	['Į', 'I'],
	['Š', 'S'],
	['Ų', 'U'],
	['Ū', 'U'],

	// Macedonian
	['Ќ', 'Kj'],
	['ќ', 'kj'],
	['Љ', 'Lj'],
	['љ', 'lj'],
	['Њ', 'Nj'],
	['њ', 'nj'],
	['Тс', 'Ts'],
	['тс', 'ts'],

	// Polish
	['ą', 'a'],
	['ć', 'c'],
	['ę', 'e'],
	['ł', 'l'],
	['ń', 'n'],
	['ś', 's'],
	['ź', 'z'],
	['ż', 'z'],
	['Ą', 'A'],
	['Ć', 'C'],
	['Ę', 'E'],
	['Ł', 'L'],
	['Ń', 'N'],
	['Ś', 'S'],
	['Ź', 'Z'],
	['Ż', 'Z'],

	// Disabled as it conflicts with Vietnamese.
	// Serbian
	// ['љ', 'lj'],
	// ['њ', 'nj'],
	// ['Љ', 'Lj'],
	// ['Њ', 'Nj'],
	// ['đ', 'dj'],
	// ['Đ', 'Dj'],
	// ['ђ', 'dj'],
	// ['ј', 'j'],
	// ['ћ', 'c'],
	// ['џ', 'dz'],
	// ['Ђ', 'Dj'],
	// ['Ј', 'j'],
	// ['Ћ', 'C'],
	// ['Џ', 'Dz'],

	// Disabled as it conflicts with German and Latin.
	// Slovak
	// ['ä', 'a'],
	// ['Ä', 'A'],
	// ['ľ', 'l'],
	// ['ĺ', 'l'],
	// ['ŕ', 'r'],
	// ['Ľ', 'L'],
	// ['Ĺ', 'L'],
	// ['Ŕ', 'R'],

	// Disabled as it conflicts with German and Latin.
	// Swedish
	// ['å', 'o'],
	// ['Å', 'o'],
	// ['ä', 'a'],
	// ['Ä', 'A'],
	// ['ë', 'e'],
	// ['Ë', 'E'],
	// ['ö', 'o'],
	// ['Ö', 'O'],

	// Ukrainian
	['Є', 'Ye'],
	['І', 'I'],
	['Ї', 'Yi'],
	['Ґ', 'G'],
	['є', 'ye'],
	['і', 'i'],
	['ї', 'yi'],
	['ґ', 'g']

	// Danish
	// ['Æ', 'Ae'],
	// ['Ø', 'Oe'],
	// ['Å', 'Aa'],
	// ['æ', 'ae'],
	// ['ø', 'oe'],
	// ['å', 'aa']
];


/***/ }),
/* 420 */,
/* 421 */,
/* 422 */
/***/ (function(module) {

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __spreadArrays;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
var __classPrivateFieldGet;
var __classPrivateFieldSet;
var __createBinding;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if ( true && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    __extends = function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function(m, exports) {
        for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
    };

    __createBinding = Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    });

    __values = function (o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    __spreadArrays = function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    var __setModuleDefault = Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
        o["default"] = v;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    __classPrivateFieldGet = function (receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    };

    __classPrivateFieldSet = function (receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__createBinding", __createBinding);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
    exporter("__classPrivateFieldGet", __classPrivateFieldGet);
    exporter("__classPrivateFieldSet", __classPrivateFieldSet);
});


/***/ }),
/* 423 */,
/* 424 */,
/* 425 */,
/* 426 */,
/* 427 */,
/* 428 */,
/* 429 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core_1 = __webpack_require__(470);
const graph_1 = __webpack_require__(982);
const summary_1 = __webpack_require__(596);
const update_1 = __webpack_require__(972);
const token = core_1.getInput("token") || process.env.GH_PAT || process.env.GITHUB_TOKEN;
exports.run = async () => {
    if (!token)
        throw new Error("GitHub token not found");
    core_1.debug("Starting Upptime");
    switch (core_1.getInput("command")) {
        case "summary":
            core_1.debug("Starting summary");
        case "readme":
            core_1.debug("Starting readme");
            return summary_1.generateSummary();
        case "graph":
            core_1.debug("Starting graph");
            return graph_1.generateGraphs();
        case "response-time":
            core_1.debug("Starting response-time");
            return update_1.update(true);
        default:
            core_1.debug("Starting update");
            return update_1.update();
    }
};
exports.run()
    .then(() => { })
    .catch((error) => {
    console.error("ERROR", error);
    core_1.setFailed(error.message);
});


/***/ }),
/* 430 */,
/* 431 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(__webpack_require__(87));
const utils_1 = __webpack_require__(82);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),
/* 432 */,
/* 433 */,
/* 434 */,
/* 435 */,
/* 436 */,
/* 437 */,
/* 438 */,
/* 439 */,
/* 440 */,
/* 441 */,
/* 442 */,
/* 443 */,
/* 444 */,
/* 445 */,
/* 446 */,
/* 447 */,
/* 448 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

var universalUserAgent = __webpack_require__(796);
var beforeAfterHook = __webpack_require__(523);
var request = __webpack_require__(753);
var graphql = __webpack_require__(898);
var authToken = __webpack_require__(813);

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

const VERSION = "2.5.4";

class Octokit {
  constructor(options = {}) {
    const hook = new beforeAfterHook.Collection();
    const requestDefaults = {
      baseUrl: request.request.endpoint.DEFAULTS.baseUrl,
      headers: {},
      request: Object.assign({}, options.request, {
        hook: hook.bind(null, "request")
      }),
      mediaType: {
        previews: [],
        format: ""
      }
    }; // prepend default user agent with `options.userAgent` if set

    requestDefaults.headers["user-agent"] = [options.userAgent, `octokit-core.js/${VERSION} ${universalUserAgent.getUserAgent()}`].filter(Boolean).join(" ");

    if (options.baseUrl) {
      requestDefaults.baseUrl = options.baseUrl;
    }

    if (options.previews) {
      requestDefaults.mediaType.previews = options.previews;
    }

    if (options.timeZone) {
      requestDefaults.headers["time-zone"] = options.timeZone;
    }

    this.request = request.request.defaults(requestDefaults);
    this.graphql = graphql.withCustomRequest(this.request).defaults(_objectSpread2(_objectSpread2({}, requestDefaults), {}, {
      baseUrl: requestDefaults.baseUrl.replace(/\/api\/v3$/, "/api")
    }));
    this.log = Object.assign({
      debug: () => {},
      info: () => {},
      warn: console.warn.bind(console),
      error: console.error.bind(console)
    }, options.log);
    this.hook = hook; // (1) If neither `options.authStrategy` nor `options.auth` are set, the `octokit` instance
    //     is unauthenticated. The `this.auth()` method is a no-op and no request hook is registred.
    // (2) If only `options.auth` is set, use the default token authentication strategy.
    // (3) If `options.authStrategy` is set then use it and pass in `options.auth`. Always pass own request as many strategies accept a custom request instance.
    // TODO: type `options.auth` based on `options.authStrategy`.

    if (!options.authStrategy) {
      if (!options.auth) {
        // (1)
        this.auth = async () => ({
          type: "unauthenticated"
        });
      } else {
        // (2)
        const auth = authToken.createTokenAuth(options.auth); // @ts-ignore  ¯\_(ツ)_/¯

        hook.wrap("request", auth.hook);
        this.auth = auth;
      }
    } else {
      const auth = options.authStrategy(Object.assign({
        request: this.request
      }, options.auth)); // @ts-ignore  ¯\_(ツ)_/¯

      hook.wrap("request", auth.hook);
      this.auth = auth;
    } // apply plugins
    // https://stackoverflow.com/a/16345172


    const classConstructor = this.constructor;
    classConstructor.plugins.forEach(plugin => {
      Object.assign(this, plugin(this, options));
    });
  }

  static defaults(defaults) {
    const OctokitWithDefaults = class extends this {
      constructor(...args) {
        const options = args[0] || {};
        super(Object.assign({}, defaults, options, options.userAgent && defaults.userAgent ? {
          userAgent: `${options.userAgent} ${defaults.userAgent}`
        } : null));
      }

    };
    return OctokitWithDefaults;
  }
  /**
   * Attach a plugin (or many) to your Octokit instance.
   *
   * @example
   * const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
   */


  static plugin(p1, ...p2) {
    var _a;

    if (p1 instanceof Array) {
      console.warn(["Passing an array of plugins to Octokit.plugin() has been deprecated.", "Instead of:", "  Octokit.plugin([plugin1, plugin2, ...])", "Use:", "  Octokit.plugin(plugin1, plugin2, ...)"].join("\n"));
    }

    const currentPlugins = this.plugins;
    let newPlugins = [...(p1 instanceof Array ? p1 : [p1]), ...p2];
    const NewOctokit = (_a = class extends this {}, _a.plugins = currentPlugins.concat(newPlugins.filter(plugin => !currentPlugins.includes(plugin))), _a);
    return NewOctokit;
  }

}
Octokit.VERSION = VERSION;
Octokit.plugins = [];

exports.Octokit = Octokit;
//# sourceMappingURL=index.js.map


/***/ }),
/* 449 */,
/* 450 */,
/* 451 */,
/* 452 */,
/* 453 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var once = __webpack_require__(969)
var eos = __webpack_require__(9)
var fs = __webpack_require__(747) // we only need fs to get the ReadStream and WriteStream prototypes

var noop = function () {}
var ancient = /^v?\.0/.test(process.version)

var isFn = function (fn) {
  return typeof fn === 'function'
}

var isFS = function (stream) {
  if (!ancient) return false // newer node version do not need to care about fs is a special way
  if (!fs) return false // browser
  return (stream instanceof (fs.ReadStream || noop) || stream instanceof (fs.WriteStream || noop)) && isFn(stream.close)
}

var isRequest = function (stream) {
  return stream.setHeader && isFn(stream.abort)
}

var destroyer = function (stream, reading, writing, callback) {
  callback = once(callback)

  var closed = false
  stream.on('close', function () {
    closed = true
  })

  eos(stream, {readable: reading, writable: writing}, function (err) {
    if (err) return callback(err)
    closed = true
    callback()
  })

  var destroyed = false
  return function (err) {
    if (closed) return
    if (destroyed) return
    destroyed = true

    if (isFS(stream)) return stream.close(noop) // use close for fs streams to avoid fd leaks
    if (isRequest(stream)) return stream.abort() // request.destroy just do .end - .abort is what we want

    if (isFn(stream.destroy)) return stream.destroy()

    callback(err || new Error('stream was destroyed'))
  }
}

var call = function (fn) {
  fn()
}

var pipe = function (from, to) {
  return from.pipe(to)
}

var pump = function () {
  var streams = Array.prototype.slice.call(arguments)
  var callback = isFn(streams[streams.length - 1] || noop) && streams.pop() || noop

  if (Array.isArray(streams[0])) streams = streams[0]
  if (streams.length < 2) throw new Error('pump requires two streams per minimum')

  var error
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1
    var writing = i > 0
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err
      if (err) destroys.forEach(call)
      if (reading) return
      destroys.forEach(call)
      callback(error)
    })
  })

  return streams.reduce(pipe)
}

module.exports = pump


/***/ }),
/* 454 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Stream = _interopDefault(__webpack_require__(413));
var http = _interopDefault(__webpack_require__(605));
var Url = _interopDefault(__webpack_require__(835));
var https = _interopDefault(__webpack_require__(34));
var zlib = _interopDefault(__webpack_require__(761));

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = __webpack_require__(18).convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
		if (!res) {
			res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
			if (res) {
				res.pop(); // drop last quote
			}
		}

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout,
							size: request.size
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

module.exports = exports = fetch;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.FetchError = FetchError;


/***/ }),
/* 455 */,
/* 456 */,
/* 457 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


/*eslint-disable max-len,no-use-before-define*/

var common              = __webpack_require__(740);
var YAMLException       = __webpack_require__(556);
var Mark                = __webpack_require__(180);
var DEFAULT_SAFE_SCHEMA = __webpack_require__(830);
var DEFAULT_FULL_SCHEMA = __webpack_require__(910);


var _hasOwnProperty = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function _class(obj) { return Object.prototype.toString.call(obj); }

function is_EOL(c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

function is_WHITE_SPACE(c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
}

function is_WS_OR_EOL(c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */);
}

function is_FLOW_INDICATOR(c) {
  return c === 0x2C/* , */ ||
         c === 0x5B/* [ */ ||
         c === 0x5D/* ] */ ||
         c === 0x7B/* { */ ||
         c === 0x7D/* } */;
}

function fromHexCode(c) {
  var lc;

  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  /*eslint-disable no-bitwise*/
  lc = c | 0x20;

  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78/* x */) { return 2; }
  if (c === 0x75/* u */) { return 4; }
  if (c === 0x55/* U */) { return 8; }
  return 0;
}

function fromDecimalCode(c) {
  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  /* eslint-disable indent */
  return (c === 0x30/* 0 */) ? '\x00' :
        (c === 0x61/* a */) ? '\x07' :
        (c === 0x62/* b */) ? '\x08' :
        (c === 0x74/* t */) ? '\x09' :
        (c === 0x09/* Tab */) ? '\x09' :
        (c === 0x6E/* n */) ? '\x0A' :
        (c === 0x76/* v */) ? '\x0B' :
        (c === 0x66/* f */) ? '\x0C' :
        (c === 0x72/* r */) ? '\x0D' :
        (c === 0x65/* e */) ? '\x1B' :
        (c === 0x20/* Space */) ? ' ' :
        (c === 0x22/* " */) ? '\x22' :
        (c === 0x2F/* / */) ? '/' :
        (c === 0x5C/* \ */) ? '\x5C' :
        (c === 0x4E/* N */) ? '\x85' :
        (c === 0x5F/* _ */) ? '\xA0' :
        (c === 0x4C/* L */) ? '\u2028' :
        (c === 0x50/* P */) ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode(
    ((c - 0x010000) >> 10) + 0xD800,
    ((c - 0x010000) & 0x03FF) + 0xDC00
  );
}

var simpleEscapeCheck = new Array(256); // integer, for fast access
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}


function State(input, options) {
  this.input = input;

  this.filename  = options['filename']  || null;
  this.schema    = options['schema']    || DEFAULT_FULL_SCHEMA;
  this.onWarning = options['onWarning'] || null;
  this.legacy    = options['legacy']    || false;
  this.json      = options['json']      || false;
  this.listener  = options['listener']  || null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap       = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;

  this.documents = [];

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  return new YAMLException(
    message,
    new Mark(state.filename, state.input, state.position, state.line, (state.position - state.lineStart)));
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}


var directiveHandlers = {

  YAML: function handleYamlDirective(state, name, args) {

    var match, major, minor;

    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive');
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument');
    }

    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive');
    }

    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document');
    }

    state.version = args[0];
    state.checkLineBreaks = (minor < 2);

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document');
    }
  },

  TAG: function handleTagDirective(state, name, args) {

    var handle, prefix;

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments');
    }

    handle = args[0];
    prefix = args[1];

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
    }

    if (_hasOwnProperty.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
    }

    state.tagMap[handle] = prefix;
  }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 0x09 ||
              (0x20 <= _character && _character <= 0x10FFFF))) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}

function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
  var index, quantity;

  // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);

    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, 'nested arrays are not supported inside keys');
      }

      if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
        keyNode[index] = '[object Object]';
      }
    }
  }

  // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)
  if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
    keyNode = '[object Object]';
  }


  keyNode = String(keyNode);

  if (_result === null) {
    _result = {};
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json &&
        !_hasOwnProperty.call(overridableKeys, keyNode) &&
        _hasOwnProperty.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.position = startPos || state.position;
      throwError(state, 'duplicated mapping key');
    }
    _result[keyNode] = valueNode;
    delete overridableKeys[keyNode];
  }

  return _result;
}

function readLineBreak(state) {
  var ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x0A/* LF */) {
    state.position++;
  } else if (ch === 0x0D/* CR */) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && ch === 0x23/* # */) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);

      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (ch === 0x20/* Space */) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;

  ch = state.input.charCodeAt(_position);

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
      ch === state.input.charCodeAt(_position + 1) &&
      ch === state.input.charCodeAt(_position + 2)) {

    _position += 3;

    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch)      ||
      is_FLOW_INDICATOR(ch) ||
      ch === 0x23/* # */    ||
      ch === 0x26/* & */    ||
      ch === 0x2A/* * */    ||
      ch === 0x21/* ! */    ||
      ch === 0x7C/* | */    ||
      ch === 0x3E/* > */    ||
      ch === 0x27/* ' */    ||
      ch === 0x22/* " */    ||
      ch === 0x25/* % */    ||
      ch === 0x40/* @ */    ||
      ch === 0x60/* ` */) {
    return false;
  }

  if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) ||
        withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (ch !== 0) {
    if (ch === 0x3A/* : */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }

    } else if (ch === 0x23/* # */) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;

    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch,
      captureStart, captureEnd;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x27/* ' */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27/* ' */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x27/* ' */) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexResult,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x22/* " */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22/* " */) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;

    } else if (ch === 0x5C/* \ */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);

        // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;

      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += charFromCodepoint(hexResult);

        state.position++;

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _tag     = state.tag,
      _result,
      _anchor  = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      overridableKeys = {},
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D;/* ] */
    isMapping = false;
    _result = [];
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D;/* } */
    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (ch === 0x3F/* ? */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x2C/* , */) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      didReadContent = false,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C/* | */) {
    folding = false;
  } else if (ch === 0x3E/* > */) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (is_WHITE_SPACE(ch));

    if (ch === 0x23/* # */) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (!is_EOL(ch) && (ch !== 0));
    }
  }

  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;

    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (ch === 0x20/* Space */)) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        // except for the first content line (cf. Example 8.1)
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
    }

    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && (ch !== 0)) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _anchor   = state.anchor,
      _result   = [],
      following,
      detected  = false,
      ch;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {

    if (ch !== 0x2D/* - */) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }
  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _pos,
      _tag          = state.tag,
      _anchor       = state.anchor,
      _result       = {},
      overridableKeys = {},
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false,
      ch;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.
    _pos = state.position;

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

      if (ch === 0x3F/* ? */) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
      }

      state.position += 1;
      ch = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x3A/* : */) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }

    } else {
      break; // Reading is done. Go to the epilogue.
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _pos);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if (state.lineIndent > nodeIndent && (ch !== 0)) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x21/* ! */) return false;

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (ch === 0x3C/* < */) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);

  } else if (ch === 0x21/* ! */) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (ch !== 0 && ch !== 0x3E/* > */);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {

      if (ch === 0x21/* ! */) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if (tagHandle === '!') {
    state.tag = '!' + tagName;

  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x26/* & */) return false;

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x2A/* * */) return false;

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!state.anchorMap.hasOwnProperty(alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
      atNewLine  = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      type,
      flowIndent,
      blockIndent;

  if (state.listener !== null) {
    state.listener('open', state);
  }

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (indentStatus === 1) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent, flowIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (state.tag === null) {
            state.tag = '?';
          }
        }

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (state.tag !== null && state.tag !== '!') {
    if (state.tag === '?') {
      // Implicit resolving is not allowed for non-scalar types, and '?'
      // non-specific tag is only automatically assigned to plain scalars.
      //
      // We only need to check kind conformity in case user explicitly assigns '?'
      // tag, for example like this: "!<?> [0]"
      //
      if (state.result !== null && state.kind !== 'scalar') {
        throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
      }

      for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
        type = state.implicitTypes[typeIndex];

        if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
          state.result = type.construct(state.result);
          state.tag = type.tag;
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
          break;
        }
      }
    } else if (_hasOwnProperty.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
      type = state.typeMap[state.kind || 'fallback'][state.tag];

      if (state.result !== null && type.kind !== state.kind) {
        throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
      }

      if (!type.resolve(state.result)) { // `state.result` updated in resolver if matched
        throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
      } else {
        state.result = type.construct(state.result);
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }
  }

  if (state.listener !== null) {
    state.listener('close', state);
  }
  return state.tag !== null ||  state.anchor !== null || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = {};
  state.anchorMap = {};

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || ch !== 0x25/* % */) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (ch !== 0 && !is_EOL(ch));
        break;
      }

      if (is_EOL(ch)) break;

      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (ch !== 0) readLineBreak(state);

    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (state.lineIndent === 0 &&
      state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {

    if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}


function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {

    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
        input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
      input += '\n';
    }

    // Strip BOM
    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State(input, options);

  var nullpos = input.indexOf('\0');

  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, 'null byte is not allowed in input');
  }

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0';

  while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < (state.length - 1)) {
    readDocument(state);
  }

  return state.documents;
}


function loadAll(input, iterator, options) {
  if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
    options = iterator;
    iterator = null;
  }

  var documents = loadDocuments(input, options);

  if (typeof iterator !== 'function') {
    return documents;
  }

  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}


function load(input, options) {
  var documents = loadDocuments(input, options);

  if (documents.length === 0) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new YAMLException('expected a single document in the stream, but found more');
}


function safeLoadAll(input, iterator, options) {
  if (typeof iterator === 'object' && iterator !== null && typeof options === 'undefined') {
    options = iterator;
    iterator = null;
  }

  return loadAll(input, iterator, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}


function safeLoad(input, options) {
  return load(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}


module.exports.loadAll     = loadAll;
module.exports.load        = load;
module.exports.safeLoadAll = safeLoadAll;
module.exports.safeLoad    = safeLoad;


/***/ }),
/* 458 */,
/* 459 */,
/* 460 */,
/* 461 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);
var transformData = __webpack_require__(589);
var isCancel = __webpack_require__(732);
var defaults = __webpack_require__(529);

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),
/* 462 */,
/* 463 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var deprecation = __webpack_require__(692);
var once = _interopDefault(__webpack_require__(969));

const logOnce = once(deprecation => console.warn(deprecation));
/**
 * Error with extra properties to help with debugging
 */

class RequestError extends Error {
  constructor(message, statusCode, options) {
    super(message); // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = "HttpError";
    this.status = statusCode;
    Object.defineProperty(this, "code", {
      get() {
        logOnce(new deprecation.Deprecation("[@octokit/request-error] `error.code` is deprecated, use `error.status`."));
        return statusCode;
      }

    });
    this.headers = options.headers || {}; // redact request credentials without mutating original request options

    const requestCopy = Object.assign({}, options.request);

    if (options.request.headers.authorization) {
      requestCopy.headers = Object.assign({}, options.request.headers, {
        authorization: options.request.headers.authorization.replace(/ .*$/, " [REDACTED]")
      });
    }

    requestCopy.url = requestCopy.url // client_id & client_secret can be passed as URL query parameters to increase rate limit
    // see https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
    .replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]") // OAuth tokens can be passed as URL query parameters, although it is not recommended
    // see https://developer.github.com/v3/#oauth2-token-sent-in-a-header
    .replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
    this.request = requestCopy;
  }

}

exports.RequestError = RequestError;
//# sourceMappingURL=index.js.map


/***/ }),
/* 464 */,
/* 465 */,
/* 466 */,
/* 467 */,
/* 468 */,
/* 469 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const jsonFile = __webpack_require__(666)

module.exports = {
  // jsonfile exports
  readJson: jsonFile.readFile,
  readJsonSync: jsonFile.readFileSync,
  writeJson: jsonFile.writeFile,
  writeJsonSync: jsonFile.writeFileSync
}


/***/ }),
/* 470 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(431);
const file_command_1 = __webpack_require__(102);
const utils_1 = __webpack_require__(82);
const os = __importStar(__webpack_require__(87));
const path = __importStar(__webpack_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),
/* 471 */,
/* 472 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const file = __webpack_require__(149)
const link = __webpack_require__(900)
const symlink = __webpack_require__(849)

module.exports = {
  // file
  createFile: file.createFile,
  createFileSync: file.createFileSync,
  ensureFile: file.createFile,
  ensureFileSync: file.createFileSync,
  // link
  createLink: link.createLink,
  createLinkSync: link.createLinkSync,
  ensureLink: link.createLink,
  ensureLinkSync: link.createLinkSync,
  // symlink
  createSymlink: symlink.createSymlink,
  createSymlinkSync: symlink.createSymlinkSync,
  ensureSymlink: symlink.createSymlink,
  ensureSymlinkSync: symlink.createSymlinkSync
}


/***/ }),
/* 473 */,
/* 474 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(598)
const path = __webpack_require__(622)
const assert = __webpack_require__(357)

const isWindows = (process.platform === 'win32')

function defaults (options) {
  const methods = [
    'unlink',
    'chmod',
    'stat',
    'lstat',
    'rmdir',
    'readdir'
  ]
  methods.forEach(m => {
    options[m] = options[m] || fs[m]
    m = m + 'Sync'
    options[m] = options[m] || fs[m]
  })

  options.maxBusyTries = options.maxBusyTries || 3
}

function rimraf (p, options, cb) {
  let busyTries = 0

  if (typeof options === 'function') {
    cb = options
    options = {}
  }

  assert(p, 'rimraf: missing path')
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string')
  assert.strictEqual(typeof cb, 'function', 'rimraf: callback function required')
  assert(options, 'rimraf: invalid options argument provided')
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object')

  defaults(options)

  rimraf_(p, options, function CB (er) {
    if (er) {
      if ((er.code === 'EBUSY' || er.code === 'ENOTEMPTY' || er.code === 'EPERM') &&
          busyTries < options.maxBusyTries) {
        busyTries++
        const time = busyTries * 100
        // try again, with the same exact callback as this one.
        return setTimeout(() => rimraf_(p, options, CB), time)
      }

      // already gone
      if (er.code === 'ENOENT') er = null
    }

    cb(er)
  })
}

// Two possible strategies.
// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
//
// Both result in an extra syscall when you guess wrong.  However, there
// are likely far more normal files in the world than directories.  This
// is based on the assumption that a the average number of files per
// directory is >= 1.
//
// If anyone ever complains about this, then I guess the strategy could
// be made configurable somehow.  But until then, YAGNI.
function rimraf_ (p, options, cb) {
  assert(p)
  assert(options)
  assert(typeof cb === 'function')

  // sunos lets the root user unlink directories, which is... weird.
  // so we have to lstat here and make sure it's not a dir.
  options.lstat(p, (er, st) => {
    if (er && er.code === 'ENOENT') {
      return cb(null)
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er && er.code === 'EPERM' && isWindows) {
      return fixWinEPERM(p, options, er, cb)
    }

    if (st && st.isDirectory()) {
      return rmdir(p, options, er, cb)
    }

    options.unlink(p, er => {
      if (er) {
        if (er.code === 'ENOENT') {
          return cb(null)
        }
        if (er.code === 'EPERM') {
          return (isWindows)
            ? fixWinEPERM(p, options, er, cb)
            : rmdir(p, options, er, cb)
        }
        if (er.code === 'EISDIR') {
          return rmdir(p, options, er, cb)
        }
      }
      return cb(er)
    })
  })
}

function fixWinEPERM (p, options, er, cb) {
  assert(p)
  assert(options)
  assert(typeof cb === 'function')

  options.chmod(p, 0o666, er2 => {
    if (er2) {
      cb(er2.code === 'ENOENT' ? null : er)
    } else {
      options.stat(p, (er3, stats) => {
        if (er3) {
          cb(er3.code === 'ENOENT' ? null : er)
        } else if (stats.isDirectory()) {
          rmdir(p, options, er, cb)
        } else {
          options.unlink(p, cb)
        }
      })
    }
  })
}

function fixWinEPERMSync (p, options, er) {
  let stats

  assert(p)
  assert(options)

  try {
    options.chmodSync(p, 0o666)
  } catch (er2) {
    if (er2.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  try {
    stats = options.statSync(p)
  } catch (er3) {
    if (er3.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  if (stats.isDirectory()) {
    rmdirSync(p, options, er)
  } else {
    options.unlinkSync(p)
  }
}

function rmdir (p, options, originalEr, cb) {
  assert(p)
  assert(options)
  assert(typeof cb === 'function')

  // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
  // if we guessed wrong, and it's not a directory, then
  // raise the original error.
  options.rmdir(p, er => {
    if (er && (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM')) {
      rmkids(p, options, cb)
    } else if (er && er.code === 'ENOTDIR') {
      cb(originalEr)
    } else {
      cb(er)
    }
  })
}

function rmkids (p, options, cb) {
  assert(p)
  assert(options)
  assert(typeof cb === 'function')

  options.readdir(p, (er, files) => {
    if (er) return cb(er)

    let n = files.length
    let errState

    if (n === 0) return options.rmdir(p, cb)

    files.forEach(f => {
      rimraf(path.join(p, f), options, er => {
        if (errState) {
          return
        }
        if (er) return cb(errState = er)
        if (--n === 0) {
          options.rmdir(p, cb)
        }
      })
    })
  })
}

// this looks simpler, and is strictly *faster*, but will
// tie up the JavaScript thread and fail on excessively
// deep directory trees.
function rimrafSync (p, options) {
  let st

  options = options || {}
  defaults(options)

  assert(p, 'rimraf: missing path')
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string')
  assert(options, 'rimraf: missing options')
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object')

  try {
    st = options.lstatSync(p)
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er.code === 'EPERM' && isWindows) {
      fixWinEPERMSync(p, options, er)
    }
  }

  try {
    // sunos lets the root user unlink directories, which is... weird.
    if (st && st.isDirectory()) {
      rmdirSync(p, options, null)
    } else {
      options.unlinkSync(p)
    }
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    } else if (er.code === 'EPERM') {
      return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er)
    } else if (er.code !== 'EISDIR') {
      throw er
    }
    rmdirSync(p, options, er)
  }
}

function rmdirSync (p, options, originalEr) {
  assert(p)
  assert(options)

  try {
    options.rmdirSync(p)
  } catch (er) {
    if (er.code === 'ENOTDIR') {
      throw originalEr
    } else if (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM') {
      rmkidsSync(p, options)
    } else if (er.code !== 'ENOENT') {
      throw er
    }
  }
}

function rmkidsSync (p, options) {
  assert(p)
  assert(options)
  options.readdirSync(p).forEach(f => rimrafSync(path.join(p, f), options))

  if (isWindows) {
    // We only end up here once we got ENOTEMPTY at least once, and
    // at this point, we are guaranteed to have removed all the kids.
    // So, we know that it won't be ENOENT or ENOTDIR or anything else.
    // try really hard to delete stuff on windows, because it has a
    // PROFOUNDLY annoying habit of not closing handles promptly when
    // files are deleted, resulting in spurious ENOTEMPTY errors.
    const startTime = Date.now()
    do {
      try {
        const ret = options.rmdirSync(p, options)
        return ret
      } catch {}
    } while (Date.now() - startTime < 500) // give up after 500ms
  } else {
    const ret = options.rmdirSync(p, options)
    return ret
  }
}

module.exports = rimraf
rimraf.sync = rimrafSync


/***/ }),
/* 475 */,
/* 476 */,
/* 477 */,
/* 478 */,
/* 479 */,
/* 480 */,
/* 481 */,
/* 482 */,
/* 483 */,
/* 484 */,
/* 485 */,
/* 486 */
/***/ (function(module, __unusedexports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(317);

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* Active `debug` instances.
	*/
	createDebug.instances = [];

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return match;
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.enabled = createDebug.enabled(namespace);
		debug.useColors = createDebug.useColors();
		debug.color = selectColor(namespace);
		debug.destroy = destroy;
		debug.extend = extend;
		// Debug.formatArgs = formatArgs;
		// debug.rawLog = rawLog;

		// env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		createDebug.instances.push(debug);

		return debug;
	}

	function destroy() {
		const index = createDebug.instances.indexOf(this);
		if (index !== -1) {
			createDebug.instances.splice(index, 1);
			return true;
		}
		return false;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}

		for (i = 0; i < createDebug.instances.length; i++) {
			const instance = createDebug.instances[i];
			instance.enabled = createDebug.enabled(instance.namespace);
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),
/* 487 */,
/* 488 */,
/* 489 */,
/* 490 */,
/* 491 */,
/* 492 */,
/* 493 */,
/* 494 */,
/* 495 */,
/* 496 */,
/* 497 */,
/* 498 */,
/* 499 */,
/* 500 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(598)
const path = __webpack_require__(622)
const copy = __webpack_require__(774).copy
const remove = __webpack_require__(723).remove
const mkdirp = __webpack_require__(727).mkdirp
const pathExists = __webpack_require__(322).pathExists
const stat = __webpack_require__(127)

function move (src, dest, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  const overwrite = opts.overwrite || opts.clobber || false

  stat.checkPaths(src, dest, 'move', (err, stats) => {
    if (err) return cb(err)
    const { srcStat } = stats
    stat.checkParentPaths(src, srcStat, dest, 'move', err => {
      if (err) return cb(err)
      mkdirp(path.dirname(dest), err => {
        if (err) return cb(err)
        return doRename(src, dest, overwrite, cb)
      })
    })
  })
}

function doRename (src, dest, overwrite, cb) {
  if (overwrite) {
    return remove(dest, err => {
      if (err) return cb(err)
      return rename(src, dest, overwrite, cb)
    })
  }
  pathExists(dest, (err, destExists) => {
    if (err) return cb(err)
    if (destExists) return cb(new Error('dest already exists.'))
    return rename(src, dest, overwrite, cb)
  })
}

function rename (src, dest, overwrite, cb) {
  fs.rename(src, dest, err => {
    if (!err) return cb()
    if (err.code !== 'EXDEV') return cb(err)
    return moveAcrossDevice(src, dest, overwrite, cb)
  })
}

function moveAcrossDevice (src, dest, overwrite, cb) {
  const opts = {
    overwrite,
    errorOnExist: true
  }
  copy(src, dest, opts, err => {
    if (err) return cb(err)
    return remove(src, cb)
  })
}

module.exports = move


/***/ }),
/* 501 */,
/* 502 */,
/* 503 */,
/* 504 */,
/* 505 */,
/* 506 */,
/* 507 */,
/* 508 */,
/* 509 */,
/* 510 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const path = __webpack_require__(622);
const niceTry = __webpack_require__(948);
const resolveCommand = __webpack_require__(416);
const escape = __webpack_require__(234);
const readShebang = __webpack_require__(336);
const semver = __webpack_require__(955);

const isWin = process.platform === 'win32';
const isExecutableRegExp = /\.(?:com|exe)$/i;
const isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;

// `options.shell` is supported in Node ^4.8.0, ^5.7.0 and >= 6.0.0
const supportsShellOption = niceTry(() => semver.satisfies(process.version, '^4.8.0 || ^5.7.0 || >= 6.0.0', true)) || false;

function detectShebang(parsed) {
    parsed.file = resolveCommand(parsed);

    const shebang = parsed.file && readShebang(parsed.file);

    if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;

        return resolveCommand(parsed);
    }

    return parsed.file;
}

function parseNonShell(parsed) {
    if (!isWin) {
        return parsed;
    }

    // Detect & add support for shebangs
    const commandFile = detectShebang(parsed);

    // We don't need a shell if the command filename is an executable
    const needsShell = !isExecutableRegExp.test(commandFile);

    // If a shell is required, use cmd.exe and take care of escaping everything correctly
    // Note that `forceShell` is an hidden option used only in tests
    if (parsed.options.forceShell || needsShell) {
        // Need to double escape meta chars if the command is a cmd-shim located in `node_modules/.bin/`
        // The cmd-shim simply calls execute the package bin file with NodeJS, proxying any argument
        // Because the escape of metachars with ^ gets interpreted when the cmd.exe is first called,
        // we need to double escape them
        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);

        // Normalize posix paths into OS compatible paths (e.g.: foo/bar -> foo\bar)
        // This is necessary otherwise it will always fail with ENOENT in those cases
        parsed.command = path.normalize(parsed.command);

        // Escape command & arguments
        parsed.command = escape.command(parsed.command);
        parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));

        const shellCommand = [parsed.command].concat(parsed.args).join(' ');

        parsed.args = ['/d', '/s', '/c', `"${shellCommand}"`];
        parsed.command = process.env.comspec || 'cmd.exe';
        parsed.options.windowsVerbatimArguments = true; // Tell node's spawn that the arguments are already escaped
    }

    return parsed;
}

function parseShell(parsed) {
    // If node supports the shell option, there's no need to mimic its behavior
    if (supportsShellOption) {
        return parsed;
    }

    // Mimic node shell option
    // See https://github.com/nodejs/node/blob/b9f6a2dc059a1062776133f3d4fd848c4da7d150/lib/child_process.js#L335
    const shellCommand = [parsed.command].concat(parsed.args).join(' ');

    if (isWin) {
        parsed.command = typeof parsed.options.shell === 'string' ? parsed.options.shell : process.env.comspec || 'cmd.exe';
        parsed.args = ['/d', '/s', '/c', `"${shellCommand}"`];
        parsed.options.windowsVerbatimArguments = true; // Tell node's spawn that the arguments are already escaped
    } else {
        if (typeof parsed.options.shell === 'string') {
            parsed.command = parsed.options.shell;
        } else if (process.platform === 'android') {
            parsed.command = '/system/bin/sh';
        } else {
            parsed.command = '/bin/sh';
        }

        parsed.args = ['-c', shellCommand];
    }

    return parsed;
}

function parse(command, args, options) {
    // Normalize arguments, similar to nodejs
    if (args && !Array.isArray(args)) {
        options = args;
        args = null;
    }

    args = args ? args.slice(0) : []; // Clone array to avoid changing the original
    options = Object.assign({}, options); // Clone object to avoid changing the original

    // Build our parsed object
    const parsed = {
        command,
        args,
        options,
        file: undefined,
        original: {
            command,
            args,
        },
    };

    // Delegate further parsing to shell or non-shell
    return options.shell ? parseShell(parsed) : parseNonShell(parsed);
}

module.exports = parse;


/***/ }),
/* 511 */,
/* 512 */,
/* 513 */,
/* 514 */,
/* 515 */,
/* 516 */,
/* 517 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const u = __webpack_require__(676).fromCallback
const fs = __webpack_require__(598)
const path = __webpack_require__(622)
const mkdir = __webpack_require__(727)
const pathExists = __webpack_require__(322).pathExists

function outputFile (file, data, encoding, callback) {
  if (typeof encoding === 'function') {
    callback = encoding
    encoding = 'utf8'
  }

  const dir = path.dirname(file)
  pathExists(dir, (err, itDoes) => {
    if (err) return callback(err)
    if (itDoes) return fs.writeFile(file, data, encoding, callback)

    mkdir.mkdirs(dir, err => {
      if (err) return callback(err)

      fs.writeFile(file, data, encoding, callback)
    })
  })
}

function outputFileSync (file, ...args) {
  const dir = path.dirname(file)
  if (fs.existsSync(dir)) {
    return fs.writeFileSync(file, ...args)
  }
  mkdir.mkdirsSync(dir)
  fs.writeFileSync(file, ...args)
}

module.exports = {
  outputFile: u(outputFile),
  outputFileSync
}


/***/ }),
/* 518 */,
/* 519 */,
/* 520 */,
/* 521 */,
/* 522 */,
/* 523 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var register = __webpack_require__(280)
var addHook = __webpack_require__(838)
var removeHook = __webpack_require__(866)

// bind with array of arguments: https://stackoverflow.com/a/21792913
var bind = Function.bind
var bindable = bind.bind(bind)

function bindApi (hook, state, name) {
  var removeHookRef = bindable(removeHook, null).apply(null, name ? [state, name] : [state])
  hook.api = { remove: removeHookRef }
  hook.remove = removeHookRef

  ;['before', 'error', 'after', 'wrap'].forEach(function (kind) {
    var args = name ? [state, kind, name] : [state, kind]
    hook[kind] = hook.api[kind] = bindable(addHook, null).apply(null, args)
  })
}

function HookSingular () {
  var singularHookName = 'h'
  var singularHookState = {
    registry: {}
  }
  var singularHook = register.bind(null, singularHookState, singularHookName)
  bindApi(singularHook, singularHookState, singularHookName)
  return singularHook
}

function HookCollection () {
  var state = {
    registry: {}
  }

  var hook = register.bind(null, state)
  bindApi(hook, state)

  return hook
}

var collectionHookDeprecationMessageDisplayed = false
function Hook () {
  if (!collectionHookDeprecationMessageDisplayed) {
    console.warn('[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4')
    collectionHookDeprecationMessageDisplayed = true
  }
  return HookCollection()
}

Hook.Singular = HookSingular.bind()
Hook.Collection = HookCollection.bind()

module.exports = Hook
// expose constructors as a named property for TypeScript
module.exports.Hook = Hook
module.exports.Singular = Hook.Singular
module.exports.Collection = Hook.Collection


/***/ }),
/* 524 */,
/* 525 */,
/* 526 */,
/* 527 */,
/* 528 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlUseSsl = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be8254534898/include/curl/curl.h#L801
/**
 * Object with constants for option `USE_SSL`
 *
 * `CURLUSESSL_NONE` becomes `CurlUseSsl.None`
 *
 * @public
 */
var CurlUseSsl;
(function (CurlUseSsl) {
    CurlUseSsl[CurlUseSsl["None"] = 0] = "None";
    CurlUseSsl[CurlUseSsl["Try"] = 1] = "Try";
    CurlUseSsl[CurlUseSsl["Control"] = 2] = "Control";
    CurlUseSsl[CurlUseSsl["All"] = 3] = "All";
})(CurlUseSsl = exports.CurlUseSsl || (exports.CurlUseSsl = {}));
//# sourceMappingURL=CurlUseSsl.js.map

/***/ }),
/* 529 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);
var normalizeHeaderName = __webpack_require__(411);

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(219);
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(670);
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),
/* 530 */,
/* 531 */,
/* 532 */,
/* 533 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// This file was generated by scripts/build-constants.js on 2020-06-25T00:21:36.738Z
// Do not edit manually
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlOptionCamelCaseMap = void 0;
exports.CurlOptionCamelCaseMap = {
    /**
     * Path to an abstract Unix domain socket.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_ABSTRACT_UNIX_SOCKET.html](https://curl.haxx.se/libcurl/c/CURLOPT_ABSTRACT_UNIX_SOCKET.html)
     */
    abstractUnixSocket: 'ABSTRACT_UNIX_SOCKET',
    /**
     * Accept-Encoding and automatic decompressing data.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_ACCEPT_ENCODING.html](https://curl.haxx.se/libcurl/c/CURLOPT_ACCEPT_ENCODING.html)
     */
    acceptEncoding: 'ACCEPT_ENCODING',
    /**
     * Timeout for waiting for the server's connect back to be accepted.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_ACCEPTTIMEOUT_MS.html](https://curl.haxx.se/libcurl/c/CURLOPT_ACCEPTTIMEOUT_MS.html)
     */
    acceptTimeoutMs: 'ACCEPTTIMEOUT_MS',
    /**
     * IPv6 scope for local addresses.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_ADDRESS_SCOPE.html](https://curl.haxx.se/libcurl/c/CURLOPT_ADDRESS_SCOPE.html)
     */
    addressScope: 'ADDRESS_SCOPE',
    /**
     * Specify the Alt-Svc: cache file name.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_ALTSVC.html](https://curl.haxx.se/libcurl/c/CURLOPT_ALTSVC.html)
     */
    altSvc: 'ALTSVC',
    /**
     * Enable and configure Alt-Svc: treatment.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_ALTSVC_CTRL.html](https://curl.haxx.se/libcurl/c/CURLOPT_ALTSVC_CTRL.html)
     */
    altSvcCtrl: 'ALTSVC_CTRL',
    /**
     * Append to remote file.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_APPEND.html](https://curl.haxx.se/libcurl/c/CURLOPT_APPEND.html)
     */
    append: 'APPEND',
    /**
     * Automatically set Referer: header.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_AUTOREFERER.html](https://curl.haxx.se/libcurl/c/CURLOPT_AUTOREFERER.html)
     */
    autoReferer: 'AUTOREFERER',
    /**
     * Ask for alternate buffer size.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_BUFFERSIZE.html](https://curl.haxx.se/libcurl/c/CURLOPT_BUFFERSIZE.html)
     */
    bufferSize: 'BUFFERSIZE',
    /**
     * CA cert bundle.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_CAINFO.html](https://curl.haxx.se/libcurl/c/CURLOPT_CAINFO.html)
     */
    caInfo: 'CAINFO',
    /**
     * Path to CA cert bundle.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_CAPATH.html](https://curl.haxx.se/libcurl/c/CURLOPT_CAPATH.html)
     */
    caPath: 'CAPATH',
    /**
     * Extract certificate info.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_CERTINFO.html](https://curl.haxx.se/libcurl/c/CURLOPT_CERTINFO.html)
     */
    certInfo: 'CERTINFO',
    /**
     * Callback for wildcard download start of chunk.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_CHUNK_BGN_FUNCTION.html](https://curl.haxx.se/libcurl/c/CURLOPT_CHUNK_BGN_FUNCTION.html)
     */
    chunkBgnFunction: 'CHUNK_BGN_FUNCTION',
    /**
     * Callback for wildcard download end of chunk.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_CHUNK_END_FUNCTION.html](https://curl.haxx.se/libcurl/c/CURLOPT_CHUNK_END_FUNCTION.html)
     */
    chunkEndFunction: 'CHUNK_END_FUNCTION',
    /**
     * Only connect, nothing else.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_CONNECT_ONLY.html](https://curl.haxx.se/libcurl/c/CURLOPT_CONNECT_ONLY.html)
     */
    connectOnly: 'CONNECT_ONLY',
    /**
     * Connect to a specific host and port.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_CONNECT_TO.html](https://curl.haxx.se/libcurl/c/CURLOPT_CONNECT_TO.html)
     */
    connectTo: 'CONNECT_TO',
    /**
     * Timeout for the connection phase.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_CONNECTTIMEOUT.html](https://curl.haxx.se/libcurl/c/CURLOPT_CONNECTTIMEOUT.html)
     */
    connectTimeout: 'CONNECTTIMEOUT',
    /**
     * Millisecond timeout for the connection phase.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_CONNECTTIMEOUT_MS.html](https://curl.haxx.se/libcurl/c/CURLOPT_CONNECTTIMEOUT_MS.html)
     */
    connectTimeoutMs: 'CONNECTTIMEOUT_MS',
    /**
     * Cookie(s) to send.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_COOKIE.html](https://curl.haxx.se/libcurl/c/CURLOPT_COOKIE.html)
     */
    cookie: 'COOKIE',
    /**
     * File to read cookies from.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_COOKIEFILE.html](https://curl.haxx.se/libcurl/c/CURLOPT_COOKIEFILE.html)
     */
    cookieFile: 'COOKIEFILE',
    /**
     * File to write cookies to.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_COOKIEJAR.html](https://curl.haxx.se/libcurl/c/CURLOPT_COOKIEJAR.html)
     */
    cookieJar: 'COOKIEJAR',
    /**
     * Add or control cookies.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_COOKIELIST.html](https://curl.haxx.se/libcurl/c/CURLOPT_COOKIELIST.html)
     */
    cookieList: 'COOKIELIST',
    /**
     * Start a new cookie session.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_COOKIESESSION.html](https://curl.haxx.se/libcurl/c/CURLOPT_COOKIESESSION.html)
     */
    cookieSession: 'COOKIESESSION',
    /**
     * Convert newlines.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_CRLF.html](https://curl.haxx.se/libcurl/c/CURLOPT_CRLF.html)
     */
    crlf: 'CRLF',
    /**
     * Certificate Revocation List.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_CRLFILE.html](https://curl.haxx.se/libcurl/c/CURLOPT_CRLFILE.html)
     */
    crlFile: 'CRLFILE',
    /**
     * Custom request/method.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_CUSTOMREQUEST.html](https://curl.haxx.se/libcurl/c/CURLOPT_CUSTOMREQUEST.html)
     */
    customRequest: 'CUSTOMREQUEST',
    /**
     * Callback for debug information.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_DEBUGFUNCTION.html](https://curl.haxx.se/libcurl/c/CURLOPT_DEBUGFUNCTION.html)
     */
    debugFunction: 'DEBUGFUNCTION',
    /**
     * Default protocol.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_DEFAULT_PROTOCOL.html](https://curl.haxx.se/libcurl/c/CURLOPT_DEFAULT_PROTOCOL.html)
     */
    defaultProtocol: 'DEFAULT_PROTOCOL',
    /**
     * List only.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_DIRLISTONLY.html](https://curl.haxx.se/libcurl/c/CURLOPT_DIRLISTONLY.html)
     */
    dirListOnly: 'DIRLISTONLY',
    /**
     * Don't allow username in URL.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_DISALLOW_USERNAME_IN_URL.html](https://curl.haxx.se/libcurl/c/CURLOPT_DISALLOW_USERNAME_IN_URL.html)
     */
    disallowUsernameInUrl: 'DISALLOW_USERNAME_IN_URL',
    /**
     * Timeout for DNS cache.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_DNS_CACHE_TIMEOUT.html](https://curl.haxx.se/libcurl/c/CURLOPT_DNS_CACHE_TIMEOUT.html)
     */
    dnsCacheTimeout: 'DNS_CACHE_TIMEOUT',
    /**
     * Bind name resolves to this interface.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_DNS_INTERFACE.html](https://curl.haxx.se/libcurl/c/CURLOPT_DNS_INTERFACE.html)
     */
    dnsInterface: 'DNS_INTERFACE',
    /**
     * Bind name resolves to this IP4 address.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_DNS_LOCAL_IP4.html](https://curl.haxx.se/libcurl/c/CURLOPT_DNS_LOCAL_IP4.html)
     */
    dnsLocalIp4: 'DNS_LOCAL_IP4',
    /**
     * Bind name resolves to this IP6 address.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_DNS_LOCAL_IP6.html](https://curl.haxx.se/libcurl/c/CURLOPT_DNS_LOCAL_IP6.html)
     */
    dnsLocalIp6: 'DNS_LOCAL_IP6',
    /**
     * Preferred DNS servers.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_DNS_SERVERS.html](https://curl.haxx.se/libcurl/c/CURLOPT_DNS_SERVERS.html)
     */
    dnsServers: 'DNS_SERVERS',
    /**
     * Shuffle addresses before use.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_DNS_SHUFFLE_ADDRESSES.html](https://curl.haxx.se/libcurl/c/CURLOPT_DNS_SHUFFLE_ADDRESSES.html)
     */
    dnsShuffleAddresses: 'DNS_SHUFFLE_ADDRESSES',
    /**
     * OBSOLETE Enable global DNS cache.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_DNS_USE_GLOBAL_CACHE.html](https://curl.haxx.se/libcurl/c/CURLOPT_DNS_USE_GLOBAL_CACHE.html)
     */
    dnsUseGlobalCache: 'DNS_USE_GLOBAL_CACHE',
    /**
     * Use this DOH server for name resolves.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_DOH_URL.html](https://curl.haxx.se/libcurl/c/CURLOPT_DOH_URL.html)
     */
    dohUrl: 'DOH_URL',
    /**
     * Identify EGD socket for entropy.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_EGDSOCKET.html](https://curl.haxx.se/libcurl/c/CURLOPT_EGDSOCKET.html)
     */
    egdSocket: 'EGDSOCKET',
    /**
     * 100-continue timeout.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_EXPECT_100_TIMEOUT_MS.html](https://curl.haxx.se/libcurl/c/CURLOPT_EXPECT_100_TIMEOUT_MS.html)
     */
    expect100TimeoutMs: 'EXPECT_100_TIMEOUT_MS',
    /**
     * Fail on HTTP 4xx errors.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FAILONERROR.html](https://curl.haxx.se/libcurl/c/CURLOPT_FAILONERROR.html)
     */
    failOnError: 'FAILONERROR',
    /**
     * Request file modification date and time.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FILETIME.html](https://curl.haxx.se/libcurl/c/CURLOPT_FILETIME.html)
     */
    fileTime: 'FILETIME',
    /**
     * Callback for wildcard matching.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FNMATCH_FUNCTION.html](https://curl.haxx.se/libcurl/c/CURLOPT_FNMATCH_FUNCTION.html)
     */
    fnMatchFunction: 'FNMATCH_FUNCTION',
    /**
     * Follow HTTP redirects.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FOLLOWLOCATION.html](https://curl.haxx.se/libcurl/c/CURLOPT_FOLLOWLOCATION.html)
     */
    followLocation: 'FOLLOWLOCATION',
    /**
     * Prevent subsequent connections from re-using this.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FORBID_REUSE.html](https://curl.haxx.se/libcurl/c/CURLOPT_FORBID_REUSE.html)
     */
    forbIdReuse: 'FORBID_REUSE',
    /**
     * Use a new connection.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FRESH_CONNECT.html](https://curl.haxx.se/libcurl/c/CURLOPT_FRESH_CONNECT.html)
     */
    freshConnect: 'FRESH_CONNECT',
    /**
     * Send ACCT command.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FTP_ACCOUNT.html](https://curl.haxx.se/libcurl/c/CURLOPT_FTP_ACCOUNT.html)
     */
    ftpAccount: 'FTP_ACCOUNT',
    /**
     * Alternative to USER.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FTP_ALTERNATIVE_TO_USER.html](https://curl.haxx.se/libcurl/c/CURLOPT_FTP_ALTERNATIVE_TO_USER.html)
     */
    ftpAlternativeToUser: 'FTP_ALTERNATIVE_TO_USER',
    /**
     * Create missing directories on the remote server.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FTP_CREATE_MISSING_DIRS.html](https://curl.haxx.se/libcurl/c/CURLOPT_FTP_CREATE_MISSING_DIRS.html)
     */
    ftpCreateMissingDirs: 'FTP_CREATE_MISSING_DIRS',
    /**
     * Specify how to reach files.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FTP_FILEMETHOD.html](https://curl.haxx.se/libcurl/c/CURLOPT_FTP_FILEMETHOD.html)
     */
    ftpFileMethod: 'FTP_FILEMETHOD',
    /**
     * Timeout for FTP responses.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FTP_RESPONSE_TIMEOUT.html](https://curl.haxx.se/libcurl/c/CURLOPT_FTP_RESPONSE_TIMEOUT.html)
     */
    ftpResponseTimeout: 'FTP_RESPONSE_TIMEOUT',
    /**
     * Ignore the IP address in the PASV response.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FTP_SKIP_PASV_IP.html](https://curl.haxx.se/libcurl/c/CURLOPT_FTP_SKIP_PASV_IP.html)
     */
    ftpSkipPasvIp: 'FTP_SKIP_PASV_IP',
    /**
     * Back to non-TLS again after authentication.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FTP_SSL_CCC.html](https://curl.haxx.se/libcurl/c/CURLOPT_FTP_SSL_CCC.html)
     */
    ftpSslCcc: 'FTP_SSL_CCC',
    /**
     * Use EPTR.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FTP_USE_EPRT.html](https://curl.haxx.se/libcurl/c/CURLOPT_FTP_USE_EPRT.html)
     */
    ftpUseEprt: 'FTP_USE_EPRT',
    /**
     * Use EPSV.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FTP_USE_EPSV.html](https://curl.haxx.se/libcurl/c/CURLOPT_FTP_USE_EPSV.html)
     */
    ftpUseEpsv: 'FTP_USE_EPSV',
    /**
     * Use PRET.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FTP_USE_PRET.html](https://curl.haxx.se/libcurl/c/CURLOPT_FTP_USE_PRET.html)
     */
    ftpUsePret: 'FTP_USE_PRET',
    /**
     * Use active FTP.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FTPPORT.html](https://curl.haxx.se/libcurl/c/CURLOPT_FTPPORT.html)
     */
    ftpPort: 'FTPPORT',
    /**
     * Control how to do TLS.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_FTPSSLAUTH.html](https://curl.haxx.se/libcurl/c/CURLOPT_FTPSSLAUTH.html)
     */
    ftpSslAuth: 'FTPSSLAUTH',
    /**
     * Disable GSS-API delegation.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_GSSAPI_DELEGATION.html](https://curl.haxx.se/libcurl/c/CURLOPT_GSSAPI_DELEGATION.html)
     */
    gssapiDelegation: 'GSSAPI_DELEGATION',
    /**
     * Timeout for happy eyeballs.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HAPPY_EYEBALLS_TIMEOUT_MS.html](https://curl.haxx.se/libcurl/c/CURLOPT_HAPPY_EYEBALLS_TIMEOUT_MS.html)
     */
    happyEyeballsTimeoutMs: 'HAPPY_EYEBALLS_TIMEOUT_MS',
    /**
     * Send an HAProxy PROXY protocol v1 header.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HAPROXYPROTOCOL.html](https://curl.haxx.se/libcurl/c/CURLOPT_HAPROXYPROTOCOL.html)
     */
    haProxyProtocol: 'HAPROXYPROTOCOL',
    /**
     * Include the header in the body output.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HEADER.html](https://curl.haxx.se/libcurl/c/CURLOPT_HEADER.html)
     */
    header: 'HEADER',
    /**
     * Callback for writing received headers.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HEADERFUNCTION.html](https://curl.haxx.se/libcurl/c/CURLOPT_HEADERFUNCTION.html)
     */
    headerFunction: 'HEADERFUNCTION',
    /**
     * Control custom headers.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HEADEROPT.html](https://curl.haxx.se/libcurl/c/CURLOPT_HEADEROPT.html)
     */
    headerOpt: 'HEADEROPT',
    /**
     * Disable Content decoding.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HTTP_CONTENT_DECODING.html](https://curl.haxx.se/libcurl/c/CURLOPT_HTTP_CONTENT_DECODING.html)
     */
    httpContentDecoding: 'HTTP_CONTENT_DECODING',
    /**
     * Disable Transfer decoding.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HTTP_TRANSFER_DECODING.html](https://curl.haxx.se/libcurl/c/CURLOPT_HTTP_TRANSFER_DECODING.html)
     */
    httpTransferDecoding: 'HTTP_TRANSFER_DECODING',
    /**
     * HTTP version to use.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HTTP_VERSION.html](https://curl.haxx.se/libcurl/c/CURLOPT_HTTP_VERSION.html)
     */
    httpVersion: 'HTTP_VERSION',
    /**
     * Allow HTTP/0.9 responses.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HTTP09_ALLOWED.html](https://curl.haxx.se/libcurl/c/CURLOPT_HTTP09_ALLOWED.html)
     */
    http09Allowed: 'HTTP09_ALLOWED',
    /**
     * Alternative versions of 200 OK.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HTTP200ALIASES.html](https://curl.haxx.se/libcurl/c/CURLOPT_HTTP200ALIASES.html)
     */
    http200aliases: 'HTTP200ALIASES',
    /**
     * HTTP server authentication methods.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HTTPAUTH.html](https://curl.haxx.se/libcurl/c/CURLOPT_HTTPAUTH.html)
     */
    httpAuth: 'HTTPAUTH',
    /**
     * Do an HTTP GET request.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HTTPGET.html](https://curl.haxx.se/libcurl/c/CURLOPT_HTTPGET.html)
     */
    httpGet: 'HTTPGET',
    /**
     * Custom HTTP headers.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HTTPHEADER.html](https://curl.haxx.se/libcurl/c/CURLOPT_HTTPHEADER.html)
     */
    httpHeader: 'HTTPHEADER',
    /**
     * Multipart formpost HTTP POST.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HTTPPOST.html](https://curl.haxx.se/libcurl/c/CURLOPT_HTTPPOST.html)
     */
    httpPost: 'HTTPPOST',
    /**
     * Tunnel through the HTTP proxy.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_HTTPPROXYTUNNEL.html](https://curl.haxx.se/libcurl/c/CURLOPT_HTTPPROXYTUNNEL.html)
     */
    httpProxyTunnel: 'HTTPPROXYTUNNEL',
    /**
     * Ignore Content-Length.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_IGNORE_CONTENT_LENGTH.html](https://curl.haxx.se/libcurl/c/CURLOPT_IGNORE_CONTENT_LENGTH.html)
     */
    ignoreContentLength: 'IGNORE_CONTENT_LENGTH',
    /**
     * Size of file to send.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_INFILESIZE.html](https://curl.haxx.se/libcurl/c/CURLOPT_INFILESIZE.html)
     */
    inFileSize: 'INFILESIZE',
    /**
     * Size of file to send.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_INFILESIZE_LARGE.html](https://curl.haxx.se/libcurl/c/CURLOPT_INFILESIZE_LARGE.html)
     */
    inFileSizeLarge: 'INFILESIZE_LARGE',
    /**
     * Bind connection locally to this.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_INTERFACE.html](https://curl.haxx.se/libcurl/c/CURLOPT_INTERFACE.html)
     */
    interface: 'INTERFACE',
    /**
     * IP version to resolve to.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_IPRESOLVE.html](https://curl.haxx.se/libcurl/c/CURLOPT_IPRESOLVE.html)
     */
    ipResolve: 'IPRESOLVE',
    /**
     * Issuer certificate.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_ISSUERCERT.html](https://curl.haxx.se/libcurl/c/CURLOPT_ISSUERCERT.html)
     */
    issuerCert: 'ISSUERCERT',
    /**
     * Issuer certificate memory buffer.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_ISSUERCERT_BLOB.html](https://curl.haxx.se/libcurl/c/CURLOPT_ISSUERCERT_BLOB.html)
     */
    issuerCertBlob: 'ISSUERCERT_BLOB',
    /**
     * Keep sending on HTTP \>= 300 errors.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_KEEP_SENDING_ON_ERROR.html](https://curl.haxx.se/libcurl/c/CURLOPT_KEEP_SENDING_ON_ERROR.html)
     */
    keepSendingOnError: 'KEEP_SENDING_ON_ERROR',
    /**
     * Client key password.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_KEYPASSWD.html](https://curl.haxx.se/libcurl/c/CURLOPT_KEYPASSWD.html)
     */
    keyPasswd: 'KEYPASSWD',
    /**
     * Kerberos security level.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_KRBLEVEL.html](https://curl.haxx.se/libcurl/c/CURLOPT_KRBLEVEL.html)
     */
    krbLevel: 'KRBLEVEL',
    /**
     * Bind connection locally to this port.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_LOCALPORT.html](https://curl.haxx.se/libcurl/c/CURLOPT_LOCALPORT.html)
     */
    localPort: 'LOCALPORT',
    /**
     * Bind connection locally to port range.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_LOCALPORTRANGE.html](https://curl.haxx.se/libcurl/c/CURLOPT_LOCALPORTRANGE.html)
     */
    localPortRange: 'LOCALPORTRANGE',
    /**
     * Login options.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_LOGIN_OPTIONS.html](https://curl.haxx.se/libcurl/c/CURLOPT_LOGIN_OPTIONS.html)
     */
    loginOptions: 'LOGIN_OPTIONS',
    /**
     * Low speed limit to abort transfer.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_LOW_SPEED_LIMIT.html](https://curl.haxx.se/libcurl/c/CURLOPT_LOW_SPEED_LIMIT.html)
     */
    lowSpeedLimit: 'LOW_SPEED_LIMIT',
    /**
     * Time to be below the speed to trigger low speed abort.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_LOW_SPEED_TIME.html](https://curl.haxx.se/libcurl/c/CURLOPT_LOW_SPEED_TIME.html)
     */
    lowSpeedTime: 'LOW_SPEED_TIME',
    /**
     * Authentication address.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_MAIL_AUTH.html](https://curl.haxx.se/libcurl/c/CURLOPT_MAIL_AUTH.html)
     */
    mailAuth: 'MAIL_AUTH',
    /**
     * Address of the sender.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_MAIL_FROM.html](https://curl.haxx.se/libcurl/c/CURLOPT_MAIL_FROM.html)
     */
    mailFrom: 'MAIL_FROM',
    /**
     * Address of the recipients.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_MAIL_RCPT.html](https://curl.haxx.se/libcurl/c/CURLOPT_MAIL_RCPT.html)
     */
    mailRcpt: 'MAIL_RCPT',
    /**
     * Allow RCPT TO command to fail for some recipients.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_MAIL_RCPT_ALLLOWFAILS.html](https://curl.haxx.se/libcurl/c/CURLOPT_MAIL_RCPT_ALLLOWFAILS.html)
     */
    mailRcptAlllowfails: 'MAIL_RCPT_ALLLOWFAILS',
    /**
     * Cap the download speed to this.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_MAX_RECV_SPEED_LARGE.html](https://curl.haxx.se/libcurl/c/CURLOPT_MAX_RECV_SPEED_LARGE.html)
     */
    maxRecvSpeedLarge: 'MAX_RECV_SPEED_LARGE',
    /**
     * Cap the upload speed to this.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_MAX_SEND_SPEED_LARGE.html](https://curl.haxx.se/libcurl/c/CURLOPT_MAX_SEND_SPEED_LARGE.html)
     */
    maxSendSpeedLarge: 'MAX_SEND_SPEED_LARGE',
    /**
     * Limit the age of connections for reuse.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_MAXAGE_CONN.html](https://curl.haxx.se/libcurl/c/CURLOPT_MAXAGE_CONN.html)
     */
    maxAgeConn: 'MAXAGE_CONN',
    /**
     * Maximum number of connections in the connection pool.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_MAXCONNECTS.html](https://curl.haxx.se/libcurl/c/CURLOPT_MAXCONNECTS.html)
     */
    maxConnects: 'MAXCONNECTS',
    /**
     * Maximum file size to get.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_MAXFILESIZE.html](https://curl.haxx.se/libcurl/c/CURLOPT_MAXFILESIZE.html)
     */
    maxFileSize: 'MAXFILESIZE',
    /**
     * Maximum file size to get.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_MAXFILESIZE_LARGE.html](https://curl.haxx.se/libcurl/c/CURLOPT_MAXFILESIZE_LARGE.html)
     */
    maxFileSizeLarge: 'MAXFILESIZE_LARGE',
    /**
     * Maximum number of redirects to follow.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_MAXREDIRS.html](https://curl.haxx.se/libcurl/c/CURLOPT_MAXREDIRS.html)
     */
    maxRedirs: 'MAXREDIRS',
    /**
     * Post/send MIME data.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_MIMEPOST.html](https://curl.haxx.se/libcurl/c/CURLOPT_MIMEPOST.html)
     */
    mimePost: 'MIMEPOST',
    /**
     * Enable .netrc parsing.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_NETRC.html](https://curl.haxx.se/libcurl/c/CURLOPT_NETRC.html)
     */
    netrc: 'NETRC',
    /**
     * .netrc file name.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_NETRC_FILE.html](https://curl.haxx.se/libcurl/c/CURLOPT_NETRC_FILE.html)
     */
    netrcFile: 'NETRC_FILE',
    /**
     * Mode for creating new remote directories.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_NEW_DIRECTORY_PERMS.html](https://curl.haxx.se/libcurl/c/CURLOPT_NEW_DIRECTORY_PERMS.html)
     */
    newDirectoryPerms: 'NEW_DIRECTORY_PERMS',
    /**
     * Mode for creating new remote files.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_NEW_FILE_PERMS.html](https://curl.haxx.se/libcurl/c/CURLOPT_NEW_FILE_PERMS.html)
     */
    newFilePerms: 'NEW_FILE_PERMS',
    /**
     * Do not get the body contents.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_NOBODY.html](https://curl.haxx.se/libcurl/c/CURLOPT_NOBODY.html)
     */
    nobody: 'NOBODY',
    /**
     * Shut off the progress meter.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_NOPROGRESS.html](https://curl.haxx.se/libcurl/c/CURLOPT_NOPROGRESS.html)
     */
    noProgress: 'NOPROGRESS',
    /**
     * Filter out hosts from proxy use.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_NOPROXY.html](https://curl.haxx.se/libcurl/c/CURLOPT_NOPROXY.html)
     */
    noProxy: 'NOPROXY',
    /**
     * Do not install signal handlers.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_NOSIGNAL.html](https://curl.haxx.se/libcurl/c/CURLOPT_NOSIGNAL.html)
     */
    noSignal: 'NOSIGNAL',
    /**
     * Password.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PASSWORD.html](https://curl.haxx.se/libcurl/c/CURLOPT_PASSWORD.html)
     */
    password: 'PASSWORD',
    /**
     * Disable squashing /../ and /./ sequences in the path.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PATH_AS_IS.html](https://curl.haxx.se/libcurl/c/CURLOPT_PATH_AS_IS.html)
     */
    pathAsIs: 'PATH_AS_IS',
    /**
     * Set pinned SSL public key .
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PINNEDPUBLICKEY.html](https://curl.haxx.se/libcurl/c/CURLOPT_PINNEDPUBLICKEY.html)
     */
    pinnedPublicKey: 'PINNEDPUBLICKEY',
    /**
     * Wait on connection to pipeline on it.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PIPEWAIT.html](https://curl.haxx.se/libcurl/c/CURLOPT_PIPEWAIT.html)
     */
    pipeWait: 'PIPEWAIT',
    /**
     * Port number to connect to.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PORT.html](https://curl.haxx.se/libcurl/c/CURLOPT_PORT.html)
     */
    port: 'PORT',
    /**
     * Issue an HTTP POST request.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_POST.html](https://curl.haxx.se/libcurl/c/CURLOPT_POST.html)
     */
    post: 'POST',
    /**
     * Send a POST with this data.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_POSTFIELDS.html](https://curl.haxx.se/libcurl/c/CURLOPT_POSTFIELDS.html)
     */
    postFields: 'POSTFIELDS',
    /**
     * The POST data is this big.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_POSTFIELDSIZE.html](https://curl.haxx.se/libcurl/c/CURLOPT_POSTFIELDSIZE.html)
     */
    postFieldSize: 'POSTFIELDSIZE',
    /**
     * The POST data is this big.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_POSTFIELDSIZE_LARGE.html](https://curl.haxx.se/libcurl/c/CURLOPT_POSTFIELDSIZE_LARGE.html)
     */
    postFieldSizeLarge: 'POSTFIELDSIZE_LARGE',
    /**
     * Commands to run after transfer.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_POSTQUOTE.html](https://curl.haxx.se/libcurl/c/CURLOPT_POSTQUOTE.html)
     */
    postQuote: 'POSTQUOTE',
    /**
     * How to act on redirects after POST.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_POSTREDIR.html](https://curl.haxx.se/libcurl/c/CURLOPT_POSTREDIR.html)
     */
    postRedir: 'POSTREDIR',
    /**
     * Socks proxy to use.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PRE_PROXY.html](https://curl.haxx.se/libcurl/c/CURLOPT_PRE_PROXY.html)
     */
    preProxy: 'PRE_PROXY',
    /**
     * Commands to run just before transfer.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PREQUOTE.html](https://curl.haxx.se/libcurl/c/CURLOPT_PREQUOTE.html)
     */
    preQuote: 'PREQUOTE',
    /**
     * OBSOLETE callback for progress meter.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROGRESSFUNCTION.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROGRESSFUNCTION.html)
     */
    progressFunction: 'PROGRESSFUNCTION',
    /**
     * Allowed protocols.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROTOCOLS.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROTOCOLS.html)
     */
    protocols: 'PROTOCOLS',
    /**
     * Proxy to use.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY.html)
     */
    proxy: 'PROXY',
    /**
     * Proxy CA cert bundle.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_CAINFO.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_CAINFO.html)
     */
    proxyCaInfo: 'PROXY_CAINFO',
    /**
     * Path to proxy CA cert bundle.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_CAPATH.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_CAPATH.html)
     */
    proxyCaPath: 'PROXY_CAPATH',
    /**
     * Proxy Certificate Revocation List.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_CRLFILE.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_CRLFILE.html)
     */
    proxyCrlFile: 'PROXY_CRLFILE',
    /**
     * Proxy issuer certificate.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_ISSUERCERT.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_ISSUERCERT.html)
     */
    proxyIssuerCert: 'PROXY_ISSUERCERT',
    /**
     * Proxy issuer certificate memory buffer.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_ISSUERCERT_BLOB.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_ISSUERCERT_BLOB.html)
     */
    proxyIssuerCertBlob: 'PROXY_ISSUERCERT_BLOB',
    /**
     * Proxy client key password.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_KEYPASSWD.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_KEYPASSWD.html)
     */
    proxyKeyPasswd: 'PROXY_KEYPASSWD',
    /**
     * Set the proxy's pinned SSL public key.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_PINNEDPUBLICKEY.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_PINNEDPUBLICKEY.html)
     */
    proxyPinnedPublicKey: 'PROXY_PINNEDPUBLICKEY',
    /**
     * Proxy authentication service name.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SERVICE_NAME.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SERVICE_NAME.html)
     */
    proxyServiceName: 'PROXY_SERVICE_NAME',
    /**
     * Proxy ciphers to use.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSL_CIPHER_LIST.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSL_CIPHER_LIST.html)
     */
    proxySslCipherList: 'PROXY_SSL_CIPHER_LIST',
    /**
     * Control proxy SSL behavior.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSL_OPTIONS.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSL_OPTIONS.html)
     */
    proxySslOptions: 'PROXY_SSL_OPTIONS',
    /**
     * Verify the host name in the proxy SSL certificate.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSL_VERIFYHOST.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSL_VERIFYHOST.html)
     */
    proxySslVerifyHost: 'PROXY_SSL_VERIFYHOST',
    /**
     * Verify the proxy SSL certificate.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSL_VERIFYPEER.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSL_VERIFYPEER.html)
     */
    proxySslVerifyPeer: 'PROXY_SSL_VERIFYPEER',
    /**
     * Proxy client cert.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLCERT.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLCERT.html)
     */
    proxySslCert: 'PROXY_SSLCERT',
    /**
     * Proxy client cert memory buffer.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLCERT_BLOB.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLCERT_BLOB.html)
     */
    proxySslCertBlob: 'PROXY_SSLCERT_BLOB',
    /**
     * Proxy client cert type.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLCERTTYPE.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLCERTTYPE.html)
     */
    proxySslCertType: 'PROXY_SSLCERTTYPE',
    /**
     * Proxy client key.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLKEY.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLKEY.html)
     */
    proxySslKey: 'PROXY_SSLKEY',
    /**
     * Proxy client key.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLKEY_BLOB.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLKEY_BLOB.html)
     */
    proxySslKeyBlob: 'PROXY_SSLKEY_BLOB',
    /**
     * Proxy client key type.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLKEYTYPE.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLKEYTYPE.html)
     */
    proxySslKeyType: 'PROXY_SSLKEYTYPE',
    /**
     * Proxy SSL version to use.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLVERSION.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_SSLVERSION.html)
     */
    proxySslversion: 'PROXY_SSLVERSION',
    /**
     * Proxy TLS 1.3 cipher suites to use.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_TLS13_CIPHERS.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_TLS13_CIPHERS.html)
     */
    proxyTls13Ciphers: 'PROXY_TLS13_CIPHERS',
    /**
     * Proxy TLS authentication password.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_TLSAUTH_PASSWORD.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_TLSAUTH_PASSWORD.html)
     */
    proxyTlsAuthPassword: 'PROXY_TLSAUTH_PASSWORD',
    /**
     * Proxy TLS authentication methods.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_TLSAUTH_TYPE.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_TLSAUTH_TYPE.html)
     */
    proxyTlsAuthType: 'PROXY_TLSAUTH_TYPE',
    /**
     * Proxy TLS authentication user name.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_TLSAUTH_USERNAME.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_TLSAUTH_USERNAME.html)
     */
    proxyTlsAuthUsername: 'PROXY_TLSAUTH_USERNAME',
    /**
     * Add transfer mode to URL over proxy.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_TRANSFER_MODE.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXY_TRANSFER_MODE.html)
     */
    proxyTransferMode: 'PROXY_TRANSFER_MODE',
    /**
     * HTTP proxy authentication methods.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXYAUTH.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXYAUTH.html)
     */
    proxyAuth: 'PROXYAUTH',
    /**
     * Custom HTTP headers sent to proxy.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXYHEADER.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXYHEADER.html)
     */
    proxyHeader: 'PROXYHEADER',
    /**
     * Proxy password.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXYPASSWORD.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXYPASSWORD.html)
     */
    proxyPassword: 'PROXYPASSWORD',
    /**
     * Proxy port to use.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXYPORT.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXYPORT.html)
     */
    proxyPort: 'PROXYPORT',
    /**
     * Proxy type.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXYTYPE.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXYTYPE.html)
     */
    proxyType: 'PROXYTYPE',
    /**
     * Proxy user name.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXYUSERNAME.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXYUSERNAME.html)
     */
    proxyUsername: 'PROXYUSERNAME',
    /**
     * Proxy user name and password.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PROXYUSERPWD.html](https://curl.haxx.se/libcurl/c/CURLOPT_PROXYUSERPWD.html)
     */
    proxyUserpwd: 'PROXYUSERPWD',
    /**
     * Issue an HTTP PUT request.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_PUT.html](https://curl.haxx.se/libcurl/c/CURLOPT_PUT.html)
     */
    put: 'PUT',
    /**
     * Commands to run before transfer.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_QUOTE.html](https://curl.haxx.se/libcurl/c/CURLOPT_QUOTE.html)
     */
    quote: 'QUOTE',
    /**
     * Provide source for entropy random data.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_RANDOM_FILE.html](https://curl.haxx.se/libcurl/c/CURLOPT_RANDOM_FILE.html)
     */
    randomFile: 'RANDOM_FILE',
    /**
     * Range requests.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_RANGE.html](https://curl.haxx.se/libcurl/c/CURLOPT_RANGE.html)
     */
    range: 'RANGE',
    /**
     * Data pointer to pass to the read callback.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_READDATA.html](https://curl.haxx.se/libcurl/c/CURLOPT_READDATA.html)
     */
    readData: 'READDATA',
    /**
     * Callback for reading data.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_READFUNCTION.html](https://curl.haxx.se/libcurl/c/CURLOPT_READFUNCTION.html)
     */
    readFunction: 'READFUNCTION',
    /**
     * Protocols to allow redirects to.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_REDIR_PROTOCOLS.html](https://curl.haxx.se/libcurl/c/CURLOPT_REDIR_PROTOCOLS.html)
     */
    redirProtocols: 'REDIR_PROTOCOLS',
    /**
     * Referer: header.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_REFERER.html](https://curl.haxx.se/libcurl/c/CURLOPT_REFERER.html)
     */
    referer: 'REFERER',
    /**
     * Set the request target.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_REQUEST_TARGET.html](https://curl.haxx.se/libcurl/c/CURLOPT_REQUEST_TARGET.html)
     */
    requestTarget: 'REQUEST_TARGET',
    /**
     * Provide fixed/fake name resolves.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_RESOLVE.html](https://curl.haxx.se/libcurl/c/CURLOPT_RESOLVE.html)
     */
    resolve: 'RESOLVE',
    /**
     * Resume a transfer.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_RESUME_FROM.html](https://curl.haxx.se/libcurl/c/CURLOPT_RESUME_FROM.html)
     */
    resumeFrom: 'RESUME_FROM',
    /**
     * Resume a transfer.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_RESUME_FROM_LARGE.html](https://curl.haxx.se/libcurl/c/CURLOPT_RESUME_FROM_LARGE.html)
     */
    resumeFromLarge: 'RESUME_FROM_LARGE',
    /**
     * Client CSEQ number.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_RTSP_CLIENT_CSEQ.html](https://curl.haxx.se/libcurl/c/CURLOPT_RTSP_CLIENT_CSEQ.html)
     */
    rtspClientCseq: 'RTSP_CLIENT_CSEQ',
    /**
     * RTSP request.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_RTSP_REQUEST.html](https://curl.haxx.se/libcurl/c/CURLOPT_RTSP_REQUEST.html)
     */
    rtspRequest: 'RTSP_REQUEST',
    /**
     * CSEQ number for RTSP Server-\>Client request.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_RTSP_SERVER_CSEQ.html](https://curl.haxx.se/libcurl/c/CURLOPT_RTSP_SERVER_CSEQ.html)
     */
    rtspServerCseq: 'RTSP_SERVER_CSEQ',
    /**
     * RTSP session-id.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_RTSP_SESSION_ID.html](https://curl.haxx.se/libcurl/c/CURLOPT_RTSP_SESSION_ID.html)
     */
    rtspSessionId: 'RTSP_SESSION_ID',
    /**
     * RTSP stream URI.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_RTSP_STREAM_URI.html](https://curl.haxx.se/libcurl/c/CURLOPT_RTSP_STREAM_URI.html)
     */
    rtspStreamUri: 'RTSP_STREAM_URI',
    /**
     * RTSP Transport: header.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_RTSP_TRANSPORT.html](https://curl.haxx.se/libcurl/c/CURLOPT_RTSP_TRANSPORT.html)
     */
    rtspTransPort: 'RTSP_TRANSPORT',
    /**
     * SASL authorisation identity (identity to act as).
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SASL_AUTHZID.html](https://curl.haxx.se/libcurl/c/CURLOPT_SASL_AUTHZID.html)
     */
    saslAuthzId: 'SASL_AUTHZID',
    /**
     * Enable SASL initial response.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SASL_IR.html](https://curl.haxx.se/libcurl/c/CURLOPT_SASL_IR.html)
     */
    saslIr: 'SASL_IR',
    /**
     * Callback for seek operations.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SEEKFUNCTION.html](https://curl.haxx.se/libcurl/c/CURLOPT_SEEKFUNCTION.html)
     */
    seekFunction: 'SEEKFUNCTION',
    /**
     * Authentication service name.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SERVICE_NAME.html](https://curl.haxx.se/libcurl/c/CURLOPT_SERVICE_NAME.html)
     */
    serviceName: 'SERVICE_NAME',
    /**
     * Share object to use.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SHARE.html](https://curl.haxx.se/libcurl/c/CURLOPT_SHARE.html)
     */
    share: 'SHARE',
    /**
     * Socks5 authentication methods.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SOCKS5_AUTH.html](https://curl.haxx.se/libcurl/c/CURLOPT_SOCKS5_AUTH.html)
     */
    socks5Auth: 'SOCKS5_AUTH',
    /**
     * Socks5 GSSAPI NEC mode.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SOCKS5_GSSAPI_NEC.html](https://curl.haxx.se/libcurl/c/CURLOPT_SOCKS5_GSSAPI_NEC.html)
     */
    socks5GssapiNec: 'SOCKS5_GSSAPI_NEC',
    /**
     * Socks5 GSSAPI service name.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SOCKS5_GSSAPI_SERVICE.html](https://curl.haxx.se/libcurl/c/CURLOPT_SOCKS5_GSSAPI_SERVICE.html)
     */
    socks5GssapiService: 'SOCKS5_GSSAPI_SERVICE',
    /**
     * SSH authentication types.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSH_AUTH_TYPES.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSH_AUTH_TYPES.html)
     */
    sshAuthTypes: 'SSH_AUTH_TYPES',
    /**
     * Enable SSH compression.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSH_COMPRESSION.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSH_COMPRESSION.html)
     */
    sshCompression: 'SSH_COMPRESSION',
    /**
     * MD5 of host's public key.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSH_HOST_PUBLIC_KEY_MD5.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSH_HOST_PUBLIC_KEY_MD5.html)
     */
    sshHostPublicKeyMd5: 'SSH_HOST_PUBLIC_KEY_MD5',
    /**
     * File name with known hosts.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSH_KNOWNHOSTS.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSH_KNOWNHOSTS.html)
     */
    sshKnownHosts: 'SSH_KNOWNHOSTS',
    /**
     * File name of private key.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSH_PRIVATE_KEYFILE.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSH_PRIVATE_KEYFILE.html)
     */
    sshPrivateKeyFile: 'SSH_PRIVATE_KEYFILE',
    /**
     * File name of public key.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSH_PUBLIC_KEYFILE.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSH_PUBLIC_KEYFILE.html)
     */
    sshPublicKeyFile: 'SSH_PUBLIC_KEYFILE',
    /**
     * Ciphers to use.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSL_CIPHER_LIST.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSL_CIPHER_LIST.html)
     */
    sslCipherList: 'SSL_CIPHER_LIST',
    /**
     * Enable use of ALPN.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSL_ENABLE_ALPN.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSL_ENABLE_ALPN.html)
     */
    sslEnableAlpn: 'SSL_ENABLE_ALPN',
    /**
     * Enable use of NPN.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSL_ENABLE_NPN.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSL_ENABLE_NPN.html)
     */
    sslEnableNpn: 'SSL_ENABLE_NPN',
    /**
     * Enable TLS False Start.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSL_FALSESTART.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSL_FALSESTART.html)
     */
    sslFalsestart: 'SSL_FALSESTART',
    /**
     * Control SSL behavior.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSL_OPTIONS.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSL_OPTIONS.html)
     */
    sslOptions: 'SSL_OPTIONS',
    /**
     * Disable SSL session-id cache.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSL_SESSIONID_CACHE.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSL_SESSIONID_CACHE.html)
     */
    sslSessionIdCache: 'SSL_SESSIONID_CACHE',
    /**
     * Verify the host name in the SSL certificate.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSL_VERIFYHOST.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSL_VERIFYHOST.html)
     */
    sslVerifyHost: 'SSL_VERIFYHOST',
    /**
     * Verify the SSL certificate.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSL_VERIFYPEER.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSL_VERIFYPEER.html)
     */
    sslVerifyPeer: 'SSL_VERIFYPEER',
    /**
     * Verify the SSL certificate's status.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSL_VERIFYSTATUS.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSL_VERIFYSTATUS.html)
     */
    sslVerifyStatus: 'SSL_VERIFYSTATUS',
    /**
     * Client cert.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSLCERT.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSLCERT.html)
     */
    sslCert: 'SSLCERT',
    /**
     * Client cert memory buffer.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSLCERT_BLOB.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSLCERT_BLOB.html)
     */
    sslCertBlob: 'SSLCERT_BLOB',
    /**
     * Client cert type.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSLCERTTYPE.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSLCERTTYPE.html)
     */
    sslCertType: 'SSLCERTTYPE',
    /**
     * Use identifier with SSL engine.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSLENGINE.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSLENGINE.html)
     */
    sslEngine: 'SSLENGINE',
    /**
     * Default SSL engine.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSLENGINE_DEFAULT.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSLENGINE_DEFAULT.html)
     */
    sslEngineDefault: 'SSLENGINE_DEFAULT',
    /**
     * Client key.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSLKEY.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSLKEY.html)
     */
    sslKey: 'SSLKEY',
    /**
     * Client key memory buffer.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSLKEY_BLOB.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSLKEY_BLOB.html)
     */
    sslKeyBlob: 'SSLKEY_BLOB',
    /**
     * Client key type.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSLKEYTYPE.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSLKEYTYPE.html)
     */
    sslKeyType: 'SSLKEYTYPE',
    /**
     * SSL version to use.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SSLVERSION.html](https://curl.haxx.se/libcurl/c/CURLOPT_SSLVERSION.html)
     */
    sslversion: 'SSLVERSION',
    /**
     * Suppress proxy CONNECT response headers from user callbacks.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_SUPPRESS_CONNECT_HEADERS.html](https://curl.haxx.se/libcurl/c/CURLOPT_SUPPRESS_CONNECT_HEADERS.html)
     */
    suppressConnectHeaders: 'SUPPRESS_CONNECT_HEADERS',
    /**
     * Enable TFO, TCP Fast Open.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TCP_FASTOPEN.html](https://curl.haxx.se/libcurl/c/CURLOPT_TCP_FASTOPEN.html)
     */
    tcpFastOpen: 'TCP_FASTOPEN',
    /**
     * Enable TCP keep-alive.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TCP_KEEPALIVE.html](https://curl.haxx.se/libcurl/c/CURLOPT_TCP_KEEPALIVE.html)
     */
    tcpKeepAlive: 'TCP_KEEPALIVE',
    /**
     * Idle time before sending keep-alive.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TCP_KEEPIDLE.html](https://curl.haxx.se/libcurl/c/CURLOPT_TCP_KEEPIDLE.html)
     */
    tcpKeepIdle: 'TCP_KEEPIDLE',
    /**
     * Interval between keep-alive probes.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TCP_KEEPINTVL.html](https://curl.haxx.se/libcurl/c/CURLOPT_TCP_KEEPINTVL.html)
     */
    tcpKeepIntvl: 'TCP_KEEPINTVL',
    /**
     * Disable the Nagle algorithm.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TCP_NODELAY.html](https://curl.haxx.se/libcurl/c/CURLOPT_TCP_NODELAY.html)
     */
    tcpNoDelay: 'TCP_NODELAY',
    /**
     * TELNET options.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TELNETOPTIONS.html](https://curl.haxx.se/libcurl/c/CURLOPT_TELNETOPTIONS.html)
     */
    telnetOptions: 'TELNETOPTIONS',
    /**
     * TFTP block size.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TFTP_BLKSIZE.html](https://curl.haxx.se/libcurl/c/CURLOPT_TFTP_BLKSIZE.html)
     */
    tftpBlkSize: 'TFTP_BLKSIZE',
    /**
     * Do not send TFTP options requests.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TFTP_NO_OPTIONS.html](https://curl.haxx.se/libcurl/c/CURLOPT_TFTP_NO_OPTIONS.html)
     */
    tftpNoOptions: 'TFTP_NO_OPTIONS',
    /**
     * Make a time conditional request.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TIMECONDITION.html](https://curl.haxx.se/libcurl/c/CURLOPT_TIMECONDITION.html)
     */
    timeCondition: 'TIMECONDITION',
    /**
     * Timeout for the entire request.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TIMEOUT.html](https://curl.haxx.se/libcurl/c/CURLOPT_TIMEOUT.html)
     */
    timeout: 'TIMEOUT',
    /**
     * Millisecond timeout for the entire request.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TIMEOUT_MS.html](https://curl.haxx.se/libcurl/c/CURLOPT_TIMEOUT_MS.html)
     */
    timeoutMs: 'TIMEOUT_MS',
    /**
     * Time value for the time conditional request.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TIMEVALUE.html](https://curl.haxx.se/libcurl/c/CURLOPT_TIMEVALUE.html)
     */
    timeValue: 'TIMEVALUE',
    /**
     * Time value for the time conditional request.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TIMEVALUE_LARGE.html](https://curl.haxx.se/libcurl/c/CURLOPT_TIMEVALUE_LARGE.html)
     */
    timeValueLarge: 'TIMEVALUE_LARGE',
    /**
     * TLS 1.3 cipher suites to use.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TLS13_CIPHERS.html](https://curl.haxx.se/libcurl/c/CURLOPT_TLS13_CIPHERS.html)
     */
    tls13Ciphers: 'TLS13_CIPHERS',
    /**
     * TLS authentication password.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TLSAUTH_PASSWORD.html](https://curl.haxx.se/libcurl/c/CURLOPT_TLSAUTH_PASSWORD.html)
     */
    tlsAuthPassword: 'TLSAUTH_PASSWORD',
    /**
     * TLS authentication methods.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TLSAUTH_TYPE.html](https://curl.haxx.se/libcurl/c/CURLOPT_TLSAUTH_TYPE.html)
     */
    tlsAuthType: 'TLSAUTH_TYPE',
    /**
     * TLS authentication user name.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TLSAUTH_USERNAME.html](https://curl.haxx.se/libcurl/c/CURLOPT_TLSAUTH_USERNAME.html)
     */
    tlsAuthUsername: 'TLSAUTH_USERNAME',
    /**
     * Set callback for sending trailing headers.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TRAILERFUNCTION.html](https://curl.haxx.se/libcurl/c/CURLOPT_TRAILERFUNCTION.html)
     */
    trailerFunction: 'TRAILERFUNCTION',
    /**
     * Request Transfer-Encoding.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TRANSFER_ENCODING.html](https://curl.haxx.se/libcurl/c/CURLOPT_TRANSFER_ENCODING.html)
     */
    transferEncoding: 'TRANSFER_ENCODING',
    /**
     * Use text transfer.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_TRANSFERTEXT.html](https://curl.haxx.se/libcurl/c/CURLOPT_TRANSFERTEXT.html)
     */
    transferText: 'TRANSFERTEXT',
    /**
     * Path to a Unix domain socket.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_UNIX_SOCKET_PATH.html](https://curl.haxx.se/libcurl/c/CURLOPT_UNIX_SOCKET_PATH.html)
     */
    unixSocketPath: 'UNIX_SOCKET_PATH',
    /**
     * Do not restrict authentication to original host.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_UNRESTRICTED_AUTH.html](https://curl.haxx.se/libcurl/c/CURLOPT_UNRESTRICTED_AUTH.html)
     */
    unrestrictedAuth: 'UNRESTRICTED_AUTH',
    /**
     * Sets the interval at which connection upkeep are performed.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_UPKEEP_INTERVAL_MS.html](https://curl.haxx.se/libcurl/c/CURLOPT_UPKEEP_INTERVAL_MS.html)
     */
    upkeepIntervalMs: 'UPKEEP_INTERVAL_MS',
    /**
     * Upload data.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_UPLOAD.html](https://curl.haxx.se/libcurl/c/CURLOPT_UPLOAD.html)
     */
    upload: 'UPLOAD',
    /**
     * Set upload buffer size.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_UPLOAD_BUFFERSIZE.html](https://curl.haxx.se/libcurl/c/CURLOPT_UPLOAD_BUFFERSIZE.html)
     */
    uploadBufferSize: 'UPLOAD_BUFFERSIZE',
    /**
     * URL to work on.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_URL.html](https://curl.haxx.se/libcurl/c/CURLOPT_URL.html)
     */
    url: 'URL',
    /**
     * Use TLS/SSL.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_USE_SSL.html](https://curl.haxx.se/libcurl/c/CURLOPT_USE_SSL.html)
     */
    useSsl: 'USE_SSL',
    /**
     * User-Agent: header.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_USERAGENT.html](https://curl.haxx.se/libcurl/c/CURLOPT_USERAGENT.html)
     */
    userAgent: 'USERAGENT',
    /**
     * User name.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_USERNAME.html](https://curl.haxx.se/libcurl/c/CURLOPT_USERNAME.html)
     */
    username: 'USERNAME',
    /**
     * User name and password.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_USERPWD.html](https://curl.haxx.se/libcurl/c/CURLOPT_USERPWD.html)
     */
    userpwd: 'USERPWD',
    /**
     * Display verbose information.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_VERBOSE.html](https://curl.haxx.se/libcurl/c/CURLOPT_VERBOSE.html)
     */
    verbose: 'VERBOSE',
    /**
     * Transfer multiple files according to a file name pattern.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_WILDCARDMATCH.html](https://curl.haxx.se/libcurl/c/CURLOPT_WILDCARDMATCH.html)
     */
    wildcardMatch: 'WILDCARDMATCH',
    /**
     * Callback for writing data.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_WRITEFUNCTION.html](https://curl.haxx.se/libcurl/c/CURLOPT_WRITEFUNCTION.html)
     */
    writeFunction: 'WRITEFUNCTION',
    /**
     * Callback for progress meter.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_XFERINFOFUNCTION.html](https://curl.haxx.se/libcurl/c/CURLOPT_XFERINFOFUNCTION.html)
     */
    xferInfoFunction: 'XFERINFOFUNCTION',
    /**
     * OAuth2 bearer token.
     *
     * Official libcurl documentation: : [https://curl.haxx.se/libcurl/c/CURLOPT_XOAUTH2_BEARER.html](https://curl.haxx.se/libcurl/c/CURLOPT_XOAUTH2_BEARER.html)
     */
    xoauth2Bearer: 'XOAUTH2_BEARER',
};
//# sourceMappingURL=CurlOption.js.map

/***/ }),
/* 534 */,
/* 535 */,
/* 536 */,
/* 537 */,
/* 538 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlFtpSsl = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be8254534/include/curl/curl.h#L846
/**
 * Object with constants for option `FTP_SSL_CCC`
 *
 * `CURLFTPSSL_CCC_NONE` becomes `CurlFtpSsl.CccNone`
 *
 * @public
 */
var CurlFtpSsl;
(function (CurlFtpSsl) {
    /**
     * do not send CCC
     */
    CurlFtpSsl[CurlFtpSsl["CccNone"] = 0] = "CccNone";
    /**
     * Let the server initiate the shutdown
     */
    CurlFtpSsl[CurlFtpSsl["CccPassive"] = 1] = "CccPassive";
    /**
     * Initiate the shutdown
     */
    CurlFtpSsl[CurlFtpSsl["CccActive"] = 2] = "CccActive";
})(CurlFtpSsl = exports.CurlFtpSsl || (exports.CurlFtpSsl = {}));
//# sourceMappingURL=CurlFtpSsl.js.map

/***/ }),
/* 539 */,
/* 540 */,
/* 541 */,
/* 542 */,
/* 543 */,
/* 544 */,
/* 545 */,
/* 546 */,
/* 547 */,
/* 548 */,
/* 549 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var url = __webpack_require__(835);
var URL = url.URL;
var http = __webpack_require__(605);
var https = __webpack_require__(34);
var Writable = __webpack_require__(413).Writable;
var assert = __webpack_require__(357);
var debug = __webpack_require__(145);

// Create handlers that pass events from native requests
var eventHandlers = Object.create(null);
["abort", "aborted", "connect", "error", "socket", "timeout"].forEach(function (event) {
  eventHandlers[event] = function (arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
});

// Error types with codes
var RedirectionError = createErrorType(
  "ERR_FR_REDIRECTION_FAILURE",
  ""
);
var TooManyRedirectsError = createErrorType(
  "ERR_FR_TOO_MANY_REDIRECTS",
  "Maximum number of redirects exceeded"
);
var MaxBodyLengthExceededError = createErrorType(
  "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
  "Request body larger than maxBodyLength limit"
);
var WriteAfterEndError = createErrorType(
  "ERR_STREAM_WRITE_AFTER_END",
  "write after end"
);

// An HTTP(S) request that can be redirected
function RedirectableRequest(options, responseCallback) {
  // Initialize the request
  Writable.call(this);
  this._sanitizeOptions(options);
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyLength = 0;
  this._requestBodyBuffers = [];

  // Attach a callback if passed
  if (responseCallback) {
    this.on("response", responseCallback);
  }

  // React to responses of native requests
  var self = this;
  this._onNativeResponse = function (response) {
    self._processResponse(response);
  };

  // Perform the first request
  this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);

// Writes buffered data to the current native request
RedirectableRequest.prototype.write = function (data, encoding, callback) {
  // Writing is not allowed if end has been called
  if (this._ending) {
    throw new WriteAfterEndError();
  }

  // Validate input and shift parameters if necessary
  if (!(typeof data === "string" || typeof data === "object" && ("length" in data))) {
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  }
  if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  }

  // Ignore empty buffers, since writing them doesn't invoke the callback
  // https://github.com/nodejs/node/issues/22066
  if (data.length === 0) {
    if (callback) {
      callback();
    }
    return;
  }
  // Only write when we don't exceed the maximum body length
  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;
    this._requestBodyBuffers.push({ data: data, encoding: encoding });
    this._currentRequest.write(data, encoding, callback);
  }
  // Error when we exceed the maximum body length
  else {
    this.emit("error", new MaxBodyLengthExceededError());
    this.abort();
  }
};

// Ends the current native request
RedirectableRequest.prototype.end = function (data, encoding, callback) {
  // Shift parameters if necessary
  if (typeof data === "function") {
    callback = data;
    data = encoding = null;
  }
  else if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  }

  // Write data if needed and end
  if (!data) {
    this._ended = this._ending = true;
    this._currentRequest.end(null, null, callback);
  }
  else {
    var self = this;
    var currentRequest = this._currentRequest;
    this.write(data, encoding, function () {
      self._ended = true;
      currentRequest.end(null, null, callback);
    });
    this._ending = true;
  }
};

// Sets a header value on the current native request
RedirectableRequest.prototype.setHeader = function (name, value) {
  this._options.headers[name] = value;
  this._currentRequest.setHeader(name, value);
};

// Clears a header value on the current native request
RedirectableRequest.prototype.removeHeader = function (name) {
  delete this._options.headers[name];
  this._currentRequest.removeHeader(name);
};

// Global timeout for all underlying requests
RedirectableRequest.prototype.setTimeout = function (msecs, callback) {
  if (callback) {
    this.once("timeout", callback);
  }

  if (this.socket) {
    startTimer(this, msecs);
  }
  else {
    var self = this;
    this._currentRequest.once("socket", function () {
      startTimer(self, msecs);
    });
  }

  this.once("response", clearTimer);
  this.once("error", clearTimer);

  return this;
};

function startTimer(request, msecs) {
  clearTimeout(request._timeout);
  request._timeout = setTimeout(function () {
    request.emit("timeout");
  }, msecs);
}

function clearTimer() {
  clearTimeout(this._timeout);
}

// Proxy all other public ClientRequest methods
[
  "abort", "flushHeaders", "getHeader",
  "setNoDelay", "setSocketKeepAlive",
].forEach(function (method) {
  RedirectableRequest.prototype[method] = function (a, b) {
    return this._currentRequest[method](a, b);
  };
});

// Proxy all public ClientRequest properties
["aborted", "connection", "socket"].forEach(function (property) {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get: function () { return this._currentRequest[property]; },
  });
});

RedirectableRequest.prototype._sanitizeOptions = function (options) {
  // Ensure headers are always present
  if (!options.headers) {
    options.headers = {};
  }

  // Since http.request treats host as an alias of hostname,
  // but the url module interprets host as hostname plus port,
  // eliminate the host property to avoid confusion.
  if (options.host) {
    // Use hostname if set, because it has precedence
    if (!options.hostname) {
      options.hostname = options.host;
    }
    delete options.host;
  }

  // Complete the URL object when necessary
  if (!options.pathname && options.path) {
    var searchPos = options.path.indexOf("?");
    if (searchPos < 0) {
      options.pathname = options.path;
    }
    else {
      options.pathname = options.path.substring(0, searchPos);
      options.search = options.path.substring(searchPos);
    }
  }
};


// Executes the next native request (initial or redirect)
RedirectableRequest.prototype._performRequest = function () {
  // Load the native protocol
  var protocol = this._options.protocol;
  var nativeProtocol = this._options.nativeProtocols[protocol];
  if (!nativeProtocol) {
    this.emit("error", new TypeError("Unsupported protocol " + protocol));
    return;
  }

  // If specified, use the agent corresponding to the protocol
  // (HTTP and HTTPS use different types of agents)
  if (this._options.agents) {
    var scheme = protocol.substr(0, protocol.length - 1);
    this._options.agent = this._options.agents[scheme];
  }

  // Create the native request
  var request = this._currentRequest =
        nativeProtocol.request(this._options, this._onNativeResponse);
  this._currentUrl = url.format(this._options);

  // Set up event handlers
  request._redirectable = this;
  for (var event in eventHandlers) {
    /* istanbul ignore else */
    if (event) {
      request.on(event, eventHandlers[event]);
    }
  }

  // End a redirected request
  // (The first request must be ended explicitly with RedirectableRequest#end)
  if (this._isRedirect) {
    // Write the request entity and end.
    var i = 0;
    var self = this;
    var buffers = this._requestBodyBuffers;
    (function writeNext(error) {
      // Only write if this request has not been redirected yet
      /* istanbul ignore else */
      if (request === self._currentRequest) {
        // Report any write errors
        /* istanbul ignore if */
        if (error) {
          self.emit("error", error);
        }
        // Write the next buffer if there are still left
        else if (i < buffers.length) {
          var buffer = buffers[i++];
          /* istanbul ignore else */
          if (!request.finished) {
            request.write(buffer.data, buffer.encoding, writeNext);
          }
        }
        // End the request if `end` has been called on us
        else if (self._ended) {
          request.end();
        }
      }
    }());
  }
};

// Processes a response from the current native request
RedirectableRequest.prototype._processResponse = function (response) {
  // Store the redirected response
  var statusCode = response.statusCode;
  if (this._options.trackRedirects) {
    this._redirects.push({
      url: this._currentUrl,
      headers: response.headers,
      statusCode: statusCode,
    });
  }

  // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
  // that further action needs to be taken by the user agent in order to
  // fulfill the request. If a Location header field is provided,
  // the user agent MAY automatically redirect its request to the URI
  // referenced by the Location field value,
  // even if the specific status code is not understood.
  var location = response.headers.location;
  if (location && this._options.followRedirects !== false &&
      statusCode >= 300 && statusCode < 400) {
    // Abort the current request
    this._currentRequest.removeAllListeners();
    this._currentRequest.on("error", noop);
    this._currentRequest.abort();
    // Discard the remainder of the response to avoid waiting for data
    response.destroy();

    // RFC7231§6.4: A client SHOULD detect and intervene
    // in cyclical redirections (i.e., "infinite" redirection loops).
    if (++this._redirectCount > this._options.maxRedirects) {
      this.emit("error", new TooManyRedirectsError());
      return;
    }

    // RFC7231§6.4: Automatic redirection needs to done with
    // care for methods not known to be safe, […]
    // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
    // the request method from POST to GET for the subsequent request.
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" ||
        // RFC7231§6.4.4: The 303 (See Other) status code indicates that
        // the server is redirecting the user agent to a different resource […]
        // A user agent can perform a retrieval request targeting that URI
        // (a GET or HEAD request if using HTTP) […]
        (statusCode === 303) && !/^(?:GET|HEAD)$/.test(this._options.method)) {
      this._options.method = "GET";
      // Drop a possible entity and headers related to it
      this._requestBodyBuffers = [];
      removeMatchingHeaders(/^content-/i, this._options.headers);
    }

    // Drop the Host header, as the redirect might lead to a different host
    var previousHostName = removeMatchingHeaders(/^host$/i, this._options.headers) ||
      url.parse(this._currentUrl).hostname;

    // Create the redirected request
    var redirectUrl = url.resolve(this._currentUrl, location);
    debug("redirecting to", redirectUrl);
    this._isRedirect = true;
    var redirectUrlParts = url.parse(redirectUrl);
    Object.assign(this._options, redirectUrlParts);

    // Drop the Authorization header if redirecting to another host
    if (redirectUrlParts.hostname !== previousHostName) {
      removeMatchingHeaders(/^authorization$/i, this._options.headers);
    }

    // Evaluate the beforeRedirect callback
    if (typeof this._options.beforeRedirect === "function") {
      var responseDetails = { headers: response.headers };
      try {
        this._options.beforeRedirect.call(null, this._options, responseDetails);
      }
      catch (err) {
        this.emit("error", err);
        return;
      }
      this._sanitizeOptions(this._options);
    }

    // Perform the redirected request
    try {
      this._performRequest();
    }
    catch (cause) {
      var error = new RedirectionError("Redirected request failed: " + cause.message);
      error.cause = cause;
      this.emit("error", error);
    }
  }
  else {
    // The response is not a redirect; return it as-is
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit("response", response);

    // Clean up
    this._requestBodyBuffers = [];
  }
};

// Wraps the key/value object of protocols with redirect functionality
function wrap(protocols) {
  // Default settings
  var exports = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024,
  };

  // Wrap each protocol
  var nativeProtocols = {};
  Object.keys(protocols).forEach(function (scheme) {
    var protocol = scheme + ":";
    var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

    // Executes a request, following redirects
    wrappedProtocol.request = function (input, options, callback) {
      // Parse parameters
      if (typeof input === "string") {
        var urlStr = input;
        try {
          input = urlToOptions(new URL(urlStr));
        }
        catch (err) {
          /* istanbul ignore next */
          input = url.parse(urlStr);
        }
      }
      else if (URL && (input instanceof URL)) {
        input = urlToOptions(input);
      }
      else {
        callback = options;
        options = input;
        input = { protocol: protocol };
      }
      if (typeof options === "function") {
        callback = options;
        options = null;
      }

      // Set defaults
      options = Object.assign({
        maxRedirects: exports.maxRedirects,
        maxBodyLength: exports.maxBodyLength,
      }, input, options);
      options.nativeProtocols = nativeProtocols;

      assert.equal(options.protocol, protocol, "protocol mismatch");
      debug("options", options);
      return new RedirectableRequest(options, callback);
    };

    // Executes a GET request, following redirects
    wrappedProtocol.get = function (input, options, callback) {
      var request = wrappedProtocol.request(input, options, callback);
      request.end();
      return request;
    };
  });
  return exports;
}

/* istanbul ignore next */
function noop() { /* empty */ }

// from https://github.com/nodejs/node/blob/master/lib/internal/url.js
function urlToOptions(urlObject) {
  var options = {
    protocol: urlObject.protocol,
    hostname: urlObject.hostname.startsWith("[") ?
      /* istanbul ignore next */
      urlObject.hostname.slice(1, -1) :
      urlObject.hostname,
    hash: urlObject.hash,
    search: urlObject.search,
    pathname: urlObject.pathname,
    path: urlObject.pathname + urlObject.search,
    href: urlObject.href,
  };
  if (urlObject.port !== "") {
    options.port = Number(urlObject.port);
  }
  return options;
}

function removeMatchingHeaders(regex, headers) {
  var lastValue;
  for (var header in headers) {
    if (regex.test(header)) {
      lastValue = headers[header];
      delete headers[header];
    }
  }
  return lastValue;
}

function createErrorType(code, defaultMessage) {
  function CustomError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message || defaultMessage;
  }
  CustomError.prototype = new Error();
  CustomError.prototype.constructor = CustomError;
  CustomError.prototype.name = "Error [" + code + "]";
  CustomError.prototype.code = code;
  return CustomError;
}

// Exports
module.exports = wrap({ http: http, https: https });
module.exports.wrap = wrap;


/***/ }),
/* 550 */,
/* 551 */,
/* 552 */,
/* 553 */,
/* 554 */,
/* 555 */,
/* 556 */
/***/ (function(module) {

"use strict";
// YAML error class. http://stackoverflow.com/questions/8458984
//


function YAMLException(reason, mark) {
  // Super constructor
  Error.call(this);

  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = (this.reason || '(unknown reason)') + (this.mark ? ' ' + this.mark.toString() : '');

  // Include stack trace in error object
  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = (new Error()).stack || '';
  }
}


// Inherit from Error
YAMLException.prototype = Object.create(Error.prototype);
YAMLException.prototype.constructor = YAMLException;


YAMLException.prototype.toString = function toString(compact) {
  var result = this.name + ': ';

  result += this.reason || '(unknown reason)';

  if (!compact && this.mark) {
    result += ' ' + this.mark.toString();
  }

  return result;
};


module.exports = YAMLException;


/***/ }),
/* 557 */,
/* 558 */,
/* 559 */,
/* 560 */,
/* 561 */,
/* 562 */
/***/ (function(__unusedmodule, exports) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

function getUserAgent() {
  if (typeof navigator === "object" && "userAgent" in navigator) {
    return navigator.userAgent;
  }

  if (typeof process === "object" && "version" in process) {
    return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
  }

  return "<environment undetectable>";
}

exports.getUserAgent = getUserAgent;
//# sourceMappingURL=index.js.map


/***/ }),
/* 563 */,
/* 564 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var createError = __webpack_require__(26);

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),
/* 565 */,
/* 566 */,
/* 567 */,
/* 568 */,
/* 569 */,
/* 570 */,
/* 571 */,
/* 572 */,
/* 573 */,
/* 574 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var Type = __webpack_require__(945);

module.exports = new Type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return data !== null ? data : ''; }
});


/***/ }),
/* 575 */,
/* 576 */,
/* 577 */,
/* 578 */,
/* 579 */,
/* 580 */,
/* 581 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346





var Schema = __webpack_require__(733);


module.exports = new Schema({
  explicit: [
    __webpack_require__(574),
    __webpack_require__(921),
    __webpack_require__(988)
  ]
});


/***/ }),
/* 582 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {PassThrough} = __webpack_require__(413);

module.exports = options => {
	options = Object.assign({}, options);

	const {array} = options;
	let {encoding} = options;
	const buffer = encoding === 'buffer';
	let objectMode = false;

	if (array) {
		objectMode = !(encoding || buffer);
	} else {
		encoding = encoding || 'utf8';
	}

	if (buffer) {
		encoding = null;
	}

	let len = 0;
	const ret = [];
	const stream = new PassThrough({objectMode});

	if (encoding) {
		stream.setEncoding(encoding);
	}

	stream.on('data', chunk => {
		ret.push(chunk);

		if (objectMode) {
			len = ret.length;
		} else {
			len += chunk.length;
		}
	});

	stream.getBufferedValue = () => {
		if (array) {
			return ret;
		}

		return buffer ? Buffer.concat(ret, len) : ret.join('');
	};

	stream.getBufferedLength = () => len;

	return stream;
};


/***/ }),
/* 583 */,
/* 584 */,
/* 585 */,
/* 586 */,
/* 587 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlFnMatchFunc = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be8254534898fccafc5d6cd04f6235f283cfbd/include/curl/curl.h#L342
/**
 * Object to be used as the return value for the callback set with the option `FNMATCH_FUNCTION`
 *
 * `CURL_FNMATCHFUNC_MATCH` becomes `CurlFnMatch.Match`
 *
 * @public
 */
var CurlFnMatchFunc;
(function (CurlFnMatchFunc) {
    CurlFnMatchFunc[CurlFnMatchFunc["Match"] = 0] = "Match";
    CurlFnMatchFunc[CurlFnMatchFunc["NoMatch"] = 1] = "NoMatch";
    CurlFnMatchFunc[CurlFnMatchFunc["Fail"] = 2] = "Fail";
})(CurlFnMatchFunc = exports.CurlFnMatchFunc || (exports.CurlFnMatchFunc = {}));
//# sourceMappingURL=CurlFnMatchFunc.js.map

/***/ }),
/* 588 */,
/* 589 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),
/* 590 */
/***/ (function(module) {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),
/* 591 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlFtpAuth = exports.CurlAuth = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be82545348/include/curl/curl.h#L725
/**
 * Object with bitmasks that should be used with the `HTTPAUTH` and `PROXYAUTH` options.
 *
 * `CURLAUTH_BASIC` becomes `CurlAuth.Basic`
 *
 * **NOTE:** The option `Only` (`CURLAUTH_ONLY`) cannot be safely used on bitwise operations, because it represents a integer larger
 *  than 32 bits, if you need to use it, you must do the bitwise operation without using the operators.
 *
 * See following StackOverflow questions for more info:
 *  https://stackoverflow.com/q/39660274/710693
 *  https://stackoverflow.com/q/3637702/710693
 *
 * @public
 */
var CurlAuth;
(function (CurlAuth) {
    CurlAuth[CurlAuth["None"] = 0] = "None";
    CurlAuth[CurlAuth["Basic"] = 1] = "Basic";
    CurlAuth[CurlAuth["Digest"] = 2] = "Digest";
    CurlAuth[CurlAuth["Negotiate"] = 4] = "Negotiate";
    /**
     * Deprecated since the advent of Negotiate
     */
    CurlAuth[CurlAuth["GssNegotiate"] = 4] = "GssNegotiate";
    /**
     * Used for option `SOCKS5_AUTH` to stay terminologically correct
     */
    CurlAuth[CurlAuth["GssApi"] = 4] = "GssApi";
    CurlAuth[CurlAuth["Ntlm"] = 8] = "Ntlm";
    CurlAuth[CurlAuth["DigestIe"] = 16] = "DigestIe";
    CurlAuth[CurlAuth["NtlmWb"] = 32] = "NtlmWb";
    CurlAuth[CurlAuth["Bearer"] = 64] = "Bearer";
    // cannot use 1 << 31 like on libcurl, because bitwise operations on js are limited to 32 bits, so that would overflow
    CurlAuth[CurlAuth["Only"] = 2147483648] = "Only";
    CurlAuth[CurlAuth["Any"] = -17] = "Any";
    CurlAuth[CurlAuth["AnySafe"] = -18] = "AnySafe";
})(CurlAuth = exports.CurlAuth || (exports.CurlAuth = {}));
// https://github.com/curl/curl/blob/e1be825453/include/curl/curl.h#L853
/**
 * Object with constants for option `FTPSSLAUTH`
 *
 * `CURLFTPAUTH_DEFAULT` becomes `CurlFtpAuth.Default`
 *
 * @public
 */
var CurlFtpAuth;
(function (CurlFtpAuth) {
    CurlFtpAuth[CurlFtpAuth["Default"] = 0] = "Default";
    CurlFtpAuth[CurlFtpAuth["Ssl"] = 1] = "Ssl";
    CurlFtpAuth[CurlFtpAuth["Tls"] = 2] = "Tls";
})(CurlFtpAuth = exports.CurlFtpAuth || (exports.CurlFtpAuth = {}));
//# sourceMappingURL=CurlAuth.js.map

/***/ }),
/* 592 */,
/* 593 */,
/* 594 */,
/* 595 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(598)
const path = __webpack_require__(622)
const mkdirs = __webpack_require__(727).mkdirs
const pathExists = __webpack_require__(322).pathExists
const utimesMillis = __webpack_require__(946).utimesMillis
const stat = __webpack_require__(127)

function copy (src, dest, opts, cb) {
  if (typeof opts === 'function' && !cb) {
    cb = opts
    opts = {}
  } else if (typeof opts === 'function') {
    opts = { filter: opts }
  }

  cb = cb || function () {}
  opts = opts || {}

  opts.clobber = 'clobber' in opts ? !!opts.clobber : true // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`)
  }

  stat.checkPaths(src, dest, 'copy', (err, stats) => {
    if (err) return cb(err)
    const { srcStat, destStat } = stats
    stat.checkParentPaths(src, srcStat, dest, 'copy', err => {
      if (err) return cb(err)
      if (opts.filter) return handleFilter(checkParentDir, destStat, src, dest, opts, cb)
      return checkParentDir(destStat, src, dest, opts, cb)
    })
  })
}

function checkParentDir (destStat, src, dest, opts, cb) {
  const destParent = path.dirname(dest)
  pathExists(destParent, (err, dirExists) => {
    if (err) return cb(err)
    if (dirExists) return startCopy(destStat, src, dest, opts, cb)
    mkdirs(destParent, err => {
      if (err) return cb(err)
      return startCopy(destStat, src, dest, opts, cb)
    })
  })
}

function handleFilter (onInclude, destStat, src, dest, opts, cb) {
  Promise.resolve(opts.filter(src, dest)).then(include => {
    if (include) return onInclude(destStat, src, dest, opts, cb)
    return cb()
  }, error => cb(error))
}

function startCopy (destStat, src, dest, opts, cb) {
  if (opts.filter) return handleFilter(getStats, destStat, src, dest, opts, cb)
  return getStats(destStat, src, dest, opts, cb)
}

function getStats (destStat, src, dest, opts, cb) {
  const stat = opts.dereference ? fs.stat : fs.lstat
  stat(src, (err, srcStat) => {
    if (err) return cb(err)

    if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts, cb)
    else if (srcStat.isFile() ||
             srcStat.isCharacterDevice() ||
             srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts, cb)
    else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts, cb)
  })
}

function onFile (srcStat, destStat, src, dest, opts, cb) {
  if (!destStat) return copyFile(srcStat, src, dest, opts, cb)
  return mayCopyFile(srcStat, src, dest, opts, cb)
}

function mayCopyFile (srcStat, src, dest, opts, cb) {
  if (opts.overwrite) {
    fs.unlink(dest, err => {
      if (err) return cb(err)
      return copyFile(srcStat, src, dest, opts, cb)
    })
  } else if (opts.errorOnExist) {
    return cb(new Error(`'${dest}' already exists`))
  } else return cb()
}

function copyFile (srcStat, src, dest, opts, cb) {
  fs.copyFile(src, dest, err => {
    if (err) return cb(err)
    if (opts.preserveTimestamps) return handleTimestampsAndMode(srcStat.mode, src, dest, cb)
    return setDestMode(dest, srcStat.mode, cb)
  })
}

function handleTimestampsAndMode (srcMode, src, dest, cb) {
  // Make sure the file is writable before setting the timestamp
  // otherwise open fails with EPERM when invoked with 'r+'
  // (through utimes call)
  if (fileIsNotWritable(srcMode)) {
    return makeFileWritable(dest, srcMode, err => {
      if (err) return cb(err)
      return setDestTimestampsAndMode(srcMode, src, dest, cb)
    })
  }
  return setDestTimestampsAndMode(srcMode, src, dest, cb)
}

function fileIsNotWritable (srcMode) {
  return (srcMode & 0o200) === 0
}

function makeFileWritable (dest, srcMode, cb) {
  return setDestMode(dest, srcMode | 0o200, cb)
}

function setDestTimestampsAndMode (srcMode, src, dest, cb) {
  setDestTimestamps(src, dest, err => {
    if (err) return cb(err)
    return setDestMode(dest, srcMode, cb)
  })
}

function setDestMode (dest, srcMode, cb) {
  return fs.chmod(dest, srcMode, cb)
}

function setDestTimestamps (src, dest, cb) {
  // The initial srcStat.atime cannot be trusted
  // because it is modified by the read(2) system call
  // (See https://nodejs.org/api/fs.html#fs_stat_time_values)
  fs.stat(src, (err, updatedSrcStat) => {
    if (err) return cb(err)
    return utimesMillis(dest, updatedSrcStat.atime, updatedSrcStat.mtime, cb)
  })
}

function onDir (srcStat, destStat, src, dest, opts, cb) {
  if (!destStat) return mkDirAndCopy(srcStat.mode, src, dest, opts, cb)
  if (destStat && !destStat.isDirectory()) {
    return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`))
  }
  return copyDir(src, dest, opts, cb)
}

function mkDirAndCopy (srcMode, src, dest, opts, cb) {
  fs.mkdir(dest, err => {
    if (err) return cb(err)
    copyDir(src, dest, opts, err => {
      if (err) return cb(err)
      return setDestMode(dest, srcMode, cb)
    })
  })
}

function copyDir (src, dest, opts, cb) {
  fs.readdir(src, (err, items) => {
    if (err) return cb(err)
    return copyDirItems(items, src, dest, opts, cb)
  })
}

function copyDirItems (items, src, dest, opts, cb) {
  const item = items.pop()
  if (!item) return cb()
  return copyDirItem(items, item, src, dest, opts, cb)
}

function copyDirItem (items, item, src, dest, opts, cb) {
  const srcItem = path.join(src, item)
  const destItem = path.join(dest, item)
  stat.checkPaths(srcItem, destItem, 'copy', (err, stats) => {
    if (err) return cb(err)
    const { destStat } = stats
    startCopy(destStat, srcItem, destItem, opts, err => {
      if (err) return cb(err)
      return copyDirItems(items, src, dest, opts, cb)
    })
  })
}

function onLink (destStat, src, dest, opts, cb) {
  fs.readlink(src, (err, resolvedSrc) => {
    if (err) return cb(err)
    if (opts.dereference) {
      resolvedSrc = path.resolve(process.cwd(), resolvedSrc)
    }

    if (!destStat) {
      return fs.symlink(resolvedSrc, dest, cb)
    } else {
      fs.readlink(dest, (err, resolvedDest) => {
        if (err) {
          // dest exists and is a regular file or directory,
          // Windows may throw UNKNOWN error. If dest already exists,
          // fs throws error anyway, so no need to guard against it here.
          if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return fs.symlink(resolvedSrc, dest, cb)
          return cb(err)
        }
        if (opts.dereference) {
          resolvedDest = path.resolve(process.cwd(), resolvedDest)
        }
        if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) {
          return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`))
        }

        // do not copy if src is a subdir of dest since unlinking
        // dest in this case would result in removing src contents
        // and therefore a broken symlink would be created.
        if (destStat.isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) {
          return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`))
        }
        return copyLink(resolvedSrc, dest, cb)
      })
    }
  })
}

function copyLink (resolvedSrc, dest, cb) {
  fs.unlink(dest, err => {
    if (err) return cb(err)
    return fs.symlink(resolvedSrc, dest, cb)
  })
}

module.exports = copy


/***/ }),
/* 596 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSummary = void 0;
const rest_1 = __webpack_require__(889);
const slugify_1 = __importDefault(__webpack_require__(178));
const fs_extra_1 = __webpack_require__(226);
const js_yaml_1 = __webpack_require__(414);
const path_1 = __webpack_require__(622);
exports.generateSummary = async () => {
    const config = js_yaml_1.safeLoad(await fs_extra_1.readFile(path_1.join(".", ".upptimerc.yml"), "utf8"));
    const owner = config.owner;
    const repo = config.repo;
    const octokit = new rest_1.Octokit({
        auth: config.PAT || process.env.GH_PAT || process.env.GITHUB_TOKEN,
        userAgent: config.userAgent || process.env.USER_AGENT || "KojBot",
    });
    let readmeContent = await fs_extra_1.readFile(path_1.join(".", "README.md"), "utf8");
    const startText = readmeContent.split("<!--start: status pages-->")[0];
    const endText = readmeContent.split("<!--end: status pages-->")[1];
    const pageStatuses = [];
    let numberOfDown = 0;
    for await (const site of config.sites) {
        const slug = slugify_1.default(site.name);
        let startTime = new Date().toISOString();
        try {
            startTime =
                ((await fs_extra_1.readFile(path_1.join(".", "history", `${slug}.yml`), "utf8"))
                    .split("\n")
                    .find((line) => line.toLocaleLowerCase().includes("- starttime")) || "")
                    .split("startTime:")[1]
                    .trim() || new Date().toISOString();
        }
        catch (error) { }
        let secondsDown = 0;
        const history = await octokit.repos.listCommits({
            owner,
            repo,
            path: `history/${slug}.yml`,
            per_page: 100,
        });
        const issues = await octokit.issues.listForRepo({
            owner,
            repo,
            labels: slug,
            filter: "all",
            per_page: 100,
        });
        issues.data.forEach((issue) => {
            if (issue.closed_at)
                secondsDown += Math.floor((new Date(issue.closed_at).getTime() - new Date(issue.created_at).getTime()) / 1000);
            else
                secondsDown += Math.floor((new Date().getTime() - new Date(issue.created_at).getTime()) / 1000);
        });
        const uptime = (100 -
            100 * (secondsDown / ((new Date().getTime() - new Date(startTime).getTime()) / 1000))).toFixed(2);
        if (!history.data.length)
            continue;
        const averageTime = history.data
            .filter((item) => item.commit.message.includes(" in ") &&
            Number(item.commit.message.split(" in ")[1].split("ms")[0]) !== 0 &&
            !isNaN(Number(item.commit.message.split(" in ")[1].split("ms")[0])))
            .map((item) => Number(item.commit.message.split(" in ")[1].split("ms")[0]))
            .reduce((p, c) => p + c, 0) / history.data.length;
        const status = history.data[0].commit.message.split(" ")[0].includes("🟩") ? "up" : "down";
        pageStatuses.push({
            name: site.name,
            url: site.url,
            slug,
            status,
            uptime,
            time: Math.floor(averageTime),
        });
        if (status === "down") {
            numberOfDown++;
        }
    }
    if (readmeContent.includes("<!--start: status pages-->")) {
        readmeContent = `${startText}<!--start: status pages-->
| URL | Status | History | Response Time | Uptime |
| --- | ------ | ------- | ------------- | ------ |
${pageStatuses
            .map((page) => `| ${page.url.startsWith("$") ? page.name : `[${page.name}](${page.url})`} | ${page.status === "up" ? "🟩 Up" : "🟥 Down"} | [${page.slug}.yml](https://github.com/${owner}/${repo}/commits/master/history/${page.slug}.yml) | <img alt="Response time graph" src="./graphs/${page.slug}.png" height="20"> ${page.time}ms | ![Uptime ${page.uptime}%](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2F${owner}%2F${repo}%2Fmaster%2Fapi%2F${page.slug}%2Fuptime.json)`)
            .join("\n")}
<!--end: status pages-->${endText}`;
    }
    // Add live status line
    readmeContent = readmeContent
        .split("\n")
        .map((line) => {
        if (line.includes("<!--live status-->")) {
            line = `${line.split("<!--live status-->")[0]}<!--live status--> **${numberOfDown === 0
                ? "🟩 All systems operational"
                : numberOfDown === config.sites.length
                    ? "🟥 Complete outage"
                    : "🟨 Partial outage"}**`;
        }
        return line;
    })
        .join("\n");
    const sha = (await octokit.repos.getContent({
        owner,
        repo,
        path: "README.md",
    })).data.sha;
    await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: "README.md",
        message: ":pencil: Update summary in README [skip ci]",
        content: Buffer.from(readmeContent).toString("base64"),
        sha,
    });
    let summarySha = undefined;
    try {
        summarySha = (await octokit.repos.getContent({
            owner,
            repo,
            path: "history/summary.json",
        })).data.sha;
    }
    catch (error) { }
    await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: "history/summary.json",
        message: ":card_file_box: Update status summary [skip ci]",
        content: Buffer.from(JSON.stringify(pageStatuses, null, 2)).toString("base64"),
        sha: summarySha,
    });
};


/***/ }),
/* 597 */,
/* 598 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var fs = __webpack_require__(747)
var polyfills = __webpack_require__(250)
var legacy = __webpack_require__(93)
var clone = __webpack_require__(608)

var util = __webpack_require__(669)

/* istanbul ignore next - node 0.x polyfill */
var gracefulQueue
var previousSymbol

/* istanbul ignore else - node 0.x polyfill */
if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
  gracefulQueue = Symbol.for('graceful-fs.queue')
  // This is used in testing by future versions
  previousSymbol = Symbol.for('graceful-fs.previous')
} else {
  gracefulQueue = '___graceful-fs.queue'
  previousSymbol = '___graceful-fs.previous'
}

function noop () {}

function publishQueue(context, queue) {
  Object.defineProperty(context, gracefulQueue, {
    get: function() {
      return queue
    }
  })
}

var debug = noop
if (util.debuglog)
  debug = util.debuglog('gfs4')
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  debug = function() {
    var m = util.format.apply(util, arguments)
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ')
    console.error(m)
  }

// Once time initialization
if (!fs[gracefulQueue]) {
  // This queue can be shared by multiple loaded instances
  var queue = global[gracefulQueue] || []
  publishQueue(fs, queue)

  // Patch fs.close/closeSync to shared queue version, because we need
  // to retry() whenever a close happens *anywhere* in the program.
  // This is essential when multiple graceful-fs instances are
  // in play at the same time.
  fs.close = (function (fs$close) {
    function close (fd, cb) {
      return fs$close.call(fs, fd, function (err) {
        // This function uses the graceful-fs shared queue
        if (!err) {
          retry()
        }

        if (typeof cb === 'function')
          cb.apply(this, arguments)
      })
    }

    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    })
    return close
  })(fs.close)

  fs.closeSync = (function (fs$closeSync) {
    function closeSync (fd) {
      // This function uses the graceful-fs shared queue
      fs$closeSync.apply(fs, arguments)
      retry()
    }

    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    })
    return closeSync
  })(fs.closeSync)

  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
    process.on('exit', function() {
      debug(fs[gracefulQueue])
      __webpack_require__(357).equal(fs[gracefulQueue].length, 0)
    })
  }
}

if (!global[gracefulQueue]) {
  publishQueue(global, fs[gracefulQueue]);
}

module.exports = patch(clone(fs))
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
    module.exports = patch(fs)
    fs.__patched = true;
}

function patch (fs) {
  // Everything that references the open() function needs to be in here
  polyfills(fs)
  fs.gracefulify = patch

  fs.createReadStream = createReadStream
  fs.createWriteStream = createWriteStream
  var fs$readFile = fs.readFile
  fs.readFile = readFile
  function readFile (path, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null

    return go$readFile(path, options, cb)

    function go$readFile (path, options, cb) {
      return fs$readFile(path, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$readFile, [path, options, cb]])
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments)
          retry()
        }
      })
    }
  }

  var fs$writeFile = fs.writeFile
  fs.writeFile = writeFile
  function writeFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null

    return go$writeFile(path, data, options, cb)

    function go$writeFile (path, data, options, cb) {
      return fs$writeFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$writeFile, [path, data, options, cb]])
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments)
          retry()
        }
      })
    }
  }

  var fs$appendFile = fs.appendFile
  if (fs$appendFile)
    fs.appendFile = appendFile
  function appendFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null

    return go$appendFile(path, data, options, cb)

    function go$appendFile (path, data, options, cb) {
      return fs$appendFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$appendFile, [path, data, options, cb]])
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments)
          retry()
        }
      })
    }
  }

  var fs$readdir = fs.readdir
  fs.readdir = readdir
  function readdir (path, options, cb) {
    var args = [path]
    if (typeof options !== 'function') {
      args.push(options)
    } else {
      cb = options
    }
    args.push(go$readdir$cb)

    return go$readdir(args)

    function go$readdir$cb (err, files) {
      if (files && files.sort)
        files.sort()

      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
        enqueue([go$readdir, [args]])

      else {
        if (typeof cb === 'function')
          cb.apply(this, arguments)
        retry()
      }
    }
  }

  function go$readdir (args) {
    return fs$readdir.apply(fs, args)
  }

  if (process.version.substr(0, 4) === 'v0.8') {
    var legStreams = legacy(fs)
    ReadStream = legStreams.ReadStream
    WriteStream = legStreams.WriteStream
  }

  var fs$ReadStream = fs.ReadStream
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype)
    ReadStream.prototype.open = ReadStream$open
  }

  var fs$WriteStream = fs.WriteStream
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype)
    WriteStream.prototype.open = WriteStream$open
  }

  Object.defineProperty(fs, 'ReadStream', {
    get: function () {
      return ReadStream
    },
    set: function (val) {
      ReadStream = val
    },
    enumerable: true,
    configurable: true
  })
  Object.defineProperty(fs, 'WriteStream', {
    get: function () {
      return WriteStream
    },
    set: function (val) {
      WriteStream = val
    },
    enumerable: true,
    configurable: true
  })

  // legacy names
  var FileReadStream = ReadStream
  Object.defineProperty(fs, 'FileReadStream', {
    get: function () {
      return FileReadStream
    },
    set: function (val) {
      FileReadStream = val
    },
    enumerable: true,
    configurable: true
  })
  var FileWriteStream = WriteStream
  Object.defineProperty(fs, 'FileWriteStream', {
    get: function () {
      return FileWriteStream
    },
    set: function (val) {
      FileWriteStream = val
    },
    enumerable: true,
    configurable: true
  })

  function ReadStream (path, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments)
  }

  function ReadStream$open () {
    var that = this
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy()

        that.emit('error', err)
      } else {
        that.fd = fd
        that.emit('open', fd)
        that.read()
      }
    })
  }

  function WriteStream (path, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments)
  }

  function WriteStream$open () {
    var that = this
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        that.destroy()
        that.emit('error', err)
      } else {
        that.fd = fd
        that.emit('open', fd)
      }
    })
  }

  function createReadStream (path, options) {
    return new fs.ReadStream(path, options)
  }

  function createWriteStream (path, options) {
    return new fs.WriteStream(path, options)
  }

  var fs$open = fs.open
  fs.open = open
  function open (path, flags, mode, cb) {
    if (typeof mode === 'function')
      cb = mode, mode = null

    return go$open(path, flags, mode, cb)

    function go$open (path, flags, mode, cb) {
      return fs$open(path, flags, mode, function (err, fd) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$open, [path, flags, mode, cb]])
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments)
          retry()
        }
      })
    }
  }

  return fs
}

function enqueue (elem) {
  debug('ENQUEUE', elem[0].name, elem[1])
  fs[gracefulQueue].push(elem)
}

function retry () {
  var elem = fs[gracefulQueue].shift()
  if (elem) {
    debug('RETRY', elem[0].name, elem[1])
    elem[0].apply(null, elem[1])
  }
}


/***/ }),
/* 599 */,
/* 600 */,
/* 601 */,
/* 602 */,
/* 603 */,
/* 604 */,
/* 605 */
/***/ (function(module) {

module.exports = require("http");

/***/ }),
/* 606 */,
/* 607 */,
/* 608 */
/***/ (function(module) {

"use strict";


module.exports = clone

function clone (obj) {
  if (obj === null || typeof obj !== 'object')
    return obj

  if (obj instanceof Object)
    var copy = { __proto__: obj.__proto__ }
  else
    var copy = Object.create(null)

  Object.getOwnPropertyNames(obj).forEach(function (key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key))
  })

  return copy
}


/***/ }),
/* 609 */,
/* 610 */,
/* 611 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
// Standard YAML's Core schema.
// http://www.yaml.org/spec/1.2/spec.html#id2804923
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, Core schema has no distinctions from JSON schema is JS-YAML.





var Schema = __webpack_require__(733);


module.exports = new Schema({
  include: [
    __webpack_require__(23)
  ]
});


/***/ }),
/* 612 */,
/* 613 */,
/* 614 */
/***/ (function(module) {

module.exports = require("events");

/***/ }),
/* 615 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const u = __webpack_require__(676).fromCallback
const fs = __webpack_require__(598)
const path = __webpack_require__(622)
const mkdir = __webpack_require__(727)
const remove = __webpack_require__(723)

const emptyDir = u(function emptyDir (dir, callback) {
  callback = callback || function () {}
  fs.readdir(dir, (err, items) => {
    if (err) return mkdir.mkdirs(dir, callback)

    items = items.map(item => path.join(dir, item))

    deleteItem()

    function deleteItem () {
      const item = items.pop()
      if (!item) return callback()
      remove.remove(item, err => {
        if (err) return callback(err)
        deleteItem()
      })
    }
  })
})

function emptyDirSync (dir) {
  let items
  try {
    items = fs.readdirSync(dir)
  } catch {
    return mkdir.mkdirsSync(dir)
  }

  items.forEach(item => {
    item = path.join(dir, item)
    remove.removeSync(item)
  })
}

module.exports = {
  emptyDirSync,
  emptydirSync: emptyDirSync,
  emptyDir,
  emptydir: emptyDir
}


/***/ }),
/* 616 */,
/* 617 */,
/* 618 */,
/* 619 */
/***/ (function(module) {

module.exports = require("constants");

/***/ }),
/* 620 */,
/* 621 */,
/* 622 */
/***/ (function(module) {

module.exports = require("path");

/***/ }),
/* 623 */
/***/ (function(module) {

"use strict";


const matchOperatorsRegex = /[|\\{}()[\]^$+*?.-]/g;

module.exports = string => {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string');
	}

	return string.replace(matchOperatorsRegex, '\\$&');
};


/***/ }),
/* 624 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlPush = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/eab2f95c0de94e9816c8a6110d20673761dd97a4/include/curl/multi.h#L426-L435
/**
 * Object with constants to be used as the return value for the {@link "Multi".Multi.setOpt | `Multi`} option `PUSHFUNCTION`.
 *
 * `CURL_PUSH_OK` becomes `CurlPush.Ok`
 *
 * @public
 */
var CurlPush;
(function (CurlPush) {
    CurlPush[CurlPush["Ok"] = 0] = "Ok";
    CurlPush[CurlPush["Deny"] = 1] = "Deny";
})(CurlPush = exports.CurlPush || (exports.CurlPush = {}));
//# sourceMappingURL=CurlPush.js.map

/***/ }),
/* 625 */,
/* 626 */,
/* 627 */,
/* 628 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const { stringify } = __webpack_require__(356)
const { outputFileSync } = __webpack_require__(517)

function outputJsonSync (file, data, options) {
  const str = stringify(data, options)

  outputFileSync(file, str, options)
}

module.exports = outputJsonSync


/***/ }),
/* 629 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var Type = __webpack_require__(945);

function resolveJavascriptRegExp(data) {
  if (data === null) return false;
  if (data.length === 0) return false;

  var regexp = data,
      tail   = /\/([gim]*)$/.exec(data),
      modifiers = '';

  // if regexp starts with '/' it can have modifiers and must be properly closed
  // `/foo/gim` - modifiers tail can be maximum 3 chars
  if (regexp[0] === '/') {
    if (tail) modifiers = tail[1];

    if (modifiers.length > 3) return false;
    // if expression starts with /, is should be properly terminated
    if (regexp[regexp.length - modifiers.length - 1] !== '/') return false;
  }

  return true;
}

function constructJavascriptRegExp(data) {
  var regexp = data,
      tail   = /\/([gim]*)$/.exec(data),
      modifiers = '';

  // `/foo/gim` - tail can be maximum 4 chars
  if (regexp[0] === '/') {
    if (tail) modifiers = tail[1];
    regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
  }

  return new RegExp(regexp, modifiers);
}

function representJavascriptRegExp(object /*, style*/) {
  var result = '/' + object.source + '/';

  if (object.global) result += 'g';
  if (object.multiline) result += 'm';
  if (object.ignoreCase) result += 'i';

  return result;
}

function isRegExp(object) {
  return Object.prototype.toString.call(object) === '[object RegExp]';
}

module.exports = new Type('tag:yaml.org,2002:js/regexp', {
  kind: 'scalar',
  resolve: resolveJavascriptRegExp,
  construct: constructJavascriptRegExp,
  predicate: isRegExp,
  represent: representJavascriptRegExp
});


/***/ }),
/* 630 */,
/* 631 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),
/* 632 */,
/* 633 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var Type = __webpack_require__(945);

function resolveYamlMerge(data) {
  return data === '<<' || data === null;
}

module.exports = new Type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});


/***/ }),
/* 634 */,
/* 635 */,
/* 636 */,
/* 637 */,
/* 638 */,
/* 639 */,
/* 640 */,
/* 641 */,
/* 642 */,
/* 643 */,
/* 644 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlVersion = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * Object with constants for use with the `rawFeatures` member
 *  of {@link CurlVersionInfoNativeBindingObject | `CurlVersionInfoNativeBindingObject`}, which is returned
 *  from {@link Curl.getVersionInfo | `Curl.getVersionInfo`}.
 *
 * `CURL_VERSION_IPV6` becomes `CurlVersion.Ipv6`
 * `CURL_VERSION_GSSNEGOTIATE` becomes `CurlVersion.GssNegotiate`
 * ...
 *
 * @public
 */
var CurlVersion;
(function (CurlVersion) {
    /**
     * IPv6-enabled
     */
    CurlVersion[CurlVersion["Ipv6"] = 1] = "Ipv6";
    /**
     * Kerberos V4 auth is supported (deprecated)
     */
    CurlVersion[CurlVersion["Kerberos4"] = 2] = "Kerberos4";
    /**
     * SSL options are present
     */
    CurlVersion[CurlVersion["Ssl"] = 4] = "Ssl";
    /**
     * libz features are present
     */
    CurlVersion[CurlVersion["Libz"] = 8] = "Libz";
    /**
     * NTLM auth is supported
     */
    CurlVersion[CurlVersion["Ntlm"] = 16] = "Ntlm";
    /**
     * Negotiate auth is supported (deprecated)
     */
    CurlVersion[CurlVersion["GssNegotiate"] = 32] = "GssNegotiate";
    /**
     * libcurl was built with debug capabilities
     */
    CurlVersion[CurlVersion["Debug"] = 64] = "Debug";
    /**
     * Asynchronous DNS resolver is available
     */
    CurlVersion[CurlVersion["AsynchDns"] = 128] = "AsynchDns";
    /**
     * SPNEGO auth is supported
     */
    CurlVersion[CurlVersion["Spnego"] = 256] = "Spnego";
    /**
     * Supports files larger than 2GB
     */
    CurlVersion[CurlVersion["LargeFile"] = 512] = "LargeFile";
    /**
     * Internationized Domain Names are supported
     */
    CurlVersion[CurlVersion["Idn"] = 1024] = "Idn";
    /**
     * Built against Windows SSPI
     */
    CurlVersion[CurlVersion["Sspi"] = 2048] = "Sspi";
    /**
     * Character conversions supported
     */
    CurlVersion[CurlVersion["Conv"] = 4096] = "Conv";
    /**
     * Debug memory tracking supported
     */
    CurlVersion[CurlVersion["CurlDebug"] = 8192] = "CurlDebug";
    /**
     * TLS-SRP auth is supported
     */
    CurlVersion[CurlVersion["TlsAuthSrp"] = 16384] = "TlsAuthSrp";
    /**
     * NTLM delegation to winbind helper is supported
     */
    CurlVersion[CurlVersion["NtlmWb"] = 32768] = "NtlmWb";
    /**
     * HTTP2 support built-in
     */
    CurlVersion[CurlVersion["Http2"] = 65536] = "Http2";
    /**
     * Built against a GSS-API library
     */
    CurlVersion[CurlVersion["GssApi"] = 131072] = "GssApi";
    /**
     * Kerberos V5 auth is supported
     */
    CurlVersion[CurlVersion["Kerberos5"] = 262144] = "Kerberos5";
    /**
     * Unix domain sockets support
     */
    CurlVersion[CurlVersion["UnixSockets"] = 524288] = "UnixSockets";
    /**
     * Mozilla's Public Suffix List, used for cookie domain verification
     */
    CurlVersion[CurlVersion["Psl"] = 1048576] = "Psl";
    /**
     * HTTPS-proxy support built-in
     */
    CurlVersion[CurlVersion["HttpsProxy"] = 2097152] = "HttpsProxy";
    /**
     * Multiple SSL backends available
     */
    CurlVersion[CurlVersion["MultiSsl"] = 4194304] = "MultiSsl";
    /**
     * Brotli features are present.
     */
    CurlVersion[CurlVersion["Brotli"] = 8388608] = "Brotli";
    /**
     * Alt-Svc handling built-in
     */
    CurlVersion[CurlVersion["AltSvc"] = 16777216] = "AltSvc";
    /**
     * HTTP3 support built-in
     */
    CurlVersion[CurlVersion["Http3"] = 33554432] = "Http3";
})(CurlVersion = exports.CurlVersion || (exports.CurlVersion = {}));
//# sourceMappingURL=CurlVersion.js.map

/***/ }),
/* 645 */,
/* 646 */,
/* 647 */,
/* 648 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const deburr = __webpack_require__(257);
const escapeStringRegexp = __webpack_require__(623);
const builtinReplacements = __webpack_require__(419);

const doCustomReplacements = (string, replacements) => {
	for (const [key, value] of replacements) {
		// TODO: Use `String#replaceAll()` when targeting Node.js 16.
		string = string.replace(new RegExp(escapeStringRegexp(key), 'g'), value);
	}

	return string;
};

module.exports = (string, options) => {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a string, got \`${typeof string}\``);
	}

	options = {
		customReplacements: [],
		...options
	};

	const customReplacements = new Map([
		...builtinReplacements,
		...options.customReplacements
	]);

	string = string.normalize();
	string = doCustomReplacements(string, customReplacements);
	string = deburr(string);

	return string;
};


/***/ }),
/* 649 */,
/* 650 */,
/* 651 */,
/* 652 */,
/* 653 */,
/* 654 */
/***/ (function(module) {

// This is not the set of all possible signals.
//
// It IS, however, the set of all signals that trigger
// an exit on either Linux or BSD systems.  Linux is a
// superset of the signal names supported on BSD, and
// the unknown signals just fail to register, so we can
// catch that easily enough.
//
// Don't bother with SIGKILL.  It's uncatchable, which
// means that we can't fire any callbacks anyway.
//
// If a user does happen to register a handler on a non-
// fatal signal like SIGWINCH or something, and then
// exit, it'll end up firing `process.emit('exit')`, so
// the handler will be fired anyway.
//
// SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
// artificially, inherently leave the process in a
// state from which it is not safe to try and enter JS
// listeners.
module.exports = [
  'SIGABRT',
  'SIGALRM',
  'SIGHUP',
  'SIGINT',
  'SIGTERM'
]

if (process.platform !== 'win32') {
  module.exports.push(
    'SIGVTALRM',
    'SIGXCPU',
    'SIGXFSZ',
    'SIGUSR2',
    'SIGTRAP',
    'SIGSYS',
    'SIGQUIT',
    'SIGIOT'
    // should detect profiler and enable/disable accordingly.
    // see #21
    // 'SIGPROF'
  )
}

if (process.platform === 'linux') {
  module.exports.push(
    'SIGIO',
    'SIGPOLL',
    'SIGPWR',
    'SIGSTKFLT',
    'SIGUNUSED'
  )
}


/***/ }),
/* 655 */,
/* 656 */,
/* 657 */,
/* 658 */,
/* 659 */,
/* 660 */,
/* 661 */,
/* 662 */,
/* 663 */,
/* 664 */,
/* 665 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlChunk = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be82545348/include/curl/curl.h#L318
/**
 * Object to be used as the return value for the callbacks set
 *  with the options `CHUNK_BGN_FUNCTION` and `CHUNK_END_FUNCTION`.
 *
 * `CURL_CHUNK_BGN_FUNC_OK` becomes `CurlChunk.BgnFuncOk`
 *
 * @public
 */
var CurlChunk;
(function (CurlChunk) {
    CurlChunk[CurlChunk["BgnFuncOk"] = 0] = "BgnFuncOk";
    CurlChunk[CurlChunk["BgnFuncFail"] = 1] = "BgnFuncFail";
    CurlChunk[CurlChunk["BgnFuncSkip"] = 2] = "BgnFuncSkip";
    CurlChunk[CurlChunk["EndFuncOk"] = 0] = "EndFuncOk";
    CurlChunk[CurlChunk["EndFuncFail"] = 1] = "EndFuncFail";
})(CurlChunk = exports.CurlChunk || (exports.CurlChunk = {}));
//# sourceMappingURL=CurlChunk.js.map

/***/ }),
/* 666 */
/***/ (function(module, __unusedexports, __webpack_require__) {

let _fs
try {
  _fs = __webpack_require__(598)
} catch (_) {
  _fs = __webpack_require__(747)
}
const universalify = __webpack_require__(676)
const { stringify, stripBom } = __webpack_require__(356)

async function _readFile (file, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options }
  }

  const fs = options.fs || _fs

  const shouldThrow = 'throws' in options ? options.throws : true

  let data = await universalify.fromCallback(fs.readFile)(file, options)

  data = stripBom(data)

  let obj
  try {
    obj = JSON.parse(data, options ? options.reviver : null)
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`
      throw err
    } else {
      return null
    }
  }

  return obj
}

const readFile = universalify.fromPromise(_readFile)

function readFileSync (file, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options }
  }

  const fs = options.fs || _fs

  const shouldThrow = 'throws' in options ? options.throws : true

  try {
    let content = fs.readFileSync(file, options)
    content = stripBom(content)
    return JSON.parse(content, options.reviver)
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`
      throw err
    } else {
      return null
    }
  }
}

async function _writeFile (file, obj, options = {}) {
  const fs = options.fs || _fs

  const str = stringify(obj, options)

  await universalify.fromCallback(fs.writeFile)(file, str, options)
}

const writeFile = universalify.fromPromise(_writeFile)

function writeFileSync (file, obj, options = {}) {
  const fs = options.fs || _fs

  const str = stringify(obj, options)
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

const jsonfile = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync
}

module.exports = jsonfile


/***/ }),
/* 667 */,
/* 668 */,
/* 669 */
/***/ (function(module) {

module.exports = require("util");

/***/ }),
/* 670 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);
var settle = __webpack_require__(564);
var buildFullPath = __webpack_require__(960);
var buildURL = __webpack_require__(133);
var http = __webpack_require__(605);
var https = __webpack_require__(34);
var httpFollow = __webpack_require__(549).http;
var httpsFollow = __webpack_require__(549).https;
var url = __webpack_require__(835);
var zlib = __webpack_require__(761);
var pkg = __webpack_require__(361);
var createError = __webpack_require__(26);
var enhanceError = __webpack_require__(369);

var isHttps = /https:?/;

/*eslint consistent-return:0*/
module.exports = function httpAdapter(config) {
  return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
    var resolve = function resolve(value) {
      resolvePromise(value);
    };
    var reject = function reject(value) {
      rejectPromise(value);
    };
    var data = config.data;
    var headers = config.headers;

    // Set User-Agent (required by some servers)
    // Only set header if it hasn't been set in config
    // See https://github.com/axios/axios/issues/69
    if (!headers['User-Agent'] && !headers['user-agent']) {
      headers['User-Agent'] = 'axios/' + pkg.version;
    }

    if (data && !utils.isStream(data)) {
      if (Buffer.isBuffer(data)) {
        // Nothing to do...
      } else if (utils.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils.isString(data)) {
        data = Buffer.from(data, 'utf-8');
      } else {
        return reject(createError(
          'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
          config
        ));
      }

      // Add Content-Length header if data exists
      headers['Content-Length'] = data.length;
    }

    // HTTP basic authentication
    var auth = undefined;
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      auth = username + ':' + password;
    }

    // Parse url
    var fullPath = buildFullPath(config.baseURL, config.url);
    var parsed = url.parse(fullPath);
    var protocol = parsed.protocol || 'http:';

    if (!auth && parsed.auth) {
      var urlAuth = parsed.auth.split(':');
      var urlUsername = urlAuth[0] || '';
      var urlPassword = urlAuth[1] || '';
      auth = urlUsername + ':' + urlPassword;
    }

    if (auth) {
      delete headers.Authorization;
    }

    var isHttpsRequest = isHttps.test(protocol);
    var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;

    var options = {
      path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ''),
      method: config.method.toUpperCase(),
      headers: headers,
      agent: agent,
      agents: { http: config.httpAgent, https: config.httpsAgent },
      auth: auth
    };

    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname;
      options.port = parsed.port;
    }

    var proxy = config.proxy;
    if (!proxy && proxy !== false) {
      var proxyEnv = protocol.slice(0, -1) + '_proxy';
      var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
      if (proxyUrl) {
        var parsedProxyUrl = url.parse(proxyUrl);
        var noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
        var shouldProxy = true;

        if (noProxyEnv) {
          var noProxy = noProxyEnv.split(',').map(function trim(s) {
            return s.trim();
          });

          shouldProxy = !noProxy.some(function proxyMatch(proxyElement) {
            if (!proxyElement) {
              return false;
            }
            if (proxyElement === '*') {
              return true;
            }
            if (proxyElement[0] === '.' &&
                parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement) {
              return true;
            }

            return parsed.hostname === proxyElement;
          });
        }


        if (shouldProxy) {
          proxy = {
            host: parsedProxyUrl.hostname,
            port: parsedProxyUrl.port
          };

          if (parsedProxyUrl.auth) {
            var proxyUrlAuth = parsedProxyUrl.auth.split(':');
            proxy.auth = {
              username: proxyUrlAuth[0],
              password: proxyUrlAuth[1]
            };
          }
        }
      }
    }

    if (proxy) {
      options.hostname = proxy.host;
      options.host = proxy.host;
      options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
      options.port = proxy.port;
      options.path = protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path;

      // Basic proxy authorization
      if (proxy.auth) {
        var base64 = Buffer.from(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
        options.headers['Proxy-Authorization'] = 'Basic ' + base64;
      }
    }

    var transport;
    var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsProxy ? https : http;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      transport = isHttpsProxy ? httpsFollow : httpFollow;
    }

    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    }

    // Create the request
    var req = transport.request(options, function handleResponse(res) {
      if (req.aborted) return;

      // uncompress the response body transparently if required
      var stream = res;

      // return the last request in case of redirects
      var lastRequest = res.req || req;


      // if no content, is HEAD request or decompress disabled we should not decompress
      if (res.statusCode !== 204 && lastRequest.method !== 'HEAD' && config.decompress !== false) {
        switch (res.headers['content-encoding']) {
        /*eslint default-case:0*/
        case 'gzip':
        case 'compress':
        case 'deflate':
        // add the unzipper to the body stream processing pipeline
          stream = stream.pipe(zlib.createUnzip());

          // remove the content-encoding in order to not confuse downstream operations
          delete res.headers['content-encoding'];
          break;
        }
      }

      var response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
        config: config,
        request: lastRequest
      };

      if (config.responseType === 'stream') {
        response.data = stream;
        settle(resolve, reject, response);
      } else {
        var responseBuffer = [];
        stream.on('data', function handleStreamData(chunk) {
          responseBuffer.push(chunk);

          // make sure the content length is not over the maxContentLength if specified
          if (config.maxContentLength > -1 && Buffer.concat(responseBuffer).length > config.maxContentLength) {
            stream.destroy();
            reject(createError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
              config, null, lastRequest));
          }
        });

        stream.on('error', function handleStreamError(err) {
          if (req.aborted) return;
          reject(enhanceError(err, config, null, lastRequest));
        });

        stream.on('end', function handleStreamEnd() {
          var responseData = Buffer.concat(responseBuffer);
          if (config.responseType !== 'arraybuffer') {
            responseData = responseData.toString(config.responseEncoding);
            if (!config.responseEncoding || config.responseEncoding === 'utf8') {
              responseData = utils.stripBOM(responseData);
            }
          }

          response.data = responseData;
          settle(resolve, reject, response);
        });
      }
    });

    // Handle errors
    req.on('error', function handleRequestError(err) {
      if (req.aborted && err.code !== 'ERR_FR_TOO_MANY_REDIRECTS') return;
      reject(enhanceError(err, config, null, req));
    });

    // Handle request timeout
    if (config.timeout) {
      // Sometime, the response will be very slow, and does not respond, the connect event will be block by event loop system.
      // And timer callback will be fired, and abort() will be invoked before connection, then get "socket hang up" and code ECONNRESET.
      // At this time, if we have a large number of request, nodejs will hang up some socket on background. and the number will up and up.
      // And then these socket which be hang up will devoring CPU little by little.
      // ClientRequest.setTimeout will be fired on the specify milliseconds, and can make sure that abort() will be fired after connect.
      req.setTimeout(config.timeout, function handleRequestTimeout() {
        req.abort();
        reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', req));
      });
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (req.aborted) return;

        req.abort();
        reject(cancel);
      });
    }

    // Send the request
    if (utils.isStream(data)) {
      data.on('error', function handleStreamError(err) {
        reject(enhanceError(err, config, null, req));
      }).pipe(req);
    } else {
      req.end(data);
    }
  });
};


/***/ }),
/* 671 */,
/* 672 */,
/* 673 */,
/* 674 */,
/* 675 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const path = __webpack_require__(622);
const childProcess = __webpack_require__(129);
const crossSpawn = __webpack_require__(400);
const stripEof = __webpack_require__(768);
const npmRunPath = __webpack_require__(406);
const isStream = __webpack_require__(781);
const _getStream = __webpack_require__(760);
const pFinally = __webpack_require__(697);
const onExit = __webpack_require__(260);
const errname = __webpack_require__(418);
const stdio = __webpack_require__(151);

const TEN_MEGABYTES = 1000 * 1000 * 10;

function handleArgs(cmd, args, opts) {
	let parsed;

	opts = Object.assign({
		extendEnv: true,
		env: {}
	}, opts);

	if (opts.extendEnv) {
		opts.env = Object.assign({}, process.env, opts.env);
	}

	if (opts.__winShell === true) {
		delete opts.__winShell;
		parsed = {
			command: cmd,
			args,
			options: opts,
			file: cmd,
			original: {
				cmd,
				args
			}
		};
	} else {
		parsed = crossSpawn._parse(cmd, args, opts);
	}

	opts = Object.assign({
		maxBuffer: TEN_MEGABYTES,
		buffer: true,
		stripEof: true,
		preferLocal: true,
		localDir: parsed.options.cwd || process.cwd(),
		encoding: 'utf8',
		reject: true,
		cleanup: true
	}, parsed.options);

	opts.stdio = stdio(opts);

	if (opts.preferLocal) {
		opts.env = npmRunPath.env(Object.assign({}, opts, {cwd: opts.localDir}));
	}

	if (opts.detached) {
		// #115
		opts.cleanup = false;
	}

	if (process.platform === 'win32' && path.basename(parsed.command) === 'cmd.exe') {
		// #116
		parsed.args.unshift('/q');
	}

	return {
		cmd: parsed.command,
		args: parsed.args,
		opts,
		parsed
	};
}

function handleInput(spawned, input) {
	if (input === null || input === undefined) {
		return;
	}

	if (isStream(input)) {
		input.pipe(spawned.stdin);
	} else {
		spawned.stdin.end(input);
	}
}

function handleOutput(opts, val) {
	if (val && opts.stripEof) {
		val = stripEof(val);
	}

	return val;
}

function handleShell(fn, cmd, opts) {
	let file = '/bin/sh';
	let args = ['-c', cmd];

	opts = Object.assign({}, opts);

	if (process.platform === 'win32') {
		opts.__winShell = true;
		file = process.env.comspec || 'cmd.exe';
		args = ['/s', '/c', `"${cmd}"`];
		opts.windowsVerbatimArguments = true;
	}

	if (opts.shell) {
		file = opts.shell;
		delete opts.shell;
	}

	return fn(file, args, opts);
}

function getStream(process, stream, {encoding, buffer, maxBuffer}) {
	if (!process[stream]) {
		return null;
	}

	let ret;

	if (!buffer) {
		// TODO: Use `ret = util.promisify(stream.finished)(process[stream]);` when targeting Node.js 10
		ret = new Promise((resolve, reject) => {
			process[stream]
				.once('end', resolve)
				.once('error', reject);
		});
	} else if (encoding) {
		ret = _getStream(process[stream], {
			encoding,
			maxBuffer
		});
	} else {
		ret = _getStream.buffer(process[stream], {maxBuffer});
	}

	return ret.catch(err => {
		err.stream = stream;
		err.message = `${stream} ${err.message}`;
		throw err;
	});
}

function makeError(result, options) {
	const {stdout, stderr} = result;

	let err = result.error;
	const {code, signal} = result;

	const {parsed, joinedCmd} = options;
	const timedOut = options.timedOut || false;

	if (!err) {
		let output = '';

		if (Array.isArray(parsed.opts.stdio)) {
			if (parsed.opts.stdio[2] !== 'inherit') {
				output += output.length > 0 ? stderr : `\n${stderr}`;
			}

			if (parsed.opts.stdio[1] !== 'inherit') {
				output += `\n${stdout}`;
			}
		} else if (parsed.opts.stdio !== 'inherit') {
			output = `\n${stderr}${stdout}`;
		}

		err = new Error(`Command failed: ${joinedCmd}${output}`);
		err.code = code < 0 ? errname(code) : code;
	}

	err.stdout = stdout;
	err.stderr = stderr;
	err.failed = true;
	err.signal = signal || null;
	err.cmd = joinedCmd;
	err.timedOut = timedOut;

	return err;
}

function joinCmd(cmd, args) {
	let joinedCmd = cmd;

	if (Array.isArray(args) && args.length > 0) {
		joinedCmd += ' ' + args.join(' ');
	}

	return joinedCmd;
}

module.exports = (cmd, args, opts) => {
	const parsed = handleArgs(cmd, args, opts);
	const {encoding, buffer, maxBuffer} = parsed.opts;
	const joinedCmd = joinCmd(cmd, args);

	let spawned;
	try {
		spawned = childProcess.spawn(parsed.cmd, parsed.args, parsed.opts);
	} catch (err) {
		return Promise.reject(err);
	}

	let removeExitHandler;
	if (parsed.opts.cleanup) {
		removeExitHandler = onExit(() => {
			spawned.kill();
		});
	}

	let timeoutId = null;
	let timedOut = false;

	const cleanup = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}

		if (removeExitHandler) {
			removeExitHandler();
		}
	};

	if (parsed.opts.timeout > 0) {
		timeoutId = setTimeout(() => {
			timeoutId = null;
			timedOut = true;
			spawned.kill(parsed.opts.killSignal);
		}, parsed.opts.timeout);
	}

	const processDone = new Promise(resolve => {
		spawned.on('exit', (code, signal) => {
			cleanup();
			resolve({code, signal});
		});

		spawned.on('error', err => {
			cleanup();
			resolve({error: err});
		});

		if (spawned.stdin) {
			spawned.stdin.on('error', err => {
				cleanup();
				resolve({error: err});
			});
		}
	});

	function destroy() {
		if (spawned.stdout) {
			spawned.stdout.destroy();
		}

		if (spawned.stderr) {
			spawned.stderr.destroy();
		}
	}

	const handlePromise = () => pFinally(Promise.all([
		processDone,
		getStream(spawned, 'stdout', {encoding, buffer, maxBuffer}),
		getStream(spawned, 'stderr', {encoding, buffer, maxBuffer})
	]).then(arr => {
		const result = arr[0];
		result.stdout = arr[1];
		result.stderr = arr[2];

		if (result.error || result.code !== 0 || result.signal !== null) {
			const err = makeError(result, {
				joinedCmd,
				parsed,
				timedOut
			});

			// TODO: missing some timeout logic for killed
			// https://github.com/nodejs/node/blob/master/lib/child_process.js#L203
			// err.killed = spawned.killed || killed;
			err.killed = err.killed || spawned.killed;

			if (!parsed.opts.reject) {
				return err;
			}

			throw err;
		}

		return {
			stdout: handleOutput(parsed.opts, result.stdout),
			stderr: handleOutput(parsed.opts, result.stderr),
			code: 0,
			failed: false,
			killed: false,
			signal: null,
			cmd: joinedCmd,
			timedOut: false
		};
	}), destroy);

	crossSpawn._enoent.hookChildProcess(spawned, parsed.parsed);

	handleInput(spawned, parsed.opts.input);

	spawned.then = (onfulfilled, onrejected) => handlePromise().then(onfulfilled, onrejected);
	spawned.catch = onrejected => handlePromise().catch(onrejected);

	return spawned;
};

// TODO: set `stderr: 'ignore'` when that option is implemented
module.exports.stdout = (...args) => module.exports(...args).then(x => x.stdout);

// TODO: set `stdout: 'ignore'` when that option is implemented
module.exports.stderr = (...args) => module.exports(...args).then(x => x.stderr);

module.exports.shell = (cmd, opts) => handleShell(module.exports, cmd, opts);

module.exports.sync = (cmd, args, opts) => {
	const parsed = handleArgs(cmd, args, opts);
	const joinedCmd = joinCmd(cmd, args);

	if (isStream(parsed.opts.input)) {
		throw new TypeError('The `input` option cannot be a stream in sync mode');
	}

	const result = childProcess.spawnSync(parsed.cmd, parsed.args, parsed.opts);
	result.code = result.status;

	if (result.error || result.status !== 0 || result.signal !== null) {
		const err = makeError(result, {
			joinedCmd,
			parsed
		});

		if (!parsed.opts.reject) {
			return err;
		}

		throw err;
	}

	return {
		stdout: handleOutput(parsed.opts, result.stdout),
		stderr: handleOutput(parsed.opts, result.stderr),
		code: 0,
		failed: false,
		signal: null,
		cmd: joinedCmd,
		timedOut: false
	};
};

module.exports.shellSync = (cmd, opts) => handleShell(module.exports.sync, cmd, opts);


/***/ }),
/* 676 */
/***/ (function(__unusedmodule, exports) {

"use strict";


exports.fromCallback = function (fn) {
  return Object.defineProperty(function (...args) {
    if (typeof args[args.length - 1] === 'function') fn.apply(this, args)
    else {
      return new Promise((resolve, reject) => {
        fn.apply(
          this,
          args.concat([(err, res) => err ? reject(err) : resolve(res)])
        )
      })
    }
  }, 'name', { value: fn.name })
}

exports.fromPromise = function (fn) {
  return Object.defineProperty(function (...args) {
    const cb = args[args.length - 1]
    if (typeof cb !== 'function') return fn.apply(this, args)
    else fn.apply(this, args.slice(0, -1)).then(r => cb(null, r), cb)
  }, 'name', { value: fn.name })
}


/***/ }),
/* 677 */,
/* 678 */,
/* 679 */,
/* 680 */,
/* 681 */,
/* 682 */,
/* 683 */,
/* 684 */,
/* 685 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


/*eslint-disable no-use-before-define*/

var common              = __webpack_require__(740);
var YAMLException       = __webpack_require__(556);
var DEFAULT_FULL_SCHEMA = __webpack_require__(910);
var DEFAULT_SAFE_SCHEMA = __webpack_require__(830);

var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;

var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_EQUALS               = 0x3D; /* = */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';

var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (map === null) return {};

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }
    type = schema.compiledTypeMap['fallback'][tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}

function State(options) {
  this.schema        = options['schema'] || DEFAULT_FULL_SCHEMA;
  this.indent        = Math.max(1, (options['indent'] || 2));
  this.noArrayIndent = options['noArrayIndent'] || false;
  this.skipInvalid   = options['skipInvalid'] || false;
  this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys      = options['sortKeys'] || false;
  this.lineWidth     = options['lineWidth'] || 80;
  this.noRefs        = options['noRefs'] || false;
  this.noCompatMode  = options['noCompatMode'] || false;
  this.condenseFlow  = options['condenseFlow'] || false;

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';

  this.duplicates = [];
  this.usedDuplicates = null;
}

// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }

    if (line.length && line !== '\n') result += ind;

    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
}

// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}

// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
  return  (0x00020 <= c && c <= 0x00007E)
      || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
      || ((0x0E000 <= c && c <= 0x00FFFD) && c !== 0xFEFF /* BOM */)
      ||  (0x10000 <= c && c <= 0x10FFFF);
}

// [34] ns-char ::= nb-char - s-white
// [27] nb-char ::= c-printable - b-char - c-byte-order-mark
// [26] b-char  ::= b-line-feed | b-carriage-return
// [24] b-line-feed       ::=     #xA    /* LF */
// [25] b-carriage-return ::=     #xD    /* CR */
// [3]  c-byte-order-mark ::=     #xFEFF
function isNsChar(c) {
  return isPrintable(c) && !isWhitespace(c)
    // byte-order-mark
    && c !== 0xFEFF
    // b-char
    && c !== CHAR_CARRIAGE_RETURN
    && c !== CHAR_LINE_FEED;
}

// Simplified test for values allowed after the first character in plain style.
function isPlainSafe(c, prev) {
  // Uses a subset of nb-char - c-flow-indicator - ":" - "#"
  // where nb-char ::= c-printable - b-char - c-byte-order-mark.
  return isPrintable(c) && c !== 0xFEFF
    // - c-flow-indicator
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // - ":" - "#"
    // /* An ns-char preceding */ "#"
    && c !== CHAR_COLON
    && ((c !== CHAR_SHARP) || (prev && isNsChar(prev)));
}

// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  return isPrintable(c) && c !== 0xFEFF
    && !isWhitespace(c) // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    && c !== CHAR_MINUS
    && c !== CHAR_QUESTION
    && c !== CHAR_COLON
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    && c !== CHAR_SHARP
    && c !== CHAR_AMPERSAND
    && c !== CHAR_ASTERISK
    && c !== CHAR_EXCLAMATION
    && c !== CHAR_VERTICAL_LINE
    && c !== CHAR_EQUALS
    && c !== CHAR_GREATER_THAN
    && c !== CHAR_SINGLE_QUOTE
    && c !== CHAR_DOUBLE_QUOTE
    // | “%” | “@” | “`”)
    && c !== CHAR_PERCENT
    && c !== CHAR_COMMERCIAL_AT
    && c !== CHAR_GRAVE_ACCENT;
}

// Determines whether block indentation indicator is required.
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}

var STYLE_PLAIN   = 1,
    STYLE_SINGLE  = 2,
    STYLE_LITERAL = 3,
    STYLE_FOLDED  = 4,
    STYLE_DOUBLE  = 5;

// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
  var i;
  var char, prev_char;
  var hasLineBreak = false;
  var hasFoldableLine = false; // only checked if shouldTrackWidth
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1; // count the first line correctly
  var plain = isPlainSafeFirst(string.charCodeAt(0))
          && !isWhitespace(string.charCodeAt(string.length - 1));

  if (singleLineOnly) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; i++) {
      char = string.charCodeAt(i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      prev_char = i > 0 ? string.charCodeAt(i - 1) : null;
      plain = plain && isPlainSafe(char, prev_char);
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; i++) {
      char = string.charCodeAt(i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine ||
            // Foldable line = too long, and not more-indented.
            (i - previousLineBreak - 1 > lineWidth &&
             string[previousLineBreak + 1] !== ' ');
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      prev_char = i > 0 ? string.charCodeAt(i - 1) : null;
      plain = plain && isPlainSafe(char, prev_char);
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
      (i - previousLineBreak - 1 > lineWidth &&
       string[previousLineBreak + 1] !== ' '));
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    return plain && !testAmbiguousType(string)
      ? STYLE_PLAIN : STYLE_SINGLE;
  }
  // Edge case: block indentation indicator can only have one digit.
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
}

// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey) {
  state.dump = (function () {
    if (string.length === 0) {
      return "''";
    }
    if (!state.noCompatMode &&
        DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
      return "'" + string + "'";
    }

    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.
    var lineWidth = state.lineWidth === -1
      ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

    // Without knowing if keys are implicit/explicit, assume implicit for safety.
    var singleLineOnly = iskey
      // No block styles in flow mode.
      || (state.flowLevel > -1 && level >= state.flowLevel);
    function testAmbiguity(string) {
      return testImplicitResolving(state, string);
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string, lineWidth) + '"';
      default:
        throw new YAMLException('impossible error: invalid scalar style');
    }
  }());
}

// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';

  // note the special case: the string '\n' counts as a "trailing" empty line.
  var clip =          string[string.length - 1] === '\n';
  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
  var chomp = keep ? '+' : (clip ? '' : '-');

  return indentIndicator + chomp + '\n';
}

// (See the note for writeScalar.)
function dropEndingNewline(string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
}

// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  var lineRe = /(\n+)([^\n]*)/g;

  // first line (possibly an empty line)
  var result = (function () {
    var nextLF = string.indexOf('\n');
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }());
  // If we haven't reached the first content line yet, don't add an extra \n.
  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
  var moreIndented;

  // rest of the lines
  var match;
  while ((match = lineRe.exec(string))) {
    var prefix = match[1], line = match[2];
    moreIndented = (line[0] === ' ');
    result += prefix
      + (!prevMoreIndented && !moreIndented && line !== ''
        ? '\n' : '')
      + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }

  return result;
}

// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
  if (line === '' || line[0] === ' ') return line;

  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
  var match;
  // start is an inclusive index. end, curr, and next are exclusive.
  var start = 0, end, curr = 0, next = 0;
  var result = '';

  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  while ((match = breakRe.exec(line))) {
    next = match.index;
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = (curr > start) ? curr : next; // derive end <= length-2
      result += '\n' + line.slice(start, end);
      // skip the space that was output as \n
      start = end + 1;                    // derive start <= length-1
    }
    curr = next;
  }

  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += '\n';
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }

  return result.slice(1); // drop extra \n joiner
}

// Escapes a double-quoted string.
function escapeString(string) {
  var result = '';
  var char, nextChar;
  var escapeSeq;

  for (var i = 0; i < string.length; i++) {
    char = string.charCodeAt(i);
    // Check for surrogate pairs (reference Unicode 3.0 section "3.7 Surrogates").
    if (char >= 0xD800 && char <= 0xDBFF/* high surrogate */) {
      nextChar = string.charCodeAt(i + 1);
      if (nextChar >= 0xDC00 && nextChar <= 0xDFFF/* low surrogate */) {
        // Combine the surrogate pair and store it escaped.
        result += encodeHex((char - 0xD800) * 0x400 + nextChar - 0xDC00 + 0x10000);
        // Advance index one extra since we already used that char here.
        i++; continue;
      }
    }
    escapeSeq = ESCAPE_SEQUENCES[char];
    result += !escapeSeq && isPrintable(char)
      ? string[i]
      : escapeSeq || encodeHex(char);
  }

  return result;
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length;

  for (index = 0, length = object.length; index < length; index += 1) {
    // Write only valid elements.
    if (writeNode(state, level, object[index], false, false)) {
      if (index !== 0) _result += ',' + (!state.condenseFlow ? ' ' : '');
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length;

  for (index = 0, length = object.length; index < length; index += 1) {
    // Write only valid elements.
    if (writeNode(state, level + 1, object[index], true, true)) {
      if (!compact || index !== 0) {
        _result += generateNextLine(state, level);
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += '-';
      } else {
        _result += '- ';
      }

      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {

    pairBuffer = '';
    if (index !== 0) pairBuffer += ', ';

    if (state.condenseFlow) pairBuffer += '"';

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? ';

    pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new YAMLException('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || index !== 0) {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (state.tag !== null && state.tag !== '?') ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf  || type.predicate) &&
        (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
        (!type.predicate  || type.predicate(object))) {

      state.tag = explicit ? type.tag : '?';

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);

  if (block) {
    block = (state.flowLevel < 0 || state.flowLevel > level);
  }

  var objectOrArray = type === '[object Object]' || type === '[object Array]',
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type === '[object Object]') {
      if (block && (Object.keys(state.dump).length !== 0)) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object Array]') {
      var arrayLevel = (state.noArrayIndent && (level > 0)) ? level - 1 : level;
      if (block && (state.dump.length !== 0)) {
        writeBlockSequence(state, arrayLevel, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, arrayLevel, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey);
      }
    } else {
      if (state.skipInvalid) return false;
      throw new YAMLException('unacceptable kind of an object to dump ' + type);
    }

    if (state.tag !== null && state.tag !== '?') {
      state.dump = '!<' + state.tag + '> ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;

  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList,
      index,
      length;

  if (object !== null && typeof object === 'object') {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump(input, options) {
  options = options || {};

  var state = new State(options);

  if (!state.noRefs) getDuplicateReferences(input, state);

  if (writeNode(state, 0, input, true, true)) return state.dump + '\n';

  return '';
}

function safeDump(input, options) {
  return dump(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}

module.exports.dump     = dump;
module.exports.safeDump = safeDump;


/***/ }),
/* 686 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlHeader = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be825453/include/curl/curl.h#L880
/**
 * Object with bitmasks to be used with `HEADEROPT`.
 *
 * Available since libcurl version \>= 7.37.0
 *
 * `CURLHEADER_UNIFIED` becomes `CurlHeader.Unified`
 *
 * @public
 */
var CurlHeader;
(function (CurlHeader) {
    CurlHeader[CurlHeader["Unified"] = 0] = "Unified";
    CurlHeader[CurlHeader["Separate"] = 1] = "Separate";
})(CurlHeader = exports.CurlHeader || (exports.CurlHeader = {}));
//# sourceMappingURL=CurlHeader.js.map

/***/ }),
/* 687 */,
/* 688 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),
/* 689 */,
/* 690 */,
/* 691 */,
/* 692 */
/***/ (function(__unusedmodule, exports) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

class Deprecation extends Error {
  constructor(message) {
    super(message); // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = 'Deprecation';
  }

}

exports.Deprecation = Deprecation;


/***/ }),
/* 693 */,
/* 694 */,
/* 695 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const { stringify } = __webpack_require__(356)
const { outputFile } = __webpack_require__(517)

async function outputJson (file, data, options = {}) {
  const str = stringify(data, options)

  await outputFile(file, str, options)
}

module.exports = outputJson


/***/ }),
/* 696 */
/***/ (function(module) {

"use strict";


/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o) {
  var ctor,prot;

  if (isObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

module.exports = isPlainObject;


/***/ }),
/* 697 */
/***/ (function(module) {

"use strict";

module.exports = (promise, onFinally) => {
	onFinally = onFinally || (() => {});

	return promise.then(
		val => new Promise(resolve => {
			resolve(onFinally());
		}).then(() => val),
		err => new Promise(resolve => {
			resolve(onFinally());
		}).then(() => {
			throw err;
		})
	);
};


/***/ }),
/* 698 */,
/* 699 */
/***/ (function(module) {

module.exports = {"name":"node-libcurl","version":"2.2.0","author":"Jonathan Cardoso <me@jonathancardoso.com>","description":"The fastest http(s) client (and much more) for Node.js - Node.js bindings for libcurl","keywords":["node-curl","curl","libcurl","node-libcurl","axios","request"],"license":"MIT","homepage":"https://github.com/JCMais/node-libcurl","repository":{"type":"git","url":"git://github.com/JCMais/node-libcurl.git"},"bugs":{"url":"https://github.com/JCMais/node-libcurl/issues"},"main":"./dist/index.js","types":"./dist/index.d.ts","scripts":{"install":"node-pre-gyp install --fallback-to-build","postinstall":"node scripts/postinstall","preversion":"yarn lint && yarn clean:dist && yarn build:dist","build:dist":"tsc","ae":"api-extractor run --local --verbose","clean:build":"rimraf build","clean:dist":"rimraf dist tsconfig.tsbuildinfo","clean":"yarn clean:build && yarn clean:dist","docs":"typedoc","gen:constants":"node scripts/build-constants.js","gen:compile_commands:release":"yarn pregyp -- configure --release -- --format=\"gyp.generator.compile_commands_json.py\"","gen:compile_commands:debug":"yarn pregyp -- configure --debug -- --format=\"gyp.generator.compile_commands_json.py\"","lint":"tslint -p . -c tslint.json","lint:files":"tslint -c tslint.json","pregyp":"node-pre-gyp","prettier:all":"yarn prettier lib/**/*.ts tools/**/*.js scripts/**/*.js test/**/*.ts examples/**/*.js","prettier":"prettier --write","test":"mocha --require ts-node/register test/**/*.spec.ts --reporter spec --timeout 60000","test:electron":"electron-mocha --require ts-node/register test/**/*.spec.ts --reporter spec --timeout 60000","test:watch":"yarn test --watch --watch-files test/**/*.spec.ts"},"binary":{"module_name":"node_libcurl","module_path":"./lib/binding/","package_name":"{module_name}-v{version}-{node_abi}-{platform}-{arch}-{libc}.tar.gz","host":"https://github.com/JCMais/node-libcurl/releases/download","remote_path":"./v{version}/"},"dependencies":{"env-paths":"2.2.0","nan":"2.14.1","node-gyp":"7.0.0","node-pre-gyp":"0.15.0","npmlog":"4.1.2","tslib":"2.0.0"},"devDependencies":{"@microsoft/api-documenter":"^7.8.0","@microsoft/api-extractor":"^7.8.0","@types/body-parser":"^1.19.0","@types/cookie-parser":"^1.4.2","@types/express":"^4.17.4","@types/formidable":"^1.0.31","@types/mocha":"^7.0.2","@types/node":"^12.6.8","@types/should":"^13.0.0","body-parser":"^1.19.0","cheerio":"^1.0.0-rc.3","clang-format":"^1.4.0","cookie-parser":"^1.4.5","electron-mocha":"^8.2.1","eslint":"^6.8.0","eslint-config-prettier":"^6.10.1","eslint-plugin-prettier":"^3.1.2","express":"^4.17.1","formidable":"^1.2.2","http-auth":"^4.1.2","http-auth-connect":"^1.0.4","husky":"^4.2.3","lint-staged":"^10.1.2","mocha":"^7.1.1","np":"^6.2.0","octonode":"^0.9.5","prettier":"^2.0.2","progress":"^2.0.3","rimraf":"^3.0.2","should":"^13.2.3","ts-node":"^8.8.2","tslint":"^6.1.1","tslint-config-airbnb":"^5.11.2","tslint-config-prettier":"^1.18.0","typedoc":"^0.17.7","typedoc-plugin-nojekyll":"^1.0.1","typescript":"^3.9.3"},"lint-staged":{"*.js":["yarn prettier","yarn eslint --fix"],"*.ts":["yarn prettier","yarn lint:files --fix"],"*.{cpp,cc,h}":["clang-format -style=file -i"]},"engines":{"node":">= 8"},"np":{"cleanup":false},"husky":{"hooks":{"commitmsg":"commitlint -e $HUSKY_GIT_PARAMS","pre-commit":"lint-staged"}},"_resolved":"https://registry.npmjs.org/node-libcurl/-/node-libcurl-2.2.0.tgz","_integrity":"sha512-dyv3IuQBqO4KK5ojtM4k6FuBA3RxZjTqO4c+MUirwvlTY7qIH2oNSws8Xte1pp2aso9TuXyAwxS/g3ZqmAk8aA==","_from":"node-libcurl@2.2.0"};

/***/ }),
/* 700 */,
/* 701 */,
/* 702 */,
/* 703 */,
/* 704 */,
/* 705 */,
/* 706 */,
/* 707 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlFtpMethod = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be825453489/include/curl/curl.h#L873
// @TODO Fix enum members naming on semver major bump
/**
 * Object with constants for option `FTP_FILEMETHOD`
 *
 * `CURLFTPMETHOD_MULTICWD` becomes `CurlFtpMethod.MULTICWD`
 *
 * This is not following the PascalCase naming format because of a mistake. To not cause a breaking change
 *  it will stay this way until the next major version bump.
 *
 * @public
 */
var CurlFtpMethod;
(function (CurlFtpMethod) {
    /**
     * let libcurl pick
     */
    CurlFtpMethod[CurlFtpMethod["DEFAULT"] = 0] = "DEFAULT";
    /**
     * single CWD operation for each path part
     */
    CurlFtpMethod[CurlFtpMethod["MULTICWD"] = 1] = "MULTICWD";
    /**
     * no CWD at all
     */
    CurlFtpMethod[CurlFtpMethod["NOCWD"] = 2] = "NOCWD";
    /**
     * one CWD to full dir, then work on file
     */
    CurlFtpMethod[CurlFtpMethod["SINGLECWD"] = 3] = "SINGLECWD";
})(CurlFtpMethod = exports.CurlFtpMethod || (exports.CurlFtpMethod = {}));
//# sourceMappingURL=CurlFtpMethod.js.map

/***/ }),
/* 708 */,
/* 709 */,
/* 710 */,
/* 711 */,
/* 712 */,
/* 713 */,
/* 714 */,
/* 715 */,
/* 716 */,
/* 717 */,
/* 718 */,
/* 719 */,
/* 720 */,
/* 721 */,
/* 722 */,
/* 723 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const u = __webpack_require__(676).fromCallback
const rimraf = __webpack_require__(474)

module.exports = {
  remove: u(rimraf),
  removeSync: rimraf.sync
}


/***/ }),
/* 724 */,
/* 725 */,
/* 726 */,
/* 727 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const u = __webpack_require__(676).fromPromise
const { makeDir: _makeDir, makeDirSync } = __webpack_require__(54)
const makeDir = u(_makeDir)

module.exports = {
  mkdirs: makeDir,
  mkdirsSync: makeDirSync,
  // alias
  mkdirp: makeDir,
  mkdirpSync: makeDirSync,
  ensureDir: makeDir,
  ensureDirSync: makeDirSync
}


/***/ }),
/* 728 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlShareLock = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be82545348/include/curl/curl.h#L2643
/**
 * Options to be used when setting `SHARE` or `UNSHARE` with {@link "Share".Share.setOpt | `Share#setOpt`}.
 *
 * `CURL_LOCK_DATA_SSL_SESSION` becomes `CurlShareLock.DataSslSession`
 *
 * @public
 */
var CurlShareLock;
(function (CurlShareLock) {
    CurlShareLock[CurlShareLock["DataNone"] = 0] = "DataNone";
    /**
     * DataShare is used internally to say that
     *  the locking is just made to change the internal state of the share
     *  itself.
     */
    CurlShareLock[CurlShareLock["DataShare"] = 1] = "DataShare";
    CurlShareLock[CurlShareLock["DataCookie"] = 2] = "DataCookie";
    CurlShareLock[CurlShareLock["DataDns"] = 3] = "DataDns";
    CurlShareLock[CurlShareLock["DataSslSession"] = 4] = "DataSslSession";
    CurlShareLock[CurlShareLock["DataConnect"] = 5] = "DataConnect";
    CurlShareLock[CurlShareLock["DataPsl"] = 6] = "DataPsl";
})(CurlShareLock = exports.CurlShareLock || (exports.CurlShareLock = {}));
//# sourceMappingURL=CurlShareLock.js.map

/***/ }),
/* 729 */,
/* 730 */,
/* 731 */,
/* 732 */
/***/ (function(module) {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),
/* 733 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


/*eslint-disable max-len*/

var common        = __webpack_require__(740);
var YAMLException = __webpack_require__(556);
var Type          = __webpack_require__(945);


function compileList(schema, name, result) {
  var exclude = [];

  schema.include.forEach(function (includedSchema) {
    result = compileList(includedSchema, name, result);
  });

  schema[name].forEach(function (currentType) {
    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind) {
        exclude.push(previousIndex);
      }
    });

    result.push(currentType);
  });

  return result.filter(function (type, index) {
    return exclude.indexOf(index) === -1;
  });
}


function compileMap(/* lists... */) {
  var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {}
      }, index, length;

  function collectType(type) {
    result[type.kind][type.tag] = result['fallback'][type.tag] = type;
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}


function Schema(definition) {
  this.include  = definition.include  || [];
  this.implicit = definition.implicit || [];
  this.explicit = definition.explicit || [];

  this.implicit.forEach(function (type) {
    if (type.loadKind && type.loadKind !== 'scalar') {
      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }
  });

  this.compiledImplicit = compileList(this, 'implicit', []);
  this.compiledExplicit = compileList(this, 'explicit', []);
  this.compiledTypeMap  = compileMap(this.compiledImplicit, this.compiledExplicit);
}


Schema.DEFAULT = null;


Schema.create = function createSchema() {
  var schemas, types;

  switch (arguments.length) {
    case 1:
      schemas = Schema.DEFAULT;
      types = arguments[0];
      break;

    case 2:
      schemas = arguments[0];
      types = arguments[1];
      break;

    default:
      throw new YAMLException('Wrong number of arguments for Schema.create function');
  }

  schemas = common.toArray(schemas);
  types = common.toArray(types);

  if (!schemas.every(function (schema) { return schema instanceof Schema; })) {
    throw new YAMLException('Specified list of super schemas (or a single Schema object) contains a non-Schema object.');
  }

  if (!types.every(function (type) { return type instanceof Type; })) {
    throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
  }

  return new Schema({
    include: schemas,
    explicit: types
  });
};


module.exports = Schema;


/***/ }),
/* 734 */,
/* 735 */,
/* 736 */,
/* 737 */,
/* 738 */,
/* 739 */,
/* 740 */
/***/ (function(module) {

"use strict";



function isNothing(subject) {
  return (typeof subject === 'undefined') || (subject === null);
}


function isObject(subject) {
  return (typeof subject === 'object') && (subject !== null);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];

  return [ sequence ];
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


function isNegativeZero(number) {
  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
}


module.exports.isNothing      = isNothing;
module.exports.isObject       = isObject;
module.exports.toArray        = toArray;
module.exports.repeat         = repeat;
module.exports.isNegativeZero = isNegativeZero;
module.exports.extend         = extend;


/***/ }),
/* 741 */,
/* 742 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var fs = __webpack_require__(747)
var core
if (process.platform === 'win32' || global.TESTING_WINDOWS) {
  core = __webpack_require__(818)
} else {
  core = __webpack_require__(197)
}

module.exports = isexe
isexe.sync = sync

function isexe (path, options, cb) {
  if (typeof options === 'function') {
    cb = options
    options = {}
  }

  if (!cb) {
    if (typeof Promise !== 'function') {
      throw new TypeError('callback not provided')
    }

    return new Promise(function (resolve, reject) {
      isexe(path, options || {}, function (er, is) {
        if (er) {
          reject(er)
        } else {
          resolve(is)
        }
      })
    })
  }

  core(path, options || {}, function (er, is) {
    // ignore EACCES because that just means we aren't allowed to run it
    if (er) {
      if (er.code === 'EACCES' || options && options.ignoreErrors) {
        er = null
        is = false
      }
    }
    cb(er, is)
  })
}

function sync (path, options) {
  // my kingdom for a filtered catch
  try {
    return core.sync(path, options || {})
  } catch (er) {
    if (options && options.ignoreErrors || er.code === 'EACCES') {
      return false
    } else {
      throw er
    }
  }
}


/***/ }),
/* 743 */,
/* 744 */,
/* 745 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const freshRequire_1 = __webpack_require__(194);
const defaultChartJsFactory = () => freshRequire_1.freshRequire('chart.js');
class CanvasRenderService {
    /**
     * Create a new instance of CanvasRenderService.
     *
     * @param width The width of the charts to render, in pixels.
     * @param height The height of the charts to render, in pixels.
     * @param chartCallback optional callback which is called once with a new ChartJS global reference as the only parameter.
     * @param type optional The canvas type ('PDF' or 'SVG'), see the [canvas pdf doc](https://github.com/Automattic/node-canvas#pdf-output-support).
     * @param chartJsFactory optional provider for chart.js.
     */
    constructor(width, height, chartCallback, type, chartJsFactory) {
        this._width = width;
        this._height = height;
        this._chartJs = (chartJsFactory || defaultChartJsFactory)();
        const canvas = freshRequire_1.freshRequire('canvas');
        this._createCanvas = canvas.createCanvas;
        this._registerFont = canvas.registerFont;
        this._type = type;
        if (chartCallback) {
            chartCallback(this._chartJs);
        }
    }
    /**
     * Render to a data url.
     * @see https://github.com/Automattic/node-canvas#canvastodataurl
     *
     * @param configuration The Chart JS configuration for the chart to render.
     * @param mimeType The image format, `image/png` or `image/jpeg`.
     */
    renderToDataURL(configuration, mimeType = 'image/png') {
        const chart = this.renderChart(configuration);
        return new Promise((resolve, reject) => {
            if (!chart.canvas) {
                return reject(new Error('Canvas is null'));
            }
            const canvas = chart.canvas;
            canvas.toDataURL(mimeType, (error, png) => {
                chart.destroy();
                if (error) {
                    return reject(error);
                }
                return resolve(png);
            });
        });
    }
    /**
     * Render to a data url synchronously.
     * @see https://github.com/Automattic/node-canvas#canvastodataurl
     *
     * @param configuration The Chart JS configuration for the chart to render.
     * @param mimeType The image format, `image/png` or `image/jpeg`.
     */
    renderToDataURLSync(configuration, mimeType = 'image/png') {
        const chart = this.renderChart(configuration);
        if (!chart.canvas) {
            throw new Error('Canvas is null');
        }
        const canvas = chart.canvas;
        chart.destroy();
        const dataUrl = canvas.toDataURL(mimeType);
        return dataUrl;
    }
    /**
     * Render to a buffer.
     * @see https://github.com/Automattic/node-canvas#canvastobuffer
     *
     * @param configuration The Chart JS configuration for the chart to render.
     * @param mimeType A string indicating the image format. Valid options are `image/png`, `image/jpeg` (if node-canvas was built with JPEG support) or `raw` (unencoded ARGB32 data in native-endian byte order, top-to-bottom). Defaults to `image/png` for image canvases, or the corresponding type for PDF or SVG canvas.
     */
    renderToBuffer(configuration, mimeType = 'image/png') {
        const chart = this.renderChart(configuration);
        return new Promise((resolve, reject) => {
            if (!chart.canvas) {
                throw new Error('Canvas is null');
            }
            const canvas = chart.canvas;
            canvas.toBuffer((error, buffer) => {
                chart.destroy();
                if (error) {
                    return reject(error);
                }
                return resolve(buffer);
            }, mimeType);
        });
    }
    /**
     * Render to a buffer synchronously.
     * @see https://github.com/Automattic/node-canvas#canvastobuffer
     *
     * @param configuration The Chart JS configuration for the chart to render.
     * @param mimeType A string indicating the image format. Valid options are `image/png`, `image/jpeg` (if node-canvas was built with JPEG support), `raw` (unencoded ARGB32 data in native-endian byte order, top-to-bottom), `application/pdf` (for PDF canvases) and image/svg+xml (for SVG canvases). Defaults to `image/png` for image canvases, or the corresponding type for PDF or SVG canvas.
     */
    renderToBufferSync(configuration, mimeType = 'image/png') {
        const chart = this.renderChart(configuration);
        if (!chart.canvas) {
            throw new Error('Canvas is null');
        }
        const canvas = chart.canvas;
        const buffer = canvas.toBuffer(mimeType);
        chart.destroy();
        return buffer;
    }
    /**
     * Render to a stream.
     * @see https://github.com/Automattic/node-canvas#canvascreatepngstream
     *
     * @param configuration The Chart JS configuration for the chart to render.
     * @param mimeType A string indicating the image format. Valid options are `image/png`, `image/jpeg` (if node-canvas was built with JPEG support), `application/pdf` (for PDF canvases) and image/svg+xml (for SVG canvases). Defaults to `image/png` for image canvases, or the corresponding type for PDF or SVG canvas.
     */
    renderToStream(configuration, mimeType = 'image/png') {
        const chart = this.renderChart(configuration);
        if (!chart.canvas) {
            throw new Error('Canvas is null');
        }
        const canvas = chart.canvas;
        setImmediate(() => chart.destroy());
        switch (mimeType) {
            case 'image/png':
                return canvas.createPNGStream();
            case 'image/jpeg':
                return canvas.createJPEGStream();
            case 'application/pdf':
                return canvas.createPDFStream();
            default:
                throw new Error(`Un-handled mimeType: ${mimeType}`);
        }
    }
    /**
     * Use to register the font with Canvas to use a font file that is not installed as a system font, this must be done before the Canvas is created.
     *
     * @param path The path to the font file.
     * @param options The font options.
     * @example
     * registerFont('comicsans.ttf', { family: 'Comic Sans' });
     */
    registerFont(path, options) {
        this._registerFont(path, options);
    }
    renderChart(configuration) {
        const canvas = this._createCanvas(this._width, this._height, this._type);
        canvas.style = {};
        // Disable animation (otherwise charts will throw exceptions)
        configuration.options = configuration.options || {};
        configuration.options.responsive = false;
        configuration.options.animation = false;
        const context = canvas.getContext('2d');
        return new this._chartJs(context, configuration);
    }
}
exports.CanvasRenderService = CanvasRenderService;
//# sourceMappingURL=index.js.map

/***/ }),
/* 746 */,
/* 747 */
/***/ (function(module) {

module.exports = require("fs");

/***/ }),
/* 748 */,
/* 749 */,
/* 750 */,
/* 751 */,
/* 752 */,
/* 753 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var endpoint = __webpack_require__(385);
var universalUserAgent = __webpack_require__(211);
var isPlainObject = _interopDefault(__webpack_require__(696));
var nodeFetch = _interopDefault(__webpack_require__(454));
var requestError = __webpack_require__(463);

const VERSION = "5.4.7";

function getBufferResponse(response) {
  return response.arrayBuffer();
}

function fetchWrapper(requestOptions) {
  if (isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  let headers = {};
  let status;
  let url;
  const fetch = requestOptions.request && requestOptions.request.fetch || nodeFetch;
  return fetch(requestOptions.url, Object.assign({
    method: requestOptions.method,
    body: requestOptions.body,
    headers: requestOptions.headers,
    redirect: requestOptions.redirect
  }, requestOptions.request)).then(response => {
    url = response.url;
    status = response.status;

    for (const keyAndValue of response.headers) {
      headers[keyAndValue[0]] = keyAndValue[1];
    }

    if (status === 204 || status === 205) {
      return;
    } // GitHub API returns 200 for HEAD requests


    if (requestOptions.method === "HEAD") {
      if (status < 400) {
        return;
      }

      throw new requestError.RequestError(response.statusText, status, {
        headers,
        request: requestOptions
      });
    }

    if (status === 304) {
      throw new requestError.RequestError("Not modified", status, {
        headers,
        request: requestOptions
      });
    }

    if (status >= 400) {
      return response.text().then(message => {
        const error = new requestError.RequestError(message, status, {
          headers,
          request: requestOptions
        });

        try {
          let responseBody = JSON.parse(error.message);
          Object.assign(error, responseBody);
          let errors = responseBody.errors; // Assumption `errors` would always be in Array format

          error.message = error.message + ": " + errors.map(JSON.stringify).join(", ");
        } catch (e) {// ignore, see octokit/rest.js#684
        }

        throw error;
      });
    }

    const contentType = response.headers.get("content-type");

    if (/application\/json/.test(contentType)) {
      return response.json();
    }

    if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
      return response.text();
    }

    return getBufferResponse(response);
  }).then(data => {
    return {
      status,
      url,
      headers,
      data
    };
  }).catch(error => {
    if (error instanceof requestError.RequestError) {
      throw error;
    }

    throw new requestError.RequestError(error.message, 500, {
      headers,
      request: requestOptions
    });
  });
}

function withDefaults(oldEndpoint, newDefaults) {
  const endpoint = oldEndpoint.defaults(newDefaults);

  const newApi = function (route, parameters) {
    const endpointOptions = endpoint.merge(route, parameters);

    if (!endpointOptions.request || !endpointOptions.request.hook) {
      return fetchWrapper(endpoint.parse(endpointOptions));
    }

    const request = (route, parameters) => {
      return fetchWrapper(endpoint.parse(endpoint.merge(route, parameters)));
    };

    Object.assign(request, {
      endpoint,
      defaults: withDefaults.bind(null, endpoint)
    });
    return endpointOptions.request.hook(request, endpointOptions);
  };

  return Object.assign(newApi, {
    endpoint,
    defaults: withDefaults.bind(null, endpoint)
  });
}

const request = withDefaults(endpoint.endpoint, {
  headers: {
    "user-agent": `octokit-request.js/${VERSION} ${universalUserAgent.getUserAgent()}`
  }
});

exports.request = request;
//# sourceMappingURL=index.js.map


/***/ }),
/* 754 */,
/* 755 */,
/* 756 */,
/* 757 */,
/* 758 */,
/* 759 */,
/* 760 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const pump = __webpack_require__(453);
const bufferStream = __webpack_require__(582);

class MaxBufferError extends Error {
	constructor() {
		super('maxBuffer exceeded');
		this.name = 'MaxBufferError';
	}
}

function getStream(inputStream, options) {
	if (!inputStream) {
		return Promise.reject(new Error('Expected a stream'));
	}

	options = Object.assign({maxBuffer: Infinity}, options);

	const {maxBuffer} = options;

	let stream;
	return new Promise((resolve, reject) => {
		const rejectPromise = error => {
			if (error) { // A null check
				error.bufferedData = stream.getBufferedValue();
			}
			reject(error);
		};

		stream = pump(inputStream, bufferStream(options), error => {
			if (error) {
				rejectPromise(error);
				return;
			}

			resolve();
		});

		stream.on('data', () => {
			if (stream.getBufferedLength() > maxBuffer) {
				rejectPromise(new MaxBufferError());
			}
		});
	}).then(() => stream.getBufferedValue());
}

module.exports = getStream;
module.exports.buffer = (stream, options) => getStream(stream, Object.assign({}, options, {encoding: 'buffer'}));
module.exports.array = (stream, options) => getStream(stream, Object.assign({}, options, {array: true}));
module.exports.MaxBufferError = MaxBufferError;


/***/ }),
/* 761 */
/***/ (function(module) {

module.exports = require("zlib");

/***/ }),
/* 762 */,
/* 763 */,
/* 764 */,
/* 765 */,
/* 766 */,
/* 767 */,
/* 768 */
/***/ (function(module) {

"use strict";

module.exports = function (x) {
	var lf = typeof x === 'string' ? '\n' : '\n'.charCodeAt();
	var cr = typeof x === 'string' ? '\r' : '\r'.charCodeAt();

	if (x[x.length - 1] === lf) {
		x = x.slice(0, x.length - 1);
	}

	if (x[x.length - 1] === cr) {
		x = x.slice(0, x.length - 1);
	}

	return x;
};


/***/ }),
/* 769 */,
/* 770 */,
/* 771 */,
/* 772 */,
/* 773 */,
/* 774 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const u = __webpack_require__(676).fromCallback
module.exports = {
  copy: u(__webpack_require__(595))
}


/***/ }),
/* 775 */,
/* 776 */,
/* 777 */,
/* 778 */,
/* 779 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);
var buildURL = __webpack_require__(133);
var InterceptorManager = __webpack_require__(283);
var dispatchRequest = __webpack_require__(461);
var mergeConfig = __webpack_require__(825);

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),
/* 780 */,
/* 781 */
/***/ (function(module) {

"use strict";


var isStream = module.exports = function (stream) {
	return stream !== null && typeof stream === 'object' && typeof stream.pipe === 'function';
};

isStream.writable = function (stream) {
	return isStream(stream) && stream.writable !== false && typeof stream._write === 'function' && typeof stream._writableState === 'object';
};

isStream.readable = function (stream) {
	return isStream(stream) && stream.readable !== false && typeof stream._read === 'function' && typeof stream._readableState === 'object';
};

isStream.duplex = function (stream) {
	return isStream.writable(stream) && isStream.readable(stream);
};

isStream.transform = function (stream) {
	return isStream.duplex(stream) && typeof stream._transform === 'function' && typeof stream._transformState === 'object';
};


/***/ }),
/* 782 */,
/* 783 */,
/* 784 */
/***/ (function(module, __unusedexports, __webpack_require__) {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
	module.exports = __webpack_require__(794);
} else {
	module.exports = __webpack_require__(81);
}


/***/ }),
/* 785 */,
/* 786 */,
/* 787 */,
/* 788 */,
/* 789 */,
/* 790 */,
/* 791 */,
/* 792 */,
/* 793 */,
/* 794 */
/***/ (function(module, exports, __webpack_require__) {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */
function log(...args) {
	// This hackery is required for IE8/9, where
	// the `console.log` function doesn't have 'apply'
	return typeof console === 'object' &&
		console.log &&
		console.log(...args);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(486)(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),
/* 795 */,
/* 796 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var osName = _interopDefault(__webpack_require__(2));

function getUserAgent() {
  try {
    return `Node.js/${process.version.substr(1)} (${osName()}; ${process.arch})`;
  } catch (error) {
    if (/wmic os get Caption/.test(error.message)) {
      return "Windows <version undetectable>";
    }

    return "<environment undetectable>";
  }
}

exports.getUserAgent = getUserAgent;
//# sourceMappingURL=index.js.map


/***/ }),
/* 797 */,
/* 798 */,
/* 799 */,
/* 800 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlNetrc = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be82545/include/curl/curl.h#L2003
/**
 * To be used with the `NETRC` option
 *
 * `CURL_NETRC_OPTIONAL` becomes `CurlNetrc.Optional`
 *
 * @public
 */
var CurlNetrc;
(function (CurlNetrc) {
    /**
     * The .netrc will never be read.
     * This is the default
     */
    CurlNetrc[CurlNetrc["Ignored"] = 0] = "Ignored";
    /**
     * A user:password in the URL will be preferred to one in the .netrc
     */
    CurlNetrc[CurlNetrc["Optional"] = 1] = "Optional";
    /**
     * A user:password in the URL will be ignored.
     * Unless one is set programmatically, the .netrc
     * will be queried.
     */
    CurlNetrc[CurlNetrc["Required"] = 2] = "Required";
})(CurlNetrc = exports.CurlNetrc || (exports.CurlNetrc = {}));
//# sourceMappingURL=CurlNetrc.js.map

/***/ }),
/* 801 */,
/* 802 */,
/* 803 */,
/* 804 */,
/* 805 */,
/* 806 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlSshAuth = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be82545348/include/curl/curl.h#L741
/**
 * Object with constants for option `SSH_AUTH_TYPES`
 *
 * `CURLSSH_AUTH_PASSWORD` becomes `CurlSshAuth.Password`
 *
 * @public
 */
var CurlSshAuth;
(function (CurlSshAuth) {
    /**
     * all types supported by the server
     */
    CurlSshAuth[CurlSshAuth["Any"] = -1] = "Any";
    /**
     * none allowed, silly but complete
     */
    CurlSshAuth[CurlSshAuth["None"] = 0] = "None";
    /**
     * public/private key files
     */
    CurlSshAuth[CurlSshAuth["PublicKey"] = 1] = "PublicKey";
    /**
     * password
     */
    CurlSshAuth[CurlSshAuth["Password"] = 2] = "Password";
    /**
     * host key files
     */
    CurlSshAuth[CurlSshAuth["Host"] = 4] = "Host";
    /**
     * keyboard interactive
     */
    CurlSshAuth[CurlSshAuth["Keyboard"] = 8] = "Keyboard";
    /**
     * agent (ssh-agent, pageant...)
     */
    CurlSshAuth[CurlSshAuth["Agent"] = 16] = "Agent";
    /**
     * gssapi (kerberos, ...)
     */
    CurlSshAuth[CurlSshAuth["GssApi"] = 32] = "GssApi";
    CurlSshAuth[CurlSshAuth["Default"] = -1] = "Default";
})(CurlSshAuth = exports.CurlSshAuth || (exports.CurlSshAuth = {}));
//# sourceMappingURL=CurlSshAuth.js.map

/***/ }),
/* 807 */,
/* 808 */,
/* 809 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var Type = __webpack_require__(945);

function resolveYamlNull(data) {
  if (data === null) return true;

  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}

module.exports = new Type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; }
  },
  defaultStyle: 'lowercase'
});


/***/ }),
/* 810 */,
/* 811 */,
/* 812 */,
/* 813 */
/***/ (function(__unusedmodule, exports) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

async function auth(token) {
  const tokenType = token.split(/\./).length === 3 ? "app" : /^v\d+\./.test(token) ? "installation" : "oauth";
  return {
    type: "token",
    token: token,
    tokenType
  };
}

/**
 * Prefix token for usage in the Authorization header
 *
 * @param token OAuth token or JSON Web Token
 */
function withAuthorizationPrefix(token) {
  if (token.split(/\./).length === 3) {
    return `bearer ${token}`;
  }

  return `token ${token}`;
}

async function hook(token, request, route, parameters) {
  const endpoint = request.endpoint.merge(route, parameters);
  endpoint.headers.authorization = withAuthorizationPrefix(token);
  return request(endpoint);
}

const createTokenAuth = function createTokenAuth(token) {
  if (!token) {
    throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
  }

  if (typeof token !== "string") {
    throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");
  }

  token = token.replace(/^(token|bearer) +/i, "");
  return Object.assign(auth.bind(null, token), {
    hook: hook.bind(null, token)
  });
};

exports.createTokenAuth = createTokenAuth;
//# sourceMappingURL=index.js.map


/***/ }),
/* 814 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlPause = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be8254/include/curl/curl.h#L2828
/**
 * Options to be used with {@link "Easy".Easy.pause | `Easy#pause`} and {@link "Curl".Curl.pause | `Curl#pause`}.
 *
 * `CURLPAUSE_RECV_CONT` becomes `CurlPause.RecvCont`
 *
 * @public
 */
var CurlPause;
(function (CurlPause) {
    CurlPause[CurlPause["Recv"] = 1] = "Recv";
    CurlPause[CurlPause["RecvCont"] = 0] = "RecvCont";
    CurlPause[CurlPause["Send"] = 4] = "Send";
    CurlPause[CurlPause["SendCont"] = 0] = "SendCont";
    CurlPause[CurlPause["All"] = 5] = "All";
    CurlPause[CurlPause["Cont"] = 0] = "Cont";
})(CurlPause = exports.CurlPause || (exports.CurlPause = {}));
//# sourceMappingURL=CurlPause.js.map

/***/ }),
/* 815 */,
/* 816 */,
/* 817 */,
/* 818 */
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = isexe
isexe.sync = sync

var fs = __webpack_require__(747)

function checkPathExt (path, options) {
  var pathext = options.pathExt !== undefined ?
    options.pathExt : process.env.PATHEXT

  if (!pathext) {
    return true
  }

  pathext = pathext.split(';')
  if (pathext.indexOf('') !== -1) {
    return true
  }
  for (var i = 0; i < pathext.length; i++) {
    var p = pathext[i].toLowerCase()
    if (p && path.substr(-p.length).toLowerCase() === p) {
      return true
    }
  }
  return false
}

function checkStat (stat, path, options) {
  if (!stat.isSymbolicLink() && !stat.isFile()) {
    return false
  }
  return checkPathExt(path, options)
}

function isexe (path, options, cb) {
  fs.stat(path, function (er, stat) {
    cb(er, er ? false : checkStat(stat, path, options))
  })
}

function sync (path, options) {
  return checkStat(fs.statSync(path), path, options)
}


/***/ }),
/* 819 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";



var loader = __webpack_require__(457);
var dumper = __webpack_require__(685);


function deprecated(name) {
  return function () {
    throw new Error('Function ' + name + ' is deprecated and cannot be used.');
  };
}


module.exports.Type                = __webpack_require__(945);
module.exports.Schema              = __webpack_require__(733);
module.exports.FAILSAFE_SCHEMA     = __webpack_require__(581);
module.exports.JSON_SCHEMA         = __webpack_require__(23);
module.exports.CORE_SCHEMA         = __webpack_require__(611);
module.exports.DEFAULT_SAFE_SCHEMA = __webpack_require__(830);
module.exports.DEFAULT_FULL_SCHEMA = __webpack_require__(910);
module.exports.load                = loader.load;
module.exports.loadAll             = loader.loadAll;
module.exports.safeLoad            = loader.safeLoad;
module.exports.safeLoadAll         = loader.safeLoadAll;
module.exports.dump                = dumper.dump;
module.exports.safeDump            = dumper.safeDump;
module.exports.YAMLException       = __webpack_require__(556);

// Deprecated schema names from JS-YAML 2.0.x
module.exports.MINIMAL_SCHEMA = __webpack_require__(581);
module.exports.SAFE_SCHEMA    = __webpack_require__(830);
module.exports.DEFAULT_SCHEMA = __webpack_require__(910);

// Deprecated functions from JS-YAML 1.x.x
module.exports.scan           = deprecated('scan');
module.exports.parse          = deprecated('parse');
module.exports.compose        = deprecated('compose');
module.exports.addConstructor = deprecated('addConstructor');


/***/ }),
/* 820 */,
/* 821 */,
/* 822 */,
/* 823 */,
/* 824 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlFeature = void 0;
/**
 * Flags to be used with {@link "Curl".Curl.enable | `Curl#enable`} and {@link "Curl".Curl.disable | `Curl#disable`}
 * @public
 */
var CurlFeature;
(function (CurlFeature) {
    /**
     * Data received is passed as a Buffer to the end event.
     */
    CurlFeature[CurlFeature["NoDataParsing"] = 1] = "NoDataParsing";
    /**
     * Header received is not parsed, it's passed as a Buffer to the end event.
     */
    CurlFeature[CurlFeature["NoHeaderParsing"] = 2] = "NoHeaderParsing";
    /**
     * Same than `NoDataParsing | NoHeaderParsing`
     */
    CurlFeature[CurlFeature["Raw"] = 3] = "Raw";
    /**
     * Data received is not stored inside this handle, implies `NoDataParsing`.
     */
    CurlFeature[CurlFeature["NoDataStorage"] = 4] = "NoDataStorage";
    /**
     * Header received is not stored inside this handle, implies `NoHeaderParsing`.
     */
    CurlFeature[CurlFeature["NoHeaderStorage"] = 8] = "NoHeaderStorage";
    /**
     * Same than `NoDataStorage | NoHeaderStorage`, implies `Raw`.
     */
    CurlFeature[CurlFeature["NoStorage"] = 12] = "NoStorage";
})(CurlFeature = exports.CurlFeature || (exports.CurlFeature = {}));
//# sourceMappingURL=CurlFeature.js.map

/***/ }),
/* 825 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),
/* 826 */
/***/ (function(module) {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),
/* 827 */,
/* 828 */,
/* 829 */
/***/ (function(module) {

"use strict";

module.exports = opts => {
	opts = opts || {};

	const env = opts.env || process.env;
	const platform = opts.platform || process.platform;

	if (platform !== 'win32') {
		return 'PATH';
	}

	return Object.keys(env).find(x => x.toUpperCase() === 'PATH') || 'Path';
};


/***/ }),
/* 830 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)





var Schema = __webpack_require__(733);


module.exports = new Schema({
  include: [
    __webpack_require__(611)
  ],
  implicit: [
    __webpack_require__(841),
    __webpack_require__(633)
  ],
  explicit: [
    __webpack_require__(913),
    __webpack_require__(181),
    __webpack_require__(947),
    __webpack_require__(100)
  ]
});


/***/ }),
/* 831 */,
/* 832 */,
/* 833 */,
/* 834 */,
/* 835 */
/***/ (function(module) {

module.exports = require("url");

/***/ }),
/* 836 */,
/* 837 */,
/* 838 */
/***/ (function(module) {

module.exports = addHook

function addHook (state, kind, name, hook) {
  var orig = hook
  if (!state.registry[name]) {
    state.registry[name] = []
  }

  if (kind === 'before') {
    hook = function (method, options) {
      return Promise.resolve()
        .then(orig.bind(null, options))
        .then(method.bind(null, options))
    }
  }

  if (kind === 'after') {
    hook = function (method, options) {
      var result
      return Promise.resolve()
        .then(method.bind(null, options))
        .then(function (result_) {
          result = result_
          return orig(result, options)
        })
        .then(function () {
          return result
        })
    }
  }

  if (kind === 'error') {
    hook = function (method, options) {
      return Promise.resolve()
        .then(method.bind(null, options))
        .catch(function (error) {
          return orig(error, options)
        })
    }
  }

  state.registry[name].push({
    hook: hook,
    orig: orig
  })
}


/***/ }),
/* 839 */,
/* 840 */,
/* 841 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var Type = __webpack_require__(945);

var YAML_DATE_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9])'                    + // [2] month
  '-([0-9][0-9])$');                   // [3] day

var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:[Tt]|[ \\t]+)'                 + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}

function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (match === null) throw new Error('Date resolve error');

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day));
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if (match[9] === '-') delta = -delta;
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) date.setTime(date.getTime() - delta);

  return date;
}

function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}

module.exports = new Type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});


/***/ }),
/* 842 */
/***/ (function(__unusedmodule, exports) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

const Endpoints = {
  actions: {
    addSelectedRepoToOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
    cancelWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel"],
    createOrUpdateOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}"],
    createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}", {}, {
      renamedParameters: {
        name: "secret_name"
      }
    }],
    createOrUpdateSecretForRepo: ["PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}", {}, {
      renamed: ["actions", "createOrUpdateRepoSecret"],
      renamedParameters: {
        name: "secret_name"
      }
    }],
    createRegistrationToken: ["POST /repos/{owner}/{repo}/actions/runners/registration-token", {}, {
      renamed: ["actions", "createRegistrationTokenForRepo"]
    }],
    createRegistrationTokenForOrg: ["POST /orgs/{org}/actions/runners/registration-token"],
    createRegistrationTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/registration-token"],
    createRemoveToken: ["POST /repos/{owner}/{repo}/actions/runners/remove-token", {}, {
      renamed: ["actions", "createRemoveTokenForRepo"]
    }],
    createRemoveTokenForOrg: ["POST /orgs/{org}/actions/runners/remove-token"],
    createRemoveTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/remove-token"],
    deleteArtifact: ["DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
    deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
    deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}", {}, {
      renamedParameters: {
        name: "secret_name"
      }
    }],
    deleteSecretFromRepo: ["DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}", {}, {
      renamed: ["actions", "deleteRepoSecret"],
      renamedParameters: {
        name: "secret_name"
      }
    }],
    deleteSelfHostedRunnerFromOrg: ["DELETE /orgs/{org}/actions/runners/{runner_id}"],
    deleteSelfHostedRunnerFromRepo: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}"],
    deleteWorkflowRunLogs: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
    downloadArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}"],
    downloadJobLogsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs"],
    downloadWorkflowJobLogs: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs", {}, {
      renamed: ["actions", "downloadJobLogsForWorkflowRun"]
    }],
    downloadWorkflowRunLogs: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
    getArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
    getJobForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],
    getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
    getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
    getPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key", {}, {
      renamed: ["actions", "getRepoPublicKey"]
    }],
    getRepoPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key"],
    getRepoSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}", {}, {
      renamedParameters: {
        name: "secret_name"
      }
    }],
    getSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}", {}, {
      renamed: ["actions", "getRepoSecret"],
      renamedParameters: {
        name: "secret_name"
      }
    }],
    getSelfHostedRunner: ["GET /repos/{owner}/{repo}/actions/runners/{runner_id}", {}, {
      renamed: ["actions", "getSelfHostedRunnerForRepo"]
    }],
    getSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}"],
    getSelfHostedRunnerForRepo: ["GET /repos/{owner}/{repo}/actions/runners/{runner_id}"],
    getWorkflow: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],
    getWorkflowJob: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}", {}, {
      renamed: ["actions", "getJobForWorkflowRun"]
    }],
    getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
    getWorkflowRunUsage: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing"],
    getWorkflowUsage: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing"],
    listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
    listDownloadsForSelfHostedRunnerApplication: ["GET /repos/{owner}/{repo}/actions/runners/downloads", {}, {
      renamed: ["actions", "listRunnerApplicationsForRepo"]
    }],
    listJobsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"],
    listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
    listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
    listRepoWorkflowRuns: ["GET /repos/{owner}/{repo}/actions/runs", {}, {
      renamed: ["actions", "listWorkflowRunsForRepo"]
    }],
    listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
    listRunnerApplicationsForOrg: ["GET /orgs/{org}/actions/runners/downloads"],
    listRunnerApplicationsForRepo: ["GET /repos/{owner}/{repo}/actions/runners/downloads"],
    listSecretsForRepo: ["GET /repos/{owner}/{repo}/actions/secrets", {}, {
      renamed: ["actions", "listRepoSecrets"]
    }],
    listSelectedReposForOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}/repositories"],
    listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
    listSelfHostedRunnersForRepo: ["GET /repos/{owner}/{repo}/actions/runners"],
    listWorkflowJobLogs: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs", {}, {
      renamed: ["actions", "downloadWorkflowJobLogs"]
    }],
    listWorkflowRunArtifacts: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"],
    listWorkflowRunLogs: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs", {}, {
      renamed: ["actions", "downloadWorkflowRunLogs"]
    }],
    listWorkflowRuns: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"],
    listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
    reRunWorkflow: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun"],
    removeSelectedRepoFromOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
    removeSelfHostedRunner: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}", {}, {
      renamed: ["actions", "deleteSelfHostedRunnerFromRepo"]
    }],
    setSelectedReposForOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories"]
  },
  activity: {
    checkRepoIsStarredByAuthenticatedUser: ["GET /user/starred/{owner}/{repo}"],
    checkStarringRepo: ["GET /user/starred/{owner}/{repo}", {}, {
      renamed: ["activity", "checkRepoIsStarredByAuthenticatedUser"]
    }],
    deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
    deleteThreadSubscription: ["DELETE /notifications/threads/{thread_id}/subscription"],
    getFeeds: ["GET /feeds"],
    getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
    getThread: ["GET /notifications/threads/{thread_id}"],
    getThreadSubscription: ["PUT /notifications", {}, {
      renamed: ["activity", "getThreadSubscriptionForAuthenticatedUser"]
    }],
    getThreadSubscriptionForAuthenticatedUser: ["GET /notifications/threads/{thread_id}/subscription"],
    listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
    listEventsForOrg: ["GET /users/{username}/events/orgs/{org}", {}, {
      renamed: ["activity", "listOrgEventsForAuthenticatedUser"]
    }],
    listEventsForUser: ["GET /users/{username}/events", {}, {
      renamed: ["activity", "listEventsForAuthenticatedUser"]
    }],
    listFeeds: ["GET /feeds", {}, {
      renamed: ["activity", "getFeeds"]
    }],
    listNotifications: ["GET /notifications", {}, {
      renamed: ["activity", "listNotificationsForAuthenticatedUser"]
    }],
    listNotificationsForAuthenticatedUser: ["GET /notifications"],
    listNotificationsForRepo: ["GET /repos/{owner}/{repo}/notifications", {}, {
      renamed: ["activity", "listRepoNotificationsForAuthenticatedUser"]
    }],
    listOrgEventsForAuthenticatedUser: ["GET /users/{username}/events/orgs/{org}"],
    listPublicEvents: ["GET /events"],
    listPublicEventsForOrg: ["GET /orgs/{org}/events", {}, {
      renamed: ["activity", "listPublicOrgEvents"]
    }],
    listPublicEventsForRepoNetwork: ["GET /networks/{owner}/{repo}/events"],
    listPublicEventsForUser: ["GET /users/{username}/events/public"],
    listPublicOrgEvents: ["GET /orgs/{org}/events"],
    listReceivedEventsForUser: ["GET /users/{username}/received_events"],
    listReceivedPublicEventsForUser: ["GET /users/{username}/received_events/public"],
    listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
    listRepoNotificationsForAuthenticatedUser: ["GET /repos/{owner}/{repo}/notifications"],
    listReposStarredByAuthenticatedUser: ["GET /user/starred"],
    listReposStarredByUser: ["GET /users/{username}/starred"],
    listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
    listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
    listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
    listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
    markAsRead: ["PUT /notifications", {}, {
      renamed: ["activity", "markNotificationsAsRead"]
    }],
    markNotificationsAsRead: ["PUT /notifications"],
    markNotificationsAsReadForRepo: ["PUT /repos/{owner}/{repo}/notifications", {}, {
      renamed: ["activity", "markRepoNotificationsAsRead"]
    }],
    markRepoNotificationsAsRead: ["PUT /repos/{owner}/{repo}/notifications"],
    markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
    setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
    setThreadSubscription: ["PUT /notifications/threads/{thread_id}/subscription"],
    starRepo: ["PUT /user/starred/{owner}/{repo}", {}, {
      renamed: ["activity", "starRepoForAuthenticatedUser"]
    }],
    starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
    unstarRepo: ["DELETE /user/starred/{owner}/{repo}", {}, {
      renamed: ["activity", "unstarRepoForAuthenticatedUser"]
    }],
    unstarRepoForAuthenticatedUser: ["DELETE /user/starred/{owner}/{repo}"]
  },
  apps: {
    addRepoToInstallation: ["PUT /user/installations/{installation_id}/repositories/{repository_id}", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    checkAccountIsAssociatedWithAny: ["GET /marketplace_listing/accounts/{account_id}", {}, {
      renamed: ["apps", "getSubscriptionPlanForAccount"]
    }],
    checkAccountIsAssociatedWithAnyStubbed: ["GET /marketplace_listing/stubbed/accounts/{account_id}", {}, {
      renamed: ["apps", "getSubscriptionPlanForAccountStubbed"]
    }],
    checkToken: ["POST /applications/{client_id}/token"],
    createContentAttachment: ["POST /content_references/{content_reference_id}/attachments", {
      mediaType: {
        previews: ["corsair"]
      }
    }],
    createFromManifest: ["POST /app-manifests/{code}/conversions"],
    createInstallationAccessToken: ["POST /app/installations/{installation_id}/access_tokens", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    createInstallationToken: ["POST /app/installations/{installation_id}/access_tokens", {
      mediaType: {
        previews: ["machine-man"]
      }
    }, {
      renamed: ["apps", "createInstallationAccessToken"]
    }],
    deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
    deleteInstallation: ["DELETE /app/installations/{installation_id}", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    deleteToken: ["DELETE /applications/{client_id}/token"],
    getAuthenticated: ["GET /app", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    getBySlug: ["GET /apps/{app_slug}", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    getInstallation: ["GET /app/installations/{installation_id}", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    getOrgInstallation: ["GET /orgs/{org}/installation", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    getRepoInstallation: ["GET /repos/{owner}/{repo}/installation", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    getSubscriptionPlanForAccount: ["GET /marketplace_listing/accounts/{account_id}"],
    getSubscriptionPlanForAccountStubbed: ["GET /marketplace_listing/stubbed/accounts/{account_id}"],
    getUserInstallation: ["GET /users/{username}/installation", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    listAccountsForPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts"],
    listAccountsForPlanStubbed: ["GET /marketplace_listing/stubbed/plans/{plan_id}/accounts"],
    listAccountsUserOrOrgOnPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts", {}, {
      renamed: ["apps", "listAccountsForPlan"]
    }],
    listAccountsUserOrOrgOnPlanStubbed: ["GET /marketplace_listing/stubbed/plans/{plan_id}/accounts", {}, {
      renamed: ["apps", "listAccountsForPlanStubbed"]
    }],
    listInstallationReposForAuthenticatedUser: ["GET /user/installations/{installation_id}/repositories", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    listInstallations: ["GET /app/installations", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    listInstallationsForAuthenticatedUser: ["GET /user/installations", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    listMarketplacePurchasesForAuthenticatedUser: ["GET /user/marketplace_purchases", {}, {
      renamed: ["apps", "listSubscriptionsForAuthenticatedUser"]
    }],
    listMarketplacePurchasesForAuthenticatedUserStubbed: ["GET /user/marketplace_purchases/stubbed", {}, {
      renamed: ["apps", "listSubscriptionsForAuthenticatedUserStubbed"]
    }],
    listPlans: ["GET /marketplace_listing/plans"],
    listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
    listRepos: ["GET /installation/repositories", {
      mediaType: {
        previews: ["machine-man"]
      }
    }, {
      renamed: ["apps", "listReposAccessibleToInstallation"]
    }],
    listReposAccessibleToInstallation: ["GET /installation/repositories", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    listSubscriptionsForAuthenticatedUser: ["GET /user/marketplace_purchases"],
    listSubscriptionsForAuthenticatedUserStubbed: ["GET /user/marketplace_purchases/stubbed"],
    removeRepoFromInstallation: ["DELETE /user/installations/{installation_id}/repositories/{repository_id}", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    resetToken: ["PATCH /applications/{client_id}/token"],
    revokeInstallationAccessToken: ["DELETE /installation/token"],
    revokeInstallationToken: ["DELETE /installation/token", {}, {
      renamed: ["apps", "revokeInstallationAccessToken"]
    }],
    suspendInstallation: ["PUT /app/installations/{installation_id}/suspended"],
    unsuspendInstallation: ["DELETE /app/installations/{installation_id}/suspended"]
  },
  checks: {
    create: ["POST /repos/{owner}/{repo}/check-runs", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    createSuite: ["POST /repos/{owner}/{repo}/check-suites", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    listAnnotations: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    listForSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    listSuitesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-suites", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    rerequestSuite: ["POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    setSuitesPreferences: ["PATCH /repos/{owner}/{repo}/check-suites/preferences", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}", {
      mediaType: {
        previews: ["antiope"]
      }
    }]
  },
  codeScanning: {
    getAlert: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_id}"],
    listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"]
  },
  codesOfConduct: {
    getAllCodesOfConduct: ["GET /codes_of_conduct", {
      mediaType: {
        previews: ["scarlet-witch"]
      }
    }],
    getConductCode: ["GET /codes_of_conduct/{key}", {
      mediaType: {
        previews: ["scarlet-witch"]
      }
    }],
    getForRepo: ["GET /repos/{owner}/{repo}/community/code_of_conduct", {
      mediaType: {
        previews: ["scarlet-witch"]
      }
    }],
    listConductCodes: ["GET /codes_of_conduct", {
      mediaType: {
        previews: ["scarlet-witch"]
      }
    }, {
      renamed: ["codesOfConduct", "getAllCodesOfConduct"]
    }]
  },
  emojis: {
    get: ["GET /emojis"]
  },
  gists: {
    checkIsStarred: ["GET /gists/{gist_id}/star"],
    create: ["POST /gists"],
    createComment: ["POST /gists/{gist_id}/comments"],
    delete: ["DELETE /gists/{gist_id}"],
    deleteComment: ["DELETE /gists/{gist_id}/comments/{comment_id}"],
    fork: ["POST /gists/{gist_id}/forks"],
    get: ["GET /gists/{gist_id}"],
    getComment: ["GET /gists/{gist_id}/comments/{comment_id}"],
    getRevision: ["GET /gists/{gist_id}/{sha}"],
    list: ["GET /gists"],
    listComments: ["GET /gists/{gist_id}/comments"],
    listCommits: ["GET /gists/{gist_id}/commits"],
    listForUser: ["GET /users/{username}/gists"],
    listForks: ["GET /gists/{gist_id}/forks"],
    listPublic: ["GET /gists/public"],
    listPublicForUser: ["GET /users/{username}/gists", {}, {
      renamed: ["gists", "listForUser"]
    }],
    listStarred: ["GET /gists/starred"],
    star: ["PUT /gists/{gist_id}/star"],
    unstar: ["DELETE /gists/{gist_id}/star"],
    update: ["PATCH /gists/{gist_id}"],
    updateComment: ["PATCH /gists/{gist_id}/comments/{comment_id}"]
  },
  git: {
    createBlob: ["POST /repos/{owner}/{repo}/git/blobs"],
    createCommit: ["POST /repos/{owner}/{repo}/git/commits"],
    createRef: ["POST /repos/{owner}/{repo}/git/refs"],
    createTag: ["POST /repos/{owner}/{repo}/git/tags"],
    createTree: ["POST /repos/{owner}/{repo}/git/trees"],
    deleteRef: ["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],
    getBlob: ["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],
    getCommit: ["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],
    getRef: ["GET /repos/{owner}/{repo}/git/ref/{ref}"],
    getTag: ["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],
    getTree: ["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],
    listMatchingRefs: ["GET /repos/{owner}/{repo}/git/matching-refs/{ref}"],
    updateRef: ["PATCH /repos/{owner}/{repo}/git/refs/{ref}"]
  },
  gitignore: {
    getAllTemplates: ["GET /gitignore/templates"],
    getTemplate: ["GET /gitignore/templates/{name}"],
    listTemplates: ["GET /gitignore/templates", {}, {
      renamed: ["gitignore", "getAllTemplates"]
    }]
  },
  interactions: {
    addOrUpdateRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }, {
      renamed: ["interactions", "setRestrictionsForOrg"]
    }],
    addOrUpdateRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }, {
      renamed: ["interactions", "setRestrictionsForRepo"]
    }],
    getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    getRestrictionsForRepo: ["GET /repos/{owner}/{repo}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    removeRestrictionsForRepo: ["DELETE /repos/{owner}/{repo}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    setRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }]
  },
  issues: {
    addAssignees: ["POST /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
    addLabels: ["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    checkAssignee: ["GET /repos/{owner}/{repo}/assignees/{assignee}", {}, {
      renamed: ["issues", "checkUserCanBeAssigned"]
    }],
    checkUserCanBeAssigned: ["GET /repos/{owner}/{repo}/assignees/{assignee}"],
    create: ["POST /repos/{owner}/{repo}/issues"],
    createComment: ["POST /repos/{owner}/{repo}/issues/{issue_number}/comments"],
    createLabel: ["POST /repos/{owner}/{repo}/labels"],
    createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
    deleteComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
    deleteMilestone: ["DELETE /repos/{owner}/{repo}/milestones/{milestone_number}"],
    get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
    getComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
    getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
    getMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],
    list: ["GET /issues"],
    listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
    listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
    listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
    listEvents: ["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],
    listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
    listEventsForTimeline: ["GET /repos/{owner}/{repo}/issues/{issue_number}/timeline", {
      mediaType: {
        previews: ["mockingbird"]
      }
    }],
    listForAuthenticatedUser: ["GET /user/issues"],
    listForOrg: ["GET /orgs/{org}/issues"],
    listForRepo: ["GET /repos/{owner}/{repo}/issues"],
    listLabelsForMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels"],
    listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
    listLabelsOnIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
    listMilestonesForRepo: ["GET /repos/{owner}/{repo}/milestones", {}, {
      renamed: ["issues", "listMilestones"]
    }],
    lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    removeAllLabels: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    removeAssignees: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
    removeLabel: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}"],
    removeLabels: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels", {}, {
      renamed: ["issues", "removeAllLabels"]
    }],
    replaceAllLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels", {}, {
      renamed: ["issues", "setLabels"]
    }],
    replaceLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels", {}, {
      renamed: ["issues", "replaceAllLabels"]
    }],
    setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
    updateComment: ["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
    updateMilestone: ["PATCH /repos/{owner}/{repo}/milestones/{milestone_number}"]
  },
  licenses: {
    get: ["GET /licenses/{license}"],
    getAllCommonlyUsed: ["GET /licenses"],
    getForRepo: ["GET /repos/{owner}/{repo}/license"],
    listCommonlyUsed: ["GET /licenses", {}, {
      renamed: ["licenses", "getAllCommonlyUsed"]
    }]
  },
  markdown: {
    render: ["POST /markdown"],
    renderRaw: ["POST /markdown/raw", {
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    }]
  },
  meta: {
    get: ["GET /meta"]
  },
  migrations: {
    cancelImport: ["DELETE /repos/{owner}/{repo}/import"],
    deleteArchiveForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/archive", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    deleteArchiveForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/archive", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    downloadArchiveForOrg: ["GET /orgs/{org}/migrations/{migration_id}/archive", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    getArchiveForAuthenticatedUser: ["GET /user/migrations/{migration_id}/archive", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    getCommitAuthors: ["GET /repos/{owner}/{repo}/import/authors"],
    getImportProgress: ["GET /repos/{owner}/{repo}/import", {}, {
      renamed: ["migrations", "getImportStatus"]
    }],
    getImportStatus: ["GET /repos/{owner}/{repo}/import"],
    getLargeFiles: ["GET /repos/{owner}/{repo}/import/large_files"],
    getStatusForAuthenticatedUser: ["GET /user/migrations/{migration_id}", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    listForAuthenticatedUser: ["GET /user/migrations", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    listForOrg: ["GET /orgs/{org}/migrations", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    listReposForOrg: ["GET /orgs/{org}/migrations/{migration_id}/repositories", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    listReposForUser: ["GET /user/{migration_id}/repositories", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    mapCommitAuthor: ["PATCH /repos/{owner}/{repo}/import/authors/{author_id}"],
    setLfsPreference: ["PATCH /repos/{owner}/{repo}/import/lfs"],
    startForAuthenticatedUser: ["POST /user/migrations"],
    startForOrg: ["POST /orgs/{org}/migrations"],
    startImport: ["PUT /repos/{owner}/{repo}/import"],
    unlockRepoForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    unlockRepoForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    updateImport: ["PATCH /repos/{owner}/{repo}/import"]
  },
  orgs: {
    addOrUpdateMembership: ["PUT /orgs/{org}/memberships/{username}", {}, {
      renamed: ["orgs", "setMembershipForUser"]
    }],
    blockUser: ["PUT /orgs/{org}/blocks/{username}"],
    checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
    checkMembership: ["GET /orgs/{org}/members/{username}", {}, {
      renamed: ["orgs", "checkMembershipForUser"]
    }],
    checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
    checkPublicMembership: ["GET /orgs/{org}/public_members/{username}", {}, {
      renamed: ["orgs", "checkPublicMembershipForUser"]
    }],
    checkPublicMembershipForUser: ["GET /orgs/{org}/public_members/{username}"],
    concealMembership: ["DELETE /orgs/{org}/public_members/{username}", {}, {
      renamed: ["orgs", "removePublicMembershipForAuthenticatedUser"]
    }],
    convertMemberToOutsideCollaborator: ["PUT /orgs/{org}/outside_collaborators/{username}"],
    createHook: ["POST /orgs/{org}/hooks", {}, {
      renamed: ["orgs", "createWebhook"]
    }],
    createInvitation: ["POST /orgs/{org}/invitations"],
    createWebhook: ["POST /orgs/{org}/hooks"],
    deleteHook: ["DELETE /orgs/{org}/hooks/{hook_id}", {}, {
      renamed: ["orgs", "deleteWebhook"]
    }],
    deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
    get: ["GET /orgs/{org}"],
    getHook: ["GET /orgs/{org}/hooks/{hook_id}", {}, {
      renamed: ["orgs", "getWebhook"]
    }],
    getMembership: ["GET /orgs/{org}/memberships/{username}", {}, {
      renamed: ["orgs", "getMembershipForUser"]
    }],
    getMembershipForAuthenticatedUser: ["GET /user/memberships/orgs/{org}"],
    getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
    getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
    list: ["GET /organizations"],
    listAppInstallations: ["GET /orgs/{org}/installations", {
      mediaType: {
        previews: ["machine-man"]
      }
    }],
    listBlockedUsers: ["GET /orgs/{org}/blocks"],
    listForAuthenticatedUser: ["GET /user/orgs"],
    listForUser: ["GET /users/{username}/orgs"],
    listHooks: ["GET /orgs/{org}/hooks", {}, {
      renamed: ["orgs", "listWebhooks"]
    }],
    listInstallations: ["GET /orgs/{org}/installations", {
      mediaType: {
        previews: ["machine-man"]
      }
    }, {
      renamed: ["orgs", "listAppInstallations"]
    }],
    listInvitationTeams: ["GET /orgs/{org}/invitations/{invitation_id}/teams"],
    listMembers: ["GET /orgs/{org}/members"],
    listMemberships: ["GET /user/memberships/orgs", {}, {
      renamed: ["orgs", "listMembershipsForAuthenticatedUser"]
    }],
    listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
    listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
    listPendingInvitations: ["GET /orgs/{org}/invitations"],
    listPublicMembers: ["GET /orgs/{org}/public_members"],
    listWebhooks: ["GET /orgs/{org}/hooks"],
    pingHook: ["POST /orgs/{org}/hooks/{hook_id}/pings", {}, {
      renamed: ["orgs", "pingWebhook"]
    }],
    pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
    publicizeMembership: ["PUT /orgs/{org}/public_members/{username}", {}, {
      renamed: ["orgs", "setPublicMembershipForAuthenticatedUser"]
    }],
    removeMember: ["DELETE /orgs/{org}/members/{username}"],
    removeMembership: ["DELETE /orgs/{org}/memberships/{username}", {}, {
      renamed: ["orgs", "removeMembershipForUser"]
    }],
    removeMembershipForUser: ["DELETE /orgs/{org}/memberships/{username}"],
    removeOutsideCollaborator: ["DELETE /orgs/{org}/outside_collaborators/{username}"],
    removePublicMembershipForAuthenticatedUser: ["DELETE /orgs/{org}/public_members/{username}"],
    setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
    setPublicMembershipForAuthenticatedUser: ["PUT /orgs/{org}/public_members/{username}"],
    unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
    update: ["PATCH /orgs/{org}"],
    updateHook: ["PATCH /orgs/{org}/hooks/{hook_id}", {}, {
      renamed: ["orgs", "updateWebhook"]
    }],
    updateMembership: ["PATCH /user/memberships/orgs/{org}", {}, {
      renamed: ["orgs", "updateMembershipForAuthenticatedUser"]
    }],
    updateMembershipForAuthenticatedUser: ["PATCH /user/memberships/orgs/{org}"],
    updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"]
  },
  projects: {
    addCollaborator: ["PUT /projects/{project_id}/collaborators/{username}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createCard: ["POST /projects/columns/{column_id}/cards", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createColumn: ["POST /projects/{project_id}/columns", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createForAuthenticatedUser: ["POST /user/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createForOrg: ["POST /orgs/{org}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createForRepo: ["POST /repos/{owner}/{repo}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    delete: ["DELETE /projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    deleteCard: ["DELETE /projects/columns/cards/{card_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    deleteColumn: ["DELETE /projects/columns/{column_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    get: ["GET /projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    getCard: ["GET /projects/columns/cards/{card_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    getColumn: ["GET /projects/columns/{column_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    getPermissionForUser: ["GET /projects/{project_id}/collaborators/{username}/permission", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listCards: ["GET /projects/columns/{column_id}/cards", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listCollaborators: ["GET /projects/{project_id}/collaborators", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listColumns: ["GET /projects/{project_id}/columns", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listForOrg: ["GET /orgs/{org}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listForRepo: ["GET /repos/{owner}/{repo}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listForUser: ["GET /users/{username}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    moveCard: ["POST /projects/columns/cards/{card_id}/moves", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    moveColumn: ["POST /projects/columns/{column_id}/moves", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    removeCollaborator: ["DELETE /projects/{project_id}/collaborators/{username}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    reviewUserPermissionLevel: ["GET /projects/{project_id}/collaborators/{username}/permission", {
      mediaType: {
        previews: ["inertia"]
      }
    }, {
      renamed: ["projects", "getPermissionForUser"]
    }],
    update: ["PATCH /projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    updateCard: ["PATCH /projects/columns/cards/{card_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    updateColumn: ["PATCH /projects/columns/{column_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }]
  },
  pulls: {
    checkIfMerged: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    create: ["POST /repos/{owner}/{repo}/pulls"],
    createComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments", {}, {
      renamed: ["pulls", "createReviewComment"]
    }],
    createReplyForReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies"],
    createReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    createReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
    createReviewCommentReply: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies", {}, {
      renamed: ["pulls", "createReplyForReviewComment"]
    }],
    createReviewRequest: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers", {}, {
      renamed: ["pulls", "requestReviewers"]
    }],
    deleteComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}", {}, {
      renamed: ["pulls", "deleteReviewComment"]
    }],
    deletePendingReview: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
    deleteReviewComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
    deleteReviewRequest: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers", {}, {
      renamed: ["pulls", "removeRequestedReviewers"]
    }],
    dismissReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals"],
    get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
    getComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}", {}, {
      renamed: ["pulls", "getReviewComment"]
    }],
    getCommentsForReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments", {}, {
      renamed: ["pulls", "listCommentsForReview"]
    }],
    getReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
    getReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
    list: ["GET /repos/{owner}/{repo}/pulls"],
    listComments: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/comments", {}, {
      renamed: ["pulls", "listReviewComments"]
    }],
    listCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments", {}, {
      renamed: ["pulls", "listReviewCommentsForRepo"]
    }],
    listCommentsForReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments"],
    listCommits: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],
    listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
    listRequestedReviewers: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
    listReviewComments: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
    listReviewCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments"],
    listReviewRequests: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers", {}, {
      renamed: ["pulls", "listRequestedReviewers"]
    }],
    listReviews: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    removeRequestedReviewers: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
    requestReviewers: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
    submitReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events"],
    update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
    updateBranch: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch", {
      mediaType: {
        previews: ["lydian"]
      }
    }],
    updateComment: ["PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}", {}, {
      renamed: ["pulls", "updateReviewComment"]
    }],
    updateReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
    updateReviewComment: ["PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}"]
  },
  rateLimit: {
    get: ["GET /rate_limit"]
  },
  reactions: {
    createForCommitComment: ["POST /repos/{owner}/{repo}/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForIssue: ["POST /repos/{owner}/{repo}/issues/{issue_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForIssueComment: ["POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForPullRequestReviewComment: ["POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForTeamDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForTeamDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    delete: ["DELETE /reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }, {
      renamed: ["reactions", "deleteLegacy"]
    }],
    deleteForCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForIssue: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForIssueComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForPullRequestComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForTeamDiscussion: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForTeamDiscussionComment: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteLegacy: ["DELETE /reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }, {
      deprecated: "octokit.reactions.deleteLegacy() is deprecated, see https://developer.github.com/v3/reactions/#delete-a-reaction-legacy"
    }],
    listForCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForIssueComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForPullRequestReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForTeamDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForTeamDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }]
  },
  repos: {
    acceptInvitation: ["PATCH /user/repository_invitations/{invitation_id}"],
    addAppAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps"
    }],
    addCollaborator: ["PUT /repos/{owner}/{repo}/collaborators/{username}"],
    addDeployKey: ["POST /repos/{owner}/{repo}/keys", {}, {
      renamed: ["repos", "createDeployKey"]
    }],
    addProtectedBranchAdminEnforcement: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins", {}, {
      renamed: ["repos", "setAdminBranchProtection"]
    }],
    addProtectedBranchAppRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps",
      renamed: ["repos", "addAppAccessRestrictions"]
    }],
    addProtectedBranchRequiredSignatures: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
      mediaType: {
        previews: ["zzzax"]
      }
    }, {
      renamed: ["repos", "createCommitSignatureProtection"]
    }],
    addProtectedBranchRequiredStatusChecksContexts: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts",
      renamed: ["repos", "addStatusCheckContexts"]
    }],
    addProtectedBranchTeamRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams",
      renamed: ["repos", "addTeamAccessRestrictions"]
    }],
    addProtectedBranchUserRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users",
      renamed: ["repos", "addUserAccessRestrictions"]
    }],
    addStatusCheckContexts: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts"
    }],
    addTeamAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams"
    }],
    addUserAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users"
    }],
    checkCollaborator: ["GET /repos/{owner}/{repo}/collaborators/{username}"],
    checkVulnerabilityAlerts: ["GET /repos/{owner}/{repo}/vulnerability-alerts", {
      mediaType: {
        previews: ["dorian"]
      }
    }],
    compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
    createCommitComment: ["POST /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
    createCommitSignatureProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
      mediaType: {
        previews: ["zzzax"]
      }
    }],
    createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
    createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
    createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
    createDeploymentStatus: ["POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
    createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
    createForAuthenticatedUser: ["POST /user/repos"],
    createFork: ["POST /repos/{owner}/{repo}/forks"],
    createHook: ["POST /repos/{owner}/{repo}/hooks", {}, {
      renamed: ["repos", "createWebhook"]
    }],
    createInOrg: ["POST /orgs/{org}/repos"],
    createOrUpdateFile: ["PUT /repos/{owner}/{repo}/contents/{path}", {}, {
      renamed: ["repos", "createOrUpdateFileContents"]
    }],
    createOrUpdateFileContents: ["PUT /repos/{owner}/{repo}/contents/{path}"],
    createPagesSite: ["POST /repos/{owner}/{repo}/pages", {
      mediaType: {
        previews: ["switcheroo"]
      }
    }],
    createRelease: ["POST /repos/{owner}/{repo}/releases"],
    createStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}", {}, {
      renamed: ["repos", "createCommitStatus"]
    }],
    createUsingTemplate: ["POST /repos/{template_owner}/{template_repo}/generate", {
      mediaType: {
        previews: ["baptiste"]
      }
    }],
    createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
    declineInvitation: ["DELETE /user/repository_invitations/{invitation_id}"],
    delete: ["DELETE /repos/{owner}/{repo}"],
    deleteAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
    deleteAdminBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
    deleteBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"],
    deleteCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],
    deleteCommitSignatureProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
      mediaType: {
        previews: ["zzzax"]
      }
    }],
    deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
    deleteDeployment: ["DELETE /repos/{owner}/{repo}/deployments/{deployment_id}"],
    deleteDownload: ["DELETE /repos/{owner}/{repo}/downloads/{download_id}"],
    deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
    deleteHook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}", {}, {
      renamed: ["repos", "deleteWebhook"]
    }],
    deleteInvitation: ["DELETE /repos/{owner}/{repo}/invitations/{invitation_id}"],
    deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages", {
      mediaType: {
        previews: ["switcheroo"]
      }
    }],
    deletePullRequestReviewProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
    deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
    deleteReleaseAsset: ["DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
    disableAutomatedSecurityFixes: ["DELETE /repos/{owner}/{repo}/automated-security-fixes", {
      mediaType: {
        previews: ["london"]
      }
    }],
    disablePagesSite: ["DELETE /repos/{owner}/{repo}/pages", {
      mediaType: {
        previews: ["switcheroo"]
      }
    }, {
      renamed: ["repos", "deletePagesSite"]
    }],
    disableVulnerabilityAlerts: ["DELETE /repos/{owner}/{repo}/vulnerability-alerts", {
      mediaType: {
        previews: ["dorian"]
      }
    }],
    downloadArchive: ["GET /repos/{owner}/{repo}/{archive_format}/{ref}"],
    enableAutomatedSecurityFixes: ["PUT /repos/{owner}/{repo}/automated-security-fixes", {
      mediaType: {
        previews: ["london"]
      }
    }],
    enablePagesSite: ["POST /repos/{owner}/{repo}/pages", {
      mediaType: {
        previews: ["switcheroo"]
      }
    }, {
      renamed: ["repos", "createPagesSite"]
    }],
    enableVulnerabilityAlerts: ["PUT /repos/{owner}/{repo}/vulnerability-alerts", {
      mediaType: {
        previews: ["dorian"]
      }
    }],
    get: ["GET /repos/{owner}/{repo}"],
    getAccessRestrictions: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
    getAdminBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
    getAllStatusCheckContexts: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts"],
    getAllTopics: ["GET /repos/{owner}/{repo}/topics", {
      mediaType: {
        previews: ["mercy"]
      }
    }],
    getAppsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps"],
    getArchiveLink: ["GET /repos/{owner}/{repo}/{archive_format}/{ref}", {}, {
      renamed: ["repos", "downloadArchive"]
    }],
    getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
    getBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection"],
    getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
    getCodeFrequencyStats: ["GET /repos/{owner}/{repo}/stats/code_frequency"],
    getCollaboratorPermissionLevel: ["GET /repos/{owner}/{repo}/collaborators/{username}/permission"],
    getCombinedStatusForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/status"],
    getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
    getCommitActivityStats: ["GET /repos/{owner}/{repo}/stats/commit_activity"],
    getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
    getCommitSignatureProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
      mediaType: {
        previews: ["zzzax"]
      }
    }],
    getCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile"],
    getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
    getContents: ["GET /repos/{owner}/{repo}/contents/{path}", {}, {
      renamed: ["repos", "getContent"]
    }],
    getContributorsStats: ["GET /repos/{owner}/{repo}/stats/contributors"],
    getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
    getDeployment: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],
    getDeploymentStatus: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}"],
    getDownload: ["GET /repos/{owner}/{repo}/downloads/{download_id}"],
    getHook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}", {}, {
      renamed: ["repos", "getWebhook"]
    }],
    getLatestPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/latest"],
    getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
    getPages: ["GET /repos/{owner}/{repo}/pages"],
    getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
    getParticipationStats: ["GET /repos/{owner}/{repo}/stats/participation"],
    getProtectedBranchAdminEnforcement: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins", {}, {
      renamed: ["repos", "getAdminBranchProtection"]
    }],
    getProtectedBranchPullRequestReviewEnforcement: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews", {}, {
      renamed: ["repos", "getPullRequestReviewProtection"]
    }],
    getProtectedBranchRequiredSignatures: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
      mediaType: {
        previews: ["zzzax"]
      }
    }, {
      renamed: ["repos", "getCommitSignatureProtection"]
    }],
    getProtectedBranchRequiredStatusChecks: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks", {}, {
      renamed: ["repos", "getStatusChecksProtection"]
    }],
    getProtectedBranchRestrictions: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions", {}, {
      renamed: ["repos", "getAccessRestrictions"]
    }],
    getPullRequestReviewProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
    getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
    getReadme: ["GET /repos/{owner}/{repo}/readme"],
    getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
    getReleaseAsset: ["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
    getStatusChecksProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
    getTeamsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams"],
    getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
    getTopReferrers: ["GET /repos/{owner}/{repo}/traffic/popular/referrers"],
    getUsersWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users"],
    getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
    getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
    list: ["GET /user/repos", {}, {
      renamed: ["repos", "listForAuthenticatedUser"]
    }],
    listAssetsForRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}/assets", {}, {
      renamed: ["repos", "listReleaseAssets"]
    }],
    listBranches: ["GET /repos/{owner}/{repo}/branches"],
    listBranchesForHeadCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head", {
      mediaType: {
        previews: ["groot"]
      }
    }],
    listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
    listCommentsForCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
    listCommitComments: ["GET /repos/{owner}/{repo}/comments", {}, {
      renamed: ["repos", "listCommitCommentsForRepo"]
    }],
    listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
    listCommitStatusesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/statuses"],
    listCommits: ["GET /repos/{owner}/{repo}/commits"],
    listContributors: ["GET /repos/{owner}/{repo}/contributors"],
    listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
    listDeploymentStatuses: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
    listDeployments: ["GET /repos/{owner}/{repo}/deployments"],
    listDownloads: ["GET /repos/{owner}/{repo}/downloads"],
    listForAuthenticatedUser: ["GET /user/repos"],
    listForOrg: ["GET /orgs/{org}/repos"],
    listForUser: ["GET /users/{username}/repos"],
    listForks: ["GET /repos/{owner}/{repo}/forks"],
    listHooks: ["GET /repos/{owner}/{repo}/hooks", {}, {
      renamed: ["repos", "listWebhooks"]
    }],
    listInvitations: ["GET /repos/{owner}/{repo}/invitations"],
    listInvitationsForAuthenticatedUser: ["GET /user/repository_invitations"],
    listLanguages: ["GET /repos/{owner}/{repo}/languages"],
    listPagesBuilds: ["GET /repos/{owner}/{repo}/pages/builds"],
    listProtectedBranchRequiredStatusChecksContexts: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      renamed: ["repos", "getAllStatusCheckContexts"]
    }],
    listPublic: ["GET /repositories"],
    listPullRequestsAssociatedWithCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls", {
      mediaType: {
        previews: ["groot"]
      }
    }],
    listReleaseAssets: ["GET /repos/{owner}/{repo}/releases/{release_id}/assets"],
    listReleases: ["GET /repos/{owner}/{repo}/releases"],
    listStatusesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/statuses", {}, {
      renamed: ["repos", "listCommitStatusesForRef"]
    }],
    listTags: ["GET /repos/{owner}/{repo}/tags"],
    listTeams: ["GET /repos/{owner}/{repo}/teams"],
    listTopics: ["GET /repos/{owner}/{repo}/topics", {
      mediaType: {
        previews: ["mercy"]
      }
    }, {
      renamed: ["repos", "getAllTopics"]
    }],
    listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
    merge: ["POST /repos/{owner}/{repo}/merges"],
    pingHook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings", {}, {
      renamed: ["repos", "pingWebhook"]
    }],
    pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
    removeAppAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps"
    }],
    removeBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection", {}, {
      renamed: ["repos", "deleteBranchProtection"]
    }],
    removeCollaborator: ["DELETE /repos/{owner}/{repo}/collaborators/{username}"],
    removeDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}", {}, {
      renamed: ["repos", "deleteDeployKey"]
    }],
    removeProtectedBranchAdminEnforcement: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins", {}, {
      renamed: ["repos", "deleteAdminBranchProtection"]
    }],
    removeProtectedBranchAppRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps",
      renamed: ["repos", "removeAppAccessRestrictions"]
    }],
    removeProtectedBranchPullRequestReviewEnforcement: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews", {}, {
      renamed: ["repos", "deletePullRequestReviewProtection"]
    }],
    removeProtectedBranchRequiredSignatures: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
      mediaType: {
        previews: ["zzzax"]
      }
    }, {
      renamed: ["repos", "deleteCommitSignatureProtection"]
    }],
    removeProtectedBranchRequiredStatusChecks: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks", {}, {
      renamed: ["repos", "removeStatusChecksProtection"]
    }],
    removeProtectedBranchRequiredStatusChecksContexts: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts",
      renamed: ["repos", "removeStatusCheckContexts"]
    }],
    removeProtectedBranchRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions", {}, {
      renamed: ["repos", "deleteAccessRestrictions"]
    }],
    removeProtectedBranchTeamRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams",
      renamed: ["repos", "removeTeamAccessRestrictions"]
    }],
    removeProtectedBranchUserRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users",
      renamed: ["repos", "removeUserAccessRestrictions"]
    }],
    removeStatusCheckContexts: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts"
    }],
    removeStatusCheckProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
    removeTeamAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams"
    }],
    removeUserAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users"
    }],
    replaceAllTopics: ["PUT /repos/{owner}/{repo}/topics", {
      mediaType: {
        previews: ["mercy"]
      }
    }],
    replaceProtectedBranchAppRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps",
      renamed: ["repos", "setAppAccessRestrictions"]
    }],
    replaceProtectedBranchRequiredStatusChecksContexts: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts",
      renamed: ["repos", "setStatusCheckContexts"]
    }],
    replaceProtectedBranchTeamRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams",
      renamed: ["repos", "setTeamAccessRestrictions"]
    }],
    replaceProtectedBranchUserRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users",
      renamed: ["repos", "setUserAccessRestrictions"]
    }],
    replaceTopics: ["PUT /repos/{owner}/{repo}/topics", {
      mediaType: {
        previews: ["mercy"]
      }
    }, {
      renamed: ["repos", "replaceAllTopics"]
    }],
    requestPageBuild: ["POST /repos/{owner}/{repo}/pages/builds", {}, {
      renamed: ["repos", "requestPagesBuild"]
    }],
    requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
    retrieveCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile", {}, {
      renamed: ["repos", "getCommunityProfileMetrics"]
    }],
    setAdminBranchProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
    setAppAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps"
    }],
    setStatusCheckContexts: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts"
    }],
    setTeamAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams"
    }],
    setUserAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users"
    }],
    testPushHook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests", {}, {
      renamed: ["repos", "testPushWebhook"]
    }],
    testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
    transfer: ["POST /repos/{owner}/{repo}/transfer"],
    update: ["PATCH /repos/{owner}/{repo}"],
    updateBranchProtection: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection"],
    updateCommitComment: ["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],
    updateHook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}", {}, {
      renamed: ["repos", "updateWebhook"]
    }],
    updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
    updateInvitation: ["PATCH /repos/{owner}/{repo}/invitations/{invitation_id}"],
    updateProtectedBranchPullRequestReviewEnforcement: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews", {}, {
      renamed: ["repos", "updatePullRequestReviewProtection"]
    }],
    updateProtectedBranchRequiredStatusChecks: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks", {}, {
      renamed: ["repos", "updateStatusChecksProtection"]
    }],
    updatePullRequestReviewProtection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
    updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
    updateReleaseAsset: ["PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    updateStatusCheckPotection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
    updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
    uploadReleaseAsset: ["POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}", {
      baseUrl: "https://uploads.github.com"
    }]
  },
  search: {
    code: ["GET /search/code"],
    commits: ["GET /search/commits", {
      mediaType: {
        previews: ["cloak"]
      }
    }],
    issuesAndPullRequests: ["GET /search/issues"],
    labels: ["GET /search/labels"],
    repos: ["GET /search/repositories"],
    topics: ["GET /search/topics"],
    users: ["GET /search/users"]
  },
  teams: {
    addOrUpdateMembershipForUserInOrg: ["PUT /orgs/{org}/teams/{team_slug}/memberships/{username}"],
    addOrUpdateMembershipInOrg: ["PUT /orgs/{org}/teams/{team_slug}/memberships/{username}", {}, {
      renamed: ["teams", "addOrUpdateMembershipForUserInOrg"]
    }],
    addOrUpdateProjectInOrg: ["PUT /orgs/{org}/teams/{team_slug}/projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }, {
      renamed: ["teams", "addOrUpdateProjectPermissionsInOrg"]
    }],
    addOrUpdateProjectPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    addOrUpdateRepoInOrg: ["PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}", {}, {
      renamed: ["teams", "addOrUpdateRepoPermissionsInOrg"]
    }],
    addOrUpdateRepoPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
    checkManagesRepoInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}", {}, {
      renamed: ["teams", "checkPermissionsForRepoInOrg"]
    }],
    checkPermissionsForProjectInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    checkPermissionsForRepoInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
    create: ["POST /orgs/{org}/teams"],
    createDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
    createDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions"],
    deleteDiscussionCommentInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
    deleteDiscussionInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
    deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
    getByName: ["GET /orgs/{org}/teams/{team_slug}"],
    getDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
    getDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
    getMembershipForUserInOrg: ["GET /orgs/{org}/teams/{team_slug}/memberships/{username}"],
    getMembershipInOrg: ["GET /orgs/{org}/teams/{team_slug}/memberships/{username}", {}, {
      renamed: ["teams", "getMembershipForUserInOrg"]
    }],
    list: ["GET /orgs/{org}/teams"],
    listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
    listDiscussionCommentsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
    listDiscussionsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions"],
    listForAuthenticatedUser: ["GET /user/teams"],
    listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
    listPendingInvitationsInOrg: ["GET /orgs/{org}/teams/{team_slug}/invitations"],
    listProjectsInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
    removeMembershipForUserInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}"],
    removeMembershipInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}", {}, {
      renamed: ["teams", "removeMembershipForUserInOrg"]
    }],
    removeProjectInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/projects/{project_id}"],
    removeRepoInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
    reviewProjectInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }, {
      renamed: ["teams", "checkPermissionsForProjectInOrg"]
    }],
    updateDiscussionCommentInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
    updateDiscussionInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
    updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"]
  },
  users: {
    addEmailForAuthenticated: ["POST /user/emails"],
    addEmails: ["POST /user/emails", {}, {
      renamed: ["users", "addEmailsForAuthenticated"]
    }],
    block: ["PUT /user/blocks/{username}"],
    checkBlocked: ["GET /user/blocks/{username}"],
    checkFollowing: ["GET /user/following/{username}", {}, {
      renamed: ["users", "checkPersonIsFollowedByAuthenticated"]
    }],
    checkFollowingForUser: ["GET /users/{username}/following/{target_user}"],
    checkPersonIsFollowedByAuthenticated: ["GET /user/following/{username}"],
    createGpgKey: ["POST /user/gpg_keys", {}, {
      renamed: ["users", "createGpgKeyForAuthenticated"]
    }],
    createGpgKeyForAuthenticated: ["POST /user/gpg_keys"],
    createPublicKey: ["POST /user/keys", {}, {
      renamed: ["users", "createPublicSshKeyForAuthenticated"]
    }],
    createPublicSshKeyForAuthenticated: ["POST /user/keys"],
    deleteEmailForAuthenticated: ["DELETE /user/emails"],
    deleteEmails: ["DELETE /user/emails", {}, {
      renamed: ["users", "deleteEmailsForAuthenticated"]
    }],
    deleteGpgKey: ["DELETE /user/gpg_keys/{gpg_key_id}", {}, {
      renamed: ["users", "deleteGpgKeyForAuthenticated"]
    }],
    deleteGpgKeyForAuthenticated: ["DELETE /user/gpg_keys/{gpg_key_id}"],
    deletePublicKey: ["DELETE /user/keys/{key_id}", {}, {
      renamed: ["users", "deletePublicSshKeyForAuthenticated"]
    }],
    deletePublicSshKeyForAuthenticated: ["DELETE /user/keys/{key_id}"],
    follow: ["PUT /user/following/{username}"],
    getAuthenticated: ["GET /user"],
    getByUsername: ["GET /users/{username}"],
    getContextForUser: ["GET /users/{username}/hovercard"],
    getGpgKey: ["GET /user/gpg_keys/{gpg_key_id}", {}, {
      renamed: ["users", "getGpgKeyForAuthenticated"]
    }],
    getGpgKeyForAuthenticated: ["GET /user/gpg_keys/{gpg_key_id}"],
    getPublicKey: ["GET /user/keys/{key_id}", {}, {
      renamed: ["users", "getPublicSshKeyForAuthenticated"]
    }],
    getPublicSshKeyForAuthenticated: ["GET /user/keys/{key_id}"],
    list: ["GET /users"],
    listBlocked: ["GET /user/blocks", {}, {
      renamed: ["users", "listBlockedByAuthenticated"]
    }],
    listBlockedByAuthenticated: ["GET /user/blocks"],
    listEmails: ["GET /user/emails", {}, {
      renamed: ["users", "listEmailsForAuthenticated"]
    }],
    listEmailsForAuthenticated: ["GET /user/emails"],
    listFollowedByAuthenticated: ["GET /user/following"],
    listFollowersForAuthenticatedUser: ["GET /user/followers"],
    listFollowersForUser: ["GET /users/{username}/followers"],
    listFollowingForAuthenticatedUser: ["GET /user/following", {}, {
      renamed: ["users", "listFollowedByAuthenticated"]
    }],
    listFollowingForUser: ["GET /users/{username}/following"],
    listGpgKeys: ["GET /user/gpg_keys", {}, {
      renamed: ["users", "listGpgKeysForAuthenticated"]
    }],
    listGpgKeysForAuthenticated: ["GET /user/gpg_keys"],
    listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
    listPublicEmails: ["GET /user/public_emails", {}, {
      renamed: ["users", "listPublicEmailsForAuthenticatedUser"]
    }],
    listPublicEmailsForAuthenticated: ["GET /user/public_emails"],
    listPublicKeys: ["GET /user/keys", {}, {
      renamed: ["users", "listPublicSshKeysForAuthenticated"]
    }],
    listPublicKeysForUser: ["GET /users/{username}/keys"],
    listPublicSshKeysForAuthenticated: ["GET /user/keys"],
    setPrimaryEmailVisibilityForAuthenticated: ["PATCH /user/email/visibility"],
    togglePrimaryEmailVisibility: ["PATCH /user/email/visibility", {}, {
      renamed: ["users", "setPrimaryEmailVisibilityForAuthenticated"]
    }],
    unblock: ["DELETE /user/blocks/{username}"],
    unfollow: ["DELETE /user/following/{username}"],
    updateAuthenticated: ["PATCH /user"]
  }
};

const VERSION = "3.17.0";

function endpointsToMethods(octokit, endpointsMap) {
  const newMethods = {};

  for (const [scope, endpoints] of Object.entries(endpointsMap)) {
    for (const [methodName, endpoint] of Object.entries(endpoints)) {
      const [route, defaults, decorations] = endpoint;
      const [method, url] = route.split(/ /);
      const endpointDefaults = Object.assign({
        method,
        url
      }, defaults);

      if (!newMethods[scope]) {
        newMethods[scope] = {};
      }

      const scopeMethods = newMethods[scope];

      if (decorations) {
        scopeMethods[methodName] = decorate(octokit, scope, methodName, endpointDefaults, decorations);
        continue;
      }

      scopeMethods[methodName] = octokit.request.defaults(endpointDefaults);
    }
  }

  return newMethods;
}

function decorate(octokit, scope, methodName, defaults, decorations) {
  const requestWithDefaults = octokit.request.defaults(defaults);

  function withDecorations(...args) {
    // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
    let options = requestWithDefaults.endpoint.merge(...args); // There are currently no other decorations than `.mapToData`

    if (decorations.mapToData) {
      options = Object.assign({}, options, {
        data: options[decorations.mapToData],
        [decorations.mapToData]: undefined
      });
      return requestWithDefaults(options);
    } // NOTE: there are currently no deprecations. But we keep the code
    //       below for future reference


    if (decorations.renamed) {
      const [newScope, newMethodName] = decorations.renamed;
      octokit.log.warn(`octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`);
    }

    if (decorations.deprecated) {
      octokit.log.warn(decorations.deprecated);
    }

    if (decorations.renamedParameters) {
      // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
      const options = requestWithDefaults.endpoint.merge(...args);

      for (const [name, alias] of Object.entries(decorations.renamedParameters)) {
        // There is currently no deprecated parameter that is optional,
        // so we never hit the else branch below at this point.

        /* istanbul ignore else */
        if (name in options) {
          octokit.log.warn(`"${name}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`);

          if (!(alias in options)) {
            options[alias] = options[name];
          }

          delete options[name];
        }
      }

      return requestWithDefaults(options);
    } // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488


    return requestWithDefaults(...args);
  }

  return Object.assign(withDecorations, requestWithDefaults);
}

/**
 * This plugin is a 1:1 copy of internal @octokit/rest plugins. The primary
 * goal is to rebuild @octokit/rest on top of @octokit/core. Once that is
 * done, we will remove the registerEndpoints methods and return the methods
 * directly as with the other plugins. At that point we will also remove the
 * legacy workarounds and deprecations.
 *
 * See the plan at
 * https://github.com/octokit/plugin-rest-endpoint-methods.js/pull/1
 */

function restEndpointMethods(octokit) {
  return endpointsToMethods(octokit, Endpoints);
}
restEndpointMethods.VERSION = VERSION;

exports.restEndpointMethods = restEndpointMethods;
//# sourceMappingURL=index.js.map


/***/ }),
/* 843 */,
/* 844 */,
/* 845 */,
/* 846 */,
/* 847 */,
/* 848 */,
/* 849 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const u = __webpack_require__(676).fromCallback
const path = __webpack_require__(622)
const fs = __webpack_require__(598)
const _mkdirs = __webpack_require__(727)
const mkdirs = _mkdirs.mkdirs
const mkdirsSync = _mkdirs.mkdirsSync

const _symlinkPaths = __webpack_require__(930)
const symlinkPaths = _symlinkPaths.symlinkPaths
const symlinkPathsSync = _symlinkPaths.symlinkPathsSync

const _symlinkType = __webpack_require__(975)
const symlinkType = _symlinkType.symlinkType
const symlinkTypeSync = _symlinkType.symlinkTypeSync

const pathExists = __webpack_require__(322).pathExists

function createSymlink (srcpath, dstpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback
  type = (typeof type === 'function') ? false : type

  pathExists(dstpath, (err, destinationExists) => {
    if (err) return callback(err)
    if (destinationExists) return callback(null)
    symlinkPaths(srcpath, dstpath, (err, relative) => {
      if (err) return callback(err)
      srcpath = relative.toDst
      symlinkType(relative.toCwd, type, (err, type) => {
        if (err) return callback(err)
        const dir = path.dirname(dstpath)
        pathExists(dir, (err, dirExists) => {
          if (err) return callback(err)
          if (dirExists) return fs.symlink(srcpath, dstpath, type, callback)
          mkdirs(dir, err => {
            if (err) return callback(err)
            fs.symlink(srcpath, dstpath, type, callback)
          })
        })
      })
    })
  })
}

function createSymlinkSync (srcpath, dstpath, type) {
  const destinationExists = fs.existsSync(dstpath)
  if (destinationExists) return undefined

  const relative = symlinkPathsSync(srcpath, dstpath)
  srcpath = relative.toDst
  type = symlinkTypeSync(relative.toCwd, type)
  const dir = path.dirname(dstpath)
  const exists = fs.existsSync(dir)
  if (exists) return fs.symlinkSync(srcpath, dstpath, type)
  mkdirsSync(dir)
  return fs.symlinkSync(srcpath, dstpath, type)
}

module.exports = {
  createSymlink: u(createSymlink),
  createSymlinkSync
}


/***/ }),
/* 850 */,
/* 851 */,
/* 852 */,
/* 853 */,
/* 854 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlRtspRequest = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be82545348/include/curl/curl.h#L1987
/**
 * Object with constants for option `RTSP_REQUEST`
 * Only available on libcurl >= 7.20
 *
 * `CURL_RTSPREQ_OPTIONS` becomes `CurlRtspRequest.Options`
 *
 * @public
 */
var CurlRtspRequest;
(function (CurlRtspRequest) {
    CurlRtspRequest[CurlRtspRequest["None"] = 0] = "None";
    CurlRtspRequest[CurlRtspRequest["Options"] = 1] = "Options";
    CurlRtspRequest[CurlRtspRequest["Describe"] = 2] = "Describe";
    CurlRtspRequest[CurlRtspRequest["Announce"] = 3] = "Announce";
    CurlRtspRequest[CurlRtspRequest["Setup"] = 4] = "Setup";
    CurlRtspRequest[CurlRtspRequest["Play"] = 5] = "Play";
    CurlRtspRequest[CurlRtspRequest["Pause"] = 6] = "Pause";
    CurlRtspRequest[CurlRtspRequest["Teardown"] = 7] = "Teardown";
    CurlRtspRequest[CurlRtspRequest["GetParameter"] = 8] = "GetParameter";
    CurlRtspRequest[CurlRtspRequest["SetParameter"] = 9] = "SetParameter";
    CurlRtspRequest[CurlRtspRequest["Record"] = 10] = "Record";
    CurlRtspRequest[CurlRtspRequest["Receive"] = 11] = "Receive";
})(CurlRtspRequest = exports.CurlRtspRequest || (exports.CurlRtspRequest = {}));
//# sourceMappingURL=CurlRtspRequest.js.map

/***/ }),
/* 855 */,
/* 856 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlReadFunc = void 0;
/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// https://github.com/curl/curl/blob/e1be8254534898fccafc5d6cd04f6235f283cfbd/include/curl/curl.h#L361-L366
/**
 * Special return codes for `READFUNCTION` option
 *
 * `CURL_READFUNC_ABORT` becomes `CurlReadFunc.Abort`
 *
 * @public
 */
var CurlReadFunc;
(function (CurlReadFunc) {
    CurlReadFunc[CurlReadFunc["Abort"] = 268435456] = "Abort";
    CurlReadFunc[CurlReadFunc["Pause"] = 268435457] = "Pause";
})(CurlReadFunc = exports.CurlReadFunc || (exports.CurlReadFunc = {}));
//# sourceMappingURL=CurlReadFunc.js.map

/***/ }),
/* 857 */,
/* 858 */,
/* 859 */,
/* 860 */,
/* 861 */,
/* 862 */
/***/ (function(__unusedmodule, exports) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

function getUserAgent() {
  if (typeof navigator === "object" && "userAgent" in navigator) {
    return navigator.userAgent;
  }

  if (typeof process === "object" && "version" in process) {
    return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
  }

  return "<environment undetectable>";
}

exports.getUserAgent = getUserAgent;
//# sourceMappingURL=index.js.map


/***/ }),
/* 863 */,
/* 864 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(35);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),
/* 865 */,
/* 866 */
/***/ (function(module) {

module.exports = removeHook

function removeHook (state, name, method) {
  if (!state.registry[name]) {
    return
  }

  var index = state.registry[name]
    .map(function (registered) { return registered.orig })
    .indexOf(method)

  if (index === -1) {
    return
  }

  state.registry[name].splice(index, 1)
}


/***/ }),
/* 867 */
/***/ (function(module) {

module.exports = require("tty");

/***/ }),
/* 868 */,
/* 869 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

// This is adapted from https://github.com/normalize/mz
// Copyright (c) 2014-2016 Jonathan Ong me@jongleberry.com and Contributors
const u = __webpack_require__(676).fromCallback
const fs = __webpack_require__(598)

const api = [
  'access',
  'appendFile',
  'chmod',
  'chown',
  'close',
  'copyFile',
  'fchmod',
  'fchown',
  'fdatasync',
  'fstat',
  'fsync',
  'ftruncate',
  'futimes',
  'lchmod',
  'lchown',
  'link',
  'lstat',
  'mkdir',
  'mkdtemp',
  'open',
  'opendir',
  'readdir',
  'readFile',
  'readlink',
  'realpath',
  'rename',
  'rmdir',
  'stat',
  'symlink',
  'truncate',
  'unlink',
  'utimes',
  'writeFile'
].filter(key => {
  // Some commands are not available on some systems. Ex:
  // fs.opendir was added in Node.js v12.12.0
  // fs.lchown is not available on at least some Linux
  return typeof fs[key] === 'function'
})

// Export all keys:
Object.keys(fs).forEach(key => {
  if (key === 'promises') {
    // fs.promises is a getter property that triggers ExperimentalWarning
    // Don't re-export it here, the getter is defined in "lib/index.js"
    return
  }
  exports[key] = fs[key]
})

// Universalify async methods:
api.forEach(method => {
  exports[method] = u(fs[method])
})

// We differ from mz/fs in that we still ship the old, broken, fs.exists()
// since we are a drop-in replacement for the native module
exports.exists = function (filename, callback) {
  if (typeof callback === 'function') {
    return fs.exists(filename, callback)
  }
  return new Promise(resolve => {
    return fs.exists(filename, resolve)
  })
}

// fs.read(), fs.write(), & fs.writev() need special treatment due to multiple callback args

exports.read = function (fd, buffer, offset, length, position, callback) {
  if (typeof callback === 'function') {
    return fs.read(fd, buffer, offset, length, position, callback)
  }
  return new Promise((resolve, reject) => {
    fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
      if (err) return reject(err)
      resolve({ bytesRead, buffer })
    })
  })
}

// Function signature can be
// fs.write(fd, buffer[, offset[, length[, position]]], callback)
// OR
// fs.write(fd, string[, position[, encoding]], callback)
// We need to handle both cases, so we use ...args
exports.write = function (fd, buffer, ...args) {
  if (typeof args[args.length - 1] === 'function') {
    return fs.write(fd, buffer, ...args)
  }

  return new Promise((resolve, reject) => {
    fs.write(fd, buffer, ...args, (err, bytesWritten, buffer) => {
      if (err) return reject(err)
      resolve({ bytesWritten, buffer })
    })
  })
}

// fs.writev only available in Node v12.9.0+
if (typeof fs.writev === 'function') {
  // Function signature is
  // s.writev(fd, buffers[, position], callback)
  // We need to handle the optional arg, so we use ...args
  exports.writev = function (fd, buffers, ...args) {
    if (typeof args[args.length - 1] === 'function') {
      return fs.writev(fd, buffers, ...args)
    }

    return new Promise((resolve, reject) => {
      fs.writev(fd, buffers, ...args, (err, bytesWritten, buffers) => {
        if (err) return reject(err)
        resolve({ bytesWritten, buffers })
      })
    })
  }
}

// fs.realpath.native only available in Node v9.2+
if (typeof fs.realpath.native === 'function') {
  exports.realpath.native = u(fs.realpath.native)
}


/***/ }),
/* 870 */,
/* 871 */,
/* 872 */,
/* 873 */,
/* 874 */,
/* 875 */,
/* 876 */,
/* 877 */,
/* 878 */,
/* 879 */
/***/ (function(module) {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),
/* 880 */,
/* 881 */,
/* 882 */,
/* 883 */,
/* 884 */,
/* 885 */,
/* 886 */,
/* 887 */
/***/ (function(module) {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),
/* 888 */,
/* 889 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

var core = __webpack_require__(448);
var pluginRequestLog = __webpack_require__(916);
var pluginPaginateRest = __webpack_require__(299);
var pluginRestEndpointMethods = __webpack_require__(842);

const VERSION = "17.11.2";

const Octokit = core.Octokit.plugin(pluginRequestLog.requestLog, pluginRestEndpointMethods.restEndpointMethods, pluginPaginateRest.paginateRest).defaults({
  userAgent: `octokit-rest.js/${VERSION}`
});

exports.Octokit = Octokit;
//# sourceMappingURL=index.js.map


/***/ }),
/* 890 */,
/* 891 */,
/* 892 */,
/* 893 */,
/* 894 */,
/* 895 */,
/* 896 */,
/* 897 */,
/* 898 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

var request = __webpack_require__(753);
var universalUserAgent = __webpack_require__(862);

const VERSION = "4.5.4";

class GraphqlError extends Error {
  constructor(request, response) {
    const message = response.data.errors[0].message;
    super(message);
    Object.assign(this, response.data);
    Object.assign(this, {
      headers: response.headers
    });
    this.name = "GraphqlError";
    this.request = request; // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

}

const NON_VARIABLE_OPTIONS = ["method", "baseUrl", "url", "headers", "request", "query", "mediaType"];
function graphql(request, query, options) {
  options = typeof query === "string" ? options = Object.assign({
    query
  }, options) : options = query;
  const requestOptions = Object.keys(options).reduce((result, key) => {
    if (NON_VARIABLE_OPTIONS.includes(key)) {
      result[key] = options[key];
      return result;
    }

    if (!result.variables) {
      result.variables = {};
    }

    result.variables[key] = options[key];
    return result;
  }, {});
  return request(requestOptions).then(response => {
    if (response.data.errors) {
      const headers = {};

      for (const key of Object.keys(response.headers)) {
        headers[key] = response.headers[key];
      }

      throw new GraphqlError(requestOptions, {
        headers,
        data: response.data
      });
    }

    return response.data.data;
  });
}

function withDefaults(request$1, newDefaults) {
  const newRequest = request$1.defaults(newDefaults);

  const newApi = (query, options) => {
    return graphql(newRequest, query, options);
  };

  return Object.assign(newApi, {
    defaults: withDefaults.bind(null, newRequest),
    endpoint: request.request.endpoint
  });
}

const graphql$1 = withDefaults(request.request, {
  headers: {
    "user-agent": `octokit-graphql.js/${VERSION} ${universalUserAgent.getUserAgent()}`
  },
  method: "POST",
  url: "/graphql"
});
function withCustomRequest(customRequest) {
  return withDefaults(customRequest, {
    method: "POST",
    url: "/graphql"
  });
}

exports.graphql = graphql$1;
exports.withCustomRequest = withCustomRequest;
//# sourceMappingURL=index.js.map


/***/ }),
/* 899 */,
/* 900 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const u = __webpack_require__(676).fromCallback
const path = __webpack_require__(622)
const fs = __webpack_require__(598)
const mkdir = __webpack_require__(727)
const pathExists = __webpack_require__(322).pathExists

function createLink (srcpath, dstpath, callback) {
  function makeLink (srcpath, dstpath) {
    fs.link(srcpath, dstpath, err => {
      if (err) return callback(err)
      callback(null)
    })
  }

  pathExists(dstpath, (err, destinationExists) => {
    if (err) return callback(err)
    if (destinationExists) return callback(null)
    fs.lstat(srcpath, (err) => {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureLink')
        return callback(err)
      }

      const dir = path.dirname(dstpath)
      pathExists(dir, (err, dirExists) => {
        if (err) return callback(err)
        if (dirExists) return makeLink(srcpath, dstpath)
        mkdir.mkdirs(dir, err => {
          if (err) return callback(err)
          makeLink(srcpath, dstpath)
        })
      })
    })
  })
}

function createLinkSync (srcpath, dstpath) {
  const destinationExists = fs.existsSync(dstpath)
  if (destinationExists) return undefined

  try {
    fs.lstatSync(srcpath)
  } catch (err) {
    err.message = err.message.replace('lstat', 'ensureLink')
    throw err
  }

  const dir = path.dirname(dstpath)
  const dirExists = fs.existsSync(dir)
  if (dirExists) return fs.linkSync(srcpath, dstpath)
  mkdir.mkdirsSync(dir)

  return fs.linkSync(srcpath, dstpath)
}

module.exports = {
  createLink: u(createLink),
  createLinkSync
}


/***/ }),
/* 901 */,
/* 902 */,
/* 903 */,
/* 904 */,
/* 905 */,
/* 906 */,
/* 907 */,
/* 908 */,
/* 909 */,
/* 910 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";
// JS-YAML's default schema for `load` function.
// It is not described in the YAML specification.
//
// This schema is based on JS-YAML's default safe schema and includes
// JavaScript-specific types: !!js/undefined, !!js/regexp and !!js/function.
//
// Also this schema is used as default base schema at `Schema.create` function.





var Schema = __webpack_require__(733);


module.exports = Schema.DEFAULT = new Schema({
  include: [
    __webpack_require__(830)
  ],
  explicit: [
    __webpack_require__(386),
    __webpack_require__(629),
    __webpack_require__(352)
  ]
});


/***/ }),
/* 911 */,
/* 912 */,
/* 913 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


/*eslint-disable no-bitwise*/

var NodeBuffer;

try {
  // A trick for browserified version, to not include `Buffer` shim
  var _require = require;
  NodeBuffer = _require('buffer').Buffer;
} catch (__) {}

var Type       = __webpack_require__(945);


// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


function resolveYamlBinary(data) {
  if (data === null) return false;

  var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

  // Convert one by one.
  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx));

    // Skip CR/LF
    if (code > 64) continue;

    // Fail on illegal characters
    if (code < 0) return false;

    bitlen += 6;
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0;
}

function constructYamlBinary(data) {
  var idx, tailbits,
      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
      max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = [];

  // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx));
  }

  // Dump tail

  tailbits = (max % 4) * 6;

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF);
    result.push((bits >> 8) & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF);
    result.push((bits >> 2) & 0xFF);
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF);
  }

  // Wrap into Buffer for NodeJS and leave Array for browser
  if (NodeBuffer) {
    // Support node 6.+ Buffer API when available
    return NodeBuffer.from ? NodeBuffer.from(result) : new NodeBuffer(result);
  }

  return result;
}

function representYamlBinary(object /*, style*/) {
  var result = '', bits = 0, idx, tail,
      max = object.length,
      map = BASE64_MAP;

  // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  }

  // Dump tail

  tail = max % 3;

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F];
    result += map[(bits >> 12) & 0x3F];
    result += map[(bits >> 6) & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F];
    result += map[(bits >> 4) & 0x3F];
    result += map[(bits << 2) & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F];
    result += map[(bits << 4) & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(object) {
  return NodeBuffer && NodeBuffer.isBuffer(object);
}

module.exports = new Type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});


/***/ }),
/* 914 */,
/* 915 */,
/* 916 */
/***/ (function(__unusedmodule, exports) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

const VERSION = "1.0.0";

/**
 * @param octokit Octokit instance
 * @param options Options passed to Octokit constructor
 */

function requestLog(octokit) {
  octokit.hook.wrap("request", (request, options) => {
    octokit.log.debug("request", options);
    const start = Date.now();
    const requestOptions = octokit.request.endpoint.parse(options);
    const path = requestOptions.url.replace(options.baseUrl, "");
    return request(options).then(response => {
      octokit.log.info(`${requestOptions.method} ${path} - ${response.status} in ${Date.now() - start}ms`);
      return response;
    }).catch(error => {
      octokit.log.info(`${requestOptions.method} ${path} - ${error.status} in ${Date.now() - start}ms`);
      throw error;
    });
  });
}
requestLog.VERSION = VERSION;

exports.requestLog = requestLog;
//# sourceMappingURL=index.js.map


/***/ }),
/* 917 */,
/* 918 */,
/* 919 */,
/* 920 */,
/* 921 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var Type = __webpack_require__(945);

module.exports = new Type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return data !== null ? data : []; }
});


/***/ }),
/* 922 */,
/* 923 */,
/* 924 */,
/* 925 */,
/* 926 */,
/* 927 */,
/* 928 */,
/* 929 */,
/* 930 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const path = __webpack_require__(622)
const fs = __webpack_require__(598)
const pathExists = __webpack_require__(322).pathExists

/**
 * Function that returns two types of paths, one relative to symlink, and one
 * relative to the current working directory. Checks if path is absolute or
 * relative. If the path is relative, this function checks if the path is
 * relative to symlink or relative to current working directory. This is an
 * initiative to find a smarter `srcpath` to supply when building symlinks.
 * This allows you to determine which path to use out of one of three possible
 * types of source paths. The first is an absolute path. This is detected by
 * `path.isAbsolute()`. When an absolute path is provided, it is checked to
 * see if it exists. If it does it's used, if not an error is returned
 * (callback)/ thrown (sync). The other two options for `srcpath` are a
 * relative url. By default Node's `fs.symlink` works by creating a symlink
 * using `dstpath` and expects the `srcpath` to be relative to the newly
 * created symlink. If you provide a `srcpath` that does not exist on the file
 * system it results in a broken symlink. To minimize this, the function
 * checks to see if the 'relative to symlink' source file exists, and if it
 * does it will use it. If it does not, it checks if there's a file that
 * exists that is relative to the current working directory, if does its used.
 * This preserves the expectations of the original fs.symlink spec and adds
 * the ability to pass in `relative to current working direcotry` paths.
 */

function symlinkPaths (srcpath, dstpath, callback) {
  if (path.isAbsolute(srcpath)) {
    return fs.lstat(srcpath, (err) => {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureSymlink')
        return callback(err)
      }
      return callback(null, {
        toCwd: srcpath,
        toDst: srcpath
      })
    })
  } else {
    const dstdir = path.dirname(dstpath)
    const relativeToDst = path.join(dstdir, srcpath)
    return pathExists(relativeToDst, (err, exists) => {
      if (err) return callback(err)
      if (exists) {
        return callback(null, {
          toCwd: relativeToDst,
          toDst: srcpath
        })
      } else {
        return fs.lstat(srcpath, (err) => {
          if (err) {
            err.message = err.message.replace('lstat', 'ensureSymlink')
            return callback(err)
          }
          return callback(null, {
            toCwd: srcpath,
            toDst: path.relative(dstdir, srcpath)
          })
        })
      }
    })
  }
}

function symlinkPathsSync (srcpath, dstpath) {
  let exists
  if (path.isAbsolute(srcpath)) {
    exists = fs.existsSync(srcpath)
    if (!exists) throw new Error('absolute srcpath does not exist')
    return {
      toCwd: srcpath,
      toDst: srcpath
    }
  } else {
    const dstdir = path.dirname(dstpath)
    const relativeToDst = path.join(dstdir, srcpath)
    exists = fs.existsSync(relativeToDst)
    if (exists) {
      return {
        toCwd: relativeToDst,
        toDst: srcpath
      }
    } else {
      exists = fs.existsSync(srcpath)
      if (!exists) throw new Error('relative srcpath does not exist')
      return {
        toCwd: srcpath,
        toDst: path.relative(dstdir, srcpath)
      }
    }
  }
}

module.exports = {
  symlinkPaths,
  symlinkPathsSync
}


/***/ }),
/* 931 */,
/* 932 */,
/* 933 */,
/* 934 */,
/* 935 */,
/* 936 */,
/* 937 */,
/* 938 */,
/* 939 */,
/* 940 */,
/* 941 */,
/* 942 */,
/* 943 */,
/* 944 */,
/* 945 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var YAMLException = __webpack_require__(556);

var TYPE_CONSTRUCTOR_OPTIONS = [
  'kind',
  'resolve',
  'construct',
  'instanceOf',
  'predicate',
  'represent',
  'defaultStyle',
  'styleAliases'
];

var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];

function compileStyleAliases(map) {
  var result = {};

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.tag          = tag;
  this.kind         = options['kind']         || null;
  this.resolve      = options['resolve']      || function () { return true; };
  this.construct    = options['construct']    || function (data) { return data; };
  this.instanceOf   = options['instanceOf']   || null;
  this.predicate    = options['predicate']    || null;
  this.represent    = options['represent']    || null;
  this.defaultStyle = options['defaultStyle'] || null;
  this.styleAliases = compileStyleAliases(options['styleAliases'] || null);

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

module.exports = Type;


/***/ }),
/* 946 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(598)

function utimesMillis (path, atime, mtime, callback) {
  // if (!HAS_MILLIS_RES) return fs.utimes(path, atime, mtime, callback)
  fs.open(path, 'r+', (err, fd) => {
    if (err) return callback(err)
    fs.futimes(fd, atime, mtime, futimesErr => {
      fs.close(fd, closeErr => {
        if (callback) callback(futimesErr || closeErr)
      })
    })
  })
}

function utimesMillisSync (path, atime, mtime) {
  const fd = fs.openSync(path, 'r+')
  fs.futimesSync(fd, atime, mtime)
  return fs.closeSync(fd)
}

module.exports = {
  utimesMillis,
  utimesMillisSync
}


/***/ }),
/* 947 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var Type = __webpack_require__(945);

var _toString = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (data === null) return true;

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if (_toString.call(pair) !== '[object Object]') return false;

    keys = Object.keys(pair);

    if (keys.length !== 1) return false;

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return true;
}

function constructYamlPairs(data) {
  if (data === null) return [];

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    keys = Object.keys(pair);

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return result;
}

module.exports = new Type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});


/***/ }),
/* 948 */
/***/ (function(module) {

"use strict";


/**
 * Tries to execute a function and discards any error that occurs.
 * @param {Function} fn - Function that might or might not throw an error.
 * @returns {?*} Return-value of the function when no error occurred.
 */
module.exports = function(fn) {

	try { return fn() } catch (e) {}

}

/***/ }),
/* 949 */,
/* 950 */,
/* 951 */,
/* 952 */,
/* 953 */,
/* 954 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHeaders = void 0;
/**
 * Parses the headers that were stored while
 *  the request was being processed.
 *
 * @internal
 */
function parseHeaders(headersString) {
    const headers = headersString.split(/\r?\n|\r/g);
    const len = headers.length;
    const result = [];
    let isStatusLine = true;
    let currHeaders = {};
    for (let i = 0; i < len; i += 1) {
        // status line
        if (isStatusLine) {
            const header = headers[i].split(' ');
            currHeaders.result = {
                version: header.shift() || '',
                code: parseInt(header.shift() || '0', 10),
                reason: header.join(' '),
            };
            isStatusLine = false;
            continue;
        }
        // Empty string means empty line, which means another header group
        if (headers[i] === '') {
            result.push(currHeaders);
            currHeaders = {};
            isStatusLine = true;
            continue;
        }
        const header = headers[i].split(/:\s(.+)/);
        if (header[0].toUpperCase() === 'SET-COOKIE') {
            if (!currHeaders['Set-Cookie']) {
                currHeaders['Set-Cookie'] = [];
            }
            currHeaders['Set-Cookie'].push(header[1]);
        }
        else {
            currHeaders[header[0]] = header[1];
        }
    }
    return result;
}
exports.parseHeaders = parseHeaders;
//# sourceMappingURL=parseHeaders.js.map

/***/ }),
/* 955 */
/***/ (function(module, exports) {

exports = module.exports = SemVer

var debug
/* istanbul ignore next */
if (typeof process === 'object' &&
    process.env &&
    process.env.NODE_DEBUG &&
    /\bsemver\b/i.test(process.env.NODE_DEBUG)) {
  debug = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    args.unshift('SEMVER')
    console.log.apply(console, args)
  }
} else {
  debug = function () {}
}

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
exports.SEMVER_SPEC_VERSION = '2.0.0'

var MAX_LENGTH = 256
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
  /* istanbul ignore next */ 9007199254740991

// Max safe segment length for coercion.
var MAX_SAFE_COMPONENT_LENGTH = 16

// The actual regexps go on exports.re
var re = exports.re = []
var src = exports.src = []
var R = 0

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

var NUMERICIDENTIFIER = R++
src[NUMERICIDENTIFIER] = '0|[1-9]\\d*'
var NUMERICIDENTIFIERLOOSE = R++
src[NUMERICIDENTIFIERLOOSE] = '[0-9]+'

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

var NONNUMERICIDENTIFIER = R++
src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*'

// ## Main Version
// Three dot-separated numeric identifiers.

var MAINVERSION = R++
src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')'

var MAINVERSIONLOOSE = R++
src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')'

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

var PRERELEASEIDENTIFIER = R++
src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
                            '|' + src[NONNUMERICIDENTIFIER] + ')'

var PRERELEASEIDENTIFIERLOOSE = R++
src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
                                 '|' + src[NONNUMERICIDENTIFIER] + ')'

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

var PRERELEASE = R++
src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))'

var PRERELEASELOOSE = R++
src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))'

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

var BUILDIDENTIFIER = R++
src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+'

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

var BUILD = R++
src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))'

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

var FULL = R++
var FULLPLAIN = 'v?' + src[MAINVERSION] +
                src[PRERELEASE] + '?' +
                src[BUILD] + '?'

src[FULL] = '^' + FULLPLAIN + '$'

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
                 src[PRERELEASELOOSE] + '?' +
                 src[BUILD] + '?'

var LOOSE = R++
src[LOOSE] = '^' + LOOSEPLAIN + '$'

var GTLT = R++
src[GTLT] = '((?:<|>)?=?)'

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
var XRANGEIDENTIFIERLOOSE = R++
src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*'
var XRANGEIDENTIFIER = R++
src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*'

var XRANGEPLAIN = R++
src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:' + src[PRERELEASE] + ')?' +
                   src[BUILD] + '?' +
                   ')?)?'

var XRANGEPLAINLOOSE = R++
src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:' + src[PRERELEASELOOSE] + ')?' +
                        src[BUILD] + '?' +
                        ')?)?'

var XRANGE = R++
src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$'
var XRANGELOOSE = R++
src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$'

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
var COERCE = R++
src[COERCE] = '(?:^|[^\\d])' +
              '(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '})' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:$|[^\\d])'

// Tilde ranges.
// Meaning is "reasonably at or greater than"
var LONETILDE = R++
src[LONETILDE] = '(?:~>?)'

var TILDETRIM = R++
src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+'
re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g')
var tildeTrimReplace = '$1~'

var TILDE = R++
src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$'
var TILDELOOSE = R++
src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$'

// Caret ranges.
// Meaning is "at least and backwards compatible with"
var LONECARET = R++
src[LONECARET] = '(?:\\^)'

var CARETTRIM = R++
src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+'
re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g')
var caretTrimReplace = '$1^'

var CARET = R++
src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$'
var CARETLOOSE = R++
src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$'

// A simple gt/lt/eq thing, or just "" to indicate "any version"
var COMPARATORLOOSE = R++
src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$'
var COMPARATOR = R++
src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$'

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
var COMPARATORTRIM = R++
src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')'

// this one has to use the /g flag
re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g')
var comparatorTrimReplace = '$1$2$3'

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
var HYPHENRANGE = R++
src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
                   '\\s+-\\s+' +
                   '(' + src[XRANGEPLAIN] + ')' +
                   '\\s*$'

var HYPHENRANGELOOSE = R++
src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s+-\\s+' +
                        '(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s*$'

// Star ranges basically just allow anything at all.
var STAR = R++
src[STAR] = '(<|>)?=?\\s*\\*'

// Compile to actual regexp objects.
// All are flag-free, unless they were created above with a flag.
for (var i = 0; i < R; i++) {
  debug(i, src[i])
  if (!re[i]) {
    re[i] = new RegExp(src[i])
  }
}

exports.parse = parse
function parse (version, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  if (version.length > MAX_LENGTH) {
    return null
  }

  var r = options.loose ? re[LOOSE] : re[FULL]
  if (!r.test(version)) {
    return null
  }

  try {
    return new SemVer(version, options)
  } catch (er) {
    return null
  }
}

exports.valid = valid
function valid (version, options) {
  var v = parse(version, options)
  return v ? v.version : null
}

exports.clean = clean
function clean (version, options) {
  var s = parse(version.trim().replace(/^[=v]+/, ''), options)
  return s ? s.version : null
}

exports.SemVer = SemVer

function SemVer (version, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }
  if (version instanceof SemVer) {
    if (version.loose === options.loose) {
      return version
    } else {
      version = version.version
    }
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version)
  }

  if (version.length > MAX_LENGTH) {
    throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters')
  }

  if (!(this instanceof SemVer)) {
    return new SemVer(version, options)
  }

  debug('SemVer', version, options)
  this.options = options
  this.loose = !!options.loose

  var m = version.trim().match(options.loose ? re[LOOSE] : re[FULL])

  if (!m) {
    throw new TypeError('Invalid Version: ' + version)
  }

  this.raw = version

  // these are actually numbers
  this.major = +m[1]
  this.minor = +m[2]
  this.patch = +m[3]

  if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
    throw new TypeError('Invalid major version')
  }

  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
    throw new TypeError('Invalid minor version')
  }

  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
    throw new TypeError('Invalid patch version')
  }

  // numberify any prerelease numeric ids
  if (!m[4]) {
    this.prerelease = []
  } else {
    this.prerelease = m[4].split('.').map(function (id) {
      if (/^[0-9]+$/.test(id)) {
        var num = +id
        if (num >= 0 && num < MAX_SAFE_INTEGER) {
          return num
        }
      }
      return id
    })
  }

  this.build = m[5] ? m[5].split('.') : []
  this.format()
}

SemVer.prototype.format = function () {
  this.version = this.major + '.' + this.minor + '.' + this.patch
  if (this.prerelease.length) {
    this.version += '-' + this.prerelease.join('.')
  }
  return this.version
}

SemVer.prototype.toString = function () {
  return this.version
}

SemVer.prototype.compare = function (other) {
  debug('SemVer.compare', this.version, this.options, other)
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options)
  }

  return this.compareMain(other) || this.comparePre(other)
}

SemVer.prototype.compareMain = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options)
  }

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch)
}

SemVer.prototype.comparePre = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options)
  }

  // NOT having a prerelease is > having one
  if (this.prerelease.length && !other.prerelease.length) {
    return -1
  } else if (!this.prerelease.length && other.prerelease.length) {
    return 1
  } else if (!this.prerelease.length && !other.prerelease.length) {
    return 0
  }

  var i = 0
  do {
    var a = this.prerelease[i]
    var b = other.prerelease[i]
    debug('prerelease compare', i, a, b)
    if (a === undefined && b === undefined) {
      return 0
    } else if (b === undefined) {
      return 1
    } else if (a === undefined) {
      return -1
    } else if (a === b) {
      continue
    } else {
      return compareIdentifiers(a, b)
    }
  } while (++i)
}

// preminor will bump the version up to the next minor release, and immediately
// down to pre-release. premajor and prepatch work the same way.
SemVer.prototype.inc = function (release, identifier) {
  switch (release) {
    case 'premajor':
      this.prerelease.length = 0
      this.patch = 0
      this.minor = 0
      this.major++
      this.inc('pre', identifier)
      break
    case 'preminor':
      this.prerelease.length = 0
      this.patch = 0
      this.minor++
      this.inc('pre', identifier)
      break
    case 'prepatch':
      // If this is already a prerelease, it will bump to the next version
      // drop any prereleases that might already exist, since they are not
      // relevant at this point.
      this.prerelease.length = 0
      this.inc('patch', identifier)
      this.inc('pre', identifier)
      break
    // If the input is a non-prerelease version, this acts the same as
    // prepatch.
    case 'prerelease':
      if (this.prerelease.length === 0) {
        this.inc('patch', identifier)
      }
      this.inc('pre', identifier)
      break

    case 'major':
      // If this is a pre-major version, bump up to the same major version.
      // Otherwise increment major.
      // 1.0.0-5 bumps to 1.0.0
      // 1.1.0 bumps to 2.0.0
      if (this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0) {
        this.major++
      }
      this.minor = 0
      this.patch = 0
      this.prerelease = []
      break
    case 'minor':
      // If this is a pre-minor version, bump up to the same minor version.
      // Otherwise increment minor.
      // 1.2.0-5 bumps to 1.2.0
      // 1.2.1 bumps to 1.3.0
      if (this.patch !== 0 || this.prerelease.length === 0) {
        this.minor++
      }
      this.patch = 0
      this.prerelease = []
      break
    case 'patch':
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      if (this.prerelease.length === 0) {
        this.patch++
      }
      this.prerelease = []
      break
    // This probably shouldn't be used publicly.
    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
    case 'pre':
      if (this.prerelease.length === 0) {
        this.prerelease = [0]
      } else {
        var i = this.prerelease.length
        while (--i >= 0) {
          if (typeof this.prerelease[i] === 'number') {
            this.prerelease[i]++
            i = -2
          }
        }
        if (i === -1) {
          // didn't increment anything
          this.prerelease.push(0)
        }
      }
      if (identifier) {
        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
        if (this.prerelease[0] === identifier) {
          if (isNaN(this.prerelease[1])) {
            this.prerelease = [identifier, 0]
          }
        } else {
          this.prerelease = [identifier, 0]
        }
      }
      break

    default:
      throw new Error('invalid increment argument: ' + release)
  }
  this.format()
  this.raw = this.version
  return this
}

exports.inc = inc
function inc (version, release, loose, identifier) {
  if (typeof (loose) === 'string') {
    identifier = loose
    loose = undefined
  }

  try {
    return new SemVer(version, loose).inc(release, identifier).version
  } catch (er) {
    return null
  }
}

exports.diff = diff
function diff (version1, version2) {
  if (eq(version1, version2)) {
    return null
  } else {
    var v1 = parse(version1)
    var v2 = parse(version2)
    var prefix = ''
    if (v1.prerelease.length || v2.prerelease.length) {
      prefix = 'pre'
      var defaultResult = 'prerelease'
    }
    for (var key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return prefix + key
        }
      }
    }
    return defaultResult // may be undefined
  }
}

exports.compareIdentifiers = compareIdentifiers

var numeric = /^[0-9]+$/
function compareIdentifiers (a, b) {
  var anum = numeric.test(a)
  var bnum = numeric.test(b)

  if (anum && bnum) {
    a = +a
    b = +b
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
}

exports.rcompareIdentifiers = rcompareIdentifiers
function rcompareIdentifiers (a, b) {
  return compareIdentifiers(b, a)
}

exports.major = major
function major (a, loose) {
  return new SemVer(a, loose).major
}

exports.minor = minor
function minor (a, loose) {
  return new SemVer(a, loose).minor
}

exports.patch = patch
function patch (a, loose) {
  return new SemVer(a, loose).patch
}

exports.compare = compare
function compare (a, b, loose) {
  return new SemVer(a, loose).compare(new SemVer(b, loose))
}

exports.compareLoose = compareLoose
function compareLoose (a, b) {
  return compare(a, b, true)
}

exports.rcompare = rcompare
function rcompare (a, b, loose) {
  return compare(b, a, loose)
}

exports.sort = sort
function sort (list, loose) {
  return list.sort(function (a, b) {
    return exports.compare(a, b, loose)
  })
}

exports.rsort = rsort
function rsort (list, loose) {
  return list.sort(function (a, b) {
    return exports.rcompare(a, b, loose)
  })
}

exports.gt = gt
function gt (a, b, loose) {
  return compare(a, b, loose) > 0
}

exports.lt = lt
function lt (a, b, loose) {
  return compare(a, b, loose) < 0
}

exports.eq = eq
function eq (a, b, loose) {
  return compare(a, b, loose) === 0
}

exports.neq = neq
function neq (a, b, loose) {
  return compare(a, b, loose) !== 0
}

exports.gte = gte
function gte (a, b, loose) {
  return compare(a, b, loose) >= 0
}

exports.lte = lte
function lte (a, b, loose) {
  return compare(a, b, loose) <= 0
}

exports.cmp = cmp
function cmp (a, op, b, loose) {
  switch (op) {
    case '===':
      if (typeof a === 'object')
        a = a.version
      if (typeof b === 'object')
        b = b.version
      return a === b

    case '!==':
      if (typeof a === 'object')
        a = a.version
      if (typeof b === 'object')
        b = b.version
      return a !== b

    case '':
    case '=':
    case '==':
      return eq(a, b, loose)

    case '!=':
      return neq(a, b, loose)

    case '>':
      return gt(a, b, loose)

    case '>=':
      return gte(a, b, loose)

    case '<':
      return lt(a, b, loose)

    case '<=':
      return lte(a, b, loose)

    default:
      throw new TypeError('Invalid operator: ' + op)
  }
}

exports.Comparator = Comparator
function Comparator (comp, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  if (comp instanceof Comparator) {
    if (comp.loose === !!options.loose) {
      return comp
    } else {
      comp = comp.value
    }
  }

  if (!(this instanceof Comparator)) {
    return new Comparator(comp, options)
  }

  debug('comparator', comp, options)
  this.options = options
  this.loose = !!options.loose
  this.parse(comp)

  if (this.semver === ANY) {
    this.value = ''
  } else {
    this.value = this.operator + this.semver.version
  }

  debug('comp', this)
}

var ANY = {}
Comparator.prototype.parse = function (comp) {
  var r = this.options.loose ? re[COMPARATORLOOSE] : re[COMPARATOR]
  var m = comp.match(r)

  if (!m) {
    throw new TypeError('Invalid comparator: ' + comp)
  }

  this.operator = m[1]
  if (this.operator === '=') {
    this.operator = ''
  }

  // if it literally is just '>' or '' then allow anything.
  if (!m[2]) {
    this.semver = ANY
  } else {
    this.semver = new SemVer(m[2], this.options.loose)
  }
}

Comparator.prototype.toString = function () {
  return this.value
}

Comparator.prototype.test = function (version) {
  debug('Comparator.test', version, this.options.loose)

  if (this.semver === ANY) {
    return true
  }

  if (typeof version === 'string') {
    version = new SemVer(version, this.options)
  }

  return cmp(version, this.operator, this.semver, this.options)
}

Comparator.prototype.intersects = function (comp, options) {
  if (!(comp instanceof Comparator)) {
    throw new TypeError('a Comparator is required')
  }

  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  var rangeTmp

  if (this.operator === '') {
    rangeTmp = new Range(comp.value, options)
    return satisfies(this.value, rangeTmp, options)
  } else if (comp.operator === '') {
    rangeTmp = new Range(this.value, options)
    return satisfies(comp.semver, rangeTmp, options)
  }

  var sameDirectionIncreasing =
    (this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '>=' || comp.operator === '>')
  var sameDirectionDecreasing =
    (this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '<=' || comp.operator === '<')
  var sameSemVer = this.semver.version === comp.semver.version
  var differentDirectionsInclusive =
    (this.operator === '>=' || this.operator === '<=') &&
    (comp.operator === '>=' || comp.operator === '<=')
  var oppositeDirectionsLessThan =
    cmp(this.semver, '<', comp.semver, options) &&
    ((this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '<=' || comp.operator === '<'))
  var oppositeDirectionsGreaterThan =
    cmp(this.semver, '>', comp.semver, options) &&
    ((this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '>=' || comp.operator === '>'))

  return sameDirectionIncreasing || sameDirectionDecreasing ||
    (sameSemVer && differentDirectionsInclusive) ||
    oppositeDirectionsLessThan || oppositeDirectionsGreaterThan
}

exports.Range = Range
function Range (range, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  if (range instanceof Range) {
    if (range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease) {
      return range
    } else {
      return new Range(range.raw, options)
    }
  }

  if (range instanceof Comparator) {
    return new Range(range.value, options)
  }

  if (!(this instanceof Range)) {
    return new Range(range, options)
  }

  this.options = options
  this.loose = !!options.loose
  this.includePrerelease = !!options.includePrerelease

  // First, split based on boolean or ||
  this.raw = range
  this.set = range.split(/\s*\|\|\s*/).map(function (range) {
    return this.parseRange(range.trim())
  }, this).filter(function (c) {
    // throw out any that are not relevant for whatever reason
    return c.length
  })

  if (!this.set.length) {
    throw new TypeError('Invalid SemVer Range: ' + range)
  }

  this.format()
}

Range.prototype.format = function () {
  this.range = this.set.map(function (comps) {
    return comps.join(' ').trim()
  }).join('||').trim()
  return this.range
}

Range.prototype.toString = function () {
  return this.range
}

Range.prototype.parseRange = function (range) {
  var loose = this.options.loose
  range = range.trim()
  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE]
  range = range.replace(hr, hyphenReplace)
  debug('hyphen replace', range)
  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace)
  debug('comparator trim', range, re[COMPARATORTRIM])

  // `~ 1.2.3` => `~1.2.3`
  range = range.replace(re[TILDETRIM], tildeTrimReplace)

  // `^ 1.2.3` => `^1.2.3`
  range = range.replace(re[CARETTRIM], caretTrimReplace)

  // normalize spaces
  range = range.split(/\s+/).join(' ')

  // At this point, the range is completely trimmed and
  // ready to be split into comparators.

  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR]
  var set = range.split(' ').map(function (comp) {
    return parseComparator(comp, this.options)
  }, this).join(' ').split(/\s+/)
  if (this.options.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function (comp) {
      return !!comp.match(compRe)
    })
  }
  set = set.map(function (comp) {
    return new Comparator(comp, this.options)
  }, this)

  return set
}

Range.prototype.intersects = function (range, options) {
  if (!(range instanceof Range)) {
    throw new TypeError('a Range is required')
  }

  return this.set.some(function (thisComparators) {
    return thisComparators.every(function (thisComparator) {
      return range.set.some(function (rangeComparators) {
        return rangeComparators.every(function (rangeComparator) {
          return thisComparator.intersects(rangeComparator, options)
        })
      })
    })
  })
}

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators
function toComparators (range, options) {
  return new Range(range, options).set.map(function (comp) {
    return comp.map(function (c) {
      return c.value
    }).join(' ').trim().split(' ')
  })
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator (comp, options) {
  debug('comp', comp, options)
  comp = replaceCarets(comp, options)
  debug('caret', comp)
  comp = replaceTildes(comp, options)
  debug('tildes', comp)
  comp = replaceXRanges(comp, options)
  debug('xrange', comp)
  comp = replaceStars(comp, options)
  debug('stars', comp)
  return comp
}

function isX (id) {
  return !id || id.toLowerCase() === 'x' || id === '*'
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceTildes (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    return replaceTilde(comp, options)
  }).join(' ')
}

function replaceTilde (comp, options) {
  var r = options.loose ? re[TILDELOOSE] : re[TILDE]
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('tilde', comp, _, M, m, p, pr)
    var ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0'
    } else if (isX(p)) {
      // ~1.2 == >=1.2.0 <1.3.0
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0'
    } else if (pr) {
      debug('replaceTilde pr', pr)
      ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
            ' <' + M + '.' + (+m + 1) + '.0'
    } else {
      // ~1.2.3 == >=1.2.3 <1.3.0
      ret = '>=' + M + '.' + m + '.' + p +
            ' <' + M + '.' + (+m + 1) + '.0'
    }

    debug('tilde return', ret)
    return ret
  })
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
function replaceCarets (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    return replaceCaret(comp, options)
  }).join(' ')
}

function replaceCaret (comp, options) {
  debug('caret', comp, options)
  var r = options.loose ? re[CARETLOOSE] : re[CARET]
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('caret', comp, _, M, m, p, pr)
    var ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0'
    } else if (isX(p)) {
      if (M === '0') {
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0'
      } else {
        ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0'
      }
    } else if (pr) {
      debug('replaceCaret pr', pr)
      if (M === '0') {
        if (m === '0') {
          ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
                ' <' + M + '.' + m + '.' + (+p + 1)
        } else {
          ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
                ' <' + M + '.' + (+m + 1) + '.0'
        }
      } else {
        ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
              ' <' + (+M + 1) + '.0.0'
      }
    } else {
      debug('no pr')
      if (M === '0') {
        if (m === '0') {
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + m + '.' + (+p + 1)
        } else {
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + (+m + 1) + '.0'
        }
      } else {
        ret = '>=' + M + '.' + m + '.' + p +
              ' <' + (+M + 1) + '.0.0'
      }
    }

    debug('caret return', ret)
    return ret
  })
}

function replaceXRanges (comp, options) {
  debug('replaceXRanges', comp, options)
  return comp.split(/\s+/).map(function (comp) {
    return replaceXRange(comp, options)
  }).join(' ')
}

function replaceXRange (comp, options) {
  comp = comp.trim()
  var r = options.loose ? re[XRANGELOOSE] : re[XRANGE]
  return comp.replace(r, function (ret, gtlt, M, m, p, pr) {
    debug('xRange', comp, ret, gtlt, M, m, p, pr)
    var xM = isX(M)
    var xm = xM || isX(m)
    var xp = xm || isX(p)
    var anyX = xp

    if (gtlt === '=' && anyX) {
      gtlt = ''
    }

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0'
      } else {
        // nothing is forbidden
        ret = '*'
      }
    } else if (gtlt && anyX) {
      // we know patch is an x, because we have any x at all.
      // replace X with 0
      if (xm) {
        m = 0
      }
      p = 0

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        // >1.2.3 => >= 1.2.4
        gtlt = '>='
        if (xm) {
          M = +M + 1
          m = 0
          p = 0
        } else {
          m = +m + 1
          p = 0
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<'
        if (xm) {
          M = +M + 1
        } else {
          m = +m + 1
        }
      }

      ret = gtlt + M + '.' + m + '.' + p
    } else if (xm) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0'
    } else if (xp) {
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0'
    }

    debug('xRange return', ret)

    return ret
  })
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars (comp, options) {
  debug('replaceStars', comp, options)
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[STAR], '')
}

// This function is passed to string.replace(re[HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0
function hyphenReplace ($0,
  from, fM, fm, fp, fpr, fb,
  to, tM, tm, tp, tpr, tb) {
  if (isX(fM)) {
    from = ''
  } else if (isX(fm)) {
    from = '>=' + fM + '.0.0'
  } else if (isX(fp)) {
    from = '>=' + fM + '.' + fm + '.0'
  } else {
    from = '>=' + from
  }

  if (isX(tM)) {
    to = ''
  } else if (isX(tm)) {
    to = '<' + (+tM + 1) + '.0.0'
  } else if (isX(tp)) {
    to = '<' + tM + '.' + (+tm + 1) + '.0'
  } else if (tpr) {
    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr
  } else {
    to = '<=' + to
  }

  return (from + ' ' + to).trim()
}

// if ANY of the sets match ALL of its comparators, then pass
Range.prototype.test = function (version) {
  if (!version) {
    return false
  }

  if (typeof version === 'string') {
    version = new SemVer(version, this.options)
  }

  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this.set[i], version, this.options)) {
      return true
    }
  }
  return false
}

function testSet (set, version, options) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (i = 0; i < set.length; i++) {
      debug(set[i].semver)
      if (set[i].semver === ANY) {
        continue
      }

      if (set[i].semver.prerelease.length > 0) {
        var allowed = set[i].semver
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch) {
          return true
        }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false
  }

  return true
}

exports.satisfies = satisfies
function satisfies (version, range, options) {
  try {
    range = new Range(range, options)
  } catch (er) {
    return false
  }
  return range.test(version)
}

exports.maxSatisfying = maxSatisfying
function maxSatisfying (versions, range, options) {
  var max = null
  var maxSV = null
  try {
    var rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v
        maxSV = new SemVer(max, options)
      }
    }
  })
  return max
}

exports.minSatisfying = minSatisfying
function minSatisfying (versions, range, options) {
  var min = null
  var minSV = null
  try {
    var rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v
        minSV = new SemVer(min, options)
      }
    }
  })
  return min
}

exports.minVersion = minVersion
function minVersion (range, loose) {
  range = new Range(range, loose)

  var minver = new SemVer('0.0.0')
  if (range.test(minver)) {
    return minver
  }

  minver = new SemVer('0.0.0-0')
  if (range.test(minver)) {
    return minver
  }

  minver = null
  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i]

    comparators.forEach(function (comparator) {
      // Clone to avoid manipulating the comparator's semver object.
      var compver = new SemVer(comparator.semver.version)
      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++
          } else {
            compver.prerelease.push(0)
          }
          compver.raw = compver.format()
          /* fallthrough */
        case '':
        case '>=':
          if (!minver || gt(minver, compver)) {
            minver = compver
          }
          break
        case '<':
        case '<=':
          /* Ignore maximum versions */
          break
        /* istanbul ignore next */
        default:
          throw new Error('Unexpected operation: ' + comparator.operator)
      }
    })
  }

  if (minver && range.test(minver)) {
    return minver
  }

  return null
}

exports.validRange = validRange
function validRange (range, options) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*'
  } catch (er) {
    return null
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr
function ltr (version, range, options) {
  return outside(version, range, '<', options)
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr
function gtr (version, range, options) {
  return outside(version, range, '>', options)
}

exports.outside = outside
function outside (version, range, hilo, options) {
  version = new SemVer(version, options)
  range = new Range(range, options)

  var gtfn, ltefn, ltfn, comp, ecomp
  switch (hilo) {
    case '>':
      gtfn = gt
      ltefn = lte
      ltfn = lt
      comp = '>'
      ecomp = '>='
      break
    case '<':
      gtfn = lt
      ltefn = gte
      ltfn = gt
      comp = '<'
      ecomp = '<='
      break
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"')
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, options)) {
    return false
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i]

    var high = null
    var low = null

    comparators.forEach(function (comparator) {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0')
      }
      high = high || comparator
      low = low || comparator
      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator
      }
    })

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false
    }
  }
  return true
}

exports.prerelease = prerelease
function prerelease (version, options) {
  var parsed = parse(version, options)
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
}

exports.intersects = intersects
function intersects (r1, r2, options) {
  r1 = new Range(r1, options)
  r2 = new Range(r2, options)
  return r1.intersects(r2)
}

exports.coerce = coerce
function coerce (version) {
  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  var match = version.match(re[COERCE])

  if (match == null) {
    return null
  }

  return parse(match[1] +
    '.' + (match[2] || '0') +
    '.' + (match[3] || '0'))
}


/***/ }),
/* 956 */,
/* 957 */,
/* 958 */,
/* 959 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


module.exports = {
  moveSync: __webpack_require__(95)
}


/***/ }),
/* 960 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var isAbsoluteURL = __webpack_require__(590);
var combineURLs = __webpack_require__(887);

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),
/* 961 */,
/* 962 */,
/* 963 */,
/* 964 */,
/* 965 */,
/* 966 */,
/* 967 */,
/* 968 */,
/* 969 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var wrappy = __webpack_require__(11)
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}


/***/ }),
/* 970 */,
/* 971 */,
/* 972 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const rest_1 = __webpack_require__(889);
const slugify_1 = __importDefault(__webpack_require__(178));
const fs_extra_1 = __webpack_require__(226);
const js_yaml_1 = __webpack_require__(414);
const axios_1 = __importDefault(__webpack_require__(53));
const node_libcurl_1 = __webpack_require__(268);
const path_1 = __webpack_require__(622);
const summary_1 = __webpack_require__(596);
exports.update = async (shouldCommit = false) => {
    const config = js_yaml_1.safeLoad(await fs_extra_1.readFile(path_1.join(".", ".upptimerc.yml"), "utf8"));
    const owner = config.owner;
    const repo = config.repo;
    const octokit = new rest_1.Octokit({
        auth: config.PAT || process.env.GH_PAT || process.env.GITHUB_TOKEN,
        userAgent: config.userAgent || process.env.USER_AGENT || "KojBot",
    });
    let hasDelta = false;
    for await (const site of config.sites) {
        const slug = slugify_1.default(site.name);
        console.log("Checking", site.url);
        let currentStatus = "unknown";
        let startTime = new Date().toISOString();
        try {
            currentStatus =
                ((await fs_extra_1.readFile(path_1.join(".", "history", `${slug}.yml`), "utf8"))
                    .split("\n")
                    .find((line) => line.toLocaleLowerCase().includes("- status")) || "")
                    .split(":")[1]
                    .trim() || "unknown";
            startTime =
                ((await fs_extra_1.readFile(path_1.join(".", "history", `${slug}.yml`), "utf8"))
                    .split("\n")
                    .find((line) => line.toLocaleLowerCase().includes("- starttime")) || "")
                    .split("startTime:")[1]
                    .trim() || new Date().toISOString();
        }
        catch (error) { }
        const performTestOnce = async () => {
            const result = await curl(site.url.startsWith("$")
                ? process.env[site.url.substr(1, site.url.length)] || ""
                : site.url, site.method);
            console.log("Result", result);
            const responseTime = (result.totalTime * 1000).toFixed(0);
            const status = result.httpCode >= 400 || result.httpCode < 200 ? "down" : "up";
            return { result, responseTime, status };
        };
        let { result, responseTime, status } = await performTestOnce();
        /**
         * If the site is down, we perform the test 2 more times to make
         * sure that it's not a false alarm
         */
        if (status === "down") {
            wait(1000);
            const secondTry = await performTestOnce();
            if (secondTry.status === "up") {
                result = secondTry.result;
                responseTime = secondTry.responseTime;
                status = secondTry.status;
            }
            else {
                wait(10000);
                const thirdTry = await performTestOnce();
                if (thirdTry.status === "up") {
                    result = thirdTry.result;
                    responseTime = thirdTry.responseTime;
                    status = thirdTry.status;
                }
            }
        }
        try {
            if (shouldCommit || currentStatus !== status) {
                const content = `- url: ${site.url}
- status: ${status}
- code: ${result.httpCode}
- responseTime: ${responseTime}
- lastUpdated: ${new Date().toISOString()}
- startTime: ${startTime}
`;
                let sha = "";
                try {
                    sha = (await octokit.repos.getContent({
                        owner,
                        repo,
                        path: `history/${slug}.yml`,
                    })).data.sha;
                }
                catch (error) { }
                const fileUpdateResult = await octokit.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: `history/${slug}.yml`,
                    message: `${status === "up" ? "🟩" : "🟥"} ${site.name} is ${status} (${result.httpCode} in ${responseTime}ms) [skip ci]`,
                    content: Buffer.from(content).toString("base64"),
                    sha,
                });
                if (currentStatus !== status) {
                    console.log("Status is different", currentStatus, "to", status);
                    hasDelta = true;
                    const issues = await octokit.issues.list({
                        owner,
                        repo,
                        labels: slug,
                        filter: "all",
                        state: "open",
                        sort: "created",
                        direction: "desc",
                        per_page: 1,
                    });
                    console.log(`Found ${issues.data.length} issues`);
                    // If the site was just recorded as down, open an issue
                    if (status === "down") {
                        if (!issues.data.length) {
                            const newIssue = await octokit.issues.create({
                                owner,
                                repo,
                                title: `🛑 ${site.name} is down`,
                                body: `In [\`${fileUpdateResult.data.commit.sha.substr(0, 7)}\`](https://github.com/${owner}/${repo}/commit/${fileUpdateResult.data.commit.sha}), ${site.name} (${site.url}) was **down**:
- HTTP code: ${result.httpCode}
- Response time: ${responseTime} ms
`,
                                assignees: [...(config.assignees || []), ...(site.assignees || [])],
                                labels: ["status", slug],
                            });
                            await octokit.issues.lock({
                                owner,
                                repo,
                                issue_number: newIssue.data.number,
                            });
                            console.log("Opened and locked a new issue");
                            for await (const notification of config.notifications || []) {
                                if (notification.type === "slack") {
                                    const token = process.env.SLACK_APP_ACCESS_TOKEN;
                                    if (token)
                                        await axios_1.default.post("https://slack.com/api/chat.postMessage", {
                                            channel: notification.channel,
                                            text: `🟥 ${site.name} (${site.url}) is **down**: ${newIssue.data.html_url}`,
                                        }, {
                                            headers: {
                                                Authorization: `Bearer ${process.env.SLACK_BOT_ACCESS_TOKEN}`,
                                            },
                                        });
                                }
                            }
                            console.log("Sent notifications");
                        }
                        else {
                            console.log("An issue is already open for this");
                        }
                    }
                    else if (issues.data.length) {
                        // If the site just came back up
                        await octokit.issues.createComment({
                            owner,
                            repo,
                            issue_number: issues.data[0].number,
                            body: `**Resolved:** ${site.name} is back up in [\`${fileUpdateResult.data.commit.sha.substr(0, 7)}\`](https://github.com/${owner}/${repo}/commit/${fileUpdateResult.data.commit.sha}).`,
                        });
                        console.log("Created comment in issue");
                        await octokit.issues.update({
                            owner,
                            repo,
                            issue_number: issues.data[0].number,
                            state: "closed",
                        });
                        console.log("Closed issue");
                        for await (const notification of config.notifications || []) {
                            if (notification.type === "slack") {
                                const token = process.env.SLACK_APP_ACCESS_TOKEN;
                                if (token)
                                    await axios_1.default.post("https://slack.com/api/chat.postMessage", {
                                        channel: notification.channel,
                                        text: `🟩 ${site.name} (${site.url}) is back up.`,
                                    }, {
                                        headers: {
                                            Authorization: `Bearer ${process.env.SLACK_BOT_ACCESS_TOKEN}`,
                                        },
                                    });
                            }
                        }
                        console.log("Sent notifications");
                    }
                    else {
                        console.log("Could not find a relevant issue", issues.data);
                    }
                }
                else {
                    console.log("Status is the same", currentStatus, status);
                }
            }
            else {
                console.log("Skipping commit, ", "status is", status);
            }
        }
        catch (error) {
            console.log("ERROR", error);
        }
    }
    if (hasDelta)
        summary_1.generateSummary();
};
const curl = (url, method = "GET") => new Promise((resolve) => {
    const curl = new node_libcurl_1.Curl();
    curl.enable(node_libcurl_1.CurlFeature.Raw);
    curl.setOpt("URL", url);
    curl.setOpt("FOLLOWLOCATION", 1);
    curl.setOpt("MAXREDIRS", 3);
    curl.setOpt("USERAGENT", "Koj Bot");
    curl.setOpt("CONNECTTIMEOUT", 10);
    curl.setOpt("TIMEOUT", 30);
    curl.setOpt("HEADER", 1);
    curl.setOpt("VERBOSE", false);
    curl.setOpt("CUSTOMREQUEST", method);
    curl.on("error", () => {
        curl.close();
        return resolve({ httpCode: 0, totalTime: 0 });
    });
    curl.on("end", () => {
        let httpCode = 0;
        let totalTime = 0;
        try {
            httpCode = Number(curl.getInfo("RESPONSE_CODE"));
            totalTime = Number(curl.getInfo("TOTAL_TIME"));
        }
        catch (error) {
            curl.close();
            return resolve({ httpCode, totalTime });
        }
        return resolve({ httpCode, totalTime });
    });
    curl.perform();
});
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


/***/ }),
/* 973 */,
/* 974 */,
/* 975 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(598)

function symlinkType (srcpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback
  type = (typeof type === 'function') ? false : type
  if (type) return callback(null, type)
  fs.lstat(srcpath, (err, stats) => {
    if (err) return callback(null, 'file')
    type = (stats && stats.isDirectory()) ? 'dir' : 'file'
    callback(null, type)
  })
}

function symlinkTypeSync (srcpath, type) {
  let stats

  if (type) return type
  try {
    stats = fs.lstatSync(srcpath)
  } catch {
    return 'file'
  }
  return (stats && stats.isDirectory()) ? 'dir' : 'file'
}

module.exports = {
  symlinkType,
  symlinkTypeSync
}


/***/ }),
/* 976 */,
/* 977 */,
/* 978 */,
/* 979 */,
/* 980 */,
/* 981 */,
/* 982 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGraphs = void 0;
const rest_1 = __webpack_require__(889);
const slugify_1 = __importDefault(__webpack_require__(178));
const fs_extra_1 = __webpack_require__(226);
const js_yaml_1 = __webpack_require__(414);
const path_1 = __webpack_require__(622);
const chartjs_node_canvas_1 = __webpack_require__(745);
const canvasRenderService = new chartjs_node_canvas_1.CanvasRenderService(600, 400);
exports.generateGraphs = async () => {
    const config = js_yaml_1.safeLoad(await fs_extra_1.readFile(path_1.join(".", ".upptimerc.yml"), "utf8"));
    const owner = config.owner;
    const repo = config.repo;
    const octokit = new rest_1.Octokit({
        auth: config.PAT || process.env.GH_PAT || process.env.GITHUB_TOKEN,
        userAgent: config.userAgent || process.env.USER_AGENT || "KojBot",
    });
    await fs_extra_1.ensureDir(path_1.join(".", "graphs"));
    for await (const site of config.sites) {
        const slug = slugify_1.default(site.name);
        let uptime = 0;
        let responseTime = 0;
        try {
            const api = await fs_extra_1.readJson(path_1.join(".", "history", "summary.json"));
            const item = api.find((site) => site.slug === slug);
            if (item) {
                uptime = parseFloat(item.uptime);
                responseTime = item.time;
            }
        }
        catch (error) { }
        await fs_extra_1.ensureDir(path_1.join(".", "api", slug));
        await fs_extra_1.writeJson(path_1.join(".", "api", slug, "uptime.json"), {
            schemaVersion: 1,
            label: "uptime",
            message: `${uptime}%`,
            color: uptime > 95
                ? "brightgreen"
                : uptime > 90
                    ? "green"
                    : uptime > 85
                        ? "yellowgreen"
                        : uptime > 80
                            ? "yellow"
                            : uptime > 75
                                ? "orange"
                                : "red",
        });
        await fs_extra_1.writeJson(path_1.join(".", "api", slug, "response-time.json"), {
            schemaVersion: 1,
            label: "response time",
            message: `${responseTime} ms`,
            color: responseTime < 200
                ? "brightgreen"
                : responseTime < 400
                    ? "green"
                    : responseTime < 600
                        ? "yellowgreen"
                        : responseTime < 800
                            ? "yellow"
                            : responseTime < 1000
                                ? "orange"
                                : "red",
        });
        const history = await octokit.repos.listCommits({
            owner,
            repo,
            path: `history/${slug}.yml`,
            per_page: 10,
        });
        if (!history.data.length)
            continue;
        const data = history.data
            .filter((item) => item.commit.message.includes(" in ") &&
            Number(item.commit.message.split(" in ")[1].split("ms")[0]) !== 0)
            .map((item) => [
            Number(item.commit.message.split(" in ")[1].split("ms")[0]),
            String(item.commit.author.date),
        ]);
        const image = await canvasRenderService.renderToBuffer({
            type: "line",
            data: {
                labels: [1, ...data.map((item) => item[1])],
                datasets: [
                    {
                        backgroundColor: "#89e0cf",
                        borderColor: "#1abc9c",
                        data: [1, ...data.map((item) => item[0])],
                    },
                ],
            },
            options: {
                legend: { display: false },
                scales: {
                    xAxes: [
                        {
                            display: false,
                            gridLines: {
                                display: false,
                            },
                        },
                    ],
                    yAxes: [
                        {
                            display: false,
                            gridLines: {
                                display: false,
                            },
                        },
                    ],
                },
            },
        });
        await fs_extra_1.writeFile(path_1.join(".", "graphs", `${slug}.png`), image);
    }
};


/***/ }),
/* 983 */,
/* 984 */,
/* 985 */,
/* 986 */,
/* 987 */,
/* 988 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var Type = __webpack_require__(945);

module.exports = new Type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return data !== null ? data : {}; }
});


/***/ }),
/* 989 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlShareCode = exports.CurlCode = exports.CurlMultiCode = void 0;
// https://github.com/curl/curl/blob/7e35eb7729/include/curl/multi.h#L61
/**
 * @public
 */
var CurlMultiCode;
(function (CurlMultiCode) {
    CurlMultiCode[CurlMultiCode["CURLM_CALL_MULTI_PERFORM"] = -1] = "CURLM_CALL_MULTI_PERFORM"; /* please call curl_multi_perform() or
    curl_multi_socket*() soon */
    CurlMultiCode[CurlMultiCode["CURLM_OK"] = 0] = "CURLM_OK";
    CurlMultiCode[CurlMultiCode["CURLM_BAD_HANDLE"] = 1] = "CURLM_BAD_HANDLE"; /* the passed-in handle is not a valid CURLM handle */
    CurlMultiCode[CurlMultiCode["CURLM_BAD_EASY_HANDLE"] = 2] = "CURLM_BAD_EASY_HANDLE"; /* an easy handle was not good/valid */
    CurlMultiCode[CurlMultiCode["CURLM_OUT_OF_MEMORY"] = 3] = "CURLM_OUT_OF_MEMORY"; /* if you ever get this, you're in deep sh*t */
    CurlMultiCode[CurlMultiCode["CURLM_INTERNAL_ERROR"] = 4] = "CURLM_INTERNAL_ERROR"; /* this is a libcurl bug */
    CurlMultiCode[CurlMultiCode["CURLM_BAD_SOCKET"] = 5] = "CURLM_BAD_SOCKET"; /* the passed in socket argument did not match */
    CurlMultiCode[CurlMultiCode["CURLM_UNKNOWN_OPTION"] = 6] = "CURLM_UNKNOWN_OPTION"; /* curl_multi_setopt() with unsupported option */
    CurlMultiCode[CurlMultiCode["CURLM_ADDED_ALREADY"] = 7] = "CURLM_ADDED_ALREADY"; /* an easy handle already added to a multi handle was
    attempted to get added - again */
    CurlMultiCode[CurlMultiCode["CURLM_RECURSIVE_API_CALL"] = 8] = "CURLM_RECURSIVE_API_CALL"; /* an api function was called from inside a
    callback */
    CurlMultiCode[CurlMultiCode["CURLM_WAKEUP_FAILURE"] = 9] = "CURLM_WAKEUP_FAILURE"; /* wakeup is unavailable or failed */
    CurlMultiCode[CurlMultiCode["CURLM_BAD_FUNCTION_ARGUMENT"] = 10] = "CURLM_BAD_FUNCTION_ARGUMENT"; /* function called with a bad parameter */
    CurlMultiCode[CurlMultiCode["CURLM_LAST"] = 11] = "CURLM_LAST";
    /* just to make code nicer when using curl_multi_socket() you can now check
       for CURLM_CALL_MULTI_SOCKET too in the same style it works for
       curl_multi_perform() and CURLM_CALL_MULTI_PERFORM */
    CurlMultiCode[CurlMultiCode["CURLM_CALL_MULTI_SOCKET"] = -1] = "CURLM_CALL_MULTI_SOCKET";
})(CurlMultiCode = exports.CurlMultiCode || (exports.CurlMultiCode = {}));
// https://github.com/curl/curl/blob/e1be825453/include/curl/curl.h#L478
/**
 * @public
 */
var CurlCode;
(function (CurlCode) {
    CurlCode[CurlCode["CURLE_OK"] = 0] = "CURLE_OK";
    CurlCode[CurlCode["CURLE_UNSUPPORTED_PROTOCOL"] = 1] = "CURLE_UNSUPPORTED_PROTOCOL"; /* 1 */
    CurlCode[CurlCode["CURLE_FAILED_INIT"] = 2] = "CURLE_FAILED_INIT"; /* 2 */
    CurlCode[CurlCode["CURLE_URL_MALFORMAT"] = 3] = "CURLE_URL_MALFORMAT"; /* 3 */
    CurlCode[CurlCode["CURLE_NOT_BUILT_IN"] = 4] = "CURLE_NOT_BUILT_IN"; /* 4 - [was obsoleted in August 2007 for
                                      7.17.0, reused in April 2011 for 7.21.5] */
    CurlCode[CurlCode["CURLE_COULDNT_RESOLVE_PROXY"] = 5] = "CURLE_COULDNT_RESOLVE_PROXY"; /* 5 */
    CurlCode[CurlCode["CURLE_COULDNT_RESOLVE_HOST"] = 6] = "CURLE_COULDNT_RESOLVE_HOST"; /* 6 */
    CurlCode[CurlCode["CURLE_COULDNT_CONNECT"] = 7] = "CURLE_COULDNT_CONNECT"; /* 7 */
    CurlCode[CurlCode["CURLE_WEIRD_SERVER_REPLY"] = 8] = "CURLE_WEIRD_SERVER_REPLY"; /* 8 */
    CurlCode[CurlCode["CURLE_REMOTE_ACCESS_DENIED"] = 9] = "CURLE_REMOTE_ACCESS_DENIED"; /* 9 a service was denied by the server
                                      due to lack of access - when login fails
                                      this is not returned. */
    CurlCode[CurlCode["CURLE_FTP_ACCEPT_FAILED"] = 10] = "CURLE_FTP_ACCEPT_FAILED"; /* 10 - [was obsoleted in April 2006 for
                                      7.15.4, reused in Dec 2011 for 7.24.0]*/
    CurlCode[CurlCode["CURLE_FTP_WEIRD_PASS_REPLY"] = 11] = "CURLE_FTP_WEIRD_PASS_REPLY"; /* 11 */
    CurlCode[CurlCode["CURLE_FTP_ACCEPT_TIMEOUT"] = 12] = "CURLE_FTP_ACCEPT_TIMEOUT"; /* 12 - timeout occurred accepting server
                                      [was obsoleted in August 2007 for 7.17.0,
                                      reused in Dec 2011 for 7.24.0]*/
    CurlCode[CurlCode["CURLE_FTP_WEIRD_PASV_REPLY"] = 13] = "CURLE_FTP_WEIRD_PASV_REPLY"; /* 13 */
    CurlCode[CurlCode["CURLE_FTP_WEIRD_227_FORMAT"] = 14] = "CURLE_FTP_WEIRD_227_FORMAT"; /* 14 */
    CurlCode[CurlCode["CURLE_FTP_CANT_GET_HOST"] = 15] = "CURLE_FTP_CANT_GET_HOST"; /* 15 */
    CurlCode[CurlCode["CURLE_HTTP2"] = 16] = "CURLE_HTTP2"; /* 16 - A problem in the http2 framing layer.
                                      [was obsoleted in August 2007 for 7.17.0,
                                      reused in July 2014 for 7.38.0] */
    CurlCode[CurlCode["CURLE_FTP_COULDNT_SET_TYPE"] = 17] = "CURLE_FTP_COULDNT_SET_TYPE"; /* 17 */
    CurlCode[CurlCode["CURLE_PARTIAL_FILE"] = 18] = "CURLE_PARTIAL_FILE"; /* 18 */
    CurlCode[CurlCode["CURLE_FTP_COULDNT_RETR_FILE"] = 19] = "CURLE_FTP_COULDNT_RETR_FILE"; /* 19 */
    CurlCode[CurlCode["CURLE_OBSOLETE20"] = 20] = "CURLE_OBSOLETE20"; /* 20 - NOT USED */
    CurlCode[CurlCode["CURLE_QUOTE_ERROR"] = 21] = "CURLE_QUOTE_ERROR"; /* 21 - quote command failure */
    CurlCode[CurlCode["CURLE_HTTP_RETURNED_ERROR"] = 22] = "CURLE_HTTP_RETURNED_ERROR"; /* 22 */
    CurlCode[CurlCode["CURLE_WRITE_ERROR"] = 23] = "CURLE_WRITE_ERROR"; /* 23 */
    CurlCode[CurlCode["CURLE_OBSOLETE24"] = 24] = "CURLE_OBSOLETE24"; /* 24 - NOT USED */
    CurlCode[CurlCode["CURLE_UPLOAD_FAILED"] = 25] = "CURLE_UPLOAD_FAILED"; /* 25 - failed upload "command" */
    CurlCode[CurlCode["CURLE_READ_ERROR"] = 26] = "CURLE_READ_ERROR"; /* 26 - couldn't open/read from file */
    CurlCode[CurlCode["CURLE_OUT_OF_MEMORY"] = 27] = "CURLE_OUT_OF_MEMORY"; /* 27 */
    /* Note: CURLE_OUT_OF_MEMORY may sometimes indicate a conversion error
             instead of a memory allocation error if CURL_DOES_CONVERSIONS
             is defined
    */
    CurlCode[CurlCode["CURLE_OPERATION_TIMEDOUT"] = 28] = "CURLE_OPERATION_TIMEDOUT"; /* 28 - the timeout time was reached */
    CurlCode[CurlCode["CURLE_OBSOLETE29"] = 29] = "CURLE_OBSOLETE29"; /* 29 - NOT USED */
    CurlCode[CurlCode["CURLE_FTP_PORT_FAILED"] = 30] = "CURLE_FTP_PORT_FAILED"; /* 30 - FTP PORT operation failed */
    CurlCode[CurlCode["CURLE_FTP_COULDNT_USE_REST"] = 31] = "CURLE_FTP_COULDNT_USE_REST"; /* 31 - the REST command failed */
    CurlCode[CurlCode["CURLE_OBSOLETE32"] = 32] = "CURLE_OBSOLETE32"; /* 32 - NOT USED */
    CurlCode[CurlCode["CURLE_RANGE_ERROR"] = 33] = "CURLE_RANGE_ERROR"; /* 33 - RANGE "command" didn't work */
    CurlCode[CurlCode["CURLE_HTTP_POST_ERROR"] = 34] = "CURLE_HTTP_POST_ERROR"; /* 34 */
    CurlCode[CurlCode["CURLE_SSL_CONNECT_ERROR"] = 35] = "CURLE_SSL_CONNECT_ERROR"; /* 35 - wrong when connecting with SSL */
    CurlCode[CurlCode["CURLE_BAD_DOWNLOAD_RESUME"] = 36] = "CURLE_BAD_DOWNLOAD_RESUME"; /* 36 - couldn't resume download */
    CurlCode[CurlCode["CURLE_FILE_COULDNT_READ_FILE"] = 37] = "CURLE_FILE_COULDNT_READ_FILE"; /* 37 */
    CurlCode[CurlCode["CURLE_LDAP_CANNOT_BIND"] = 38] = "CURLE_LDAP_CANNOT_BIND"; /* 38 */
    CurlCode[CurlCode["CURLE_LDAP_SEARCH_FAILED"] = 39] = "CURLE_LDAP_SEARCH_FAILED"; /* 39 */
    CurlCode[CurlCode["CURLE_OBSOLETE40"] = 40] = "CURLE_OBSOLETE40"; /* 40 - NOT USED */
    CurlCode[CurlCode["CURLE_FUNCTION_NOT_FOUND"] = 41] = "CURLE_FUNCTION_NOT_FOUND"; /* 41 - NOT USED starting with 7.53.0 */
    CurlCode[CurlCode["CURLE_ABORTED_BY_CALLBACK"] = 42] = "CURLE_ABORTED_BY_CALLBACK"; /* 42 */
    CurlCode[CurlCode["CURLE_BAD_FUNCTION_ARGUMENT"] = 43] = "CURLE_BAD_FUNCTION_ARGUMENT"; /* 43 */
    CurlCode[CurlCode["CURLE_OBSOLETE44"] = 44] = "CURLE_OBSOLETE44"; /* 44 - NOT USED */
    CurlCode[CurlCode["CURLE_INTERFACE_FAILED"] = 45] = "CURLE_INTERFACE_FAILED"; /* 45 - CURLOPT_INTERFACE failed */
    CurlCode[CurlCode["CURLE_OBSOLETE46"] = 46] = "CURLE_OBSOLETE46"; /* 46 - NOT USED */
    CurlCode[CurlCode["CURLE_TOO_MANY_REDIRECTS"] = 47] = "CURLE_TOO_MANY_REDIRECTS"; /* 47 - catch endless re-direct loops */
    CurlCode[CurlCode["CURLE_UNKNOWN_OPTION"] = 48] = "CURLE_UNKNOWN_OPTION"; /* 48 - User specified an unknown option */
    CurlCode[CurlCode["CURLE_TELNET_OPTION_SYNTAX"] = 49] = "CURLE_TELNET_OPTION_SYNTAX"; /* 49 - Malformed telnet option */
    CurlCode[CurlCode["CURLE_OBSOLETE50"] = 50] = "CURLE_OBSOLETE50"; /* 50 - NOT USED */
    CurlCode[CurlCode["CURLE_OBSOLETE51"] = 51] = "CURLE_OBSOLETE51"; /* 51 - NOT USED */
    CurlCode[CurlCode["CURLE_GOT_NOTHING"] = 52] = "CURLE_GOT_NOTHING"; /* 52 - when this is a specific error */
    CurlCode[CurlCode["CURLE_SSL_ENGINE_NOTFOUND"] = 53] = "CURLE_SSL_ENGINE_NOTFOUND"; /* 53 - SSL crypto engine not found */
    CurlCode[CurlCode["CURLE_SSL_ENGINE_SETFAILED"] = 54] = "CURLE_SSL_ENGINE_SETFAILED"; /* 54 - can not set SSL crypto engine as
                                      default */
    CurlCode[CurlCode["CURLE_SEND_ERROR"] = 55] = "CURLE_SEND_ERROR"; /* 55 - failed sending network data */
    CurlCode[CurlCode["CURLE_RECV_ERROR"] = 56] = "CURLE_RECV_ERROR"; /* 56 - failure in receiving network data */
    CurlCode[CurlCode["CURLE_OBSOLETE57"] = 57] = "CURLE_OBSOLETE57"; /* 57 - NOT IN USE */
    CurlCode[CurlCode["CURLE_SSL_CERTPROBLEM"] = 58] = "CURLE_SSL_CERTPROBLEM"; /* 58 - problem with the local certificate */
    CurlCode[CurlCode["CURLE_SSL_CIPHER"] = 59] = "CURLE_SSL_CIPHER"; /* 59 - couldn't use specified cipher */
    CurlCode[CurlCode["CURLE_PEER_FAILED_VERIFICATION"] = 60] = "CURLE_PEER_FAILED_VERIFICATION"; /* 60 - peer's certificate or fingerprint
                                       wasn't verified fine */
    CurlCode[CurlCode["CURLE_BAD_CONTENT_ENCODING"] = 61] = "CURLE_BAD_CONTENT_ENCODING"; /* 61 - Unrecognized/bad encoding */
    CurlCode[CurlCode["CURLE_LDAP_INVALID_URL"] = 62] = "CURLE_LDAP_INVALID_URL"; /* 62 - Invalid LDAP URL */
    CurlCode[CurlCode["CURLE_FILESIZE_EXCEEDED"] = 63] = "CURLE_FILESIZE_EXCEEDED"; /* 63 - Maximum file size exceeded */
    CurlCode[CurlCode["CURLE_USE_SSL_FAILED"] = 64] = "CURLE_USE_SSL_FAILED"; /* 64 - Requested FTP SSL level failed */
    CurlCode[CurlCode["CURLE_SEND_FAIL_REWIND"] = 65] = "CURLE_SEND_FAIL_REWIND"; /* 65 - Sending the data requires a rewind
                                      that failed */
    CurlCode[CurlCode["CURLE_SSL_ENGINE_INITFAILED"] = 66] = "CURLE_SSL_ENGINE_INITFAILED"; /* 66 - failed to initialise ENGINE */
    CurlCode[CurlCode["CURLE_LOGIN_DENIED"] = 67] = "CURLE_LOGIN_DENIED"; /* 67 - user, password or similar was not
                                      accepted and we failed to login */
    CurlCode[CurlCode["CURLE_TFTP_NOTFOUND"] = 68] = "CURLE_TFTP_NOTFOUND"; /* 68 - file not found on server */
    CurlCode[CurlCode["CURLE_TFTP_PERM"] = 69] = "CURLE_TFTP_PERM"; /* 69 - permission problem on server */
    CurlCode[CurlCode["CURLE_REMOTE_DISK_FULL"] = 70] = "CURLE_REMOTE_DISK_FULL"; /* 70 - out of disk space on server */
    CurlCode[CurlCode["CURLE_TFTP_ILLEGAL"] = 71] = "CURLE_TFTP_ILLEGAL"; /* 71 - Illegal TFTP operation */
    CurlCode[CurlCode["CURLE_TFTP_UNKNOWNID"] = 72] = "CURLE_TFTP_UNKNOWNID"; /* 72 - Unknown transfer ID */
    CurlCode[CurlCode["CURLE_REMOTE_FILE_EXISTS"] = 73] = "CURLE_REMOTE_FILE_EXISTS"; /* 73 - File already exists */
    CurlCode[CurlCode["CURLE_TFTP_NOSUCHUSER"] = 74] = "CURLE_TFTP_NOSUCHUSER"; /* 74 - No such user */
    CurlCode[CurlCode["CURLE_CONV_FAILED"] = 75] = "CURLE_CONV_FAILED"; /* 75 - conversion failed */
    CurlCode[CurlCode["CURLE_CONV_REQD"] = 76] = "CURLE_CONV_REQD"; /* 76 - caller must register conversion
                                      callbacks using curl_easy_setopt options
                                      CURLOPT_CONV_FROM_NETWORK_FUNCTION,
                                      CURLOPT_CONV_TO_NETWORK_FUNCTION, and
                                      CURLOPT_CONV_FROM_UTF8_FUNCTION */
    CurlCode[CurlCode["CURLE_SSL_CACERT_BADFILE"] = 77] = "CURLE_SSL_CACERT_BADFILE"; /* 77 - could not load CACERT file, missing
                                      or wrong format */
    CurlCode[CurlCode["CURLE_REMOTE_FILE_NOT_FOUND"] = 78] = "CURLE_REMOTE_FILE_NOT_FOUND"; /* 78 - remote file not found */
    CurlCode[CurlCode["CURLE_SSH"] = 79] = "CURLE_SSH"; /* 79 - error from the SSH layer, somewhat
                                      generic so the error message will be of
                                      interest when this has happened */
    CurlCode[CurlCode["CURLE_SSL_SHUTDOWN_FAILED"] = 80] = "CURLE_SSL_SHUTDOWN_FAILED"; /* 80 - Failed to shut down the SSL
                                      connection */
    CurlCode[CurlCode["CURLE_AGAIN"] = 81] = "CURLE_AGAIN"; /* 81 - socket is not ready for send/recv,
                                      wait till it's ready and try again (Added
                                      in 7.18.2) */
    CurlCode[CurlCode["CURLE_SSL_CRL_BADFILE"] = 82] = "CURLE_SSL_CRL_BADFILE"; /* 82 - could not load CRL file, missing or
                                      wrong format (Added in 7.19.0) */
    CurlCode[CurlCode["CURLE_SSL_ISSUER_ERROR"] = 83] = "CURLE_SSL_ISSUER_ERROR"; /* 83 - Issuer check failed.  (Added in
                                      7.19.0) */
    CurlCode[CurlCode["CURLE_FTP_PRET_FAILED"] = 84] = "CURLE_FTP_PRET_FAILED"; /* 84 - a PRET command failed */
    CurlCode[CurlCode["CURLE_RTSP_CSEQ_ERROR"] = 85] = "CURLE_RTSP_CSEQ_ERROR"; /* 85 - mismatch of RTSP CSeq numbers */
    CurlCode[CurlCode["CURLE_RTSP_SESSION_ERROR"] = 86] = "CURLE_RTSP_SESSION_ERROR"; /* 86 - mismatch of RTSP Session Ids */
    CurlCode[CurlCode["CURLE_FTP_BAD_FILE_LIST"] = 87] = "CURLE_FTP_BAD_FILE_LIST"; /* 87 - unable to parse FTP file list */
    CurlCode[CurlCode["CURLE_CHUNK_FAILED"] = 88] = "CURLE_CHUNK_FAILED"; /* 88 - chunk callback reported error */
    CurlCode[CurlCode["CURLE_NO_CONNECTION_AVAILABLE"] = 89] = "CURLE_NO_CONNECTION_AVAILABLE"; /* 89 - No connection available, the
                                      session will be queued */
    CurlCode[CurlCode["CURLE_SSL_PINNEDPUBKEYNOTMATCH"] = 90] = "CURLE_SSL_PINNEDPUBKEYNOTMATCH"; /* 90 - specified pinned public key did not
                                       match */
    CurlCode[CurlCode["CURLE_SSL_INVALIDCERTSTATUS"] = 91] = "CURLE_SSL_INVALIDCERTSTATUS"; /* 91 - invalid certificate status */
    CurlCode[CurlCode["CURLE_HTTP2_STREAM"] = 92] = "CURLE_HTTP2_STREAM"; /* 92 - stream error in HTTP/2 framing layer */
    CurlCode[CurlCode["CURLE_RECURSIVE_API_CALL"] = 93] = "CURLE_RECURSIVE_API_CALL"; /* 93 - an api function was called from inside a callback */
    CurlCode[CurlCode["CURLE_AUTH_ERROR"] = 94] = "CURLE_AUTH_ERROR"; /* 94 - an authentication function returned an error */
    CurlCode[CurlCode["CURLE_HTTP3"] = 95] = "CURLE_HTTP3"; /* 95 - An HTTP/3 layer problem */
    CurlCode[CurlCode["CURLE_QUIC_CONNECT_ERROR"] = 96] = "CURLE_QUIC_CONNECT_ERROR"; /* 96 - QUIC connection error */
    CurlCode[CurlCode["CURLE_LAST"] = 97] = "CURLE_LAST";
    /*  compatibility with older names */
    CurlCode[CurlCode["CURLE_FTP_WEIRD_SERVER_REPLY"] = 8] = "CURLE_FTP_WEIRD_SERVER_REPLY";
    CurlCode[CurlCode["CURLE_SSL_CACERT"] = 60] = "CURLE_SSL_CACERT";
    CurlCode[CurlCode["CURLE_UNKNOWN_TELNET_OPTION"] = 48] = "CURLE_UNKNOWN_TELNET_OPTION";
    CurlCode[CurlCode["CURLE_SSL_PEER_CERTIFICATE"] = 60] = "CURLE_SSL_PEER_CERTIFICATE";
    CurlCode[CurlCode["CURLE_FTP_ACCESS_DENIED"] = 9] = "CURLE_FTP_ACCESS_DENIED";
    CurlCode[CurlCode["CURLE_FTP_COULDNT_SET_BINARY"] = 17] = "CURLE_FTP_COULDNT_SET_BINARY";
    CurlCode[CurlCode["CURLE_FTP_QUOTE_ERROR"] = 21] = "CURLE_FTP_QUOTE_ERROR";
    CurlCode[CurlCode["CURLE_TFTP_DISKFULL"] = 70] = "CURLE_TFTP_DISKFULL";
    CurlCode[CurlCode["CURLE_TFTP_EXISTS"] = 73] = "CURLE_TFTP_EXISTS";
    CurlCode[CurlCode["CURLE_HTTP_RANGE_ERROR"] = 33] = "CURLE_HTTP_RANGE_ERROR";
    CurlCode[CurlCode["CURLE_FTP_SSL_FAILED"] = 64] = "CURLE_FTP_SSL_FAILED";
    /* The following were added earlier */
    CurlCode[CurlCode["CURLE_OPERATION_TIMEOUTED"] = 28] = "CURLE_OPERATION_TIMEOUTED";
    CurlCode[CurlCode["CURLE_HTTP_NOT_FOUND"] = 22] = "CURLE_HTTP_NOT_FOUND";
    CurlCode[CurlCode["CURLE_HTTP_PORT_FAILED"] = 45] = "CURLE_HTTP_PORT_FAILED";
    CurlCode[CurlCode["CURLE_FTP_COULDNT_STOR_FILE"] = 25] = "CURLE_FTP_COULDNT_STOR_FILE";
    CurlCode[CurlCode["CURLE_FTP_PARTIAL_FILE"] = 18] = "CURLE_FTP_PARTIAL_FILE";
    CurlCode[CurlCode["CURLE_FTP_BAD_DOWNLOAD_RESUME"] = 36] = "CURLE_FTP_BAD_DOWNLOAD_RESUME";
})(CurlCode = exports.CurlCode || (exports.CurlCode = {}));
// https://github.com/curl/curl/blob/e1be825453/include/curl/curl.h#L2675
/**
 * @public
 */
var CurlShareCode;
(function (CurlShareCode) {
    CurlShareCode[CurlShareCode["CURLSHE_OK"] = 0] = "CURLSHE_OK"; /* all is fine */
    CurlShareCode[CurlShareCode["CURLSHE_BAD_OPTION"] = 1] = "CURLSHE_BAD_OPTION"; /* 1 */
    CurlShareCode[CurlShareCode["CURLSHE_IN_USE"] = 2] = "CURLSHE_IN_USE"; /* 2 */
    CurlShareCode[CurlShareCode["CURLSHE_INVALID"] = 3] = "CURLSHE_INVALID"; /* 3 */
    CurlShareCode[CurlShareCode["CURLSHE_NOMEM"] = 4] = "CURLSHE_NOMEM"; /* 4 out of memory */
    CurlShareCode[CurlShareCode["CURLSHE_NOT_BUILT_IN"] = 5] = "CURLSHE_NOT_BUILT_IN"; /* 5 feature not present in lib */
    CurlShareCode[CurlShareCode["CURLSHE_LAST"] = 6] = "CURLSHE_LAST";
})(CurlShareCode = exports.CurlShareCode || (exports.CurlShareCode = {}));
//# sourceMappingURL=CurlCode.js.map

/***/ }),
/* 990 */,
/* 991 */,
/* 992 */,
/* 993 */,
/* 994 */,
/* 995 */,
/* 996 */,
/* 997 */,
/* 998 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

var shebangRegex = __webpack_require__(171);

module.exports = function (str) {
	var match = str.match(shebangRegex);

	if (!match) {
		return null;
	}

	var arr = match[0].replace(/#! ?/, '').split(' ');
	var bin = arr[0].split('/').pop();
	var arg = arr[1];

	return (bin === 'env' ?
		arg :
		bin + (arg ? ' ' + arg : '')
	);
};


/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map