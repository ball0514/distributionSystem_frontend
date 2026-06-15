import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

import LoadingLayout from '@/components/LoadingLayout.vue'
import StatusDialog from '@/components/StatusDialog.vue'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(vuetify)

app.component('LoadingLayout', LoadingLayout)
app.component('StatusDialog', StatusDialog)

app.mount('#app')
