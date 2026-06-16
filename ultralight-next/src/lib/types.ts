export interface Produto {
  id: string
  codigo: string
  nome: string
  categoria: string
  unidade: string
  estoqueMin: number
  saldo: number
  codigoBarras?: string
}

export type UserRole = 'admin' | 'user' | 'chaparia' | 'almoxarifado'

export interface Usuario {
  id: string
  username: string
  role: UserRole
}

export interface Movimento {
  id: string
  produtoId: string
  produtoNome: string
  tipo: 'entrada' | 'saida'
  qtd: number
  obs: string
  data: string
  responsavel?: string
  empresaDestino?: string
  usuarioId?: string
  usuarioNome?: string
}

export interface PausaOrdem {
  motivo: string
  inicio: string
  fim?: string
}

export interface OrdemProducao {
  id: string
  tipo: 'chaparia' | 'almoxarifado'
  status: 'pendente' | 'em_producao' | 'pausada' | 'concluida'
  produtoId: string
  produtoNome: string
  quantidade: number
  petgQuantidade?: number
  obs: string
  criadoPor: string
  criadoEm: string
  iniciadoEm?: string
  concluidoEm?: string
  usuarioDestino: 'CHAPARIA' | 'ALMOXARIFADO'
  pausas: PausaOrdem[]
}

export type TabId = 'dashboard' | 'saldo' | 'produtos' | 'historico' | 'producao'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}
