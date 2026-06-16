'use client'

import { useState, useEffect } from 'react'
import type { OrdemProducao } from '@/lib/types'
import { fmtDate } from '@/lib/utils'

interface Props {
  ordens: OrdemProducao[]
}

function StatusBadge({ status }: { status: OrdemProducao['status'] }) {
  if (status === 'pendente')
    return <span className="badge-orange">Pendente</span>
  if (status === 'em_producao')
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block flex-shrink-0" />Em andamento</span>
  if (status === 'pausada')
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block flex-shrink-0" />Pausada</span>
  return <span className="badge-green">Concluida</span>
}

function netElapsedMs(ordem: OrdemProducao): number {
  if (!ordem.iniciadoEm) return 0
  const start = new Date(ordem.iniciadoEm).getTime()
  const end   = ordem.concluidoEm ? new Date(ordem.concluidoEm).getTime() : Date.now()
  let paused  = 0
  for (const p of ordem.pausas) {
    const s = new Date(p.inicio).getTime()
    const e = p.fim ? new Date(p.fim).getTime() : Date.now()
    paused += e - s
  }
  return Math.max(0, end - start - paused)
}

function elapsedStr(ordem: OrdemProducao): string {
  const ms = netElapsedMs(ordem)
  const secs = Math.floor(ms / 1000)
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function OrdemCard({ ordem, tick }: { ordem: OrdemProducao; tick: number }) {
  void tick
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{ordem.produtoNome}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {ordem.criadoPor} · {fmtDate(ordem.criadoEm)}
          </p>
        </div>
        <StatusBadge status={ordem.status} />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
        <div>
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Qtd</span>
          <p className="font-bold text-gray-900">{ordem.quantidade}</p>
        </div>
        {ordem.petgQuantidade != null && (
          <div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">PETG</span>
            <p className="font-bold text-gray-900">{ordem.petgQuantidade}</p>
          </div>
        )}
        {ordem.iniciadoEm && (
          <div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
              {ordem.concluidoEm ? 'Tempo total' : 'Em andamento'}
            </span>
            <p className={`font-bold ${ordem.concluidoEm ? 'text-green-700' : ordem.status === 'pausada' ? 'text-amber-700' : 'text-blue-700'}`}>
              {elapsedStr(ordem)}
            </p>
          </div>
        )}
        {ordem.pausas.length > 0 && (
          <div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Pausas</span>
            <p className="font-bold text-amber-700">{ordem.pausas.length}</p>
          </div>
        )}
      </div>

      {ordem.obs && (
        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">{ordem.obs}</p>
      )}
    </div>
  )
}

function Section({ title, ordens, color, tick }: { title: string; ordens: OrdemProducao[]; color: string; tick: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <span className="ml-1 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{ordens.length}</span>
      </div>
      {ordens.length === 0 ? (
        <p className="text-sm text-gray-400 px-2">Nenhuma ordem.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {ordens.map(o => <OrdemCard key={o.id} ordem={o} tick={tick} />)}
        </div>
      )}
    </div>
  )
}

export default function Producao({ ordens }: Props) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const chaparia     = ordens.filter(o => o.usuarioDestino === 'CHAPARIA')
  const almoxarifado = ordens.filter(o => o.usuarioDestino === 'ALMOXARIFADO')

  const pendentes  = ordens.filter(o => o.status === 'pendente').length
  const emAndamento = ordens.filter(o => o.status === 'em_producao' || o.status === 'pausada').length
  const concluidas = ordens.filter(o => o.status === 'concluida').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Ordens de Producao</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
          <p className="text-[0.68rem] font-semibold text-gray-400 uppercase tracking-widest mb-1">Pendentes</p>
          <p className="text-3xl font-bold text-orange-600">{pendentes}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
          <p className="text-[0.68rem] font-semibold text-gray-400 uppercase tracking-widest mb-1">Em andamento</p>
          <p className="text-3xl font-bold text-blue-600">{emAndamento}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
          <p className="text-[0.68rem] font-semibold text-gray-400 uppercase tracking-widest mb-1">Concluidas</p>
          <p className="text-3xl font-bold text-green-600">{concluidas}</p>
        </div>
      </div>

      <Section title="Chaparia" ordens={chaparia} color="bg-blue-500" tick={tick} />
      <Section title="Almoxarifado" ordens={almoxarifado} color="bg-purple-500" tick={tick} />
    </div>
  )
}
