<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { db } from '@/config/firebase'
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore'

// Estado reativo para a lista completa de instruções
const instrucoes = ref([])
const carregando = ref(true)
const erro = ref(null)

// Termo da busca
const busca = ref('')

// Controle de Paginação
const paginaAtual = ref(1)
const itensPorPagina = 5

// Estado do Modal de Edição
const exibirModalEdicao = ref(false)
const itemEmEdicao = ref({ id: '', title: '', text: '' })
const salvandoEdicao = ref(false)

// Estado do Modal de Cadastro (Nova Instrução)
const exibirModalCadastro = ref(false)
const novaInstrucao = ref({ title: '', text: '' })
const salvandoCadastro = ref(false)

// Controle de Exclusão
const processandoExclusao = ref(null)

// Estados para os Badges de Notificação
const idCopiado = ref(null)
const idAtualizado = ref(null)
const idCriado = ref(null)
const mensagemGeral = ref(null)

// Copiar o texto do card para a área de transferência
const copiarTexto = async (item) => {
  try {
    await navigator.clipboard.writeText(item.text)
    idCopiado.value = item.id
    
    setTimeout(() => {
      if (idCopiado.value === item.id) {
        idCopiado.value = null
      }
    }, 2500)
  } catch (err) {
    console.error('Erro ao copiar texto: ', err)
    alert('Não foi possível copiar o texto.')
  }
}

// Buscar dados na coleção 'instructions'
const buscarInstrucoes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'instructions'))
    const listaTemp = []
    
    querySnapshot.forEach((doc) => {
      listaTemp.push({
        id: doc.id,
        ...doc.data()
      })
    })

    instrucoes.value = listaTemp
  } catch (e) {
    console.error("Erro ao buscar instruções: ", e)
    erro.value = "Não foi possível carregar os dados."
  } finally {
    carregando.value = false
  }
}

// --- AÇÕES DO MODAL DE CADASTRO ---
const abrirModalCadastro = () => {
  novaInstrucao.value = { title: '', text: '' }
  exibirModalCadastro.value = true
}

const fecharModalCadastro = () => {
  if (salvandoCadastro.value) return
  exibirModalCadastro.value = false
}

const salvarNovaInstrucao = async () => {
  const tituloFormatado = novaInstrucao.value.title.trim()
  const textoFormatado = novaInstrucao.value.text.trim()

  if (!tituloFormatado || !textoFormatado) {
    alert('Preencha o título e o texto da instrução!')
    return
  }

  // Validação: Verificar se já existe um título idêntico (case-insensitive)
  const tituloExiste = instrucoes.value.some(
    item => item.title.trim().toLowerCase() === tituloFormatado.toLowerCase()
  )

  if (tituloExiste) {
    alert('Já existe uma instrução cadastrada com este título!')
    return
  }

  salvandoCadastro.value = true
  try {
    // Salva no Firestore
    const docRef = await addDoc(collection(db, 'instructions'), {
      title: tituloFormatado,
      text: textoFormatado
    })

    // Adiciona no início da lista local
    const novoItem = {
      id: docRef.id,
      title: tituloFormatado,
      text: textoFormatado
    }
    instrucoes.value.unshift(novoItem)

    // FECHA O MODAL AUTOMATICAMENTE APÓS SALVAR
    exibirModalCadastro.value = false

    // Ativa o Badge de "Criado" no card recém-adicionado
    idCriado.value = docRef.id
    paginaAtual.value = 1 // Garante que o usuário veja o novo item no topo
    
    setTimeout(() => {
      if (idCriado.value === docRef.id) {
        idCriado.value = null
      }
    }, 3500)

  } catch (e) {
    console.error('Erro ao cadastrar instrução:', e)
    alert('Não foi possível cadastrar a instrução.')
  } finally {
    salvandoCadastro.value = false
  }
}

// --- AÇÕES DO MODAL DE EDIÇÃO ---
const abrirModalEdicao = (item) => {
  itemEmEdicao.value = { ...item }
  exibirModalEdicao.value = true
}

const fecharModalEdicao = () => {
  if (salvandoEdicao.value) return
  exibirModalEdicao.value = false
}

const salvarEdicao = async () => {
  const tituloFormatado = itemEmEdicao.value.title.trim()
  const textoFormatado = itemEmEdicao.value.text.trim()
  const idEditado = itemEmEdicao.value.id

  if (!tituloFormatado || !textoFormatado) {
    alert('Preencha o título e o texto!')
    return
  }

  // Validação: Verificar título duplicado na edição (ignorando o próprio item em edição)
  const tituloExiste = instrucoes.value.some(
    item => item.id !== idEditado && item.title.trim().toLowerCase() === tituloFormatado.toLowerCase()
  )

  if (tituloExiste) {
    alert('Já existe outra instrução cadastrada com este título!')
    return
  }

  salvandoEdicao.value = true

  try {
    const docRef = doc(db, 'instructions', idEditado)
    await updateDoc(docRef, {
      title: tituloFormatado,
      text: textoFormatado
    })

    const index = instrucoes.value.findIndex(item => item.id === idEditado)
    if (index !== -1) {
      instrucoes.value[index] = { 
        id: idEditado, 
        title: tituloFormatado, 
        text: textoFormatado 
      }
    }

    // FECHA O MODAL AUTOMATICAMENTE APÓS ATUALIZAR
    exibirModalEdicao.value = false

    idAtualizado.value = idEditado
    setTimeout(() => {
      if (idAtualizado.value === idEditado) {
        idAtualizado.value = null
      }
    }, 3000)

  } catch (e) {
    console.error('Erro ao atualizar instrução:', e)
    alert('Não foi possível salvar as alterações.')
  } finally {
    salvandoEdicao.value = false
  }
}

// --- AÇÃO DE EXCLUSÃO ---
const excluirInstrucao = async (id) => {
  if (!confirm('Tem certeza que deseja excluir esta instrução?')) return

  processandoExclusao.value = id
  try {
    await deleteDoc(doc(db, 'instructions', id))
    instrucoes.value = instrucoes.value.filter(item => item.id !== id)
    
    mensagemGeral.value = 'Instrução excluída com sucesso! 🗑️'
    setTimeout(() => {
      mensagemGeral.value = null
    }, 3000)

  } catch (e) {
    console.error('Erro ao excluir instrução:', e)
    alert('Não foi possível excluir a instrução.')
  } finally {
    processandoExclusao.value = null
  }
}

// Filtro de busca
const instrucoesFiltradas = computed(() => {
  const termo = busca.value.toLowerCase().trim()
  if (!termo) return instrucoes.value

  return instrucoes.value.filter((item) => {
    const titulo = (item.title || '').toLowerCase()
    const texto = (item.text || '').toLowerCase()
    return titulo.includes(termo) || texto.includes(termo)
  })
})

// Voltar para a página 1 ao pesquisar
watch(busca, () => {
  paginaAtual.value = 1
})

// Cálculo de páginas
const totalPaginas = computed(() => {
  return Math.ceil(instrucoesFiltradas.value.length / itensPorPagina) || 1
})

// Itens paginados
const instrucoesPaginadas = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina
  const fim = inicio + itensPorPagina
  return instrucoesFiltradas.value.slice(inicio, fim)
})

// Navegação
const proximaPagina = () => {
  if (paginaAtual.value < totalPaginas.value) paginaAtual.value++
}

const paginaAnterior = () => {
  if (paginaAtual.value > 1) paginaAtual.value--
}

onMounted(() => {
  buscarInstrucoes()
})
</script>

<template>
  <div class="container">
    <div class="header-top">
      <h2>Lista de Instruções</h2>
      <button @click="abrirModalCadastro" class="btn btn-sucesso btn-novo">
        + Nova Instrução
      </button>
    </div>

    <!-- BADGE DE NOTIFICAÇÃO GERAL (EXCLUSÃO) -->
    <div v-if="mensagemGeral" class="badge-notificacao-geral">
      {{ mensagemGeral }}
    </div>

    <!-- Campo de Busca -->
    <div class="busca-box" v-if="!carregando && !erro">
      <input 
        v-model="busca" 
        type="text" 
        placeholder="Buscar por título ou texto..." 
        class="input-busca"
      />
    </div>

    <!-- Status -->
    <div v-if="carregando" class="status">Carregando instruções...</div>
    <div v-else-if="erro" class="status erro">{{ erro }}</div>

    <!-- Lista Vazia -->
    <div v-else-if="instrucoesFiltradas.length === 0" class="status">
      <template v-if="busca">Nenhuma instrução encontrada para "{{ busca }}".</template>
      <template v-else>Nenhuma instrução cadastrada.</template>
    </div>

    <!-- Cards da Lista -->
    <div v-else>
      <ul class="lista">
        <li v-for="item in instrucoesPaginadas" :key="item.id" class="card">
          <div class="card-header">
            <h3>{{ item.title }}</h3>
            
            <div class="badges-container">
              <!-- BADGE DE CRIAÇÃO -->
              <span v-if="idCriado === item.id" class="badge badge-criado">
                Instrução adicionada ➕
              </span>

              <!-- BADGE DE CÓPIA -->
              <span v-if="idCopiado === item.id" class="badge badge-copiado">
                Instrução copiada ✓
              </span>

              <!-- BADGE DE EDIÇÃO -->
              <span v-if="idAtualizado === item.id" class="badge badge-atualizado">
                Instrução atualizada ✏️
              </span>
            </div>
          </div>

          <p>{{ item.text }}</p>
          
          <div class="acoes-card">
            <button @click="copiarTexto(item)" class="btn btn-copiar">
              Copiar
            </button>

            <button @click="abrirModalEdicao(item)" class="btn btn-alerta">
              Editar
            </button>

            <button 
              @click="excluirInstrucao(item.id)" 
              :disabled="processandoExclusao === item.id"
              class="btn btn-perigo"
            >
              {{ processandoExclusao === item.id ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </li>
      </ul>

      <!-- Paginação -->
      <div class="paginacao">
        <button @click="paginaAnterior" :disabled="paginaAtual === 1" class="btn">Anterior</button>
        <span>Página {{ paginaAtual }} de {{ totalPaginas }}</span>
        <button @click="proximaPagina" :disabled="paginaAtual === totalPaginas" class="btn">Próximo</button>
      </div>
    </div>

    <!-- MODAL DE CADASTRO (ADICIONAR) -->
    <div v-if="exibirModalCadastro" class="modal-overlay" @click.self="fecharModalCadastro">
      <div class="modal-content">
        <h3>Nova Instrução</h3>

        <div class="form-group">
          <label>Título</label>
          <input 
            v-model="novaInstrucao.title" 
            type="text" 
            class="input-field" 
            placeholder="Ex: Como fazer Deploy no Firebase"
          />
        </div>

        <div class="form-group">
          <label>Texto</label>
          <textarea 
            v-model="novaInstrucao.text" 
            class="textarea-field" 
            rows="4" 
            placeholder="Digite o passo a passo da instrução..."
          ></textarea>
        </div>

        <div class="modal-actions">
          <button @click="salvarNovaInstrucao" :disabled="salvandoCadastro" class="btn btn-sucesso">
            {{ salvandoCadastro ? 'Salvando...' : 'Cadastrar Instrução' }}
          </button>
          <button @click="fecharModalCadastro" :disabled="salvandoCadastro" class="btn btn-secundario">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE EDIÇÃO -->
    <div v-if="exibirModalEdicao" class="modal-overlay" @click.self="fecharModalEdicao">
      <div class="modal-content">
        <h3>Editar Instrução</h3>

        <div class="form-group">
          <label>Título</label>
          <input 
            v-model="itemEmEdicao.title" 
            type="text" 
            class="input-field" 
            placeholder="Digite o título"
          />
        </div>

        <div class="form-group">
          <label>Texto</label>
          <textarea 
            v-model="itemEmEdicao.text" 
            class="textarea-field" 
            rows="4" 
            placeholder="Digite a instrução"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button @click="salvarEdicao" :disabled="salvandoEdicao" class="btn btn-sucesso">
            {{ salvandoEdicao ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
          <button @click="fecharModalEdicao" :disabled="salvandoEdicao" class="btn btn-secundario">
            Cancelar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 20px auto;
  padding: 16px;
  position: relative;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-top h2 {
  margin: 0;
  color: #1e293b;
}

.busca-box {
  margin-bottom: 20px;
}

.input-busca {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.status {
  padding: 12px;
  text-align: center;
  color: #666;
}

.status.erro {
  color: #dc2626;
}

.lista {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card h3 {
  margin: 0;
  color: #1e293b;
}

.card p {
  margin: 0 0 12px 0;
  color: #475569;
}

.badges-container {
  display: flex;
  gap: 6px;
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  animation: fadeIn 0.3s ease-in-out;
}

.badge-criado {
  background-color: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}

.badge-copiado {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.badge-atualizado {
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.badge-notificacao-geral {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
  padding: 10px 16px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.acoes-card {
  display: flex;
  gap: 8px;
}

.paginacao {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #1e293b;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.input-field, .textarea-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.btn-novo {
  font-size: 0.9rem;
  padding: 8px 14px;
}

.btn-copiar {
  background-color: #0284c7;
  padding: 6px 12px;
  font-size: 0.875rem;
}

.btn-alerta {
  background-color: #f59e0b;
  padding: 6px 12px;
  font-size: 0.875rem;
}

.btn-perigo {
  background-color: #ef4444;
  padding: 6px 12px;
  font-size: 0.875rem;
}

.btn-sucesso {
  background-color: #10b981;
}

.btn-secundario {
  background-color: #64748b;
}
</style>