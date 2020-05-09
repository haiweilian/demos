// store/vuex.js
let Vue // bind on install

class Store {
  constructor (options = {}) {
    this._mutations = options.mutations
    this._actions = options.actions
    this.getters = {}

    // 把 getters 的属性添加为计算属性，当依赖的 state 变化的时候，getters 就会更新。
    const computed = {}
    Object.entries(options.getters).forEach(([key, value]) => {
      computed[key] = () => value(this.state)
      // 当访问 getters.xxx 的时候，返回对应的计算属性。
      Object.defineProperty(this.getters, key, {
        get: () => this.vm[key]
      })
    })

    // 利用 Vue 实现数据数据绑定。
    this.vm = new Vue({
      data: {
        // $ 和 _ 开头的属性不会被代理，也就是不能通过 vm.xxx 访问。
        $$state: options.state
      },
      computed
    })
  }

  // 当访问 $store.state 的时候返回隐藏在内部的状态。
  get state () {
    return this.vm._data.$$state
  }

  // 当尝试直接取修改 state 的时候，抛出错误。
  set state (v) {
    console.error('不能修改State')
  }

  // 实现 commit 方法，执行 mutations 中的处理函数。
  commit = (type, payload) => {
    const fn = this._mutations[type]
    if (fn) {
      fn(this.state, payload)
    } else {
      console.error('未知mutations类型')
    }
  }

  // 实现 dispatch 方法，执行 actions 中的处理函数。
  dispatch = (type, payload) => {
    const fn = this._actions[type]
    if (fn) {
      fn(this, payload)
    } else {
      console.error('未知actions类型')
    }
  }
}

// Vue 插件的实现方式，必须导出一个 install 函数。Vue.use() 的时候自动调用。
function install (_Vue) {
  Vue = _Vue

  Vue.mixin({
    // 在实例初始化之后再执行，这里是为了延迟执行。 因为是为了保证 Vue 的实例存在，用于在原型上挂载 $store。
    beforeCreate () {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}

export default { Store, install }
