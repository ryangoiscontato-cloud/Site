'use client'

import { useState, useMemo } from 'react'
import type { Movimento } from '@/lib/types'
import { fmtDate } from '@/lib/utils'

interface Props {
  historico: Movimento[]
  onLimpar: () => void
}

function DetailModal({ mov, onClose }: { mov: Movimento; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box animate-slide-up">
        <div className={`flex items-center justify-between px-6 py-5 ${mov.tipo === 'entrada' ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'} rounded-t-2xl`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 ${mov.tipo === 'entrada' ? 'bg-green-600' : 'bg-red-600'} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                {mov.tipo === 'entrada'
                  ? <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                  : <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
                }
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Detalhes do Movimento</h3>
              <p className="text-xs text-gray-500 mt-0.5">#{mov.id.slice(-4).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <Row label="Produto" value={mov.produtoNome} />
          <Row label="Tipo">
            {mov.tipo === 'entrada'
              ? <span className="badge-green">Entrada</span>
              : <span className="badge-red">Saída / Transferência</span>}
          </Row>
          <Row label="Quantidade">
            <span className={`font-bold text-base ${mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
              {mov.tipo === 'entrada' ? '+' : '-'}{mov.qtd}
            </span>
          </Row>
          <Row label="Data / Hora" value={fmtDate(mov.data)} />
          {mov.responsavel   && <Row label="Responsável"    value={mov.responsavel} />}
          {mov.empresaDestino && (
            <Row label="Empresa Destino">
              <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">{mov.empresaDestino}</span>
            </Row>
          )}
          {mov.obs && <Row label="Observação" value={mov.obs} />}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="btn-cancel">Fechar</button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold w-32 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800">{children ?? value ?? '—'}</span>
    </div>
  )
}

export default function Historico({ historico, onLimpar }: Props) {
  const [search,    setSearch]   = useState('')
  const [tipoFilter, setTipo]    = useState<'' | 'entrada' | 'saida'>('')
  const [dateFrom,  setDateFrom] = useState('')
  const [dateTo,    setDateTo]   = useState('')
  const [selected,  setSelected] = useState<Movimento | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return [...historico].reverse().filter(h => {
      const hDate = h.data.slice(0, 10)
      if (q && !h.produtoNome.toLowerCase().includes(q)) return false
      if (tipoFilter && h.tipo !== tipoFilter)           return false
      if (dateFrom && hDate < dateFrom)                  return false
      if (dateTo   && hDate > dateTo)                    return false
      return true
    })
  }, [historico, search, tipoFilter, dateFrom, dateTo])

  const totalEntrada = useMemo(
    () => filtered.filter(h => h.tipo === 'entrada').reduce((s, h) => s + h.qtd, 0),
    [filtered]
  )
  const totalSaida = useMemo(
    () => filtered.filter(h => h.tipo === 'saida').reduce((s, h) => s + h.qtd, 0),
    [filtered]
  )

  const hasFilters = search || tipoFilter || dateFrom || dateTo

  function clearFilters() {
    setSearch(''); setTipo(''); setDateFrom(''); setDateTo('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900 tracking-tight">Histórico de Movimentos</h1>
        <button
          onClick={() => {
            if (confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) onLimpar()
          }}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-red-300 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          Limpar histórico
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex flex-col gap-0.5">
          <p className="text-[0.68rem] font-semibold text-gray-400 uppercase tracking-wide">Movimentos</p>
          <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
          {hasFilters && <p className="text-[0.68rem] text-gray-400">no período filtrado</p>}
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-sm flex flex-col gap-0.5">
          <p className="text-[0.68rem] font-semibold text-green-600 uppercase tracking-wide">Total Entradas</p>
          <p className="text-2xl font-bold text-green-700">+{totalEntrada.toLocaleString('pt-BR')}</p>
          {hasFilters && <p className="text-[0.68rem] text-green-500">no período filtrado</p>}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-sm flex flex-col gap-0.5">
          <p className="text-[0.68rem] font-semibold text-red-600 uppercase tracking-wide">Total Saídas</p>
          <p className="text-2xl font-bold text-red-700">-{totalSaida.toLocaleString('pt-BR')}</p>
          {hasFilters && <p className="text-[0.68rem] text-red-500">no período filtrado</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50"
            />
          </div>
          <select
            value={tipoFilter}
            onChange={e => setTipo(e.target.value as '' | 'entrada' | 'saida')}
            className="select-field flex-shrink-0"
          >
            <option value="">Todos os tipos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 flex-shrink-0">Período:</span>
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-[140px]">
              <label className="absolute -top-2 left-2.5 text-[0.65rem] font-semibold text-gray-400 bg-white px-1">De</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-gray-50 transition-all"
              />
            </div>
            <span className="text-gray-400 text-sm flex-shrink-0">—</span>
            <div className="relative flex-1 min-w-[140px]">
              <label className="absolute -top-2 left-2.5 text-[0.65rem] font-semibold text-gray-400 bg-white px-1">Até</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-gray-50 transition-all"
              />
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex-shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
            >
              Limpar filtros
            </button>
          )}
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
                <th className="px-4 py-3 text-left font-semibold">Qtd</th>
                <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Responsável</th>
                <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Destino</th>
                <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Data / Hora</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    {historico.length === 0
                      ? 'Nenhum movimento registrado ainda'
                      : 'Nenhum movimento encontrado para os filtros aplicados'}
                  </td>
                </tr>
              ) : filtered.map(h => (
                <tr
                  key={h.id}
                  onClick={() => setSelected(h)}
                  className="border-t border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">#{h.id.slice(-4).toUpperCase()}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 max-w-[140px]">
                    <span className="truncate block">{h.produtoNome}</span>
                  </td>
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
                  <td className="px-4 py-3 text-gray-500 text-sm hidden sm:table-cell">{h.responsavel || '—'}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {h.empresaDestino
                      ? <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">{h.empresaDestino}</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(h.data)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <DetailModal mov={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
