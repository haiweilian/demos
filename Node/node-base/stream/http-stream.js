const http = require("http");
const fs = require("fs");

const r = fs.createReadStream("./fs-stream.txt");

// POST http://localhost:3000/
// Body {"name": "lian"}
http
  .createServer((req, res) => {
    req.on("data", (chunk) => {
      console.log(chunk.toString());
    });
    r.pipe(res);
  })
  .listen(3000);
