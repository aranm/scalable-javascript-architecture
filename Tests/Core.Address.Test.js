test("Test root address route", function () {

   //Arrange
   var openHomeScreenCalled = false,
       openHomeScreenListener = function () {
          openHomeScreenCalled = true;
       };

   Core.Address.reset();
   Core.Address.addRoute({ name: "Home", route: [], event: "OpenHomeScreen" });
   Core.Communication.addListener("OpenHomeScreen", openHomeScreenListener);

   //Act
   $.addressTesting.fireChangeWithEventArguments({
      parameterNames: [],
      parameters: {}
   });

   //Assert
   ok(openHomeScreenCalled, "event was fired for routing");

   //Clean up
   Core.Communication.removeListener("OpenHomeScreen", openHomeScreenListener);
});

test("Test basic address route", function () {

   //Arrange
   var openHomeScreenCalled = false,
       openScreenListener = function (classId) {
          if (classId === 91) {
             openHomeScreenCalled = true;
          }
       };

   Core.Address.reset();
   Core.Address.addRoute({ name: "ClassScreen", route: ["classId"], event: "OpenClassScreen" });
   Core.Communication.addListener("OpenClassScreen", openScreenListener);

   //Act
   $.addressTesting.fireChangeWithEventArguments({
      parameterNames: ["classId"],
      parameters: { classId: "91" }
   });

   //Assert
   ok(openHomeScreenCalled, "event was fired for routing");

   //Clean up
   Core.Communication.removeListener("OpenClassScreen", openScreenListener);
});

test("Test multiple level address route", function () {

   //Arrange
   var openScreenCalled = false,
       openScreenListener = function (classId, studentId) {
          if (classId === 91 && studentId === 32) {
             openScreenCalled = true;
          }
       };

   Core.Address.reset();
   Core.Address.addRoute({ name: "ClassScreen", route: ["classId", "studentId"], event: "OpenEnrolmentScreen" });
   Core.Communication.addListener("OpenEnrolmentScreen", openScreenListener);

   //Act
   $.addressTesting.fireChangeWithEventArguments({
      parameterNames: ["classId", "studentId"],
      parameters: { classId: "91", studentId: "32" }
   });

   //Assert
   ok(openScreenCalled, "event was fired for routing");

   //Clean up
   Core.Communication.removeListener("OpenEnrolmentScreen", openScreenListener);
});

test("Test multiple level address route with invalid level no event fires", function () {

   //Arrange
   var openScreenCalled = false,
       openScreenListener = function () {
          openScreenCalled = true;
       };

   Core.Address.reset();

   Core.Address.addRoute({ name: "Home", route: [] });
   Core.Address.addRoute({ name: "ClassScreen", route: ["classId", "studentId"], event: "OpenEnrolmentScreen" });
   Core.Communication.addListener("OpenEnrolmentScreen", openScreenListener);

   //Act
   $.addressTesting.fireChangeWithEventArguments({
      parameterNames: ["classId", "otherId"],
      parameters: { classId: "91", otherId: "32" }
   });

   //Assert
   ok(openScreenCalled === false, "event was not fired for routing");

   //Clean up
   Core.Communication.removeListener("OpenEnrolmentScreen", openScreenListener);
});

test("Test update path", function () {

   //Arrange
   var openScreenCalled = false,
       openScreenListener = function (classId) {
          if (classId === 91) {
             openScreenCalled = true;
          }
       };

   Core.Address.reset();
   Core.Address.addRoute({ name: "ClassScreen", route: ["classId"], event: "OpenEnrolmentScreen" });
   Core.Communication.addListener("OpenEnrolmentScreen", openScreenListener);

   //Act
   Core.Address.updateAddress("classId", 91);

   //Assert
   ok(openScreenCalled === true, "updating the address fired the event");

   //Clean up
   Core.Communication.removeListener("OpenEnrolmentScreen", openScreenListener);
});

test("Test update multiple deep path", function () {

   //Arrange
   var openScreenCalled = false,
       openScreenListener = function (classId, studentId) {
          if (classId === 91 && studentId === 32) {
             openScreenCalled = true;
          }
       };

   $.addressTesting.reset();
   Core.Address.reset();
   Core.Address.addRoute({ name: "ClassScreen", route: ["classId"] });
   Core.Address.addRoute({ name: "EnrolmentScreen", route: ["classId", "studentId"], event: "OpenEnrolmentScreen" });
   Core.Communication.addListener("OpenEnrolmentScreen", openScreenListener);

   //Act
   Core.Address.updateAddress("classId", 91);
   Core.Address.updateAddress("studentId", 32);

   //Assert
   ok(openScreenCalled === true, "updating the address fired the event");

   //Clean up
   Core.Communication.removeListener("OpenEnrolmentScreen", openScreenListener);
});

test("Test update multiple deep path with no matching routing", function () {

   //Arrange
   var openScreenCalled = false,
       openScreenListener = function () {
          openScreenCalled = true;
       };

   $.addressTesting.reset();
   Core.Address.reset();
   Core.Address.addRoute({ name: "Home", route: [] });
   Core.Address.addRoute({ name: "ClassScreen", route: ["classId", "studentId"], event: "OpenEnrolmentScreen" });
   Core.Communication.addListener("OpenEnrolmentScreen", openScreenListener);

   //Act
   Core.Address.updateAddress("classId", 91);
   Core.Address.updateAddress("anotherId", 32);

   //Assert
   ok(openScreenCalled === false, "updating the address with no associated routing did not fire the event");

   //Clean up
   Core.Communication.removeListener("OpenEnrolmentScreen", openScreenListener);
});

