(function(graph){
      function require(module){
          // 处理依赖默认 如 ./a.js 对应的 应该是 ./src/a.js
          function pathRequire(realtivePath){
            return require(graph[module].yilai[realtivePath])
          }
          var exports = {};
          (function(require,exports,code){
            eval(code)
          })(pathRequire,exports,graph[module].code)
        return exports;
      }
      // 默认加载入口文件
      require('./src/index.js')
    })({
  "./src/index.js": {
    "yilai": {
      "./a.js": "./src/a.js",
      "./b.js": "./src/b.js"
    },
    "code": "\"use strict\";\n\nvar _a = _interopRequireDefault(require(\"./a.js\"));\n\nvar _b = _interopRequireDefault(require(\"./b.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log(\"\\u51CF=\".concat(_a[\"default\"], \"-----\\u52A0=\").concat(_b[\"default\"]));"
  },
  "./src/a.js": {
    "yilai": {
      "./sum/sum.js": "./src/sum/sum.js"
    },
    "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _sum = _interopRequireDefault(require(\"./sum/sum.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nvar _default = _sum[\"default\"].x - _sum[\"default\"].y;\n\nexports[\"default\"] = _default;"
  },
  "./src/b.js": {
    "yilai": {
      "./sum/sum.js": "./src/sum/sum.js"
    },
    "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _sum = _interopRequireDefault(require(\"./sum/sum.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nvar _default = _sum[\"default\"].x + _sum[\"default\"].y;\n\nexports[\"default\"] = _default;"
  },
  "./src/sum/sum.js": {
    "yilai": {},
    "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\nvar _default = {\n  x: 100,\n  y: 100\n};\nexports[\"default\"] = _default;"
  }
})