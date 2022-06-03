import Vue from 'vue'
import App from './App.vue'
import "@fortawesome/fontawesome-free/css/all.min.css"
import "vue-multiselect/dist/vue-multiselect.min.css"
import './style/main.css'

Vue.config.productionTip = false

new Vue({
  data: {
    isLoading: false
  },
  render: h => h(App)
}).$mount('#app')