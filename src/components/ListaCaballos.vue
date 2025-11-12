<script setup>
import { ref, onMounted, computed } from 'vue'
import { getListaCaballos, deleteCaballo, getCaballoByText } from '../backend/caballoService.js'
import { getImagenesPorCaballo } from '../backend/imagenService.js'
import { pb, SUPERUSER } from '../backend/pb.js'

const caballos = ref([])
const loading = ref(false)
const error = ref(null)
const expandedCaballoId = ref(null)
const caballoImages = ref({}) // { [caballoId]: [images...] }
const searchTerm = ref('')
const pageSize = 9
const currentPage = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(caballos.value.length / pageSize)))
const visibleCaballos = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return caballos.value.slice(start, start + pageSize)
})

async function loadCaballos() {
  loading.value = true
  error.value = null
  try {
    const lista = await getListaCaballos()
    // Mostrar primero los más antiguos: invertir el orden que viene de la API (que devuelve newest->oldest)
    caballos.value = lista.slice().reverse()
    
    // Precargar imágenes para cada caballo
    for (const caballo of caballos.value) {
      try {
        const images = await getImagenesPorCaballo(caballo.id) // esto da un array
        caballoImages.value[caballo.id] = images
      } catch (err) {
        console.warn(`No se pudieron cargar imágenes para caballo ${caballo.id}:`, err)
        caballoImages.value[caballo.id] = []
      }
    }
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

function toggleDetalles(caballoId) {
  expandedCaballoId.value = expandedCaballoId.value === caballoId ? null : caballoId
}

async function eliminarCaballo(id) {
  const ok = window.confirm('¿Eliminar este caballo? Esta acción no se puede deshacer.')
  if (!ok) return
  loading.value = true
  try {
    await deleteCaballo(id)
    // quitar del listado localmente para evitar recarga completa
    caballos.value = caballos.value.filter(c => c.id !== id)
    delete caballoImages.value[id]
    if (expandedCaballoId.value === id) expandedCaballoId.value = null
    // si la página actual queda vacía tras borrar, retroceder una página si es posible
    if (visibleCaballos.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  } catch (err) {
    console.error('Error eliminando caballo:', err)
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

function goPrev() { if (currentPage.value > 1) currentPage.value-- }
function goNext() { if (currentPage.value < totalPages.value) currentPage.value++ }

function getImageUrl(imagen) {
  if (!imagen?.url) return null
  // usa la colección "imagenes" y el ID del registro de imagen
  return `${pb.baseUrl}/api/files/imagenes/${imagen.id}/${imagen.url}`
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

// búsqueda: usa el servicio si hay texto, o recarga el listado completo
async function performSearch() {
  loading.value = true
  error.value = null
  try {
    if (searchTerm.value && searchTerm.value.trim().length > 0) {
      const lista = await getCaballoByText(searchTerm.value.trim())
      caballos.value = lista.slice().reverse()
    } else {
      const lista = await getListaCaballos()
      caballos.value = lista.slice().reverse()
    }

  // reset page to first
  currentPage.value = 1
  // precargar imágenes para los resultados
    for (const caballo of caballos.value) {
      try {
        const images = await getImagenesPorCaballo(caballo.id)
        caballoImages.value[caballo.id] = images
      } catch (err) {
        caballoImages.value[caballo.id] = []
      }
    }
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="lista-caballos">
    <h2>Listado de caballos</h2>

      <!-- Búsqueda: entre el título y las tarjetas -->
      <div class="search-row">
        <input v-model="searchTerm" @keyup.enter="performSearch" placeholder="Buscar caballos por nombre..." />
        <button class="btn" @click="performSearch">Buscar</button>
      </div>

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
      <div v-else class="caballos-container">
        <div v-for="c in visibleCaballos" :key="c.id" class="caballo-card">
          <!-- Fila principal: nombre + descripción + imagen -->
          <div class="caballo-header">
            <div class="caballo-info">
              <h3>{{ c.nombre }}</h3>
              <p v-if="c.descripcion" class="descripcion">{{ c.descripcion }}</p>
            </div>
            <div v-if="caballoImages[c.id]?.length > 0" class="caballo-imagen">
			<img 
				:src="getImageUrl(caballoImages[c.id][0])" 
				:alt="`Imagen de ${c.nombre}`" 
				class="imagen-thumb"
			>
			</div>
            <div v-else class="caballo-imagen-placeholder">
              <span>Sin imagen</span>
            </div>
          </div>

          <!-- Botones: detalles + eliminar -->
          <div class="card-actions">
            <button 
              @click="toggleDetalles(c.id)" 
              class="btn-detalles"
            >
              {{ expandedCaballoId === c.id ? 'Ocultar detalles' : 'Detalles' }}
            </button>
            <button class="btn-eliminar" @click="eliminarCaballo(c.id)" title="Eliminar caballo">✕</button>
          </div>

          <!-- Panel expandible con detalles adicionales -->
          <div v-if="expandedCaballoId === c.id" class="detalles-panel">
            <div class="detalles-grid">
              <div v-if="c.color" class="detalle-item">
                <span class="label">Color:</span>
                <span class="value">{{ c.color }}</span>
              </div>
              <div v-if="c.sexo" class="detalle-item">
                <span class="label">Sexo:</span>
                <span class="value">{{ c.sexo }}</span>
              </div>
              <div v-if="c.fecha_nacimiento" class="detalle-item">
                <span class="label">Nacimiento:</span>
                <span class="value">{{ c.fecha_nacimiento }}</span>
              </div>
              <div v-if="c.fecha_retiramiento" class="detalle-item">
                <span class="label">Retiramiento:</span>
                <span class="value">{{ c.fecha_retiramiento }}</span>
              </div>
              <div v-if="c.fecha_fallecimiento" class="detalle-item">
                <span class="label">Fallecimiento:</span>
                <span class="value">{{ c.fecha_fallecimiento }}</span>
              </div>
              <div v-if="c.duenyo" class="detalle-item">
                <span class="label">Dueño:</span>
                <span class="value">{{ c.duenyo }}</span>
              </div>
              <div v-if="c.entrenador" class="detalle-item">
                <span class="label">Entrenador:</span>
                <span class="value">{{ c.entrenador }}</span>
              </div>
              <div v-if="c.hogar" class="detalle-item">
                <span class="label">Hogar:</span>
                <span class="value">{{ c.hogar }}</span>
              </div>
            </div>
            <button class="btn-mas-detalles">Más detalles</button>
          </div>
        </div>
      </div>

      <!-- Paginación: flechas debajo de las tarjetas -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" @click="goPrev" :disabled="currentPage === 1">‹</button>
        <span class="page-info">Página {{ currentPage }} / {{ totalPages }}</span>
        <button class="page-btn" @click="goNext" :disabled="currentPage === totalPages">›</button>
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
.lista-caballos {
  margin-top: 1rem;
  padding: 0 1rem;
}

h2 {
  margin-bottom: 1.5rem;
}

.caballos-container {
  display: grid;
  gap: 1.5rem;
  max-width: 1200px;
  /* 3 columnas con tamaño mínimo fijo (c/u mínimo ~420px), ocupan 1fr si hay espacio */
  grid-template-columns: repeat(3, minmax(420px, 1fr));
  justify-content: center;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-eliminar {
  padding: 0.45rem 0.8rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-eliminar:hover {
  background: #b02a37;
}

/* Responsive: 2 cols under 1000px, 1 col under 640px */
@media (max-width: 1000px) {
  .caballos-container { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .caballos-container { grid-template-columns: 1fr; }
}

.caballo-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
  transition: box-shadow 0.3s ease;
}

.caballo-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.caballo-header {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  align-items: flex-start;
}

.caballo-info {
  flex: 1;
}

.caballo-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #333;
}

.caballo-info .descripcion {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 0.95rem;
}

.caballo-imagen {
  flex-shrink: 0;
  width: 150px;
  height: 150px;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
}

.caballo-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.caballo-imagen-placeholder {
  flex-shrink: 0;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  color: #999;
  font-size: 0.9rem;
}

.btn-detalles {
  padding: 0.6rem 1.2rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s ease;
}

.btn-detalles:hover {
  background: #0056b3;
}

.detalles-panel {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-left: 4px solid #007bff;
  border-radius: 4px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detalles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detalle-item .label {
  font-weight: 600;
  color: #555;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detalle-item .value {
  color: #333;
  font-size: 0.95rem;
}

.btn-mas-detalles {
  padding: 0.6rem 1.2rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s ease;
}

.btn-mas-detalles:hover {
  background: #218838;
}

.error {
  padding: 1rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
  margin-bottom: 1rem;
}

.error small {
  display: block;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  margin-top: 0.5rem;
  background: #ffc107;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s ease;
}

.btn:hover {
  background: #ffb300;
}

/* Pagination styles */
.pagination { display:flex; gap:.75rem; align-items:center; justify-content:center; margin-top:1rem }
.page-btn { padding:.4rem .8rem; border-radius:4px; border:1px solid #ccc; background:#fff; cursor:pointer }
.page-btn:disabled { opacity:.45; cursor:not-allowed }
.page-info { font-weight:600 }
</style>
