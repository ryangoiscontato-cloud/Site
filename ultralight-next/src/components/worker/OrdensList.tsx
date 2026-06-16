'use client'

import type { OrdemProducao, Usuario } from '@/lib/types'
import { fmtDate } from '@/lib/utils'

interface Props {
  ordens: OrdemProducao[]
  user: Usuario
  onSelect: (ordem: OrdemProducao) => void
}

function StatusBadge({ status }: { status: OrdemProducao['status'] }) {
  if (status === 'pendente')    return <span className="badge-orange">Pendente</span>
  if (status === 'em_producao') return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block flex-shrink-0" />Em andamento</span>
  if (status === 'pausada')     return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block flex-shrink-0" />Pausada</span>
  return <span className="badge-green">Concluída</span>
}

export default function OrdensList({ ordens, user, onSelect }: Props) {
  const dest = user.username.toUpperCase() as 'CHAPARIA' | 'ALMOXARIFADO'
  const minhas = ordens.filter(o => o.usuarioDestino === dest)

  const active  = minhas.filter(o => o.status !== 'concluida')
  const done    = minhas.filter(o => o.status === 'concluida')

  if (minhas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
        <svg className="w-14 h-14 text-gray-200" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
        </svg>
        <p className="text-sm">Nenhuma ordem de produção pendente.</p>
      </div>
    )
  }

  function Card({ o }: { o: OrdemProducao }) {
    return (
      <button
        onClick={() => onSelect(o)}
        className="w-full text-left bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="font-bold text-gray-900 text-base leading-snug">{o.produtoNome}</p>
          <StatusBadge status={o.status} />
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm mb-3">
          <div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Quantidade</span>
            <p className="font-bold text-gray-900">{o.quantidade}</p>
          </div>
          {o.petgQuantidade != null && (
            <div>
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">PETG</span>
              <p className="font-bold text-gray-900">{o.petgQuantidade}</p>
            </div>
          )}
        </div>
        {o.obs && <p className="text-sm text-gray-500 mb-2">{o.obs}</p>}
        <p className="text-xs text-gray-400">{fmtDate(o.criadoEm)}</p>
      </button>
    )
  }

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">
            Em andamento ({active.length})
          </h2>
          <div className="space-y-3">
            {active.map(o => <Card key={o.id} o={o} />)}
          </div>
        </div>
      )}
      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">
            Concluídas ({done.length})
          </h2>
          <div className="space-y-3">
            {done.map(o => <Card key={o.id} o={o} />)}
          </div>
        </div>
      )}
    </div>
  )
}
