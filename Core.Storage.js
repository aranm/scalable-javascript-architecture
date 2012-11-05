(function () {
   var coreStorage = function () {
      var fallbackStorage = { },
         isLocalStorageSupported = (function() {
            var isSupported;
            try {
               isSupported = 'localStorage' in window && window['localStorage'] !== null;
            }
            catch(e) {
               isSupported = false;
            }
            return isSupported;
         })(),
         storage,
         setItem = function(key, value) {
            storage[key] = value;
         },
         getItem = function(key) {
            var item = storage[key];
            if (item === undefined) {
               //localStorage returns null, not undefined if an item does not exist
               //so do the same if using the fallback
               item = null;
            }
            return item;
         },
         setObject = function(itemKey, value) {
            storage[itemKey] = JSON.stringify(value);
         },
         getObject = function(key) {
            var item = JSON.parse(getItem(key));
            if (item === undefined) {
               //localStorage returns null, not undefined if an item does not exist
               //so do the same if using the fallback
               item = null;
            }
            return item;
         },
         removeItem = function(key) {
            if (storage === fallbackStorage) {
               delete storage[key];
            }
            else {
               storage.removeItem(key);
            }
         },
         clear = function() {
            if (storage === fallbackStorage) {
               fallbackStorage = { };
               storage = fallbackStorage;
            }
            else {
               storage.clear();
            }
         };
      
      if (isLocalStorageSupported === true) {
         storage = localStorage;
      }
      else {
         storage = fallbackStorage;
      }

      return {
         storageHasNativeSupport: isLocalStorageSupported,
         setItem: setItem,
         getItem: getItem,
         setObject: setObject,
         getObject: getObject,
         removeItem: removeItem,
         clear: clear
      };
   };

   if (typeof define === "function" && define.amd) {
      define("Core.Storage", ["Core"], function (core) {
         core.Storage = coreStorage();
         return core.Storage;
      });
   }
   else {
      //we are going to attach this to the global Core object
      Core.Storage = coreStorage();
   }
})();