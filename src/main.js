import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import VueCesium from 'vue-cesium'
import 'vue-cesium/dist/index.css'
import lang from 'vue-cesium/es/locale/lang/en-us.mjs';

const app = createApp(App)
app.mount('#app')
app.use(VueCesium,{
    cesiumPath: 'https://unpkg.com/cesium@latest/Build/Cesium/Cesium.js',
    accessToken: import.meta.env.VITE_CESIUM_ACCESS_TOKEN,
    locale: lang
})
