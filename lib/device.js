
"use strict";
/*jslint browser: true, nomen: true*/

var Cookie = require('./cookie'),
    defaults = require('defaults');


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
Device.prototype.initialize = function () {
    if (this.id() === null) {
        var id = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            /*jslint bitwise: true*/
            var r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            /*jslint bitwise: false*/
            return v.toString(16);
        });
        this.cookie.set(this._options.cookie.key, id);
    }
};

/**
 * Sets or retrieves the options on the device.
 */
Device.prototype.options = function (value) {
    if (arguments.length === 0) {
        return this._options;
    }
    var options = value || {};
    defaults(options, {cookie: {key: 'ldmk_device_id'}});
    this._options = options;
};

/**
 * Retrieve's the device identifier.
 */
Device.prototype.id = function (id) {
    if (this._options.mode === "test") {
        return "x";
    }
    return this.cookie.get(this._options.cookie.key);
};

/**
 * Serializes the Device into a hash.
 */
Device.prototype.serialize = function () {
    return {id: this.id()};
};

module.exports = Device;

