
"use strict";
/*jslint browser: true, nomen: true*/

var bind = require('bind'),
    cookie = require('cookie'),
    clone = require('clone'),
    defaults = require('defaults'),
    topDomain = require('top-domain');


function Cookie(options) {
    this.options(options);
}

/**
 * Get or set the cookie options
 */
Cookie.prototype.options = function (value) {
    if (arguments.length === 0) {
        return this._options;
    }

    var options = value || {},
        domain = '.' + topDomain(window.location.href);

    if (domain === '.localhost') {
        domain = '';
    }

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
