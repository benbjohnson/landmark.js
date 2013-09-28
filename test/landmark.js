describe('Landmark', function(){

  var landmark = window.landmark || require('landmark/lib/index')
    , assert = require('assert');

  describe('#initialize()', function(){
    it('should be initialized', function(){
      landmark.initialize();
      assert(landmark.initialized == true);
    });

    it('should set cookie options', function(){
      landmark.initialize({cookie: {maxage: 100}});
      assert(landmark.cookie.options().maxage == 100);
    });

    it('should set user options', function(){
      landmark.initialize({user: {foo: "bar"}});
      assert(landmark.user.options().foo == "bar");
    });
  });

  describe('#identify', function () {
    beforeEach(function() {
      landmark.cookie.set("ldmk_user_id", null);
    });

    it('should set the user id only', function(){
      landmark.identify("foo");
      assert(landmark.user.id() == "foo");
    });

    it('should set the user id and traits', function(){
      landmark.identify("foo", {"name":"bob"});
      assert(landmark.user.id() == "foo");
      assert(landmark.user.traits().name == "bob");
    });

    it('should set the traits only', function(){
      landmark.identify({"name":"susy"});
      assert(landmark.user.id() == null);
      assert(landmark.user.traits().name == "susy");
    });
  });
});
