<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';


const router = useRouter();
const email = ref('');
const password = ref('');
const authStore = useAuthStore();

const handleLogin = async () => {
    authStore.clearError();
    try {
        await authStore.login(email.value, password.value);
        router.push('/');
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
    } 
    
};

</script>

<template>
    <div class="login-page">
        <div class="login-form">
            <h2>Login</h2>
            <form @submit.prevent="handleLogin">
                <div>
                    <label for="email" class="label-login">Email</label>
                    <input type="email" id="email" v-model="email" required />
                </div>

                <div>
                    <label for="password" class="label-login">Password</label>
                    <input type="password" id="password" v-model="password" required />
                </div>

                <button type="submit" class="submit-btn" :disabled="authStore.loading">
                    <span v-if="!authStore.loading">Acceder</span>
                    <span v-else>Cargando…</span>
                </button>

                <div v-if="authStore.error" class="error">{{ authStore.error }}</div>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Layout centrado de la página */
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  min-height: calc(100vh - 4rem);
  box-sizing: border-box;
  background: transparent;
}

/* Tarjeta del formulario */
.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-background, #ffffff);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 8px 24px rgba(16,24,40,0.06);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Título */
.login-card h2 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  color: var(--color-heading, #2c3e50);
  text-align: center;
}

/* Formulario y campos */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid #e6e9ee;
  border-radius: 8px;
  font-size: 0.98rem;
  background: transparent;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
  color: var(--color-text, #222);
}

.input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 4px 12px rgba(66,184,131,0.08);
}

/* Botón principal */
.submit-btn {
  margin-top: 1rem;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(180deg, #42b883, #2d9a63);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:active { transform: translateY(1px); }
.btn:disabled { opacity: 0.65; cursor: not-allowed; }

/* Mensaje de error */
.error {
  margin-top: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: #fff3f3;
  color: #9b1c1c;
  border: 1px solid #ffd6d6;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

/* Estilos para las etiquetas de formulario */
.label-login {
  font-weight: 600;
  color: var(--color-text, #222);
  margin-right: 0.5rem;
  margin-bottom: 1rem;
}

/* Responsividad */
@media (max-width: 480px) {
  .login-card { padding: 1rem; border-radius: 10px; }
  .input { padding: 0.66rem 0.75rem; }
  .btn { padding: 0.66rem; }
}

/* Dark scheme fallback */
@media (prefers-color-scheme: dark) {
  .login-card {
    background: rgba(20, 24, 28, 0.6);
    border: 1px solid rgba(255,255,255,0.04);
    box-shadow: none;
  }
  .input {
    border: 1px solid rgba(255,255,255,0.06);
    color: var(--color-text, #eee);
    background: rgba(255,255,255,0.02);
  }
  .btn { background: linear-gradient(180deg,#3fbf97,#2b8e68); }
  .error { background: rgba(255, 50, 50, 0.06); color: #ffc6c6; border: 1px solid rgba(255,50,50,0.12); }
}
</style>