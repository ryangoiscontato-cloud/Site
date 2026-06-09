'use client'

import { useState, useMemo } from 'react'
import type { Produto } from '@/lib/types'

interface Props { produtos: Produto[] }

function StatusBadge({ p }: { p: Produto }) {
  if (p.saldo === 0) return <span className="badge-red">Zerado</span>
  if (p.estoqueMin > 0 && p.saldo <= p.estoqueMin) return <span className="badge-orange">Estoque baixo</span>
  return <span className="badge-green">Normal</span>
}

export default function SaldoEstoque({ produtos }: Props) {
  const [search, setSearch]   = useState('')
  const [catFilter, setCat]   = useState('')

  const categorias = useMemo(() => [...new Set(produtos.map(p => p.categoria).filter(Boolean))], [produtos])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return produtos.filter(p => {
      const matchSearch = !q || p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q)
      const matchCat    = !catFilter || p.categoria === catFilter
      return matchSearch && matchCat
    })
  }, [produtos, search, catFilter])

  const qtyColor = (p: Produto) => {
    if (p.saldo === 0) return 'text-red-600 font-bold'
    if (p.estoqueMin > 0 && p.saldo <= p.estoqueMin) return 'text-orange-600 font-bold'
    return 'text-gray-900 font-bold'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Saldo de Estoque</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 min-w-[220px]"
            />
          </div>
          <select
            value={catFilter}
            onChange={e => setCat(e.target.value)}
            className="select-field"
          >
            <option value="">Todas as categorias</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-[0.72rem] text-gray-500 uppercase tracking-wide border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold">Código</th>
                <th className="px-4 py-3 text-left font-semibold">Produto</th>
                <th className="px-4 py-3 text-left font-semibold">Categoria</th>
                <th className="px-4 py-3 text-left font-semibold">Unidade</th>
                <th className="px-4 py-3 text-left font-semibold">Est. Mín.</th>
                <th className="px-4 py-3 text-left font-semibold">Saldo Atual</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Nenhum produto encontrado</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono font-semibold">{p.codigo}</code>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{p.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{p.categoria || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.unidade}</td>
                  <td className="px-4 py-3 text-gray-600">{p.estoqueMin}</td>
                  <td className="px-4 py-3">
                    <span className={`text-base ${qtyColor(p)}`}>{p.saldo} <span className="text-xs font-normal text-gray-400">{p.unidade}</span></span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge p={p} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
