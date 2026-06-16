'use client'

import { useState, useEffect } from 'react'
import type { OrdemProducao } from '@/lib/types'
import { fmtDate } from '@/lib/utils'

interface Props {
  ordens: OrdemProducao[]
}

type Setor = 'chaparia' | 'almoxarifado'

function StatusBadge({ status }: { status: OrdemProducao['status'] }) {
  if (status === 'pendente')
    return <span className="badge-orange">Pendente</span>
  if (status === 'em_producao')
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block flex-shrink-0" />Em andamento</span>
  if (status === 'pausada')
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block flex-shrink-0" />Pausada</span>
  return <span className="badge-green">Concluída</span>
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

function elapsedStr(ms: number): string {
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
  const ms = netElapsedMs(ordem)
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{ordem.produtoNome}</p>
          <p className="text-xs text-gray-400 mt-0.5">{ordem.criadoPor} · {fmtDate(ordem.criadoEm)}</p>
        </div>
        <StatusBadge status={ordem.status} />
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
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
              {ordem.concluidoEm ? 'Tempo total' : 'Decorrido'}
            </span>
            <p className={`font-bold ${
              ordem.concluidoEm ? 'text-green-700' :
              ordem.status === 'pausada' ? 'text-amber-700' : 'text-blue-700'
            }`}>
              {elapsedStr(ms)}
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
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">{ordem.obs}</p>
      )}
    </div>
  )
}

function StatusGroup({
  title, ordens, tick, color, defaultOpen,
}: { title: string; ordens: OrdemProducao[]; tick: number; color: string; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-2 px-1 text-left"
      >
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
          <span className="text-sm font-bold text-gray-700">{title}</span>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{ordens.length}</span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </button>
      {open && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
          {ordens.length === 0
            ? <p className="text-sm text-gray-400 px-2 col-span-2">Nenhuma ordem.</p>
            : ordens.map(o => <OrdemCard key={o.id} ordem={o} tick={tick} />)
          }
        </div>
      )}
    </div>
  )
}

function SetorView({ ordens, tick }: { ordens: OrdemProducao[]; tick: number }) {
  const pendentes   = ordens.filter(o => o.status === 'pendente')
  const andamento   = ordens.filter(o => o.status === 'em_producao' || o.status === 'pausada')
  const concluidas  = ordens.filter(o => o.status === 'concluida')
  return (
    <div className="space-y-1">
      <StatusGroup title="Pendentes"    ordens={pendentes}  tick={tick} color="bg-orange-500" defaultOpen={true} />
      <StatusGroup title="Em andamento" ordens={andamento}  tick={tick} color="bg-blue-500"   defaultOpen={true} />
      <StatusGroup title="Concluídas"   ordens={concluidas} tick={tick} color="bg-green-500"  defaultOpen={false} />
    </div>
  )
}

export default function Producao({ ordens }: Props) {
  const [setor, setSetor] = useState<Setor>('chaparia')
  const [tick, setTick]   = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const chaparia     = ordens.filter(o => o.usuarioDestino === 'CHAPARIA')
  const almoxarifado = ordens.filter(o => o.usuarioDestino === 'ALMOXARIFADO')

  const pendentes   = ordens.filter(o => o.status === 'pendente').length
  const emAndamento = ordens.filter(o => o.status === 'em_producao' || o.status === 'pausada').length
  const concluidas  = ordens.filter(o => o.status === 'concluida').length

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-900 tracking-tight mb-6">Produção</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
          <p className="text-[0.65rem] font-semibold text-gray-400 uppercase tracking-widest mb-1">Pendentes</p>
          <p className="text-3xl font-bold text-orange-600">{pendentes}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
          <p className="text-[0.65rem] font-semibold text-gray-400 uppercase tracking-widest mb-1">Andamento</p>
          <p className="text-3xl font-bold text-blue-600">{emAndamento}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
          <p className="text-[0.65rem] font-semibold text-gray-400 uppercase tracking-widest mb-1">Concluídas</p>
          <p className="text-3xl font-bold text-green-600">{concluidas}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSetor('chaparia')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-all ${
              setor === 'chaparia'
                ? 'text-blue-700 border-blue-600 bg-blue-50'
                : 'text-gray-500 border-transparent hover:bg-gray-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Chaparia
            <span className="ml-1 text-xs font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{chaparia.length}</span>
          </button>
          <button
            onClick={() => setSetor('almoxarifado')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-all ${
              setor === 'almoxarifado'
                ? 'text-purple-700 border-purple-600 bg-purple-50'
                : 'text-gray-500 border-transparent hover:bg-gray-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            Almoxarifado
            <span className="ml-1 text-xs font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{almoxarifado.length}</span>
          </button>
        </div>

        <div className="p-4">
          {setor === 'chaparia'
            ? <SetorView ordens={chaparia} tick={tick} />
            : <SetorView ordens={almoxarifado} tick={tick} />
          }
        </div>
      </div>
    </div>
  )
}
