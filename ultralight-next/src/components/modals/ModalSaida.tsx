'use client'

import { useState, useEffect } from 'react'
import type { Produto } from '@/lib/types'
import ProductSearchSelect from '@/components/ProductSearchSelect'

const EMPRESAS = ['ULTRALIGHT', 'TECNOFLY', 'UL BRASIL', 'ULTRAFOODS', 'PESTSTORE']

interface Props {
  open: boolean
  produtos: Produto[]
  onClose: () => void
  onConfirm: (produtoId: string, qtd: number, obs: string, responsavel: string, empresaDestino: string) => void
}

export default function ModalSaida({ open, produtos, onClose, onConfirm }: Props) {
  const [produtoId,      setProdutoId]      = useState('')
  const [qtd,            setQtd]            = useState('')
  const [obs,            setObs]            = useState('')
  const [responsavel,    setResponsavel]    = useState('')
  const [empresaDestino, setEmpresaDestino] = useState('')
  const [errors,         setErrors]         = useState<Record<string, string>>({})

  const produto = produtos.find(p => p.id === produtoId)

  useEffect(() => {
    if (open) {
      setProdutoId(''); setQtd(''); setObs('')
      setResponsavel(''); setEmpresaDestino(''); setErrors({})
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  function handleConfirm() {
    const errs: Record<string, string> = {}
    if (!produtoId)                         errs.produto        = 'Selecione um produto'
    const q = Number(qtd)
    if (!qtd || q <= 0)                     errs.qtd            = 'Informe uma quantidade válida'
    else if (produto && q > produto.saldo)  errs.qtd            = `Saldo insuficiente. Disponível: ${produto.saldo} ${produto.unidade}`
    if (!responsavel.trim())                errs.responsavel    = 'Informe o nome do responsável'
    if (!empresaDestino)                    errs.empresaDestino = 'Selecione a empresa de destino'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onConfirm(produtoId, q, obs.trim(), responsavel.trim(), empresaDestino)
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
                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Registrar Transferência</h3>
              <p className="text-xs text-gray-500">Pestline → Empresa destino</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Produto */}
          <div>
            <label className="field-label">Produto *</label>
            <ProductSearchSelect
              produtos={produtos}
              value={produtoId}
              onChange={id => { setProdutoId(id); setErrors(e => ({ ...e, produto: '' })) }}
              hasError={!!errors.produto}
            />
            {errors.produto && <p className="field-error">{errors.produto}</p>}
          </div>

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

          {/* Quantidade */}
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

          {/* Responsável */}
          <div>
            <label className="field-label">Responsável *</label>
            <input
              type="text"
              value={responsavel}
              onChange={e => setResponsavel(e.target.value)}
              placeholder="Nome de quem está fazendo a movimentação"
              className={`form-field ${errors.responsavel ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            />
            {errors.responsavel && <p className="field-error">{errors.responsavel}</p>}
          </div>

          {/* Empresa Destino */}
          <div>
            <label className="field-label">Empresa Destino *</label>
            <select
              value={empresaDestino}
              onChange={e => setEmpresaDestino(e.target.value)}
              className={`form-field ${errors.empresaDestino ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            >
              <option value="">— Selecione a empresa —</option>
              {EMPRESAS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            {errors.empresaDestino && <p className="field-error">{errors.empresaDestino}</p>}
          </div>

          {/* Observação */}
          <div>
            <label className="field-label">Observação <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input
              type="text"
              value={obs}
              onChange={e => setObs(e.target.value)}
              placeholder="Ex: uso interno, descarte..."
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
            Confirmar Transferência
          </button>
        </div>
      </div>
    </div>
  )
}
