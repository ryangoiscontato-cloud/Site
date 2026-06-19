'use client'

import { useState } from 'react'
import type { MetaProducao } from '@/lib/types'
import { todayLong } from '@/lib/utils'
import ModalMetas from '@/components/modals/ModalMetas'

interface Props {
  metas: MetaProducao[]
  salvarMeta: (tier: 'basic' | 'advanced' | 'premium', mes: number, ano: number, meta: number, progresso: number) => Promise<{ ok: boolean; error?: string }>
  toast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
}

const TIER_INFO: { value: 'basic' | 'advanced' | 'premium'; label: string; bar: string; chip: string }[] = [
  { value: 'basic',    label: 'Basic',    bar: 'bg-blue-500',   chip: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'advanced', label: 'Advanced', bar: 'bg-purple-500', chip: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'premium',  label: 'Premium',  bar: 'bg-amber-500',  chip: 'bg-amber-50 text-amber-700 border-amber-200' },
]

export default function Dashboard({ metas, salvarMeta, toast }: Props) {
  const [showMetas, setShowMetas] = useState(false)

  const agora = new Date()
  const mesAtual = agora.getMonth() + 1
  const anoAtual = agora.getFullYear()

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Metas do Mês</h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{todayLong()}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/tv/metas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 px-4 py-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-4l1 3H7l1-3H4a2 2 0 01-2-2V4z"/></svg>
            Tela Cheia
          </a>
          <button
            onClick={() => setShowMetas(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>
            Configurar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {TIER_INFO.map(t => {
          const m = metas.find(x => x.tier === t.value && x.mes === mesAtual && x.ano === anoAtual)
          const meta = m?.meta ?? 0
          const progresso = m?.progresso ?? 0
          const pct = meta > 0 ? Math.min(100, Math.round((progresso / meta) * 100)) : 0
          return (
            <div key={t.value} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${t.chip}`}>{t.label}</span>
                <span className="text-2xl font-black text-gray-800">{pct}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className={`h-full ${t.bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-900">{progresso}</span> / {meta} unidades
              </p>
            </div>
          )
        })}
      </div>

      <ModalMetas
        open={showMetas}
        metas={metas}
        mes={mesAtual}
        ano={anoAtual}
        salvarMeta={salvarMeta}
        onClose={() => setShowMetas(false)}
        onSuccess={msg => toast(msg, 'success')}
        onError={msg => toast(msg, 'error')}
      />
    </div>
  )
}
