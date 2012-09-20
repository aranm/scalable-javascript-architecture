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
            urlMappings[name].push(domElement);
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

               element = dom.getElementById(domElement);
               if (element === undefined || element === null) {
                  errors += "Undefined dom element passed to bind: " + domElement + '\n';
               }
               else {
                  //remove any bindings on the node
                  ko.cleanNode(element);
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
   if (typeof require === 'function') {
      require(["Core", "knockout"], function (core, ko) {
         core.DataBinding = (dataBindingFunction)(document, ko);
      });
   }
   else {
      Core.DataBinding = (dataBindingFunction)(document, ko);
   }

})();