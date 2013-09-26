describe('Landmark', function(){

  var landmark = window.landmark || require('landmark.js/lib/index')
    , assert = require('assert');

  describe('#initialize()', function(){
    it('should be initialized', function(){
      landmark.initialize();
      assert(landmark._initialized);
    })
  })
})
