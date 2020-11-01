$(function () {
  console.log("这是 chrome-plugin-demo 的 inject-script！");
});

/**
 * 请求测试
 */
$(function () {
  $.get(
    "https://www.baidu.com/sugrec?pre=1&p=3&ie=utf-8&json=1&prod=pc&from=pc_web&sugsid=32813,1451,32872,32945,32974,32705,7516,32115&wd=chorm&req=2&csor=5&pwd=chor&cb=jQuery110206297606421234465_1604222041935&_=1604222041942",
    function (data) {
      console.log(data);
    }
  );
});
