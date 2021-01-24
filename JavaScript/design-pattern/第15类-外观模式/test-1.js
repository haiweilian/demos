function start() {
  console.log("start")
}

function doing() {
  console.log("doing")
}

function end() {
  console.log("end")
}

// 外观函数，将一些处理统一起来，方便调用。
function execute() {
  start()
  doing()
  end()
}

// 此处直接调用了高层函数。
execute()
