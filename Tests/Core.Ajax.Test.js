Core.register("AjaxTestModule", function (sandbox) {
   return {
      activate: function () {
      },
      destroy: function () {
      }
   };
});

var dateService = function () {
   var currentTime,
       fakeDate = {
          getTime: function () {
             return currentTime;
          }
       };

   return {
      setCurrentTime: function (newCurrentTime) {
         currentTime = newCurrentTime;
      },
      getNewDate: function () {
         return fakeDate;
      }
   };
};

test("Test simple Ajax call", function () {

   //Arrange
   Core.Ajax.clearCache();
   Core.startAll();
   Core.Ajax.UrlMapper.removeMapping("TestUrl");
   Core.Ajax.UrlMapper.addMapping({ name: "TestUrl", url: "unusedUrl", ajaxType: "POST" });

   var fakeAjaxCall = function (request) {
      equal("unusedUrl", request.url);
      equal("POST", request.type);
      equal(1, request.data.id);

      request.success.call(request.context, { code: "nn" });
   },
   callSucceeded = false,
   success = function (returnValue) {
      callSucceeded = true;
   },
   failure = function (errorMessage) {
      callSucceeded = false;
   },
   requestData = {
      name: "TestUrl",
      data: { id: 1 },
      success: success,
      failure: failure
   };

   $.addImplementation(fakeAjaxCall);

   //Act
   Core.Ajax.request(requestData, "AjaxTestModule");

   //Assert
   ok(callSucceeded, "Ajax call succeeded");

   Core.stopAll();
});

test("Test Ajax cache", function () {

   //Arrange
   Core.Ajax.clearCache();
   Core.startAll();
   Core.Ajax.UrlMapper.removeMapping("TestUrl");
   Core.Ajax.UrlMapper.addMapping({ name: "TestUrl", url: "unusedUrl", ajaxType: "POST", cache: true });

   var fakeCount = 0,
   successCount = 0,
   fakeAjaxCall = function (request) {
      equal("unusedUrl", request.url);
      equal("POST", request.type);
      equal(1, request.data.id);

      fakeCount++;

      request.success.call(request.context, { code: "nn" });
   },
   firstReturnValue = null,
   success = function (returnValue) {
      if (successCount === 0) {
         firstReturnValue = returnValue;
      }
      else {
         equal(returnValue, firstReturnValue, "cached return value is the same as the first request");
      }
      successCount++;
   },
   failure = function (errorMessage) {
   },
   requestData = {
      name: "TestUrl",
      data: { id: 1 },
      success: success,
      failure: failure
   };

   $.addImplementation(fakeAjaxCall);

   //Act
   Core.Ajax.request(requestData, "AjaxTestModule");
   Core.Ajax.request(requestData, "AjaxTestModule");

   //Assert
   equal(successCount, 2, "Success was called twice!  NO WAY!");
   equal(fakeCount, 1, "However, fake ajax call was only made once!");

   Core.stopAll();
});

test("Test Ajax does not return cached object for separate requests with different data to the same URL", function () {

   //Arrange
   Core.Ajax.clearCache();
   Core.startAll();
   Core.Ajax.UrlMapper.removeMapping("TestUrl");
   Core.Ajax.UrlMapper.addMapping({ name: "TestUrl", url: "unusedUrl", ajaxType: "POST", cache: true });

   var fakeCount = 0,
   successCount = 0,
   fakeAjaxCall = function (request) {
      equal("unusedUrl", request.url);
      equal("POST", request.type);

      fakeCount++;

      request.success.call(request.context, { code: request.data.id });
   },
   firstReturnValue = null,
   success = function (returnValue) {
      if (successCount === 0) {
         firstReturnValue = returnValue;
      }
      else {
         notDeepEqual(returnValue, firstReturnValue, "the second requests return data is not the cached value");
      }
      successCount++;
   },
   failure = function (errorMessage) {
   },
   requestData1 = {
      name: "TestUrl",
      data: { id: 1 },
      success: success,
      failure: failure
   },
   requestData2 = {
      name: "TestUrl",
      data: { id: 2 },
      success: success,
      failure: failure
   };

   $.addImplementation(fakeAjaxCall);

   //Act
   Core.Ajax.request(requestData1, "AjaxTestModule");
   Core.Ajax.request(requestData2, "AjaxTestModule");

   //Assert
   equal(successCount, 2, "Success was called twice!  NO WAY!");
   equal(fakeCount, 2, "However, fake ajax call was also made twice!");

   Core.stopAll();
});

test("Test Ajax caches separate requests to the same URL", function () {

   //Arrange
   Core.Ajax.clearCache();
   Core.startAll();
   Core.Ajax.UrlMapper.removeMapping("TestUrl");
   Core.Ajax.UrlMapper.addMapping({ name: "TestUrl", url: "unusedUrl", ajaxType: "POST", cache: true });

   var fakeCount = 0,
   successCount = 0,
   fakeAjaxCall = function (request) {
      equal("unusedUrl", request.url);
      equal("POST", request.type);

      fakeCount++;

      request.success.call(request.context, { code: request.data.id });
   },
   firstReturnValue = null,
   secondReturnValue = null,
   success = function (returnValue) {
      if (successCount === 0) {
         firstReturnValue = returnValue;
      }
      else if (successCount === 1) {
         secondReturnValue = returnValue;
      }
      else if (successCount === 2) {
         equal(returnValue, firstReturnValue, "first request is cached");
      }
      else if (successCount === 3) {
         equal(returnValue, secondReturnValue, "second request is cached");
      }
      successCount++;
   },
   failure = function (errorMessage) {
   },
   requestData1 = {
      name: "TestUrl",
      data: { id: 1 },
      success: success,
      failure: failure
   },
   requestData2 = {
      name: "TestUrl",
      data: { id: 2 },
      success: success,
      failure: failure
   };

   $.addImplementation(fakeAjaxCall);

   //Act
   Core.Ajax.request(requestData1, "AjaxTestModule");
   Core.Ajax.request(requestData2, "AjaxTestModule");
   Core.Ajax.request(requestData1, "AjaxTestModule");
   Core.Ajax.request(requestData2, "AjaxTestModule");

   //Assert
   equal(successCount, 4, "Success was called four times");
   equal(fakeCount, 2, "However, fake ajax call was only made twice!");

   Core.stopAll();
});

test("Test Ajax cache (within the 10 minute cache limit)", function () {

   //Arrange
   Core.Ajax.clearCache();
   Core.startAll();
   Core.Ajax.UrlMapper.removeMapping("TestUrl");
   Core.Ajax.UrlMapper.addMapping({ name: "TestUrl", url: "unusedUrl", ajaxType: "POST", cache: true, cacheDuration: 10 });

   var fakeCount = 0,
   successCount = 0,
   fakeAjaxCall = function (request) {
      equal("unusedUrl", request.url);
      equal("POST", request.type);
      equal(1, request.data.id);

      fakeCount++;

      request.success.call(request.context, { code: "nn" });
   },
   firstReturnValue = null,
   success = function (returnValue) {
      if (successCount === 0) {
         firstReturnValue = returnValue;
      }
      else {
         equal(returnValue, firstReturnValue, "cached return value is the same as the first request");
      }
      successCount++;
   },
   failure = function (errorMessage) {
   },
   requestData = {
      name: "TestUrl",
      data: { id: 1 },
      success: success,
      failure: failure
   };

   $.addImplementation(fakeAjaxCall);

   //Act
   Core.Ajax.request(requestData, "AjaxTestModule");
   Core.Ajax.request(requestData, "AjaxTestModule");

   //Assert
   equal(successCount, 2, "Success was called twice!  NO WAY!");
   equal(fakeCount, 1, "However, fake ajax call was only made once!");

   Core.stopAll();
});

test("Test Ajax does not return cached object for separate requests with different data to the same URL (within the 10 minute cache limit)", function () {

   //Arrange
   Core.Ajax.clearCache();
   Core.startAll();
   Core.Ajax.UrlMapper.removeMapping("TestUrl");
   Core.Ajax.UrlMapper.addMapping({ name: "TestUrl", url: "unusedUrl", ajaxType: "POST", cache: true, cacheDuration: 10 });

   var fakeCount = 0,
   successCount = 0,
   fakeAjaxCall = function (request) {
      equal("unusedUrl", request.url);
      equal("POST", request.type);

      fakeCount++;

      request.success.call(request.context, { code: request.data.id });
   },
   firstReturnValue = null,
   success = function (returnValue) {
      if (successCount === 0) {
         firstReturnValue = returnValue;
      }
      else {
         notDeepEqual(returnValue, firstReturnValue, "the second requests return data is not the cached value");
      }
      successCount++;
   },
   failure = function (errorMessage) {
   },
   requestData1 = {
      name: "TestUrl",
      data: { id: 1 },
      success: success,
      failure: failure
   },
   requestData2 = {
      name: "TestUrl",
      data: { id: 2 },
      success: success,
      failure: failure
   };

   $.addImplementation(fakeAjaxCall);

   //Act
   Core.Ajax.request(requestData1, "AjaxTestModule");
   Core.Ajax.request(requestData2, "AjaxTestModule");

   //Assert
   equal(successCount, 2, "Success was called twice!  NO WAY!");
   equal(fakeCount, 2, "However, fake ajax call was also made twice!");

   Core.stopAll();
});

test("Test Ajax caches separate requests to the same URL (within the 10 minute cache limit)", function () {

   //Arrange
   Core.Ajax.clearCache();
   Core.startAll();
   Core.Ajax.UrlMapper.removeMapping("TestUrl");
   Core.Ajax.UrlMapper.addMapping({ name: "TestUrl", url: "unusedUrl", ajaxType: "POST", cache: true, cacheDuration: 10 });

   var fakeCount = 0,
   successCount = 0,
   fakeAjaxCall = function (request) {
      equal("unusedUrl", request.url);
      equal("POST", request.type);

      fakeCount++;

      request.success.call(request.context, { code: request.data.id });
   },
   firstReturnValue = null,
   secondReturnValue = null,
   success = function (returnValue) {
      if (successCount === 0) {
         firstReturnValue = returnValue;
      }
      else if (successCount === 1) {
         secondReturnValue = returnValue;
      }
      else if (successCount === 2) {
         equal(returnValue, firstReturnValue, "first request is cached");
      }
      else if (successCount === 3) {
         equal(returnValue, secondReturnValue, "second request is cached");
      }
      successCount++;
   },
   failure = function (errorMessage) {
   },
   requestData1 = {
      name: "TestUrl",
      data: { id: 1 },
      success: success,
      failure: failure
   },
   requestData2 = {
      name: "TestUrl",
      data: { id: 2 },
      success: success,
      failure: failure
   };

   $.addImplementation(fakeAjaxCall);

   //Act
   Core.Ajax.request(requestData1, "AjaxTestModule");
   Core.Ajax.request(requestData2, "AjaxTestModule");
   Core.Ajax.request(requestData1, "AjaxTestModule");
   Core.Ajax.request(requestData2, "AjaxTestModule");

   //Assert
   equal(successCount, 4, "Success was called four times");
   equal(fakeCount, 2, "However, fake ajax call was only made twice!");

   Core.stopAll();
});

test("Test cache times out", function () {

   //Arrange
   var fakeDateService = dateService(),
      currentDateObject = new Date(2012, 1, 1, [0, 0, 0, 0]),
      tenMinutesInFutureDate = new Date(2012, 1, 1, [0, 11, 0, 0]);

   fakeDateService.setCurrentTime(currentDateObject.getTime());
   Core.Ajax.setDateFactory(fakeDateService); // SETTING THE DATE SERVICE TO THE FAKE DATE SERVICE :D
   Core.Ajax.clearCache();
   Core.startAll();
   Core.Ajax.UrlMapper.removeMapping("TestUrl");
   Core.Ajax.UrlMapper.addMapping({ name: "TestUrl", url: "unusedUrl", ajaxType: "POST", cache: true, cacheDuration: 10 });

   var fakeCount = 0,
      successCount = 0,
      fakeAjaxCall = function (request) {
         fakeCount++;
         request.success.call(request.context, { code: "nn" });
      },
      success = function (returnValue) {
         successCount++;
      },
      requestData = {
         name: "TestUrl",
         data: { id: 1 },
         success: success
      };

   $.addImplementation(fakeAjaxCall);

   //Act
   Core.Ajax.request(requestData, "AjaxTestModule");
   fakeDateService.setCurrentTime(tenMinutesInFutureDate.getTime()); // Set the date to 11 minutes IN THE FUTURE doooweeooo
   Core.Ajax.request(requestData, "AjaxTestModule");

   //Assert
   equal(successCount, 2, "Success was called twice!  NO WAY!");
   equal(fakeCount, 2, "However, fake ajax call was also made twice!");

   Core.stopAll();
});

test("Test cache NEVER times out", function () {

   //Arrange
   var fakeDateService = dateService(),
      currentDateObject = new Date(2012, 1, 1, [0, 0, 0, 0]),
      oneDayInFutureDate = new Date(2150, 1, 2, [0, 0, 0, 0]);

   fakeDateService.setCurrentTime(currentDateObject.getTime());
   Core.Ajax.setDateFactory(fakeDateService); // SETTING THE DATE SERVICE TO THE FAKE DATE SERVICE :D
   Core.Ajax.clearCache();
   Core.startAll();
   Core.Ajax.UrlMapper.removeMapping("TestUrl");
   Core.Ajax.UrlMapper.addMapping({ name: "TestUrl", url: "unusedUrl", ajaxType: "POST", cache: true });

   var fakeCount = 0,
      successCount = 0,
      fakeAjaxCall = function (request) {
         fakeCount++;
         request.success.call(request.context, { code: "nn" });
      },
      success = function (returnValue) {
         successCount++;
      },
      requestData = {
         name: "TestUrl",
         data: { id: 1 },
         success: success
      };

   $.addImplementation(fakeAjaxCall);

   //Act
   Core.Ajax.request(requestData, "AjaxTestModule");
   fakeDateService.setCurrentTime(oneDayInFutureDate.getTime()); // Set the date to 11 minutes IN THE FUTURE doooweeooo
   Core.Ajax.request(requestData, "AjaxTestModule");

   //Assert
   equal(successCount, 2, "Success was called twice!  NO WAY!");
   equal(fakeCount, 1, "However, fake ajax call was also made Once!  Cache did not time out!");

   Core.stopAll();
});

test("Test Core.Ajax queues requests", function () {
   Core.Ajax.clearCache();
   Core.startAll();
   Core.Ajax.UrlMapper.removeAllMappings();
   Core.Ajax.UrlMapper.addMapping({ name: "TestUrl", url: "unusedUrl", ajaxType: "POST", queueRequest: true });

   var fakeCount = 0,
      successCount = 0,
      firstRequestObject = null,
      fakeAjaxCall = function (request) {

         if (fakeCount === 0) {
            ok(true, "ajax call is made once");
         }
         else {
            ok(false, "ajax call is made more than once");
         }

         firstRequestObject = request; // Awww yeah!

         fakeCount++;
      },
      success = function (returnValue) {
         successCount++;
         deepEqual(requestData.data, returnValue, "Ajax return value is the same every time");
         if (successCount > 4) {
            ok(false, "success was called more than 4 times");
         }
      },
      requestData = {
         name: "TestUrl",
         data: { id: 1 },
         success: success
      };

   $.addImplementation(fakeAjaxCall);

   //Act
   Core.Ajax.request(requestData, "AjaxTestModule");
   Core.Ajax.request(requestData, "AjaxTestModule");
   Core.Ajax.request(requestData, "AjaxTestModule");
   Core.Ajax.request(requestData, "AjaxTestModule");

   firstRequestObject.success.call(firstRequestObject.context, firstRequestObject.data);

   Core.stopAll();
});

test("Test Core.Ajax queuing does not queue two requests with different data", function () {
   Core.Ajax.clearCache();
   Core.startAll();
   Core.Ajax.UrlMapper.removeAllMappings();
   Core.Ajax.UrlMapper.addMapping({ name: "TestUrl", url: "unusedUrl", ajaxType: "POST", queueRequest: true });

   var fakeCount = 0,
      successCount = 1,
      firstReturnedData = null,
      firstRequestObject = null,
      fakeAjaxCall = function (request) {

         if (fakeCount === 0) {
         }
         else {
            ok(true, "ajax call is made more than once");
         }

         firstRequestObject = request;
         fakeCount++;
      },
      success = function (returnValue) {
         successCount++;
         if (firstReturnedData === null) {
            firstReturnedData = returnValue;
         }
         else {
            notEqual(firstReturnedData, returnValue, "Ajax return value was not the same either time!");
         }
         if (successCount === 2) {
            //   start(); 
         }
      },
      requestData1 = {
         name: "TestUrl",
         data: { id: 1 },
         success: success
      },
      requestData2 = {
         name: "TestUrl",
         data: { id: 2 },
         success: success
      };

   $.addImplementation(fakeAjaxCall);

   //Act
   Core.Ajax.request(requestData1, "AjaxTestModule");
   firstRequestObject.success.call(firstRequestObject.context, firstRequestObject.data);
   Core.Ajax.request(requestData2, "AjaxTestModule");

   firstRequestObject.success.call(firstRequestObject.context, firstRequestObject.data);

   Core.stopAll();
});

test("Test Core.Ajax combined queuing and cache test", 6, function () {
   Core.Ajax.clearCache();
   Core.startAll();
   Core.Ajax.UrlMapper.removeAllMappings();
   Core.Ajax.UrlMapper.addMapping({ name: "TestUrl", url: "unusedUrl", ajaxType: "POST", queueRequest: true, cache: true });

   var fakeCount = 0,
      successCount = 0,
      firstReturnedData = null,
      firstRequestObject = null,
      fakeAjaxCall = function (request) {

         if (fakeCount === 0) {

         }
         else {
            ok(true, "ajax call is made more than once");
         }

         firstRequestObject = request;

         fakeCount++;
      },
      success = function (returnValue) {
         successCount++;

         if (successCount > 5) {
            ok(false, "test failed as success was called too many (" + successCount + ") times");
         }
         else {
            if (firstReturnedData === null) {
               firstReturnedData = returnValue;
            }
            else {
               equal(firstReturnedData, returnValue, "Ajax return value was the same");
            }

            if (successCount === 5) {
               equal(fakeCount, 1, "Fake request was made once only");
               equal(successCount, 5, "There were 5 success calls");
            }
         }
      },
      requestData1 = {
         name: "TestUrl",
         data: { id: 1 },
         success: success
      };

   $.addImplementation(fakeAjaxCall);

   //Act
   Core.Ajax.request(requestData1, "AjaxTestModule");
   Core.Ajax.request(requestData1, "AjaxTestModule");
   Core.Ajax.request(requestData1, "AjaxTestModule");
   Core.Ajax.request(requestData1, "AjaxTestModule");
   firstRequestObject.success.call(firstRequestObject.context, firstRequestObject.data); // WHOOPSIEEEEEEEEEIWMAIERYGAIEMHMSATRIHSTRH
   Core.Ajax.request(requestData1, "AjaxTestModule"); // Procedurally test the cache :D
   
   Core.stopAll();
});

