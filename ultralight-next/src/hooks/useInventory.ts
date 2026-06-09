'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Produto, Movimento } from '@/lib/types'
import { uid } from '@/lib/utils'
import { buildSeedData } from '@/lib/seed'

const KEYS = { produtos: 'ul_produtos', historico: 'ul_historico' }

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback }
  catch { return fallback }
}

function save<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val))
}

export function useInventory() {
  const [produtos, setProdutosState]   = useState<Produto[]>([])
  const [historico, setHistoricoState] = useState<Movimento[]>([])
  const [hydrated, setHydrated]        = useState(false)

  useEffect(() => {
    const p = load<Produto[]>(KEYS.produtos, [])
    const h = load<Movimento[]>(KEYS.historico, [])
    if (p.length === 0) {
      const seed = buildSeedData()
      save(KEYS.produtos, seed.produtos)
      save(KEYS.historico, seed.historico)
      setProdutosState(seed.produtos)
      setHistoricoState(seed.historico)
    } else {
      setProdutosState(p)
      setHistoricoState(h)
    }
    setHydrated(true)
  }, [])

  const setProdutos = useCallback((val: Produto[]) => {
    save(KEYS.produtos, val)
    setProdutosState(val)
  }, [])

  const setHistorico = useCallback((val: Movimento[]) => {
    save(KEYS.historico, val)
    setHistoricoState(val)
  }, [])

  // ── Entrada ──────────────────────────────────────────────────────────────
  const registrarEntrada = useCallback((produtoId: string, qtd: number, obs: string) => {
    setProdutos(produtos.map(p => p.id === produtoId ? { ...p, saldo: p.saldo + qtd } : p))
    const produto = produtos.find(p => p.id === produtoId)!
    setHistorico([...historico, { id: uid(), produtoId, produtoNome: produto.nome, tipo: 'entrada', qtd, obs, data: new Date().toISOString() }])
  }, [produtos, historico, setProdutos, setHistorico])

  // ── Saída ─────────────────────────────────────────────────────────────────
  const registrarSaida = useCallback((produtoId: string, qtd: number, obs: string) => {
    setProdutos(produtos.map(p => p.id === produtoId ? { ...p, saldo: p.saldo - qtd } : p))
    const produto = produtos.find(p => p.id === produtoId)!
    setHistorico([...historico, { id: uid(), produtoId, produtoNome: produto.nome, tipo: 'saida', qtd, obs, data: new Date().toISOString() }])
  }, [produtos, historico, setProdutos, setHistorico])

  // ── Produto CRUD ──────────────────────────────────────────────────────────
  const adicionarProduto = useCallback((dados: Omit<Produto, 'id'>) => {
    const novo: Produto = { ...dados, id: uid() }
    const novos = [...produtos, novo]
    setProdutos(novos)
    if (dados.saldo > 0) {
      setHistorico([...historico, { id: uid(), produtoId: novo.id, produtoNome: novo.nome, tipo: 'entrada', qtd: dados.saldo, obs: 'Saldo inicial', data: new Date().toISOString() }])
    }
    return novo
  }, [produtos, historico, setProdutos, setHistorico])

  const atualizarProduto = useCallback((id: string, dados: Partial<Omit<Produto, 'id' | 'saldo'>>) => {
    setProdutos(produtos.map(p => p.id === id ? { ...p, ...dados } : p))
  }, [produtos, setProdutos])

  const excluirProduto = useCallback((id: string) => {
    setProdutos(produtos.filter(p => p.id !== id))
  }, [produtos, setProdutos])

  const limparHistorico = useCallback(() => {
    setHistorico([])
  }, [setHistorico])

  return {
    produtos,
    historico,
    hydrated,
    registrarEntrada,
    registrarSaida,
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    limparHistorico,
  }
}
