/*globals Core, $*/
//$ - (for jquery address)

Core.Address = (function (addressManagement) {

   var isEnabled,
       mappings = [],
       currentParameters = {},
       compareArrays = function (arrayOne, arrayTwo) {
          var i, returnValue = true, arrayOneLength = arrayOne.length, arrayTwoLength = arrayTwo.length;
          if (arrayOneLength !== arrayTwoLength) {
             returnValue = false;
          }
          else {
             for (i = 0; i < arrayOneLength && returnValue === true; i++) {
                if (arrayOne[i] !== arrayTwo[i]) {
                   returnValue = false;
                }
             }
          }
          return returnValue;
       },
       getMapping = function (parameterNames) {
          if (parameterNames === null || parameterNames === undefined) {
             return null;
          }
          var length = mappings.length, i, mapping = null, temp = null;
          for (i = 0; i < length && mapping === null; i++) {
             temp = mappings[i];
             if (compareArrays(temp.route, parameterNames)) {
                mapping = temp;
             }
          }
          return mapping;
       },
       getListOfParameters = function (parameters) {
          var returnValue = [],
              parameter,
              integerRepresentation,
              value;

          for (parameter in parameters) {
             if (parameters.hasOwnProperty(parameter)) {
                value = parameters[parameter];

                //we havbe a lot of urls that are actually ints instead of strings, if it 
                //can be interpreted as an int use that as the parameter
                integerRepresentation = parseInt(value, 10);
                if (isNaN(integerRepresentation)) {
                   returnValue.push(parameters[parameter]);
                }
                else {
                   returnValue.push(integerRepresentation);
                }
             }
          }

          return returnValue;
       },
       intify = function (parameters) {
          var returnValue = {},
              parameter,
              integerRepresentation,
              value;

          for (parameter in parameters) {
             if (parameters.hasOwnProperty(parameter)) {
                value = parameters[parameter];

                //we havbe a lot of urls that are actually ints instead of strings, if it 
                //can be interpreted as an int use that as the parameter
                integerRepresentation = parseInt(value, 10);
                if (isNaN(integerRepresentation)) {
                   returnValue[parameter] = value;
                }
                else {
                   returnValue[parameter] = integerRepresentation;
                }
             }
          }

          return returnValue;
       },
       updateTimer = null,
       queueAction = function (action) {
          if (updateTimer !== null) {
             clearTimeout(updateTimer);
          }
          updateTimer = setTimeout(action, 0);
       },
      updateAddressUrl = function () {
         queueAction(function () {
            var key;
            for (key in currentParameters) {
               if (currentParameters.hasOwnProperty(key)) {
                  addressManagement.parameter(key, currentParameters[key]);
               }
            }
            addressManagement.update();
         });
      },
      clearAllAddressParameters = function () {
         currentParameters = {};
         //set the address back to the root url
         addressManagement.value("");
         updateAddressUrl();
      };

   addressManagement.change(function (evt) {
      var mapping = getMapping(evt.parameterNames),
          argumentList,
          i,
          arrayLength,
          parameters,
          intifiedParameters,
          key;

      if (isEnabled === false) { }
      else if (mapping === null) {
         //if there is no mapping force the redirect to the "home" page
         clearAllAddressParameters();
      }
      else {
         argumentList = [];
         argumentList.push(mapping.event);
         parameters = getListOfParameters(evt.parameters);
         intifiedParameters = intify(evt.parameters);

         //reset the parameters
         currentParameters = {};

         //copy the new parameters
         for (key in intifiedParameters) {
            if (intifiedParameters.hasOwnProperty(key)) {
               currentParameters[key] = intifiedParameters[key];
            }
         }

         for (i = 0, arrayLength = parameters.length; i < arrayLength; i++) {
            argumentList.push(parameters[i]);
         }

         //raise the notification
         Core.Communication.notify.apply(null, argumentList);
      }
   });


   return {
      addRoute: function (mapping) {
         mappings.push(mapping);
      },
      reset: function () {
         mappings = [];
         currentParameters = {};
      },
      removeAddressComponent: function (parameter) {
         if (currentParameters[parameter] !== undefined) {
            currentParameters[parameter] = "";
            updateAddressUrl();
         }
      },
      updateAddress: function (parameter, value) {
         if (currentParameters[parameter] !== value) {
            currentParameters[parameter] = value;
            updateAddressUrl();
         }
      },
      updateAddressParameters: function (parameterArray) {
         //update all the parameters
         parameterArray.forEach(function (item) {
            if (currentParameters[item.parameter] !== item.value) {
               currentParameters[item.parameter] = item.value;
            }
         });

         //then update the address
         updateAddressUrl();
      },

      createUrl: function (parameter, value) {
         //function creates a URL from the current url by appending the parameter and value
         var baseUrl = addressManagement.baseURL(),
             queryString = addressManagement.queryString(),
             parameters = parameter + "=" + value;

         if (queryString !== "") {
            queryString = queryString + "&";
         }

         return baseUrl + "/#/?" + queryString + parameters;
      },

      createUrlFromParameterArray: function (parameterArray) {
         //function creates a URL from the current url by appending the parameter and value
         var baseUrl = addressManagement.baseURL(),
             queryString = addressManagement.queryString(),
             parameters = parameterArray.map(function (keyValuePair) {
                return keyValuePair.parameter + "=" + keyValuePair.value;
             }).join("&");

             if (queryString !== "") {
                queryString = queryString + "&";
             }

         return baseUrl + "/#/?" + queryString + parameters;
      },

      enable: function () {
         isEnabled = true;
      },
      disable: function () {
         isEnabled = false;
      }
   };
})($.address);