'use client'

import { useState, useRef } from 'react'
import type { Produto } from '@/lib/types'

interface Props {
  produtos: Produto[]
  value: string
  onChange: (id: string) => void
  hasError?: boolean
}

export default function ProductSearchSelect({ produtos, value, onChange, hasError }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = produtos.find(p => p.id === value)
  const q = query.trim()

  const filtered = q
    ? produtos.filter(p =>
        p.nome.toLowerCase().includes(q.toLowerCase()) ||
        p.codigo.toLowerCase().includes(q.toLowerCase()) ||
        (p.categoria || '').toLowerCase().includes(q.toLowerCase())
      )
    : []

  function pick(id: string) {
    onChange(id)
    setQuery('')
  }

  function clear() {
    onChange('')
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  if (selected) {
    return (
      <div className={`flex items-center gap-3 px-3 py-3 rounded-xl border ${hasError ? 'border-red-400 bg-red-50' : 'border-blue-300 bg-blue-50'}`}>
        <div className="flex-1 min-w-0">
          <code className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono font-semibold">{selected.codigo}</code>
          <p className="font-semibold text-gray-900 text-sm mt-1 truncate">{selected.nome}</p>
          {selected.categoria && <p className="text-xs text-gray-500 truncate">{selected.categoria}</p>}
        </div>
        <button
          type="button"
          onClick={clear}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all"
          title="Trocar produto"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nome, código ou categoria..."
          className={`form-field pl-9 pr-9 ${hasError ? 'border-red-400 ring-2 ring-red-100' : ''}`}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        )}
      </div>

      {!q && (
        <p className="text-xs text-gray-400 px-1">
          Digite o nome, código ou categoria do produto para buscar.
        </p>
      )}

      {q && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <p className="px-4 py-4 text-sm text-gray-400 text-center">
              Nenhum produto encontrado para &ldquo;{q}&rdquo;
            </p>
          ) : (
            <div className="max-h-44 overflow-y-auto divide-y divide-gray-50">
              {filtered.map(p => {
                const isLow  = p.estoqueMin > 0 && p.saldo <= p.estoqueMin && p.saldo > 0
                const isZero = p.saldo === 0
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pick(p.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 active:bg-blue-100 transition-colors"
                  >
                    <code className="text-[0.7rem] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono font-semibold flex-shrink-0">
                      {p.codigo}
                    </code>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{p.nome}</p>
                      {p.categoria && <p className="text-xs text-gray-400 truncate">{p.categoria}</p>}
                    </div>
                    <span className={`text-sm font-bold flex-shrink-0 ${isZero ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-gray-500'}`}>
                      {p.saldo} <span className="text-xs font-normal">{p.unidade}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
