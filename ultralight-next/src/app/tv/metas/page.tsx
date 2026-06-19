'use client'

import { useEffect, useState } from 'react'
import { useMetas } from '@/hooks/useMetas'

const TIER_INFO: { value: 'basic' | 'advanced' | 'premium'; label: string; from: string; to: string; ring: string }[] = [
  { value: 'basic',    label: 'BASIC',    from: 'from-blue-500',   to: 'to-blue-700',   ring: '#3b82f6' },
  { value: 'advanced', label: 'ADVANCED', from: 'from-purple-500', to: 'to-purple-700', ring: '#a855f7' },
  { value: 'premium',  label: 'PREMIUM',  from: 'from-amber-500',  to: 'to-amber-600',  ring: '#f59e0b' },
]

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default function TvMetasPage() {
  const { metas } = useMetas()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const mesAtual = now.getMonth() + 1
  const anoAtual = now.getFullYear()

  return (
    <div className="min-h-screen w-full bg-[#0a0e1a] text-white flex flex-col items-center justify-center px-10 py-12">
      <div className="text-center mb-12 flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Ultralight"
          width={96}
          height={96}
          className="w-24 h-24 rounded-3xl object-contain mb-5 shadow-[0_0_40px_rgba(99,102,241,0.45)]"
        />
        <p className="text-indigo-400 text-xl font-bold uppercase tracking-[0.3em] mb-2">Ultralight · Gestão de Produção</p>
        <h1 className="text-6xl font-black tracking-tight">METAS DO MÊS</h1>
        <p className="text-2xl text-gray-400 font-medium mt-3 capitalize">{MESES[mesAtual - 1]} de {anoAtual}</p>
      </div>

      <div className="grid grid-cols-3 gap-10 w-full max-w-6xl">
        {TIER_INFO.map(t => {
          const m = metas.find(x => x.tier === t.value && x.mes === mesAtual && x.ano === anoAtual)
          const meta = m?.meta ?? 0
          const progresso = m?.progresso ?? 0
          const pct = meta > 0 ? Math.min(100, Math.round((progresso / meta) * 100)) : 0
          const circumference = 2 * Math.PI * 88

          return (
            <div
              key={t.value}
              className={`rounded-3xl bg-gradient-to-br ${t.from} ${t.to} p-8 shadow-2xl flex flex-col items-center`}
            >
              <p className="text-2xl font-black tracking-widest mb-6">{t.label}</p>

              <div className="relative w-52 h-52 flex items-center justify-center mb-6">
                <svg className="w-52 h-52 -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="14" />
                  <circle
                    cx="100" cy="100" r="88" fill="none" stroke="white" strokeWidth="14"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (circumference * pct) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <span className="absolute text-5xl font-black">{pct}%</span>
              </div>

              <p className="text-3xl font-extrabold">{progresso} <span className="text-xl font-semibold opacity-75">/ {meta}</span></p>
              <p className="text-sm font-semibold uppercase tracking-widest opacity-75 mt-1">unidades produzidas</p>
            </div>
          )
        })}
      </div>

      <p className="text-gray-500 text-sm font-medium mt-12 tabular-nums">
        {now.toLocaleDateString('pt-BR')} · {now.toLocaleTimeString('pt-BR')}
      </p>
    </div>
  )
}
