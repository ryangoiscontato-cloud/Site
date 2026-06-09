'use client'

import { useState } from 'react'
import type { Produto, TabId } from '@/lib/types'
import { useInventory } from '@/hooks/useInventory'
import { useToast } from '@/hooks/useToast'

import Header       from './Header'
import NavTabs      from './NavTabs'
import Toast        from './Toast'
import Dashboard    from './tabs/Dashboard'
import SaldoEstoque from './tabs/SaldoEstoque'
import Produtos     from './tabs/Produtos'
import Historico    from './tabs/Historico'

import ModalEntrada from './modals/ModalEntrada'
import ModalSaida   from './modals/ModalSaida'
import ModalProduto from './modals/ModalProduto'
import ModalConfirm from './modals/ModalConfirm'

export default function InventoryApp() {
  const { produtos, historico, hydrated, registrarEntrada, registrarSaida, adicionarProduto, atualizarProduto, excluirProduto, limparHistorico } = useInventory()
  const { toasts, toast, dismiss } = useToast()

  const [tab, setTab] = useState<TabId>('dashboard')

  // Modal states
  const [modalEntrada, setModalEntrada] = useState(false)
  const [modalSaida,   setModalSaida]   = useState(false)
  const [modalProduto, setModalProduto] = useState(false)
  const [produtoEdit,  setProdutoEdit]  = useState<Produto | null>(null)
  const [modalExcluir, setModalExcluir] = useState(false)
  const [produtoExcluir, setProdutoExcluir] = useState<Produto | null>(null)

  function handleEntrada() {
    if (produtos.length === 0) { toast('Cadastre ao menos um produto primeiro!', 'warning'); return }
    setModalEntrada(true)
  }

  function handleSaida() {
    if (produtos.length === 0) { toast('Cadastre ao menos um produto primeiro!', 'warning'); return }
    setModalSaida(true)
  }

  function handleConfirmarEntrada(produtoId: string, qtd: number, obs: string) {
    const p = produtos.find(x => x.id === produtoId)!
    registrarEntrada(produtoId, qtd, obs)
    setModalEntrada(false)
    toast(`Entrada de ${qtd} ${p.unidade} de "${p.nome}" registrada!`, 'success')
  }

  function handleConfirmarSaida(produtoId: string, qtd: number, obs: string) {
    const p = produtos.find(x => x.id === produtoId)!
    registrarSaida(produtoId, qtd, obs)
    setModalSaida(false)
    toast(`Saída de ${qtd} ${p.unidade} de "${p.nome}" registrada!`, 'success')
  }

  function handleSalvarProduto(dados: Omit<Produto, 'id'>, editId?: string) {
    if (editId) {
      atualizarProduto(editId, dados)
      toast(`Produto "${dados.nome}" atualizado!`, 'success')
    } else {
      adicionarProduto(dados)
      toast(`Produto "${dados.nome}" cadastrado!`, 'success')
    }
    setModalProduto(false)
    setProdutoEdit(null)
  }

  function handleExcluirConfirm() {
    if (!produtoExcluir) return
    excluirProduto(produtoExcluir.id)
    toast(`Produto "${produtoExcluir.nome}" excluído!`, 'warning')
    setModalExcluir(false)
    setProdutoExcluir(null)
  }

  function handleLimparHistorico() {
    limparHistorico()
    toast('Histórico limpo!', 'warning')
  }

  const codigosExistentes = produtos.map(p => p.codigo)

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onEntrada={handleEntrada} onSaida={handleSaida} />
      <NavTabs active={tab} onChange={setTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7 pb-24 md:pb-16">
        {tab === 'dashboard' && <Dashboard  produtos={produtos} historico={historico} />}
        {tab === 'saldo'     && <SaldoEstoque produtos={produtos} />}
        {tab === 'produtos'  && (
          <Produtos
            produtos={produtos}
            onNovo={() => { setProdutoEdit(null); setModalProduto(true) }}
            onEditar={p => { setProdutoEdit(p); setModalProduto(true) }}
            onExcluir={p => { setProdutoExcluir(p); setModalExcluir(true) }}
          />
        )}
        {tab === 'historico' && <Historico historico={historico} onLimpar={handleLimparHistorico} />}
      </main>

      {/* Modals */}
      <ModalEntrada
        open={modalEntrada}
        produtos={produtos}
        onClose={() => setModalEntrada(false)}
        onConfirm={handleConfirmarEntrada}
      />
      <ModalSaida
        open={modalSaida}
        produtos={produtos}
        onClose={() => setModalSaida(false)}
        onConfirm={handleConfirmarSaida}
      />
      <ModalProduto
        open={modalProduto}
        produto={produtoEdit}
        codigosExistentes={codigosExistentes}
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

      <Toast toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
