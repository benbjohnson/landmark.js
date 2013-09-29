describe('Landmark', function(){

  var Landmark = require('landmark/lib/landmark')
    , nextTick = require('next-tick')
    , assert = require('assert')
    , equals = require('equals');

  var landmark = null;
  beforeEach(function() {
    landmark = new Landmark();
    landmark.options({mode:"test", device:{mode:"test"}});
    landmark.host = null;
    landmark.resource("/index.html");
  });

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

  describe('#track', function () {
    it('should not track without traits or event', function(done){
      landmark.identify("foo", function(success, url) {
        assert(!success);
        done();
      });
    });

    it('should track traits-only', function(done){
      landmark.identify("foo", {name:"john"}, function(success, url) {
        assert(url == landmark._trackurl({user:{id:"foo", traits:{name:"john"}}, device:{id:"x"}}), url);
        done();
      });
    });

    it('should track action-only', function(done){
      landmark.track("Page View", function(success, url) {
        assert(equals(landmark._parsetrackurl(url), {
          event:{
            channel: "Web",
            resource: "/index.html",
            action: "Page View",
          },
          device:{id:"x"}
        }));
        done();
      });
    });

    it('should track action and properties', function(done){
      landmark.track("Page View", {total_price:100}, function(success, url) {
        assert(equals(landmark._parsetrackurl(url), {
          event:{
            channel: "Web",
            resource: "/index.html",
            action: "Page View",
            total_price: 100,
          },
          device:{id:"x"}
        }));
        done();
      });
    });

    it('should track identity then event', function(done){
      landmark.identify("foo", {name:"John"});
      landmark.track("Click", function(success, url) {
        assert(equals(landmark._parsetrackurl(url), {
          user:{
            id: "foo",
            traits: {name:"John"}
          },
          event:{
            channel: "Web",
            resource: "/index.html",
            action: "Click",
          },
          device:{id:"x"}
        }));
        done();
      });
    });

    it('should track event then identity', function(done){
      landmark.track("Click", function(success, url) {
        assert(equals(landmark._parsetrackurl(url), {
          user:{
            id: "foo",
            traits: {name:"John"}
          },
          event:{
            channel: "Web",
            resource: "/index.html",
            action: "Click",
          },
          device:{id:"x"}
        }));
        done();
      });
      landmark.identify("foo", {name:"John"});
    });
  });
});
