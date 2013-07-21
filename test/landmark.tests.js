var API_KEY = "0000";
var requests, logs;
var responseText = null, errorText = null;

var createXMLHttpRequest = landmark.createXMLHttpRequest;
var pathname = landmark.pathname;
var uuid = landmark.uuid;
var onload = window.onload;

window.onload = function() {};

//------------------------------------------------------------------------------
//
// Setup / Teardown
//
//------------------------------------------------------------------------------

module("Basic", {
  setup: function() {
    window.location.hash = "";
    landmark.log("TEST");
    landmark.pathname();
    landmark.__test__.setCookie("__ldmkid", null);

    requests = [], logs = [];
    landmark.__uninitialize__();
    landmark.config(null);
    landmark.initialize(API_KEY);
    landmark.createXMLHttpRequest = function(method, path, loadHandler, errorHandler) {
      var xhr = {};
      xhr.send = function() {
        requests.push({method:method, path:path});
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
    };
    landmark.uuid = function() {
      return "xxxx"
    };
    landmark.pathname = pathname;
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
// Initialization
//--------------------------------------

test("Invoke methods called before initialization", function() {
  var invocations = [];
  invocations.push("blah", 123);
  invocations.push("identify", "foo", {"name":"Susy Q"});
  invocations.push("track", "view");
  landmark.__test__.processInvocations(invocations);
  landmark.__initialize__();
  equal(logs.length, 1);
  equal(logs[0], "[landmark] Unprocessed arguments: blah,123");
  equal(requests.length, 1);
  equal(decodeURIComponent(requests[0].path), '/track?apiKey=0000&t=xxxx&id=foo&traits={"name":"Susy Q"}&properties={"__channel__":"web","__action__":"view","__uri__":"/test/index.html","__path__":"/test/index.html"}');
});

//--------------------------------------
// Basic identify/track
//--------------------------------------

test("Identifying with traits should issue a request", function() {
  landmark.identify("foo", {"name":"Susy Q"});
  landmark.__initialize__();
  equal(logs.length, 0);
  equal(requests.length, 1);
  equal(decodeURIComponent(requests[0].path), '/track?apiKey=0000&t=xxxx&id=foo&traits={"name":"Susy Q"}');
});

test("Identifying without traits should not issue a request", function() {
  landmark.identify("foo");
  landmark.__initialize__();
  equal(requests.length, 0);
});

test("Identifying and tracking before initialization should issue one request", function() {
  landmark.trackPageView();
  landmark.identify("foo", {"name":"Susy Q"});
  landmark.track("purchase", {"total":200});
  landmark.__initialize__();
  equal(requests.length, 2);
  equal(decodeURIComponent(requests[0].path), '/track?apiKey=0000&t=xxxx&id=foo&traits={"name":"Susy Q"}&properties={"__channel__":"web","__action__":"page_view","__uri__":"/test/index.html","__path__":"/test/index.html"}');
  equal(decodeURIComponent(requests[1].path), '/track?apiKey=0000&t=xxxx&id=foo&properties={"__channel__":"web","__action__":"purchase","__uri__":"/test/index.html","__path__":"/test/index.html","total":200}');
});

test("Identifying before initialization and tracking after init should issue two requests", function() {
  landmark.identify("foo", {"name":"Susy Q"});
  landmark.__initialize__();
  landmark.track("checkout", {"total":200});
  equal(requests.length, 2);
  equal(decodeURIComponent(requests[0].path), '/track?apiKey=0000&t=xxxx&id=foo&traits={"name":"Susy Q"}');
  equal(decodeURIComponent(requests[1].path), '/track?apiKey=0000&t=xxxx&id=foo&properties={"__channel__":"web","__action__":"checkout","__uri__":"/test/index.html","__path__":"/test/index.html","total":200}');
});

test("Reidentification after init should send a new request.", function() {
  landmark.identify("foo", {"name":"Susy Q"});
  landmark.__initialize__();
  landmark.identify("foo", {"name":"Bob Smith"});
  equal(requests.length, 2);
  equal(decodeURIComponent(requests[0].path), '/track?apiKey=0000&t=xxxx&id=foo&traits={"name":"Susy Q"}');
  equal(decodeURIComponent(requests[1].path), '/track?apiKey=0000&t=xxxx&id=foo&traits={"name":"Bob Smith"}');
});

test("Should track page with normalized path", function() {
  landmark.pathname = function() { return "/users/2391/edit"; };
  landmark.identify("john", {});
  landmark.trackPageView();
  landmark.__initialize__();
  equal(requests.length, 1);
  equal(decodeURIComponent(requests[0].path), '/track?apiKey=0000&t=xxxx&id=john&properties={"__channel__":"web","__action__":"page_view","__uri__":"/users/:id/edit","__path__":"/users/2391/edit"}');
});

//--------------------------------------
// Hash State
//--------------------------------------

asyncTest("Should track hash state", function() {
  landmark.config({trackHashChange:true});
  landmark.__initialize__();
  landmark.identify("jane", {});
  window.location.hash = "#/users/123/edit";
  setTimeout(function() {
    equal(requests.length, 1);
    equal(requests[0] ? decodeURIComponent(requests[0].path) : null, '/track?apiKey=0000&t=xxxx&id=jane&properties={"__channel__":"web","__action__":"page_view","__uri__":"/test/index.html#/users/:id/edit","__path__":"/test/index.html#/users/123/edit"}');
    window.location.hash = "";
    setTimeout(function() { start()}, 50);
  }, 50);
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
  deepEqual(logs[0].slice(0, 2), ["[landmark] GET /track?apiKey=0000&t=xxxx&id=foo&traits=%7B%22name%22%3A%22Susy%20Q%22%7D", {message:"Something went wrong"}]);
});


//--------------------------------------
// Array Style Interface
//--------------------------------------

test("Track() and Identify() should work using a push() style interface", function() {
  landmark.push("identify", "foo", {"name":"Susy Q"});
  landmark.__initialize__();
  landmark.push("track", "checkout", {"total":200});
  equal(requests.length, 2);
});


//--------------------------------------
// Utility
//--------------------------------------

test("Generalize path should replace numeric sections of path", function() {
  equal(landmark.normalize("/accounts/123/users/456"), "/accounts/:id/users/:id");
  equal(landmark.normalize("/accounts/123#/users/456"), "/accounts/:id#/users/:id");
  equal(landmark.normalize("/accounts/123-apple-computer/users/456-steve-jobs"), "/accounts/:id/users/:id");
});
