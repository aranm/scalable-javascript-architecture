/*globals Core, $, require*/
(function () {
   
   var openPostRequestPage = function () {

      var form = $('#openPostRequestPage');
      // postModel contains:
      // url is the action that the form will be submitted to
      // params are pairs of name and value.
      function requestPage(postModel) {
        
         form.prop('action', postModel.url);
         form.html('');
         for (name in postModel.params) {
            var input = document.createElement('input');
            form.append(input);
            $(input).attr('type', 'hidden');
            $(input).attr('name', name);
            $(input).attr('value', postModel.params[name]);
         }
         form.submit();
      }
      return {
         requestPage: requestPage
      };
   };

   //manage require module loading scenario
   if (typeof define === "function" && define.amd) {
      define("Core.OpenPostRequestPage", ["Core", "jquery"], function (core, jQuery) {
         core.OpenPostRequestPage = openPostRequestPage(jQuery);
         return core.OpenPostRequestPage;
      });
   }
   else {
      Core.OpenPostRequestPage = openPostRequestPage($);
   }
})();