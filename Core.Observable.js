/*globals Core, ko*/

(function () {
   var coreObservable = function(ko) {
      return {
         getObservable: function() {
            return ko;
         }
      };
   };
   
   if (typeof define === "function" && define.amd) {
      define("Core.Observable", ["Core", "knockout"], function (core, knockout) {
         core.Observable = coreObservable(knockout);
         return core.Observable;
      });
   }
   else {
      Core.Observable = coreObservable(ko);
   }
})();