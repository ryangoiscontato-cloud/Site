'use client'

import { useState, useEffect } from 'react'
import type { Produto } from '@/lib/types'

interface Props {
  open: boolean
  produto: Produto | null
  onClose: () => void
  onConfirm: (produtoId: string, novoSaldo: number, obs: string) => void
}

export default function ModalAjusteSaldo({ open, produto, onClose, onConfirm }: Props) {
  const [novoSaldo, setNovoSaldo] = useState('')
  const [obs, setObs]             = useState('')
  const [errors, setErrors]       = useState<Record<string, string>>({})

  useEffect(() => {
    if (open && produto) {
      setNovoSaldo(String(produto.saldo))
      setObs('')
      setErrors({})
    }
  }, [open, produto])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  function handleConfirm() {
    if (!produto) return
    const errs: Record<string, string> = {}
    if (novoSaldo.trim() === '' || isNaN(Number(novoSaldo)) || Number(novoSaldo) < 0) {
      errs.novoSaldo = 'Informe um saldo válido (número não-negativo)'
    }
    if (Object.keys(errs).length) { setErrors(errs); return }
    onConfirm(produto.id, Number(novoSaldo), obs.trim())
  }

  if (!open || !produto) return null

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box-scroll animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-blue-50 border-b border-blue-100 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Ajustar Saldo</h3>
              <p className="text-xs text-gray-500">Atualizar a quantidade em estoque</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Product info */}
          <div>
            <p className="font-bold text-gray-900 text-lg leading-snug">{produto.nome}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono font-semibold">{produto.codigo}</code>
              {produto.categoria && <span className="text-xs text-gray-400">{produto.categoria}</span>}
            </div>
          </div>

          {/* Current stock info */}
          <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Saldo atual</p>
              <p className="font-bold text-gray-900 text-lg leading-none mt-0.5">{produto.saldo} <span className="text-xs font-normal text-gray-400">{produto.unidade}</span></p>
            </div>
          </div>

          {/* New balance */}
          <div>
            <label className="field-label">Novo saldo *</label>
            <input
              type="number"
              min="0"
              value={novoSaldo}
              onChange={e => { setNovoSaldo(e.target.value); setErrors(ev => ({ ...ev, novoSaldo: '' })) }}
              placeholder="Digite o novo saldo"
              className={`form-field text-lg font-semibold ${errors.novoSaldo ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            />
            {errors.novoSaldo && <p className="field-error">{errors.novoSaldo}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="field-label">Motivo do ajuste <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input
              type="text"
              value={obs}
              onChange={e => setObs(e.target.value)}
              placeholder="Ex: Contagem física, picking, avaria..."
              className="form-field"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-cancel">Cancelar</button>
          <button
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Confirmar Ajuste
          </button>
        </div>
      </div>
    </div>
  )
}
