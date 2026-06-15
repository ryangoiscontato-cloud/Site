'use client'

import { useState, useEffect, useCallback } from 'react'
import type { OrdemProducao } from '@/lib/types'
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
  }
}

export function useOrdens() {
  const [ordens, setOrdens]     = useState<OrdemProducao[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (!supabase) { setHydrated(true); return }

    let active = true

    async function fetchAll() {
      const { data } = await supabase!
        .from('ordens_producao')
        .select('*')
        .order('criado_em', { ascending: false })
      if (active && data) setOrdens((data as OrdemRow[]).map(mapOrdem))
      if (active) setHydrated(true)
    }

    fetchAll()

    const channel = supabase
      .channel('ordens-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordens_producao' }, () => {
        supabase!
          .from('ordens_producao')
          .select('*')
          .order('criado_em', { ascending: false })
          .then(({ data }) => {
            if (active && data) setOrdens((data as OrdemRow[]).map(mapOrdem))
          })
      })
      .subscribe()

    return () => {
      active = false
      supabase!.removeChannel(channel)
    }
  }, [])

  const criarOrdem = useCallback(async (dados: {
    tipo: 'chaparia' | 'almoxarifado'
    produtoId: string
    produtoNome: string
    quantidade: number
    petgQuantidade?: number
    obs: string
    criadoPor: string
    usuarioDestino: 'CHAPARIA' | 'ALMOXARIFADO'
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
    })

    if (error) return { ok: false, error: 'Erro ao criar ordem.' }
    return { ok: true }
  }, [])

  const iniciarOrdem = useCallback(async (id: string): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }

    const { error } = await supabase
      .from('ordens_producao')
      .update({ status: 'em_producao', iniciado_em: new Date().toISOString() })
      .eq('id', id)

    if (error) return { ok: false, error: 'Erro ao iniciar ordem.' }
    return { ok: true }
  }, [])

  const concluirOrdem = useCallback(async (id: string): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }

    const { error } = await supabase
      .from('ordens_producao')
      .update({ status: 'concluida', concluido_em: new Date().toISOString() })
      .eq('id', id)

    if (error) return { ok: false, error: 'Erro ao concluir ordem.' }
    return { ok: true }
  }, [])

  return { ordens, criarOrdem, iniciarOrdem, concluirOrdem, hydrated }
}
