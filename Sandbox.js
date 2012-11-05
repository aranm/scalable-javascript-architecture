var Sandbox = function (core, moduleId) {

   return {

      notify: function () {
         return core.Communication.notify.apply(core.Communication, arguments);
      },

      addListener: function (topic, callback, context) {
         core.Communication.addListener(topic, callback, context);
      },

      removeListener: function (topic, callback) {
         core.Communication.removeListener(topic, callback);
      },

      removeAllListeners: function (context) {
         core.Communication.removeAllListenersForContext(context);
      },

      //   requestData = {
      //      name: urlMapping
      //      data: data to send to the server - optional
      //      context: callback context - optional
      //      success: callback function (response) - optional
      //      failure: callback function (error message) - optional
      //   }
      request: function (data) {
         core.Ajax.request(data, moduleId);
      },

      cancelRequests: function () {
         core.Ajax.cancelRequests(moduleId);
      },

      bind: function (viewModel) {
         return core.DataBinding.applyBinding(moduleId, viewModel);
      },

      unbind: function () {
         return core.DataBinding.removeBinding(moduleId);
      },

      getObservable: function () {
         return core.Observable.getObservable();
      },

      getDomManipulation: function () {
         return core.DomManipulation.getDom();
      },

      getPageSpecificData: function () {
         return core.PageData.getPageData(moduleId);
      },

      startModuleGroup: function (moduleGroupName) {
         core.ModuleGrouping.start(moduleGroupName);
      },

      stopModuleGroup: function (moduleGroupName) {
         core.ModuleGrouping.stop(moduleGroupName);
      },

      openDialog: function (dialogClosedCallback) {
         core.DomManipulation.openDialog(moduleId, dialogClosedCallback);
      },

      closeDialog: function () {
         core.DomManipulation.closeDialog(moduleId);
      },

      updateAddress: function (parameter, value) {
         core.Address.updateAddress(parameter, value);
      },

      updateAddressParameters: function (parameterArray) {
         core.Address.updateAddressParameters(parameterArray);
      },
      removeAddressParameter: function (parameterArray) {
         core.Address.removeAddressParameter(parameterArray);
      },
      removeAddressComponent: function (parameter) {
         core.Address.removeAddressComponent(parameter);
      },

      createUrl: function (parameter, value) {
         return core.Address.createUrl(parameter, value);
      },

      createUrlFromParameterArray: function (parameterArray, addParametersToCurrentUrl) {
         return core.Address.createUrlFromParameterArray(parameterArray, addParametersToCurrentUrl);
      },

      activateControl: function (controlId) {
         core.Controls.activate(controlId);
      },

      createUrlForFileDownload: function (flatParameterArray) {
         return core.Address.createUrlForFileDownload(flatParameterArray);
      },

      destroyControl: function (controlId) {
         core.Controls.destroy(controlId);
      },

      sendControlMessage: function (controlId, message, parameters) {
         core.Controls.sendMessage(controlId, { name: message, parameters: parameters });
      },

      sendControlMessages: function (controlId, messages) {
         core.Controls.sendMessage(controlId, messages);
      },

      setDocumentTitle: function (newTitle) {
         core.DomManipulation.setDocumentTitle(newTitle);
      },

      consoleLog: function (message) {
         core.Error.consoleLog(message);
      },

      getSingleton: function (singletonId) {
         return core.Singleton.getSingleton(singletonId);
      },
      
      storageHasNativeSupport: core.Storage.hasNativeSupport,
      storageSetItem: core.Storage.setItem,
      storageGetItem: core.Storage.getItem,
      storageSetObject: core.Storage.setObject,
      storageGetObject: core.Storage.getObject,
      storageRemoveItem: core.Storage.removeItem,
      storageClear: core.Storage.clear
   };
};
