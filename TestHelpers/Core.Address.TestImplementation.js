var $ = (function () {

   var changeCallback,
       parameters = [];

   return {
      address: {
         change: function (callback) {
            changeCallback = callback;
         },
         baseURL: function () {
            return "";
         },
         update: function () {
            var key,
                value,
                evt = {
                   parameterNames: [],
                   parameters: {}
                };

            for (key in parameters) {
               if (parameters.hasOwnProperty(key)) {
                  evt.parameterNames.push(key);
                  evt.parameters[key] = parameters[key];
               }
            }

            changeCallback(evt);
         },
         parameter: function (key, value) {
            parameters[key] = value;
         },
         value: function () {
            parameters = [];
         }
      },
      addressTesting: {
         fireChangeWithEventArguments: function (evt) {
            changeCallback(evt);
         },
         reset: function () {
            parameters = [];
         }
      }
   };
})();

if (window === undefined) {
   var window = { };
}