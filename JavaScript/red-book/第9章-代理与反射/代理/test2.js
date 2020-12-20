const target = {
  id: "target",
};

const proxy = new Proxy(target, {
  get(target, property, receiver) {
    return target[property] + "...";
  },
  set(target, property, value, receiver) {
    return (target[property] = value);
  },
});

console.log(proxy.id); // target...
console.log(target.id); // target
