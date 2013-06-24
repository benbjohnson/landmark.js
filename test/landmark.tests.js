var API_KEY = "0000";
var requests;

//------------------------------------------------------------------------------
//
// Setup / Teardown
//
//------------------------------------------------------------------------------

module("landmark.js", {
  setup: function() {
    requests = [];
    landmark.__uninitialize__();
    landmark.initialize(API_KEY);
    landmark.post = function(url, data) {
      requests.push({url:url, data:data});
    }
  },
  teardown: function() {
    landmark.initialize(null);
  }
})


//------------------------------------------------------------------------------
//
// Tests
//
//------------------------------------------------------------------------------

test("Identify() should issue a request", function() {
  landmark.identify("foo", {"name":"Susy Q"});
  landmark.__initialize__();
  equal(requests.length, 1);
  equal(requests[0].url, "/track");
  deepEqual(requests[0].data, {
    "apiKey": "0000", 
    "id": "foo", 
    "name": "Susy Q"
  });
});

test("Identify() and Track() before initialization should issue one request", function() {
  landmark.identify("foo", {"name":"Susy Q"});
  landmark.track("/checkout.html", {"total":200});
  landmark.__initialize__();
  equal(requests.length, 1);
  deepEqual(requests[0].data, {
    "action": "/checkout.html",
    "apiKey": "0000",
    "id": "foo",
    "name": "Susy Q",
    "total": 200
  });
});

test("Identify() before init and Track() after init should issue two requests", function() {
  landmark.identify("foo", {"name":"Susy Q"});
  landmark.__initialize__();
  landmark.track("/checkout.html", {"total":200});
  equal(requests.length, 2);
  deepEqual(requests[0].data, {
    "apiKey": "0000",
    "id": "foo",
    "name": "Susy Q"
  });
  deepEqual(requests[1].data, {
    "action": "/checkout.html",
    "apiKey": "0000",
    "id": "foo",
    "total": 200
  });
});
