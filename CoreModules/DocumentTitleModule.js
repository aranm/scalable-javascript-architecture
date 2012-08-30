Core.register("DocumentTitleModule", function (sandbox) {

   var title = "",
       suffix = "",
       changeTitle = function () {
          sandbox.setDocumentTitle(title + " " + suffix);
       },
       setTitle = function (newTitle) {
          title = newTitle;
          changeTitle();
       },
       setSuffix = function (additionalSuffix) {
          suffix = additionalSuffix;
          changeTitle();
       };

   return {
      activate: function () {
         sandbox.addListener("DocumentTitle", setTitle);
         sandbox.addListener("DocumentTitleSuffix", setSuffix);
      },
      destroy: function () {
         sandbox.removeListener("DocumentTitle", changeTitle);
         sandbox.removeListener("DocumentTitleSuffix", setSuffix);
      }
   };
});