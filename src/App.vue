<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { onMounted} from 'vue'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  authStore.initAuth()
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error during logout:', error)
  }
}
</script>

<template>
  <div class="layout">
  <header class="main-header">
      <nav class="main-nav">
        <div class="nav-left">
          
          <RouterLink to="">🏇 UMA</RouterLink> 
          <RouterLink to="/">Caballos</RouterLink>
          <RouterLink to="/noticias">Noticias</RouterLink>
          <template v-if="authStore.isAdmin">
            <RouterLink to="/crear-caballo">Crear Caballo</RouterLink>
            <RouterLink to="/crear-noticia">Crear Noticia</RouterLink>
            <RouterLink to="/crear-pedigri">Crear Pedigrí</RouterLink>
          </template>
        </div>
        <div class="nav-right">
          <RouterLink v-if="!authStore.isLoggedIn" to="/login">Iniciar sesión</RouterLink>
          <a v-else href="#" @click.prevent="handleLogout">
            Cerrar sesión ({{ authStore.userName || authStore.userEmail }})
          </a>
        </div>
      </nav>
    </header>
  
  <div class="app-container">
    <main class="main-content">
      <RouterView />
    </main>
  </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.main-header {
  width: 100%;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  position: sticky;
  top: 0;
  z-index: 100;
}

.main-nav {
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
  overflow-x: auto;
  background: #f8f9fa;
}

.nav-left {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  padding-right: 0.6rem;
}

.main-nav a {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  padding: 1rem 1.2rem;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  flex-shrink: 0;
}

.main-nav a:hover {
  background:#e9ecef;
}

.main-nav a.router-link-active {
  color:#42b883;
  border-bottom-color:#42b883;
  background:#fff;
}

.main-content {
  flex: 1;
  padding: 2rem;
  box-sizing: border-box;
  width: 100%;
}

.app-container {
  flex: 1;
  display: flex;
  justify-content: center;
  margin: 0 auto;
}
</style>
