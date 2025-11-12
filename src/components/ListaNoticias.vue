<script setup>
import { ref, onMounted } from 'vue'
import { getListaNoticias, deleteNoticia } from '../backend/noticiaService.js'
import { getImagenesPorNoticia } from '../backend/imagenService.js'
import { pb, SUPERUSER } from '../backend/pb.js'

const noticias = ref([])
const noticiasImages = ref({})
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
    // precargar imagenes por noticia
    for (const n of noticias.value) {
      try {
        const imgs = await getImagenesPorNoticia(n.id)
        noticiasImages.value[n.id] = imgs
      } catch (err) {
        noticiasImages.value[n.id] = []
      }
    }
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
      delete noticiasImages.value[id]
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

function getNewsImageUrl(imagen) {
  if (!imagen?.url) return null
  return `${pb.baseUrl}/api/files/imagenes_noticias/${imagen.id}/${imagen.url}`
}

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
          <div class="noticia-card-main">
            <div class="noticia-image">
              <template v-if="noticiasImages[n.id] && noticiasImages[n.id].length">
                <img :src="getNewsImageUrl(noticiasImages[n.id][0])" :alt="`Imagen noticia ${n.titulo}`" />
              </template>
              <div v-else class="noticia-imagen-placeholder">Sin imagen</div>
            </div>
            <div class="noticia-info">
              <h3 class="titulo">{{ n.titulo }}</h3>
              <div class="meta"><small v-if="n.fecha">{{ new Date(n.fecha).toLocaleDateString() }}</small></div>
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
                <span class="value contenido-noticia">{{ n.contenido }}</span>
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
.lista-noticias h2 {
  margin-bottom: 1.5rem;
}
.noticias-container { display: grid; gap: 1.5rem; max-width: 1200px; grid-template-columns: repeat(3, minmax(420px, 1fr)); justify-content: center; }
.noticia-card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; background: #fff; }
.noticia-card-main { display:flex; gap:1rem; align-items:flex-start }
.noticia-image { width:150px; height:100px; overflow:hidden; border-radius:8px; background:#f5f5f5; display:flex; align-items:center; justify-content:center }
.noticia-image img { width:100%; height:100%; object-fit:cover }
.noticia-imagen-placeholder { color:#999 }
.noticia-info .titulo { margin:0; color:#222 }
.noticia-info .meta small { color:#333 }
.card-actions { display:flex; gap:.5rem; margin-top:.5rem }
.btn-detalles { padding:.6rem 1.2rem; background:#007bff; color:#fff; border:none; border-radius:4px }
.btn-eliminar { padding:.45rem .8rem; background:#dc3545; color:#fff; border:none; border-radius:4px }
.detalles-panel { margin-top:1rem; padding:1rem; background:#f9f9f9; border-left:4px solid #007bff; border-radius:4px }
.detalles-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem }
.detalle-item { margin:0; color:#222 }
.btn-mas-detalles { padding:.6rem 1.2rem; background:#28a745; color:#fff; border:none; border-radius:4px }
.contenido-noticia {
  display: -webkit-box;
  -webkit-line-clamp: 5; /* Limita a 5 líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-height: 7em; /* Aproximadamente 5 líneas (1.4 * 5 = 7) */
}
@supports not (-webkit-line-clamp: 5) {
  .contenido-noticia {
    position: relative;
    max-height: 7em;
    overflow: hidden;
  }
  .contenido-noticia::after {
    content: '...';
    position: absolute;
    bottom: 0;
    right: 0;
    background: white;
    padding-left: 4px;
  }
}
@media (max-width:1000px){ .noticias-container{ grid-template-columns:repeat(2, minmax(320px,1fr)) } }
@media (max-width:640px){ .noticias-container{ grid-template-columns:1fr } }

/* helper image URL builder for noticias */
.noticia-card .titulo, .noticia-card .meta { color: #222 }
</style>