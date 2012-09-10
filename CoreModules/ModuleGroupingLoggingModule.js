/*globals Core*/
Core.register("ModuleGroupingLoggingModule", function (sandbox) {

   var moduleGroupStarted = function (moduleGroupingName) {
      sandbox.consoleLog("Module grouping started: " + moduleGroupingName);
   },
   moduleGroupStopped = function (moduleGroupingName) {
      sandbox.consoleLog("Module grouping stopped: " + moduleGroupingName);
   };

   return {
      activate: function () {
         sandbox.addListener("ModuleGroupingStopping", moduleGroupStopped);
         sandbox.addListener("ModuleGroupingStarting", moduleGroupStarted);
      },
      destroy: function () {
         sandbox.removeListener("ModuleGroupingStopping", moduleGroupStopped);
         sandbox.removeListener("ModuleGroupingStarting", moduleGroupStarted);
      }
   };
});