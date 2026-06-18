'use client'

import { useState, useEffect } from 'react'
import type { Usuario, UserRole } from '@/lib/types'

interface Props {
  open: boolean
  usuarios: Usuario[]
  currentUserId?: string
  onClose: () => void
  onCriar: (username: string, password: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>
  onAlterar: (userId: string, novoUsername?: string, novaSenha?: string) => Promise<{ ok: boolean; error?: string }>
  onExcluir: (userId: string) => Promise<{ ok: boolean; error?: string }>
}

type Tela = 'lista' | 'criar' | 'editar' | 'minha-senha' | 'confirmar-excluir'

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'user',         label: 'Funcionário' },
  { value: 'chaparia',     label: 'Chaparia' },
  { value: 'pintura',      label: 'Pintura' },
  { value: 'almoxarifado', label: 'Almoxarifado' },
  { value: 'montagem',     label: 'Montagem' },
  { value: 'expedicao',    label: 'Expedição' },
  { value: 'admin',        label: 'Administrador' },
]

function roleLabel(r: string) {
  return ROLES.find(x => x.value === r)?.label ?? 'Funcionário'
}

function roleBadge(r: string) {
  if (r === 'admin')        return 'bg-blue-100 text-blue-700'
  if (r === 'chaparia')     return 'bg-orange-100 text-orange-700'
  if (r === 'pintura')      return 'bg-pink-100 text-pink-700'
  if (r === 'almoxarifado') return 'bg-purple-100 text-purple-700'
  if (r === 'montagem')     return 'bg-teal-100 text-teal-700'
  if (r === 'expedicao')    return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-600'
}

export default function ModalNovoUsuario({ open, usuarios, currentUserId, onClose, onCriar, onAlterar, onExcluir }: Props) {
  const [tela, setTela] = useState<Tela>('lista')
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [excluindo, setExcluindo] = useState<Usuario | null>(null)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState<UserRole>('user')

  const [editUsername, setEditUsername] = useState('')
  const [editSenha, setEditSenha] = useState('')
  const [editConfirm, setEditConfirm] = useState('')

  const [minhaSenha, setMinhaSenha] = useState('')
  const [minhaConfirm, setMinhaConfirm] = useState('')

  useEffect(() => { if (open) reset() }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (tela !== 'lista') goLista(); else onClose() }
    }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, tela, onClose])

  function reset() {
    setTela('lista'); setEditando(null); setExcluindo(null); setError(''); setOk('')
    setUsername(''); setPassword(''); setConfirm(''); setRole('user')
    setEditUsername(''); setEditSenha(''); setEditConfirm('')
    setMinhaSenha(''); setMinhaConfirm('')
  }

  function goLista() { setTela('lista'); setError(''); setOk(''); setEditando(null); setExcluindo(null) }

  function startEditar(u: Usuario) {
    setEditando(u); setEditUsername(u.username)
    setEditSenha(''); setEditConfirm(''); setError(''); setOk('')
    setTela('editar')
  }

  function startExcluir(u: Usuario) {
    setExcluindo(u); setError(''); setOk('')
    setTela('confirmar-excluir')
  }

  async function handleCriar() {
    setError(''); setOk('')
    if (!username.trim()) { setError('Informe o nome de usuário.'); return }
    if (password.length < 3) { setError('A senha deve ter ao menos 3 caracteres.'); return }
    if (password !== confirm) { setError('As senhas não conferem.'); return }
    setLoading(true)
    const res = await onCriar(username, password, role)
    setLoading(false)
    if (!res.ok) { setError(res.error || 'Erro ao criar usuário.'); return }
    setOk('Usuário criado com sucesso!')
    setUsername(''); setPassword(''); setConfirm(''); setRole('user')
  }

  async function handleEditar() {
    if (!editando) return
    setError(''); setOk('')
    if (editSenha && editSenha !== editConfirm) { setError('As senhas não conferem.'); return }
    const novoUsername = editUsername.trim().toUpperCase() !== editando.username ? editUsername.trim() : undefined
    const novaSenha = editSenha || undefined
    if (!novoUsername && !novaSenha) { setError('Altere o usuário ou a senha.'); return }
    setLoading(true)
    const res = await onAlterar(editando.id, novoUsername, novaSenha)
    setLoading(false)
    if (!res.ok) { setError(res.error || 'Erro ao alterar.'); return }
    setOk('Alterado com sucesso!')
    setEditSenha(''); setEditConfirm('')
  }

  async function handleExcluir() {
    if (!excluindo) return
    setLoading(true)
    const res = await onExcluir(excluindo.id)
    setLoading(false)
    if (!res.ok) { setError(res.error || 'Erro ao excluir usuário.'); return }
    goLista()
  }

  async function handleMinhaSenha() {
    if (!currentUserId) return
    setError(''); setOk('')
    if (minhaSenha.length < 3) { setError('A senha deve ter ao menos 3 caracteres.'); return }
    if (minhaSenha !== minhaConfirm) { setError('As senhas não conferem.'); return }
    setLoading(true)
    const res = await onAlterar(currentUserId, undefined, minhaSenha)
    setLoading(false)
    if (!res.ok) { setError(res.error || 'Erro ao alterar senha.'); return }
    setOk('Senha alterada com sucesso!')
    setMinhaSenha(''); setMinhaConfirm('')
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box-scroll animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 bg-blue-50 border-b border-blue-100 sticky top-0 z-10">
          <div className="flex items-center gap-3.5">
            {tela !== 'lista' && (
              <button onClick={goLista} className="text-blue-700 hover:text-blue-900 mr-1">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            )}
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 00-6 6h12a6 6 0 00-6-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {tela === 'lista'             ? 'Gerenciar Usuários' :
                 tela === 'criar'             ? 'Novo Usuário' :
                 tela === 'editar'            ? `Editar: ${editando?.username}` :
                 tela === 'confirmar-excluir' ? 'Excluir Usuário' :
                 'Minha Senha'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {tela === 'lista'             ? 'Crie e gerencie usuários' :
                 tela === 'criar'             ? 'Preencha os dados do novo usuário' :
                 tela === 'editar'            ? 'Altere usuário ou senha' :
                 tela === 'confirmar-excluir' ? 'Confirme a exclusão' :
                 'Altere sua senha de acesso'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2.5">{error}</div>}
          {ok    && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-3 py-2.5">{ok}</div>}

          {/* LISTA */}
          {tela === 'lista' && (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => { setTela('criar'); setError(''); setOk('') }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
                  Novo Usuário
                </button>
                <button
                  onClick={() => { setTela('minha-senha'); setError(''); setOk('') }}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                  Minha Senha
                </button>
              </div>
              <div>
                <p className="field-label">Usuários cadastrados ({usuarios.length})</p>
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {usuarios.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-400 text-center">Nenhum usuário carregado</p>
                  ) : usuarios.map(u => (
                    <div key={u.id} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-semibold text-gray-800 text-sm truncate">{u.username}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${roleBadge(u.role)}`}>
                          {roleLabel(u.role)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <button
                          onClick={() => startEditar(u)}
                          className="text-xs text-blue-700 font-semibold px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                        >
                          Editar
                        </button>
                        {u.id !== currentUserId && (
                          <button
                            onClick={() => startExcluir(u)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            title="Excluir usuário"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* CRIAR */}
          {tela === 'criar' && (
            <>
              <div>
                <label className="field-label">Usuário *</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Ex: MARIA" autoCapitalize="characters" autoCorrect="off" spellCheck={false}
                  className="form-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Senha *</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" className="form-field" />
                </div>
                <div>
                  <label className="field-label">Confirmar *</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repita" className="form-field" />
                </div>
              </div>
              <div>
                <label className="field-label">Permissão</label>
                <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="form-field">
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </>
          )}

          {/* EDITAR */}
          {tela === 'editar' && editando && (
            <>
              <div>
                <label className="field-label">Nome de usuário</label>
                <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)}
                  autoCapitalize="characters" autoCorrect="off" spellCheck={false}
                  className="form-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Nova senha</label>
                  <input type="password" value={editSenha} onChange={e => setEditSenha(e.target.value)} placeholder="Deixe em branco para manter" className="form-field" />
                </div>
                <div>
                  <label className="field-label">Confirmar</label>
                  <input type="password" value={editConfirm} onChange={e => setEditConfirm(e.target.value)} placeholder="Repita a nova senha" className="form-field" />
                </div>
              </div>
              <p className="text-xs text-gray-400">Deixe a senha em branco para alterar apenas o nome.</p>
            </>
          )}

          {/* CONFIRMAR EXCLUIR */}
          {tela === 'confirmar-excluir' && excluindo && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-gray-700 text-sm">
                Tem certeza que deseja excluir o usuário <span className="font-bold text-gray-900">{excluindo.username}</span>?<br/>
                Esta ação não pode ser desfeita.
              </p>
            </div>
          )}

          {/* MINHA SENHA */}
          {tela === 'minha-senha' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Nova senha *</label>
                <input type="password" value={minhaSenha} onChange={e => setMinhaSenha(e.target.value)} placeholder="Nova senha" className="form-field" />
              </div>
              <div>
                <label className="field-label">Confirmar *</label>
                <input type="password" value={minhaConfirm} onChange={e => setMinhaConfirm(e.target.value)} placeholder="Repita" className="form-field" />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5 sticky bottom-0 bg-white">
          {tela === 'lista' && <button onClick={onClose} className="btn-cancel">Fechar</button>}
          {tela === 'criar' && (
            <>
              <button onClick={goLista} className="btn-cancel">Cancelar</button>
              <button onClick={handleCriar} disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
                {loading ? 'Criando...' : 'Criar Usuário'}
              </button>
            </>
          )}
          {tela === 'editar' && (
            <>
              <button onClick={goLista} className="btn-cancel">Cancelar</button>
              <button onClick={handleEditar} disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </>
          )}
          {tela === 'confirmar-excluir' && (
            <>
              <button onClick={goLista} className="btn-cancel">Cancelar</button>
              <button onClick={handleExcluir} disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
                {loading ? 'Excluindo...' : 'Excluir'}
              </button>
            </>
          )}
          {tela === 'minha-senha' && (
            <>
              <button onClick={goLista} className="btn-cancel">Cancelar</button>
              <button onClick={handleMinhaSenha} disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
                {loading ? 'Salvando...' : 'Alterar Senha'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
