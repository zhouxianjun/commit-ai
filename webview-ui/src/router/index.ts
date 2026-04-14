import { createRouter, createWebHashHistory } from 'vue-router';
import ProviderList from '../views/provider/list.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: ProviderList
    }
  ]
});

export default router;
