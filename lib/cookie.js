var bindAll   = require('bind-all')
  , cookie    = require('cookie')
  , clone     = require('clone')
  , defaults  = require('defaults')
  , json      = require('json')
  , topDomain = require('top-domain');


function Cookie(options) {
  this.options(options);
}

Cookie.prototype.options = function (options) {
  if(arguments.length === 0) return this._options;
  options || (options = {});

  var domain = '.' + topDomain(window.location.href);
  if (domain === '.localhost') domain = '';

  defaults(options, {
    maxage  : 31536000000, // default to a year
    path    : '/',
    domain  : domain
  });

  this._options = options;
};


Cookie.prototype.set = function (key, value) {
  try {
    value = json.stringify(value);
    cookie(key, value, clone(this._options));
    return true;
  } catch (e) {
    return false;
  }
};

Cookie.prototype.get = function (key) {
  try {
    var value = cookie(key);
    value = value ? json.parse(value) : null;
    return value;
  } catch (e) {
    return null;
  }
};


Cookie.prototype.remove = function (key) {
  try {
    cookie(key, null, clone(this._options));
    return true;
  } catch (e) {
    return false;
  }
};


module.exports = bindAll(new Cookie());

module.exports.Cookie = Cookie;
