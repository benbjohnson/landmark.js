
var Cookie = require('./cookie');

module.exports = exports = Landmark;

exports.VERSION = Landmark.prototype.VERSION = '0.0.1';

function Landmark () {
  this.cookie = new Cookie();
  this.initialized = false;
}

Landmark.prototype.init =
Landmark.prototype.initialize = function(options) {
  options || (options = {});

  this.cookie.options(options.cookie);

  this.initialized = true;
};

//Landmark.prototype.options = function(settings, options) {
//};
