'use client'

import { useState } from 'react'
import type { Produto, Usuario } from '@/lib/types'
import ModalEntrada from './modals/ModalEntrada'
import ModalSaida   from './modals/ModalSaida'
import Toast        from './Toast'
import { useToast } from '@/hooks/useToast'

interface Props {
  user: Usuario
  logout: () => void
  produtos: Produto[]
  registrarEntrada: (produtoId: string, qtd: number, obs: string) => void
  registrarSaida:   (produtoId: string, qtd: number, obs: string, responsavel?: string, empresaDestino?: string) => void
}

export default function ExpedicaoApp({ user, logout, produtos, registrarEntrada, registrarSaida }: Props) {
  const { toasts, toast, dismiss } = useToast()
  const [modalEntrada, setModalEntrada] = useState(false)
  const [modalSaida,   setModalSaida]   = useState(false)

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
    toast(`Saída de ${qtd} ${p.unidade} de "${p.nome}" registrada!`, 'success')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Ultralight" width={40} height={40} className="rounded-xl object-contain w-10 h-10" />
            <div>
              <span className="block font-extrabold text-[#0f2d5e] text-lg tracking-tight leading-none">ULTRALIGHT</span>
              <span className="block text-[0.6rem] text-gray-400 uppercase tracking-[0.12em] mt-0.5">Gestão de Produção</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">{user.username}</span>
            <button
              onClick={logout}
              className="text-xs text-red-600 font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mb-1">Bem-vindo,</p>
          <h1 className="text-3xl font-extrabold text-[#0f2d5e]">{user.username}</h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              if (produtos.length === 0) { toast('Nenhum produto cadastrado.', 'warning'); return }
              setModalEntrada(true)
            }}
            className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-green-200 transition-all text-left active:scale-[0.98] flex flex-col items-center gap-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">Entrada</h2>
              <p className="text-xs text-gray-500 mt-0.5">Adicionar ao estoque</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (produtos.length === 0) { toast('Nenhum produto cadastrado.', 'warning'); return }
              setModalSaida(true)
            }}
            className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-red-200 transition-all text-left active:scale-[0.98] flex flex-col items-center gap-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">Saída</h2>
              <p className="text-xs text-gray-500 mt-0.5">Retirar do estoque</p>
            </div>
          </button>
        </div>
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
      <Toast toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
