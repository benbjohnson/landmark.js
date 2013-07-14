//------------------------------------------------------------------------------
//
// Setup / Teardown
//
//------------------------------------------------------------------------------

module("Cookies")

//------------------------------------------------------------------------------
//
// Tests
//
//------------------------------------------------------------------------------

//--------------------------------------
// Internal
//--------------------------------------

test("Should set and retrieve a cookie", function() {
  landmark.__test__.setCookie("foo", "bar");
  equal(landmark.__test__.getCookie("foo"), "bar");
});

test("Should set and clear a cookie", function() {
  landmark.__test__.setCookie("foo", "baz");
  landmark.__test__.setCookie("foo", null);
  equal(landmark.__test__.getCookie("foo"), "");
});
