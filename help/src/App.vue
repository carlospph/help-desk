<script setup>
import { useRouter } from 'vue-router'
import { auth } from '@/config/firebase'
import { signOut } from 'firebase/auth'

const router = useRouter()

const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push('/')
  } catch (error) {
    console.error('Erro ao deslogar:', error)
  }
}
</script>

<template>
  <div id="app">
    <!-- BARRA DE NAVEGAÇÃO / MENU -->
    <header class="navbar">
      <div class="logo">
        <span>HelpDesk</span>
      </div>

      <nav class="menu-links">
        <router-link to="/home" class="menu-item">Home</router-link>
        <router-link to="/" class="menu-item">Login</router-link>
        <router-link to="/novo-cadastro" class="menu-item">Cadastrar</router-link>
        <router-link to="/email-resetar-senha" class="menu-item">Resetar Senha</router-link>
      </nav>

     </header>

    <!-- ONDE AS VIEWS SERÃO EXIBIDAS -->
    <main class="conteudo-principal">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1e293b;
  padding: 12px 24px;
  color: #ffffff;
}

.logo span {
  font-size: 1.2rem;
  font-weight: bold;
  color: #38bdf8;
}

.menu-links {
  display: flex;
  gap: 16px;
}

.menu-item {
  color: #cbd5e1;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  color: #ffffff;
  background-color: #334155;
}

/* Estilo automático para o link da página ativa */
.router-link-active {
  background-color: #2563eb;
  color: #ffffff;
}
 

.conteudo-principal {
  padding: 20px;
}
</style>