import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: () => import('../views/provider/list.vue')
    },
    {
      path: '/edit/:index',
      name: 'edit',
      component: () => import('../views/provider/edit.vue'),
      props: (route) => ({
        index: Number(route.params.index)
      })
    },
    {
      path: '/add',
      name: 'add',
      component: () => import('../views/provider/edit.vue')
    }
  ]
});

export default router;
