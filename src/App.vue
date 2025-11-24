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
      <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
        <div class="container-fluid">
          <RouterLink class="navbar-brand fw-semibold" to="/">🐴 UMA</RouterLink>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div id="navMain" class="collapse navbar-collapse">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item"><RouterLink class="nav-link" to="/">Caballos</RouterLink></li>
              <li class="nav-item"><RouterLink class="nav-link" to="/noticias">Noticias</RouterLink></li>
              <template v-if="authStore.isAdmin">
                <li class="nav-item"><RouterLink class="nav-link" to="/crear-caballo">Crear Caballo</RouterLink></li>
                <li class="nav-item"><RouterLink class="nav-link" to="/crear-noticia">Crear Noticia</RouterLink></li>
                <li class="nav-item"><RouterLink class="nav-link" to="/crear-pedigri">Crear Pedigrí</RouterLink></li>
              </template>
            </ul>
            <div class="d-flex">
              <RouterLink v-if="!authStore.isLoggedIn" class="btn btn-outline-success btn-sm" to="/login">Iniciar sesión</RouterLink>
              <button v-else class="btn btn-outline-danger btn-sm" @click.prevent="handleLogout">
                Cerrar sesión ({{ authStore.userName || authStore.userEmail }})
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
    <main class="main-content container py-4">
      <RouterView />
    </main>
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
