(function() {
   var urlUtilities = function() {
      var baseUrl = "";
      return {
         getBaseUrl: function() {
            return baseUrl;
         },
         setBaseUrl: function(newBaseUrl) {
            baseUrl = newBaseUrl;
         },
         createUrlForFileDownload: function (flatParameterArray) {
            return baseUrl + flatParameterArray.join("/");
         }
      };
   };
   
   if (typeof define === "function" && define.amd) {
      define("Core.UrlUtilities", ["Core"], function (core) {
         core.UrlUtilities = urlUtilities();
         return core.UrlUtilities;
      });
   }
   else {
      Core.UrlUtilities = urlUtilities();
   }
})();