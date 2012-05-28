Core.PageData = function () {

   var pageData = null; ;

   return {
      getPageData: function () {
         return pageData;
      },
      setPageData: function (newPageData) {
         pageData = newPageData;
      }
   };
} ();