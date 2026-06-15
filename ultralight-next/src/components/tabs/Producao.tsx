'use client'

import type { OrdemProducao } from '@/lib/types'
import { fmtDate } from '@/lib/utils'

interface Props {
  ordens: OrdemProducao[]
}

function StatusBadge({ status }: { status: OrdemProducao['status'] }) {
  if (status === 'pendente')    return <span className="badge-orange">Pendente</span>
  if (status === 'em_producao') return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block flex-shrink-0" />Em produção</span>
  return <span className="badge-green">Concluída</span>
}

function elapsedStr(from: string, to?: string): string {
  const start = new Date(from).getTime()
  const end   = to ? new Date(to).getTime() : Date.now()
  const secs  = Math.floor((end - start) / 1000)
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function OrdemCard({ ordem }: { ordem: OrdemProducao }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{ordem.produtoNome}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Criado por {ordem.criadoPor} · {fmtDate(ordem.criadoEm)}
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
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Iniciado</span>
            <p className="font-bold text-gray-900">{fmtDate(ordem.iniciadoEm)}</p>
          </div>
        )}
        {ordem.concluidoEm && (
          <div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Concluído</span>
            <p className="font-bold text-gray-900">{fmtDate(ordem.concluidoEm)}</p>
          </div>
        )}
        {ordem.iniciadoEm && (
          <div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
              {ordem.concluidoEm ? 'Tempo total' : 'Em andamento'}
            </span>
            <p className={`font-bold ${ordem.concluidoEm ? 'text-green-700' : 'text-blue-700'}`}>
              {elapsedStr(ordem.iniciadoEm, ordem.concluidoEm)}
            </p>
          </div>
        )}
      </div>

      {ordem.obs && (
        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">{ordem.obs}</p>
      )}
    </div>
  )
}

function Section({ title, ordens, color }: { title: string; ordens: OrdemProducao[]; color: string }) {
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
          {ordens.map(o => <OrdemCard key={o.id} ordem={o} />)}
        </div>
      )}
    </div>
  )
}

export default function Producao({ ordens }: Props) {
  const chaparia      = ordens.filter(o => o.usuarioDestino === 'CHAPARIA')
  const almoxarifado  = ordens.filter(o => o.usuarioDestino === 'ALMOXARIFADO')

  const pendentes   = ordens.filter(o => o.status === 'pendente').length
  const emProducao  = ordens.filter(o => o.status === 'em_producao').length
  const concluidas  = ordens.filter(o => o.status === 'concluida').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Ordens de Produção</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
          <p className="text-[0.68rem] font-semibold text-gray-400 uppercase tracking-widest mb-1">Pendentes</p>
          <p className="text-3xl font-bold text-orange-600">{pendentes}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
          <p className="text-[0.68rem] font-semibold text-gray-400 uppercase tracking-widest mb-1">Em Produção</p>
          <p className="text-3xl font-bold text-blue-600">{emProducao}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
          <p className="text-[0.68rem] font-semibold text-gray-400 uppercase tracking-widest mb-1">Concluídas</p>
          <p className="text-3xl font-bold text-green-600">{concluidas}</p>
        </div>
      </div>

      <Section title="Chaparia" ordens={chaparia} color="bg-blue-500" />
      <Section title="Almoxarifado" ordens={almoxarifado} color="bg-purple-500" />
    </div>
  )
}
