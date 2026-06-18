'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Produto, Movimento, Usuario, Empresa, EstoqueScope } from '@/lib/types'
import { EMPRESAS } from '@/lib/types'
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
  empresa: string | null
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
  empresa: string | null
}

type Result = { ok: boolean; error?: string }

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
    empresa: (r.empresa as Empresa) ?? 'PESTLINE',
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
    empresa: (r.empresa as Empresa) ?? 'PESTLINE',
  }
}

export function useInventory(currentUser: Usuario | null, empresa: EstoqueScope = 'PESTLINE') {
  const [produtos, setProdutos]   = useState<Produto[]>([])
  const [historico, setHistorico] = useState<Movimento[]>([])
  const [hydrated, setHydrated]   = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [isOnline, setIsOnline]         = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [pendingSync, setPendingSync]   = useState(0)
  const userRef = useRef(currentUser)

  const cacheProdKey  = `ul_cache_prod_${empresa}`
  const cacheHistKey  = `ul_cache_hist_${empresa}`
  const queueKey      = `ul_offline_queue_${empresa}`

  useEffect(() => { userRef.current = currentUser }, [currentUser])

  // ── Shared fetch (also used by flushOfflineQueue) ──────────────────────────
  const fetchAll = useCallback(async () => {
    if (!supabase) return
    const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
      Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])

    try {
      const [{ data: prod }, { data: hist }] = await withTimeout(
        Promise.all([
          supabase.from('produtos').select('*').eq('empresa', empresa).order('codigo'),
          supabase.from('historico').select('*').eq('empresa', empresa).order('data'),
        ]),
        8000
      )
      if (prod) setProdutos((prod as ProdutoRow[]).map(mapProduto))
      if (prod) {
        try { localStorage.setItem(cacheProdKey, JSON.stringify(prod)) } catch {}
      }
      if (hist) setHistorico((hist as HistoricoRow[]).map(mapMovimento))
      if (hist) {
        try { localStorage.setItem(cacheHistKey, JSON.stringify(hist)) } catch {}
      }
      setError(null)
    } catch (e) {
      setError(
        e instanceof Error && e.message === 'timeout'
          ? 'Tempo esgotado. Verifique sua conexão com o Supabase.'
          : 'Erro ao carregar dados. Verifique a conexão.'
      )
      try {
        const cp = localStorage.getItem(cacheProdKey)
        const ch = localStorage.getItem(cacheHistKey)
        if (cp) setProdutos((JSON.parse(cp) as ProdutoRow[]).map(mapProduto))
        if (ch) setHistorico((JSON.parse(ch) as HistoricoRow[]).map(mapMovimento))
      } catch {}
    } finally {
      setHydrated(true)
    }
  }, [empresa, cacheProdKey, cacheHistKey])

  // ── Flush offline queue ──────────────────────────────────────────────────────
  const flushOfflineQueue = useCallback(async () => {
    if (!supabase) return
    const raw = localStorage.getItem(queueKey)
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

    localStorage.removeItem(queueKey)
    setPendingSync(0)
    await fetchAll()
  }, [fetchAll, queueKey])

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
        const cp = localStorage.getItem(cacheProdKey)
        const ch = localStorage.getItem(cacheHistKey)
        if (cp && active) setProdutos((JSON.parse(cp) as ProdutoRow[]).map(mapProduto))
        if (ch && active) setHistorico((JSON.parse(ch) as HistoricoRow[]).map(mapMovimento))
      } catch {}
      await fetchAll()
    }

    void init()

    const channel = supabase
      .channel(`inventory-changes-${empresa}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos', filter: `empresa=eq.${empresa}` }, () => {
        supabase!.from('produtos').select('*').eq('empresa', empresa).order('codigo').then(({ data }) => {
          if (active && data) setProdutos((data as ProdutoRow[]).map(mapProduto))
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'historico', filter: `empresa=eq.${empresa}` }, () => {
        supabase!.from('historico').select('*').eq('empresa', empresa).order('data').then(({ data }) => {
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
  }, [empresa, fetchAll, flushOfflineQueue, cacheProdKey, cacheHistKey])

  // ── Entrada ─────────────────────────────────────────────────────────────────
  const registrarEntrada = useCallback(async (produtoId: string, qtd: number, obs: string): Promise<Result> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }
    const produto = produtos.find(p => p.id === produtoId)
    if (!produto) return { ok: false, error: 'Produto não encontrado.' }
    const novoSaldo = produto.saldo + qtd
    const u = userRef.current

    const histRow = {
      id: uid(), produto_id: produtoId, produto_nome: produto.nome, tipo: 'entrada',
      qtd, obs, data: new Date().toISOString(),
      usuario_id: u?.id ?? null, usuario_nome: u?.username ?? null, empresa,
    }

    if (!navigator.onLine) {
      try {
        const raw = localStorage.getItem(queueKey)
        const queue = raw ? JSON.parse(raw) : []
        queue.push({ type: 'entrada', produtoId, delta: qtd, hist: histRow })
        localStorage.setItem(queueKey, JSON.stringify(queue))
        setPendingSync(q => q + 1)
        setProdutos(prev => prev.map(p => p.id === produtoId ? { ...p, saldo: novoSaldo } : p))
      } catch {}
      return { ok: true }
    }

    const { error: e1 } = await supabase.from('produtos').update({ saldo: novoSaldo }).eq('id', produtoId)
    if (e1) return { ok: false, error: 'Erro ao atualizar saldo. Tente novamente.' }
    const { error: e2 } = await supabase.from('historico').insert(histRow)
    if (e2) return { ok: false, error: 'Erro ao registrar movimento. Tente novamente.' }

    setProdutos(prev => prev.map(p => p.id === produtoId ? { ...p, saldo: novoSaldo } : p))
    return { ok: true }
  }, [produtos, empresa, queueKey])

  // ── Saída ─────────────────────────────────────────────────────────────────
  const registrarSaida = useCallback(async (produtoId: string, qtd: number, obs: string, responsavel?: string, empresaDestino?: string): Promise<Result> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }
    const produto = produtos.find(p => p.id === produtoId)
    if (!produto) return { ok: false, error: 'Produto não encontrado.' }
    const novoSaldo = produto.saldo - qtd
    const u = userRef.current

    const histRow = {
      id: uid(), produto_id: produtoId, produto_nome: produto.nome, tipo: 'saida',
      qtd, obs, data: new Date().toISOString(),
      responsavel: responsavel ?? null, empresa_destino: empresaDestino ?? null,
      usuario_id: u?.id ?? null, usuario_nome: u?.username ?? null, empresa,
    }

    if (!navigator.onLine) {
      try {
        const raw = localStorage.getItem(queueKey)
        const queue = raw ? JSON.parse(raw) : []
        queue.push({ type: 'saida', produtoId, delta: -qtd, hist: histRow })
        localStorage.setItem(queueKey, JSON.stringify(queue))
        setPendingSync(q => q + 1)
        setProdutos(prev => prev.map(p => p.id === produtoId ? { ...p, saldo: novoSaldo } : p))
      } catch {}
      return { ok: true }
    }

    const { error: e1 } = await supabase.from('produtos').update({ saldo: novoSaldo }).eq('id', produtoId)
    if (e1) return { ok: false, error: 'Erro ao atualizar saldo. Tente novamente.' }
    const { error: e2 } = await supabase.from('historico').insert(histRow)
    if (e2) return { ok: false, error: 'Erro ao registrar movimento. Tente novamente.' }

    setProdutos(prev => prev.map(p => p.id === produtoId ? { ...p, saldo: novoSaldo } : p))

    // Credita automaticamente o saldo da empresa de destino (cada empresa tem seu próprio saldo).
    if (empresaDestino && empresaDestino !== empresa && EMPRESAS.includes(empresaDestino as Empresa)) {
      const { data: destRow } = await supabase
        .from('produtos').select('id, saldo')
        .eq('empresa', empresaDestino).eq('codigo', produto.codigo)
        .maybeSingle()
      if (destRow) {
        const destSaldo = (destRow as { id: string; saldo: number }).saldo + qtd
        await supabase.from('produtos').update({ saldo: destSaldo }).eq('id', destRow.id)
        await supabase.from('historico').insert({
          id: uid(), produto_id: destRow.id, produto_nome: produto.nome, tipo: 'entrada',
          qtd, obs: obs || `Recebido de ${empresa}`, data: new Date().toISOString(),
          usuario_id: u?.id ?? null, usuario_nome: u?.username ?? null, empresa: empresaDestino,
        })
      }
    }

    return { ok: true }
  }, [produtos, empresa, queueKey])

  // ── Ajuste rápido de saldo (ex.: picking via scanner) ──────────────────────
  const ajustarSaldo = useCallback(async (produtoId: string, novoSaldo: number, obs: string): Promise<Result> => {
    const produto = produtos.find(p => p.id === produtoId)
    if (!produto) return { ok: false, error: 'Produto não encontrado.' }
    const delta = novoSaldo - produto.saldo
    if (delta === 0) return { ok: true }
    const motivo = obs.trim() || 'Ajuste de estoque'
    return delta > 0
      ? registrarEntrada(produtoId, delta, motivo)
      : registrarSaida(produtoId, -delta, motivo)
  }, [produtos, registrarEntrada, registrarSaida])

  // ── Produto CRUD ────────────────────────────────────────────────────────────
  const adicionarProduto = useCallback(async (dados: Omit<Produto, 'id'>): Promise<Result> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }
    if (!navigator.onLine) return { ok: false, error: 'Sem conexão. Tente novamente quando estiver online.' }
    const novo: Produto = { ...dados, id: uid(), empresa }
    const u = userRef.current

    const { error: e1 } = await supabase.from('produtos').insert({
      id: novo.id, codigo: novo.codigo, nome: novo.nome, categoria: novo.categoria,
      unidade: novo.unidade, estoque_min: novo.estoqueMin, saldo: novo.saldo,
      codigo_barras: novo.codigoBarras ?? '', empresa,
    })
    if (e1) return { ok: false, error: 'Erro ao salvar produto. Verifique se o código já existe.' }

    if (novo.saldo > 0) {
      await supabase.from('historico').insert({
        id: uid(), produto_id: novo.id, produto_nome: novo.nome, tipo: 'entrada',
        qtd: novo.saldo, obs: 'Saldo inicial', data: new Date().toISOString(),
        usuario_id: u?.id ?? null, usuario_nome: u?.username ?? null, empresa,
      })
    }

    setProdutos(prev => [...prev, novo])

    // Replica o cadastro do produto nas demais empresas, cada uma com saldo próprio (começa em 0).
    // Escopos que não são empresas (ex.: ALMOXARIFADO) têm catálogo próprio e não são replicados.
    if (EMPRESAS.includes(empresa as Empresa)) {
      const outras = EMPRESAS.filter(e => e !== empresa)
      void Promise.all(outras.map(e => supabase!.from('produtos').insert({
        id: uid(), codigo: novo.codigo, nome: novo.nome, categoria: novo.categoria,
        unidade: novo.unidade, estoque_min: novo.estoqueMin, saldo: 0,
        codigo_barras: novo.codigoBarras ?? '', empresa: e,
      })))
    }

    return { ok: true }
  }, [empresa])

  const atualizarProduto = useCallback(async (id: string, dados: Partial<Omit<Produto, 'id' | 'saldo'>>): Promise<Result> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }
    if (!navigator.onLine) return { ok: false, error: 'Sem conexão. Tente novamente quando estiver online.' }

    const atual = produtos.find(p => p.id === id)
    const codigoAntigo = atual?.codigo

    const patch: Record<string, unknown> = {}
    if (dados.codigo       !== undefined) patch.codigo        = dados.codigo
    if (dados.nome         !== undefined) patch.nome          = dados.nome
    if (dados.categoria    !== undefined) patch.categoria     = dados.categoria
    if (dados.unidade      !== undefined) patch.unidade       = dados.unidade
    if (dados.estoqueMin   !== undefined) patch.estoque_min   = dados.estoqueMin
    if (dados.codigoBarras !== undefined) patch.codigo_barras = dados.codigoBarras

    const { error } = await supabase.from('produtos').update(patch).eq('id', id)
    if (error) return { ok: false, error: 'Erro ao atualizar produto. Verifique se o código já existe.' }

    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...dados } : p))

    // Mantém o cadastro (exceto saldo) sincronizado com as demais empresas.
    if (codigoAntigo && Object.keys(patch).length > 0 && EMPRESAS.includes(empresa as Empresa)) {
      const outras = EMPRESAS.filter(e => e !== empresa)
      void Promise.all(outras.map(e => supabase!.from('produtos').update(patch).eq('empresa', e).eq('codigo', codigoAntigo)))
    }

    return { ok: true }
  }, [produtos, empresa])

  const excluirProduto = useCallback(async (id: string): Promise<Result> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }
    if (!navigator.onLine) return { ok: false, error: 'Sem conexão. Tente novamente quando estiver online.' }

    const { error } = await supabase.from('produtos').delete().eq('id', id)
    if (error) return { ok: false, error: 'Erro ao excluir produto.' }

    setProdutos(prev => prev.filter(p => p.id !== id))
    return { ok: true }
  }, [])

  const excluirMovimento = useCallback(async (id: string): Promise<Result> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }
    if (!navigator.onLine) return { ok: false, error: 'Sem conexão. Tente novamente quando estiver online.' }

    const { error } = await supabase.from('historico').delete().eq('id', id)
    if (error) return { ok: false, error: 'Erro ao excluir movimento.' }

    setHistorico(prev => prev.filter(h => h.id !== id))
    return { ok: true }
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
    ajustarSaldo,
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    excluirMovimento,
  }
}
