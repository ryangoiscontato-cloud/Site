'use client'

import { useState, useMemo } from 'react'
import type { Movimento } from '@/lib/types'
import { fmtDate } from '@/lib/utils'
import MovimentoDetailModal from '@/components/modals/MovimentoDetailModal'

interface Props {
  historico: Movimento[]
}

type Preset = 'hoje' | 'todos' | '7dias' | 'mes' | 'ano' | 'personalizado'

function localISODate(d: Date): string {
  // yyyy-mm-dd in local time (avoids UTC off-by-one)
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

export default function Historico({ historico }: Props) {
  const [search,    setSearch]   = useState('')
  const [tipoFilter, setTipo]    = useState<'' | 'entrada' | 'saida'>('')
  const [preset,    setPreset]   = useState<Preset>('todos')
  const [dateFrom,  setDateFrom] = useState('')
  const [dateTo,    setDateTo]   = useState('')
  const [selected,  setSelected] = useState<Movimento | null>(null)

  // Compute effective date range from the active preset
  const { rangeFrom, rangeTo } = useMemo(() => {
    const now = new Date()
    const today = localISODate(now)
    if (preset === 'hoje') {
      return { rangeFrom: today, rangeTo: today }
    }
    if (preset === '7dias') {
      const d = new Date(); d.setDate(d.getDate() - 6)
      return { rangeFrom: localISODate(d), rangeTo: today }
    }
    if (preset === 'mes') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1)
      return { rangeFrom: localISODate(d), rangeTo: today }
    }
    if (preset === 'ano') {
      const d = new Date(now.getFullYear(), 0, 1)
      return { rangeFrom: localISODate(d), rangeTo: today }
    }
    if (preset === 'personalizado') {
      return { rangeFrom: dateFrom, rangeTo: dateTo }
    }
    return { rangeFrom: '', rangeTo: '' }
  }, [preset, dateFrom, dateTo])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return [...historico].reverse().filter(h => {
      const hDate = h.data.slice(0, 10)
      if (q && !h.produtoNome.toLowerCase().includes(q)) return false
      if (tipoFilter && h.tipo !== tipoFilter)           return false
      if (rangeFrom && hDate < rangeFrom)                return false
      if (rangeTo   && hDate > rangeTo)                  return false
      return true
    })
  }, [historico, search, tipoFilter, rangeFrom, rangeTo])

  const totalEntrada = useMemo(
    () => filtered.filter(h => h.tipo === 'entrada').reduce((s, h) => s + h.qtd, 0),
    [filtered]
  )
  const totalSaida = useMemo(
    () => filtered.filter(h => h.tipo === 'saida').reduce((s, h) => s + h.qtd, 0),
    [filtered]
  )

  const hasFilters = search || tipoFilter || preset !== 'todos'

  function clearFilters() {
    setSearch(''); setTipo(''); setPreset('todos'); setDateFrom(''); setDateTo('')
  }

  const presets: { id: Preset; label: string }[] = [
    { id: 'hoje',          label: 'Hoje' },
    { id: 'todos',         label: 'Tudo' },
    { id: '7dias',         label: 'Últimos 7 dias' },
    { id: 'mes',           label: 'Este mês' },
    { id: 'ano',           label: 'Este ano' },
    { id: 'personalizado', label: 'Personalizado' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900 tracking-tight">Histórico de Movimentos</h1>
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

        {/* Period presets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Período</span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
              >
                Limpar filtros
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  preset === p.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {preset === 'personalizado' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">De</label>
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={e => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-gray-50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Até</label>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={e => setDateTo(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-gray-50 transition-all"
                />
              </div>
            </div>
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

      {selected && <MovimentoDetailModal mov={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
