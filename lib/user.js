
var clone = require('clone')
  , Cookie = require('./cookie')
  , defaults = require('defaults')
  , extend = require('extend');


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


module.exports = User;
