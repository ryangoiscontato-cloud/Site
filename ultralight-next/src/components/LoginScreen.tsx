'use client'

import { useState } from 'react'

interface Props {
  onLogin: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
}

export default function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError('')
    if (!username.trim() || !password) { setError('Preencha usuário e senha.'); return }
    setLoading(true)
    const res = await onLogin(username, password)
    setLoading(false)
    if (!res.ok) setError(res.error || 'Não foi possível entrar.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-700 via-red-800 to-red-900">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-7 text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Ultralight"
            width={80}
            height={80}
            className="rounded-xl object-contain mx-auto mb-4"
            style={{ width: 80, height: 80 }}
          />
          <h1 className="text-3xl font-extrabold tracking-tight leading-none">ULTRALIGHT</h1>
          <p className="text-xs text-red-100 uppercase tracking-[0.18em] mt-1.5">Gestão de Produção</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl p-7 space-y-4"
        >
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bem-vindo</h2>
            <p className="text-sm text-gray-500">Entre com a sua conta para continuar.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2.5">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10A8 8 0 11.001 10 8 8 0 0118 0zM9 5a1 1 0 012 0v4a1 1 0 11-2 0V5zm1 8a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="field-label">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Seu usuário"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="form-field"
            />
          </div>

          <div>
            <label className="field-label">Senha</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="form-field pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPwd ? (
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Entrando...
              </>
            ) : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-red-100/70 mt-5">
          Sistema interno &middot; Acesso restrito a funcionários
        </p>
      </div>
    </div>
  )
}
