/*globals Core, ko*/

(function () {
   var coreObservable = function(ko) {
      return {
         getObservable: function() {
            return ko;
         }
      };
   };
   
   if (typeof require === 'function') {
      require(["Core", "knockout"], function (core, knockout) {
         core.Observable = coreObservable(knockout);
      });
   }
   else {
      Core.Observable = coreObservable(ko);
   }
})();