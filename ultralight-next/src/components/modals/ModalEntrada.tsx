'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Produto } from '@/lib/types'
import ProductSearchSelect from '@/components/ProductSearchSelect'

interface Props {
  open: boolean
  produtos: Produto[]
  presetProdutoId?: string
  onClose: () => void
  onConfirm: (produtoId: string, qtd: number, obs: string) => void | Promise<void>
}

export default function ModalEntrada({ open, produtos, presetProdutoId, onClose, onConfirm }: Props) {
  const [produtoId, setProdutoId] = useState('')
  const [qtd, setQtd]             = useState('')
  const [obs, setObs]             = useState('')
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const [loading, setLoading]     = useState(false)

  const produto = produtos.find(p => p.id === produtoId)

  const produtosRef = useRef(produtos)
  useEffect(() => { produtosRef.current = produtos }, [produtos])

  useEffect(() => {
    if (open) { setProdutoId(presetProdutoId || ''); setQtd(''); setObs(''); setErrors({}); setLoading(false) }
  }, [open, presetProdutoId])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    let buf = ''
    let lastTime = 0

    function onKey(e: KeyboardEvent) {
      const now = Date.now()
      if (e.key === 'Enter') {
        if (buf.length >= 3) {
          const code = buf.trim()
          const found = produtosRef.current.find(p => (p.codigoBarras || '').trim() === code)
          if (found) {
            setProdutoId(found.id)
            setErrors(ev => ({ ...ev, produto: '' }))
          } else {
            setErrors(ev => ({ ...ev, produto: `Código "${code}" não encontrado` }))
          }
        }
        buf = ''
        lastTime = 0
        return
      }
      if (e.key.length !== 1) return
      if (lastTime > 0 && now - lastTime > 80) buf = ''
      buf += e.key
      lastTime = now
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  async function handleConfirm() {
    if (loading) return
    const errs: Record<string, string> = {}
    if (!produtoId) errs.produto = 'Selecione um produto'
    if (!qtd || Number(qtd) <= 0) errs.qtd = 'Informe uma quantidade válida'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await onConfirm(produtoId, Number(qtd), obs.trim())
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box-scroll animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-green-50 border-b border-green-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Registrar Entrada</h3>
              <p className="text-xs text-gray-500">Adicionar itens ao estoque</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Product search */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="field-label !mb-0">Produto *</label>
              <span className="flex items-center gap-1 text-[0.65rem] font-semibold text-green-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                Scanner ativo
              </span>
            </div>
            <ProductSearchSelect
              produtos={produtos}
              value={produtoId}
              onChange={id => { setProdutoId(id); setErrors(e => ({ ...e, produto: '' })) }}
              hasError={!!errors.produto}
            />
            {errors.produto && <p className="field-error">{errors.produto}</p>}
          </div>

          {/* Current stock info */}
          {produto && (
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Saldo atual</p>
                <p className="font-bold text-gray-900 text-lg leading-none mt-0.5">{produto.saldo} <span className="text-xs font-normal text-gray-400">{produto.unidade}</span></p>
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
              placeholder="Ex: Compra de fornecedor, devolução..."
              className="form-field"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-cancel">Cancelar</button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            {loading ? 'Enviando...' : 'Confirmar Entrada'}
          </button>
        </div>
      </div>
    </div>
  )
}
