const fs = require('fs')
const core = require('@babel/core')

const input = fs.readFileSync('../src/index.js', 'utf8')
const output = core.transform(input, {
  sourceType: 'module',
  ast: true,
  sourceMaps: 'both'
}, function (err, result) {
  console.log(result)
})
