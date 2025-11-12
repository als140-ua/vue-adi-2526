<script setup>
import { ref, onMounted } from 'vue'
import { getListaNoticias } from '../backend/noticiaService.js'
import { pb, SUPERUSER } from '../backend/pb.js'

const noticias = ref([])
const loading = ref(false)
const error = ref(null)

async function loadNoticias() {
  loading.value = true
  error.value = null
  try {
    const lista = await getListaNoticias()
    noticias.value = lista
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

async function loginAsSuperuser() {
  loading.value = true
  error.value = null
  try {
    try {
      await pb.admins.authWithPassword(SUPERUSER.email, SUPERUSER.password)
      console.log("Superuser autenticado para tests")
    } catch (err) {
      console.error("Error autenticando superuser:", err)
    }
    await loadNoticias()
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadNoticias()
})
</script>

<template>
  <section class="lista-noticias">
    <h2>Listado de noticias</h2>

    <div v-if="loading">Cargando noticias...</div>
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
      <div v-if="noticias.length === 0">No hay noticias disponibles.</div>
      <ul v-else>
        <li v-for="n in noticias" :key="n.id" class="noticia-item">
          <strong>{{ n.titulo }}</strong>
          <div class="meta">
            <span v-if="n.fecha">Fecha: {{ new Date(n.fecha).toLocaleDateString() }}</span>
          </div>
          <p v-if="n.contenido">{{ n.contenido }}</p>
          <div v-if="n.url_video" class="video">
            <small>Video: {{ n.url_video }}</small>
          </div>
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
.lista-noticias {
  margin-top: 1rem;
}
.noticia-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
.noticia-item .meta {
  color: #555;
  font-size: 0.9rem;
}
.error {
  color: #b00020;
}
.video {
  margin-top: 0.5rem;
  font-style: italic;
}
</style>