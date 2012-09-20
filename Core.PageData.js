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
   
   if (typeof require === 'function') {
      require(["Core"], function (core, jquery) {
         core.PageData = corePageData();
      });
   }
   else {
      Core.PageData = corePageData();
   }

})();