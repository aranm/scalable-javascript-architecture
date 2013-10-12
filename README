Scalable Javascript Architecture

What is this for?

Basically this is an architectural framework that allows modularisation of javascript code. It also encapsulates your base library of choice in order to provide an abstraction, this allows (in certain scenarios) less dependence on the library.

How do I use it?

The library lets you define modules:

```
Core.register("ModuleA", function (sandbox) {
   return {
      activate: function () {
      },
      destroy: function () {
      }
   };
});
```

Start modules:

```javascript
Core.start("ModuleA");
```
or
```javascript
Core.startAll();
```
Stop modules:
```javascript
Core.stop("ModuleA");
```
or
```javascript
Core.stopAll();
```
Define module groupings:
```javascript
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

Core.ModuleGrouping.registerGroup({
   name: "MyModuleGrouping",
   startsModules: ["ModuleA, ModuleB"]
});
```
Start and stop module groupings:

```javascript
Core.ModuleGrouping.start("MyModuleGrouping");
```

Define module groupings that depend on other module groupings:
```javascript
Core.register("ModuleC", function (sandbox) {
   return {
      activate: function () {
      },
      destroy: function () {
      }
   };
});

Core.ModuleGrouping.registerGroup({
   name: "MyNextModuleGrouping",
   dependsOnModuleGroupings: ["MyModuleGrouping"],
   startsModules: ["ModuleC"]
});
```
