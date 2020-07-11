# iframe跨域通信方式

## 下载

npm install

## iframe 代理方式

node proxyIframe/a.com/app.js // http://localhost:8000

node proxyIframe/b.com/app.js // http://localhost:9000

## postMessage 方式

node postMessage/a.com/app.js // http://localhost:8000

node postMessage/b.com/app.js // http://localhost:9000

## 测试文档

https://www.cnblogs.com/happy-8090/p/11570998.html