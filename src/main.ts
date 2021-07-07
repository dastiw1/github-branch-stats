import Vue from 'vue';
import VueCompositionAPI from '@vue/composition-api';

import 'reset-css';
import '@/assets/styles/style.scss';
import App from './App.vue';
import router from './router';
import store from './store';
Vue.use(VueCompositionAPI);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
