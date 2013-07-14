(function() {
  var landmark = {
    //--------------------------------------------------------------------------
    //
    // Properties
    //
    //--------------------------------------------------------------------------

    host : "landmark.io",
    port : null,

    // The user identifier & data.
    userId : null,
    traits : null,

    // A flag stating if user level data has been sent to the server yet.
    // User level data will be sent with the first event or will be sent
    // by itself if no event is available after initialization.
    initialized : false,


    //--------------------------------------------------------------------------
    //
    // Methods
    //
    //--------------------------------------------------------------------------

    //----------------------------------
    // Initialization
    //----------------------------------

    /**
     * Initializes the Landmark API with the API key.
     *
     * @param {String} apiKey  The API key.
     */
    initialize : function(apiKey) {
      this.apiKey = apiKey;
      return true;
    },

    /**
     * @private
     * Internal initialization for the API once the web page is loaded.
     */
    __initialize__ : function() {
      this.initialized = true;

      // Send off identification if a track() hasn't already sent it.
      this.send();
    },

    /**
     * @private
     * Internal function used for testing.
     */
    __uninitialize__ : function() {
      this.initialized = false;
    },


    //----------------------------------
    // Array-style interface
    //----------------------------------

    /**
     * Executes a method on the landmark object using the push() method.
     *
     * @param {String} methodName  The name of the method to execute.
     * @param {Array} arguments  A list of arguments to pass to the method.
     */
    push : function(methodName) {
      var args = Array.prototype.slice.call(arguments, 1);
      return landmark[methodName].apply(landmark, args);
    },


    //----------------------------------
    // Identification
    //----------------------------------

    /**
     * Identifies the current user.
     *
     * @param {String} userId  The user identifier.
     * @param {Object} traits  User-level data.
     */
    identify : function(userId, traits) {
      this.userId = userId;
      this.traits = traits;

      if(this.initialized && this.traits) {
        this.send();
      }
    },


    //----------------------------------
    // Tracking
    //----------------------------------

    /**
     * Tracks a single action and related data.
     *
     * @param {String} action      The name of the action to track.
     * @param {Object} properties  The action properties.
     */
    track : function(action, properties) {
      if(typeof(properties) != "object") properties = {};
      var event = extend({}, properties, {action:action});
      return this.send(event)
    },

    /**
     * Sends an event with the current identity, data and action.
     *
     * @param {Object} properties  The event properties to send.
     */
    send : function(properties) {
      // Notify the JavaScript console if the user don't have an API key set.
      if(!this.apiKey) {
        this.log("[landmark] API Key required. Please call landmark.initialize() first.");
        return;
      }
      // Temporary: Notify the console if the user is not identified.
      if(!this.userId) {
        this.log("[landmark] User is not identified.");
        return;
      }

      // Throw away the traits after we save them once.
      var traits = this.traits;
      this.traits = null;
      if(isEmpty(traits) && isEmpty(properties)) {
        return;
      }
      
      // Send event data to "GET /track".
      var path = "/track";
      path += "?apiKey=" + encodeURIComponent(this.apiKey);
      path += "&id=" + encodeURIComponent(this.userId);
      if(!isEmpty(traits)) {
        path += "&traits=" + encodeURIComponent(JSON.stringify(traits));
      }
      if(!isEmpty(properties)) {
        path += "&properties=" + encodeURIComponent(JSON.stringify(properties));
      }

      var self = this;
      var xhr = this.createXMLHttpRequest("GET", path,
        function() {},
        function() {
          var response = {};
          try { response = JSON.parse(xhr.responseText); } catch(e){}
          self.log("[landmark] GET " + path, response, traits, properties);
        }
      );
      if(xhr == null) return null;
      
      // Send request.
      xhr.send();
      return xhr;
    },

    

    //----------------------------------
    // Utility
    //----------------------------------

    /**
     * Logs to the console if one is available.
     */
    log : function() {
      if(window.console) {
        if(console.log.apply) {
          console.log.apply(console, arguments);
        } else {
          console.log(arguments);
        }
      }
    },

    /**
     * Generalizes a path by replacing numeric directories with a zero. This
     * function also replaces directories starting with a number and a dash.
     */
    path : function(str) {
      if(typeof(str) != "string") return str;
      str = str.replace(/\/(\d+|\d+-[^\/]+)(?=\/|$)/g, "/*");
      return str;
    },

    /**
     * Creates a new XHR object, if possible.
     * 
     * @param {String} path   The path to send to.
     * @param {Object} data  The object to convert to JSON and send.
     *
     * @return {XMLHTTPRequest}  The XHR that was created.
     */
    createXMLHttpRequest : function(method, path, loadHandler, errorHandler) {
      var url = location.protocol + "//" + this.host + (this.port > 0 ? ":" + this.port : "") + path;
      var xhr = new XMLHttpRequest();
      if("withCredentials" in xhr) {
        xhr.open(method, url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.setRequestHeader("Cache-Control", "no-cache");
      } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
      } else {
        this.log("[landmark] CORS not supported in this browser.");
        return null;
      }
      
      xhr.onload = loadHandler;
      xhr.onerror = errorHandler;

      return xhr;
    },
  };

  //--------------------------------------------------------------------------
  //
  // Private Methods
  //
  //--------------------------------------------------------------------------
  
  /**
   * Checks if an object has any keys/values.
   * Original: https://github.com/documentcloud/underscore/blob/master/underscore.js
   */
  function isEmpty(obj) {
    if(obj == null) return true;
    for(var key in obj) {
      if(obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  };

  /**
   * Merges the properties of multiple objects together.
   * Original: https://github.com/documentcloud/underscore/blob/master/underscore.js
   *
   * @param {Object} obj  The object to extend.
   */
  function extend(obj) {
    if(typeof(obj) != "object") return;

    var args = Array.prototype.slice.call(arguments, 1);
    for(var i=0; i<args.length; i++) {
      var source = args[i];
      if (typeof(source) == "object" && source != null && source != undefined) {
        for (var property in source) {
          obj[property] = source[property];
        }
      }
    }
    return obj;
  }

  /**
   * Sets a root domain, first-party cookie. Setting a null value will delete
   * cookie.
   *
   * @param {String} name   The name of the key to set.
   * @param {String} vlaue  The value of the key to set.
   */
  function setCookie(name,value) {
    var regex = /.+\.((?:[^.]+)\.(?:com|net|org|edu|co.uk|io))$/;

    var domain = "";
    if(location.hostname.search(regex) != -1) {
      "; domain=." + location.hostname.replace(regex, "$1");
    }

    var expires = "; expires=" + (value != null ? (new Date(2000000000000)).toGMTString() : "-1");

    if(value == null) value = "";
    document.cookie = name + "=" + value + expires + domain + "; path=/";
  }

  /**
   * Retrieves a cookie.
   *
   * @param {String} name   The name of the cookie to retrieve.
   */
  function getCookie(name) {
    var arr = document.cookie.split(';');
    for(var i=0; i<arr.length;i++) {
      var c = arr[i];
      while(c.charAt(0)==' ') {
        c = c.substring(1,c.length);
      }
      if(c.indexOf(name + "=") == 0) {
        return c.substring(name.length+1,c.length);
      }
    }
    return null;
  }

  /**
   * Generates an RFC4122 version 4 UUID.
   *
   * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
   */
  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  }

  landmark.__test__ = {setCookie: setCookie, getCookie: getCookie, uuid:uuid};


  //--------------------------------------------------------------------------
  //
  // Events
  //
  //--------------------------------------------------------------------------

  // Wrap existing onload.
  var onload = window.onload;
  window.onload = function() {
    landmark.__initialize__();
    if(typeof(onload) == "function") onload();
  }

  window.landmark = landmark;
})();