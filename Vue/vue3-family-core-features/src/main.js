import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './index.css'

// eslint-disable-next-line
let app = createApp(App).use(store).use(router)

app.config.globalProperties.size = 'mini'

app.mount('#app')
