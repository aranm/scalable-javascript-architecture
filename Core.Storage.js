/*globals define, Core, window, localStorage*/
(function () {
   var coreStorage = function () {
      var storage,
         fallbackStorage = {},
         keysLoaded = false,
         allKeysString = "allKeys",
         allKeys = [],
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
         rebuildKeyIndex = function () {
            var key;
            
            //first set all keys to a new array
            allKeys = [];
            
            //iterate all keys 
            for (key in storage) {
               allKeys.push(key);
            }
            
            //finally store the keys in local storage again
            storage[allKeysString] = JSON.stringify(allKeys);
         },
         loadKeys = function () {
            if (keysLoaded === false) {
               var storedKeys = getObject(allKeysString);
               
               if (storedKeys === null) {
                  allKeys = [];
               }
               else if (Object.prototype.toString.call(storedKeys) !== '[object Array]') {
                  //we are in trouble here, the stored keys string is not an array
                  //we need to rebuild the index
                  rebuildKeyIndex();
               }
               else {
                  allKeys = storedKeys;
               }
               keysLoaded = true;
            }
         },
         getKeys = function () {
            return allKeys.slice(0);
         },
         findKeys = function (regularExpressionString) {
            var i,
                arrayLength = allKeys.length,
                returnValue = [],
                re = new RegExp(regularExpressionString, "g"),
                key;
            
            for (i = 0; i < arrayLength; i++) {
               key = allKeys[i];
               if (re.test(key) === true) {
                  returnValue.push(key);
               }
            }

            return returnValue;
         },
         setItem = function(key, value) {
            try {
               //we store all keys that are being used so we do not have to iterate them
               //from local storage (which is slow)
               if (allKeys.indexOf(key) === -1) {
                  allKeys.push(key);
                  storage[allKeysString] = JSON.stringify(allKeys);
               }
               storage[key] = value;
            }
            catch (err) {
               //we have run out of room, clear it all
               clear();
            }
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
         setObject = function (key, value) {
            setItem(key, JSON.stringify(value));
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
         removeItem = function (key) {
            var indexOfKey = allKeys.indexOf(key);
            
            if (indexOfKey !== -1) {
               //remove the item from storage
               if (storage === fallbackStorage) {
                  delete storage[key];
               }
               else {
                  storage.removeItem(key);
               }
               
               //remove the key from the keys array
               allKeys.splice(indexOfKey, 1);
               
               //store the key array minus the removed item
               storage[allKeysString] = JSON.stringify(allKeys);
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
            //clear the key array as well
            allKeys = [];
         };
      
      if (isLocalStorageSupported === true) {
         storage = localStorage;
      }
      else {
         //if local storage is not supported, fallback to an in memory storage object
         storage = fallbackStorage;
      }
      
      //do the initial load of the keys
      loadKeys();

      return {
         storageHasNativeSupport: isLocalStorageSupported,
         setItem: setItem,
         getItem: getItem,
         setObject: setObject,
         getObject: getObject,
         removeItem: removeItem,
         findKeys: findKeys,
         getKeys: getKeys,
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