;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("avetisk-defaults/index.js", function(exports, require, module){
'use strict';

/**
 * Merge default values.
 *
 * @param {Object} dest
 * @param {Object} defaults
 * @return {Object}
 * @api public
 */
var defaults = function (dest, src, recursive) {
  for (var prop in src) {
    if (recursive && dest[prop] instanceof Object && src[prop] instanceof Object) {
      dest[prop] = defaults(dest[prop], src[prop], true);
    } else if (! (prop in dest)) {
      dest[prop] = src[prop];
    }
  }

  return dest;
};

/**
 * Expose `defaults`.
 */
module.exports = defaults;

});
require.register("component-bind/index.js", function(exports, require, module){

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});
require.register("component-clone/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var type;

try {
  type = require('type');
} catch(e){
  type = require('type-component');
}

/**
 * Module exports.
 */

module.exports = clone;

/**
 * Clones objects.
 *
 * @param {Mixed} any object
 * @api public
 */

function clone(obj){
  switch (type(obj)) {
    case 'object':
      var copy = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = clone(obj[key]);
        }
      }
      return copy;

    case 'array':
      var copy = new Array(obj.length);
      for (var i = 0, l = obj.length; i < l; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;

    case 'regexp':
      // from millermedeiros/amd-utils - MIT
      var flags = '';
      flags += obj.multiline ? 'm' : '';
      flags += obj.global ? 'g' : '';
      flags += obj.ignoreCase ? 'i' : '';
      return new RegExp(obj.source, flags);

    case 'date':
      return new Date(obj.getTime());

    default: // string, number, boolean, …
      return obj;
  }
}

});
require.register("component-cookie/index.js", function(exports, require, module){
/**
 * Encode.
 */

var encode = encodeURIComponent;

/**
 * Decode.
 */

var decode = decodeURIComponent;

/**
 * Set or get cookie `name` with `value` and `options` object.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Mixed}
 * @api public
 */

module.exports = function(name, value, options){
  switch (arguments.length) {
    case 3:
    case 2:
      return set(name, value, options);
    case 1:
      return get(name);
    default:
      return all();
  }
};

/**
 * Set cookie `name` to `value`.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @api private
 */

function set(name, value, options) {
  options = options || {};
  var str = encode(name) + '=' + encode(value);

  if (null == value) options.maxage = -1;

  if (options.maxage) {
    options.expires = new Date(+new Date + options.maxage);
  }

  if (options.path) str += '; path=' + options.path;
  if (options.domain) str += '; domain=' + options.domain;
  if (options.expires) str += '; expires=' + options.expires.toGMTString();
  if (options.secure) str += '; secure';

  document.cookie = str;
}

/**
 * Return all cookies.
 *
 * @return {Object}
 * @api private
 */

function all() {
  return parse(document.cookie);
}

/**
 * Get cookie `name`.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function get(name) {
  return all()[name];
}

/**
 * Parse cookie `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parse(str) {
  var obj = {};
  var pairs = str.split(/ *; */);
  var pair;
  if ('' == pairs[0]) return obj;
  for (var i = 0; i < pairs.length; ++i) {
    pair = pairs[i].split('=');
    obj[decode(pair[0])] = decode(pair[1]);
  }
  return obj;
}

});
require.register("component-to-function/index.js", function(exports, require, module){

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  }
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  }
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18"
  return new Function('_', 'return _.' + str);
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {}
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key])
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  }
}

});
require.register("component-each/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var toFunction = require('to-function');
var type;

try {
  type = require('type-component');
} catch (e) {
  type = require('type');
}

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @api public
 */

module.exports = function(obj, fn){
  fn = toFunction(fn);
  switch (type(obj)) {
    case 'array':
      return array(obj, fn);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn);
      return object(obj, fn);
    case 'string':
      return string(obj, fn);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @api private
 */

function string(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

function object(obj, fn) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn(key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @api private
 */

function array(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj[i], i);
  }
}

});
require.register("component-trim/index.js", function(exports, require, module){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

});
require.register("component-querystring/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var trim = require('trim');

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    obj[parts[0]] = null == parts[1]
      ? ''
      : decodeURIComponent(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function(obj){
  if (!obj) return '';
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
};

});
require.register("component-type/index.js", function(exports, require, module){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});
require.register("ianstormtaylor-is-empty/index.js", function(exports, require, module){

/**
 * Expose `isEmpty`.
 */

module.exports = isEmpty;


/**
 * Has.
 */

var has = Object.prototype.hasOwnProperty;


/**
 * Test whether a value is "empty".
 *
 * @param {Mixed} val
 * @return {Boolean}
 */

function isEmpty (val) {
  if (null == val) return true;
  if ('number' == typeof val) return 0 === val;
  if (undefined !== val.length) return 0 === val.length;
  for (var key in val) if (has.call(val, key)) return false;
  return true;
}
});
require.register("segmentio-extend/index.js", function(exports, require, module){

module.exports = function extend (object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }

    return object;
};
});
require.register("component-url/index.js", function(exports, require, module){

/**
 * Parse the given `url`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(url){
  var a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: ('0' === a.port || '' === a.port) ? location.port : a.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1)
  };
};

/**
 * Check if `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(url){
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
};

/**
 * Check if `url` is relative.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isRelative = function(url){
  return !exports.isAbsolute(url);
};

/**
 * Check if `url` is cross domain.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isCrossDomain = function(url){
  url = exports.parse(url);
  return url.hostname !== location.hostname
    || url.port !== location.port
    || url.protocol !== location.protocol;
};
});
require.register("segmentio-top-domain/index.js", function(exports, require, module){

var url = require('url');

// Official Grammar: http://tools.ietf.org/html/rfc883#page-56
// Look for tlds with up to 2-6 characters.

module.exports = function (urlStr) {

  var host     = url.parse(urlStr).hostname
    , topLevel = host.match(/[a-z0-9][a-z0-9\-]*[a-z0-9]\.[a-z\.]{2,6}$/i);

  return topLevel ? topLevel[0] : host;
};
});
require.register("timoxley-next-tick/index.js", function(exports, require, module){
"use strict"

if (typeof setImmediate == 'function') {
  module.exports = function(f){ setImmediate(f) }
}
// legacy node.js
else if (typeof process != 'undefined' && typeof process.nextTick == 'function') {
  module.exports = process.nextTick
}
// fallback for other environments / postMessage behaves badly on IE8
else if (typeof window == 'undefined' || window.ActiveXObject || !window.postMessage) {
  module.exports = function(f){ setTimeout(f) };
} else {
  var q = [];

  window.addEventListener('message', function(){
    var i = 0;
    while (i < q.length) {
      try { q[i++](); }
      catch (e) {
        q = q.slice(i);
        window.postMessage('tic!', '*');
        throw e;
      }
    }
    q.length = 0;
  }, true);

  module.exports = function(fn){
    if (!q.length) window.postMessage('tic!', '*');
    q.push(fn);
  }
}

});
require.register("landmark/lib/index.js", function(exports, require, module){

var Landmark = require('./landmark')
  , bind = require('bind');

module.exports = new Landmark();

bind(module.exports, module.exports.init);
bind(module.exports, module.exports.initialize);

});
require.register("landmark/lib/landmark.js", function(exports, require, module){

var Cookie      = require('./cookie')
  , Device      = require('./device')
  , User        = require('./user')
  , each        = require('each')
  , extend      = require('extend')
  , isEmpty     = require('is-empty')
  , nextTick    = require('next-tick')
  , querystring = require('querystring')
  , type        = require('type')
;

module.exports = exports = Landmark;

exports.VERSION = Landmark.prototype.VERSION = '0.0.1';

function Landmark () {
  this.host = "landmark.io";
  this.port = 80;
  this.cookie = new Cookie();
  this.device = new Device();
  this.user = new User();
  this._queue = [];
  this.initialized = false;
}

Landmark.prototype.init =
Landmark.prototype.initialize = function(options) {
  this.options(options);
  this.initialized = true;
};

/**
 * Sets or retrieves the current options.
 */
Landmark.prototype.options = function(options) {
  if (arguments.length === 0) return this._options;
  options || (options = {});

  this._options = options;
  this.cookie.options(options.cookie);
  this.device.options(options.device);
  this.user.options(options.user);
};

/**
 * Identify a user by optional `id` and `traits`.
 */
Landmark.prototype.identify = function(id, traits, fn) {
  if(type(traits) == "function") fn = traits, traits = undefined;
  if(type(id) == "object") traits = id, id = this.user.id();

  var self = this;
  this.user.identify(id, traits);

  // Queue a send if an event is not scheduled by the next tick.
  nextTick(function() {
    if(self._queue.length == 0) self._enqueue({}, fn);
  });

  return this;
};

/**
 * Retrieves whether a user identifier or traits have been set.
 */
Landmark.prototype.identified = function() {
  return !isEmpty(this.user.serialize());
};

/**
 * Track an event that a user has triggered with optional properties.
 */
Landmark.prototype.track = function(action, properties, fn) {
  if(type(properties) == "function") fn = properties, properties = undefined;

  var event = {
    channel: "Web",
    action: action,
    resource: this.resource(),
  };
  event = extend(event, properties);

  // Queue event immediately if identification has already happened.
  if(this.identified()) {
    this._enqueue(event, fn);

  // Otherwise wait a tick so we can merge it with identification.
  } else {
    var self = this;
    nextTick(function() {
      self._enqueue(event, fn);
    });
  }
};

/**
 * Sets or retrieves the current resource. If set to a function then the
 * resource will be the result of the function with the following signature:
 *
 *   function(pathname)
 *
 */
Landmark.prototype.resource = function(value) {
  if(arguments.length == 0) return this._resource(window.location.pathname);
  var ret = value;
  if(type(value) != "function") ret = function(_) { return value };
  this._resource = ret;
}

/**
 * Queues an event to be sent to the server on the next tick.
 */
Landmark.prototype._enqueue = function(event, callback) {
  var self = this;
  this._queue.push({event:event, callback:callback});
  nextTick(function() { self._dequeue() });
};

/**
 * Processes an event in the queue.
 */
Landmark.prototype._dequeue = function() {
  if(this._queue.length == 0) return;

  // Retrieve the first event in the queue.
  var item = this._queue.shift();
  var event = item.event;
  var callback = item.callback;

  // Send to tracking URL with device id, user id, traits, & event.
  this._send({
    user: this.user.serialize(),
    device: this.device.serialize(),
    event: event,
  }, callback);
  
  // Process next event on next tick.
  var self = this;
  nextTick(function() { self._dequeue() });
};

/**
 * Makes a request to a given path.
 */
Landmark.prototype._send = function(params, callback) {
  // Generate a tracking url.
  var url = this._trackurl(params);
  if(url === null) {
    if(type(callback) == "function") callback(false, null);
    return
  }

  // Add image to body to trigger call.
  var attr = this._options.mode == "test" ? "title" : "src";
  var e = document.createElement("img");
  e.width = e.height = 1;
  e[attr] = url;
  document.body.appendChild(e);

  // Remove element after the next tick.
  nextTick(function() {
    try { document.body.removeChild(e); } catch(e) {}
    if(type(callback) == "function") callback(true, e[attr]);
  });
};

/**
 * Generates a tracking URL from a set of parameters.
 */
Landmark.prototype._trackurl = function(params) {
  // If there are no traits or event data then don't generate a url.
  if((!params.user || isEmpty(params.user.traits)) && isEmpty(params.event)) return null;

  // Convert each parameter to JSON.
  var q = {};
  if(this.apiKey) q.api_key = this.apiKey;
  each(params, function(k, v) { if(!isEmpty(v)) q[k] = JSON.stringify(v) });

  // Generate full URL with query parameters.
  var url = "";
  if(this.host) url += ('https:' === document.location.protocol ? 'https://' : 'http://') + this.host + ":" + this.port;
  url += "/track";
  url += "?" + querystring.stringify(q);

  return url;
};

/**
 * Parses a tracking URL. Used for testing.
 */
Landmark.prototype._parsetrackurl = function(url) {
  var q = querystring.parse(url.substr(url.indexOf("?")+1));
  each(q, function(k, v) { if(k != "api_key") q[k] = JSON.parse(v)});
  return q;
};

});
require.register("landmark/lib/device.js", function(exports, require, module){

var Cookie = require('./cookie')
  , defaults = require('defaults');


/**
 * A Device represents the browser that the user is on. The device identifier
 * can be used while a user is unidentified.
 */
function Device(options) {
  this.cookie = new Cookie();
  this.options(options);
  this.initialize();
}

/**
 * Initializes the device with a new identifier if it doesn't have one yet.
 */
Device.prototype.initialize = function() {
  if(this.id() == null) {
    var id = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      })
    this.cookie.set(this._options.cookie.key, id);
  }
};

/**
 * Sets or retrieves the options on the device.
 */
Device.prototype.options = function(options) {
  if (arguments.length === 0) return this._options;
  options || (options = {});

  defaults(options, {cookie:{key:'ldmk_device_id'}});
  this._options = options;
};

/**
 * Retrieve's the device identifier.
 */
Device.prototype.id = function(id) {
  if(this._options.mode == "test") return "x";
  return this.cookie.get(this._options.cookie.key)
};

/**
 * Serializes the Device into a hash.
 */
Device.prototype.serialize = function() {
  return {
    id: this.id()
  }
};

module.exports = Device;


});
require.register("landmark/lib/cookie.js", function(exports, require, module){

var bind = require('bind')
  , cookie = require('cookie')
  , clone = require('clone')
  , defaults = require('defaults')
  , topDomain = require('top-domain');


function Cookie(options) {
  this.options(options);
}

/**
 * Get or set the cookie options
 */
Cookie.prototype.options = function (options) {
  if (arguments.length === 0) return this._options;

  options || (options = {});

  var domain = '.' + topDomain(window.location.href);

  // localhost cookies are special: http://curl.haxx.se/rfc/cookie_spec.html
  if (domain === '.localhost') domain = '';

  defaults(options, {
    maxage  : 31536000000, // default to a year
    path    : '/',
    domain  : domain
  });

  this._options = options;
};


/**
 * Set a value in our cookie
 */
Cookie.prototype.set = function (key, value) {
  try {
    value = JSON.stringify(value);
    cookie(key, value, clone(this._options));
    return true;
  } catch (e) {
    return false;
  }
};


/**
 * Get a value from our cookie
 */
Cookie.prototype.get = function (key) {
  try {
    var value = cookie(key);
    value = value ? JSON.parse(value) : null;
    return value;
  } catch (e) {
    return null;
  }
};


/**
 * Remove a value from the cookie
 */
Cookie.prototype.remove = function (key) {
  try {
    cookie(key, null, clone(this._options));
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = Cookie;

});
require.register("landmark/lib/user.js", function(exports, require, module){

var clone = require('clone')
  , Cookie = require('./cookie')
  , clone = require('clone')
  , defaults = require('defaults')
  , extend = require('extend')
  , isEmpty = require('is-empty');


function User(options) {
  this.cookie = new Cookie();
  this.options(options);
  this.id(null);
  this.traits({});
}


User.prototype.options = function (options) {
  if (arguments.length === 0) return this._options;
  options || (options = {});

  defaults(options, {
    cookie: {
      key: 'ldmk_user_id',
    },
  });

  this._options = options;
};


/**
 * Get or set the user's `id`.
 */
User.prototype.id = function (id) {
  if(arguments.length == 0) return this.cookie.get(this._options.cookie.key)
  this.cookie.set(this._options.cookie.key, id);
};

/**
 * Get or set the user's `traits`.
 */
User.prototype.traits = function (traits) {
  if(arguments.length == 0) return this._traits;
  this._traits = clone(traits || {});
};


/**
 * Identity the user with an `id` and `traits`. If it's the same user, extend
 * the existing `traits` instead of overwriting.
 */
User.prototype.identify = function (id, traits) {
  traits || (traits = {});
  if(this.id() === null || this.id() === id) {
    traits = extend(this.traits(), traits);
  }
  this.id(id);
  this.traits(traits);
};


/**
 * Log the user out, resetting `id` and `traits` to defaults.
 */
User.prototype.logout = function () {
  this.id(null);
  this.traits({});
  this.cookie.remove(this._options.cookie.key);
};

/**
 * Serializes the User into a hash.
 */
User.prototype.serialize = function() {
  var obj = {};
  if(this.id()) obj.id = this.id();
  if(!isEmpty(this.traits())) obj.traits = clone(this.traits());
  return obj;
};


module.exports = User;

});











require.alias("avetisk-defaults/index.js", "landmark/deps/defaults/index.js");
require.alias("avetisk-defaults/index.js", "defaults/index.js");

require.alias("component-bind/index.js", "landmark/deps/bind/index.js");
require.alias("component-bind/index.js", "bind/index.js");

require.alias("component-clone/index.js", "landmark/deps/clone/index.js");
require.alias("component-clone/index.js", "clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-cookie/index.js", "landmark/deps/cookie/index.js");
require.alias("component-cookie/index.js", "cookie/index.js");

require.alias("component-each/index.js", "landmark/deps/each/index.js");
require.alias("component-each/index.js", "each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-querystring/index.js", "landmark/deps/querystring/index.js");
require.alias("component-querystring/index.js", "querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("component-type/index.js", "landmark/deps/type/index.js");
require.alias("component-type/index.js", "type/index.js");

require.alias("ianstormtaylor-is-empty/index.js", "landmark/deps/is-empty/index.js");
require.alias("ianstormtaylor-is-empty/index.js", "is-empty/index.js");

require.alias("segmentio-extend/index.js", "landmark/deps/extend/index.js");
require.alias("segmentio-extend/index.js", "extend/index.js");

require.alias("segmentio-top-domain/index.js", "landmark/deps/top-domain/index.js");
require.alias("segmentio-top-domain/index.js", "landmark/deps/top-domain/index.js");
require.alias("segmentio-top-domain/index.js", "top-domain/index.js");
require.alias("component-url/index.js", "segmentio-top-domain/deps/url/index.js");

require.alias("segmentio-top-domain/index.js", "segmentio-top-domain/index.js");
require.alias("timoxley-next-tick/index.js", "landmark/deps/next-tick/index.js");
require.alias("timoxley-next-tick/index.js", "next-tick/index.js");

require.alias("landmark/lib/index.js", "landmark/index.js");if (typeof exports == "object") {
  module.exports = require("landmark");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("landmark"); });
} else {
  this["landmark"] = require("landmark");
}})();