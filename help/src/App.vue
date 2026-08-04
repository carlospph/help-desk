<script setup>
import { ref } from 'vue'
import { auth } from '@/config/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

// Estados do Formulário
const email = ref('')
const senha = ref('')
const carregando = ref(false)

// Feedbacks visuais (Badges / Mensagens)
const mensagemSucesso = ref('')
const mensagemErro = ref('')

// Exibir feedback temporário
const notificarErro = (msg) => {
  mensagemErro.value = msg
  setTimeout(() => { mensagemErro.value = '' }, 4000)
}

const notificarSucesso = (msg) => {
  mensagemSucesso.value = msg
  setTimeout(() => { mensagemSucesso.value = '' }, 3000)
}

// Fazer Login com E-mail e Senha
const handleLogin = async () => {
  if (!email.value || !senha.value) {
    notificarErro('Preencha todos os campos.')
    return
  }

  carregando.value = true
  mensagemErro.value = ''

  try {
    await signInWithEmailAndPassword(auth, email.value, senha.value)
    notificarSucesso('Login realizado com sucesso! 👋')
    
    // Limpa os campos após autenticar
    email.value = ''
    senha.value = ''
  } catch (error) {
    console.error(error.code)
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        notificarErro('E-mail ou senha incorretos.')
        break
      case 'auth/too-many-requests':
        notificarErro('Muitas tentativas sem sucesso. Tente novamente mais tarde.')
        break
      default:
        notificarErro('Erro ao realizar o login.')
    }
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="card-login">
      <h2>Entrar na Conta</h2>

      <!-- BADGES DE FEEDBACK -->
      <div v-if="mensagemSucesso" class="badge badge-sucesso">
        {{ mensagemSucesso }}
      </div>
      <div v-if="mensagemErro" class="badge badge-erro">
        {{ mensagemErro }}
      </div>

      <form @submit.prevent="handleLogin" class="form-login">
        <div class="form-group">
          <label>E-mail</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="seu@email.com" 
            class="input-field"
            required
          />
        </div>

        <div class="form-group">
          <div class="label-com-link">
            <label>Senha</label>
            <!-- LINK ESQUECI MINHA SENHA -->
            <router-link to="/email-resetar-senha" class="link-esqueci">
              Esqueci minha senha
            </router-link>
          </div>
          <input 
            v-model="senha" 
            type="password" 
            placeholder="••••••••" 
            class="input-field"
            required
          />
        </div>

        <button type="submit" :disabled="carregando" class="btn btn-principal">
          {{ carregando ? 'Aguarde...' : 'Entrar' }}
        </button>
      </form>

      <!-- LINK PARA NOVO CADASTRO -->
      <div class="link-cadastro">
        <p>
          Não tem uma conta? 
          <router-link to="/novo-cadastro">Cadastre-se aqui</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 16px;
}

.card-login {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-login h2 {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  color: #1e293b;
}

/* BADGES DE NOTIFICAÇÃO */
.badge {
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;
}

.badge-sucesso {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.badge-erro {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-login {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-com-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.link-esqueci {
  font-size: 0.8rem;
  color: #2563eb;
  text-decoration: none;
}

.link-esqueci:hover {
  text-decoration: underline;
}

.input-field {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.btn-principal {
  background-color: #2563eb;
  color: white;
}

.btn-principal:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.link-cadastro {
  margin-top: 20px;
  text-align: center;
  font-size: 0.9rem;
  color: #64748b;
}

.link-cadastro a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.link-cadastro a:hover {
  text-decoration: underline;
}
</style>