'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Usuario, UserRole } from '@/lib/types'
import { supabase, isConfigured } from '@/lib/supabase'
import { hashPassword, getSession, setSession, clearSession } from '@/lib/auth'

interface UsuarioRow {
  id: string
  username: string
  senha_hash: string
  role: string
  created_at?: string
}

function mapRole(role: string): UserRole {
  if (role === 'admin') return 'admin'
  if (role === 'chaparia') return 'chaparia'
  if (role === 'almoxarifado') return 'almoxarifado'
  if (role === 'montagem') return 'montagem'
  if (role === 'expedicao') return 'expedicao'
  return 'user'
}

function mapUsuario(row: UsuarioRow): Usuario {
  return { id: row.id, username: row.username, role: mapRole(row.role) }
}

export function useAuth() {
  const [user, setUser]         = useState<Usuario | null>(null)
  const [loading, setLoading]   = useState(true)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  useEffect(() => {
    setUser(getSession())
    setLoading(false)
  }, [])

  const carregarUsuarios = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase.from('usuarios').select('id, username, role, created_at').order('created_at')
    if (data) setUsuarios((data as UsuarioRow[]).map(mapUsuario))
  }, [])

  useEffect(() => {
    if (user?.role === 'admin') carregarUsuarios()
  }, [user, carregarUsuarios])

  const login = useCallback(async (username: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    if (!isConfigured || !supabase) return { ok: false, error: 'Supabase não configurado. Veja .env.local.example.' }

    const uname = username.trim().toUpperCase()
    const hash  = await hashPassword(password)

    const { data, error } = await supabase
      .from('usuarios')
      .select('id, username, senha_hash, role')
      .eq('username', uname)
      .maybeSingle()

    if (error)  return { ok: false, error: 'Erro ao conectar. Tente novamente.' }
    if (!data)  return { ok: false, error: 'Usuário ou senha inválidos.' }

    const row = data as UsuarioRow
    if (row.senha_hash !== hash) return { ok: false, error: 'Usuário ou senha inválidos.' }

    const u = mapUsuario(row)
    setSession(u)
    setUser(u)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    setUsuarios([])
  }, [])

  const criarUsuario = useCallback(async (
    username: string,
    password: string,
    role: UserRole = 'user',
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }

    const uname = username.trim().toUpperCase()
    if (!uname)          return { ok: false, error: 'Informe um nome de usuário.' }
    if (password.length < 3) return { ok: false, error: 'A senha deve ter ao menos 3 caracteres.' }

    const hash = await hashPassword(password)
    const { error } = await supabase
      .from('usuarios')
      .insert({ username: uname, senha_hash: hash, role })

    if (error) {
      if (error.code === '23505') return { ok: false, error: 'Esse usuário já existe.' }
      return { ok: false, error: 'Erro ao criar usuário.' }
    }

    await carregarUsuarios()
    return { ok: true }
  }, [carregarUsuarios])

  const alterarUsuario = useCallback(async (
    userId: string,
    novoUsername?: string,
    novaSenha?: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }

    const updates: Record<string, string> = {}
    if (novoUsername) updates.username = novoUsername.trim().toUpperCase()
    if (novaSenha) {
      if (novaSenha.length < 3) return { ok: false, error: 'A senha deve ter ao menos 3 caracteres.' }
      updates.senha_hash = await hashPassword(novaSenha)
    }
    if (Object.keys(updates).length === 0) return { ok: false, error: 'Nada para alterar.' }

    const { error } = await supabase.from('usuarios').update(updates).eq('id', userId)
    if (error) {
      if (error.code === '23505') return { ok: false, error: 'Esse usuário já existe.' }
      return { ok: false, error: 'Erro ao alterar usuário.' }
    }

    await carregarUsuarios()
    return { ok: true }
  }, [carregarUsuarios])

  const excluirUsuario = useCallback(async (userId: string): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: 'Supabase não configurado.' }
    const { error } = await supabase.from('usuarios').delete().eq('id', userId)
    if (error) return { ok: false, error: 'Erro ao excluir usuário.' }
    await carregarUsuarios()
    return { ok: true }
  }, [carregarUsuarios])

  return { user, loading, login, logout, criarUsuario, alterarUsuario, excluirUsuario, usuarios }
}
