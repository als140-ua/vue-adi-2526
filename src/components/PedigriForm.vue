<script setup>

import { ref, onMounted } from 'vue';
import { useCaballosStore } from '../stores/caballosStore.js';
import { createPedigri, getCaballoById } from '../backend/caballoService.js';
import router from '@/router/index.js';


const emit = defineEmits(['submit'])

// Inicializar el store
const caballosStore = useCaballosStore()

const form = ref({
    id_caballo: '',
    id_ascendiente: '',
    nombre_ascendiente: '',
    tipo_relacion: ''
})

onMounted(async () => {
  // Cargar caballos si no están ya cargados
  if (caballosStore.caballos.length === 0) {
    await caballosStore.loadCaballos()
  }
})

const handleCreatePedigri = async () => {
    
    try{

        const caballoAscendiente = await getCaballoById(form.value.id_ascendiente)
        form.value.nombre_ascendiente = caballoAscendiente.nombre
    }catch(e){
        alert('Error durante la recuperación del nombre del ascendiente')
        console.error(e)
    }

    if(form.value.nombre_ascendiente){
        try{
            await createPedigri(form.value)
            alert('Pedigri creado con éxito')
            router.push('/')
        }catch(e){
            alert('Error al crear el pedigrí')
        }
    }else{
        alert('No se recuperó el nombre del ascendiente')
    }
}

</script>

<template>
  <Transition name="content" mode="out-in" appear>
    <div key="pedigri-form-content" class="card shadow-sm p-4">
      <h2 class="h4 mb-3">Crear Pedigrí</h2>
      <form @submit.prevent="handleCreatePedigri" class="pedigri-form">
        <div class="mb-3">
          <label class="form-label" for="caballo">Caballo</label>
          <select id="caballo" class="form-select" v-model="form.id_caballo">
            <option value="">Ninguno</option>
            <option v-for="caballo in caballosStore.caballos" :key="caballo.id" :value="caballo.id">
              {{ caballo.nombre }}
            </option>
          </select>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label" for="ascendiente">Ascendiente</label>
            <select id="ascendiente" class="form-select" v-model="form.id_ascendiente">
              <option value="">Ninguno</option>
              <option v-for="caballo in caballosStore.caballos" :key="caballo.id" :value="caballo.id">
                {{ caballo.nombre }}
              </option>
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label" for="tipo_relacion">Tipo relación</label>
            <select id="tipo_relacion" class="form-select" v-model="form.tipo_relacion">
              <option value="">Seleccione</option>
              <option value="Padre">Padre</option>
              <option value="Madre">Madre</option>
              <option value="Abuelo paterno">Abuelo paterno</option>
              <option value="Abuela paterna">Abuela paterna</option>
              <option value="Abuelo materno">Abuelo materno</option>
              <option value="Abuela materna">Abuela materna</option>
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="caballosStore.loading">
          <span v-if="!caballosStore.loading">Crear</span>
          <span v-else>Cargando…</span>
        </button>
      </form>
    </div>
  </Transition>
</template>

<style scoped>
.pedigri-form {
    min-width: 500px;
    margin: auto;
}

/* Transitions for mount/unmount of the form content */
.content-enter-active, .content-leave-active, .content-appear-active { transition: all 0.4s ease; }
.content-enter-from, .content-appear-from { opacity: 0; transform: translateY(20px); }
.content-leave-to { opacity: 0; transform: translateY(-20px); }

.pedigri-form div {
    margin-bottom: 1rem;
}

.pedigri-form label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.submit-btn {
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.pedigri-form select {
    width: 100%;
    padding: 0.5rem;
    box-sizing: border-box;
}



</style>
