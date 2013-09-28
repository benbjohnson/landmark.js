
var Cookie   = require('./cookie')
  , Device   = require('./device')
  , User     = require('./user')
  , extend   = require('extend')
  , nextTick = require('next-tick')
  , type     = require('type')
;

module.exports = exports = Landmark;

exports.VERSION = Landmark.prototype.VERSION = '0.0.1';

function Landmark () {
  this.cookie = new Cookie();
  this.device = new Device();
  this.user = new User();
  this._queue = [];
  this.initialized = false;
}

Landmark.prototype.init =
Landmark.prototype.initialize = function(options) {
  options || (options = {});

  this.cookie.options(options.cookie);
  this.device.options(options.device);
  this.user.options(options.user);

  this.initialized = true;
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
    if(self._queue.length == 0) self._enqueue({});
  });

  return this;
};

/**
 * Track an event that a user has triggered with optional properties.
 */
Landmark.prototype.track = function(action, properties) {
  var event = {
    channel: "web",
    action: action,
    resource: this.resource(),
    url: window.location.href,
  };
  event = extend(event, properties);

  this._enqueue(event);
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
  if(type(value) != "function") value = function(_) { return value };
  this._resource = value;
}

/**
 * Queues an event to be sent to the server on the next tick.
 */
Landmark.prototype._enqueue = function(event) {
  var self = this;
  this._queue.push(event);
  nextTick(function() { self._dequeue() });
};

/**
 * Processes an event in the queue.
 */
Landmark.prototype._dequeue = function(event) {
  var self = this;

  if(this._queue.length == 0) return;

  // Retrieve the first event in the queue.
  var event = this._queue.shift();

  // TODO: Send to tracking URL with device id, user id, traits, & event.
  
  // Process next event on next tick.
  nextTick(function() { self._dequeue() });
};
