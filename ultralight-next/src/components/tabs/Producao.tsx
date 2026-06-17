'use client'

import { useState, useEffect } from 'react'
import type { OrdemProducao } from '@/lib/types'
import { fmtDate } from '@/lib/utils'
import ModalConfirm from '@/components/modals/ModalConfirm'

interface Props {
  ordens: OrdemProducao[]
  cancelarOrdem?: (id: string) => Promise<{ ok: boolean; error?: string }>
  excluirOrdem?: (id: string) => Promise<{ ok: boolean; error?: string }>
}

type Setor = 'chaparia' | 'almoxarifado' | 'montagem'

function StatusBadge({ status }: { status: OrdemProducao['status'] }) {
  if (status === 'pendente')
    return <span className="badge-orange">Pendente</span>
  if (status === 'em_producao')
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block flex-shrink-0" />Em andamento</span>
  if (status === 'pausada')
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block flex-shrink-0" />Pausada</span>
  if (status === 'cancelada')
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Cancelada</span>
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

function OrdemDetailPanel({ ordem, onClose, onCancelar, onExcluir }: {
  ordem: OrdemProducao
  onClose: () => void
  onCancelar?: (id: string) => Promise<{ ok: boolean; error?: string }>
  onExcluir?: (ordem: OrdemProducao) => void
}) {
  const [cancelling, setCancelling] = useState(false)
  const isHistorico = ordem.status === 'concluida' || ordem.status === 'cancelada'

  async function handleCancelar() {
    if (!onCancelar) return
    setCancelling(true)
    await onCancelar(ordem.id)
    setCancelling(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Detalhes da Ordem</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-xl leading-none transition-colors">&times;</button>
        </div>
        <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Produto</p>
            <p className="font-bold text-gray-900 mt-0.5">{ordem.produtoNome}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Status</p>
              <div className="mt-0.5"><StatusBadge status={ordem.status} /></div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Setor</p>
              <p className="font-semibold text-gray-900 mt-0.5 capitalize">{ordem.tipo}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Quantidade</p>
              <p className="font-bold text-gray-900 mt-0.5">{ordem.quantidade}</p>
            </div>
            {ordem.petgQuantidade != null && (
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">PETG</p>
                <p className="font-bold text-gray-900 mt-0.5">{ordem.petgQuantidade}</p>
              </div>
            )}
            {ordem.linha && (
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Linha</p>
                <p className="font-bold text-teal-700 mt-0.5">{ordem.linha}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Criado por</p>
              <p className="font-semibold text-gray-900 mt-0.5">{ordem.criadoPor}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Criado em</p>
              <p className="font-semibold text-gray-900 mt-0.5">{fmtDate(ordem.criadoEm)}</p>
            </div>
          </div>
          {ordem.iniciadoEm && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Iniciado em</p>
                <p className="font-semibold text-gray-900 mt-0.5">{fmtDate(ordem.iniciadoEm)}</p>
              </div>
              {ordem.concluidoEm && (
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Concluído em</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{fmtDate(ordem.concluidoEm)}</p>
                </div>
              )}
            </div>
          )}
          {ordem.obs && (
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Observação</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mt-0.5 border border-gray-100">{ordem.obs}</p>
            </div>
          )}
          {ordem.pausas.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Pausas ({ordem.pausas.length})</p>
              <div className="space-y-1.5">
                {ordem.pausas.map((p, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs">
                    <p className="font-semibold text-amber-800">{p.motivo}</p>
                    <p className="text-amber-600 mt-0.5">{fmtDate(p.inicio)}{p.fim ? ` → ${fmtDate(p.fim)}` : ' (em pausa)'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {onCancelar && ordem.status === 'pendente' && (
          <div className="px-5 py-3 border-t border-gray-100">
            <button
              onClick={handleCancelar}
              disabled={cancelling}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
            >
              {cancelling ? 'Cancelando...' : 'Cancelar Ordem'}
            </button>
          </div>
        )}
        {onExcluir && isHistorico && (
          <div className="px-5 py-3 border-t border-gray-100">
            <button
              onClick={() => onExcluir(ordem)}
              className="w-full py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-bold rounded-xl transition-colors"
            >
              Excluir do histórico
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function OrdemCard({ ordem, tick, onCancelar, onSelect }: { ordem: OrdemProducao; tick: number; onCancelar?: (id: string) => void; onSelect?: (ordem: OrdemProducao) => void }) {
  void tick
  const ms = netElapsedMs(ordem)
  return (
    <button
      onClick={() => onSelect?.(ordem)}
      className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3 text-left hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.99]"
    >
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
      {onCancelar && ordem.status === 'pendente' && (
        <div className="pt-1 border-t border-gray-100">
          <button
            onClick={e => { e.stopPropagation(); onCancelar(ordem.id) }}
            className="w-full text-xs font-semibold text-red-600 hover:text-red-700 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancelar ordem
          </button>
        </div>
      )}
    </button>
  )
}

function StatusGroup({
  title, ordens, tick, color, defaultOpen, onCancelar, onSelect,
}: { title: string; ordens: OrdemProducao[]; tick: number; color: string; defaultOpen: boolean; onCancelar?: (id: string) => void; onSelect?: (ordem: OrdemProducao) => void }) {
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
            : ordens.map(o => <OrdemCard key={o.id} ordem={o} tick={tick} onCancelar={onCancelar} onSelect={onSelect} />)
          }
        </div>
      )}
    </div>
  )
}

function SetorView({ ordens, tick, onCancelar, onSelect }: { ordens: OrdemProducao[]; tick: number; onCancelar?: (id: string) => void; onSelect?: (ordem: OrdemProducao) => void }) {
  const pendentes   = ordens.filter(o => o.status === 'pendente')
  const andamento   = ordens.filter(o => o.status === 'em_producao' || o.status === 'pausada')
  const concluidas  = ordens.filter(o => o.status === 'concluida' || o.status === 'cancelada')
  return (
    <div className="space-y-1">
      <StatusGroup title="Pendentes"    ordens={pendentes}  tick={tick} color="bg-orange-500" defaultOpen={true}  onCancelar={onCancelar} onSelect={onSelect} />
      <StatusGroup title="Em andamento" ordens={andamento}  tick={tick} color="bg-blue-500"   defaultOpen={true}  onSelect={onSelect} />
      <StatusGroup title="Histórico"     ordens={concluidas} tick={tick} color="bg-green-500"  defaultOpen={false} onSelect={onSelect} />
    </div>
  )
}

export default function Producao({ ordens, cancelarOrdem, excluirOrdem }: Props) {
  const [setor, setSetor]           = useState<Setor>('chaparia')
  const [tick, setTick]             = useState(0)
  const [selectedOrdem, setSelectedOrdem] = useState<OrdemProducao | null>(null)
  const [ordemExcluir, setOrdemExcluir]   = useState<OrdemProducao | null>(null)
  const [excluindo, setExcluindo]         = useState(false)

  async function handleExcluirConfirm() {
    if (!ordemExcluir || !excluirOrdem) return
    setExcluindo(true)
    await excluirOrdem(ordemExcluir.id)
    setExcluindo(false)
    setOrdemExcluir(null)
  }

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const chaparia     = ordens.filter(o => o.usuarioDestino === 'CHAPARIA')
  const almoxarifado = ordens.filter(o => o.usuarioDestino === 'ALMOXARIFADO')
  const montagem     = ordens.filter(o => o.usuarioDestino === 'MONTAGEM')

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
          </button>
          <button
            onClick={() => setSetor('montagem')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-all ${
              setor === 'montagem'
                ? 'text-teal-700 border-teal-600 bg-teal-50'
                : 'text-gray-500 border-transparent hover:bg-gray-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            Montagem
          </button>
        </div>

        <div className="p-4">
          {setor === 'chaparia'
            ? <SetorView ordens={chaparia} tick={tick} onCancelar={cancelarOrdem} onSelect={setSelectedOrdem} />
            : setor === 'almoxarifado'
            ? <SetorView ordens={almoxarifado} tick={tick} onCancelar={cancelarOrdem} onSelect={setSelectedOrdem} />
            : <SetorView ordens={montagem} tick={tick} onCancelar={cancelarOrdem} onSelect={setSelectedOrdem} />
          }
        </div>
      </div>
      {selectedOrdem && (
        <OrdemDetailPanel
          ordem={selectedOrdem}
          onClose={() => setSelectedOrdem(null)}
          onCancelar={cancelarOrdem}
          onExcluir={excluirOrdem ? ordem => { setOrdemExcluir(ordem); setSelectedOrdem(null) } : undefined}
        />
      )}
      <ModalConfirm
        open={!!ordemExcluir}
        title="Excluir Ordem"
        message={excluindo ? 'Excluindo...' : 'Tem certeza que deseja excluir esta ordem do histórico? Esta ação não pode ser desfeita.'}
        onClose={() => setOrdemExcluir(null)}
        onConfirm={handleExcluirConfirm}
      />
    </div>
  )
}
