'use client'

import { useState, useEffect } from 'react'
import type { Usuario, OrdemProducao } from '@/lib/types'
import OrdensList from './worker/OrdensList'
import OrdemDetail from './worker/OrdemDetail'

const NAV_KEY = 'ul_worker_nav_state'

function loadNavState(): { screen: Screen; selectedId: string | null } {
  const fallback: { screen: Screen; selectedId: string | null } = { screen: 'menu', selectedId: null }
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(NAV_KEY)
    if (raw) return { ...fallback, ...JSON.parse(raw) }
  } catch {}
  return fallback
}

interface Props {
  user: Usuario
  logout: () => void
  ordens: OrdemProducao[]
  iniciarOrdem:  (id: string) => Promise<{ ok: boolean; error?: string }>
  concluirOrdem: (id: string) => Promise<{ ok: boolean; error?: string }>
  pausarOrdem:   (id: string, motivo: string) => Promise<{ ok: boolean; error?: string }>
  retomarOrdem:  (id: string) => Promise<{ ok: boolean; error?: string }>
}

type Screen = 'menu' | 'ordens' | 'historico'

export default function WorkerApp({ user, logout, ordens, iniciarOrdem, concluirOrdem, pausarOrdem, retomarOrdem }: Props) {
  const [screen, setScreen]         = useState<Screen>(() => loadNavState().screen)
  const [selectedId, setSelectedId] = useState<string | null>(() => loadNavState().selectedId)

  useEffect(() => {
    try { localStorage.setItem(NAV_KEY, JSON.stringify({ screen, selectedId })) } catch {}
  }, [screen, selectedId])

  function handleLogout() {
    try { localStorage.removeItem(NAV_KEY) } catch {}
    logout()
  }

  const isAlmox    = user.role === 'almoxarifado'
  const isMontagem = user.role === 'montagem'
  const dest     = user.username.toUpperCase()
  const minhas   = ordens.filter(o => o.usuarioDestino === dest)
  const selected = selectedId ? ordens.find(o => o.id === selectedId) ?? null : null
  const pendentes = minhas.filter(o => o.status !== 'concluida').length

  const ordensLabel    = isAlmox ? 'Ordens de Separação' : 'Ordens de Produção'
  const historicoLabel = isAlmox ? 'Histórico de Separação' : 'Histórico de Produção'

  const WorkerHeader = () => (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Ultralight" width={36} height={36} className="rounded-xl object-contain w-9 h-9" />
          <span className="font-extrabold text-[#0f2d5e] text-lg tracking-tight">ULTRALIGHT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{user.username}</span>
          <button onClick={handleLogout} className="text-xs text-red-600 font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
            Sair
          </button>
        </div>
      </div>
    </header>
  )

  if (selected) {
    return (
      <div className="min-h-screen bg-gray-100">
        <WorkerHeader />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <OrdemDetail
            ordem={selected}
            onBack={() => setSelectedId(null)}
            onIniciar={iniciarOrdem}
            onConcluir={concluirOrdem}
            onPausar={pausarOrdem}
            onRetomar={retomarOrdem}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <WorkerHeader />

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
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isAlmox ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{ordensLabel}</h2>
                <p className="text-sm text-gray-500 mt-1">Ver e gerenciar ordens pendentes</p>
              </button>

              <button
                onClick={() => setScreen('historico')}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-green-200 transition-all text-left active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{historicoLabel}</h2>
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
              <h1 className="text-xl font-bold text-gray-900">{ordensLabel}</h1>
            </div>
            <OrdensList
              ordens={minhas.filter(o => o.status !== 'concluida')}
              user={user}
              onSelect={o => setSelectedId(o.id)}
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
              <h1 className="text-xl font-bold text-gray-900">{historicoLabel}</h1>
            </div>
            <OrdensList
              ordens={minhas.filter(o => o.status === 'concluida')}
              user={user}
              onSelect={o => setSelectedId(o.id)}
            />
          </div>
        )}
      </main>
    </div>
  )
}
