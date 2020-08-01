// router/vue-router.js
let Vue // bind on install

class VueRouter {
  constructor (options) {
    this.$options = options

    // 定义一个响应式的 current, 如果它变了，那么使用它的组件会 render。
    // `Vue.util.defineReactive` 未公开文档，在 vue 源码的 src/core/global-api/index.js 里面。
    Vue.util.defineReactive(this, 'current', '')

    // 当路由变化的时候，重新赋值当前路径
    window.addEventListener('hashchange', () => {
      this.onHashChange()
    })
  }

  onHashChange () {
    this.current = window.location.hash.slice(1) || '/'
  }
}

// Vue 插件的实现方式，必须导出一个 install 函数。Vue.use() 的时候自动调用。
VueRouter.install = function (_Vue) {
  Vue = _Vue

  Vue.mixin({
    // 在实例初始化之后再执行，这里是为了延迟执行。
    // 因为是为了保证 Vue 的实例存在，用于在原型上挂载 $router。
    beforeCreate () {
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router
        Vue.prototype.$router.onHashChange()
      }
    }
  })

  // 注册 router-link 组件，利用 a 标签跳转。
  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        required: true
      }
    },
    render (h) {
      return h('a', {
        attrs: { href: `#${this.to}` }
      },
      this.$slots.default
      )
    }
  })

  // 注册 router-view 组件，匹配对应 path 路径的 component 组件。
  Vue.component('router-view', {
    render (h) {
      let component = null
      const { $options, current } = this.$router
      $options.routes.forEach(item => {
        if (item.path === current) {
          component = item.component
        }
      })
      return h(component)
    }
  })
}

export default VueRouter
