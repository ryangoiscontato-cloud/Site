import type { Produto, Movimento } from './types'
import { uid } from './utils'

export function buildSeedData(): { produtos: Produto[]; historico: Movimento[] } {
  const p: Produto[] = [
    { id: uid(), codigo: 'PRD-001', nome: 'Parafuso M6 x 25mm', categoria: 'Fixação',     unidade: 'un',  estoqueMin: 100, saldo: 450 },
    { id: uid(), codigo: 'PRD-002', nome: 'Cabo de Aço 3mm',     categoria: 'Cabos',       unidade: 'm',   estoqueMin: 50,  saldo: 120 },
    { id: uid(), codigo: 'PRD-003', nome: 'Tecido Ripstop Azul', categoria: 'Tecidos',     unidade: 'm²',  estoqueMin: 20,  saldo: 18  },
    { id: uid(), codigo: 'PRD-004', nome: 'Fivela de Ajuste',    categoria: 'Componentes', unidade: 'un',  estoqueMin: 50,  saldo: 0   },
    { id: uid(), codigo: 'PRD-005', nome: 'Resina Epóxi 500g',   categoria: 'Químicos',    unidade: 'un',  estoqueMin: 10,  saldo: 32  },
    { id: uid(), codigo: 'PRD-006', nome: 'Espuma EVA 10mm',     categoria: 'Espumas',     unidade: 'm²',  estoqueMin: 15,  saldo: 60  },
  ]

  const ago = (days: number) => new Date(Date.now() - 86_400_000 * days).toISOString()

  const h: Movimento[] = [
    { id: uid(), produtoId: p[0].id, produtoNome: p[0].nome, tipo: 'entrada', qtd: 500, obs: 'Compra inicial',   data: ago(5) },
    { id: uid(), produtoId: p[0].id, produtoNome: p[0].nome, tipo: 'saida',   qtd: 50,  obs: 'Montagem lote 01', data: ago(3) },
    { id: uid(), produtoId: p[1].id, produtoNome: p[1].nome, tipo: 'entrada', qtd: 200, obs: 'Compra inicial',   data: ago(4) },
    { id: uid(), produtoId: p[1].id, produtoNome: p[1].nome, tipo: 'saida',   qtd: 80,  obs: 'Produção',         data: ago(2) },
    { id: uid(), produtoId: p[2].id, produtoNome: p[2].nome, tipo: 'entrada', qtd: 50,  obs: 'Compra fornecedor',data: ago(6) },
    { id: uid(), produtoId: p[2].id, produtoNome: p[2].nome, tipo: 'saida',   qtd: 32,  obs: 'Corte produção',   data: ago(1) },
  ]

  return { produtos: p, historico: h }
}
