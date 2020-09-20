import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'

import 'element-ui/lib/theme-chalk/index.css'
import 'taggd/dist/taggd.css'

Vue.use(ElementUI)

new Vue({
  render: h => h(App),
}).$mount('#app')
