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
  landmark.host = "localhost";
  landmark.port = 8000;
  var xhr = landmark.createXMLHttpRequest.call(landmark, "POST", "/echo",
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
