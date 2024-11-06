// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/plugins/axios'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useUserStore } from '@/stores/user'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:svg-icons-register'
import '@/style/main.css'
import { setStoreGetter } from '@/plugins/axios'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
// @/plugins/axios 注入 useUserStore 值，使得其可以使用 userStore
// 如果直接在在 @/plugins/axios 使用 useUserStore，有可能 pinia 还未初始化，导致报错
setStoreGetter(() => useUserStore())

app.use(router)
app.use(ElementPlus)

app.mount('#app')
