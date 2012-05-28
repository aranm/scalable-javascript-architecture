/*globals Core*/

Core.Navigation = (function () {

   var slice = [].slice,
       currentModuleGroup = "",
       startModuleGroup = function (moduleGroupName) {
          if (moduleGroupName !== currentModuleGroup) {
             Core.ModuleGrouping.stopModuleGroupingAndStartAnotherGrouping(currentModuleGroup, moduleGroupName);
             currentModuleGroup = moduleGroupName;
          }
       },
       navigateTo = function (moduleGroup, raisesEvents, args) {
          var i, arrayLength, event;
          startModuleGroup(moduleGroup);
          if (raisesEvents !== undefined) {
             for (i = 0, arrayLength = raisesEvents.length; i < arrayLength; i++) {
                event = raisesEvents[i];
                Core.Communication.notify(event, args[i]);
             }
          }
          Core.Communication.notify("NavigationFinished");
       };

   return {
      addNavigation: function (navigationItem) {
         var wrapper = function () {
            navigateTo(navigationItem.startsModuleGroup, navigationItem.raisesEvents, slice.call(arguments, 0));
         };
         Core.Communication.addListener(navigationItem.listensTo, wrapper);
      }
   };

})();