const fs = require("fs");
const { pipeline } = require("stream");

// 创建可写流
const w = fs.createWriteStream("./fs-stream-write.txt");

// 创建可读流
const r = fs.createReadStream("./fs-stream.txt");
// r.on("data", (data) => {
//   console.log(data.toString());
//   w.write(data);
// });

// 管道流
pipeline(r, w, (err) => {
  if (err) {
    console.log(err);
  }
});
