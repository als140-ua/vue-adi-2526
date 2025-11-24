<script setup>

import { ref, watch, onMounted } from 'vue';
import { useCaballosStore } from '../stores/caballosStore.js';

const emit = defineEmits(['submit'])

const props = defineProps({
  // Datos iniciales para modo "editar"
  initial: { type: Object, default: () => ({}) },
  // Texto del botón
  submitLabel: { type: String, default: 'Guardar' },
  // Deshabilitar el submit desde fuera si hace falta
  disabled: { type: Boolean, default: false },
})

// Inicializar el store
const caballosStore = useCaballosStore()

const form = ref({
  titulo: '',
  contenido: '',
  fecha: '',
  url_video: '',
  caballo_id: ''
})

onMounted(async () => {
  // Cargar caballos si no están ya cargados
  if (caballosStore.caballos.length === 0) {
    await caballosStore.loadCaballos()
  }
})

function applyInitial(data) {
  if (!data) return
  form.value = { ...form.value, ...data }
}

// Inicializa y reacciona a cambios en initial (útil al cargar datos de edición)
applyInitial(props.initial)
watch(() => props.initial, (val) => applyInitial(val), { deep: true })

function onSubmit() {
  // JSON-ready payload
  emit('submit', { ...form.value })
}

</script>

<template>
  <div class="noticia-form card shadow-sm p-4">
    <h2 class="h4 mb-3">Formulario de Noticia</h2>
    <Transition name="content" mode="out-in" appear>
      <div key="noticia-form-content">
        <form @submit.prevent="onSubmit">
          <div class="mb-3">
            <label for="titulo" class="form-label">Título</label>
            <input class="form-control" type="text" id="titulo" v-model="form.titulo" required />
          </div>
          <div class="mb-3">
            <label for="contenido" class="form-label">Contenido</label>
            <textarea class="form-control" id="contenido" v-model="form.contenido" rows="4" required></textarea>
          </div>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label for="fecha" class="form-label">Fecha</label>
              <input class="form-control" type="date" id="fecha" v-model="form.fecha" required />
            </div>
            <div class="col-md-8 mb-3">
              <label for="url_video" class="form-label">URL Video</label>
              <input class="form-control" type="url" id="url_video" v-model="form.url_video" />
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Caballo relacionado</label>
            <select class="form-select" v-model="form.caballo_id">
              <option value="">Ninguno</option>
              <option v-for="caballo in caballosStore.caballos" :key="caballo.id" :value="caballo.id">
                {{ caballo.nombre }}
              </option>
            </select>
          </div>
          <button type="submit" :disabled="disabled" class="btn btn-success w-100">{{ submitLabel }}</button>
        </form>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.noticia-form {
    min-width: 500px;
    margin: auto;
}

/* Transitions for mount/unmount of the form content */
.content-enter-active, .content-leave-active, .content-appear-active { transition: all 0.4s ease; }
.content-enter-from, .content-appear-from { opacity: 0; transform: translateY(20px); }
.content-leave-to { opacity: 0; transform: translateY(-20px); }

.noticia-form div {
    margin-bottom: 1rem;
}

.noticia-form label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.noticia-form textarea {
    width: 100%;
    height: 100px;
    padding: 0.5rem;
    box-sizing: border-box;
}

.noticia-form input {
    width: 100%;
    padding: 0.5rem;
    box-sizing: border-box;
}
.noticia-form button {
    padding: 0.75rem 1.5rem;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.noticia-form select {
    width: 100%;
    padding: 0.5rem;
    box-sizing: border-box;
}

</style>