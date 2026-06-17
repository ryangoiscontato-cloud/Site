'use client'

import { useEffect } from 'react'
import type { Movimento } from '@/lib/types'
import { fmtDate } from '@/lib/utils'

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold w-32 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800">{children ?? value ?? '—'}</span>
    </div>
  )
}

export default function MovimentoDetailModal({ mov, onClose, onExcluir }: { mov: Movimento; onClose: () => void; onExcluir?: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box animate-slide-up">
        <div className={`flex items-center justify-between px-6 py-5 ${mov.tipo === 'entrada' ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'} rounded-t-2xl`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 ${mov.tipo === 'entrada' ? 'bg-green-600' : 'bg-red-600'} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                {mov.tipo === 'entrada'
                  ? <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                  : <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
                }
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Detalhes do Movimento</h3>
              <p className="text-xs text-gray-500 mt-0.5">#{mov.id.slice(-4).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <Row label="Produto" value={mov.produtoNome} />
          <Row label="Tipo">
            {mov.tipo === 'entrada'
              ? <span className="badge-green">Entrada</span>
              : <span className="badge-red">Saída / Transferência</span>}
          </Row>
          <Row label="Quantidade">
            <span className={`font-bold text-base ${mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
              {mov.tipo === 'entrada' ? '+' : '-'}{mov.qtd}
            </span>
          </Row>
          <Row label="Data / Hora" value={fmtDate(mov.data)} />
          {mov.responsavel    && <Row label="Responsável"    value={mov.responsavel} />}
          {mov.empresaDestino && (
            <Row label="Empresa Destino">
              <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">{mov.empresaDestino}</span>
            </Row>
          )}
          {mov.usuarioNome && <Row label="Registrado por" value={mov.usuarioNome} />}
          {mov.obs && <Row label="Observação" value={mov.obs} />}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-between gap-2.5">
          {onExcluir
            ? <button onClick={onExcluir} className="px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors">Excluir movimento</button>
            : <span />}
          <button onClick={onClose} className="btn-cancel">Fechar</button>
        </div>
      </div>
    </div>
  )
}
