function each(obj, cb) {
  if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; ++i) {
      cb.call(obj[i], i, obj[i])
    }
  } else {
    for (var i in obj) {
      cb.call(obj[i], i, obj[i])
    }
  }
}

each([1, 2, 3], function (index, value) {
  console.log(index, value)
})
// 0 1
// 1 2
// 2 3

each({ a: 1, b: 2 }, function (index, value) {
  console.log(index, value)
})

// a 1
// b 2
