/*globals Core, $, require*/
(function () {

   var coreAjax = function (ajaxLibrary) {

      var dateFactory = {
         getNewDate: function () {
            return new Date();
         }
      },
         
      requestHeaders = {},
         
      hasHeaderResponseValues = false,
         
      expectedHeaderResponseValues = [],
         
      missingHeadersCallback = null,

      tryCallFunction = function (callback, context, argument) {
         if (typeof callback === "function") {
            if (context === undefined) {
               callback(argument);
            }
            else {
               callback.call(context, argument);
            }
         }
      },

      callSuccess = function (moduleId, tempRequest, returnValue) {
         if (Core.moduleIsActive(moduleId) || Core.Singleton.singletonIsActive(moduleId)) {
            if (returnValue === null || returnValue === undefined) {
               tryCallFunction(tempRequest.success, tempRequest.context, returnValue);
            }
            else if ((typeof returnValue == 'string' || returnValue instanceof String)) {
               //if we have received something that looks like xml (naive starts with a '<')
               if (returnValue.substring(0, 1) === "<" && tempRequest.acceptsXmlResponse === true) {
                  tryCallFunction(tempRequest.success, tempRequest.context, returnValue);
               }
               //if we can have a string response
               else if (tempRequest.acceptsStringResponse == true) {
                  tryCallFunction(tempRequest.success, tempRequest.context, returnValue);
               }
               //otherwise it is a failure
               else {
                  tryCallFunction(tempRequest.failure, tempRequest.context, "Server returned an unexpected response, this may indicate that you are no longer logged in to the system. Please refresh your browser");
               }
            }
            else if (returnValue.RequestSucceeded === undefined) {
               tryCallFunction(tempRequest.success, tempRequest.context, returnValue);
            }
            else if (returnValue.RequestSucceeded === true) {
               tryCallFunction(tempRequest.success, tempRequest.context, returnValue.Value);
            }
            else if (returnValue.RequestSucceeded === false) {
               tryCallFunction(tempRequest.failure, tempRequest.context, returnValue.ErrorMessages);
            }
            else {
               tryCallFunction(tempRequest.success, tempRequest.context, returnValue);
            }
         }
      },

      callFailure = function (moduleId, tempRequest, returnValue) {
         if (Core.moduleIsActive(moduleId) || Core.Singleton.singletonIsActive(moduleId)) {
            tryCallFunction(tempRequest.failure, tempRequest.context, returnValue);
         }
      },

      compareRequestData = function (cachedData, data) {
         var property,
                 returnValue = true;

         if (cachedData === data) {
            returnValue = true;
         }
         else if (cachedData === undefined) {
            returnValue = true;
         }
         else if (data === undefined) {
            returnValue = true;
         }
         else if (cachedData === null) {
            returnValue = true;
         }
         else if (data === null) {
            returnValue = true;
         }
            //compare the properties
         else {
            for (property in cachedData) {
               if (cachedData.hasOwnProperty(property) && data[property] !== cachedData[property]) {
                  returnValue = false;
                  break;
               }
            }
         }
         return returnValue;
      },

      cache = (function () {
         var cachedRequests = {},
         cacheItemExistsAndIsNotExpired = function (cachedRequest, requestData, urlMapping) {
            var returnValue;

            if (cachedRequest === undefined || cachedRequest === null) {
               returnValue = false;
            }
            else if (compareRequestData(cachedRequest.requestData, requestData.data) === false) {
               returnValue = false;
            }
               //no cache expiry
            else if (urlMapping.cacheDuration === undefined) {
               returnValue = true;
            }
               //0 or negative value = no cache expiry
            else if (urlMapping.cacheDuration <= 0) {
               returnValue = true;
            }
            else if (urlMapping.cacheDuration > dateFactory.getNewDate().getTime() - cachedRequest.cachedTime.getTime()) {
               returnValue = true;
            }
            else {
               returnValue = false;
            }

            return returnValue;
         };

         return {
            clearCache: function () {
               cachedRequests = {};
            },
            removeCache: function (urlMapping, requestData) {
               var i,
                 arrayLength,
                 found = false,
                 cachedRequestArray = cachedRequests[urlMapping.name];

               if (cachedRequestArray !== undefined) {
                  for (i = 0, arrayLength = cachedRequestArray.length; i < arrayLength && found === false; i++) {
                     found = compareRequestData(cachedRequestArray[i], requestData);
                  }
                  if (found) {
                     cachedRequestArray.slice(i - 1);
                  }
               }
            },

            cacheExistsAndIsNotExpired: function (urlMapping, requestData) {
               var i,
                 arrayLength,
                 returnValue,
                 cachedRequestArray = cachedRequests[urlMapping.name];

               if (cachedRequestArray === undefined) {
                  returnValue = false;
               }
               else {
                  returnValue = false;
                  for (i = 0, arrayLength = cachedRequestArray.length; i < arrayLength && returnValue === false; i++) {
                     returnValue = cacheItemExistsAndIsNotExpired(cachedRequestArray[i], requestData, urlMapping);
                  }
               }
               return returnValue;
            },

            getCachedRequest: function (urlMapping, requestData) {
               var i,
                 arrayLength,
                 temp,
                 returnValue = null,
                 cachedRequestArray = cachedRequests[urlMapping.name];

               for (i = 0, arrayLength = cachedRequestArray.length; i < arrayLength && returnValue === null; i++) {
                  temp = cachedRequestArray[i];
                  if (compareRequestData(temp.requestData, requestData.data)) {
                     returnValue = temp.ajaxReturnValue;
                  }
               }

               return returnValue;
            },

            addDataToCache: function (returnValue, urlMapping, requestData) {
               var cachedRequest = {
                  requestData: requestData.data,
                  ajaxReturnValue: returnValue,
                  cachedTime: dateFactory.getNewDate()
               };

               if (!cachedRequests[urlMapping.name]) {
                  cachedRequests[urlMapping.name] = [];
               }

               cachedRequests[urlMapping.name].push(cachedRequest);
            }
         };
      })(),

      queue = (function () {

         var requestArray = []; // Object syntax should be the same as incoming request data, except that success and fail are arrays

         return {
            requestIsInQueue: function (requestData) {
               var i,
                    arrayLength,
                    requestExists = false;
               if (requestArray.length > 0) {
                  for (i = 0, arrayLength = requestArray.length; i < arrayLength && !requestExists; i++) {
                     if (requestArray[i].name === requestData.name && compareRequestData(requestArray[i].data, requestData.data)) {
                        requestExists = true;
                     }
                  }
               }
               return requestExists;
            },

            addRequestToQueue: function (moduleId, requestData) {
               requestData.moduleId = moduleId;
               requestArray.push(requestData);
            },

            getAllRequests: function (requestData) {
               var allRequests = [],
                    request,
                    i,
                    arrayLength;

               if (requestArray.length > 0) {
                  for (i = 0, arrayLength = requestArray.length; i < arrayLength; i++) {
                     request = requestArray[i];
                     if (request.name === requestData.name && compareRequestData(request.data, requestData.data)) {
                        allRequests.push(request);
                     }
                  }
               }
               return allRequests;
            },

            removeAllMatchingRequests: function (requestData) {
               var request,
                    i;

               if (requestArray.length > 0) {
                  //remove all requests in reverse so we dont overflow the array bounds
                  for (i = requestArray.length - 1; i >= 0; i--) {
                     request = requestArray[i];
                     if (request.name === requestData.name && compareRequestData(request.data, requestData.data)) {
                        requestArray.splice(i, 1);
                     }
                  }
               }
            }
         };
      })(),

      urlMapper = (function () {

         var urlMappings = {};
         var baseUrl = "",
            assignMapping = function(parameters) {
               var newMapping = {},
                 property,
                propertyValue;
               
               for (property in parameters) {
                  if (parameters.hasOwnProperty(property)) {
                     propertyValue = parameters[property];
                     if (property === "url") {
                        propertyValue = baseUrl + propertyValue;
                     }
                     newMapping[property] = propertyValue;
                  }
               }
               if (newMapping.cacheDuration !== undefined && isNaN(newMapping.cacheDuration) === false) {
                  //turn the cache duration into milliseconds (entered in minutes)
                  newMapping.cacheDuration = newMapping.cacheDuration * 1000 * 60;
               }
               urlMappings[parameters.name] = newMapping;
            };

         return {
            setBaseUrl: function (newBaseUrl) {
               baseUrl = newBaseUrl;
            },
            getMapping: function (name) {
               return urlMappings[name];
            },
            removeMapping: function (parameter) {
               delete urlMappings[parameter];
            },
            removeAllMappings: function () {
               urlMappings = {};
            },
            addMapping: function (parameters) {
               var newMapping = {},
                 property,
                propertyValue;

               if (parameters.name === undefined || parameters.name === null || parameters.name === "") {
                  throw new Error("URL mapping cannot be defined without a name");
               }
               else if (urlMappings[parameters.name] !== undefined) {
                  //TODO: Check if previous mapping is the same and throw an error if it is not
                  delete urlMappings[parameters.name];
                  assignMapping(parameters);
               }
               else {
                  assignMapping(parameters);
               }
            }
         };
      })(),

      storedRequests = (function () {
         var storedRequestData = {};

         return {
            storeRequest: function (data, moduleId) {
               if (storedRequestData[moduleId] === undefined) {
                  storedRequestData[moduleId] = [];
               }
               storedRequestData[moduleId].push(data);
            },
            removeRequest: function (data, moduleId) {
               var requestList = storedRequestData[moduleId],
               i,
               arrayLength,
               request,
               valueFound = false;
               if (requestList !== undefined) {
                  arrayLength = requestList.length;
                  for (i = 0; i < arrayLength && valueFound === false; i++) {
                     request = requestList[i];
                     if (request === data) {
                        requestList.splice(i, 1);
                        valueFound = true;
                     }
                  }
               }
            },
            abortRequest: function (data, moduleId) {
               var requestList = storedRequestData[moduleId],
               i,
               arrayLength,
               request,
               valueFound = false;
               if (requestList !== undefined) {
                  arrayLength = requestList.length;
                  for (i = 0; i < arrayLength && valueFound === false; i++) {
                     request = requestList[i];
                     if (request === data) {
                        request.abort();
                        valueFound = true;
                     }
                  }
               }
            },
            abortAllForModule: function (moduleId) {
               var requestList = storedRequestData[moduleId],
               i,
               arrayLength,
               request;
               if (requestList !== undefined) {
                  arrayLength = requestList.length;
                  for (i = 0; i < arrayLength; i++) {
                     request = requestList[i];
                     request.abort();
                  }
               }
            }
         };
      })();

      return {

         UrlMapper: urlMapper,

         clearCache: function () {
            cache.clearCache();
         },

         //this allows for the injection of a date service
         //so as to easily unit test the timeout
         setDateFactory: function (newDateFactory) {
            dateFactory = newDateFactory;
         },

         //   requestData = {
         //      name: urlMapping
         //      data: data to send to the server - optional
         //      context: callback context - optional
         //      success: callback function (response) - optional
         //      failure: callback function (error message) - optional
         //   }
         request: function (requestData, moduleId) {
            //first look up the URL
            var currentAjaxRequest,
                urlMapping = Core.Ajax.UrlMapper.getMapping(requestData.name);

            var ajaxMessage,
                removeAllQueuedRequests = function () {
                   if (urlMapping.queueRequest === true) {
                      queue.removeAllMatchingRequests(requestData);
                   }
                },
                callFunction = function (responseFunction, returnValue) {
                   var i,
                       arrayLength,
                       tempRequest,
                       allMatchingRequests,
                       functionExecuted = false;

                   if (urlMapping.queueRequest === true) {
                      allMatchingRequests = queue.getAllRequests(requestData);
                      for (i = 0, arrayLength = allMatchingRequests.length; i < arrayLength; i++) {
                         tempRequest = allMatchingRequests[i];
                         responseFunction(tempRequest.moduleId, tempRequest, returnValue);
                         functionExecuted = true;
                      }
                      queue.removeAllMatchingRequests(requestData);
                   }

                   //when we get a request that is cached and queued
                   //it looks through the queue for the callbacks,
                   //however there may be nothing else in the queue and
                   //because the request is cached it never gets added to the queue
                   if (functionExecuted === false) {
                      responseFunction(moduleId, requestData, returnValue);
                   }
                },
                success = function(returnValue, status, associatedData) {
                   var wasSuccessful = true,
                      i,
                      arrayLength,
                      headerResponse;
                   
                   if (hasHeaderResponseValues == true && associatedData != undefined && associatedData.getResponseHeader != undefined) {
                      arrayLength = expectedHeaderResponseValues.length;
                      for (i = 0; i < arrayLength && wasSuccessful === true; i++) {
                         headerResponse = expectedHeaderResponseValues[i];
                         if (associatedData.getResponseHeader(headerResponse.key) != headerResponse.value) {
                            wasSuccessful = false;
                         }
                      }
                   }
                   
                   if (wasSuccessful === false && missingHeadersCallback != null) {
                      missingHeadersCallback(returnValue, status, associatedData);
                   }
                   
                   storedRequests.removeRequest(currentAjaxRequest, moduleId);
                   callFunction(callSuccess, returnValue);
                },
                failure = function (returnValue) {
                   storedRequests.removeRequest(currentAjaxRequest, moduleId);
                   callFunction(callFailure, returnValue);
                },
                errorFunc = function (jqXhr, textStatus, errorThrown) {
                   storedRequests.removeRequest(currentAjaxRequest, moduleId);
                   if (textStatus === "error") {
                      // We might need a proper message if no error message passed in
                      callFunction(callFailure, errorThrown !== "" ? errorThrown : "Failure to connect to the server");
                   }
                   //when a page navigate occurs ajax requests are cancelled, both status and ready state are 0
                   else if (jqXhr.status === 0 && jqXhr.readyState === 0) { }
                      //when we abort an ajax call we dont want to call the failure method
                   else if (textStatus === "abort") { }
                   else {
                      callFunction(callFailure, errorThrown);
                   }
                   removeAllQueuedRequests();
                },
                successAndCache = function (ajaxReturnValue, status, associatedData) {
                   cache.addDataToCache(ajaxReturnValue, urlMapping, requestData);
                   success(ajaxReturnValue, status, associatedData);
                };

            if (requestData === null || requestData === undefined) {
               throw new Error("Ajax request passed no data");
            }
            else if (requestData.name === undefined || requestData.name === null || requestData.name === "") {
               throw new Error("Ajax request passed empty request name");
            }
            else if (urlMapping === null || urlMapping === undefined) {
               throw new Error("No URL defined for " + requestData.name);
            }
            else if (cache.cacheExistsAndIsNotExpired(urlMapping, requestData)) {
               success(cache.getCachedRequest(urlMapping, requestData));
            }
            else {
               //clean out the cache if it exists
               cache.removeCache(urlMapping, requestData);

               if (urlMapping.queueRequest === true && queue.requestIsInQueue(requestData) === true) {
                  //we dont want to do the whole ajax call, just add this to the queue as well
                  queue.addRequestToQueue(moduleId, requestData);
               }
               else {
                  if (urlMapping.queueRequest === true) {
                     //we still want to add it to the queue however, so other requests 'know' it is there
                     queue.addRequestToQueue(moduleId, requestData);
                  }

                  ajaxMessage = {
                     url: urlMapping.url,
                     type: urlMapping.ajaxType,
                     traditional: true,
                     headers: requestHeaders,
                     failure: failure,
                     error: errorFunc,
                     cache: false
                  };

                  if (urlMapping.cache === true) {
                     ajaxMessage.success = successAndCache;
                  }
                  else {
                     ajaxMessage.success = success;
                  }

                  //add additional data if required
                  if (requestData.data !== undefined) {
                     ajaxMessage.data = requestData.data;
                  }
                  if (requestData.context !== undefined) {
                     ajaxMessage.context = requestData.context;
                  }

                  currentAjaxRequest = ajaxLibrary.ajax(ajaxMessage);
                  storedRequests.storeRequest(currentAjaxRequest, moduleId);
               }
            }
         },

         cancelRequests: function (moduleId) {
            storedRequests.abortAllForModule(moduleId);
         },
         
         expectedResponseHeaderValues: function (headerRepsonseValues) {
            expectedHeaderResponseValues = headerRepsonseValues;
            hasHeaderResponseValues = headerRepsonseValues != null && headerRepsonseValues.length > 0;
         },
         
         reponseFailedDueToMissingHeadersCallback: function (callback){
            missingHeadersCallback = callback;
         },
         
         attachRequestHeader: function (key, value) {
            requestHeaders[key] = value;
         }
      };
   };

   //manage require module loading scenario
   if (typeof define === "function" && define.amd) {
      define("Core.Ajax", ["Core", "jquery"], function (core, jQuery) {
         core.Ajax = coreAjax(jQuery);
         return core.Ajax;
      });
   }
   else {
      Core.Ajax = coreAjax($);
   }

})();