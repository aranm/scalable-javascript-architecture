(function() {
   var corePageData = function() {
      var pageData = null;
      return {
         getPageData: function() {
            return pageData;
         },
         setPageData: function(newPageData) {
            pageData = newPageData;
         }
      };
   };
   
   if (typeof define === "function" && define.amd) {
      define("Core.PageData", ["Core"], function (core) {
         core.PageData = corePageData();
         return core.PageData;
      });
   }
   else {
      Core.PageData = corePageData();
   }

})();