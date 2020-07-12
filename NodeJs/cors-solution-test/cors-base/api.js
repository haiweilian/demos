const http = require("http");

const app = http.createServer((req, res) => {
  const { method, url } = req;
  if (method === "GET" && url === "/api/user") {
    // =====
    res.setHeader("Access-Control-Allow-Origin", "*");
    // =====
    res.end(
      JSON.stringify({
        name: "lian",
      })
    );
  } else if (method === "POST" && url === "/api/user") {
    // =====
    res.setHeader("Access-Control-Allow-Origin", "*");
    // =====
    res.end(
      JSON.stringify({
        msg: "success",
      })
    );
  }
});

app.listen(4001);
