import Vue from 'vue'
import App from './App.vue'
import "@fortawesome/fontawesome-free/css/all.min.css"
import "vue-multiselect/dist/vue-multiselect.min.css"
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import './style/main.css'

Vue.use(Vuetify)

let vuetify = new Vuetify({
  icons: {
    iconfont: 'fa',
  },
})

Vue.config.productionTip = false

new Vue({
  vuetify,
  data: {
    isLoading: false
  },
  render: h => h(App)
}).$mount('#app')