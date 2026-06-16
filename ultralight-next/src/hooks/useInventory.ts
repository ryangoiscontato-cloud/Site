'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Produto, Movimento, Usuario } from '@/lib/types'
import { supabase, isConfigured } from '@/lib/supabase'
import { uid } from '@/lib/utils'

// ── DB row shapes (snake_case) ───────────────────────────────────────────────
interface ProdutoRow {
  id: string
  codigo: string
  nome: string
  categoria: string | null
  unidade: string
  estoque_min: number
  saldo: number
  codigo_barras: string | null
  created_at?: string
}

interface HistoricoRow {
  id: string
  produto_id: string | null
  produto_nome: string
  tipo: string
  qtd: number
  obs: string | null
  data: string
  responsavel: string | null
  empresa_destino: string | null
  usuario_id: string | null
  usuario_nome: string | null
}

// ── Mappers ──────────────────────────────────────────────────────────────────
function mapProduto(r: ProdutoRow): Produto {
  return {
    id: r.id,
    codigo: r.codigo,
    nome: r.nome,
    categoria: r.categoria ?? '',
    unidade: r.unidade,
    estoqueMin: r.estoque_min,
    saldo: r.saldo,
    codigoBarras: r.codigo_barras ?? '',
  }
}

function mapMovimento(r: HistoricoRow): Movimento {
  return {
    id: r.id,
    produtoId: r.produto_id ?? '',
    produtoNome: r.produto_nome,
    tipo: r.tipo === 'entrada' ? 'entrada' : 'saida',
    qtd: r.qtd,
    obs: r.obs ?? '',
    data: r.data,
    responsavel: r.responsavel ?? undefined,
    empresaDestino: r.empresa_destino ?? undefined,
    usuarioId: r.usuario_id ?? undefined,
    usuarioNome: r.usuario_nome ?? undefined,
  }
}

export function useInventory(currentUser: Usuario | null) {
  const [produtos, setProdutos]   = useState<Produto[]>([])
  const [historico, setHistorico] = useState<Movimento[]>([])
  const [hydrated, setHydrated]   = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [isOnline, setIsOnline]         = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [pendingSync, setPendingSync]   = useState(0)
  const userRef = useRef(currentUser)

  useEffect(() => { userRef.current = currentUser }, [currentUser])

  // ── Shared fetch (also used by flushOfflineQueue) ──────────────────────────
  const fetchAll = useCallback(async () => {
    if (!supabase) return
    const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
      Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])

    try {
      const [{ data: prod }, { data: hist }] = await withTimeout(
        Promise.all([
          supabase.from('produtos').select('*').order('codigo'),
          supabase.from('historico').select('*').order('data'),
        ]),
        8000
      )
      if (prod) setProdutos((prod as ProdutoRow[]).map(mapProduto))
      if (prod) {
        try { localStorage.setItem('ul_cache_prod', JSON.stringify(prod)) } catch {}
      }
      if (hist) setHistorico((hist as HistoricoRow[]).map(mapMovimento))
      if (hist) {
        try { localStorage.setItem('ul_cache_hist', JSON.stringify(hist)) } catch {}
      }
    } catch (e) {
      setError(
        e instanceof Error && e.message === 'timeout'
          ? 'Tempo esgotado. Verifique sua conexão com o Supabase.'
          : 'Erro ao carregar dados. Verifique a conexão.'
      )
      try {
        const cp = localStorage.getItem('ul_cache_prod')
        const ch = localStorage.getItem('ul_cache_hist')
        if (cp) setProdutos((JSON.parse(cp) as ProdutoRow[]).map(mapProduto))
        if (ch) setHistorico((JSON.parse(ch) as HistoricoRow[]).map(mapMovimento))
      } catch {}
    } finally {
      setHydrated(true)
    }
  }, [])

  // ── Flush offline queue ──────────────────────────────────────────────────────
  const flushOfflineQueue = useCallback(async () => {
    if (!supabase) return
    const raw = localStorage.getItem('ul_offline_queue')
    if (!raw) return
    let queue: Array<{
      type: 'entrada' | 'saida'
      produtoId: string
      delta: number
      hist: Record<string, unknown>
    }>
    try { queue = JSON.parse(raw) } catch { return }
    if (queue.length === 0) return

    for (const op of queue) {
      const { data: row } = await supabase.from('produtos').select('saldo').eq('id', op.produtoId).single()
      if (row) {
        const novoSaldo = Math.max(0, (row as { saldo: number }).saldo + op.delta)
        await supabase.from('produtos').update({ saldo: novoSaldo }).eq('id', op.produtoId)
      }
      await supabase.from('historico').insert(op.hist)
    }

    localStorage.removeItem('ul_offline_queue')
    setPendingSync(0)
    await fetchAll()
  }, [fetchAll])

  // ── Initial fetch + realtime subscriptions ─────────────────────────────────
  useEffect(() => {
    if (!isConfigured || !supabase) {
      setError('Configure o Supabase para usar o sistema.')
      setHydrated(true)
      return
    }

    let active = true

    async function init() {
      try {
        const cp = localStorage.getItem('ul_cache_prod')
        const ch = localStorage.getItem('ul_cache_hist')
        if (cp && active) setProdutos((JSON.parse(cp) as ProdutoRow[]).map(mapProduto))
        if (ch && active) setHistorico((JSON.parse(ch) as HistoricoRow[]).map(mapMovimento))
      } catch {}
      await fetchAll()
    }

    void init()

    const channel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () => {
        supabase!.from('produtos').select('*').order('codigo').then(({ data }) => {
          if (active && data) setProdutos((data as ProdutoRow[]).map(mapProduto))
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'historico' }, () => {
        supabase!.from('historico').select('*').order('data').then(({ data }) => {
          if (active && data) setHistorico((data as HistoricoRow[]).map(mapMovimento))
        })
      })
      .subscribe()

    function handleOnline() {
      setIsOnline(true)
      void flushOfflineQueue()
    }
    function handleOffline() { setIsOnline(false) }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      active = false
      supabase!.removeChannel(channel)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [fetchAll, flushOfflineQueue])

  // ── Entrada ─────────────────────────────────────────────────────────────────
  const registrarEntrada = useCallback((produtoId: string, qtd: number, obs: string) => {
    if (!supabase) return
    const produto = produtos.find(p => p.id === produtoId)
    if (!produto) return
    const novoSaldo = produto.saldo + qtd
    const u = userRef.current

    setProdutos(prev => prev.map(p => p.id === produtoId ? { ...p, saldo: novoSaldo } : p))

    const histRow = {
      id: uid(), produto_id: produtoId, produto_nome: produto.nome, tipo: 'entrada',
      qtd, obs, data: new Date().toISOString(),
      usuario_id: u?.id ?? null, usuario_nome: u?.username ?? null,
    }

    if (!navigator.onLine) {
      try {
        const raw = localStorage.getItem('ul_offline_queue')
        const queue = raw ? JSON.parse(raw) : []
        queue.push({ type: 'entrada', produtoId, delta: qtd, hist: histRow })
        localStorage.setItem('ul_offline_queue', JSON.stringify(queue))
        setPendingSync(q => q + 1)
      } catch {}
      return
    }

    void (async () => {
      await supabase!.from('produtos').update({ saldo: novoSaldo }).eq('id', produtoId)
      await supabase!.from('historico').insert(histRow)
    })()
  }, [produtos])

  // ── Saída ─────────────────────────────────────────────────────────────────
  const registrarSaida = useCallback((produtoId: string, qtd: number, obs: string, responsavel?: string, empresaDestino?: string) => {
    if (!supabase) return
    const produto = produtos.find(p => p.id === produtoId)
    if (!produto) return
    const novoSaldo = produto.saldo - qtd
    const u = userRef.current

    setProdutos(prev => prev.map(p => p.id === produtoId ? { ...p, saldo: novoSaldo } : p))

    const histRow = {
      id: uid(), produto_id: produtoId, produto_nome: produto.nome, tipo: 'saida',
      qtd, obs, data: new Date().toISOString(),
      responsavel: responsavel ?? null, empresa_destino: empresaDestino ?? null,
      usuario_id: u?.id ?? null, usuario_nome: u?.username ?? null,
    }

    if (!navigator.onLine) {
      try {
        const raw = localStorage.getItem('ul_offline_queue')
        const queue = raw ? JSON.parse(raw) : []
        queue.push({ type: 'saida', produtoId, delta: -qtd, hist: histRow })
        localStorage.setItem('ul_offline_queue', JSON.stringify(queue))
        setPendingSync(q => q + 1)
      } catch {}
      return
    }

    void (async () => {
      await supabase!.from('produtos').update({ saldo: novoSaldo }).eq('id', produtoId)
      await supabase!.from('historico').insert(histRow)
    })()
  }, [produtos])

  // ── Produto CRUD ────────────────────────────────────────────────────────────
  const adicionarProduto = useCallback((dados: Omit<Produto, 'id'>) => {
    if (!supabase) return
    const novo: Produto = { ...dados, id: uid() }
    const u = userRef.current

    setProdutos(prev => [...prev, novo])

    void (async () => {
      await supabase!.from('produtos').insert({
        id: novo.id, codigo: novo.codigo, nome: novo.nome, categoria: novo.categoria,
        unidade: novo.unidade, estoque_min: novo.estoqueMin, saldo: novo.saldo,
        codigo_barras: novo.codigoBarras ?? '',
      })
      if (novo.saldo > 0) {
        await supabase!.from('historico').insert({
          id: uid(), produto_id: novo.id, produto_nome: novo.nome, tipo: 'entrada',
          qtd: novo.saldo, obs: 'Saldo inicial', data: new Date().toISOString(),
          usuario_id: u?.id ?? null, usuario_nome: u?.username ?? null,
        })
      }
    })()

    return novo
  }, [])

  const atualizarProduto = useCallback((id: string, dados: Partial<Omit<Produto, 'id' | 'saldo'>>) => {
    if (!supabase) return
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...dados } : p))

    const patch: Record<string, unknown> = {}
    if (dados.codigo       !== undefined) patch.codigo        = dados.codigo
    if (dados.nome         !== undefined) patch.nome          = dados.nome
    if (dados.categoria    !== undefined) patch.categoria     = dados.categoria
    if (dados.unidade      !== undefined) patch.unidade       = dados.unidade
    if (dados.estoqueMin   !== undefined) patch.estoque_min   = dados.estoqueMin
    if (dados.codigoBarras !== undefined) patch.codigo_barras = dados.codigoBarras

    void supabase.from('produtos').update(patch).eq('id', id)
  }, [])

  const excluirProduto = useCallback((id: string) => {
    if (!supabase) return
    setProdutos(prev => prev.filter(p => p.id !== id))
    void supabase.from('produtos').delete().eq('id', id)
  }, [])

  return {
    produtos,
    historico,
    hydrated,
    error,
    isOnline,
    pendingSync,
    registrarEntrada,
    registrarSaida,
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
  }
}
