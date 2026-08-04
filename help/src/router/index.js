import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ViewNovoCadastro from '../views/ViewNovoCadastro.vue'
import ViewEmailResetarSenha from '../views/ViewEmailResetarSenha.vue' // Adicionada a view de redefinição

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/novo-cadastro',
      name: 'novo-cadastro',
      component: ViewNovoCadastro,
    },
    {
      path: '/email-resetar-senha',
      name: 'email-resetar-senha',
      component: ViewEmailResetarSenha,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router