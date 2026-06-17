'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import type { Produto } from '@/lib/types'

interface Props {
  produtos: Produto[]
  onNovo: () => void
  onEditar: (p: Produto) => void
  onExcluir: (p: Produto) => void
}

function StatusBadge({ p }: { p: Produto }) {
  if (p.saldo === 0) return <span className="badge-red">Zerado</span>
  if (p.estoqueMin > 0 && p.saldo <= p.estoqueMin) return <span className="badge-orange">Estoque baixo</span>
  return <span className="badge-green">Normal</span>
}

export default function Produtos({ produtos, onNovo, onEditar, onExcluir }: Props) {
  const [search, setSearch] = useState('')

  const produtosRef = useRef<Produto[]>(produtos)
  useEffect(() => { produtosRef.current = produtos }, [produtos])

  const onEditarRef = useRef(onEditar)
  useEffect(() => { onEditarRef.current = onEditar }, [onEditar])

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
            onEditarRef.current(found)
          } else {
            setSearch(clean)
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return produtos
    return produtos.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      p.codigo.toLowerCase().includes(q) ||
      (p.categoria || '').toLowerCase().includes(q)
    )
  }, [produtos, search])

  const qtyColor = (p: Produto) => {
    if (p.saldo === 0) return 'text-red-600 font-bold'
    if (p.estoqueMin > 0 && p.saldo <= p.estoqueMin) return 'text-orange-600 font-bold'
    return 'text-gray-900 font-bold'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900 tracking-tight">Gerenciar Produtos</h1>
        <button
          onClick={onNovo}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-md"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          Novo Produto
        </button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, código ou categoria..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all"
            autoCorrect="off"
            spellCheck={false}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          )}
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Scanner ativo
        </span>
      </div>

      {produtos.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 flex flex-col items-center gap-3 text-gray-400">
          <svg className="w-14 h-14 text-gray-200" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
          </svg>
          <p className="text-sm text-center">Nenhum produto cadastrado. Toque em &ldquo;Novo Produto&rdquo; para começar.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 flex flex-col items-center gap-2 text-gray-400">
          <svg className="w-10 h-10 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <p className="text-sm">Nenhum produto encontrado para &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        <>
          {/* ── Mobile: card list ── */}
          <div className="lg:hidden space-y-2">
            {filtered.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-3">
                <div className="flex items-start gap-2">
                  {/* Left: code, name, category */}
                  <div className="flex-1 min-w-0">
                    <code className="text-[0.65rem] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono font-semibold">{p.codigo}</code>
                    <p className="font-semibold text-gray-900 mt-1 text-sm leading-snug truncate">{p.nome}</p>
                    {p.categoria && <p className="text-xs text-gray-400 mt-0.5 truncate">{p.categoria}</p>}
                  </div>
                  {/* Right: status + saldo + actions */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge p={p} />
                    <p className={`text-sm font-bold leading-none ${qtyColor(p)}`}>
                      {p.saldo} <span className="text-xs font-normal text-gray-400">{p.unidade}</span>
                      {p.estoqueMin > 0 && <span className="text-xs font-normal text-gray-400 ml-1">| mín: {p.estoqueMin}</span>}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <button
                        onClick={() => onEditar(p)}
                        title="Editar"
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 active:bg-blue-100 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => onExcluir(p)}
                        title="Excluir"
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 active:bg-red-100 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
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
                    <th className="px-4 py-3 text-left font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => onEditar(p)} title="Editar"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                            </svg>
                          </button>
                          <button onClick={() => onExcluir(p)} title="Excluir"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
