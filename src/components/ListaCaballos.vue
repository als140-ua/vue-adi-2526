<script setup>
import { ref, onMounted } from 'vue'
import { getListaCaballos } from '../backend/caballoService.js'
import { pb, SUPERUSER } from '../backend/pb.js'

const caballos = ref([])
const loading = ref(false)
const error = ref(null)

async function loadCaballos() {
  loading.value = true
  error.value = null
  try {
    const lista = await getListaCaballos()
    caballos.value = lista
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

async function loginAsSuperuser() {
  // Sólo usar en desarrollo/local; esto intentará autenticar con las credenciales
  // definidas en `pb.js` y recargar la lista.
  // Esto se quitará cuando esté implementado el login real.
  loading.value = true
  error.value = null
  try {
    try {
      await pb.admins.authWithPassword(SUPERUSER.email, SUPERUSER.password)
      console.log("Superuser autenticado para tests")
    } catch (err) {
      console.error("Error autenticando superuser:", err)
      // No abortar: intentamos recargar la lista de todos modos
    }
    await loadCaballos()
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCaballos()
})
</script>

<template>
  <section class="lista-caballos">
    <h2>Listado de caballos</h2>

    <div v-if="loading">Cargando caballos...</div>
    <div v-else-if="error" class="error">
      <div>Error: {{ error }}</div>
      <div v-if="isSuperuserError(error)">
        <small>Este recurso parece requerir permisos especiales (superuser).</small>
        <div>
          <button @click="loginAsSuperuser" class="btn">Login como admin (solo dev)</button>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="caballos.length === 0">No hay caballos disponibles.</div>
      <ul v-else>
        <li v-for="c in caballos" :key="c.id" class="caballo-item">
          <strong>{{ c.nombre }}</strong>
          <div class="meta">
            <span v-if="c.color">Color: {{ c.color }}</span>
            <span v-if="c.sexo"> · Sexo: {{ c.sexo }}</span>
            <span v-if="c.fecha_nacimiento"> · Nac.: {{ c.fecha_nacimiento }}</span>
          </div>
          <p v-if="c.descripcion">{{ c.descripcion }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
// helper fuera de <script setup> para evitar recrearlo en cada render
export function isSuperuserError(err) {
  if (!err) return false
  const text = String(err).toLowerCase()
  return text.includes('superuser') || text.includes('superusuario') || text.includes('solo super') || text.includes('only super')
}
</script>

<style scoped>
.lista-caballos {
  margin-top: 1rem;
}
.caballo-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
.caballo-item .meta {
  color: #555;
  font-size: 0.9rem;
}
.error {
  color: #b00020;
}
</style>
