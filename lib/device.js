
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
  if(this.id() === null) {
    var id = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      })
    this.cookie.set(this._options.cookie.key)
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
  return this.cookie.get(this._options.cookie.key)
};


module.exports = Device;

