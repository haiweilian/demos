"use strict";
exports.main = async (event, context) => {
  if (!event.keyword) return "parameter keyword missed";

  // 调用上海垃圾分类查询
  const serviceUrl = "https://sffc.sh-service.com/wx_miniprogram/sites/feiguan/trashTypes_2/Handler/Handler.ashx?a=EXC_QUERY&kw=" + event.keyword;
  const classify_res = await uniCloud.httpclient.request(serviceUrl, {
    dataType: "json",
  });

  if (classify_res.status != 200) return classify_res;

  // 处理查询结果
  let finalData = {
    keyword: event.keyword,
    matched: null,
    similars: [],
  };

  if (classify_res.data.query_result_type_1) {
    finalData.matched = {
      typename: classify_res.data.query_result_type_1.TypeKey,
    };
  }

  if (classify_res.data.query_result_type_m1) {
    for (let i = 0; i < classify_res.data.query_result_type_m1.trashTypes.length; i++) {
      finalData.similars.push({
        keywords: classify_res.data.query_result_type_m1.trashTypes[i]["Name"],
        typename: classify_res.data.query_result_type_m1.trashTypes[i]["TypeKey"],
      });
    }
  }

  return finalData;
};
