
var Cookie = require('./cookie')
  , User   = require('./user')
  , is     = require('is')
  , nextTick = require('next-tick')
;

module.exports = exports = Landmark;

exports.VERSION = Landmark.prototype.VERSION = '0.0.1';

function Landmark () {
  this.cookie = new Cookie();
  this.user = new User();
  this.initialized = false;
}

Landmark.prototype.init =
Landmark.prototype.initialize = function(options) {
  options || (options = {});

  this.cookie.options(options.cookie);
  this.user.options(options.user);

  this.initialized = true;
};

/**
 * Identify a user by optional `id` and `traits`.
 */
Landmark.prototype.identify = function(id, traits, fn) {
  if(is.fn(traits)) fn = traits, traits = undefined;
  if(is.object(id)) traits = id, id = this.user.id();

  this.user.identify(id, traits);

  // TODO: Queue for send.
  if(is.fn(fn)) nextTick(fn);

  return this;
};
