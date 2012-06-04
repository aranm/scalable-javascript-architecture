/*globals Core, $*/
//$ - (for jquery address)

Core.Address = (function (addressManagement) {

   var isEnabled = false,
       startsWith = function (stringToSearch, str) {
          return stringToSearch.slice(0, str.length) == str;
       },
       rootUrl,
       useHash = true,
       mappings = [],
       currentParameters = {},
       compareArrays = function (arrayOne, arrayTwo) {
          var i, returnValue = true, arrayOneLength = arrayOne.length, arrayTwoLength = arrayTwo.length;
          if (arrayOneLength !== arrayTwoLength) {
             returnValue = false;
          } else {
             for (i = 0; i < arrayOneLength && returnValue === true; i++) {
                if (arrayOne[i] !== arrayTwo[i]) {
                   returnValue = false;
                }
             }
          }
          return returnValue;
       },
       getParametersUsingBaseUrl = function () {
          var returnValue = [],
              currentUrl = addressManagement.baseURL();

          if (startsWith(currentUrl, rootUrl)) {
             returnValue = currentUrl.substring(rootUrl.length).split("/");
          }
          return returnValue;
       },
       getMapping = function (parameterNames) {
          var length, i, mapping, temp;


          if (parameterNames === null || parameterNames === undefined) {
             return null;
          }
          length = mappings.length;
          mapping = null;
          temp = null;
          for (i = 0; i < length && mapping === null; i++) {
             temp = mappings[i];
             if (compareArrays(temp.route, parameterNames)) {
                mapping = temp;
             }
          }

          return mapping;
       },
       intify = function (parameters) {
          var returnValue = [],
              parameter,
              integerRepresentation,
              key,
              value;

          for (parameter in parameters) {
             if (parameters.hasOwnProperty(parameter)) {
                value = parameters[parameter];

                key = parameter;
                //we havbe a lot of urls that are actually ints instead of strings, if it 
                //can be interpreted as an int use that as the parameter
                integerRepresentation = parseInt(value, 10);
                if (isNaN(integerRepresentation)) {
                   value = value;
                } else {
                   value = integerRepresentation;
                }
                returnValue.push({
                   key: key,
                   value: value
                });
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
       addressChanged = function (evt) {
          var urlDetails = getUrlDetails(evt),
          mapping = getMapping(urlDetails.map(function (item) { return item.key; })),
          argumentList;

          if (isEnabled === false) { }
          else if (mapping === null) {
             //if there is no mapping force the redirect to the "home" page
             clearAllAddressParameters();
          }
          else {
             //reset the parameters
             currentParameters = {};

             argumentList = [];
             argumentList.push(mapping.event);
             urlDetails.forEach(function (item) {
                var value = item.value;
                argumentList.push(value);
                //update the current parameters list
                currentParameters[item.key] = value;
             });

             //raise the notification
             Core.Communication.notify.apply(null, argumentList);
          }
       },
       updateAddressUrl = function () {
          var key, currentPathArray = [], newPath = "";
          if (useHash === false) {
             for (key in currentParameters) {
                if (currentParameters.hasOwnProperty(key)) {
                   currentPathArray.push(key + "/" + currentParameters[key]);
                }
             }
             newPath = rootUrl + currentPathArray.join("/");
             history.pushState({ path: newPath }, "", newPath);
             addressChanged();
          }
          else {
             queueAction(function () {
                for (key in currentParameters) {
                   if (currentParameters.hasOwnProperty(key)) {
                      addressManagement.parameter(key, currentParameters[key]);
                   }
                }
                addressManagement.update();
             });
          }
       },
       clearAllAddressParameters = function () {
          currentParameters = {};
          //set the address back to the root url
          addressManagement.value("");
          updateAddressUrl();
       },
       getUrlDetails = function (evt) {
          var returnValue = [], i, arrayLength, key, value, parameterNames, integerRepresentation;

          if (useHash == false) {
             parameterNames = getParametersUsingBaseUrl();
             arrayLength = parameterNames.length;
             for (i = 0; i < arrayLength; i++) {
                key = parameterNames[i];
                i++;
                if (i >= arrayLength) {
                   value = "";
                } else {
                   integerRepresentation = parseInt(parameterNames[i], 10);
                   if (isNaN(integerRepresentation)) {
                      value = parameterNames[i];
                   } else {
                      value = integerRepresentation;
                   }
                }
                returnValue.push({
                   key: key,
                   value: value
                });
             }
          } else {
             returnValue = intify(evt.parameters);
          }
          return returnValue;
       },
       createHashUrl = function (parameter, value) {
          //function creates a URL from the current url by appending the parameter and value
          var baseUrl = addressManagement.baseURL(),
              queryString = addressManagement.queryString(),
              parameters = parameter + "=" + value;

          if (queryString !== "") {
             queryString = queryString + "&";
          }

          return baseUrl + "/#/?" + queryString + parameters;

       },
       createUrl = function (parameter, value) {
          var baseUrl = addressManagement.baseURL(),
              returnValue = baseUrl + "/" + parameter + "/" + value;
          return returnValue;
       };


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
         var returnValue;
         if (useHash === true) {
            returnValue = createHashUrl(parameter, value);
         }
         else {
            returnValue = createUrl(parameter, value);
         }
         return returnValue;
      },
      createUrlFromParameterArray: function (parameterArray) {

         var returnValue;

         if (useHash === false) {
            var baseUrl = addressManagement.baseURL(),
                queryString = addressManagement.queryString(),
                parameters = parameterArray.map(function (keyValuePair) {
                   return keyValuePair.parameter + "/" + keyValuePair.value;
                }).join("/");
                
            returnValue = baseUrl + "/" + queryString + parameters;
         }
         else {
            var baseUrl = addressManagement.baseURL(),
                queryString = addressManagement.queryString(),
                parameters = parameterArray.map(function (keyValuePair) {
                   return keyValuePair.parameter + "=" + keyValuePair.value;
                }).join("&");

            if (queryString !== "") {
               queryString = queryString + "&";
            }

            returnValue = baseUrl + "/#/?" + queryString + parameters;
         }
         return returnValue;

         //function creates a URL from the current url by appending the parameter and value

      },
      createUrlForFileDownload: function (flatParameterArray) {
         var baseUrl = addressManagement.baseURL(),
             allParameters = flatParameterArray.join("/");
         return baseUrl + "/" + allParameters;
      },
      enable: function () {
         isEnabled = true;
         addressManagement.change(addressChanged);
      },
      disable: function () {
         isEnabled = false;
         addressManagement.change(null);
      },
      setRootUrl: function (siteRootUrl) {
         rootUrl = siteRootUrl;
      },
      useHashAddressScheme: function (useHashScheme) {
         useHash = useHashScheme;
         if (useHash === false) {
            window.onpopstate = function (event) {
               // alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
            };
         }
      }
   };
})($.address);