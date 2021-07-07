import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '@/modules/stats/Home.vue';
import Page403 from '@/modules/auth/403.vue';
import AuthProcess from '@/modules/auth/AuthProcess.vue';
import Page404 from '@/modules/global/404.vue';
Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/auth',
    component: {
      render(h) {
        return h('router-view');
      },
    },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Page403,
      },
      {
        path: 'process',
        name: 'AuthProcess',
        component: AuthProcess,
      },
    ],
  },
  {
    path: '*',
    name: 'NotFound',
    component: Page404,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
