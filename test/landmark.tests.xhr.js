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
  var xhr = landmark.createXMLHttpRequest.call(landmark, "GET", "/echo", true,
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
