<script setup>

import NoticiaForm from '../components/NoticiaForm.vue'
import { useRouter } from 'vue-router';
import { createNoticia } from '../backend/noticiaService';

const router = useRouter();

async function handleCrearNoticia(payload){
    try {
        await createNoticia(payload);
        alert('Noticia creada con éxito');
        router.push('/noticias'); // Redirigir a la página principal de noticias
    } catch (error) {
        alert('Error al crear la noticia: ' + error.message);
    }
}

</script>

<template>
  <main>
    <NoticiaForm submit-label="Crear Noticia" @submit="handleCrearNoticia"/>

  </main>
</template>