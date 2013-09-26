describe('landmark.js', function () {

var landmark = window.landmark || require('landmark')
  , assert = require('assert')
  , bind = require('event').bind
  , cookie = require('landmark/lib/cookie')
  , equal = require('equals')
  , is = require('is')
  , jQuery = require('jquery')
  , store = require('landmark/lib/store')
  , tick = require('next-tick')
  , trigger = require('trigger-event')
  , user = require('landmark/lib/user');

  // lower timeout for tests
  var timeout = landmark._timeout = 3;

  // Make sure initialize runs, so that any test can be looked at individually.
  landmark.initialize();

  describe('initialize', function () {
    it('sets initialized state', function (done) {
      landmark.initialize();
      expect(landmark._initialized).to.be(true);
    });
  });
});
