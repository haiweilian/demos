// 乘积：脑补是一个很复杂的预算
let mult = function () {
  console.log("mult...")
  let a = 1
  for (let i = 0; i < arguments.length; i++) {
    a = a * arguments[i]
  }
  return a
}

// 加和：脑补是一个很复杂的预算
let plus = function () {
  console.log("plus...")
  let a = 1
  for (let i = 0; i < arguments.length; i++) {
    a = a + arguments[i]
  }
  return a
}

// 创建缓存代理的工厂
let createProxyFactory = function (fn) {
  let cache = {}
  return function () {
    // 以参数为 key 把计算结果存起来，如果存在就直接返回
    let args = Array.from(arguments).join(",")
    if (args in cache) {
      return cache[args]
    }
    return (cache[args] = fn.apply(this, arguments))
  }
}

let proxyMult = createProxyFactory(mult)
let proxyPlus = createProxyFactory(plus)
console.log(proxyMult(1, 2, 3, 4, 5))
console.log(proxyMult(1, 2, 3, 4, 5))
console.log(proxyPlus(1, 2, 3, 4, 5))
console.log(proxyPlus(1, 2, 3, 4, 5))
// mult...
// 120
// 120
// plus...
// 16
// 16
