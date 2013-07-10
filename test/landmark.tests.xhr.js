//------------------------------------------------------------------------------
//
// Setup / Teardown
//
//------------------------------------------------------------------------------

module("XHR")

//------------------------------------------------------------------------------
//
// Tests
//
//------------------------------------------------------------------------------

//--------------------------------------
// XHR
//--------------------------------------

asyncTest("XHR should work on CORS-supported browsers", 1, function() {
  landmark.host = window.location.hostname;
  landmark.port = window.location.port;
  var xhr = landmark.createXMLHttpRequest.call(landmark, "GET", "/echo",
    function() {
      ok(true, "CORS Supported")
      start();
    },
    function() {
      ok(false, "CORS Not Supported");
      start();
    }
  );
  xhr.send();
});
