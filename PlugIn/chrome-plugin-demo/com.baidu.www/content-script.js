(function () {
  console.log("这是 chrome-plugin-demo 的 content-script！");
})();

/**
 * 注入脚本
 * @param {String} jsPath 路径
 */
function injectScript(jsPath) {
  var temp = document.createElement("script");
  temp.setAttribute("type", "text/javascript");
  temp.src = chrome.extension.getURL(jsPath);
  document.head.appendChild(temp);
}

/**
 * 开始注入
 */
// === 包含 jquery 的网站不需要
// injectScript("utils/jquery.min.js");

// === 交互功能入口
injectScript("com.baidu.www/inject-script.js");
