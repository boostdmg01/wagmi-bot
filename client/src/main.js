import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'vuetify/dist/vuetify.min.css'
import "@fortawesome/fontawesome-free/css/all.min.css"
import "vue-multiselect/dist/vue-multiselect.min.css"
import Vuetify from 'vuetify'
import Notifications from 'vue-notification'
import './style/main.css'

Vue.config.productionTip = false

Vue.use(Notifications)

Vue.use(Vuetify)

let vuetify = new Vuetify({
  icons: {
    iconfont: 'fa',
  },
})

Vue.filter('capitalize', function (value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

const app = new Vue({
  vuetify,
  data: {
    isLoading: false
  },
  router,
  render: h => h(App)
}).$mount('#app')

router.beforeEach((to, from, next) => {
  app.isLoading = true
  next()
})

router.afterEach(() => {
  app.isLoading = false
})