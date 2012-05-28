Core.register("ModuleA", function (sandbox) {
   return {
      activate: function () {
      },
      destroy: function () {
      }
   };
});
Core.register("ModuleB", function (sandbox) {
   return {
      activate: function () {
      },
      destroy: function () {
      }
   };
});
Core.register("ModuleC", function (sandbox) {
   return {
      activate: function () {
      },
      destroy: function () {
      }
   };
});

Core.ModuleGrouping.registerPreviewEvents("GroupA", "PreviewModuleStart", "GroupA");
Core.ModuleGrouping.registerGroup({
   name: "GroupA",
   startsModules: ["ModuleA"]
});
Core.ModuleGrouping.registerPostEvents("GroupA", "PostModuleStart", "GroupA");


Core.ModuleGrouping.registerPreviewEvents("GroupB", "PreviewModuleStart", "GroupB");
Core.ModuleGrouping.registerGroup({
   name: "GroupB",
   dependsOnModuleGroupings: ["GroupA"],
   startsModules: ["ModuleB"]
});
Core.ModuleGrouping.registerPostEvents("GroupB", "PostModuleStart", "GroupB");


Core.ModuleGrouping.registerPreviewEvents("GroupC", "PreviewModuleStart", "GroupC");
Core.ModuleGrouping.registerGroup({
   name: "GroupC",
   dependsOnModuleGroupings: ["GroupA"],
   startsModules: ["ModuleC"]
});
Core.ModuleGrouping.registerPostEvents("GroupC", "PostModuleStart", "GroupC");


test("Test module start", function () {
   //Arrange
   Core.ModuleGrouping.reset();
   Core.Communication.removeAllListeners();

   Core.ModuleGrouping.registerPreviewEvents("GroupA", "PreviewModuleStart", "GroupA");
   Core.ModuleGrouping.registerGroup({
      name: "GroupA",
      startsModules: ["ModuleA"]
   });
   Core.ModuleGrouping.registerPostEvents("GroupA", "PostModuleStart", "GroupA");

   //Act
   Core.ModuleGrouping.start("GroupA");

   //Assert
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupA"), "Module Group A is running");
});

test("Test module stop", function () {
   //Arrange
   Core.ModuleGrouping.reset();
   Core.Communication.removeAllListeners();

   Core.ModuleGrouping.registerPreviewEvents("GroupA", "PreviewModuleStart", "GroupA");
   Core.ModuleGrouping.registerGroup({
      name: "GroupA",
      startsModules: ["ModuleA"]
   });
   Core.ModuleGrouping.registerPostEvents("GroupA", "PostModuleStart", "GroupA");

   //Act
   Core.ModuleGrouping.start("GroupA");
   Core.ModuleGrouping.stop("GroupA");

   //Assert
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupA") === false, "Module Group A is not running");
});

test("Test module start dependant", function () {
   //Arrange
   Core.ModuleGrouping.reset();
   Core.Communication.removeAllListeners();

   Core.ModuleGrouping.registerGroup({
      name: "GroupA",
      startsModules: ["ModuleA"]
   });
   Core.ModuleGrouping.registerGroup({
      name: "GroupB",
      dependsOnModuleGroupings: ["GroupA"],
      startsModules: ["ModuleB"]
   });

   //Act
   Core.ModuleGrouping.start("GroupB");

   //Assert
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupA"), "Module Group A is running");
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupB"), "Module Group B is running");
});

test("Test module stop dependant", function () {
   //Arrange
   Core.ModuleGrouping.reset();
   Core.Communication.removeAllListeners();

   Core.ModuleGrouping.registerGroup({
      name: "GroupA",
      startsModules: ["ModuleA"]
   });
   Core.ModuleGrouping.registerGroup({
      name: "GroupB",
      dependsOnModuleGroupings: ["GroupA"],
      startsModules: ["ModuleB"]
   });

   //Act
   Core.ModuleGrouping.start("GroupB");
   Core.ModuleGrouping.stop("GroupB");

   //Assert
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupA") === false, "Module Group A is not running");
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupB") === false, "Module Group B is not running");
});

test("Test module switch B to A: stop B start A", function () {

   //Arrange
   Core.ModuleGrouping.reset();
   Core.Communication.removeAllListeners();

   Core.ModuleGrouping.registerPreviewEvents("GroupA", "PreviewModuleStart", "GroupA");
   Core.ModuleGrouping.registerGroup({
      name: "GroupA",
      startsModules: ["ModuleA"]
   });
   Core.ModuleGrouping.registerGroup({
      name: "GroupB",
      startsModules: ["ModuleB"]
   });

   //Act
   Core.ModuleGrouping.stopModuleGroupingAndStartAnotherGrouping("", "GroupB");
   Core.ModuleGrouping.stopModuleGroupingAndStartAnotherGrouping("GroupB", "GroupA");

   //Assert
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupA"), "Module Group A is running");
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupB") === false, "Module Group B is not running");
});

test("Test module switch B to A to B: B running", function () {

   //Arrange
   Core.ModuleGrouping.reset();
   Core.Communication.removeAllListeners();

   Core.ModuleGrouping.registerPreviewEvents("GroupA", "PreviewModuleStart", "GroupA");
   Core.ModuleGrouping.registerGroup({
      name: "GroupA",
      startsModules: ["ModuleA"]
   });
   Core.ModuleGrouping.registerGroup({
      name: "GroupB",
      startsModules: ["ModuleB"]
   });

   //Act
   Core.ModuleGrouping.stopModuleGroupingAndStartAnotherGrouping("", "GroupB");
   Core.ModuleGrouping.stopModuleGroupingAndStartAnotherGrouping("GroupB", "GroupA");
   Core.ModuleGrouping.stopModuleGroupingAndStartAnotherGrouping("GroupA", "GroupB");

   //Assert
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupA") === false, "Module Group A is not running");
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupB"), "Module Group B is running");
});

test("Test module switch A to B->A: A & B running, A only started once", function () {

   //Arrange
   var groupAStartedCount = 0;
   Core.ModuleGrouping.reset();
   Core.Communication.removeAllListeners();

   Core.ModuleGrouping.registerPreviewEvents("GroupA", "PreviewModuleStart", "GroupA");
   Core.ModuleGrouping.registerGroup({
      name: "GroupA",
      startsModules: ["ModuleA"]
   });
   Core.ModuleGrouping.registerGroup({
      name: "GroupB",
      dependsOnModuleGroupings: ["GroupA"],
      startsModules: ["ModuleB"]
   });

   Core.Communication.addListener("PreviewModuleStart", function (groupName) {
      if (groupName !== "GroupA") {
         ok(false, "Incorrect event parameter passed: " + groupName);
      }
      else {
         groupAStartedCount++;
         if (groupAStartedCount > 1) {
            ok(false, "Group A started more than once (" + groupAStartedCount + " times)");
         }
      }
   });

   //Act
   Core.ModuleGrouping.stopModuleGroupingAndStartAnotherGrouping("", "GroupA");
   Core.ModuleGrouping.stopModuleGroupingAndStartAnotherGrouping("GroupA", "GroupB");

   //Assert
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupA"), "Module Group A is running");
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupB"), "Module Group B is running");
   ok(groupAStartedCount === 1, "Group A only started once");
});

test("Test module switch B->A to A: A running, B stopped, A only started once", function () {

   //Arrange
   var groupAStartedCount = 0;
   Core.ModuleGrouping.reset();
   Core.Communication.removeAllListeners();

   Core.ModuleGrouping.registerPreviewEvents("GroupA", "PreviewModuleStart", "GroupA");
   Core.ModuleGrouping.registerGroup({
      name: "GroupA",
      startsModules: ["ModuleA"]
   });
   Core.ModuleGrouping.registerGroup({
      name: "GroupB",
      dependsOnModuleGroupings: ["GroupA"],
      startsModules: ["ModuleB"]
   });

   Core.Communication.addListener("PreviewModuleStart", function (groupName) {
      if (groupName !== "GroupA") {
         ok(false, "Incorrect event parameter passed: " + groupName);
      }
      else {
         groupAStartedCount++;
         if (groupAStartedCount > 1) {
            ok(false, "Group A started more than once (" + groupAStartedCount + " times)");
         }
      }
   });

   //Act
   Core.ModuleGrouping.stopModuleGroupingAndStartAnotherGrouping("", "GroupB");
   Core.ModuleGrouping.stopModuleGroupingAndStartAnotherGrouping("GroupB", "GroupA");

   //Assert
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupA"), "Module Group A is running");
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupB") == false, "Module Group B is not running");
   ok(groupAStartedCount === 1, "Group A only started once");
});

test("Test module switch B->A to C->A: stop B no stop A", function () {

   var groupAStartedCount = 0;

   //Arrange
   Core.ModuleGrouping.reset();
   Core.Communication.removeAllListeners();

   Core.ModuleGrouping.registerPreviewEvents("GroupA", "PreviewModuleStart", "GroupA");
   Core.ModuleGrouping.registerGroup({
      name: "GroupA",
      startsModules: ["ModuleA"]
   });
   Core.ModuleGrouping.registerGroup({
      name: "GroupB",
      dependsOnModuleGroupings: ["GroupA"],
      startsModules: ["ModuleB"]
   });
   Core.ModuleGrouping.registerGroup({
      name: "GroupC",
      dependsOnModuleGroupings: ["GroupA"],
      startsModules: ["ModuleC"]
   });

   Core.Communication.addListener("PreviewModuleStart", function (groupName) {
      if (groupName !== "GroupA") {
         ok(false, "Incorrect event parameter passed: " + groupName);
      }
      else {
         groupAStartedCount++;
         if (groupAStartedCount > 1) {
            ok(false, "Group A started more than once (" + groupAStartedCount + " times)");
         }
      }
   });

   //Act
   Core.ModuleGrouping.start("GroupB");
   Core.ModuleGrouping.stopModuleGroupingAndStartAnotherGrouping("GroupB", "GroupC");

   //Assert
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupA"), "Module Group A is running");
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupB") === false, "Module Group B is not running");
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupC"), "Module Group C is running");

   ok(groupAStartedCount === 1, "Group A started once only");
});

test("Test module switch B->A to C->B->A: no stop all running", function () {

   //Arrange
   Core.ModuleGrouping.reset();
   Core.Communication.removeAllListeners();

   Core.ModuleGrouping.registerPreviewEvents("GroupA", "PreviewModuleStart", "GroupA");
   Core.ModuleGrouping.registerGroup({
      name: "GroupA",
      startsModules: ["ModuleA"]
   });
   Core.ModuleGrouping.registerGroup({
      name: "GroupB",
      dependsOnModuleGroupings: ["GroupA"],
      startsModules: ["ModuleB"]
   });
   Core.ModuleGrouping.registerGroup({
      name: "GroupC",
      dependsOnModuleGroupings: ["GroupB"],
      startsModules: ["ModuleC"]
   });

   //Act
   Core.ModuleGrouping.start("GroupB");
   Core.ModuleGrouping.stopModuleGroupingAndStartAnotherGrouping("GroupB", "GroupC");

   //Assert
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupA"), "Module Group A is running");
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupB"), "Module Group B is running");
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupC"), "Module Group C is running");
});

test("Test module switch D-A to C->B->A: stop D", function () {

   //Arrange
   Core.ModuleGrouping.reset();
   Core.Communication.removeAllListeners();

   Core.ModuleGrouping.registerPreviewEvents("GroupA", "PreviewModuleStart", "GroupA");
   Core.ModuleGrouping.registerGroup({
      name: "GroupA",
      startsModules: ["ModuleA"]
   });
   Core.ModuleGrouping.registerGroup({
      name: "GroupB",
      dependsOnModuleGroupings: ["GroupA"],
      startsModules: ["ModuleB"]
   });
   Core.ModuleGrouping.registerGroup({
      name: "GroupC",
      dependsOnModuleGroupings: ["GroupB"],
      startsModules: ["ModuleC"]
   });
   Core.ModuleGrouping.registerGroup({
      name: "GroupD",
      dependsOnModuleGroupings: ["GroupA"],
      startsModules: []
   });

   //Act
   Core.ModuleGrouping.start("GroupD");
   Core.ModuleGrouping.stopModuleGroupingAndStartAnotherGrouping("GroupD", "GroupC");

   //Assert
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupA"), "Module Group A is running");
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupB"), "Module Group B is running");
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupC"), "Module Group C is running");
   ok(Core.ModuleGrouping.isModuleGroupRunning("GroupD") === false, "Module Group D is not running");
});
