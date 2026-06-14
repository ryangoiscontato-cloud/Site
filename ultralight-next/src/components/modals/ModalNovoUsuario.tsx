'use client'

import { useState, useEffect } from 'react'
import type { Usuario } from '@/lib/types'

interface Props {
  open: boolean
  usuarios: Usuario[]
  onClose: () => void
  onCriar: (username: string, password: string, role: 'admin' | 'user') => Promise<{ ok: boolean; error?: string }>
}

export default function ModalNovoUsuario({ open, usuarios, onClose, onCriar }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [role,     setRole]     = useState<'admin' | 'user'>('user')
  const [error,    setError]    = useState('')
  const [ok,       setOk]       = useState('')
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    if (open) { setUsername(''); setPassword(''); setConfirm(''); setRole('user'); setError(''); setOk('') }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  async function handleCriar() {
    setError(''); setOk('')
    if (!username.trim())          { setError('Informe o nome de usuário.'); return }
    if (password.length < 3)       { setError('A senha deve ter ao menos 3 caracteres.'); return }
    if (password !== confirm)      { setError('As senhas não conferem.'); return }
    setLoading(true)
    const res = await onCriar(username, password, role)
    setLoading(false)
    if (!res.ok) { setError(res.error || 'Erro ao criar usuário.'); return }
    setOk(`Usuário "${username.trim().toUpperCase()}" criado!`)
    setUsername(''); setPassword(''); setConfirm(''); setRole('user')
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box-scroll animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 bg-blue-50 border-b border-blue-100 sticky top-0 z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 00-6 6h12a6 6 0 00-6-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Gerenciar Usuários</h3>
              <p className="text-xs text-gray-500 mt-0.5">Crie novos logins para a equipe</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2.5">{error}</div>
          )}
          {ok && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-3 py-2.5">{ok}</div>
          )}

          <div>
            <label className="field-label">Usuário *</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Ex: MARIA" autoCapitalize="characters" autoCorrect="off" spellCheck={false}
              className="form-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Senha *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" className="form-field" />
            </div>
            <div>
              <label className="field-label">Confirmar *</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repita a senha" className="form-field" />
            </div>
          </div>

          <div>
            <label className="field-label">Permissão</label>
            <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'user')} className="form-field">
              <option value="user">Funcionário (uso normal)</option>
              <option value="admin">Administrador (pode criar usuários)</option>
            </select>
          </div>

          {/* Existing users */}
          <div>
            <p className="field-label">Usuários cadastrados ({usuarios.length})</p>
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-44 overflow-y-auto">
              {usuarios.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400 text-center">Nenhum usuário carregado</p>
              ) : usuarios.map(u => (
                <div key={u.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="font-semibold text-gray-800 text-sm">{u.username}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role === 'admin' ? 'Admin' : 'Funcionário'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-cancel">Fechar</button>
          <button
            onClick={handleCriar}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Criando...' : 'Criar Usuário'}
          </button>
        </div>
      </div>
    </div>
  )
}
