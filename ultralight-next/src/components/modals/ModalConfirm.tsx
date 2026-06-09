'use client'

import { useEffect } from 'react'

interface Props {
  open: boolean
  title: string
  message: string
  onClose: () => void
  onConfirm: () => void
}

export default function ModalConfirm({ open, title, message, onClose, onConfirm }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 bg-red-50 border-b border-red-200 rounded-t-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Esta ação não pode ser desfeita</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
          <button onClick={onClose} className="btn-cancel">Cancelar</button>
          <button onClick={onConfirm} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
