
var Landmark = require('./landmark')
  , bind = require('bind');

module.exports = new Landmark();

bind(module.exports, module.exports.init);
bind(module.exports, module.exports.initialize);
