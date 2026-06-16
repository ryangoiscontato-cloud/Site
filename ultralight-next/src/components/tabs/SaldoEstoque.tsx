'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import type { Produto } from '@/lib/types'

interface Props { produtos: Produto[] }

function StatusBadge({ p }: { p: Produto }) {
  if (p.saldo === 0) return <span className="badge-red">Zerado</span>
  if (p.estoqueMin > 0 && p.saldo <= p.estoqueMin) return <span className="badge-orange">Estoque baixo</span>
  return <span className="badge-green">Normal</span>
}

export default function SaldoEstoque({ produtos }: Props) {
  const [search, setSearch]         = useState('')
  const [catFilter, setCat]         = useState('')
  const [highlight, setHighlight]   = useState<string | null>(null)
  const [lowStock, setLowStock]     = useState(false)

  const produtosRef = useRef<Produto[]>(produtos)
  useEffect(() => { produtosRef.current = produtos }, [produtos])

  // HID barcode scanner auto-detection
  useEffect(() => {
    let buf = ''
    let lastTime = 0
    function onKey(e: KeyboardEvent) {
      const now = Date.now()
      if (e.key === 'Enter') {
        if (buf.length >= 3) {
          const clean = buf.trim()
          const found = produtosRef.current.find(p => (p.codigoBarras || '').trim() === clean)
          if (found) {
            setSearch(found.nome)
            setHighlight(found.id)
            setTimeout(() => setHighlight(null), 3000)
          } else {
            setSearch(clean)
            setHighlight(null)
          }
        }
        buf = ''; lastTime = 0; return
      }
      if (e.key.length !== 1) return
      if (lastTime > 0 && now - lastTime > 80) buf = ''
      buf += e.key; lastTime = now
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, []) // empty deps, uses ref

  const categorias = useMemo(
    () => [...new Set(produtos.map(p => p.categoria).filter(Boolean))],
    [produtos]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return produtos.filter(p => {
      const matchSearch = !q
        || p.nome.toLowerCase().includes(q)
        || p.codigo.toLowerCase().includes(q)
        || (p.categoria || '').toLowerCase().includes(q)
      const matchCat      = !catFilter || p.categoria === catFilter
      const matchLowStock = !lowStock
        || p.saldo === 0
        || (p.estoqueMin > 0 && p.saldo <= p.estoqueMin)
      return matchSearch && matchCat && matchLowStock
    })
  }, [produtos, search, catFilter, lowStock])

  const qtyColor = (p: Produto) => {
    if (p.saldo === 0) return 'text-red-600'
    if (p.estoqueMin > 0 && p.saldo <= p.estoqueMin) return 'text-orange-600'
    return 'text-gray-900'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Saldo de Estoque</h1>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search + Scanner active badge */}
          <div className="relative flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar produto..."
                value={search}
                onChange={e => { setSearch(e.target.value); setHighlight(null) }}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 min-w-[220px]"
              />
            </div>
            {/* Scanner ativo pulse badge */}
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1 flex-shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Scanner ativo
            </span>
          </div>

          {/* Low stock filter */}
          <button
            onClick={() => setLowStock(v => !v)}
            className={`flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-2 border transition-all ${
              lowStock
                ? 'bg-orange-50 border-orange-300 text-orange-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            Estoque Baixo
          </button>

          {/* Category filter */}
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

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Nenhum produto encontrado</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(p => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-2 transition-all ${
                highlight === p.id
                  ? 'ring-2 ring-yellow-400 bg-yellow-50 border-yellow-200'
                  : 'border-gray-200'
              }`}
            >
              {/* Top row: name + status badge */}
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-gray-800 text-sm leading-snug">{p.nome}</span>
                <StatusBadge p={p} />
              </div>

              {/* Codigo */}
              <div>
                <code className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">{p.codigo}</code>
              </div>

              {/* Stats row */}
              <div className="flex items-end gap-4 mt-1 flex-wrap">
                <div className="flex flex-col">
                  <span className="text-[0.65rem] text-gray-400 uppercase tracking-wide font-medium">Saldo</span>
                  <span className={`text-2xl font-bold leading-none ${qtyColor(p)}`}>
                    {p.saldo}
                    <span className="text-xs font-normal text-gray-400 ml-1">{p.unidade}</span>
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[0.65rem] text-gray-400 uppercase tracking-wide font-medium">Mínimo</span>
                  <span className="text-sm font-semibold text-gray-600">{p.estoqueMin}</span>
                </div>

                {p.categoria && (
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] text-gray-400 uppercase tracking-wide font-medium">Categoria</span>
                    <span className="text-sm font-semibold text-gray-600">{p.categoria}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
