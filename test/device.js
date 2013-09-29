describe('Device', function(){

  var Device = require('landmark/lib/device')
    , assert = require('assert')
    , equals = require('equals');

  var device = null;

  beforeEach(function() {
    device = new Device();
  });

  describe('#id()', function(){
    it('should be 32 characters', function(){
      assert(device.id().length == 32);
    });
  });

  describe('#serialize()', function(){
    it('should serialize id only', function(){
      assert(equals(device.serialize(), {id:device.id()}));
    });
  });
});
