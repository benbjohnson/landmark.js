
"use strict";
/*jslint browser: true, nomen: true*/


var Cookie      = require('./cookie'),
    Device      = require('./device'),
    User        = require('./user'),
    each        = require('each'),
    extend      = require('extend'),
    isEmpty     = require('is-empty'),
    nextTick    = require('next-tick'),
    querystring = require('querystring'),
    type        = require('type');

function Landmark() {
    this.host = "landmark.io";
    this.port = 80;
    this.cookie = new Cookie();
    this.device = new Device();
    this.user = new User();
    this._queue = [];
    this.initialized = false;
}

Landmark.prototype.initialize = function (options) {
    this.options(options);
    this.initialized = true;
    this.pageview();
};

Landmark.prototype.init = Landmark.prototype.inititialize;

/**
 * Sets or retrieves the current options.
 */
Landmark.prototype.options = function (value) {
    if (arguments.length === 0) {
        return this._options;
    }
    var options = value || {};
    this._options = options;
    this.cookie.options(options.cookie);
    this.device.options(options.device);
    this.user.options(options.user);
};

/**
 * Identify a user by optional `id` and `traits`.
 */
Landmark.prototype.identify = function (id, traits, fn) {
    if (type(traits) === "function") {
        fn = traits;
        traits = undefined;
    }
    if (type(id) === "object") {
        traits = id;
        id = this.user.id();
    }

    var self = this;
    this.user.identify(id, traits);

    // Queue a send if an event is not scheduled by the next tick.
    nextTick(function () {
        if (self._queue.length === 0) {
            self._enqueue({}, fn);
        }
    });

    return this;
};

/**
 * Retrieves whether a user identifier or traits have been set.
 */
Landmark.prototype.identified = function () {
    return !isEmpty(this.user.serialize());
};

/**
 * Track an event that a user has triggered with optional properties.
 */
Landmark.prototype.track = function (action, properties, fn) {
    if (type(properties) === "function") {
        fn = properties;
        properties = undefined;
    }

    var self = this,
        event = {
            channel: "Web",
            action: action,
            resource: this.resource(),
        };
    event = extend(event, properties);

    // Queue event immediately if identification has already happened.
    if (this.identified()) {
        this._enqueue(event, fn);

    // Otherwise wait a tick so we can merge it with identification.
    } else {
        nextTick(function () {
            self._enqueue(event, fn);
        });
    }

    return this;
};

/**
 * Tracks a page view. This is called automatically after initialization
 * but is useful to call for single-page apps.
 */
Landmark.prototype.pageview = function (properties, fn) {
    this.track("Page View", properties, fn);
    return this;
};

/**
 * Sets or retrieves the current resource. If set to a function then the
 * resource will be the result of the function with the following signature:
 *
 *   function (pathname)
 *
 */
Landmark.prototype.resource = function (value) {
    if (arguments.length === 0) {
        return this._resource(window.location.pathname);
    }
    var v = (typeof (value) === "function" ? value : function () { return value; });
    this._resource = v;
};

/**
 * Queues an event to be sent to the server on the next tick.
 */
Landmark.prototype._enqueue = function (event, callback) {
    var self = this;
    this._queue.push({event: event, callback: callback});
    nextTick(function () {
        self._dequeue();
    });
};

/**
 * Processes an event in the queue.
 */
Landmark.prototype._dequeue = function () {
    if (this._queue.length === 0) {
        return;
    }

    // Retrieve the first event in the queue.
    var self = this,
        item = this._queue.shift(),
        event = item.event,
        callback = item.callback;

    // Send to tracking URL with device id, user id, traits, & event.
    this._send({
        user: this.user.serialize(),
        device: this.device.serialize(),
        event: event,
    }, callback);

    // Process next event on next tick.
    nextTick(function () {
        self._dequeue();
    });
};

/**
 * Makes a request to a given path.
 */
Landmark.prototype._send = function (params, callback) {
    var url = this._trackurl(params),
        attr = this._options.mode === "test" ? "title" : "src",
        el = document.createElement("img");

    // If track url can't be generated then return an error to the callback.
    if (url === null) {
        if (type(callback) === "function") {
            callback(false, null);
        }
        return;
    }

    // Add image to body to trigger call.
    el.width = el.height = 1;
    el[attr] = url;
    document.body.appendChild(el);

    // Remove element after the next tick.
    nextTick(function () {
        try {
            document.body.removeChild(el);
        } catch (e) {
        }
        if (type(callback) === "function") {
            callback(true, el[attr]);
        }
    });
};

/**
 * Generates a tracking URL from a set of parameters.
 */
Landmark.prototype._trackurl = function (params) {
    // If there are no traits or event data then don't generate a url.
    if ((!params.user || isEmpty(params.user.traits)) && isEmpty(params.event)) {
        return null;
    }

    var q = {},
        url = "";

    // Convert each parameter to JSON.
    if (this.apiKey) {
        q.api_key = this.apiKey;
    }
    each(params, function (k, v) {
        if (!isEmpty(v)) {
            q[k] = JSON.stringify(v);
        }
    });

    // Generate full URL with query parameters.
    if (this.host) {
        url += ('https:' === document.location.protocol ? 'https://' : 'http://') + this.host + ":" + this.port;
    }
    url += "/track";
    url += "?" + querystring.stringify(q);

    return url;
};

/**
 * Parses a tracking URL. Used for testing.
 */
Landmark.prototype._parsetrackurl = function (url) {
    var q = querystring.parse(url.substr(url.indexOf("?") + 1));
    each(q, function (k, v) {
        if (k !== "api_key") {
            q[k] = JSON.parse(v);
        }
    });
    return q;
};

module.exports = Landmark;

Landmark.VERSION = Landmark.prototype.VERSION = '0.0.1';

