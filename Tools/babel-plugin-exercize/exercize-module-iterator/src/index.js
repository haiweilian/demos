const traverseModule = require('./traverseModule');
const path = require('path');

// 入口开始遍历
const dependencyGraph = traverseModule(path.resolve(__dirname, '../test-project/index.js'));
console.log(JSON.stringify(dependencyGraph, null, 4));
