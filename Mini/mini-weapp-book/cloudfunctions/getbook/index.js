// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const doubanbook = require("doubanbook")

cloud.init()

// 获取豆瓣图书信息
async function getDoubanBook(isbn) {
  // https://search.douban.com/book/subject_search?search_text=9787552618006
  const url = `https://search.douban.com/book/subject_search?search_text=${isbn}`;

  const res = await axios.get(url)

  // 把加密的文本信息截取出来
  const reg = /window\.__DATA__ = "(.*)"/;

  if(reg.test(res.data)){
    let bookdata=RegExp.$1;
    return doubanbook(bookdata)[0];
  }
  return res;
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { isbn } = event
  const res = await getDoubanBook(isbn);
  return {
    title:res.title,
    coverurl:res.cover_url
  };
}
