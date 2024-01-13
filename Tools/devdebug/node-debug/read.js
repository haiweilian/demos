const fs = require("fs/promises");

(async function () {
  const fileContent = await fs.readFile("./package.json", {
    encoding: "utf-8",
  });
  console.log(2222)
  await fs.writeFile("./package2.json", fileContent);
})();
