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
  nombre: '',
  descripcion: '',
  descripcion_larga: '',
  color: '',
  sexo: '',
  fecha_nacimiento: '',
  fecha_retiramiento: '',
  fecha_fallecimiento: '',
  duenyo: '',
  entrenador: '',
  hogar: '',
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
  <div class="caballo-form">
    <h2>Formulario de Caballo</h2>
    <form @submit.prevent="onSubmit">
      <div>
        <label for="nombre">Nombre:</label>
        <input type="text" id="nombre" v-model="form.nombre" required />
      </div>

      <div>
        <label for="descripcion">Descripcion:</label>
        <input type="text" id="descripcion" v-model="form.descripcion" required />
      </div>

      <div>
        <label for="descripcionLarga">Descripcion larga:</label>
        <input type="text" id="descripcionLarga" v-model="form.descripcion_larga" required />
      </div>

      <div>
        <label for="color">Color:</label>
        <input type="text" id="color" v-model="form.color" required />
      </div>

      <div> 
        <label for="sexo">Sexo:</label>
        <input type="text" id="sexo" v-model="form.sexo" required />
      </div>
      
      <div>
        <label for="fechaNacimiento">Fecha de Nacimiento:</label>
        <input type="date" id="fechaNacimiento" v-model="form.fecha_nacimiento" />
      </div>

      <div>
        <label for="fechaRetiro">Fecha de Retiro:</label>
        <input type="date" id="fechaRetiro" v-model="form.fecha_retiramiento" />
      </div>

      <div>
        <label for="fechaFallecimiento">Fecha de Fallecimiento:</label>
        <input type="date" id="fechaFallecimiento" v-model="form.fecha_fallecimiento" />
      </div>

      <div>
        <label for="duenyo">Dueño:</label>
        <input type="text" id="duenyo" v-model="form.duenyo" required />
      </div>

      <div>
        <label for="entrenador">Entrenador:</label>
        <input type="text" id="entrenador" v-model="form.entrenador" required />
      </div>

      <div>
        <label for="hogar">Hogar:</label>
        <input type="text" id="hogar" v-model="form.hogar" required />
      </div>

      <button type="submit" :disabled="disabled">{{ submitLabel }}</button>
    </form>
  </div>
</template>

<style scoped>
.caballo-form {
    min-width: 500px;
    margin: auto;
}

.caballo-form div {
    margin-bottom: 1rem;
}

.caballo-form label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.caballo-form input {
    width: 100%;
    padding: 0.5rem;
    box-sizing: border-box;
}
.caballo-form button {
    padding: 0.75rem 1.5rem;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>