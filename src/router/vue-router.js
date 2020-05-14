// router/vue-router.js
let Vue // bind on install

class VueRouter {
  constructor (options) {
    this.$options = options

    // 定义一个响应式的 current, 如果它变了，那么使用它的组件会 render。
    // `Vue.util.defineReactive` 未公开文档，在 vue 源码的 src/core/global-api/index.js 里面。
    Vue.util.defineReactive(this, 'current', '')

    // 当路由变化的时候，重新赋值当前路径，当操作前进、后退的时候才会触发。
    window.addEventListener('popstate', () => {
      this.onHashChange()
    })
  }

  onHashChange () {
    this.current = window.location.pathname || '/'
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

  // 注册 router-link 组件，利用 pushState 跳转。
  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        required: true
      }
    },
    render (h) {
      return h('a', {
        attrs: { href: this.to },
        on: {
          // 绑定点击事件，改变路由
          click: event => {
            event.preventDefault()
            // pushState 不会触发 popstate
            window.history.pushState({}, '', this.to)
            // 手动执行变换
            this.$router.onHashChange()
          }
        }
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
