import Vue from 'vue'
import App from './App.vue'
import router from './router'
import "@fortawesome/fontawesome-free/css/all.min.css"
import "vue-multiselect/dist/vue-multiselect.min.css"
import Notifications from 'vue-notification'
import './style/main.css'

Vue.config.productionTip = false

Vue.use(Notifications)

Vue.filter('capitalize', function (value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

const app = new Vue({
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