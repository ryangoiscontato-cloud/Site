export type Empresa = 'PESTLINE' | 'ULTRALIGHT' | 'UL BRASIL' | 'ULTRA FOODS' | 'PESTSTORE'

export const EMPRESAS: Empresa[] = ['PESTLINE', 'ULTRALIGHT', 'UL BRASIL', 'ULTRA FOODS', 'PESTSTORE']

export interface Produto {
  id: string
  codigo: string
  nome: string
  categoria: string
  unidade: string
  estoqueMin: number
  saldo: number
  codigoBarras?: string
  empresa?: Empresa
}

export type UserRole = 'admin' | 'user' | 'chaparia' | 'almoxarifado' | 'expedicao' | 'montagem'

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
  empresa?: Empresa
}

export interface PausaOrdem {
  motivo: string
  inicio: string
  fim?: string
}

export interface ItemPedido {
  produtoId: string
  produtoNome: string
  quantidade: number
}

export interface OrdemProducao {
  id: string
  tipo: 'chaparia' | 'almoxarifado' | 'montagem'
  status: 'pendente' | 'em_producao' | 'pausada' | 'concluida' | 'cancelada'
  produtoId: string
  produtoNome: string
  quantidade: number
  petgQuantidade?: number
  linha?: string
  tipoPedido?: 'estoque' | 'pedido'
  pedidoNumero?: string
  previsaoEntrega?: string
  itensPedido?: ItemPedido[]
  obs: string
  criadoPor: string
  criadoEm: string
  iniciadoEm?: string
  concluidoEm?: string
  usuarioDestino: 'CHAPARIA' | 'ALMOXARIFADO' | 'MONTAGEM'
  pausas: PausaOrdem[]
}

export type TabId = 'dashboard' | 'saldo' | 'produtos' | 'historico' | 'producao'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}
