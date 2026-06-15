'use client'

import { useState, useEffect, useRef } from 'react'
import type { Usuario } from '@/lib/types'

interface HeaderProps {
  user: Usuario | null
  onEntrada: () => void
  onSaida: () => void
  onScan: () => void
  onGerenciarUsuarios: () => void
  onSolicitarOP: () => void
  onLogout: () => void
}

export default function Header({ user, onEntrada, onSaida, onScan, onGerenciarUsuarios, onSolicitarOP, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const roleLabel = () => {
    if (user?.role === 'admin') return 'Admin'
    if (user?.role === 'chaparia') return 'Chaparia'
    if (user?.role === 'almoxarifado') return 'Almoxarifado'
    return 'Funcionário'
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Ultralight"
            width={40}
            height={40}
            className="rounded-xl object-cover flex-shrink-0 w-10 h-10"
          />
          <div className="min-w-0">
            <span className="block text-lg sm:text-[1.35rem] font-extrabold text-[#0f2d5e] leading-none tracking-tight">
              ULTRALIGHT
            </span>
            <span className="block text-[0.62rem] sm:text-[0.68rem] text-gray-400 uppercase tracking-[0.18em] mt-0.5">
              Gestão de Estoque
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            onClick={onScan}
            title="Picking — escanear código de barras"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-[#0f2d5e] hover:bg-[#0c2349] active:bg-[#0a1d3d] text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" d="M6 5v14M10 5v14M14 5v14M18 5v14"/>
            </svg>
            <span className="hidden sm:inline">Picking</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={onSolicitarOP}
              title="Solicitar Ordem de Produção"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
              <span className="hidden sm:inline">Solicitar OP</span>
            </button>
          )}

          <button
            onClick={onEntrada}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Entrada</span>
          </button>

          <button
            onClick={onSaida}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Saída</span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-2 pl-2 pr-1 sm:pr-2 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              title={user?.username}
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0f2d5e] text-white text-sm font-bold flex-shrink-0">
                {user?.username?.charAt(0).toUpperCase() ?? '?'}
              </span>
              <span className="hidden md:flex flex-col items-start leading-none">
                <span className="text-sm font-semibold text-gray-800">{user?.username}</span>
                <span className="text-[0.62rem] text-gray-400 uppercase tracking-wide">{roleLabel()}</span>
              </span>
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 animate-slide-up">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-400">{user?.role === 'admin' ? 'Administrador' : 'Funcionário'}</p>
                </div>
                {user?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); onGerenciarUsuarios() }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 00-6 6h12a6 6 0 00-6-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
                      </svg>
                      Gerenciar usuários
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); onSolicitarOP() }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                      </svg>
                      Solicitar OP
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setMenuOpen(false); onLogout() }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                  </svg>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
