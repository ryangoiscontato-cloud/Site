'use client'

import { useState } from 'react'
import type { Produto, Movimento, TabId, MetaProducao } from '@/lib/types'
import { fmtDate, todayLong } from '@/lib/utils'
import MovimentoDetailModal from '@/components/modals/MovimentoDetailModal'
import ModalMetas from '@/components/modals/ModalMetas'

interface Props {
  produtos: Produto[]
  historico: Movimento[]
  onTabChange: (tab: TabId) => void
  metas: MetaProducao[]
  salvarMeta: (tier: 'basic' | 'advanced' | 'premium', mes: number, ano: number, meta: number, progresso: number) => Promise<{ ok: boolean; error?: string }>
  toast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
}

const TIER_INFO: { value: 'basic' | 'advanced' | 'premium'; label: string; bar: string }[] = [
  { value: 'basic',    label: 'Basic',    bar: 'bg-blue-500' },
  { value: 'advanced', label: 'Advanced', bar: 'bg-purple-500' },
  { value: 'premium',  label: 'Premium',  bar: 'bg-amber-500' },
]

export default function Dashboard({ produtos, historico, onTabChange, metas, salvarMeta, toast }: Props) {
  const [selected, setSelected] = useState<Movimento | null>(null)
  const [showBaixo, setShowBaixo] = useState(false)
  const [showMetas, setShowMetas] = useState(false)
  const hoje = new Date().toDateString()
  const totalItens  = produtos.reduce((s, p) => s + p.saldo, 0)
  const baixo       = produtos.filter(p => p.saldo === 0 || (p.estoqueMin > 0 && p.saldo <= p.estoqueMin))
  const movHoje     = historico.filter(h => new Date(h.data).toDateString() === hoje)
  const recent      = [...historico].reverse().slice(0, 8)

  const agora = new Date()
  const mesAtual = agora.getMonth() + 1
  const anoAtual = agora.getFullYear()

  const stats = [
    {
      label: 'Total de Produtos',
      value: produtos.length,
      color: 'blue',
      onClick: () => onTabChange('produtos'),
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10l-8-4V7"/></svg>,
    },
    {
      label: 'Itens em Estoque',
      value: totalItens,
      color: 'green',
      onClick: () => onTabChange('saldo'),
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
    },
    {
      label: 'Estoque Baixo',
      value: baixo.length,
      color: 'orange',
      onClick: () => setShowBaixo(true),
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>,
    },
    {
      label: 'Movimentos Hoje',
      value: movHoje.length,
      color: 'purple',
      onClick: () => onTabChange('historico'),
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
  ]

  const statStyle: Record<string, string> = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Dashboard</h1>
        <span className="text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
          {todayLong()}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <button
            key={s.label}
            onClick={s.onClick}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left w-full active:scale-[0.98]"
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${statStyle[s.color]}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[0.72rem] font-semibold text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900 leading-none mt-0.5">{s.value}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
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
                  <tr key={h.id} onClick={() => setSelected(h)} className="border-t border-gray-50 hover:bg-blue-50 transition-colors cursor-pointer">
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

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-4">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-semibold text-gray-900">Metas do Mês</h2>
          <div className="flex items-center gap-2">
            <a
              href="/tv/metas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              Tela Cheia
            </a>
            <button
              onClick={() => setShowMetas(true)}
              className="text-xs font-semibold text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Configurar
            </button>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TIER_INFO.map(t => {
            const m = metas.find(x => x.tier === t.value && x.mes === mesAtual && x.ano === anoAtual)
            const meta = m?.meta ?? 0
            const progresso = m?.progresso ?? 0
            const pct = meta > 0 ? Math.min(100, Math.round((progresso / meta) * 100)) : 0
            return (
              <div key={t.value} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-800">{t.label}</p>
                  <p className="text-xs font-semibold text-gray-400">{pct}%</p>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${t.bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-500">{progresso} / {meta}</p>
              </div>
            )
          })}
        </div>
      </div>

      {selected && <MovimentoDetailModal mov={selected} onClose={() => setSelected(null)} />}

      <ModalMetas
        open={showMetas}
        metas={metas}
        mes={mesAtual}
        ano={anoAtual}
        salvarMeta={salvarMeta}
        onClose={() => setShowMetas(false)}
        onSuccess={msg => toast(msg, 'success')}
        onError={msg => toast(msg, 'error')}
      />

      {showBaixo && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowBaixo(false)}>
          <div className="modal-box-scroll animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 bg-orange-50 border-b border-orange-200 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Produtos com Estoque Baixo</h3>
                  <p className="text-xs text-gray-500">{baixo.length} produto{baixo.length !== 1 ? 's' : ''} com atenção</p>
                </div>
              </div>
              <button onClick={() => setShowBaixo(false)} className="modal-close-btn">&times;</button>
            </div>

            <div className="px-6 py-5 space-y-2">
              {baixo.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Nenhum produto com estoque baixo.</p>
              ) : baixo.map(p => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${
                    p.saldo === 0
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-orange-50 border-orange-200 text-orange-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{p.nome}</p>
                    <p className="text-xs opacity-70 mt-0.5">{p.codigo} · {p.categoria || 'Sem categoria'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base">{p.saldo === 0 ? 'ZERADO' : `${p.saldo} ${p.unidade}`}</p>
                    {p.estoqueMin > 0 && <p className="text-xs opacity-70">Mín: {p.estoqueMin}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end sticky bottom-0 bg-white">
              <button onClick={() => setShowBaixo(false)} className="btn-cancel">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
