var __spreadArrays =
  (this && this.__spreadArrays) ||
  function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
    return r;
  };
// 计算、算法相关的工具方法
/**
 * 构造返回指定长度的数组
 * @param len 数组的长度
 * @param fill 数组每一项的填充值，默认填充 index的值
 */
function getArrByLen(len, fill) {
  if (len === 0) return [];
  return (Array(len) + "").split(",").map(function(v, k) {
    return fill || k;
  });
}
/**
 * 将所给定的数组填充到给定的长度
 * @param arr 需要填充的数组
 * @param length 需要填充的长度
 * @param fill 新增填充的项的填充值
 */
function completeArr(arr, length, fill) {
  return arr.concat(getArrByLen(length, fill));
}
/**
 * 数组去重
 * @param arr 需要去重的数组
 */
function uniqueArr(arr) {
  return arr.reduce(function(t, c) {
    return t.indexOf(c) !== -1 ? t : t.concat(c);
  }, []);
}
/**
 * 给定 mArr长度个数组，从这些数组中取 n 个项，每个数组最多取一项，求所有的可能集合，其中，mArr的每个项的值代表这个数组的长度
 * 例如 composeMArrN(([1, 2, 3], 2))，表示给定了 3 个数组，第一个数组长度为 1，第二个数组长度为 2，第二个数组长度为 3，从这三个数组任意取两个数
 * example： composeMArrN(([1, 2, 3], 2))，返回：
 * [[0,0,-1],[0,1,-1],[0,-1,0],[0,-1,1],[0,-1,2],[-1,0,0],[-1,0,1],[-1,0,2],[-1,1,0],[-1,1,1],[-1,1,2]]
 * 返回的数组长度为 11，表示有1 种取法，数组中每个子数组就是一个取值组合，子数组中的数据项就表示取值的规则
 * 例如，对于上述结果的第一个子数组 [0, 0, -1] 来说，表示第一种取法是 取第一个数组下标为 0 和 第二个数组下标为 0 的数，下标为 2 的数组项值为 -1 表示第三个数组不取任何数
 * @param mArr 数据源信息
 * @param n 取数的个数
 * @param arr 递归使用，外部调用不需要传此项
 * @param hasSeletedArr 递归使用，外部调用不需要传此项
 * @param rootArr 递归使用，外部调用不需要传此项
 */
function composeMArrN(mArr, n, arr, hasSeletedArr, rootArr) {
  if (arr === void 0) {
    arr = [];
  }
  if (hasSeletedArr === void 0) {
    hasSeletedArr = [];
  }
  if (rootArr === void 0) {
    rootArr = [];
  }
  if (!n || n < 1 || mArr.length < n) {
    return arr;
  }
  for (var i = 0; i < mArr.length; i++) {
    // 当前层级已经存在选中项了
    if (hasSeletedArr.indexOf(i) !== -1) continue;
    hasSeletedArr = hasSeletedArr.slice();
    hasSeletedArr.push(i);
    for (var j = 0; j < mArr[i]; j++) {
      var arr1 = completeArr(arr, i - arr.length, -1);
      arr1.push(j);
      if (n === 1) {
        arr1 = completeArr(arr1, mArr.length - arr1.length, -1);
        rootArr.push(arr1);
      } else {
        composeMArrN(mArr, n - 1, arr1, hasSeletedArr, rootArr);
      }
    }
  }
  return rootArr;
}
/**
 * 从 m 个数字中取 n 个，所有可能的取法（不考虑顺序）
 * @param m 数据总数
 * @param n 取数个数
 * @param arr 递归使用，外部调用不需要传此项
 * @param hasSeletedArr 递归使用，外部调用不需要传此项
 * @param rootArr 递归使用，外部调用不需要传此项
 */
function composeMN(m, n, arr, hasSeletedArr, rootArr) {
  if (arr === void 0) {
    arr = [];
  }
  if (hasSeletedArr === void 0) {
    hasSeletedArr = [];
  }
  if (rootArr === void 0) {
    rootArr = [];
  }
  for (var i = 0; i < m; i++) {
    if (hasSeletedArr.indexOf(i) !== -1) continue;
    hasSeletedArr = hasSeletedArr.slice();
    hasSeletedArr.push(i);
    var arr1 = arr.slice();
    arr1.push(i);
    if (n !== 1) {
      composeMN(m, n - 1, arr1, hasSeletedArr, rootArr);
    } else {
      rootArr.push(arr1);
    }
  }
  return rootArr;
}
/**
 * 求数组交集，每个数组的数据项只能是数字，并且每个数组都要是排好序的，算法优化的需要
 * @param params 需要求交集的数组，例如 intersectionSortArr([2, 3, 7, 8], [3, 7, 9, 12, 18, 20], [7, 16, 18])
 */
function intersectionSortArr() {
  var params = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    params[_i] = arguments[_i];
  }
  if (!params || params.length === 0) return [];
  if (params.length === 1) {
    return params[0];
  }
  var arr1 = params[0];
  var arr2 = params[1];
  if (params.length > 2) {
    return intersectionSortArr(arr1, intersectionSortArr.apply(void 0, __spreadArrays([arr2], params.slice(2))));
  }
  var arr = [];
  if (!arr1.length || !arr2.length || arr1[0] > arr2.slice(-1)[0] || arr2[0] > arr1.slice(-1)[0]) {
    return arr;
  }
  var j = 0;
  var k = 0;
  var arr1Len = arr1.length;
  var arr2Len = arr2.length;
  while (j < arr1Len && k < arr2Len) {
    if (arr1[j] < arr2[k]) {
      j++;
    } else if (arr1[j] > arr2[k]) {
      k++;
    } else {
      arr.push(arr1[j]);
      j++;
      k++;
    }
  }
  return arr;
}
/**
 * 求数组交集, intersectionSortArr 的宽松版本，没有 intersectionSortArr 对参数要求那么严格，但是在大数据量的情况下，效率也不如 intersectionSortArr 好
 * @param params 需要求交集的数组，例如 intersectionArr(['swwsw', 'swsw'], ['12', 3, 4], [5,6])
 */
function intersectionArr() {
  var params = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    params[_i] = arguments[_i];
  }
  if (!params || params.length === 0) return [];
  if (params.length === 1) {
    return params[0];
  }
  var arr1 = params[0];
  var arr2 = params[1];
  if (params.length > 2) {
    return intersectionArr(arr1, intersectionArr.apply(void 0, __spreadArrays([arr2], params.slice(2))));
  }
  var arr = [];
  uniqueArr(arr1).forEach(function(item) {
    if (arr2.indexOf(item) !== -1) {
      arr.push(item);
    }
  });
  return arr;
}
export { getArrByLen, uniqueArr, composeMN, composeMArrN, intersectionSortArr, intersectionArr };
