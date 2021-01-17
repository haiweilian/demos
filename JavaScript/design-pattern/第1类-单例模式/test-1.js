function getSingle() {
  let result
  return function (name) {
    return result || (result = name)
  }
}

let single = getSingle()
console.log(single("嘻嘻")) // 嘻嘻
console.log(single("哈哈")) // 嘻嘻
console.log(single("嘤嘤")) // 嘻嘻
