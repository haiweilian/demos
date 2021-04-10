import logo from "./logo.jpg";
document.body.insertAdjacentHTML("beforeBegin", "<h1>Webpack</h1>");
document.body.insertAdjacentHTML("beforeBegin", `<img src="${logo}"/>`);

console.log("module.js");
