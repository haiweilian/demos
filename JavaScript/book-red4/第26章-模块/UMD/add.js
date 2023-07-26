(function (global, factory) {
  if (typeof exports === "object" && typeof module !== undefined) {
    // cjs
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    // amd
    define(factory);
  } else {
    // global
    global = typeof globalThis !== "undefined" ? globalThis : global || self;
    global.add = factory();
  }
})(this, function () {
  return function add(a, b) {
    return a + b;
  };
});
