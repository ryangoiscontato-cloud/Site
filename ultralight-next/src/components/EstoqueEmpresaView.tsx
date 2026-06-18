'use client'

import { useState, useMemo } from 'react'
import type { Produto, Empresa, Usuario } from '@/lib/types'
import { useInventory } from '@/hooks/useInventory'
import { useToast } from '@/hooks/useToast'

import Toast        from './Toast'
import SaldoEstoque  from './tabs/SaldoEstoque'
import Produtos      from './tabs/Produtos'
import Historico      from './tabs/Historico'

import ModalEntrada     from './modals/ModalEntrada'
import ModalSaida       from './modals/ModalSaida'
import ModalProduto     from './modals/ModalProduto'
import ModalConfirm     from './modals/ModalConfirm'
import ModalAjusteSaldo from './modals/ModalAjusteSaldo'

type LocalTabId = 'saldo' | 'produtos' | 'historico'

interface Props {
  empresa: Empresa
  user: Usuario
  onBack: () => void
}

export default function EstoqueEmpresaView({ empresa, user, onBack }: Props) {
  const inv = useInventory(user, empresa)
  const { toasts, toast, dismiss } = useToast()

  const [tab, setTab] = useState<LocalTabId>('saldo')

  const [modalEntrada, setModalEntrada] = useState(false)
  const [modalSaida,   setModalSaida]   = useState(false)

  const [modalProduto, setModalProduto] = useState(false)
  const [produtoEdit,  setProdutoEdit]  = useState<Produto | null>(null)

  const [modalExcluir,   setModalExcluir]   = useState(false)
  const [produtoExcluir, setProdutoExcluir] = useState<Produto | null>(null)

  const [modalAjuste,   setModalAjuste]   = useState(false)
  const [produtoAjuste, setProdutoAjuste] = useState<Produto | null>(null)

  const codigosExistentes = inv.produtos.map(p => p.codigo)
  const categorias = useMemo(
    () => [...new Set(inv.produtos.map(p => p.categoria).filter(Boolean))] as string[],
    [inv.produtos]
  )

  function handleEntrada() {
    if (inv.produtos.length === 0) { toast('Cadastre ao menos um produto primeiro!', 'warning'); return }
    setModalEntrada(true)
  }

  function handleSaida() {
    if (inv.produtos.length === 0) { toast('Cadastre ao menos um produto primeiro!', 'warning'); return }
    setModalSaida(true)
  }

  async function handleConfirmarEntrada(produtoId: string, qtd: number, obs: string) {
    const p = inv.produtos.find(x => x.id === produtoId)!
    const res = await inv.registrarEntrada(produtoId, qtd, obs)
    if (!res.ok) { toast(res.error || 'Erro ao registrar entrada.', 'error'); return }
    setModalEntrada(false)
    toast(`Entrada de ${qtd} ${p.unidade} de "${p.nome}" registrada!`, 'success')
  }

  async function handleConfirmarSaida(produtoId: string, qtd: number, obs: string, responsavel: string, empresaDestino: string) {
    const p = inv.produtos.find(x => x.id === produtoId)!
    const res = await inv.registrarSaida(produtoId, qtd, obs, responsavel, empresaDestino)
    if (!res.ok) { toast(res.error || 'Erro ao registrar saída.', 'error'); return }
    setModalSaida(false)
    toast(`Saída de ${qtd} ${p.unidade} de "${p.nome}" registrada!`, 'success')
  }

  async function handleSalvarProduto(dados: Omit<Produto, 'id'>, editId?: string) {
    if (editId) {
      const res = await inv.atualizarProduto(editId, dados)
      if (!res.ok) { toast(res.error || 'Erro ao atualizar produto.', 'error'); return }
      toast(`Produto "${dados.nome}" atualizado!`, 'success')
    } else {
      const res = await inv.adicionarProduto(dados)
      if (!res.ok) { toast(res.error || 'Erro ao cadastrar produto.', 'error'); return }
      toast(`Produto "${dados.nome}" cadastrado!`, 'success')
    }
    setModalProduto(false)
    setProdutoEdit(null)
  }

  async function handleExcluirConfirm() {
    if (!produtoExcluir) return
    const res = await inv.excluirProduto(produtoExcluir.id)
    if (!res.ok) { toast(res.error || 'Erro ao excluir produto.', 'error'); return }
    toast(`Produto "${produtoExcluir.nome}" excluído!`, 'warning')
    setModalExcluir(false)
    setProdutoExcluir(null)
  }

  async function handleConfirmarAjuste(produtoId: string, novoSaldo: number, obs: string) {
    const res = await inv.ajustarSaldo(produtoId, novoSaldo, obs)
    if (!res.ok) { toast(res.error || 'Erro ao ajustar saldo.', 'error'); return }
    toast('Saldo atualizado!', 'success')
    setModalAjuste(false)
    setProdutoAjuste(null)
  }

  if (!inv.hydrated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  const tabs: { id: LocalTabId; label: string }[] = [
    { id: 'saldo',     label: 'Saldo' },
    { id: 'produtos',  label: 'Produtos' },
    { id: 'historico', label: 'Histórico' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-blue-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
              </svg>
              Voltar
            </button>
            <span className="text-gray-300">|</span>
            <h1 className="text-base sm:text-lg font-bold text-[#0f2d5e] tracking-tight">Estoque &middot; {empresa}</h1>
          </div>
          <span className="hidden sm:block text-sm font-semibold text-gray-700">{user.username}</span>
        </div>
      </header>

      {/* Breadcrumb / action bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <nav className="inline-flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto max-w-full">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  tab === t.id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {(tab === 'saldo' || tab === 'historico') && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleEntrada}
                className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
                Entrada
              </button>
              <button
                onClick={handleSaida}
                className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
                Saída
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Offline banner */}
      {!inv.isOnline && (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {inv.pendingSync > 0
            ? `Sem internet · ${inv.pendingSync} operação(ões) aguardando sincronização`
            : 'Sem internet · exibindo dados em cache'}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7 pb-10 lg:pb-12">
        {inv.error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{inv.error}</div>
        )}

        {tab === 'saldo' && (
          <SaldoEstoque
            produtos={inv.produtos}
            titulo={`Saldo de Estoque ${empresa}`}
            onAjustar={p => { setProdutoAjuste(p); setModalAjuste(true) }}
          />
        )}
        {tab === 'produtos' && (
          <Produtos
            produtos={inv.produtos}
            onNovo={() => { setProdutoEdit(null); setModalProduto(true) }}
            onEditar={p => { setProdutoEdit(p); setModalProduto(true) }}
            onExcluir={p => { setProdutoExcluir(p); setModalExcluir(true) }}
          />
        )}
        {tab === 'historico' && <Historico historico={inv.historico} />}
      </main>

      <ModalEntrada
        open={modalEntrada}
        produtos={inv.produtos}
        onClose={() => setModalEntrada(false)}
        onConfirm={handleConfirmarEntrada}
      />
      <ModalSaida
        open={modalSaida}
        produtos={inv.produtos}
        requireDestino={false}
        onClose={() => setModalSaida(false)}
        onConfirm={handleConfirmarSaida}
      />
      <ModalProduto
        open={modalProduto}
        produto={produtoEdit}
        codigosExistentes={codigosExistentes}
        categorias={categorias}
        onClose={() => { setModalProduto(false); setProdutoEdit(null) }}
        onSalvar={handleSalvarProduto}
      />
      <ModalConfirm
        open={modalExcluir}
        title="Excluir Produto"
        message={produtoExcluir ? `Tem certeza que deseja excluir "${produtoExcluir.nome}"? O histórico de movimentos será mantido.` : ''}
        onClose={() => { setModalExcluir(false); setProdutoExcluir(null) }}
        onConfirm={handleExcluirConfirm}
      />
      <ModalAjusteSaldo
        open={modalAjuste}
        produto={produtoAjuste}
        onClose={() => { setModalAjuste(false); setProdutoAjuste(null) }}
        onConfirm={handleConfirmarAjuste}
      />

      <Toast toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
