const request = require("request");
setInterval(() => {
  request("http://localhost:3000", function (error, response, body) {
    console.log("body:", body);
  });
}, 1000);
