<script setup>
import { ref, onMounted } from 'vue'
import { getListaNoticias, deleteNoticia } from '../backend/noticiaService.js'
import { pb, SUPERUSER } from '../backend/pb.js'

const noticias = ref([])
const loading = ref(false)
const error = ref(null)
const expandedNoticiaId = ref(null)

async function loadNoticias() {
  loading.value = true
  error.value = null
  try {
    const lista = await getListaNoticias()
    // Mostrar primero los más antiguos
    noticias.value = lista.slice().reverse()
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

function toggleDetalles(noticiaId) {
  expandedNoticiaId.value = expandedNoticiaId.value === noticiaId ? null : noticiaId
}

async function eliminarNoticia(id) {
  const ok = window.confirm('¿Eliminar esta noticia?')
  if (!ok) return
  loading.value = true
  try {
    await deleteNoticia(id)
    noticias.value = noticias.value.filter(n => n.id !== id)
    if (expandedNoticiaId.value === id) expandedNoticiaId.value = null
  } catch (err) {
    console.error('Error eliminando noticia:', err)
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
      console.log('Superuser autenticado para tests')
    } catch (err) {
      console.error('Error autenticando superuser:', err)
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
      <div v-else class="noticias-container">
        <div v-for="n in noticias" :key="n.id" class="noticia-card">
          <div class="noticia-header">
            <div class="noticia-info">
              <h3>{{ n.titulo }}</h3>
              <p v-if="n.contenido" class="descripcion">{{ n.contenido }}</p>
              <div class="meta">
                <small v-if="n.fecha">{{ new Date(n.fecha).toLocaleDateString() }}</small>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button @click="toggleDetalles(n.id)" class="btn-detalles">
              {{ expandedNoticiaId === n.id ? 'Ocultar detalles' : 'Detalles' }}
            </button>
            <button class="btn-eliminar" @click="eliminarNoticia(n.id)">✕</button>
          </div>

          <div v-if="expandedNoticiaId === n.id" class="detalles-panel">
            <div class="detalles-grid">
              <div class="detalle-item">
                <span class="label">Contenido:</span>
                <span class="value">{{ n.contenido }}</span>
              </div>
              <div class="detalle-item">
                <span class="label">Fecha:</span>
                <span class="value">{{ n.fecha ? new Date(n.fecha).toLocaleString() : '—' }}</span>
              </div>
              <div class="detalle-item" v-if="n.url_video">
                <span class="label">Video:</span>
                <span class="value">{{ n.url_video }}</span>
              </div>
            </div>
            <button class="btn-mas-detalles">Más detalles</button>
          </div>
        </div>
      </div>
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
.lista-noticias { padding: 0 1rem; margin-top: 1rem; }
.noticias-container { display: grid; gap: 1.5rem; max-width: 1200px; grid-template-columns: repeat(3,1fr); }
.noticia-card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; background: #fff; }
.noticia-info h3 { margin: 0 0 .5rem 0; }
.descripcion { color: #666; }
.card-actions { display:flex; gap:.5rem; margin-top:.5rem }
.btn-detalles { padding:.6rem 1.2rem; background:#007bff; color:#fff; border:none; border-radius:4px }
.btn-eliminar { padding:.45rem .8rem; background:#dc3545; color:#fff; border:none; border-radius:4px }
.detalles-panel { margin-top:1rem; padding:1rem; background:#f9f9f9; border-left:4px solid #007bff; border-radius:4px }
.detalles-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem }
.btn-mas-detalles { padding:.6rem 1.2rem; background:#28a745; color:#fff; border:none; border-radius:4px }
@media (max-width:1000px){ .noticias-container{ grid-template-columns:repeat(2,1fr) } }
@media (max-width:640px){ .noticias-container{ grid-template-columns:1fr } }
</style>