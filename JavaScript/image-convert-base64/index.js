function base64Image(url) {
  return new Promise((resolve, reject) => {
    var image = new Image();
    // 跨域问题
    image.crossOrigin = "Anonymous";
    // 加上时间戳
    image.src = url + "?t=" + Date.now();

    image.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, image.width, image.height);
      var ext = image.src.substring(image.src.lastIndexOf(".") + 1).toLowerCase();
      var dataURL = canvas.toDataURL("image/" + ext);
      resolve(dataURL);
    };

    image.onerror = function (err) {
      reject(err);
    };
  });
}
