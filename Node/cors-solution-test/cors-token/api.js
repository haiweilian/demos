const http = require("http");

const app = http.createServer((req, res) => {
  const { method, url } = req;
  if (method === "GET" && url === "/api/user") {
    console.log("get ... x-token", req.headers["x-token"]);
    // =====
    res.setHeader("Access-Control-Allow-Origin", "*");
    // =====
    res.end(
      JSON.stringify({
        name: "lian",
      })
    );
  } else if (method === "POST" && url === "/api/user") {
    console.log("post ... x-token", req.headers["x-token"]);
    // =====
    res.setHeader("Access-Control-Allow-Origin", "*");
    // =====
    res.end(
      JSON.stringify({
        msg: "success",
      })
    );
  } else if (method === "OPTIONS") {
    // =====
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
    });
    res.end();
    // =====
  }
});

app.listen(4002);
