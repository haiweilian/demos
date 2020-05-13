function defineReactive(obj, key, val) {
  // val 可能还是对象，继续递归
  observe(val);

  Object.defineProperty(obj, key, {
    get() {
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log("set...", key, newVal);
      }
    },
  });
}

// 定义数据响应式
function observe(obj) {
  if (typeof obj !== "object" || obj === null || obj === undefined) {
    return;
  }
  Object.keys(obj).forEach((key) => {
    defineReactive(obj, key, obj[key])
  });
}

// 为当前实例的值做代理
function proxy(vm) {
  // 如：vm.$data.name --> vm.name
  Object.keys(vm.$data).forEach((key) => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key];
      },
      set(newVal) {
        vm.$data[key] = newVal;
      },
    });
  });
  // 如：vm.$methods.firstBlood --> vm.firstBlood
  Object.keys(vm.$methods).forEach((key) => {
    vm[key] = vm.$methods[key];
  });
}

// 定义 vue 类，初始化解析选项，响应式、编译等
class Vue {
  constructor(options) {
    this.$options = options;
    this.$data = options.data;
    this.$methods = options.methods;

    // 对 data 选项做响应式处理
    observe(this.$data);

    // 代理数据
    proxy(this);

    // 编译模板
    new Compile(options.el, this);
  }
}

// 遍历视图模板，解析其中的特殊模板语法
class Compile {
  // el: 主元素选择器、vm: vue的实例
  constructor(el, vm) {
    this.$el = document.querySelector(el);
    this.$vm = vm;
    this.compile(this.$el);
  }

  // 解析节点
  compile(el) {
    el.childNodes.forEach((node) => {
      if (node.nodeType === 1) {
        // 元素节点
        this.compileElement(node);
      } else if (node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)) {
        // 文本节点 && 包含插值语法
        this.compileText(node);
      }
      // 如果有子节点递归子节点
      if (node.childNodes) {
        this.compile(node);
      }
    });
  }

  // 编译文本表达式
  compileText(node) {
    // RegExp.$1的使用: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/n
    this.update(node, RegExp.$1, "text");
  }

  // 编译元素节点：判断指令和事件
  compileElement(node) {
    // 获取节点属性 v-text、@click...
    const attrs = node.attributes;
    Array.from(attrs).forEach((attr) => {
      // attr = {name: 'v-text', value: 'counter'}
      const { name, value } = attr;
      // 判断是否是指令
      if (name.startsWith("v-")) {
        const dir = name.substring(2);
        // 执行指令对应的函数 v-text --> text()
        this[dir] && this[dir](node, value, dir);
      }else if(name.startsWith('@')) {
        const dir = name.substring(1);
        // 执行事件对应的函数
        this.eventHander(node, value, dir)
      }
    });
  }

  /**
   * 更新模板，使用同一函数更新，dir 用于区分。
   * @param {*} node node 节点
   * @param {*} key 更新值的键，也就是 data 里面的值
   * @param {*} dir 更新类型(指令：如：html、text、model)
   */
  update(node, key, dir) {
    // 获取更新方法：如 text --> textUpdater
    const fn = this[dir + "Updater"];
    // 默认渲染一次结果
    fn && fn(node, this.$vm[key]);
  }

  // v-text
  text(node, key) {
    this.update(node, key, "text");
  }

  // 更新文本类型
  textUpdater(node, value) {
    node.textContent = value;
  }

  // v-model
  model(node, key) {
    this.update(node, key, "model");
    this.modelHander(node, key)
  }

  // 更新输入框类型
  modelUpdater(node, value) {
    node.value = value;
  }

  // 监听输入框事件
  modelHander(node, key) {
    node.addEventListener("input", (event) => {
      this.$vm[key] = event.target.value;
    });
  }

  // 监听事件执行方法
  eventHander (node, key, event) {
    const fn = this.$vm[key];
    fn && node.addEventListener(event, fn.bind(this.$vm))
  }
}
