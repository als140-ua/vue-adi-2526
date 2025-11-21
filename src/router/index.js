import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/CaballosView.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/authStore'

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
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/crear-caballo',
      name: 'crear-caballo',
      component: () => import('../views/CrearCaballo.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/editar-caballo/:id',
      name: 'editar-caballo',
      component: () => import('../views/EditarCaballo.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/crear-noticia',
      name: 'crear-noticia',
      component: () => import('../views/CrearNoticia.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/editar-noticia/:id',
      name: 'editar-noticia',
      component: () => import('../views/EditarNoticia.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/crear-pedigri',
      name: 'crear-pedigri',
      component: () => import('../views/CrearPedigri.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    }
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath }})
    return
  }
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    alert('No tienes permisos para acceder a esta página.')
    next({ name: 'caballos' })
    return
  }
  next()
})

export default router