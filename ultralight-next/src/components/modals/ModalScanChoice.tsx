'use client'

import { useEffect } from 'react'
import type { Produto } from '@/lib/types'

interface Props {
  produto: Produto
  onEntrada: () => void
  onSaida: () => void
  onClose: () => void
}

export default function ModalScanChoice({ produto, onEntrada, onSaida, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 bg-blue-50 border-b border-blue-100 rounded-t-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M6 5v14M10 5v14M14 5v14M18 5v14"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Produto encontrado</h3>
              <p className="text-xs text-gray-500 mt-0.5">O que você deseja registrar?</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="px-6 py-5">
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
            <code className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-mono font-semibold">{produto.codigo}</code>
            <p className="font-bold text-gray-900 mt-1.5">{produto.nome}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Saldo atual: <span className="font-semibold text-gray-700">{produto.saldo} {produto.unidade}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onEntrada}
              className="flex flex-col items-center gap-2 py-5 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold transition-colors"
            >
              <svg className="w-7 h-7" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              Entrada
            </button>
            <button
              onClick={onSaida}
              className="flex flex-col items-center gap-2 py-5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold transition-colors"
            >
              <svg className="w-7 h-7" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
              </svg>
              Saída
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  )
}
