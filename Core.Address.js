/*globals Core, $*/
//$ - (for jquery address)

Core.Address = (function (addressManagement, window) {

   var isEnabled = false,
       startsWith = function (stringToSearch, str) {
          //NOTE: The toLowerCase can fail in a language such as turkish
          return stringToSearch.toLowerCase().slice(0, str.length) == str.toLowerCase();
       },
       rootUrl,
       useHash = true,
       forceNavigate = false,
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
       getParametersUsingBaseUrl = function (currentUrl) {
          var returnValue = [];

          if (currentUrl.toLowerCase() === rootUrl.toLowerCase()){}
          else if (startsWith(currentUrl, rootUrl)) {
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
       isSameUrl = function (urlDetails) {

          var newArray = [],
         propertName,
         i, arrayLength = urlDetails.length, item, returnValue = true;
          for (propertName in currentParameters) {
             if (currentParameters.hasOwnProperty(propertName)) {
                newArray.push({ key: propertName, value: currentParameters[propertName] });
             }
          }

          if (newArray.length !== urlDetails.length) {
             returnValue = false;
          }
          else {
             for (i = 0; i < arrayLength && returnValue === true; i++) {
                item = urlDetails[i];
                if (currentParameters[item.key] !== item.value) {
                   returnValue = false;
                }
             }
          }
          return returnValue;
       },
       addressChanged = function (evt) {
          var urlDetails = getUrlDetails(evt, addressManagement.baseURL()),
          mapping = getMapping(urlDetails.map(function (item) { return item.key; })),
          argumentList;

          if (isEnabled === false) { }
          else if (mapping === null) {
             //if there is no mapping force the redirect to the "home" page
             Core.Communication.notify("NavigationError", rootUrl);
          }
          else if (forceNavigate === false && isSameUrl(urlDetails) === true && urlDetails.length !== 0) { }
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
             addressChanged(undefined);
          }
          else {
             queueAction(function () {
                for (key in currentParameters) {
                   if (currentParameters.hasOwnProperty(key)) {
                      addressManagement.parameter(key, currentParameters[key]);
                   }
                }
                forceNavigate = true;
                addressManagement.update();
                forceNavigate = false;
             });
          }
       },
       getUrlDetails = function (evt, currentUrl) {
          var returnValue = [], i, arrayLength, key, value, parameterNames, integerRepresentation;

          if (useHash == false) {
             parameterNames = getParametersUsingBaseUrl(currentUrl);
             arrayLength = parameterNames.length;
             for (i = 0; i < arrayLength; i++) {
                key = parameterNames[i];
                i++;
                if (i >= arrayLength) {
                   value = "";
                }
                else {

                   integerRepresentation = parseInt(parameterNames[i], 10);
                   if (isNaN(integerRepresentation)) {
                      value = parameterNames[i];
                   }
                   else {
                      value = integerRepresentation;
                   }
                }

                returnValue.push({
                   key: key,
                   value: value
                });
             }
          }
          else {
             returnValue = intify(evt.parameters);
          }
          return returnValue;
       },
       navigateToUrl = function (url) {
          var urlDetails = getUrlDetails(undefined, url),
              mapping = getMapping(urlDetails.map(function (item) { return item.key; })),
              argumentList,
              didNavigate = false;
          if (isEnabled === false) { }
          else if (mapping === null) { }
          else if (url.length > 0 && url.charAt(url.length - 1) === "#") { }
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
             forceNavigate = false;
             updateAddressUrl();
             didNavigate = true;
          }
          return didNavigate;
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
      navigateToUrl: function (url) {
         return navigateToUrl(url);
      },
      removeAddressComponent: function (parameter) {
         if (currentParameters[parameter] !== undefined) {
            currentParameters[parameter] = "";
            forceNavigate = true;
            updateAddressUrl();
            forceNavigate = false;
         }
      },
      removeAddressParameter: function (parameter) {
         if (currentParameters[parameter] !== undefined) {
            delete currentParameters[parameter];
            forceNavigate = true;
            updateAddressUrl();
            forceNavigate = false;
         }
      },
      updateAddress: function (parameter, value) {
         if (currentParameters[parameter] !== value) {
            currentParameters[parameter] = value;
            forceNavigate = true;
            updateAddressUrl();
            forceNavigate = false;
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
         forceNavigate = true;
         updateAddressUrl();
         forceNavigate = false;
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
      createUrlFromParameterArray: function (parameterArray, addParametersToCurrentUrl) {
         var returnValue,
             baseUrl,
             queryString,
             parameters;

         if (addParametersToCurrentUrl === false) {
            baseUrl = rootUrl;
         }
         else {
            baseUrl = addressManagement.baseURL() + "/";
         }

         if (useHash === false) {
            queryString = addressManagement.queryString();
            parameters = parameterArray.map(function (keyValuePair) {
               return keyValuePair.parameter + "/" + keyValuePair.value;
            }).join("/");
            returnValue = baseUrl + queryString + parameters;
         }
         else {

            queryString = addressManagement.queryString();
            parameters = parameterArray.map(function (keyValuePair) {
               return keyValuePair.parameter + "=" + keyValuePair.value;
            }).join("&");
            if (queryString !== "") {
               queryString = queryString + "&";
            }
            returnValue = baseUrl + "#/?" + queryString + parameters;
         }
         return returnValue;
      },
      createUrlForFileDownload: function (flatParameterArray) {
         var baseUrl = rootUrl,
             allParameters = flatParameterArray.join("/");
         return baseUrl + allParameters;
      },
      enable: function () {
         isEnabled = true;
         if (useHash === true) {
            addressManagement.change(addressChanged);
         }
         else {
            addressChanged();
         }
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
            window.onpopstate = function () {
               addressChanged();
            };
         }
         else {
            addressManagement.change(null);
         }
      }
   };
})($.address, window);