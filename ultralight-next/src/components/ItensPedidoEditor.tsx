'use client'

import { useState } from 'react'
import type { Produto, ItemPedido } from '@/lib/types'
import ProductSearchSelect from '@/components/ProductSearchSelect'

interface Props {
  produtos: Produto[]
  itens: ItemPedido[]
  onAdd: (item: ItemPedido) => void
  onRemove: (index: number) => void
  error?: string
  disabled?: boolean
}

export default function ItensPedidoEditor({ produtos, itens, onAdd, onRemove, error, disabled }: Props) {
  const [produtoId, setProdutoId] = useState('')
  const [qtd, setQtd]             = useState('')

  const totalUnidades = itens.reduce((s, i) => s + i.quantidade, 0)

  function handleAdd() {
    const prod = produtos.find(p => p.id === produtoId)
    const q = Number(qtd)
    if (!prod || q <= 0) return
    onAdd({ produtoId: prod.id, produtoNome: prod.nome, quantidade: q })
    setProdutoId(''); setQtd('')
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-3.5 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex gap-2">
          <div className="flex-1">
            <ProductSearchSelect produtos={produtos} value={produtoId} onChange={setProdutoId} hasError={false} />
          </div>
          <input
            type="number"
            min="1"
            value={qtd}
            onChange={e => setQtd(e.target.value)}
            placeholder="Qtd"
            disabled={disabled}
            className="form-field w-20 flex-shrink-0"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={disabled || !produtoId || Number(qtd) <= 0}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap flex-shrink-0"
          >
            Adicionar
          </button>
        </div>
        {error && <p className="field-error mt-1.5">{error}</p>}
      </div>

      {itens.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Nenhum item adicionado ainda.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
            {itens.map((item, i) => (
              <li key={i} className="flex items-center gap-3 px-3.5 py-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="flex-1 min-w-0 text-sm text-gray-800 font-medium truncate">{item.produtoNome}</span>
                <span className="text-sm font-bold text-gray-600 flex-shrink-0">x{item.quantidade}</span>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  disabled={disabled}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-40 transition-colors font-bold text-base leading-none"
                  title="Remover item"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
          <div className="px-3.5 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-500">{itens.length} {itens.length === 1 ? 'item' : 'itens'}</span>
            <span className="font-bold text-gray-700">{totalUnidades} unidades</span>
          </div>
        </>
      )}
    </div>
  )
}
