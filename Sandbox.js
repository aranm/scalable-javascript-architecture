var Sandbox = function (core, moduleId) {
   var getPageSpecificData = function () {
      return core.PageData.getPageData(moduleId);
   };
   var defaults = {      
        DROPDOWN_FIRST_SELECT_OPTION: ''
   };
   return {
      getPageSpecificData:getPageSpecificData,
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
    
      request: function(data) {
         core.Ajax.request(data, moduleId);
      },
      getRequestQueue:function() {
          return core.Ajax.getRequestQueue();
      },
      // called from authentication error module before resending requests
      clearRequestQueue:function() {
          core.Ajax.clearRequestQueue();
      },
 
      attachRequestHeader: function(key, value) {
         core.Ajax.attachRequestHeader(key, value);
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

    

      startModuleGroup: function (moduleGroupName) {
         core.ModuleGrouping.start(moduleGroupName);
      },

      stopModuleGroup: function (moduleGroupName) {
         core.ModuleGrouping.stop(moduleGroupName);
      },

      openDialog: function (dialogClosedCallback, dialogOpenCallback) {
         core.DomManipulation.openDialog(moduleId, dialogClosedCallback, dialogOpenCallback);
      },

      closeDialog: function () {
         core.DomManipulation.closeDialog(moduleId);
      },

      activateControl: function (controlId) {
         core.Controls.activate(controlId);
      },

      createUrlForFileDownload: function (flatParameterArray) {
         return core.UrlUtilities.createUrlForFileDownload(flatParameterArray);
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
      openPostRequestPage: function (postModel) {
         postModel.params.viewDate = getPageSpecificData().currentViewDate,
         core.OpenPostRequestPage.requestPage(postModel);
      },
      storageHasNativeSupport: core.Storage.hasNativeSupport,
      storageSetItem: core.Storage.setItem,
      storageGetItem: core.Storage.getItem,
      storageSetObject: core.Storage.setObject,
      storageGetObject: core.Storage.getObject,
      storageRemoveItem: core.Storage.removeItem,
      storageClear: core.Storage.clear,
      storageFindKeys: core.Storage.findKeys,
      storageGetKeys: core.Storage.getKeys,
      defaults:defaults
   };
};
