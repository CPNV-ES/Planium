import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import VueCesium from 'vue-cesium'
import 'vue-cesium/dist/index.css'
import lang from 'vue-cesium/es/locale/lang/en-us.mjs';

const app = createApp(App)
app.mount('#app')
app.use(VueCesium,{
    locale: lang
})
