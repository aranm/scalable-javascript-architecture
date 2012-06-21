Core.register("DocumentTitleModule", function (sandbox) {

   var changeTitle = function (newTitle) {
      sandbox.setDocumentTitle(newTitle);
   };

   return {
      activate: function () {
         sandbox.addListener("DocumentTitle", changeTitle);
      },
      destroy: function () {
         sandbox.removeListener("DocumentTitle", changeTitle);
      }
   };
});