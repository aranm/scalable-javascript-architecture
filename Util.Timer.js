var Util = (function() {
   
})();

Util.Timer = (function () {

   return {
      dispatchInGroups: function (array, size, callback, context, arguments) {

         var timerFunction = function (slicedArray) {
            var args = arguments;
            args.shift(slicedArray);
            callback.apply(context, args);
         };
         



      }
   };
})();