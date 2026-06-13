export interface Produto {
  id: string
  codigo: string
  nome: string
  categoria: string
  unidade: string
  estoqueMin: number
  saldo: number
}

export interface Movimento {
  id: string
  produtoId: string
  produtoNome: string
  tipo: 'entrada' | 'saida'
  qtd: number
  obs: string
  data: string
  // Campos de transferência (saída)
  responsavel?: string
  empresaDestino?: string
}

export type TabId = 'dashboard' | 'saldo' | 'produtos' | 'historico'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}
