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
.login-page { display:flex; justify-content:center; padding:2rem; }
.login-form { min-width:500px; margin:auto; display:flex; flex-direction:column; gap:1rem; }
.login-form h2 { margin:0 0 1rem; font-size:1.75rem; color:#333; text-align:center; color: white; }
.login-form label { display:block; margin-bottom:0.5rem; font-weight:bold; }
.login-form input { width:100%; padding:0.5rem; box-sizing:border-box; border:1px solid #ccc; border-radius:4px; }
.login-form input:focus { outline:none; border-color:#42b983; box-shadow:0 0 0 2px rgba(66,184,131,0.15); }
.submit-btn { padding:0.75rem 1.5rem; background:#42b983; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:600; margin-top: 1rem;}
.submit-btn:hover { background:#369e6c; }
.submit-btn:disabled { opacity:.6; cursor:not-allowed; }
.error { margin-top:0.75rem; padding:0.6rem 0.75rem; background:#f8d7da; border:1px solid #f5c6cb; border-radius:4px; color:#721c24; font-size:.9rem; text-align:center; }
@media (max-width:640px){ .login-form { min-width:100%; } }
</style>