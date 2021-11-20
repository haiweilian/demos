// 宏任务：setTimeout、setInterval、setImmediate、script（整体代码）、 I/O 操作、UI 渲染等。
// 微任务：process.nextTick、new Promise().then(回调)、MutationObserver(html5 新特性) 等。

Promise.resolve().then(()=>{
  console.log('Promise1')
  setTimeout(()=>{
    console.log('setTimeout2')
  },0)
})

setTimeout(()=>{
  console.log('setTimeout1')
  Promise.resolve().then(()=>{
    console.log('Promise2')
  })
},0)
