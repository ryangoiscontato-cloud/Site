'use client'

import { createPortal } from 'react-dom'
import type { Movimento } from '@/lib/types'

interface Props {
  transferencias: Movimento[]
  periodoLabel: string
}

interface Grupo {
  dia: string
  ordem: number
  itens: Movimento[]
}

export default function PrintTransferencias({ transferencias, periodoLabel }: Props) {
  if (typeof document === 'undefined') return null

  const grupos = new Map<string, Grupo>()
  for (const m of transferencias) {
    const d = new Date(m.data)
    const dia = d.toLocaleDateString('pt-BR')
    if (!grupos.has(dia)) grupos.set(dia, { dia, ordem: d.getTime(), itens: [] })
    grupos.get(dia)!.itens.push(m)
  }
  const diasOrdenados = [...grupos.values()].sort((a, b) => a.ordem - b.ordem)

  return createPortal(
    <div id="print-transferencias">
      <div className="pt-header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Ultralight" />
        <div>
          <p className="pt-title">TRANSFERÊNCIAS</p>
          <p className="pt-sub">{periodoLabel}</p>
        </div>
      </div>

      {diasOrdenados.length === 0 ? (
        <p className="pt-empty">Nenhuma transferência encontrada para o filtro selecionado.</p>
      ) : (
        diasOrdenados.map(g => (
          <div key={g.dia}>
            <p className="pt-day">{g.dia}</p>
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Modelo</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {g.itens.map(m => (
                  <tr key={m.id}>
                    <td>{m.empresaDestino}</td>
                    <td>{m.produtoNome}</td>
                    <td>{m.qtd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      <p className="pt-footer">Gerado em {new Date().toLocaleString('pt-BR')}</p>
    </div>,
    document.body
  )
}
