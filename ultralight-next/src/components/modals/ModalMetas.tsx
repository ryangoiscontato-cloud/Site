'use client'

import { useState, useEffect } from 'react'
import type { MetaProducao } from '@/lib/types'

interface Props {
  open: boolean
  metas: MetaProducao[]
  mes: number
  ano: number
  salvarMeta: (tier: 'basic' | 'advanced' | 'premium', mes: number, ano: number, meta: number, progresso: number) => Promise<{ ok: boolean; error?: string }>
  onClose: () => void
  onSuccess: (msg: string) => void
  onError: (msg: string) => void
}

const TIERS: { value: 'basic' | 'advanced' | 'premium'; label: string }[] = [
  { value: 'basic',    label: 'Basic' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'premium',  label: 'Premium' },
]

export default function ModalMetas({ open, metas, mes, ano, salvarMeta, onClose, onSuccess, onError }: Props) {
  const [form, setForm] = useState<Record<string, { meta: string; progresso: string }>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const next: Record<string, { meta: string; progresso: string }> = {}
    for (const t of TIERS) {
      const existente = metas.find(m => m.tier === t.value && m.mes === mes && m.ano === ano)
      next[t.value] = { meta: String(existente?.meta ?? 0), progresso: String(existente?.progresso ?? 0) }
    }
    setForm(next)
  }, [open, metas, mes, ano])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  async function handleSalvar() {
    setLoading(true)
    for (const t of TIERS) {
      const vals = form[t.value]
      const meta = Number(vals?.meta ?? 0)
      const progresso = Number(vals?.progresso ?? 0)
      const res = await salvarMeta(t.value, mes, ano, meta, progresso)
      if (!res.ok) {
        setLoading(false)
        onError(res.error || 'Erro ao salvar metas.')
        return
      }
    }
    setLoading(false)
    onSuccess('Metas atualizadas!')
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box-scroll animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 bg-indigo-50 border-b border-indigo-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Metas do Mês</h3>
              <p className="text-xs text-gray-500">Configurar metas e progresso de produção</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {TIERS.map(t => (
            <div key={t.value} className="border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-bold text-gray-800 mb-3">{t.label}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Meta</label>
                  <input
                    type="number"
                    min="0"
                    value={form[t.value]?.meta ?? ''}
                    onChange={e => setForm(f => ({ ...f, [t.value]: { ...f[t.value], meta: e.target.value } }))}
                    className="form-field"
                  />
                </div>
                <div>
                  <label className="field-label">Progresso</label>
                  <input
                    type="number"
                    min="0"
                    value={form[t.value]?.progresso ?? ''}
                    onChange={e => setForm(f => ({ ...f, [t.value]: { ...f[t.value], progresso: e.target.value } }))}
                    className="form-field"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-cancel">Cancelar</button>
          <button
            onClick={handleSalvar}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-colors"
          >
            {loading ? 'Salvando...' : 'Salvar Metas'}
          </button>
        </div>
      </div>
    </div>
  )
}
