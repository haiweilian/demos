#!/usr/bin/env node

const express = require('express')
const { vueMiddleware } = require('../middleware')

const app = express()
const root = process.cwd();

// 使用中间件
app.use(vueMiddleware())

// 根目录作为静态资源
app.use(express.static(root))

app.listen(3000, () => {
  console.log('server running at http://localhost:3000')
})
