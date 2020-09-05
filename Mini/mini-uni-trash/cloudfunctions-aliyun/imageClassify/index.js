"use strict";
exports.main = async (event, context) => {
  // https://ai.baidu.com/ai-doc/REFERENCE/Ck3dwjhhu
  // https://cloud.baidu.com/doc/IMAGERECOGNITION/s/Xk3bcxe21
  // Access Token：先通过自己申请的 AppId 和 Secret 去鉴权认证获取 AccessToken。在 “控制台” 侧栏选择 “图像识别” 创建应用。
  
  // 请求连接，请换成自己的应用。
  const APIKey = "LexhucAcG0RU3EB2Cn0P6WOH";
  const SecretKey = "lEU4G9iDjIll5WeYgM9R76WhfjqGLEGM";
  const TokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${APIKey}&client_secret=${SecretKey}`;

  // 获取 access_token
  const res = await uniCloud.httpclient.request(TokenUrl, {
    dataType: "json",
  });
  const access_token = res.data.access_token;

  // 请求图片识别
  const classifyUrl = "https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general";
  const classify_res = await uniCloud.httpclient.request(classifyUrl, {
    method: "POST",
    dataType: "json",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: {
      access_token: access_token,
      image: event.image,
    },
  });

  // 返回客户端结果
  return classify_res.data;
};
