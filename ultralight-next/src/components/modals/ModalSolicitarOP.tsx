'use client'

import { useState, useEffect } from 'react'
import type { Produto, Usuario } from '@/lib/types'
import type { useOrdens } from '@/hooks/useOrdens'
import ProductSearchSelect from '@/components/ProductSearchSelect'

type CriarOrdem = ReturnType<typeof useOrdens>['criarOrdem']

interface Props {
  open: boolean
  produtos: Produto[]
  user: Usuario
  criarOrdem: CriarOrdem
  onClose: () => void
  onSuccess: (msg: string) => void
  onError: (msg: string) => void
}

type TabOP = 'chaparia' | 'almoxarifado' | 'montagem'

export default function ModalSolicitarOP({ open, produtos, user, criarOrdem, onClose, onSuccess, onError }: Props) {
  const [tab, setTab]               = useState<TabOP>('chaparia')
  const [produtoId, setProdutoId]   = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [petg, setPetg]             = useState(false)
  const [petgQtd, setPetgQtd]       = useState('')
  const [obs, setObs]               = useState('')
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [loading, setLoading]       = useState(false)
  const [linha, setLinha]           = useState<'Linha 1' | 'Linha 2' | ''>('')

  useEffect(() => {
    if (open) {
      setProdutoId(''); setQuantidade(''); setPetg(false); setPetgQtd(''); setObs(''); setErrors({}); setLinha('')
    }
  }, [open, tab])

  useEffect(() => {
    if (open) {
      setProdutoId(''); setQuantidade(''); setPetg(false); setPetgQtd(''); setObs(''); setErrors({}); setLinha('')
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const produto = produtos.find(p => p.id === produtoId)

  async function handleLancar() {
    const errs: Record<string, string> = {}
    if (!produtoId) errs.produto = 'Selecione um produto'
    const qtd = Number(quantidade)
    if (!quantidade || qtd <= 0) errs.quantidade = 'Informe uma quantidade válida'
    if (tab === 'chaparia' && petg) {
      const pqtd = Number(petgQtd)
      if (!petgQtd || pqtd <= 0) errs.petgQtd = 'Informe a quantidade de PETG'
    }
    if (tab === 'montagem' && !linha) errs.linha = 'Selecione a linha de produção'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const res = await criarOrdem({
      tipo: tab,
      produtoId,
      produtoNome: produto?.nome ?? '',
      quantidade: qtd,
      petgQuantidade: tab === 'chaparia' && petg ? Number(petgQtd) : undefined,
      obs: obs.trim(),
      criadoPor: user.username,
      usuarioDestino: tab === 'chaparia' ? 'CHAPARIA' : tab === 'almoxarifado' ? 'ALMOXARIFADO' : 'MONTAGEM',
      linha: tab === 'montagem' ? linha : undefined,
    })
    setLoading(false)

    if (!res.ok) { onError(res.error || 'Erro ao criar ordem.'); return }
    onSuccess(`Ordem de produção lançada para ${tab === 'chaparia' ? 'CHAPARIA' : tab === 'almoxarifado' ? 'ALMOXARIFADO' : 'MONTAGEM'}!`)
    onClose()
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box-scroll animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 bg-indigo-50 border-b border-indigo-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Solicitar Ordem de Produção</h3>
              <p className="text-xs text-gray-500">Enviar para equipe de produção</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="flex border-b border-gray-200 sticky top-[73px] bg-white z-10">
          {(['chaparia', 'almoxarifado', 'montagem'] as TabOP[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'chaparia' ? 'Chaparia' : t === 'almoxarifado' ? 'Almoxarifado' : 'Montagem'}
            </button>
          ))}
        </div>

        <div className="px-6 py-5 space-y-4">
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

          <div>
            <label className="field-label">Quantidade *</label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={e => setQuantidade(e.target.value)}
              placeholder="Quantidade"
              className={`form-field ${errors.quantidade ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            />
            {errors.quantidade && <p className="field-error">{errors.quantidade}</p>}
          </div>

          {tab === 'chaparia' && (
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={petg}
                  onChange={e => { setPetg(e.target.checked); if (!e.target.checked) setPetgQtd('') }}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-semibold text-gray-700">Inclui PETG</span>
              </label>
              {petg && (
                <div>
                  <label className="field-label">Quantidade de PETG *</label>
                  <input
                    type="number"
                    min="1"
                    value={petgQtd}
                    onChange={e => setPetgQtd(e.target.value)}
                    placeholder="Quantidade de PETG"
                    className={`form-field ${errors.petgQtd ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                  />
                  {errors.petgQtd && <p className="field-error">{errors.petgQtd}</p>}
                </div>
              )}
            </div>
          )}

          {tab === 'montagem' && (
            <div>
              <label className="field-label">Linha de Produção *</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Linha 1', 'Linha 2'] as const).map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => { setLinha(l); setErrors(e => ({ ...e, linha: '' })) }}
                    className={`py-3 text-sm font-bold rounded-xl border-2 transition-all ${
                      linha === l
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-teal-300'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {errors.linha && <p className="field-error">{errors.linha}</p>}
            </div>
          )}

          <div>
            <label className="field-label">Observação <span className="text-gray-400 font-normal">(opcional)</span></label>
            <textarea
              value={obs}
              onChange={e => setObs(e.target.value)}
              placeholder="Instruções adicionais..."
              rows={3}
              className="form-field resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-cancel">Cancelar</button>
          <button
            onClick={handleLancar}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
            {loading ? 'Lançando...' : 'Lançar Ordem'}
          </button>
        </div>
      </div>
    </div>
  )
}
