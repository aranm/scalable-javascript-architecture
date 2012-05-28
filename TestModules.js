Core.register("Name-Module", function (sandbox) {

   var ko = sandbox.getObservable();

   var NameModel = function (first, last) {
      this.firstName = ko.observable(first);
      this.lastName = ko.observable(last);

      this.fullName = ko.computed(function () {
         // Knockout tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
         return this.firstName() + " " + this.lastName();
      }, this);
   };

   var nameModel;

   return {
      activate: function () {

         nameModel = new NameModel("", "");
         sandbox.bind(nameModel);

         sandbox.addListener("Name", function (firstName, lastName) {
            nameModel.firstName(firstName);
            nameModel.lastName(lastName);
         }, this);
      },
      destroy: function () {

      }
   };
});


Core.register("NextStudentButton-Module", function (sandbox) {

   var NextButtonViewModel = function () {
      this.next = function () {
         sandbox.notify("GetNextName");
      };
   };

   return {
      activate: function () {
         sandbox.bind(new NextButtonViewModel());
      },
      destroy: function () {

      }
   };
});


Core.register("Name-DataStore-Module", function (sandbox) {

   var allNames = [
      ["Aran", "Mulholland"],
      ["Jim", "Taylor"],
      ["Bob", "Snoet"],
      ["Joe", "Hillman"]
   ];

   var currentIndexer = -1;

   return {
      activate: function () {
         //sandbox.notify("Name", allNames[currentIndexer][0], allNames[currentIndexer][1]);
         sandbox.addListener("GetNextName", function () {
            currentIndexer = currentIndexer + 1;
            if (currentIndexer >= allNames.length) {
               currentIndexer = 0;
            }
            sandbox.notify("Name", allNames[currentIndexer][0], allNames[currentIndexer][1]);
         }, this);

         sandbox.addListener("NamesLoaded", function (arrayOfNames) {
            for (var i = 0, length = arrayOfNames.length; i < length; i++) {
               allNames.push(arrayOfNames[i]);
            }

         }, this);

      },
      destroy: function () {
         sandbox.removeAllListeners(this);
      }
   };
});

Core.register("Name-GetDataFromLibrary-Module", function (sandbox) {
   return {
      activate: function () {
         //fire the ajax request

         var data = {
            id: 1
         };

         sandbox.request({ 
               name: "getNames",
               data: data,
               success: function (response) {
                  sandbox.notify("NamesLoaded", response);
               },
               failure: function (response) {


               }
            });
      },
      destroy: function () {
         sandbox.removeAllListeners(this);
      }
   };
});


Core.register("Error-Throwing-Module", function (sandbox) {

   var viewModel = {
      throwAnError: function () {
         throw new Error("Im an Error");
      }
   };

   return {
      activate: function () {
         sandbox.bind(viewModel);
      },
      destroy: function () {
         sandbox.removeAllListeners(this);
      }
   };
});