'use client'

import { useState, useEffect } from 'react'
import type { Produto } from '@/lib/types'
import ProductSearchSelect from '@/components/ProductSearchSelect'

interface Props {
  open: boolean
  produtos: Produto[]
  onClose: () => void
  onConfirm: (produtoId: string, qtd: number, obs: string) => void
}

export default function ModalSaida({ open, produtos, onClose, onConfirm }: Props) {
  const [produtoId, setProdutoId] = useState('')
  const [qtd, setQtd]             = useState('')
  const [obs, setObs]             = useState('')
  const [errors, setErrors]       = useState<Record<string, string>>({})

  const produto = produtos.find(p => p.id === produtoId)

  useEffect(() => {
    if (open) { setProdutoId(''); setQtd(''); setObs(''); setErrors({}) }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  function handleConfirm() {
    const errs: Record<string, string> = {}
    if (!produtoId) errs.produto = 'Selecione um produto'
    const q = Number(qtd)
    if (!qtd || q <= 0)                    errs.qtd = 'Informe uma quantidade válida'
    else if (produto && q > produto.saldo) errs.qtd = `Saldo insuficiente. Disponível: ${produto.saldo} ${produto.unidade}`
    if (Object.keys(errs).length) { setErrors(errs); return }
    onConfirm(produtoId, q, obs.trim())
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box-scroll animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-50 border-b border-red-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Registrar Saída</h3>
              <p className="text-xs text-gray-500">Retirar itens do estoque</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Product search */}
          <div>
            <label className="field-label">Produto *</label>
            <ProductSearchSelect
              produtos={produtos}
              value={produtoId}
              onChange={id => { setProdutoId(id); setErrors(e => ({ ...e, produto: '' })) }}
              error={!!errors.produto}
            />
            {errors.produto && <p className="field-error">{errors.produto}</p>}
          </div>

          {/* Current stock info */}
          {produto && (
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Saldo atual</p>
                <p className={`font-bold text-lg leading-none mt-0.5 ${produto.saldo === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {produto.saldo} <span className="text-xs font-normal text-gray-400">{produto.unidade}</span>
                </p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Unidade</p>
                <p className="font-semibold text-gray-900 mt-0.5">{produto.unidade}</p>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="field-label">Quantidade *</label>
            <input
              type="number"
              min="1"
              value={qtd}
              onChange={e => setQtd(e.target.value)}
              placeholder="Digite a quantidade"
              className={`form-field text-lg font-semibold ${errors.qtd ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            />
            {errors.qtd && <p className="field-error">{errors.qtd}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="field-label">Observação <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input
              type="text"
              value={obs}
              onChange={e => setObs(e.target.value)}
              placeholder="Ex: Venda, uso interno, descarte..."
              className="form-field"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-cancel">Cancelar</button>
          <button
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Confirmar Saída
          </button>
        </div>
      </div>
    </div>
  )
}
