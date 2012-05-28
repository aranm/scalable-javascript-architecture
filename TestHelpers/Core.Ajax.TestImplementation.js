var $ = (function () {

   var actualImplementation = function () { };

   return {
      addImplementation: function (implementation) {
         actualImplementation = implementation;
      },
      ajax: function (request) {
         return actualImplementation.call(null, request);
      }
   };
})();