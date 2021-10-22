const fs = require('fs')
const parse = require('@babel/parser')

const input = fs.readFileSync('../src/index.js', 'utf8')
const output = parse.parse(input, {
  sourceType: 'module'
})
console.log(input)
console.log(JSON.stringify(output, null, 2))
