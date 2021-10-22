"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.promise.js");

require("core-js/modules/es.promise.finally.js");

const add = (n, m) => n + m;

[1, 3].includes(3);
Promise.resolve().finally();
var _default = add;
exports.default = _default;