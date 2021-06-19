let p = new Promise((resolve, reject) => {
  resolve(1)
})

p.then(result => {
  return new Promise((resolve, reject) => {
    resolve(2)
  })
}).then(result => {
  console.log(result)
})
