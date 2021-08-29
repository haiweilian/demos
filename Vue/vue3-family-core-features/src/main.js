import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/vuex'
import { createPinia } from 'pinia'

const app = createApp(App)

app.config.globalProperties.size = 'mini'

app.use(store)
app.use(router)
app.use(createPinia())
app.mount('#app')
