'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
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

import ModalEntrada     from './modals/ModalEntrada'
import ModalSaida       from './modals/ModalSaida'
import ModalProduto     from './modals/ModalProduto'
import ModalConfirm     from './modals/ModalConfirm'
import ModalScanChoice  from './modals/ModalScanChoice'
import ModalNovoUsuario from './modals/ModalNovoUsuario'
import ModalSolicitarOP from './modals/ModalSolicitarOP'

const BarcodeScanner = dynamic(() => import('./BarcodeScanner'), { ssr: false })

export default function InventoryApp() {
  const { user, loading: authLoading, login, logout, criarUsuario, usuarios } = useAuth()
  const {
    produtos, historico, hydrated, error,
    registrarEntrada, registrarSaida, adicionarProduto, atualizarProduto, excluirProduto,
  } = useInventory(user)
  const { ordens, criarOrdem, iniciarOrdem, concluirOrdem } = useOrdens()
  const { toasts, toast, dismiss } = useToast()

  const [tab, setTab] = useState<TabId>('dashboard')

  const [modalEntrada, setModalEntrada] = useState(false)
  const [modalSaida,   setModalSaida]   = useState(false)
  const [modalProduto, setModalProduto] = useState(false)
  const [produtoEdit,  setProdutoEdit]  = useState<Produto | null>(null)
  const [modalExcluir, setModalExcluir] = useState(false)
  const [produtoExcluir, setProdutoExcluir] = useState<Produto | null>(null)
  const [modalUsuario, setModalUsuario] = useState(false)
  const [modalOP,      setModalOP]      = useState(false)

  const [scanning,    setScanning]    = useState(false)
  const [scanProduto, setScanProduto] = useState<Produto | null>(null)
  const [presetProdutoId, setPresetProdutoId] = useState<string>('')

  function handleEntrada() {
    if (produtos.length === 0) { toast('Cadastre ao menos um produto primeiro!', 'warning'); return }
    setPresetProdutoId('')
    setModalEntrada(true)
  }

  function handleSaida() {
    if (produtos.length === 0) { toast('Cadastre ao menos um produto primeiro!', 'warning'); return }
    setPresetProdutoId('')
    setModalSaida(true)
  }

  function handleScanClick() {
    setScanning(true)
  }

  function handleScanned(code: string) {
    setScanning(false)
    const clean = code.trim()
    const found = produtos.find(p => (p.codigoBarras || '').trim() === clean)
    if (!found) {
      toast(`Produto não encontrado para o código "${clean}"`, 'error')
      return
    }
    setScanProduto(found)
  }

  function handleConfirmarEntrada(produtoId: string, qtd: number, obs: string) {
    const p = produtos.find(x => x.id === produtoId)!
    registrarEntrada(produtoId, qtd, obs)
    setModalEntrada(false)
    setPresetProdutoId('')
    toast(`Entrada de ${qtd} ${p.unidade} de "${p.nome}" registrada!`, 'success')
  }

  function handleConfirmarSaida(produtoId: string, qtd: number, obs: string, responsavel: string, empresaDestino: string) {
    const p = produtos.find(x => x.id === produtoId)!
    registrarSaida(produtoId, qtd, obs, responsavel, empresaDestino)
    setModalSaida(false)
    setPresetProdutoId('')
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
            As variáveis de ambiente <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_SUPABASE_URL</code> e{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> não foram encontradas.
            Crie um arquivo <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env.local</code> com base no{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env.local.example</code> e rode o script{' '}
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

  if (!user) {
    return <LoginScreen onLogin={login} />
  }

  if (user.role === 'chaparia' || user.role === 'almoxarifado') {
    return <WorkerApp user={user} logout={logout} ordens={ordens} iniciarOrdem={iniciarOrdem} concluirOrdem={concluirOrdem} />
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        user={user}
        onEntrada={handleEntrada}
        onSaida={handleSaida}
        onScan={handleScanClick}
        onGerenciarUsuarios={() => setModalUsuario(true)}
        onSolicitarOP={() => setModalOP(true)}
        onLogout={logout}
      />
      <NavTabs active={tab} onChange={setTab} userRole={user.role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7 pb-28 lg:pb-12">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
        )}
        {tab === 'dashboard' && (
          <Dashboard
            produtos={produtos}
            historico={historico}
            onTabChange={setTab}
          />
        )}
        {tab === 'saldo'     && <SaldoEstoque produtos={produtos} />}
        {tab === 'produtos'  && (
          <Produtos
            produtos={produtos}
            onNovo={() => { setProdutoEdit(null); setModalProduto(true) }}
            onEditar={p => { setProdutoEdit(p); setModalProduto(true) }}
            onExcluir={p => { setProdutoExcluir(p); setModalExcluir(true) }}
          />
        )}
        {tab === 'historico' && <Historico historico={historico} />}
        {tab === 'producao'  && <Producao ordens={ordens} />}
      </main>

      <ModalEntrada
        open={modalEntrada}
        produtos={produtos}
        presetProdutoId={presetProdutoId}
        onClose={() => { setModalEntrada(false); setPresetProdutoId('') }}
        onConfirm={handleConfirmarEntrada}
      />
      <ModalSaida
        open={modalSaida}
        produtos={produtos}
        presetProdutoId={presetProdutoId}
        onClose={() => { setModalSaida(false); setPresetProdutoId('') }}
        onConfirm={(produtoId, qtd, obs, responsavel, empresaDestino) => handleConfirmarSaida(produtoId, qtd, obs, responsavel, empresaDestino)}
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
        onClose={() => setModalUsuario(false)}
        onCriar={criarUsuario}
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

      {scanning && (
        <BarcodeScanner onScan={handleScanned} onClose={() => setScanning(false)} />
      )}
      {scanProduto && (
        <ModalScanChoice
          produto={scanProduto}
          onEntrada={() => { setPresetProdutoId(scanProduto.id); setScanProduto(null); setModalEntrada(true) }}
          onSaida={() => { setPresetProdutoId(scanProduto.id); setScanProduto(null); setModalSaida(true) }}
          onClose={() => setScanProduto(null)}
        />
      )}

      <Toast toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
