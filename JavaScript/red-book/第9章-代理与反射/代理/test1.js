const target = {
  id: "target",
};
const proxy = new Proxy(target, {});

console.log(proxy.id); // target
console.log(target.id); // target
