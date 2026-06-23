'use client'

import { useEffect, useState } from 'react'
import { useMetas } from '@/hooks/useMetas'

type Tier = 'basic' | 'advanced' | 'premium'

const TIER_INFO: { value: Tier; label: string; color: string; border: string; chipBg: string; chipText: string }[] = [
  { value: 'basic',    label: 'BASIC',    color: '#2563eb', border: 'border-blue-600',   chipBg: 'bg-blue-50',   chipText: 'text-blue-700' },
  { value: 'advanced', label: 'ADVANCED', color: '#9333ea', border: 'border-purple-600', chipBg: 'bg-purple-50', chipText: 'text-purple-700' },
  { value: 'premium',  label: 'PREMIUM',  color: '#d97706', border: 'border-amber-600',  chipBg: 'bg-amber-50',  chipText: 'text-amber-700' },
]

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function ProgressRing({ pct, size, stroke, color }: { pct: number; size: number; stroke: number; color: string }) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (circumference * pct) / 100}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

export default function TvMetasPage() {
  const { metas } = useMetas()
  const [now, setNow] = useState(new Date())
  const [selected, setSelected] = useState<Tier | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const mesAtual = now.getMonth() + 1
  const anoAtual = now.getFullYear()

  function dadosTier(t: Tier) {
    const m = metas.find(x => x.tier === t && x.mes === mesAtual && x.ano === anoAtual)
    const meta = m?.meta ?? 0
    const progresso = m?.progresso ?? 0
    const pct = meta > 0 ? Math.min(100, Math.round((progresso / meta) * 100)) : 0
    return { meta, progresso, pct }
  }

  const tierSelecionado = selected ? TIER_INFO.find(t => t.value === selected)! : null

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col items-center justify-center px-10 py-12">
      <div className={`text-center flex flex-col items-center transition-all ${selected ? 'mb-6' : 'mb-10'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Ultralight"
          width={selected ? 56 : 80}
          height={selected ? 56 : 80}
          className={`rounded-2xl object-contain mb-4 shadow-md transition-all ${selected ? 'w-14 h-14' : 'w-20 h-20'}`}
        />
        <p className="text-red-600 text-lg font-bold uppercase tracking-[0.3em] mb-1">Ultralight · Gestão de Produção</p>
        {!selected && <h1 className="text-5xl font-black tracking-tight text-black">METAS DO MÊS</h1>}
        <p className="text-xl text-gray-500 font-medium mt-2 capitalize">{MESES[mesAtual - 1]} de {anoAtual}</p>
      </div>

      {!selected ? (
        <div className="grid grid-cols-3 gap-10 w-full max-w-6xl">
          {TIER_INFO.map(t => {
            const { meta, progresso, pct } = dadosTier(t.value)
            return (
              <button
                key={t.value}
                onClick={() => setSelected(t.value)}
                title="Clique para ver em destaque"
                className={`rounded-3xl bg-white border-4 ${t.border} shadow-xl p-8 flex flex-col items-center transition-transform hover:scale-[1.03] active:scale-[0.98]`}
              >
                <span className={`text-base font-black tracking-widest mb-6 px-4 py-1.5 rounded-full ${t.chipBg} ${t.chipText}`}>{t.label}</span>

                <div className="relative w-56 h-56 flex items-center justify-center mb-6">
                  <ProgressRing pct={pct} size={224} stroke={16} color={t.color} />
                  <span className="absolute text-6xl font-black text-black tabular-nums">{pct}%</span>
                </div>

                <p className="text-4xl font-extrabold text-black tabular-nums">{progresso} <span className="text-2xl font-semibold text-gray-400">/ {meta}</span></p>
                <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mt-1">unidades produzidas</p>
              </button>
            )
          })}
        </div>
      ) : (
        <button
          onClick={() => setSelected(null)}
          title="Clique para voltar às 3 metas"
          className={`rounded-[2.5rem] bg-white border-4 ${tierSelecionado!.border} shadow-2xl px-16 py-10 flex flex-col items-center transition-transform active:scale-[0.99] w-full max-w-2xl`}
        >
          <span className={`text-xl font-black tracking-[0.2em] mb-6 px-5 py-2 rounded-full ${tierSelecionado!.chipBg} ${tierSelecionado!.chipText}`}>{tierSelecionado!.label}</span>

          {(() => {
            const { meta, progresso, pct } = dadosTier(selected)
            return (
              <>
                <div className="relative w-80 h-80 flex items-center justify-center mb-6">
                  <ProgressRing pct={pct} size={320} stroke={24} color={tierSelecionado!.color} />
                  <span className="absolute text-8xl font-black text-black tabular-nums">{pct}%</span>
                </div>
                <p className="text-6xl font-extrabold text-black tabular-nums">{progresso} <span className="text-3xl font-semibold text-gray-400">/ {meta}</span></p>
                <p className="text-base font-semibold uppercase tracking-widest text-gray-400 mt-3">unidades produzidas</p>
              </>
            )
          })()}

          <p className="text-sm font-medium text-gray-400 mt-6">Toque para voltar à visão geral</p>
        </button>
      )}

      <p className="text-gray-400 text-sm font-medium mt-12 tabular-nums">
        {now.toLocaleDateString('pt-BR')} · {now.toLocaleTimeString('pt-BR')}
      </p>
    </div>
  )
}
