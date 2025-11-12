import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/CaballosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'caballos',
      component: HomeView,
    },
    {
      path: '/noticias',
      name: 'noticias',
      // route level code-splitting
      // this generates a separate chunk (Noticias.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/NoticiasView.vue'),
    },
  ],
})

export default router
