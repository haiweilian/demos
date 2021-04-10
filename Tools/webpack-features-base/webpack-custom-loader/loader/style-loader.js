// 动态生成 style 把 css 插入到页面中。
module.exports = function (source) {
  return `
    const tag = document.createElement('style');
    tag.innerHTML = ${JSON.stringify(source)};
    document.head.appendChild(tag);
  `;
};
