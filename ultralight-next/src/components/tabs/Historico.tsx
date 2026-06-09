'use client'

import { useState, useMemo } from 'react'
import type { Movimento } from '@/lib/types'
import { fmtDate } from '@/lib/utils'

interface Props {
  historico: Movimento[]
  onLimpar: () => void
}

export default function Historico({ historico, onLimpar }: Props) {
  const [search, setSearch]     = useState('')
  const [tipoFilter, setTipo]   = useState<'' | 'entrada' | 'saida'>('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return [...historico].reverse().filter(h => {
      const matchSearch = !q || h.produtoNome.toLowerCase().includes(q)
      const matchTipo   = !tipoFilter || h.tipo === tipoFilter
      return matchSearch && matchTipo
    })
  }, [historico, search, tipoFilter])

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Histórico de Movimentos</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por produto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 min-w-[220px]"
            />
          </div>
          <select
            value={tipoFilter}
            onChange={e => setTipo(e.target.value as '' | 'entrada' | 'saida')}
            className="select-field"
          >
            <option value="">Todos os tipos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
                onLimpar()
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            Limpar
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-[0.72rem] text-gray-500 uppercase tracking-wide border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Produto</th>
                <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold">Quantidade</th>
                <th className="px-4 py-3 text-left font-semibold">Observação</th>
                <th className="px-4 py-3 text-left font-semibold">Data / Hora</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Nenhum movimento encontrado</td></tr>
              ) : filtered.map(h => (
                <tr key={h.id} className="border-t border-gray-100 hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">#{h.id.slice(-4).toUpperCase()}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{h.produtoNome}</td>
                  <td className="px-4 py-3">
                    {h.tipo === 'entrada'
                      ? <span className="badge-green">Entrada</span>
                      : <span className="badge-red">Saída</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-base ${h.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {h.tipo === 'entrada' ? '+' : '-'}{h.qtd}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{h.obs || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(h.data)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
