describe('User', function(){

  var User = require('landmark/lib/user')
    , assert = require('assert');

  var user = null;

  beforeEach(function() {
    user = new User();
  });

  describe('#id()', function(){
    it('should set and retrieve', function(){
      user.id(12);
      assert(user.id() == 12);
    });
  });

  describe('#identify()', function(){
    it('should set id and traits', function(){
      user.identify("100", {name:"John"});
      assert(user.id() == "100");
      assert(user.traits().name == "John");
    });

    it('should merge traits for same user', function(){
      user.identify("100", {firstName:"John", lastName:"Smith"});
      user.identify("100", {firstName:"Jane", age:31});
      assert(user.id() == "100");
      assert(user.traits().firstName == "Jane");
      assert(user.traits().lastName == "Smith");
      assert(user.traits().age == 31);
    });

    it('should not merge traits for different users', function(){
      user.identify("100", {firstName:"John", lastName:"Smith"});
      user.identify("200", {firstName:"Jane", age:31});
      assert(user.id() == "200");
      assert(user.traits().firstName == "Jane");
      assert(user.traits().lastName === undefined);
      assert(user.traits().age == 31);
    });

    it('should merge traits when user becomes known', function(){
      user.identify(null, {firstName:"John", lastName:"Smith"});
      user.identify("100", {firstName:"Jane", age:31});
      assert(user.id() == "100");
      assert(user.traits().firstName == "Jane");
      assert(user.traits().lastName == "Smith");
      assert(user.traits().age == 31);
    });
  });

  describe('#logout()', function(){
    it('should clear id and traits', function(){
      user.identify("100", {name:"John"});
      user.logout();
      assert(user.id() === null);
      assert(user.traits().name === undefined);
    });
  });
});
