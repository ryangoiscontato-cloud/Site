'use client'

import { useState } from 'react'
import type { Usuario, OrdemProducao } from '@/lib/types'
import { useOrdens } from '@/hooks/useOrdens'
import OrdensList from './worker/OrdensList'
import OrdemDetail from './worker/OrdemDetail'

interface Props {
  user: Usuario
  logout: () => void
}

type Screen = 'menu' | 'ordens' | 'historico'

export default function WorkerApp({ user, logout }: Props) {
  const [screen, setScreen]         = useState<Screen>('menu')
  const [selected, setSelected]     = useState<OrdemProducao | null>(null)
  const { ordens, iniciarOrdem, concluirOrdem } = useOrdens()

  const dest = user.username.toUpperCase()
  const minhas = ordens.filter(o => o.usuarioDestino === dest)
  const pendentes = minhas.filter(o => o.status !== 'concluida').length

  if (selected) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Ultralight" width={36} height={36} className="rounded-xl object-cover w-9 h-9" />
              <span className="font-extrabold text-[#0f2d5e] text-lg tracking-tight">ULTRALIGHT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">{user.username}</span>
              <button onClick={logout} className="text-xs text-red-600 font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                Sair
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          <OrdemDetail
            ordem={selected}
            onBack={() => setSelected(null)}
            onIniciar={iniciarOrdem}
            onConcluir={concluirOrdem}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Ultralight" width={36} height={36} className="rounded-xl object-cover w-9 h-9" />
            <span className="font-extrabold text-[#0f2d5e] text-lg tracking-tight">ULTRALIGHT</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">{user.username}</span>
            <button onClick={logout} className="text-xs text-red-600 font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {screen === 'menu' && (
          <div>
            <div className="text-center mb-10">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mb-1">Bem-vindo,</p>
              <h1 className="text-3xl font-extrabold text-[#0f2d5e]">{user.username}</h1>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setScreen('ordens')}
                className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left active:scale-[0.98]"
              >
                {pendentes > 0 && (
                  <span className="absolute top-4 right-4 min-w-[1.75rem] h-7 flex items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold px-2">
                    {pendentes}
                  </span>
                )}
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Ordens de Produção</h2>
                <p className="text-sm text-gray-500 mt-1">Ver e gerenciar ordens pendentes</p>
              </button>

              <button
                onClick={() => setScreen('historico')}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Histórico de Produção</h2>
                <p className="text-sm text-gray-500 mt-1">Ver ordens concluídas anteriormente</p>
              </button>
            </div>
          </div>
        )}

        {screen === 'ordens' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setScreen('menu')} className="text-blue-700 hover:text-blue-900">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Ordens de Produção</h1>
            </div>
            <OrdensList
              ordens={minhas.filter(o => o.status !== 'concluida')}
              user={user}
              onSelect={setSelected}
            />
          </div>
        )}

        {screen === 'historico' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setScreen('menu')} className="text-blue-700 hover:text-blue-900">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Histórico de Produção</h1>
            </div>
            <OrdensList
              ordens={minhas.filter(o => o.status === 'concluida')}
              user={user}
              onSelect={setSelected}
            />
          </div>
        )}
      </main>
    </div>
  )
}
