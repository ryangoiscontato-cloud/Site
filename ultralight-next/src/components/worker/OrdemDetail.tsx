'use client'

import { useState, useEffect } from 'react'
import type { OrdemProducao } from '@/lib/types'
import { fmtDate } from '@/lib/utils'

interface Props {
  ordem: OrdemProducao
  onBack: () => void
  onIniciar: (id: string) => Promise<{ ok: boolean; error?: string }>
  onConcluir: (id: string) => Promise<{ ok: boolean; error?: string }>
}

function useTimer(from?: string, until?: string) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    if (!from) { setElapsed(''); return }

    function update() {
      const start = new Date(from!).getTime()
      const end   = until ? new Date(until).getTime() : Date.now()
      const secs  = Math.max(0, Math.floor((end - start) / 1000))
      const h = Math.floor(secs / 3600)
      const m = Math.floor((secs % 3600) / 60)
      const s = secs % 60
      setElapsed(
        h > 0
          ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
          : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      )
    }

    update()
    if (until) return
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [from, until])

  return elapsed
}

export default function OrdemDetail({ ordem, onBack, onIniciar, onConcluir }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const elapsed = useTimer(ordem.iniciadoEm, ordem.concluidoEm)

  async function handleIniciar() {
    setLoading(true); setError('')
    const res = await onIniciar(ordem.id)
    setLoading(false)
    if (!res.ok) setError(res.error || 'Erro ao iniciar.')
  }

  async function handleConcluir() {
    setLoading(true); setError('')
    const res = await onConcluir(ordem.id)
    setLoading(false)
    if (!res.ok) setError(res.error || 'Erro ao concluir.')
  }

  return (
    <div className="max-w-lg mx-auto">
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
        <div className={`px-6 py-5 border-b ${
          ordem.status === 'pendente'    ? 'bg-orange-50 border-orange-200' :
          ordem.status === 'em_producao' ? 'bg-blue-50 border-blue-200' :
          'bg-green-50 border-green-200'
        }`}>
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
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Observação</p>
              <p className="text-sm text-amber-900">{ordem.obs}</p>
            </div>
          )}

          {ordem.iniciadoEm && (
            <div className={`rounded-xl p-4 border text-center ${
              ordem.concluidoEm ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                ordem.concluidoEm ? 'text-green-600' : 'text-blue-600'
              }`}>
                {ordem.concluidoEm ? 'Tempo de produção' : 'Em andamento'}
              </p>
              <p className={`text-4xl font-bold font-mono ${
                ordem.concluidoEm ? 'text-green-700' : 'text-blue-700'
              }`}>
                {elapsed}
              </p>
              {ordem.concluidoEm && (
                <p className="text-xs text-green-600 mt-2">
                  Concluído em {fmtDate(ordem.concluidoEm)}
                </p>
              )}
            </div>
          )}

          {ordem.status === 'pendente' && (
            <button
              onClick={handleIniciar}
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white text-base font-bold rounded-xl transition-colors"
            >
              {loading ? 'Aguarde...' : 'Iniciar Produção'}
            </button>
          )}

          {ordem.status === 'em_producao' && (
            <button
              onClick={handleConcluir}
              disabled={loading}
              className="w-full py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 text-white text-base font-bold rounded-xl transition-colors"
            >
              {loading ? 'Aguarde...' : 'Concluir Ordem'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
