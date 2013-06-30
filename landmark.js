(function() {
  var landmark = {
    //--------------------------------------------------------------------------
    //
    // Properties
    //
    //--------------------------------------------------------------------------

    host : "landmark.io",
    port : 80,

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
      event = extend({}, properties, {action:action});
      return this.send(event)
    },

    /**
     * Sends an event with the current identity, data and action.
     *
     * @param {Object} data  The event data to send.
     */
    send : function(data) {
      // Notify the JavaScript console if the user don't have an API key set.
      if(!this.apiKey) {
        this.log("[landmark] API Key required. Please call landmark.initialize() first.");
        return;
      }

      // Create an event object with just the traits and properties and exit
      // if there aren't any to send.
      var event = extend({}, this.traits, data);
      this.traits = null;
      if(isEmpty(event)) {
        return;
      }
      
      // Add in the API key and user id.
      event = extend(event, {apiKey: this.apiKey, id: this.userId});

      // Send event data to "POST /track".
      return this.post("/track", event);
    },

    

    //----------------------------------
    // Utility
    //----------------------------------

    /**
     * Logs to the console if one is available.
     */
    log : function() {
      if(window.console) {
        console.log.apply(console, arguments);
      }
    },

    /**
     * Generalizes a path by replacing numeric directories with a zero.
     */
    path : function(str) {
      if(typeof(str) != "string") return str;
      str = str.replace(/\/(\d+)(?=\/|$)/g, "/0");
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
      var url = location.protocol + "//" + this.host + ":" + this.port + path;
      var xhr = new XMLHttpRequest();
      if("withCredentials" in xhr) {
        xhr.open("POST", url, true);
      } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open("POST", url);
      } else {
        this.log("[landmark] CORS not supported in this browser.");
        return null;
      }
      
      xhr.onload = loadHandler;
      xhr.onerror = errorHandler;

      xhr.setRequestHeader("Content-type", "application/json");
      xhr.setRequestHeader("Cache-Control", "no-cache");
      return xhr;
    },

    /**
     * Sends a JSON object over XHR POST.
     * 
     * @param {String} path   The path to send to.
     * @param {Object} data  The object to convert to JSON and send.
     *
     * @return {XMLHTTPRequest}  The XHR that was created.
     */
    post : function(path, data) {
      var self = this;
      var xhr = this.createXMLHttpRequest("POST", path,
        function() {},
        function() {
          var response = {};
          try { response = JSON.parse(xhr.responseText); } catch(e){}
          self.log("[landmark] POST " + path, response, data);
        }
      );
      if(xhr == null) return null;
      
      // Send request.
      xhr.send(JSON.stringify(data));
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
      if(hasOwnProperty.call(obj, key)) {
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