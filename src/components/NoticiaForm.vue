<script setup>

import { ref, watch } from 'vue';

const emit = defineEmits(['submit'])

const props = defineProps({
  // Datos iniciales para modo "editar"
  initial: { type: Object, default: () => ({}) },
  // Texto del botón
  submitLabel: { type: String, default: 'Guardar' },
  // Deshabilitar el submit desde fuera si hace falta
  disabled: { type: Boolean, default: false },
})

const form = ref({
  titulo: '',
  contenido: '',
  fecha: '',
  url_video: ''
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
  <div class="noticia-form">
    <h2>Formulario de Noticia</h2>
    <form @submit.prevent="onSubmit">
      <div>
        <label for="titulo">Título:</label>
        <input type="text" id="titulo" v-model="form.titulo" required />
      </div>

      <div>
        <label for="contenido">Contenido:</label>
        <textarea id="contenido" v-model="form.contenido" required></textarea>
      </div>

      <div>
        <label for="fecha">Fecha:</label>
        <input type="date" id="fecha" v-model="form.fecha" required />
      </div>

      <div>
        <label for="url_video">URL del Video:</label>
        <input type="url" id="url_video" v-model="form.url_video" />
      </div>

      <button type="submit" :disabled="disabled">{{ submitLabel }}</button>
    </form>
  </div>

</template>

<style scoped>
.noticia-form {
    min-width: 500px;
    margin: auto;
}

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
</style>