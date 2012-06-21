/*globals Sandbox*/
var Core = (function () {
   // Private Variable
   var modules = { },
       slice = [].slice,
       //the sandbox factory allows the default sandbox behaviour to be replaced at runtime allowing for easier unit testing
   //the default sandbox factory allows dynamic addition of functions to the sandbox at runtime
       sandboxFactory = (function() {
          var sandboxFunctions = { };

          return {
             getNewSandbox: function(core, moduleId) {
                var newSandbox = new Sandbox(core, moduleId);
                for (var property in sandboxFunctions) {
                   if (sandboxFunctions.hasOwnProperty(property)) {
                      var sandboxFunction = (function() {
                         var returnValue,
                             newFunctionDefinition = sandboxFunctions[property];

                         if (newFunctionDefinition.passModuleId) {
                            returnValue = function() {
                               var functionArguments = slice.call(arguments, 0);
                               functionArguments.push(moduleId);
                               return newFunctionDefinition.functionPointer.apply(newFunctionDefinition.context, functionArguments);
                            };
                         } else {
                            returnValue = function() {
                               return newFunctionDefinition.functionPointer.apply(newFunctionDefinition.context, slice.call(arguments, 0));
                            };
                         }
                         return returnValue;
                      })();
                      newSandbox[property] = sandboxFunction;
                   }
                }

                return newSandbox;
             },
             addSandboxFunction: function(name, func, context, passModuleId) {
                sandboxFunctions[name] = { functionPointer: func, context: context, passModuleId: passModuleId };
             }
          };
       })(),
       createInstance = function(moduleId, sandbox) {
          var module = modules[moduleId],
              i,
              arrayLength,
              args = module.args,
              newArguments = [],
              instance;

          newArguments.push(sandbox);
          for (i = 0, arrayLength = args.length; i < arrayLength; i++) {
             newArguments.push(args[i]);
          }

          instance = modules[moduleId].creator.apply(null, newArguments);

          if (Core.Error !== undefined) {
             Core.Error.sanitise(instance);
             Core.Error.sanitise(sandbox);
          }

          return instance;
       };

   return {
      setSandboxFactory: function (newFactory) {
         sandboxFactory = newFactory;
      },
      getSandboxFactory: function () {
         return sandboxFactory;
      },
      register: function (moduleId, Creator) {
         modules[moduleId] = {
            creator: Creator,
            instance: null,
            args: slice.call(arguments, 2)
         };
      },
      registerArguments: function (moduleId) {
         var module = modules[moduleId];
         if (module === null || module === undefined) { }
         else {
            module.args = slice.call(arguments, 1);
         }
      },
      start: function (moduleId) {
         if (modules[moduleId] === undefined) {
            throw new Error("Attempt to start a module that has not been registered: " + moduleId);
         }
         //we don't want to start the module twice
         else if (modules[moduleId].instance === null) {
            modules[moduleId].instance = createInstance(moduleId, sandboxFactory.getNewSandbox(this, moduleId));
            modules[moduleId].instance.activate();
         }
      },
      stop: function (moduleId) {
         if (modules[moduleId] === undefined) {
            throw new Error("Attempt to stop a module that has not been registered: " + moduleId);
         }
         var data = modules[moduleId];
         if (data.instance) {
            data.instance.destroy();
            data.instance = null;
         }
      },
      startAll: function () {
         var moduleId;
         for (moduleId in modules) {
            if (modules.hasOwnProperty(moduleId)) {
               this.start(moduleId);
            }
         }
      },
      stopAll: function () {
         var moduleId;
         for (moduleId in modules) {
            if (modules.hasOwnProperty(moduleId)) {
               this.stop(moduleId);
            }
         }
      },
      moduleIsActive: function (moduleId) {
         var returnValue;

         if (modules[moduleId] === undefined) {
            returnValue = false;
         }
         else if (modules[moduleId].instance === null) {
            returnValue = false;
         }
         else {
            returnValue = true;
         }
         return returnValue;
      },
      getModule: function (moduleId) {
         var returnValue;

         if (modules[moduleId] === undefined) {
            returnValue = null;
         }
         else if (modules[moduleId].instance === null) {
            returnValue = null;
         }
         else {
            returnValue = modules[moduleId].instance;
         }
         return returnValue;
      }
   };
})();
