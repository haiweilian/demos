let { Duplex } = require("stream");

// 双工流可读可写
class MyDuplex extends Duplex {
  constructor(options) {
    super(options);
    this.data = [];
  }

  _read() {
    this.push(this.data.shift() || null);
  }

  _write(chunk, encoding, callback) {
    console.log("write", chunk.toString());
    this.data.push(chunk);
    callback();
  }
}

const myDuplex = new MyDuplex();
myDuplex.on("data", (chunk) => {
  console.log("read", chunk.toString());
});
myDuplex.write("hello");
myDuplex.write("world");
myDuplex.end();
