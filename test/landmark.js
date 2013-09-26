describe('Landmark', function(){

  var landmark = window.landmark || require('landmark.js/lib/index')
    , assert = require('assert');

  describe('#initialize()', function(){
    it('should be initialized', function(){
      landmark.initialize();
      assert(landmark.initialized == true);
    });

    it('should set cookie options', function(){
      landmark.initialize({cookie: {maxage: 100 }});
      assert(landmark.cookie.options().maxage == 100);
    });

    it('should load the user')
  });
});
