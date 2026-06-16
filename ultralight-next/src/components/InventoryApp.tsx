'use client'

import { useState } from 'react'
import type { Produto, TabId } from '@/lib/types'
import { useInventory } from '@/hooks/useInventory'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useOrdens } from '@/hooks/useOrdens'
import { isConfigured } from '@/lib/supabase'

import Header       from './Header'
import NavTabs      from './NavTabs'
import Toast        from './Toast'
import LoginScreen  from './LoginScreen'
import Dashboard    from './tabs/Dashboard'
import SaldoEstoque from './tabs/SaldoEstoque'
import Produtos     from './tabs/Produtos'
import Historico    from './tabs/Historico'
import Producao     from './tabs/Producao'
import WorkerApp    from './WorkerApp'
import ExpedicaoApp from './ExpedicaoApp'

import ModalEntrada     from './modals/ModalEntrada'
import ModalSaida       from './modals/ModalSaida'
import ModalProduto     from './modals/ModalProduto'
import ModalConfirm     from './modals/ModalConfirm'
import ModalNovoUsuario from './modals/ModalNovoUsuario'
import ModalSolicitarOP from './modals/ModalSolicitarOP'

export default function InventoryApp() {
  const { user, loading: authLoading, login, logout, criarUsuario, alterarUsuario, excluirUsuario, usuarios } = useAuth()
  const {
    produtos, historico, hydrated, error, isOnline, pendingSync,
    registrarEntrada, registrarSaida, adicionarProduto, atualizarProduto, excluirProduto,
  } = useInventory(user)
  const { ordens, criarOrdem, iniciarOrdem, concluirOrdem, pausarOrdem, retomarOrdem, cancelarOrdem } = useOrdens()
  const { toasts, toast, dismiss } = useToast()

  const [tab, setTab]           = useState<TabId>('dashboard')
  const [showHome, setShowHome] = useState(true)

  const [modalEntrada,   setModalEntrada]   = useState(false)
  const [modalSaida,     setModalSaida]     = useState(false)
  const [modalProduto,   setModalProduto]   = useState(false)
  const [produtoEdit,    setProdutoEdit]    = useState<Produto | null>(null)
  const [modalExcluir,   setModalExcluir]   = useState(false)
  const [produtoExcluir, setProdutoExcluir] = useState<Produto | null>(null)
  const [modalUsuario,   setModalUsuario]   = useState(false)
  const [modalOP,        setModalOP]        = useState(false)

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

  function handleConfirmarSaida(produtoId: string, qtd: number, obs: string, responsavel: string, empresaDestino: string) {
    const p = produtos.find(x => x.id === produtoId)!
    registrarSaida(produtoId, qtd, obs, responsavel, empresaDestino)
    setModalSaida(false)
    toast(`Transferência de ${qtd} ${p.unidade} de "${p.nome}" para ${empresaDestino} registrada!`, 'success')
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

  const codigosExistentes = produtos.map(p => p.codigo)

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <svg className="w-7 h-7" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Configure o Supabase</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Crie um arquivo <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env.local</code> e rode o script{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">SUPABASE_SETUP.sql</code>.
          </p>
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginScreen onLogin={login} />

  if (user.role === 'chaparia' || user.role === 'almoxarifado' || user.role === 'montagem' || user.role === 'user') {
    return (
      <WorkerApp
        user={user} logout={logout}
        ordens={ordens}
        iniciarOrdem={iniciarOrdem} concluirOrdem={concluirOrdem}
        pausarOrdem={pausarOrdem}   retomarOrdem={retomarOrdem}
      />
    )
  }

  if (user.role === 'expedicao') {
    return (
      <ExpedicaoApp
        user={user} logout={logout}
        produtos={produtos}
        registrarEntrada={registrarEntrada}
        registrarSaida={registrarSaida}
      />
    )
  }

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

  function goTo(t: TabId) { setTab(t); setShowHome(false) }

  const tabLabel = tab === 'saldo'    ? 'Saldo em Estoque'
    : tab === 'produtos'  ? 'Produtos'
    : tab === 'historico' ? 'Histórico'
    : tab === 'producao'  ? 'Produção'
    : 'Dashboard'

  const OfflineBanner = () => !isOnline ? (
    <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2">
      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
      </svg>
      {pendingSync > 0
        ? `Sem internet · ${pendingSync} operação(ões) aguardando sincronização`
        : 'Sem internet · exibindo dados em cache'}
    </div>
  ) : null

  // ── Home screen ──────────────────────────────────────────────────────────────
  if (showHome) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Ultralight" width={40} height={40} className="bg-white rounded-xl object-contain w-10 h-10 p-0.5" />
              <div>
                <span className="block font-extrabold text-[#0f2d5e] text-lg tracking-tight leading-none">ULTRALIGHT</span>
                <span className="block text-[0.6rem] text-gray-400 uppercase tracking-widest mt-0.5">GE</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-sm font-semibold text-gray-700">{user.username}</span>
              {user.role === 'admin' && (
                <button
                  onClick={() => setModalUsuario(true)}
                  className="text-xs text-gray-600 font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Usuários
                </button>
              )}
              <button
                onClick={logout}
                className="text-xs text-red-600 font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <OfflineBanner />

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mb-1">Bem-vindo,</p>
            <h1 className="text-3xl font-extrabold text-[#0f2d5e]">{user.username}</h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {([
              { tab: 'saldo' as TabId, label: 'Saldo em Estoque', sub: 'Ver todos os produtos', color: 'bg-blue-100 text-blue-600', icon: (
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/></svg>
              )},
              { tab: 'produtos' as TabId, label: 'Produtos', sub: 'Gerenciar cadastro', color: 'bg-indigo-100 text-indigo-600', icon: (
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              )},
              { tab: 'historico' as TabId, label: 'Histórico', sub: 'Movimentações', color: 'bg-green-100 text-green-600', icon: (
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              )},
              { tab: 'producao' as TabId, label: 'Produção', sub: 'Ordens de produção', color: 'bg-orange-100 text-orange-600', icon: (
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              )},
            ] as const).map(({ tab: t, label, sub, color, icon }) => (
              <button
                key={t}
                onClick={() => goTo(t)}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left active:scale-[0.98]"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${color}`}>{icon}</div>
                <h2 className="text-base font-bold text-gray-900">{label}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </button>
            ))}
          </div>

          {user.role === 'admin' && (
            <div className="mt-6">
              <button
                onClick={() => setModalOP(true)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
                Solicitar Ordem de Produção
              </button>
            </div>
          )}
        </main>

        <ModalNovoUsuario
          open={modalUsuario}
          usuarios={usuarios}
          currentUserId={user?.id}
          onClose={() => setModalUsuario(false)}
          onCriar={criarUsuario}
          onAlterar={alterarUsuario}
          onExcluir={excluirUsuario}
        />
        {user && (
          <ModalSolicitarOP
            open={modalOP}
            produtos={produtos}
            user={user}
            criarOrdem={criarOrdem}
            onClose={() => setModalOP(false)}
            onSuccess={msg => toast(msg, 'success')}
            onError={msg => toast(msg, 'error')}
          />
        )}
        <Toast toasts={toasts} dismiss={dismiss} />
      </div>
    )
  }

  // ── Tab view ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        user={user}
        onGerenciarUsuarios={() => setModalUsuario(true)}
        onSolicitarOP={() => setModalOP(true)}
        onLogout={logout}
        onHome={user.role === 'admin' ? () => setShowHome(true) : undefined}
      />

      {user.role !== 'admin' && (
        <NavTabs active={tab} onChange={t => setTab(t)} userRole={user.role} />
      )}

      {user.role === 'admin' && (
        <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHome(true)}
              className="flex items-center gap-1.5 text-sm text-blue-700 font-semibold"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              Início
            </button>
            <span className="text-gray-300">›</span>
            <span className="text-sm text-gray-500 font-medium">{tabLabel}</span>
          </div>
          {(tab === 'saldo' || tab === 'historico') && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleEntrada}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
                Entrada
              </button>
              <button
                onClick={handleSaida}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
                Saída
              </button>
            </div>
          )}
        </div>
      )}

      <OfflineBanner />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7 pb-10 lg:pb-12">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
        )}
        {tab === 'dashboard' && (
          <Dashboard produtos={produtos} historico={historico} onTabChange={setTab} />
        )}
        {tab === 'saldo'    && <SaldoEstoque produtos={produtos} />}
        {tab === 'produtos' && (
          <Produtos
            produtos={produtos}
            onNovo={() => { setProdutoEdit(null); setModalProduto(true) }}
            onEditar={p => { setProdutoEdit(p); setModalProduto(true) }}
            onExcluir={p => { setProdutoExcluir(p); setModalExcluir(true) }}
          />
        )}
        {tab === 'historico' && <Historico historico={historico} />}
        {tab === 'producao'  && <Producao ordens={ordens} cancelarOrdem={cancelarOrdem} />}
      </main>

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
      <ModalNovoUsuario
        open={modalUsuario}
        usuarios={usuarios}
        currentUserId={user?.id}
        onClose={() => setModalUsuario(false)}
        onCriar={criarUsuario}
        onAlterar={alterarUsuario}
        onExcluir={excluirUsuario}
      />
      {user && (
        <ModalSolicitarOP
          open={modalOP}
          produtos={produtos}
          user={user}
          criarOrdem={criarOrdem}
          onClose={() => setModalOP(false)}
          onSuccess={msg => toast(msg, 'success')}
          onError={msg => toast(msg, 'error')}
        />
      )}

      <Toast toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
