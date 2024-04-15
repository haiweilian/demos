// 底层可写流
const { Writable } = require("stream");

// 继承 Writable 类
class MyReadable extends Writable {
  constructor(options) {
    super(options);
  }

  // 重写 _write 方法，用于被流内部调用。
  _write(chunk, encoding, callback) {
    setTimeout(() => {
      // 模拟异步
      console.log(chunk.toString());
      callback(); // 写入成功后的回调
      // callback(new Error('')); // 写入失败后的回调
    }, 1000);
  }
}

const myWritable = new MyReadable();
myWritable.write("hello"); // 写入流数据
myWritable.write(Buffer.from("world")); // 写入流数据
myWritable.end(); // 结束
myWritable.on("finish", () => {
  console.log("写入完成");
});
myWritable.on("error", (err) => {
  console.log("写入失败", err);
});
myWritable.on("close", () => {
  console.log("写入关闭");
});
