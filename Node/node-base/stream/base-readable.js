// 底层可读流
const { Readable } = require("stream");

// 继承 Readable 类
class MyReadable extends Readable {
  constructor(options) {
    super(options);
    this.index = 0;
  }

  // 重写 _read 方法，用于被流内部调用。
  _read() {
    setTimeout(() => { // 模拟异步
      // 当index为3时，停止推送数据，触发end事件
      if (this.index === 3) {
        this.push(null); // 通知读取端数据结束
      } else {
        // 否则推送数据
        this.push(Buffer.from("a" + this.index));
      }
      this.index++;
    }, 1000);
  }
}

const myReadable = new MyReadable();
myReadable.on("data", (chunk) => {
  console.log(chunk.toString());
});
myReadable.on("end", () => {
  console.log("end");
});
myReadable.on("error", (err) => {
  console.log(err);
});
