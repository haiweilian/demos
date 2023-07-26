const express = require("express");
const app = express();

app.use(express.static(__dirname + "/public"));

app.get("/api", function (req, res) {
  res.send("hello world");
});

app.post("/api/json", function (req, res) {
  res.send({ hello: "world" });
});

app.listen(3000, function () {
  console.log("listen at 3000");
});
