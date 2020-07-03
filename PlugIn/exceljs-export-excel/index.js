/**
 * 表头【列】
 */
let headers = [
  { header: "序号", key: "a", width: 20 },
  { header: "项目编号", key: "b", width: 50 },
  { header: "项目名称", key: "c", width: 50 },
  { header: "数量", key: "d", width: 50 },
  { header: "单位", key: "e", width: 50 },
  { header: "单价(元)", key: "f", width: 50 },
  { header: "合计", key: "g", width: 50 },
];

/**
 * 内容【行】
 */
let content = [
  {
    a: "1",
    b: "序工工程",
    c: null,
    d: null,
    e: null,
    f: "小计",
    g: "213186.60",
  },
  {
    a: "1-1",
    b: "墙面工程",
    c: null,
    d: null,
    e: null,
    f: "小计",
    g: "3936.60",
  },
  {
    a: "1-1.1",
    b: "装饰发光线条(宽50mm)",
    c: null,
    d: "90",
    e: "米",
    f: "37.14",
    g: "3342.60",
  },
  {
    a: null,
    b: "主材",
    c: "LED软灯带 （5050）",
    d: "飞利浦 （5w-标亮版-30颗珠/米-50米/盘）",
    e: null,
    f: "10.00",
    g: null,
  },
  {
    a: null,
    b: "辅材",
    c: "亚克力板 （2440mm*1220mm*3mm）",
    d: "地方品牌 （HD-3mm）",
    e: null,
    f: "10.00",
    g: null,
  },
  {
    a: null,
    b: null,
    c: "细木工板 （2440mm*1220mm*15mm）",
    d: "金秋（直营店） （白松）",
    e: null,
    f: null,
    g: null,
  },
  {
    a: null,
    b: "人工",
    c: "木工",
    d: null,
    e: null,
    f: "11.14",
    g: null,
  },
  {
    a: null,
    b: "工艺介绍",
    c: "基面造型位置正确，细木工板进行防腐、防火处理，灯具品牌、尺寸符合设计要求，饰面板厚度、形式、图案符合设计要求，安装牢固，接缝紧密，无漏光。",
    d: null,
    e: null,
    f: null,
    g: null,
  },
  {
    a: null,
    b: "适用要求",
    c: "可用于顶面、墙面、地面造型发光，增强美观和视觉效果",
    d: null,
    e: null,
    f: null,
    g: null,
  },
];
content = content.concat(content).concat(content).concat(content);

/**
 * 创建 Excel writeExcel('预算报表', headers, content)
 * @param {*} filename 文件名称
 * @param {*} headers 头部
 * @param {*} content 内容
 * @docs https://gitee.com/mirrors/exceljs
 */
function writeExcel(filename, headers, content) {
  // 1、创建工作簿
  let workbook = new ExcelJS.Workbook();

  // 2、设置工作簿属性
  workbook.created = new Date();
  workbook.modified = new Date();

  // 3、添加工作表
  let sheet = workbook.addWorksheet("sheet");

  // 4、添加列标题并定义列键和宽度
  sheet.columns = headers;

  // 5、添加行
  sheet.addRows(content);

  // 6、遍历所有工作表
  workbook.eachSheet(function (worksheet, sheetId) {
    console.log(worksheet, sheetId);
  });

  // 7、遍历工作表中的所有行（包括空行）
  sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    // 7-1、设置行高度
    row.height = 35;

    // 7-2、遍历一行中的所有单元格（包括空单元格）
    row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
      // 7-2.1、设置对齐方式
      cell.alignment = { vertical: "middle" };

      // 7-2.2、设置表头颜色填充
      if (rowNumber === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "000000" },
          bgColor: { argb: "000000" },
        };
        cell.font = {
          color: { argb: "FFFFFFFF" },
        };
      }

      // 7-2.3、设置分类表头颜色，根据序号 1、2、3 判断
      if (!Number.isNaN(Number(row.values[1]))) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "C0C0C0" },
          bgColor: { argb: "C0C0C0" },
        };
      }

      // 7-2.last、输入数据
      console.log("Cell " + colNumber + " = " + cell.value);
    });

    // 7-last、输入数据
    console.log("Row " + rowNumber + " = " + JSON.stringify(row.values));
  });

  // last、使用 file-saver 导出 xlsx
  return workbook.xlsx.writeBuffer().then(function (buffer) {
    saveAs(
      new Blob([buffer], {
        type: "application/octet-stream",
      }),
      `${filename}${Date.now()}.xlsx`
    );
  });
}
