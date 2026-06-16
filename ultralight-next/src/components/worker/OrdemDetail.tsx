'use client'

import { useState, useEffect } from 'react'
import type { OrdemProducao } from '@/lib/types'
import { fmtDate } from '@/lib/utils'

interface Props {
  ordem: OrdemProducao
  onBack: () => void
  onIniciar:  (id: string) => Promise<{ ok: boolean; error?: string }>
  onConcluir: (id: string) => Promise<{ ok: boolean; error?: string }>
  onPausar:   (id: string, motivo: string) => Promise<{ ok: boolean; error?: string }>
  onRetomar:  (id: string) => Promise<{ ok: boolean; error?: string }>
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

function formatMs(ms: number): string {
  const secs = Math.floor(ms / 1000)
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

function useNetTimer(ordem: OrdemProducao) {
  const [ms, setMs] = useState(() => netElapsedMs(ordem))

  useEffect(() => {
    if (!ordem.iniciadoEm) { setMs(0); return }
    setMs(netElapsedMs(ordem))
    if (ordem.concluidoEm) return
    const id = setInterval(() => setMs(netElapsedMs(ordem)), 1000)
    return () => clearInterval(id)
  }, [ordem])

  return ms
}

export default function OrdemDetail({ ordem, onBack, onIniciar, onConcluir, onPausar, onRetomar }: Props) {
  const [loading, setLoading]         = useState(false)
  const [error,   setError]           = useState('')
  const [showPause, setShowPause]     = useState(false)
  const [pauseMotivo, setPauseMotivo] = useState('')

  const ms         = useNetTimer(ordem)
  const showTimer  = ordem.tipo === 'chaparia'
  const isChaparia = ordem.tipo === 'chaparia'

  async function act(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setLoading(true); setError('')
    const res = await fn()
    setLoading(false)
    if (!res.ok) setError(res.error || 'Erro.')
    return res.ok
  }

  async function handlePausar() {
    if (!pauseMotivo.trim()) return
    const ok = await act(() => onPausar(ordem.id, pauseMotivo.trim()))
    if (ok) { setShowPause(false); setPauseMotivo('') }
  }

  const headerBg =
    ordem.status === 'pendente'    ? 'bg-orange-50 border-orange-200' :
    ordem.status === 'em_producao' ? 'bg-blue-50 border-blue-200' :
    ordem.status === 'pausada'     ? 'bg-amber-50 border-amber-200' :
    'bg-green-50 border-green-200'

  return (
    <div className="max-w-lg mx-auto">

      {showPause && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Motivo da Pausa</h3>
            <p className="text-sm text-gray-500 mb-4">Informe o motivo para pausar a producao.</p>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              rows={3}
              placeholder="Ex: Falta de material, intervalo..."
              value={pauseMotivo}
              onChange={e => setPauseMotivo(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowPause(false); setPauseMotivo('') }}
                className="flex-1 py-3 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePausar}
                disabled={!pauseMotivo.trim() || loading}
                className="flex-1 py-3 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 rounded-xl transition-colors"
              >
                {loading ? 'Aguarde...' : 'Confirmar Pausa'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-6 hover:text-blue-900 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
        </svg>
        Voltar
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className={`px-6 py-5 border-b ${headerBg}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            {ordem.tipo === 'chaparia' ? 'CHAPARIA' : 'ALMOXARIFADO'}
          </p>
          <h2 className="text-xl font-bold text-gray-900">{ordem.produtoNome}</h2>
          <p className="text-xs text-gray-500 mt-1">Criado em {fmtDate(ordem.criadoEm)} por {ordem.criadoPor}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Quantidade</p>
              <p className="text-3xl font-bold text-gray-900">{ordem.quantidade}</p>
            </div>
            {ordem.petgQuantidade != null && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">PETG</p>
                <p className="text-3xl font-bold text-gray-900">{ordem.petgQuantidade}</p>
              </div>
            )}
          </div>

          {ordem.obs && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Observacao</p>
              <p className="text-sm text-amber-900">{ordem.obs}</p>
            </div>
          )}

          {showTimer && ordem.iniciadoEm && (
            <div className={`rounded-xl p-4 border text-center ${
              ordem.concluidoEm          ? 'bg-green-50 border-green-200' :
              ordem.status === 'pausada' ? 'bg-amber-50 border-amber-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                ordem.concluidoEm          ? 'text-green-600' :
                ordem.status === 'pausada' ? 'text-amber-600' :
                'text-blue-600'
              }`}>
                {ordem.concluidoEm          ? 'Tempo de producao' :
                 ordem.status === 'pausada' ? 'Em pausa' : 'Em andamento'}
              </p>
              <p className={`text-4xl font-bold font-mono ${
                ordem.concluidoEm          ? 'text-green-700' :
                ordem.status === 'pausada' ? 'text-amber-700' :
                'text-blue-700'
              }`}>
                {formatMs(ms)}
              </p>
              {ordem.concluidoEm && (
                <p className="text-xs text-green-600 mt-2">Concluido em {fmtDate(ordem.concluidoEm)}</p>
              )}
            </div>
          )}

          {ordem.pausas.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Pausas ({ordem.pausas.length})
              </p>
              {ordem.pausas.map((p, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                  <p className="text-sm text-gray-700 font-medium">{p.motivo}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {fmtDate(p.inicio)}{p.fim ? ` -> ${fmtDate(p.fim)}` : ' (em andamento)'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {ordem.status === 'pendente' && (
            <button
              onClick={() => act(() => onIniciar(ordem.id))}
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white text-base font-bold rounded-xl transition-colors"
            >
              {loading ? 'Aguarde...' : isChaparia ? 'Iniciar Producao' : 'Iniciar Separacao'}
            </button>
          )}

          {ordem.status === 'em_producao' && (
            <div className="space-y-3">
              {isChaparia && (
                <button
                  onClick={() => setShowPause(true)}
                  disabled={loading}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-60 text-white text-base font-bold rounded-xl transition-colors"
                >
                  Pausar Producao
                </button>
              )}
              <button
                onClick={() => act(() => onConcluir(ordem.id))}
                disabled={loading}
                className="w-full py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 text-white text-base font-bold rounded-xl transition-colors"
              >
                {loading ? 'Aguarde...' : isChaparia ? 'Concluir Ordem' : 'Concluir Separacao'}
              </button>
            </div>
          )}

          {ordem.status === 'pausada' && (
            <div className="space-y-3">
              <button
                onClick={() => act(() => onRetomar(ordem.id))}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white text-base font-bold rounded-xl transition-colors"
              >
                {loading ? 'Aguarde...' : 'Retomar Producao'}
              </button>
              <button
                onClick={() => act(() => onConcluir(ordem.id))}
                disabled={loading}
                className="w-full py-3 border-2 border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-60 text-base font-bold rounded-xl transition-colors"
              >
                Concluir mesmo assim
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
