'use client'

import { useState, useEffect, useCallback } from 'react'
import type { MetaProducao } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { uid } from '@/lib/utils'

interface MetaRow {
  id: string
  tier: string
  mes: number
  ano: number
  meta: number
  progresso: number
  atualizado_em: string
}

function mapMeta(r: MetaRow): MetaProducao {
  return {
    id: r.id,
    tier: r.tier as MetaProducao['tier'],
    mes: r.mes,
    ano: r.ano,
    meta: r.meta,
    progresso: r.progresso,
    atualizadoEm: r.atualizado_em,
  }
}

export function useMetas() {
  const [metas, setMetas]     = useState<MetaProducao[]>([])
  const [hydrated, setHydrated] = useState(false)

  const fetchAll = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase.from('metas').select('*')
    if (data) setMetas((data as MetaRow[]).map(mapMeta))
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
      .channel('metas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'metas' }, () => {
        if (active) fetchAll()
      })
      .subscribe()

    return () => {
      active = false
      supabase!.removeChannel(channel)
    }
  }, [fetchAll])

  const salvarMeta = useCallback(async (
    tier: 'basic' | 'advanced' | 'premium',
    mes: number,
    ano: number,
    meta: number,
    progresso: number,
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }

    const existente = metas.find(m => m.tier === tier && m.mes === mes && m.ano === ano)
    const agora = new Date().toISOString()

    const { error } = existente
      ? await supabase.from('metas').update({ meta, progresso, atualizado_em: agora }).eq('id', existente.id)
      : await supabase.from('metas').insert({ id: uid(), tier, mes, ano, meta, progresso, atualizado_em: agora })

    if (error) return { ok: false, error: `Erro ao salvar meta: ${error.message}` }
    await fetchAll()
    return { ok: true }
  }, [metas, fetchAll])

  return { metas, salvarMeta, hydrated }
}
