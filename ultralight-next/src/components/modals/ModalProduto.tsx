'use client'

import { useState, useEffect, useRef } from 'react'
import type { Produto } from '@/lib/types'

interface Props {
  open: boolean
  produto: Produto | null
  codigosExistentes: string[]
  categorias: string[]
  onClose: () => void
  onSalvar: (dados: Omit<Produto, 'id'>, editId?: string) => void
}

const UNIDADES = ['un', 'kg', 'g', 'l', 'ml', 'm', 'm²', 'cx', 'pct', 'par']

export default function ModalProduto({ open, produto, codigosExistentes, categorias, onClose, onSalvar }: Props) {
  const [codigo,        setCodigo]        = useState('')
  const [nome,          setNome]          = useState('')
  const [categoria,     setCategoria]     = useState('')
  const [unidade,       setUnidade]       = useState('un')
  const [estoqueMin,    setEstoqueMin]    = useState('0')
  const [saldoIni,      setSaldoIni]      = useState('0')
  const [codigoBarras,  setCodigoBarras]  = useState('')
  const [novaCategoria, setNovaCategoria] = useState(false)
  const [errors,        setErrors]        = useState<Record<string, string>>({})
  const codigoBarrasRef = useRef(codigoBarras)

  const isEdit = !!produto

  useEffect(() => { codigoBarrasRef.current = codigoBarras }, [codigoBarras])

  useEffect(() => {
    if (!open) return
    setErrors({})
    if (produto) {
      setCodigo(produto.codigo); setNome(produto.nome); setCategoria(produto.categoria || '')
      setUnidade(produto.unidade); setEstoqueMin(String(produto.estoqueMin)); setSaldoIni(String(produto.saldo))
      setCodigoBarras(produto.codigoBarras || '')
      // auto-switch to text input if category doesn't exist in the list
      if (produto.categoria && !categorias.includes(produto.categoria)) {
        setNovaCategoria(true)
      } else {
        setNovaCategoria(false)
      }
    } else {
      setCodigo(''); setNome(''); setCategoria(''); setUnidade('un'); setEstoqueMin('0'); setSaldoIni('0')
      setCodigoBarras(''); setNovaCategoria(false)
    }
  }, [open, produto, categorias])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // HID barcode scanner: detects fast keystroke sequences (< 80ms gap) as scanner input
  useEffect(() => {
    if (!open) return
    let buf = ''
    let lastTime = 0
    function onKey(e: KeyboardEvent) {
      const now = Date.now()
      if (e.key === 'Enter') {
        if (buf.length >= 3) setCodigoBarras(buf.trim())
        buf = ''; lastTime = 0; return
      }
      if (e.key.length !== 1) return
      if (lastTime > 0 && now - lastTime > 80) buf = ''
      buf += e.key; lastTime = now
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function handleSalvar() {
    const errs: Record<string, string> = {}
    if (!codigo.trim()) errs.codigo = 'Código obrigatório'
    else if (codigosExistentes.includes(codigo.trim()) && (!isEdit || codigo.trim() !== produto?.codigo))
      errs.codigo = 'Código já existe'
    if (!nome.trim()) errs.nome = 'Nome obrigatório'
    if (Object.keys(errs).length) { setErrors(errs); return }

    onSalvar(
      { codigo: codigo.trim(), nome: nome.trim(), categoria: categoria.trim(), unidade, estoqueMin: Number(estoqueMin) || 0, saldo: Number(saldoIni) || 0, codigoBarras: codigoBarras.trim() },
      produto?.id
    )
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box-scroll animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 bg-blue-50 border-b border-blue-100 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{isEdit ? 'Editar Produto' : 'Novo Produto'}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Preencha as informações do produto</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Código *</label>
              <input type="text" value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ex: PRD-001"
                className={`form-field ${errors.codigo ? 'border-red-400 ring-2 ring-red-100' : ''}`} />
              {errors.codigo && <p className="field-error">{errors.codigo}</p>}
            </div>
            <div>
              <label className="field-label">Unidade *</label>
              <select value={unidade} onChange={e => setUnidade(e.target.value)} className="form-field">
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Nome do Produto *</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Digite o nome do produto"
              className={`form-field ${errors.nome ? 'border-red-400 ring-2 ring-red-100' : ''}`} />
            {errors.nome && <p className="field-error">{errors.nome}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="field-label mb-0">Código de Barras <span className="text-gray-400 font-normal">(opcional)</span></label>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                Scanner ativo
              </span>
            </div>
            <input
              type="text"
              value={codigoBarras}
              onChange={e => setCodigoBarras(e.target.value)}
              placeholder="Escaneie ou digite o código"
              className="form-field"
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="field-label mb-0">Categoria</label>
                {novaCategoria && (
                  <button
                    type="button"
                    onClick={() => { setNovaCategoria(false); setCategoria('') }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ← Voltar
                  </button>
                )}
              </div>
              {novaCategoria ? (
                <input
                  type="text"
                  value={categoria}
                  onChange={e => setCategoria(e.target.value)}
                  placeholder="Ex: Eletrônicos, Ferramentas..."
                  className="form-field"
                  autoFocus
                />
              ) : (
                <select
                  value={categoria}
                  onChange={e => {
                    if (e.target.value === '__nova__') {
                      setNovaCategoria(true)
                      setCategoria('')
                    } else {
                      setCategoria(e.target.value)
                    }
                  }}
                  className="form-field"
                >
                  <option value="">Sem categoria</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__nova__">+ Nova categoria...</option>
                </select>
              )}
            </div>
            <div>
              <label className="field-label">Estoque Mínimo</label>
              <input type="number" min="0" value={estoqueMin} onChange={e => setEstoqueMin(e.target.value)} className="form-field" />
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="field-label">Saldo Inicial</label>
              <input type="number" min="0" value={saldoIni} onChange={e => setSaldoIni(e.target.value)} className="form-field" />
              <p className="text-xs text-gray-400 mt-1">Quantidade já em estoque ao cadastrar</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
          <button onClick={onClose} className="btn-cancel">Cancelar</button>
          <button onClick={handleSalvar} className="inline-flex items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Salvar Produto
          </button>
        </div>
      </div>
    </div>
  )
}
