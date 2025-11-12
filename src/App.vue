<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <header class="main-header">
      <nav class="main-nav">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-header {
  background: #f8f9fa;
  padding: 0;
  border-bottom: 1px solid #dee2e6;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 100;
  box-sizing: border-box;
}

.main-nav {
  display: flex;
  width: 100%;
  background: #f8f9fa;
}

.main-nav a {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  display: block;
}

.main-nav a:hover {
  background-color: #e9ecef;
  color: #212529;
}

.main-nav a.router-link-active {
  color: #42b883;
  background-color: #fff;
  border-bottom-color: #42b883;
}

.main-content {
  flex: 1;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}
</style>