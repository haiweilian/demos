// 顺序不定，看
setTimeout(function timeout () {
  console.log('timeout');
},0);

setImmediate(function immediate () {
  console.log('immediate');
});

const fs = require('fs')

fs.readFile('readme.md', () => {
  // 在 io 中 setImmediate 永远先执行，因为 io 的回调实在 poll 执行的，poll 执行完会先执行 check 阶段
  setTimeout(function timeout () {
    console.log('timeout');
  },0);

  setImmediate(function immediate () {
    console.log('immediate');
  });

  Promise.resolve().then(()=>{
    console.log('Promise1')
  })

  process.nextTick(() => {
    console.log('nextTick')
    process.nextTick(() => {
      console.log('nextTick')
    })
  })
})

// 每个阶段完成后，都会先执行 process.nextTick 队列
process.nextTick(() => {
  console.log('nextTick')
})

Promise.resolve().then(()=>{
  console.log('Promise1')
})
