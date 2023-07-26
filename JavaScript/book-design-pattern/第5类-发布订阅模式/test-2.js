class Event {
  constructor() {
    this.callbacks = {}
  }

  // 解绑
  off(name) {
    this.callbacks[name] = null
  }

  // 订阅
  on(name, fn) {
    ;(this.callbacks[name] || (this.callbacks[name] = [])).push(fn)
  }

  // 发布
  emit(name, args) {
    let cbs = this.callbacks[name]
    if (cbs) {
      cbs.forEach((cb) => {
        cb.call(this, args)
      })
    }
  }
}

let events = new Event()

// 订阅 do 事件
events.on("do", (doing) => {
  console.log(`正在${doing}...`)
})

// 发布 do 事件
events.emit("do", "学习") // 正在学习...
events.emit("do", "看书") // 正在看书...

// 解绑 do 事件后，不会再通知
events.off("do")
events.emit("do", "学习")
events.emit("do", "看书")
