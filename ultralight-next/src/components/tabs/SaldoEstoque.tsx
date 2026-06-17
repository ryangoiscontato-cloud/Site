'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import type { Produto } from '@/lib/types'

interface Props {
  produtos: Produto[]
  titulo?: string
  onScanFound?: (produto: Produto) => void
}

function StatusBadge({ p }: { p: Produto }) {
  if (p.saldo === 0) return <span className="badge-red">Zerado</span>
  if (p.estoqueMin > 0 && p.saldo <= p.estoqueMin) return <span className="badge-orange">Estoque baixo</span>
  return <span className="badge-green">Normal</span>
}

function isLowStock(p: Produto) {
  return p.saldo === 0 || (p.estoqueMin > 0 && p.saldo <= p.estoqueMin)
}

function ModalEstoqueBaixo({ open, produtos, onClose }: { open: boolean; produtos: Produto[]; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box-scroll animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-orange-50 border-b border-orange-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Estoque Baixo</h3>
              <p className="text-xs text-gray-500">{produtos.length} {produtos.length === 1 ? 'item precisa' : 'itens precisam'} de atenção</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {produtos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 text-gray-400 py-10">
              <svg className="w-10 h-10 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              <p className="text-sm">Nenhum produto com estoque baixo</p>
            </div>
          ) : (
            <div className="space-y-2">
              {produtos.map(p => (
                <div key={p.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <code className="text-[0.65rem] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono font-semibold">{p.codigo}</code>
                    <p className="font-semibold text-gray-900 mt-1 text-sm leading-snug truncate">{p.nome}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge p={p} />
                    <p className={`text-sm font-bold leading-none ${p.saldo === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {p.saldo} <span className="text-xs font-normal text-gray-400">{p.unidade}</span>
                      <span className="text-xs font-normal text-gray-400 ml-1">| mín: {p.estoqueMin}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-cancel">Fechar</button>
        </div>
      </div>
    </div>
  )
}

export default function SaldoEstoque({ produtos, titulo = 'Saldo de Estoque Pestline', onScanFound }: Props) {
  const [search, setSearch]             = useState('')
  const [catFilter, setCat]             = useState('')
  const [highlight, setHighlight]       = useState<string | null>(null)
  const [showLowStock, setShowLowStock] = useState(false)

  const produtosRef = useRef<Produto[]>(produtos)
  useEffect(() => { produtosRef.current = produtos }, [produtos])

  const onScanFoundRef = useRef(onScanFound)
  useEffect(() => { onScanFoundRef.current = onScanFound }, [onScanFound])

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
            onScanFoundRef.current?.(found)
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
  }, []) // empty deps, uses refs

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
      const matchCat = !catFilter || p.categoria === catFilter
      return matchSearch && matchCat
    })
  }, [produtos, search, catFilter])

  const lowStockItems = useMemo(() => produtos.filter(isLowStock), [produtos])

  const qtyColor = (p: Produto) => {
    if (p.saldo === 0) return 'text-red-600 font-bold'
    if (p.estoqueMin > 0 && p.saldo <= p.estoqueMin) return 'text-orange-600 font-bold'
    return 'text-gray-900 font-bold'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900 tracking-tight">{titulo}</h1>

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

          {/* Low stock modal trigger */}
          <button
            onClick={() => setShowLowStock(true)}
            className="flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-2 border transition-all bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            Estoque Baixo
            {lowStockItems.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[0.65rem] font-bold rounded-full bg-orange-100 text-orange-700">
                {lowStockItems.length}
              </span>
            )}
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

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 flex flex-col items-center gap-2 text-gray-400">
          <svg className="w-10 h-10 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <p className="text-sm">Nenhum produto encontrado</p>
        </div>
      ) : (
        <>
          {/* ── Mobile: card list ── */}
          <div className="lg:hidden space-y-2">
            {filtered.map(p => (
              <div
                key={p.id}
                className={`bg-white border rounded-xl shadow-sm p-3 transition-all ${
                  highlight === p.id ? 'ring-2 ring-yellow-400 bg-yellow-50 border-yellow-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {/* Left: code, name, category */}
                  <div className="flex-1 min-w-0">
                    <code className="text-[0.65rem] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono font-semibold">{p.codigo}</code>
                    <p className="font-semibold text-gray-900 mt-1 text-sm leading-snug truncate">{p.nome}</p>
                    {p.categoria && <p className="text-xs text-gray-400 mt-0.5 truncate">{p.categoria}</p>}
                  </div>
                  {/* Right: status + saldo */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge p={p} />
                    <p className={`text-sm leading-none ${qtyColor(p)}`}>
                      {p.saldo} <span className="text-xs font-normal text-gray-400">{p.unidade}</span>
                      {p.estoqueMin > 0 && <span className="text-xs font-normal text-gray-400 ml-1">| mín: {p.estoqueMin}</span>}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop: table ── */}
          <div className="hidden lg:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-[0.72rem] text-gray-500 uppercase tracking-wide border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold">Código</th>
                    <th className="px-4 py-3 text-left font-semibold">Produto</th>
                    <th className="px-4 py-3 text-left font-semibold">Categoria</th>
                    <th className="px-4 py-3 text-left font-semibold">Unidade</th>
                    <th className="px-4 py-3 text-left font-semibold">Est. Mín.</th>
                    <th className="px-4 py-3 text-left font-semibold">Saldo</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr
                      key={p.id}
                      className={`border-t border-gray-100 transition-colors ${
                        highlight === p.id ? 'bg-yellow-50' : 'hover:bg-blue-50'
                      }`}
                    >
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
                      <td className="px-4 py-3">
                        <StatusBadge p={p} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ModalEstoqueBaixo open={showLowStock} produtos={lowStockItems} onClose={() => setShowLowStock(false)} />
    </div>
  )
}
