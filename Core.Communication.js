/*globals Core, require*/
//inter-module communication methods
(function () {

   var coreCommunication = function () {

      //object containing all the handler functions
      var slice = [].slice, handlers = {};

      return {

         addListener: function (topic, callback, context) {
            var type = topic;
            if (!handlers[type]) {
               handlers[type] = [];
            }
            handlers[type].push({ context: context, callback: callback });
         },

         notify: function (topic) {

            if (!handlers[topic]) {
               return true;
            }

            var args = slice.call(arguments, 1),
            type = topic,
            ret = true,
            i,
            len,
            msgList;

            if (handlers[type] instanceof Array) {
               msgList = handlers[type];
               for (i = 0, len = msgList.length; i < len && ret === true; i++) {
                  ret = msgList[i].callback.apply(msgList[i].context, args);
                  if (ret === undefined) {
                     ret = true;
                  }
               }
            }
            return ret;
         },

         removeListener: function (topic, callbackFunction) {
            var type = topic, callback = callbackFunction, handlersArray = handlers[type], i, len;
            if (handlersArray instanceof Array) {
               for (i = 0, len = handlersArray.length; i < len; i++) {
                  if (handlersArray[i].callback === callback) {
                     break;
                  }
               }
               handlers[type].splice(i, 1);
            }
         },

         removeAllListeners: function () {
            handlers = {};
         },

         removeAllListenersForContext: function (messageContext) {
            //TODO: this method is unfinished
            var context = messageContext, handlersArray, i, j;

            for (j = handlers.length; j >= 0; j++) {
               handlersArray = handlers[j];
               if (handlersArray instanceof Array) {
                  for (i = handlersArray.length; i >= 0; i--) {
                     if (handlersArray[i].context === messageContext) {
                        handlersArray.splice(i, 1);
                     }
                  }

                  if (handlers[j].length === 0) {
                     handlers.splice(j, 1);
                  }
               }
            }
         }
      };
   };
   
   // Expose Core as an AMD module
   if (typeof define === "function" && define.amd && define.amd.jQuery) {
      define("CoreCommunication", ["Core"], function (core) {
         core.Communication = coreCommunication();
         return core.Communication;
      });
   }
   else {
      Core.Communication = coreCommunication();
   }
})();