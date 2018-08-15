import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import App from './App'
import router from './router'

import store from './store'

import i18n from '@/lang'
import '@/icons' // icon
import '@/errorLog'// error log
import '@/permission' // permission control

import '@/mock' // simulation data

import * as filters from '@/filters' // global filters

if (!process.env.IS_WEB) {
  Vue.use(require('vue-electron'))
  require('electron-cookies')
}

Vue.use(ElementUI, {
  size: 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// router.beforeEach((too, from, next) => {
//   if (too.params.name) {
//     too.meta.title = too.meta.title + ' ' + too.params.name.toUpperCase()
//   }
//   next()
// })

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
