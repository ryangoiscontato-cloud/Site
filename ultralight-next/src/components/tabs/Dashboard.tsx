'use client'

import type { Produto, Movimento } from '@/lib/types'
import { fmtDate, todayLong } from '@/lib/utils'

interface Props {
  produtos: Produto[]
  historico: Movimento[]
}

function StatusBadge({ p }: { p: Produto }) {
  if (p.saldo === 0) return <span className="badge-red">Zerado</span>
  if (p.estoqueMin > 0 && p.saldo <= p.estoqueMin) return <span className="badge-orange">Estoque baixo</span>
  return <span className="badge-green">Normal</span>
}

export default function Dashboard({ produtos, historico }: Props) {
  const hoje = new Date().toDateString()
  const totalItens  = produtos.reduce((s, p) => s + p.saldo, 0)
  const baixo       = produtos.filter(p => p.saldo === 0 || (p.estoqueMin > 0 && p.saldo <= p.estoqueMin))
  const movHoje     = historico.filter(h => new Date(h.data).toDateString() === hoje)
  const recent      = [...historico].reverse().slice(0, 8)

  const stats = [
    { label: 'Total de Produtos', value: produtos.length, color: 'blue',   icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10l-8-4V7"/></svg> },
    { label: 'Itens em Estoque',  value: totalItens,       color: 'green',  icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> },
    { label: 'Estoque Baixo',     value: baixo.length,     color: 'orange', icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg> },
    { label: 'Movimentos Hoje',   value: movHoje.length,   color: 'purple', icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  ]

  const statStyle: Record<string, string> = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Dashboard</h1>
        <span className="text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
          {todayLong()}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${statStyle[s.color]}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[0.72rem] font-semibold text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900 leading-none mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Recent movements */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Movimentos Recentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-[0.72rem] text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left font-semibold">Produto</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Tipo</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Qtd</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">Nenhum movimento registrado</td></tr>
                ) : recent.map(h => (
                  <tr key={h.id} className="border-t border-gray-50 hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{h.produtoNome}</td>
                    <td className="px-4 py-3">
                      {h.tipo === 'entrada'
                        ? <span className="badge-green">Entrada</span>
                        : <span className="badge-red">Saída</span>}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      <span className={h.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                        {h.tipo === 'entrada' ? '+' : '-'}{h.qtd}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(h.data)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Alertas de Estoque</h2>
          </div>
          <div className="p-4">
            {baixo.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
                <svg className="w-10 h-10 text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-sm">Todos os produtos estão OK</p>
              </div>
            ) : baixo.map(p => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg mb-2 last:mb-0 border text-sm font-medium ${
                  p.saldo === 0
                    ? 'bg-red-50 border-red-100 text-red-700'
                    : 'bg-orange-50 border-orange-100 text-orange-700'
                }`}
              >
                <span className="font-semibold">{p.nome}</span>
                <span className="text-xs opacity-80">
                  {p.saldo === 0 ? 'Zerado!' : `${p.saldo} ${p.unidade}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
