/*globals Core, ko, require*/
(function () {
   var dataBindingFunction = function (dom, ko) {
      var urlMappings = {};

      return {
         getMapping: function (name) {
            return urlMappings[name];
         },
         addMapping: function (name, domElement) {
            if (!urlMappings[name]) {
               urlMappings[name] = [];
            }
            //make sure wo dont add the same binding twice
            if (urlMappings[name].indexOf(domElement) === -1) {
               urlMappings[name].push(domElement);
            }
         },
         applyBinding: function (moduleId, viewModel) {

            var i, arrayLength, mappings = this.getMapping(moduleId), errors = "", domElement, element;

            if (mappings === null || mappings === undefined) {
               throw new Error("No mapping defined for: " + moduleId);
            }


            for (i = 0, arrayLength = mappings.length; i < arrayLength; i++) {
               domElement = mappings[i];

               if (domElement === undefined || domElement === null) {
                  errors += "Unmapped moduleId passed to bind: " + moduleId + '\n';
               }

               element = dom.getElementById(domElement);
               if (element === undefined || element === null) {
                  errors += "Undefined dom element passed to bind: " + domElement + '\n';
               }
               else {
                  ko.applyBindings(viewModel, element);
               }
            }

            //throw any accumulated errors
            if (errors !== "") {
               throw new Error(errors);
            }
         },
         removeBinding: function (moduleId) {

            var i, arrayLength, mappings = this.getMapping(moduleId), errors = "", domElement, element;

            if (mappings === null || mappings === undefined) {
               throw new Error("No mapping defined for: " + moduleId);
            }

            for (i = 0, arrayLength = mappings.length; i < arrayLength; i++) {
               domElement = mappings[i];

               if (domElement === undefined || domElement === null) {
                  errors += "Unmapped moduleId passed to bind: " + moduleId + '\n';
               }
               else {
                  element = dom.getElementById(domElement);
                  //if the dom element no longer exists on the screen, we don't need to unbind it
                  if (element === undefined || element === null) { }
                  else {
                     //remove any bindings on the node
                     ko.cleanNode(element);
                  }
               }
            }

            //throw any accumulated errors
            if (errors !== "") {
               throw new Error(errors);
            }
         }
      };
   };

   //manage require module loading scenario
   if (typeof define === "function" && define.amd) {
      define("Core.DataBinding", ["Core", "knockout"], function (core, ko) {
         core.DataBinding = (dataBindingFunction)(document, ko);
         return core.DataBinding;
      });
   }
   else {
      Core.DataBinding = (dataBindingFunction)(document, ko);
   }

})();