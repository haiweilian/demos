let Notification = function (options = {}) {
  let instance = new Object()
  instance.type = options.type
  instance.message = `消息类型-${options.message}`
  instance.visible = true
  return instance
}

const n = Notification({
  type: "success",
  message: "success",
})
console.log(n.message) // 消息类型-success

const m = Notification({
  type: "error",
  message: "error",
})
console.log(m.message) // 消息类型-error
