var API_KEY = "0000";
var requests, logs;
var responseText = null, errorText = null;

var createXMLHttpRequest = landmark.createXMLHttpRequest;
var onload = window.onload;
window.onload = function() {};

//------------------------------------------------------------------------------
//
// Setup / Teardown
//
//------------------------------------------------------------------------------

module("Basic", {
  setup: function() {
    landmark.log("TEST");
    requests = [], logs = [];
    landmark.__uninitialize__();
    landmark.initialize(API_KEY);
    landmark.createXMLHttpRequest = function(method, path, loadHandler, errorHandler) {
      var xhr = {};
      xhr.send = function(data) {
        requests.push({method:method, path:path, data:JSON.parse(data)});
        if(responseText) { xhr.responseText = responseText; loadHandler(); }
        if(errorText) { xhr.responseText = errorText; errorHandler(); }
        responseText = errorText = null;
      }
      return xhr;
    };
    landmark.log = function() {
      var entry = [];
      for(var i=0; i<arguments.length; i++) {
        entry.push(arguments[i]);
      }
      logs.push(entry);
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

//--------------------------------------
// Basic identify/track
//--------------------------------------

test("Identify() with traits should issue a request", function() {
  landmark.identify("foo", {"name":"Susy Q"});
  landmark.__initialize__();
  equal(requests.length, 1);
  equal(requests[0].path, "/track");
  deepEqual(requests[0].data, {
    "apiKey": "0000", 
    "id": "foo", 
    "name": "Susy Q"
  });
});

test("Identify() without traits should not issue a request", function() {
  landmark.identify("foo");
  landmark.__initialize__();
  equal(requests.length, 0);
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

test("Reidentification after init should send a new request.", function() {
  landmark.identify("foo", {"name":"Susy Q"});
  landmark.__initialize__();
  landmark.identify("foo", {"name":"Bob Smith"});
  equal(requests.length, 2);
  deepEqual(requests[0].data, {
    "apiKey": "0000",
    "id": "foo",
    "name": "Susy Q"
  });
  deepEqual(requests[1].data, {
    "apiKey": "0000",
    "id": "foo",
    "name": "Bob Smith"
  });
});


//--------------------------------------
// Error Handling
//--------------------------------------

test("Send() without an API key should log an error", function() {
  landmark.initialize(null);
  landmark.identify("foo", {"name":"Susy Q"});
  landmark.__initialize__();
  equal(requests.length, 0);
  equal(logs.length, 1);
  deepEqual(logs[0], ["[landmark] API Key required. Please call landmark.initialize() first."]);
});

test("Server errors should be logged to the console", function() {
  errorText = '{"message":"Something went wrong"}'
  landmark.identify("foo", {"name":"Susy Q"});
  landmark.__initialize__();
  equal(logs.length, 1);
  deepEqual(logs[0].slice(0, 2), ["[landmark] POST /track", {message:"Something went wrong"}]);
});


//--------------------------------------
// Array Style Interface
//--------------------------------------

test("Track() and Identify() should work using a push() style interface", function() {
  landmark.push("identify", "foo", {"name":"Susy Q"});
  landmark.__initialize__();
  landmark.push("track", "/checkout.html", {"total":200});
  equal(requests.length, 2);
});


//--------------------------------------
// Utility
//--------------------------------------

test("Generalize path should replace numeric sections of path", function() {
  equal(landmark.path("/accounts/123/users/456"), "/accounts/0/users/0");
  equal(landmark.path("/accounts/123-apple-computer/users/456-steve-jobs"), "/accounts/0/users/0");
});
