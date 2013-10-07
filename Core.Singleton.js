/*globals Core*/
(function () {
   var coreSingleton = function () {
      var singletons = {},
      registerSingleton = function (singletonId, singleton) {
         singletons[singletonId] = singleton;
      },
      getSingleton = function (singletonId) {
         return singletons[singletonId];
      },
      singletonIsActive = function(singletonId) {
         return getSingleton(singletonId) !== undefined;
      };

      return {
         registerSingleton: registerSingleton,
         getSingleton: getSingleton,
         singletonIsActive: singletonIsActive
      };
   };

   if (typeof define === "function" && define.amd) {
      define("Core.Singleton", ["Core"], function (core) {
         core.Singleton = coreSingleton();
         return core.Singleton;
      });
   }
   else {
      Core.Singleton = coreSingleton();
   }
})();