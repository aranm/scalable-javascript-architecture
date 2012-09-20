/*globals Core, require*/

(function() {
   var coreControls = function() {
      var controls = { },
         slice = [].slice,
         sendMessage = function(controlId, message) {
            var control = controls[controlId];
            if (control === undefined) {
               throw new Error("Attempt to send messages to a control that has not been registered: " + controlId);
            }
            else if (control.instance === null) {
               throw new Error("Attempt to send messages to a control that has not been started: " + controlId);
            }
            else {
               if (Object.prototype.toString.call(message.parameters) === '[object Array]') {
                  control.instance[message.name].apply(null, message.parameters);
               }
               else {
                  control.instance[message.name].call(null, message.parameters);
               }
            }
         },
         sendMessages = function(controlId, messages) {
            messages.forEach(function(message) {
               sendMessage(controlId, message);
            });
         };

      return {
         register: function(controlId, creationFunction) {
            controls[controlId] = {
               creator: creationFunction,
               args: slice.call(arguments, 2),
               instance: null
            };
         },
         activate: function(controlId) {
            if (controls[controlId] === undefined) {
               throw new Error("Attempt to start a control that has not been registered: " + controlId);
            }
            else if (controls[controlId].instance === null) {
               controls[controlId].instance = controls[controlId].creator.call();
               controls[controlId].instance.activate();
            }
         },
         destroy: function(controlId) {
            if (controls[controlId] === undefined) {
               throw new Error("Attempt to destroy a control that has not been registered: " + controlId);
            }
            else if (controls[controlId].instance !== null) {
               controls[controlId].instance.destroy();
               controls[controlId].instance = null;
            }
         },
         sendMessage: sendMessage,
         sendMessages: sendMessages
      };
   };
   
   //manage require module loading scenario
   if (typeof define === "function" && define.amd) {
      define("Core.Controls", ["Core"], function (core) {
         core.Controls = coreControls();
         return core.Controls;
      });
   }
   else {
      Core.Controls = coreControls();
   }
})();