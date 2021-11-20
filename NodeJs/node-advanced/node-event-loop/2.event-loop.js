console.log('start')

setTimeout(() => {
  console.log('timer1')
  Promise.resolve().then(function() {
    console.log('promise1')
  })
}, 0)

setTimeout(() => {
  console.log('timer2')
  Promise.resolve().then(function() {
    console.log('promise2')
  })
}, 0)

Promise.resolve().then(function() {
  console.log('promise3')
})

console.log('end')

// 执行同步代码  start end
// 执行微任务  promise3
// 执行宏任务 timer1， 加入微任务队列执行 promise1
// 执行宏任务 timer2， 加入微任务队列执行 promise2
