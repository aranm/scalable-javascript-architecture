/*globals Core, define, require*/

(function () {
   var coreNavigation = function (communication, moduleGrouping) {
      var slice = [].slice,
          currentModuleGroup = "",
          startModuleGroup = function (moduleGroupName) {
             if (moduleGroupName !== currentModuleGroup) {
                moduleGrouping.stopModuleGroupingAndStartAnotherGrouping(currentModuleGroup, moduleGroupName);
                currentModuleGroup = moduleGroupName;
             }
          },
          navigateTo = function (moduleGroup, raisesEvents, args) {
             var i, arrayLength, event;
             startModuleGroup(moduleGroup);
             if (raisesEvents !== undefined) {
                for (i = 0, arrayLength = raisesEvents.length; i < arrayLength; i++) {
                   event = raisesEvents[i];
                   communication.notify(event, args[i]);
                }
             }
             communication.notify("NavigationFinished");
          },
          loadAndNavigateTo = function (moduleGroup, raisesEvents, args) {
             require([moduleGroup], function () {
                navigateTo(moduleGroup, raisesEvents, args);
             });
          };

      return {
         addNavigation: function (navigationItem) {
            var wrapper = function () {
               navigateTo(navigationItem.startsModuleGroup, navigationItem.raisesEvents, slice.call(arguments, 0));
            };
            communication.addListener(navigationItem.listensTo, wrapper);
         },
         addLoadAndNavigate: function (navigationItem) {
            var wrapper = function () {
               loadAndNavigateTo(navigationItem.startsModuleGroup, navigationItem.raisesEvents, slice.call(arguments, 0));
            };
            communication.addListener(navigationItem.listensTo, wrapper);
         }
      };
   };

   if (typeof define === "function" && define.amd) {
      define("Core.Navigation", ["Core", "Core.Communication", "Core.ModuleGrouping"], function (core, coreCommunication, coreModuleGrouping) {
         core.Navigation = coreNavigation(coreCommunication, coreModuleGrouping);
         return core.Navigation;
      });
   }
   else {
      Core.Navigation = coreNavigation(Core.Communication, Core.ModuleGrouping);
   }
})();