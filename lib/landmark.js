
var after = require('after')
  , bind = require('event').bind
  , callback = require('callback')
  , clone = require('clone')
  , cookie = require('./cookie')
  , each = require('each')
  , is = require('is')
  , isEmail = require('is-email')
  , isMeta = require('is-meta')
  , map = require('map')
  , newDate = require('new-date')
  , size = require('object').length
  , prevent = require('prevent')
  , querystring = require('querystring')
  , user = require('./user');

module.exports = exports = Landmark;
exports.VERSION = '0.1.0';

/**
 * Initialize a new `Landmark` instance.
 */
function Landmark () {
  this._initialized = false;
  // this._user = user;
}


/**
 * Initialize the Landmark client.
 */
Landmark.prototype.init =
Landmark.prototype.initialize = function(apiKey, options) {
  var self = this;
  this._options(options);

  this._user.load();
  this._parseQuery();
  this._initialized = true;

  return this;
};


/**
 * Identify a user by optional `id` and `traits`.
 *
 * @param {String} id (optional)
 * @param {Object} traits (optional)
 * @return {Landmark}
 */

Landmark.prototype.identify = function (id, traits) {
  if (is.object(id)) traits = id, id = user.id();
  this._user.update(id, traits);

  // TODO: this._invoke('identify', id, traits);

  return this;
};


/**
 * Return the current user.
 *
 * @return {Object}
 */

Landmark.prototype.user = function () {
  return this._user;
};


/**
 * Track an `event` that a user has triggered with optional `properties`.
 *
 * @param {String} event
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 * @param {Function} fn (optional)
 * @return {Landmark}
 */

Landmark.prototype.track = function (event, properties) {
  properties = clone(properties) || {};

  // TODO: this._invoke('track', event, properties, options);

  return this;
};


/**
 * Helper method to track an outbound link that would normally navigate away
 * from the page before the analytic call is sent.
 *
 * @param {Element|Array} links
 * @param {String|Function} event
 * @param {Object|Function} properties (optional)
 * @return {Landmark}
 */
Landmark.prototype.trackLink = function(links, event, properties) {
  if (!links) return this;
  if (is.element(links)) links = [links];

  var self = this;
  each(links, function (el) {
    bind(el, 'click', function (e) {
      var ev = is.fn(event) ? event(el) : event;
      var props = is.fn(properties) ? properties(el) : properties;
      self.track(ev, props);

      if (el.href && el.target !== '_blank' && !isMeta(e)) {
        prevent(e);
        self._callback(function () {
          window.location.href = el.href;
        });
      }
    });
  });

  return this;
};


/**
 * Helper method to track an outbound form that would normally navigate away
 * from the page before the analytic call is sent.
 *
 * @param {Element|Array} forms
 * @param {String|Function} event
 * @param {Object|Function} properties (optional)
 * @return {Landmark}
 */

Landmark.prototype.trackForm = function (forms, event, properties) {
  if (!forms) return this;
  if (is.element(forms)) forms = [forms]; // always arrays, handles jquery

  var self = this;
  each(forms, function (el) {
    function handler (e) {
      prevent(e);

      var ev = is.fn(event) ? event(el) : event;
      var props = is.fn(properties) ? properties(el) : properties;
      self.track(ev, props);

      self._callback(function () {
        el.submit();
      });
    }

    var $ = window.jQuery || window.Zepto;
    if ($) {
      $(el).submit(handler);
    } else {
      bind(el, 'submit', handler);
    }
  });

  return this;
};


/**
 * Manually trigger a pageview, useful for single-page apps.
 *
 * @param {String} url (optional)
 * @param {Object} options (optional)
 * @return {Landmark}
 */
Landmark.prototype.pageview = function (url) {
  // TODO: this._invoke('pageview', url);
  return this;
};


/**
 * Apply options.
 *
 * @param {Object} options
 * @return {Landmark}
 * @api private
 */
Landmark.prototype._options = function (options) {
  options || (options = {});
  cookie.options(options.cookie);
  user.options(options.user);
  return this;
};


/**
 * Callback a `fn` after our defined timeout period.
 *
 * @param {Function} fn
 * @return {Landmark}
 * @api private
 */
Landmark.prototype._callback = function (fn) {
  callback.async(fn, this._timeout);
  return this;
};


/**
 * Parse the query string for callable methods.
 *
 * @return {Landmark}
 * @api private
 */
Landmark.prototype._parseQuery = function () {
  // TODO: Identify and track any `utm_` parameters in the URL.
  var q = querystring.parse(window.location.search);
  if (q.ajs_uid) this.identify(q.ajs_uid);
  if (q.ajs_event) this.track(q.ajs_event);
  return this;
};


Landmark.prototype.VERSION = exports.VERSION;


