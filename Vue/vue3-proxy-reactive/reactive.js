const isObject = (obj) => obj !== null && typeof obj === "object";
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);

const toProxy = new WeakMap(); // 缓存 响应式数据
const toRaw = new WeakMap(); // 缓存 原始数据

/* 建立响应式数据 */
const baseHander = {
  get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver);
    // 依赖收集
    track(target, key);
    // 递归查找
    return isObject(res) ? reactive(res) : res;
  },
  set(target, key, value, receiver) {
    // 因为 数组 会触发两次更新，一次是值本身，一次是 length, 做下简单的判断
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const res = Reflect.set(target, key, value, receiver);
    // 触发更新
    if (!hadKey || value !== oldValue) {
      trigger(target, key, oldValue, value);
    }
    return res;
  },
};
function reactive(target) {
  let observed = toProxy.get(target);

  // 原数据已有相应的响应式数据，直接返回
  if (observed) {
    return observed;
  }

  // 原数据已经是响应式数据了
  if (toRaw.get(target)) {
    return target;
  }

  // 代理
  observed = new Proxy(target, baseHander);

  // 设置缓存
  toProxy.set(target, observed);
  toRaw.set(observed, target);

  return observed;
}

/* 副作用依赖*/
const effectStack = []; // 存储 effect
function effect(fn, options = {}) {
  const reactiveEffect = createReactiveEffect(fn, options);
  // 是否默认执行一次
  if (!options.lazy) {
    reactiveEffect();
  }
  return reactiveEffect;
}

function createReactiveEffect(fn, options) {
  const effect = function effect(...args) {
    return run(effect, fn, args);
  };
  effect.deps = [];
  effect.computed = options.computed;
  effect.lazy = options.lazy;
  return effect;
}

function run(effect, fn, args) {
  if (!effectStack.includes(effect)) {
    try {
      // 将 effect 添加到全局数组中
      effectStack.push(effect);
      return fn(...args);
    } finally {
      // 清楚已经收集过的 effect
      effectStack.pop();
    }
  }
}

const targetMap = new WeakMap();
// targetMap = {
//   target: {
//    name: [effect], (Set对象)
//    age: [effect] (Set对象)
//  }
// }
/* 依赖收集：建立 数据&cb 映射关系，对应了vue3新加的 onRenderTracked 生命周期*/
function track(target, key) {
  const effect = effectStack[effectStack.length - 1];
  if (effect === void 0) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (depsMap === void 0) {
    targetMap.set(target, (depsMap = new Map()));
  }
  // 收集依赖时，通过 key 建立一个 Set
  let dep = depsMap.get(key);
  if (dep === void 0) {
    depsMap.set(key, (dep = new Set()));
  }
  if (!dep.has(effect)) {
    dep.add(effect);
    effect.deps.push(dep);
  }
}

/* 触发更新：根据映射关系，执行cb，对应了vue3新加的 onRenderTriggered 生命周期*/
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (depsMap === void 0) {
    return;
  }
  const effects = new Set();
  const computedRunners = new Set();
  if (key) {
    // 通过 key 找到所有更新函数，依次执行
    let deps = depsMap.get(key);
    deps.forEach((effect) => {
      if (effect.computed) {
        computedRunners.add(effect);
      } else {
        effects.add(effect);
      }
    });
  }
  const run = (effect) => effect();
  effects.forEach(run);
  computedRunners.forEach(run);
}

/* 计算属性 */
function computed(fn) {
  const runner = effect(fn, { computed: true, lazy: true });
  return {
    effect: runner,
    get value() {
      return runner();
    },
  };
}

export { reactive, effect, computed };
