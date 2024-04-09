import { createApp } from 'vue'
import { isDev, pinia } from '@/stores'
import App from '@/App.vue'
import router from '@/router'
import VWave from 'v-wave'
import axios from 'axios'
import i18n from '@/i18n'
import signalbus from '@/signalbus'
import VueLazy from '@/components/UI/LazyImage'
import VueTippy from 'vue-tippy'
// @ts-ignore
import contextmenu from 'v-contextmenu'
import 'v-contextmenu/dist/themes/default.css'
import 'splitpanes/dist/splitpanes.css'
import '@/assets/style.css'
import 'tippy.js/dist/tippy.css'

if (!(window as any).electron) {
  (window as any).isWeb = true
} else {
  (window as any).isWeb = false
}

const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(VWave)
app.use(VueLazy, {})
app.use(i18n)
app.use(contextmenu)
app.use(VueTippy, {
  defaultProps: { placement: 'bottom' },
})

app.provide('axios', axios)
app.provide('signalbus', signalbus)

app.mount('#app').$nextTick(() => {
  postMessage({ payload: 'removeLoading' }, '*')
})
