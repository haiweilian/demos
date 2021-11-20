import url from "url";

// 处理 url 地址
const u = new url.URL("https://example.org?a=1&b=1");
console.log(u);

const p = new url.URLSearchParams("https://example.org?a=1&b=1");
console.log(p);

// 这两个对象浏览器已经实现，v8 也同样可用
const ub = new URL("https://example.org?a=1&b=1");
console.log(ub); // url 对象

const pb = new URLSearchParams("https://example.org?a=1&b=1");
console.log(pb);
