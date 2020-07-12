const http = require("http");

const app = http.createServer((req, res) => {
  const { method, url } = req;
  if (method === "GET" && url === "/api/user") {
    console.log("get ... x-token", req.headers["x-token"]);
    console.log("get ... cookie", req.headers["cookie"]);
    // =====
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    // =====
    res.end(
      JSON.stringify({
        name: "lian",
      })
    );
  } else if (method === "POST" && url === "/api/user") {
    console.log("post ... x-token", req.headers["x-token"]);
    console.log("post ... cookie", req.headers["cookie"]);
    // =====
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    // =====
    res.end(
      JSON.stringify({
        msg: "success",
      })
    );
  } else if (method === "OPTIONS") {
    // =====
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Headers": "X-Token,Content-Type",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Credentials": "true",
    });
    res.end();
    // =====
  }
});

app.listen(4003);
