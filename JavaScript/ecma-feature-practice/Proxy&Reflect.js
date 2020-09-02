// ======== demo 对象
// ================================================
// 1、Proxy 代理，拦截对象的默认行为
// 2、Reflect 把属于语言内部的方法放在此方式上，包含Proxy上的所有方法，不管 Proxy 怎么修改。
const obj = { name: "l", location: { city: "beijing" } };
const proxyObj = new Proxy(obj, {
  get(target, property, receiver) {
    console.log(`getting ${property}`);
    return Reflect.get(target, property, receiver);
  },
  set(target, property, value, receiver) {
    console.log(`setting ${property}, ${value}`);
    return Reflect.set(target, property, value, receiver);
  },
});

proxyObj.name; // getting name
proxyObj.name = "lian"; // setting name, lian

// getting location 不会触发 set，只会触发一次 location 的 get，层级对象不能响应
proxyObj.location.city = "beijing haidian";

// ======== demo 数组
// ================================================
const arr = [1, 2];
const proxyArr = new Proxy(arr, {
  get(target, property, receiver) {
    console.log(`getting ${property}`);
    return Reflect.get(target, property, receiver);
  },
  set(target, property, value, receiver) {
    console.log(`setting ${property}, ${value}`);
    return Reflect.set(target, property, value, receiver);
  },
});

proxyArr[1]; // getting 1

proxyArr.push(3);

/**
  push 从后面添加, 会触发两次
  getting push 获取数组 push 方法
  getting length 获取原型的 length
  setting 2, 3 修改索引 2 的值为三
  setting length, 3 // 修改数组的长度
 */

proxyArr.unshift(0);
/** 往前添加时，后面的都会往后移一位。
  getting unshift
  getting length
  getting 2
  setting 3, 3
  getting 1
  setting 2, 2
  getting 0
  setting 1, 1
  setting 0, 0
  setting length, 4
 */
