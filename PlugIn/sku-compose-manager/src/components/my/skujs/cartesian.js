const colors = ["黑色", "白色", "灰色"];
const length = ["长款", "短款"];
const size = ["S", "M", "L"];

// 写死获取SKU组合的方法
// const getSkuList = () => {
//   const result = [];
//   colors.forEach(c => {
//     length.forEach(l => {
//       size.forEach(s => {
//         result.push([c, l, s]);
//       });
//     });
//   });
//   return result;
// };
// console.log(getSkuList());

/**
 * 使用 reduce 依次合并
 * @param {Array<Array<string>>} attrList
 */
// const getSkuList = attrList => {
//   return attrList.reduce(
//     (total, current) => {
//       console.log(total, "-", current);
//       // 每次合并两个数组的集合，合并的结果作为下一循环的第一个数组
//       const res = [];
//       total.forEach(t => {
//         current.forEach(c => {
//           res.push([...t, c]);
//         });
//       });
//       return res;
//     },
//     [[]]
//   );
// };
// console.log(getSkuList([colors, length, size]));

/**
 * 使用 reduce 依次合并，使用 flatMap 和 map 简化
 * @param {Array<Array<string>>} attrList
 */
const getSkuList = attrList => {
  return attrList.reduce(
    (total, current) => {
      console.log(total, "-", current);
      // 每次返回一个 total 合并的结果的数组，所以要打平
      return total.flatMap(t => {
        return current.map(c => [...t, c]); // 一个 total 和 当前值合并
      });
    },
    [[]]
  );
};

console.log(getSkuList([colors, length, size]));

export const getAttrs = [
  {
    label: "颜色",
    name: "color",
    options: [
      {
        value: "黑色"
      },
      {
        value: "白色"
      },
      {
        value: "灰色"
      }
    ]
  },
  {
    label: "长度",
    name: "length",
    options: [
      {
        value: "长款"
      },
      {
        value: "短款"
      }
    ]
  },
  {
    label: "尺码",
    name: "size",
    options: [
      {
        value: "S"
      },
      {
        value: "M"
      },
      {
        value: "L"
      }
    ]
  }
];
export const getSkus = [
  {
    skuId: "111",
    skuInfo: {
      color: "黑色",
      length: "长款",
      size: "S"
    },
    stock: 10,
    price: 10
  },
  {
    skuId: "112",
    skuInfo: {
      color: "黑色",
      length: "长款",
      size: "M"
    },
    stock: 9,
    price: 9
  },
  {
    skuId: "113",
    skuInfo: {
      color: "黑色",
      length: "长款",
      size: "L"
    },
    stock: 8,
    price: 8
  },
  {
    skuId: "112",
    skuInfo: {
      color: "白色",
      length: "长款",
      size: "M"
    },
    stock: 9,
    price: 9
  }
];
