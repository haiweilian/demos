// 1、Proxy 代理，拦截对象的默认行为
// 2、包含 Proxy 上的所有方法，不管 Proxy 怎么修改。
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

proxyObj.name;
proxyObj.name = "lian";
proxyObj.location.city = "beijing haidian"; // 只会触发一次 location 的 get，层级对象不能响应

// getting name
// setting name, lian
// getting location
