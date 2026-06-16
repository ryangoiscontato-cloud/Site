'use client'

import { useState, useEffect, useCallback } from 'react'
import type { OrdemProducao, PausaOrdem } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { uid } from '@/lib/utils'

interface OrdemRow {
  id: string
  tipo: string
  status: string
  produto_id: string | null
  produto_nome: string
  quantidade: number
  petg_quantidade: number | null
  obs: string | null
  criado_por: string
  criado_em: string
  iniciado_em: string | null
  concluido_em: string | null
  usuario_destino: string
  linha: string | null
  pausas: PausaOrdem[] | null
  tipo_pedido: string | null
  pedido_numero: string | null
  previsao_entrega: string | null
  itens_pedido: Array<{ produtoId: string; produtoNome: string; quantidade: number }> | null
}

function mapOrdem(r: OrdemRow): OrdemProducao {
  return {
    id: r.id,
    tipo: r.tipo as OrdemProducao['tipo'],
    status: r.status as OrdemProducao['status'],
    produtoId: r.produto_id ?? '',
    produtoNome: r.produto_nome,
    quantidade: r.quantidade,
    petgQuantidade: r.petg_quantidade ?? undefined,
    obs: r.obs ?? '',
    criadoPor: r.criado_por,
    criadoEm: r.criado_em,
    iniciadoEm: r.iniciado_em ?? undefined,
    concluidoEm: r.concluido_em ?? undefined,
    usuarioDestino: r.usuario_destino as OrdemProducao['usuarioDestino'],
    pausas: r.pausas ?? [],
    linha: r.linha ?? undefined,
    tipoPedido: (r.tipo_pedido as 'estoque' | 'pedido') ?? undefined,
    pedidoNumero: r.pedido_numero ?? undefined,
    previsaoEntrega: r.previsao_entrega ?? undefined,
    itensPedido: r.itens_pedido ?? undefined,
  }
}

export function useOrdens() {
  const [ordens, setOrdens] = useState<OrdemProducao[]>([])
  const [hydrated, setHydrated] = useState(false)

  const fetchAll = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase
      .from('ordens_producao')
      .select('*')
      .order('criado_em', { ascending: false })
    if (data) setOrdens((data as OrdemRow[]).map(mapOrdem))
  }, [])

  useEffect(() => {
    if (!supabase) { setHydrated(true); return }

    let active = true

    async function init() {
      await fetchAll()
      if (active) setHydrated(true)
    }

    init()

    const channel = supabase
      .channel('ordens-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordens_producao' }, () => {
        if (active) fetchAll()
      })
      .subscribe()

    return () => {
      active = false
      supabase!.removeChannel(channel)
    }
  }, [fetchAll])

  const criarOrdem = useCallback(async (dados: {
    tipo: 'chaparia' | 'almoxarifado' | 'montagem'
    produtoId: string
    produtoNome: string
    quantidade: number
    petgQuantidade?: number
    obs: string
    criadoPor: string
    usuarioDestino: 'CHAPARIA' | 'ALMOXARIFADO' | 'MONTAGEM'
    linha?: string
    tipoPedido?: 'estoque' | 'pedido'
    pedidoNumero?: string
    previsaoEntrega?: string
    itensPedido?: Array<{ produtoId: string; produtoNome: string; quantidade: number }>
  }): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }

    const { error } = await supabase.from('ordens_producao').insert({
      id: uid(),
      tipo: dados.tipo,
      status: 'pendente',
      produto_id: dados.produtoId || null,
      produto_nome: dados.produtoNome,
      quantidade: dados.quantidade,
      petg_quantidade: dados.petgQuantidade ?? null,
      obs: dados.obs,
      criado_por: dados.criadoPor,
      criado_em: new Date().toISOString(),
      usuario_destino: dados.usuarioDestino,
      linha: dados.linha ?? null,
      pausas: [],
      tipo_pedido: dados.tipoPedido ?? 'estoque',
      pedido_numero: dados.pedidoNumero ?? null,
      previsao_entrega: dados.previsaoEntrega ?? null,
      itens_pedido: dados.itensPedido ?? null,
    })

    if (error) return { ok: false, error: 'Erro ao criar ordem.' }
    await fetchAll()
    return { ok: true }
  }, [fetchAll])

  const iniciarOrdem = useCallback(async (id: string): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }

    const { error } = await supabase
      .from('ordens_producao')
      .update({ status: 'em_producao', iniciado_em: new Date().toISOString() })
      .eq('id', id)

    if (error) return { ok: false, error: 'Erro ao iniciar ordem.' }
    await fetchAll()
    return { ok: true }
  }, [fetchAll])

  const concluirOrdem = useCallback(async (id: string): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }

    const { data: row } = await supabase.from('ordens_producao').select('pausas').eq('id', id).single()
    let pausas: PausaOrdem[] = row?.pausas ?? []
    if (pausas.length > 0 && !pausas[pausas.length - 1].fim) {
      pausas = pausas.map((p, i) =>
        i === pausas.length - 1 ? { ...p, fim: new Date().toISOString() } : p
      )
    }

    const { error } = await supabase
      .from('ordens_producao')
      .update({ status: 'concluida', concluido_em: new Date().toISOString(), pausas })
      .eq('id', id)

    if (error) return { ok: false, error: 'Erro ao concluir ordem.' }
    await fetchAll()
    return { ok: true }
  }, [fetchAll])

  const pausarOrdem = useCallback(async (id: string, motivo: string): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }

    const { data: row, error: fetchErr } = await supabase
      .from('ordens_producao')
      .select('pausas')
      .eq('id', id)
      .single()

    if (fetchErr) return { ok: false, error: 'Erro ao buscar ordem.' }

    const pausas: PausaOrdem[] = [
      ...(row?.pausas ?? []),
      { motivo, inicio: new Date().toISOString() },
    ]

    const { error } = await supabase
      .from('ordens_producao')
      .update({ status: 'pausada', pausas })
      .eq('id', id)

    if (error) return { ok: false, error: 'Erro ao pausar ordem.' }
    await fetchAll()
    return { ok: true }
  }, [fetchAll])

  const retomarOrdem = useCallback(async (id: string): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }

    const { data: row, error: fetchErr } = await supabase
      .from('ordens_producao')
      .select('pausas')
      .eq('id', id)
      .single()

    if (fetchErr) return { ok: false, error: 'Erro ao buscar ordem.' }

    const pausas: PausaOrdem[] = (row?.pausas ?? []).map((p: PausaOrdem, i: number, arr: PausaOrdem[]) =>
      i === arr.length - 1 && !p.fim ? { ...p, fim: new Date().toISOString() } : p
    )

    const { error } = await supabase
      .from('ordens_producao')
      .update({ status: 'em_producao', pausas })
      .eq('id', id)

    if (error) return { ok: false, error: 'Erro ao retomar ordem.' }
    await fetchAll()
    return { ok: true }
  }, [fetchAll])

  const cancelarOrdem = useCallback(async (id: string): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }

    const { error } = await supabase
      .from('ordens_producao')
      .update({ status: 'cancelada' })
      .eq('id', id)

    if (error) return { ok: false, error: 'Erro ao cancelar ordem.' }
    await fetchAll()
    return { ok: true }
  }, [fetchAll])

  return { ordens, criarOrdem, iniciarOrdem, concluirOrdem, pausarOrdem, retomarOrdem, cancelarOrdem, hydrated }
}
