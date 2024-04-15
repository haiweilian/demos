const { Transform } = require("stream");

class MyTransform extends Transform {
  constructor(options) {
    super(options);
  }

  // _transform() 实现处理正在写入的字节，计算输出，然后使用 transform.push() 方法将该输出传递给可读部分。
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}

const myTransform = new MyTransform();
myTransform.write("hello");
myTransform.write("world");
myTransform.end();
myTransform.on("data", (data) => {
  console.log(data.toString());
});
