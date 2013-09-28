describe('Cookie', function(){

  var Cookie = require('landmark/lib/cookie')
    , assert = require('assert');

  var cookie = null;

  beforeEach(function() {
    cookie = new Cookie();
  });

  describe('#set()', function(){
    it('should set null', function(){
      cookie.set("x", null);
      assert(cookie.get("x") === null);
    });

    it('should set a number', function(){
      cookie.set("x", 12);
      assert(cookie.get("x") == 12);
    });

    it('should set a string', function(){
      cookie.set("x", "foo");
      assert(cookie.get("x") == "foo");
    });

    it('should set an object', function(){
      cookie.set("x", {"foo":"bar"});
      assert(cookie.get("x").foo == "bar");
    });

    it('should set an array', function(){
      cookie.set("x", [100,200]);
      assert(cookie.get("x")[0] == 100);
      assert(cookie.get("x")[1] == 200);
    });
  });

  describe('#remove()', function(){
    it('should remove key', function(){
      cookie.set("x", 100);
      cookie.remove("x");
      assert(cookie.get("x") === null);
    });
  });
});
