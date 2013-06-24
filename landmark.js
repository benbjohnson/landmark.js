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

    // The pending event to be sent once the library is initialized.
    pendingEvent : null,

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

      // Call existing onload handler.
      if(typeof(onload) == "function") onload();

      // Delay first action until after initialization.
      if(this.traits || this.pendingEvent) {
        this.send(this.pendingEvent);
      }
    },

    /**
     * @private
     * Internal function used for testing.
     */
    __uninitialize__ : function() {
      this.initialized = false;
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
      event = this.extend({}, properties, {action:action});
      
      // If the library has been initialized then send it.
      if(this.initialized) {
        return this.send(event)
      }
      // Otherwise wait for initialization and it'll be sent later.
      else {
        this.pendingEvent = event;
      }
    },

    /**
     * Sends an event with the current identity, data and action.
     *
     * @param {Object} data  The event data to send.
     */
    send : function(data) {
      if(!this.apiKey) {
        self.log("[landmark] API Key required. Please call landmark.initialize() first.");
        return;
      }
      if(!this.userId) {
        this.log("[landmark] User identifier required. Please call landmark.identify() first.");
        return;
      }
      
      var event = this.extend({}, this.traits, data, {apiKey: this.apiKey, id: this.userId});
      this.traits = {};

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
     * Creates a new XHR object, if possible.
     * 
     * @param {String} path   The path to send to.
     * @param {Object} data  The object to convert to JSON and send.
     *
     * @return {XMLHTTPRequest}  The XHR that was created.
     */
    createXMLHttpRequest : function(method, path, loadHandler, errorHandler) {
      var url = location.protocol + "//" + landmark.host + ":" + landmark.port + path;
      var xhr = new XMLHttpRequest();
      if("withCredentials" in xhr) {
        xhr.open("POST", url, true);
      } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open("POST", url);
      } else {
        self.log("[landmark] CORS not supported in this browser.");
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
        function() {
          var response = {};
          try { response = JSON.parse(xhr.responseText); } catch(e){}
        },
        function() {
          var response = {};
          try { response = JSON.parse(xhr.responseText); } catch(e){}
          self.log("[landmark] POST " + url + " " + response.message, data);
        }
      );
      if(xhr == null) return null;
      
      // Send request.
      xhr.send(JSON.stringify(data));
      return xhr;
    },

    /**
     * Merges the properties of multiple objects together.
     * Original: https://github.com/documentcloud/underscore/blob/master/underscore.js
     *
     * @param {Object} obj  The object to extend.
     */
    extend : function(obj) {
      if(typeof(obj) != "object") return;

      var args = Array.prototype.slice.call(arguments, 1);
      for(var i=0; i<args.length; i++) {
        source = args[i];
        if (typeof(source) == "object" && source != null && source != undefined) {
          for (var property in source) {
            obj[property] = source[property];
          }
        }
      }
      return obj;
    },

    /**
     * Performs a shallow clone of an object.
     */
    clone : function(obj) {
      if(!obj) return;
      return this.extend({}, obj);
    },
  };

  // Wrap existing onload.
  var onload = window.onload;
  window.onload = function() {
    landmark.__initialize__();
  }

  window.landmark = landmark;
})();