'use client'

import { useEffect, useState } from 'react'
import { useMetas } from '@/hooks/useMetas'

type Tier = 'basic' | 'advanced' | 'premium'

const TIER_INFO: { value: Tier; label: string; from: string; to: string }[] = [
  { value: 'basic',    label: 'BASIC',    from: 'from-blue-500',   to: 'to-blue-700' },
  { value: 'advanced', label: 'ADVANCED', from: 'from-purple-500', to: 'to-purple-700' },
  { value: 'premium',  label: 'PREMIUM',  from: 'from-amber-500',  to: 'to-amber-600' },
]

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function ProgressRing({ pct, size, stroke }: { pct: number; size: number; stroke: number }) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="white" strokeWidth={stroke}
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
    <div className="min-h-screen w-full bg-[#0a0e1a] text-white flex flex-col items-center justify-center px-10 py-12">
      <div className={`text-center flex flex-col items-center transition-all ${selected ? 'mb-6' : 'mb-12'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Ultralight"
          width={selected ? 64 : 96}
          height={selected ? 64 : 96}
          className={`rounded-3xl object-contain mb-5 shadow-[0_0_40px_rgba(99,102,241,0.45)] transition-all ${selected ? 'w-16 h-16' : 'w-24 h-24'}`}
        />
        <p className="text-indigo-400 text-xl font-bold uppercase tracking-[0.3em] mb-2">Ultralight · Gestão de Produção</p>
        {!selected && <h1 className="text-6xl font-black tracking-tight">METAS DO MÊS</h1>}
        <p className="text-2xl text-gray-400 font-medium mt-3 capitalize">{MESES[mesAtual - 1]} de {anoAtual}</p>
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
                className={`rounded-3xl bg-gradient-to-br ${t.from} ${t.to} p-8 shadow-2xl flex flex-col items-center transition-transform hover:scale-[1.03] active:scale-[0.98]`}
              >
                <p className="text-2xl font-black tracking-widest mb-6">{t.label}</p>

                <div className="relative w-52 h-52 flex items-center justify-center mb-6">
                  <ProgressRing pct={pct} size={208} stroke={14} />
                  <span className="absolute text-5xl font-black">{pct}%</span>
                </div>

                <p className="text-3xl font-extrabold">{progresso} <span className="text-xl font-semibold opacity-75">/ {meta}</span></p>
                <p className="text-sm font-semibold uppercase tracking-widest opacity-75 mt-1">unidades produzidas</p>
              </button>
            )
          })}
        </div>
      ) : (
        <button
          onClick={() => setSelected(null)}
          title="Clique para voltar às 3 metas"
          className={`rounded-[2.5rem] bg-gradient-to-br ${tierSelecionado!.from} ${tierSelecionado!.to} px-16 py-10 shadow-2xl flex flex-col items-center transition-transform active:scale-[0.99] w-full max-w-2xl`}
        >
          <p className="text-4xl font-black tracking-[0.2em] mb-6">{tierSelecionado!.label}</p>

          {(() => {
            const { meta, progresso, pct } = dadosTier(selected)
            return (
              <>
                <div className="relative w-80 h-80 flex items-center justify-center mb-6">
                  <ProgressRing pct={pct} size={320} stroke={22} />
                  <span className="absolute text-7xl font-black">{pct}%</span>
                </div>
                <p className="text-5xl font-extrabold">{progresso} <span className="text-2xl font-semibold opacity-75">/ {meta}</span></p>
                <p className="text-base font-semibold uppercase tracking-widest opacity-75 mt-2">unidades produzidas</p>
              </>
            )
          })()}

          <p className="text-sm font-medium opacity-60 mt-6">Toque para voltar à visão geral</p>
        </button>
      )}

      <p className="text-gray-500 text-sm font-medium mt-12 tabular-nums">
        {now.toLocaleDateString('pt-BR')} · {now.toLocaleTimeString('pt-BR')}
      </p>
    </div>
  )
}
