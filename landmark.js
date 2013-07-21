(function() {
  var config = {};

  var landmark = {
    //--------------------------------------------------------------------------
    //
    // Properties
    //
    //--------------------------------------------------------------------------

    // The host/port where landmark is hosted.
    host : "landmark.io",
    port : null,

    // The user identifier & data.
    userId : null,
    traits : null,

    // A list of pending tracking events to be sent after the library is
    // initialized.
    pending : [],

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
      // Prepend a page view if one has not been made.
      var pageViewCount = this.pending.filter(function(e) { return e && e.__action__ == "page_view"}).length;
      if(pageViewCount == 0) {
        this.trackPageView();
        this.pending.unshift(this.pending.pop());
      }

      this.initialized = true;

      // Send all pending sends.
      for(var i=0; i<this.pending.length; i++) {
        this.send(this.pending[i]);
      }

      this.pending = [];
    },

    /**
     * @private
     * Internal function used for testing.
     */
    __uninitialize__ : function() {
      this.initialized = false;
      this.userId = null;
      this.traits = null;
      this.pending = [];
    },


    //----------------------------------
    // Configuration
    //----------------------------------

    /**
     * Updates the configuration settings.
     *
     * @param {Object} config  The configuration hash.
     */
    config : function(obj) {
      if(arguments.length == 0) return config;
      if(obj == null) {
        config = {};
      } else {
        config = extend(config, obj)
      }
      return this;
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

      if(this.initialized && !isEmpty(this.traits)) {
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
     * @param {Object} options
     */
    track : function(action, properties, options) {
      if(typeof(properties) != "object") properties = {};
      if(typeof(options) != "object") options = {};

      // Create path with optional hash.
      var path = this.pathname();
      if(options.includeHash) {
        path += window.location.hash
      }

      // Construct the base parameters to track.
      var base = {
        __channel__: "web",
        __action__: action,
        __uri__: this.normalize(path),
        __path__: path,
      };

      // Send event to server.
      var event = extend(base, properties);
      return this.send(event);
    },

    /**
     * Tracks the a page view on the current url.
     *
     * @param {Object} properties  The action properties.
     * @param {Object} options
     */
    trackPageView : function(properties, options) {
      return this.track('__page_view__', properties, options);
    },

    /**
     * Sends an event with the current identity, data and action.
     *
     * @param {Object} properties  The event properties to send.
     */
    send : function(properties) {
      // If the library hasn't initialized then put it into a pending queue.
      if(!this.initialized) {
        this.pending.push(properties);
        return;
      }

      // Notify the JavaScript console if the user don't have an API key set.
      if(!this.apiKey) {
        this.log("[landmark] API Key required. Please call landmark.initialize() first.");
        return;
      }

      // Don't track if there's no id and cookies are not enabled.
      var userIdAvailable = (this.userId && (typeof(this.userId) == "number" || typeof(this.userId) == "string"));
      if(!userIdAvailable && !getCookiesEnabled()) {
        this.log("[landmark] Cookies not enabled.");
        return;
      }

      // Retrieve the tracking identifier for this browser.
      var t = getCookie(cookieId())
      if(!t) {
        setCookie(cookieId(), (t = this.uuid()));
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
      path += "&t=" + encodeURIComponent(t);
      if(userIdAvailable) {
        path += "&id=" + encodeURIComponent(this.userId);
      }
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
     * Generates an RFC4122 version 4 UUID.
     *
     * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
     */
    uuid : function() {
      return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });
    },

    /**
     * Retrieves the path name of the current page.
     */
    pathname : function() {
      return window.location.pathname;
    },
    
    /**
     * Generalizes a path by replacing numeric directories with a zero. This
     * function also replaces directories starting with a number and a dash.
     */
    normalize : function(str) {
      if(typeof(str) != "string") return str;
      str = str.replace(/\/(\d+|\d+-[^\/#]+)(?=\/|#|$)/g, "/:id");
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
   * Checks to see if cookies are enabled.
   * 
   * @return {Boolean}  True if cookies are enabled. Otherwise, false.
   */
  function getCookiesEnabled() {
    if(typeof navigator.cookieEnabled == "undefined") {
      document.cookie="testcookie";
      if(document.cookie.indexOf("testcookie") != -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return navigator.cookieEnabled;
    }
  }

  /**
   * Retrieves the name of the id cookie.
   */
  function cookieId() {
    return "__ldmkid";
  }

  //----------------------------------
  // Process invocation
  //----------------------------------

  /**
   * Processes method calls and arguments stored in an array.
   *
   * @param {Array} arr  A list of methods and arguments.
   */
  function processInvocations(arr) {
    if(Object.prototype.toString.call(arr) != "[object Array]") return;

    // Separate out method invocations with their arguments.
    var invocations = [];
    var unprocessed = [];
    for(var i=0; i<arr.length; i++) {
      if(typeof(arr[i]) == "string" && typeof(landmark[arr[i]]) == "function") {
        invocations.push({name:arr[i], arguments:[]})
      } else if(invocations.length > 0) {
        invocations[invocations.length-1].arguments.push(arr[i]);
      } else {
        unprocessed.push(arr[i]);
      }
    }

    // Notify log if there are any arguments that aren't processed.
    if(unprocessed.length > 0) {
      landmark.log("[landmark] Unprocessed arguments: " + unprocessed.join(","))
    }

    // Loop over method invocations and actually invoke them.
    for(var i=0; i<invocations.length; i++) {
      landmark[invocations[i].name].apply(landmark, invocations[i].arguments);
    }
  }
  
  landmark.__test__ = {
    setCookie: setCookie,
    getCookie: getCookie,
    getCookiesEnabled: getCookiesEnabled,
    processInvocations: processInvocations,
  };


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

  // Wrap existing onhashchange.
  var onhashchange = window.onhashchange;
  window.onhashchange = function() {
    if(config.trackHashChange) {
      landmark.trackPageView({}, {includeHash:true});
    }
    if(typeof(onhashchange) == "function") onhashchange();
  }

  // Save invocations made before the library was loaded.
  invocations = window.landmark;
  window.landmark = landmark;

  // Retrieve data fields set on the script tag itself.
  var script = document.getElementsByTagName("script");
  script = script[script.length - 1];
  if(script.hasAttribute('data-api-key')) {
    landmark.initialize(script.getAttribute('data-api-key'))
  }
  if(script.hasAttribute('data-user-id')) {
    landmark.identify(script.getAttribute('data-user-id'))
  }

  // Process early invocations.
  processInvocations(invocations);
})();