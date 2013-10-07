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
               return undefined;
            }

            var args = slice.call(arguments, 1),
            type = topic,
            i,
            len,
            msgList,
            msg,
            returnValue,
            returnValues = [];

            if (handlers[type] instanceof Array) {
               msgList = handlers[type];
               len = msgList.length;
               for (i = 0; i < len; i++) {
                  msg = msgList[i];
                  returnValue = msg.callback.apply(msg.context, args);
                  if (returnValue !== undefined) {
                     returnValues.push(returnValue);
                  }
               }
            }
            
            if (returnValues.length === 0) {
               return undefined;
            }
            else if (returnValues.length === 1) {
               return returnValues[0];
            }
            else {
               return returnValues;
            }
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
   if (typeof define === "function" && define.amd) {
      define("Core.Communication", ["Core"], function (core) {
         core.Communication = coreCommunication();
         return core.Communication;
      });
   }
   else {
      Core.Communication = coreCommunication();
   }
})();