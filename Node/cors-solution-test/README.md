跨域-四层解决方案测试

## 启动静态服务

开启静态服务 3000 端口，代表正常的静态页面服务。

```sh
npm install
```

```sh
node app.js
```

## 第一层--简单跨域请求

开启接口服务 4001 端口

```sh
node cors-base/api.js
```

访问页面

```sh
http://localhost:3000/cors-base.html
```

响应简单请求: 动词为 get/post/head，没有自定义请求头，Content-Type 是 application/x-wwwform-urlencoded，multipart/form-data 或 text/plain 之一，通过添加以下响应头解决：

```js
// // 可以把 * 写成具体的配置
res.setHeader("Access-Control-Allow-Origin", "*");
```

## 第二层--复杂跨域请求

<https://www.jianshu.com/p/b55086cbd9af>(预检请求和复杂请求)

以上请求案例添加一个 `x-token` 变成复杂请求

开启接口服务 4002 端口

```sh
node cors-token/api.js
```

访问页面

```sh
http://localhost:3000/cors-token.html
```

响应 preflight 请求，需要响应浏览器发出的 options 请求（预检请求），并根据情况设置响应头

```js
if (method == "OPTIONS") {
  // 可以把 * 写成具体的配置
  res.writeHead(200, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  });
  res.end();
}
```

## 第三层--复杂跨域请求携带 cookie

接着上面。添加 axios 配置

```js
axios.defaults.withCredentials = true;
// 随便设置一个 cookie
document.cookie = "miyao=xxxxxx";
```

开启接口服务 4003 端口

```sh
node cors-credential/api.js
```

访问页面

```sh
http://localhost:3000/cors-credential.html
```

如果要携带 cookie 信息，则请求变为 credential 请求。如果开启，上面的配置跨域的 header 都不能设置为 \* 号。需要设置为具体的值。

请求里改为

```js
res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
res.setHeader("Access-Control-Allow-Credentials", "true");
```

OPTIONS 里改为

```js
res.writeHead(200, {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Headers": "X-Token,Content-Type",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Credentials": "true",
});
res.end();
```

## 第四层--Proxy 代理模式

代理功能 `http-proxy-middleware`、`nginx`、`...`
