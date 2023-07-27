// promise
import fs from "fs";

fs.promises.readFile("./file.txt").then((txt) => {
  console.log(txt.toString());
});

fs.readFile("./file.txt", (err, txt) => {
  console.log(txt.toString());
});

console.log(fs.readFileSync("./file.txt").toString());
