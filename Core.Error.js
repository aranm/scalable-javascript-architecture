/*globals Core*/
(function () {
   var coreError = function (ajax, window) {
      //   window.onerror = function (msg, url, num) {
      //      if (window.debug !== undefined && window.debug === false) {
      //         Core.Error.log(1, msg + ';' + url + ';' + num);
      //         return true;
      //      }
      //   };
      var isFunction = function (object) {
         return typeof (object) == 'function';
      };

      return {
         log: function (severity, message) {
            var i, arraylength;

            if (Core.Ajax !== undefined) {
               try {
                  var trace = printStackTrace();
                  //get any urls ready for the http request
                  for (i = 0, arraylength = trace.length; i < arraylength; i++) {
                     trace[i] = encodeURI(trace[i]);
                  }

                  ajax.request({
                     name: "errorLog",
                     data: { severity: severity, message: message, stackTrace: trace }
                  });
               }
               catch (ex) {
                  //TODO: can't communicate with server
               }
            }
         },
         consoleLog: function (message) {
            if (window.console !== undefined) {
               if (window.console.log !== undefined && isFunction(window.console.log) === true) {
                  window.console.log(message);
               }
            }
         },
         sanitise: function sanitise(instance) {
            var method, name;
            if (window.debug === false) {
               for (name in instance) {
                  method = instance[name];
                  if (typeof method === "function") {
                     instance[name] = (function (name, method) {
                        return function () {
                           //try {
                           return method.apply(this, arguments);
                           //}
                           //catch (ex) {
                           //Core.Error.log(1, name + "(): " + ex.message);
                           //}
                        };
                     })(name, method);
                  }
               }
            }
            return instance;
         }
      };
   };

   if (typeof define === "function" && define.amd) {
      define("Core.Error", ["Core", "Core.Ajax"], function (core, ajax) {
         core.Error = coreError(ajax, window);
         return core.Error;
      });
   }
   else {
      Core.Error = coreError(Core.Ajax, window);
   }
})();