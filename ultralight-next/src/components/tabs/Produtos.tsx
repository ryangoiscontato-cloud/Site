'use client'

import type { Produto } from '@/lib/types'

interface Props {
  produtos: Produto[]
  onNovo: () => void
  onEditar: (p: Produto) => void
  onExcluir: (p: Produto) => void
}

export default function Produtos({ produtos, onNovo, onEditar, onExcluir }: Props) {
  const qtyColor = (p: Produto) => {
    if (p.saldo === 0) return 'text-red-600 font-bold'
    if (p.estoqueMin > 0 && p.saldo <= p.estoqueMin) return 'text-orange-600 font-bold'
    return 'text-gray-900 font-bold'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Gerenciar Produtos</h1>
        <button
          onClick={onNovo}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all hover:shadow-md"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          Novo Produto
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-[0.72rem] text-gray-500 uppercase tracking-wide border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold">Código</th>
                <th className="px-4 py-3 text-left font-semibold">Produto</th>
                <th className="px-4 py-3 text-left font-semibold">Categoria</th>
                <th className="px-4 py-3 text-left font-semibold">Unidade</th>
                <th className="px-4 py-3 text-left font-semibold">Est. Mín.</th>
                <th className="px-4 py-3 text-left font-semibold">Saldo</th>
                <th className="px-4 py-3 text-left font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12 text-gray-200" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                      </svg>
                      <p>Nenhum produto cadastrado. Clique em &ldquo;Novo Produto&rdquo; para começar.</p>
                    </div>
                  </td>
                </tr>
              ) : produtos.map(p => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono font-semibold">{p.codigo}</code>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{p.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{p.categoria || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.unidade}</td>
                  <td className="px-4 py-3 text-gray-600">{p.estoqueMin}</td>
                  <td className="px-4 py-3">
                    <span className={`text-base ${qtyColor(p)}`}>{p.saldo} <span className="text-xs font-normal text-gray-400">{p.unidade}</span></span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEditar(p)}
                        title="Editar"
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => onExcluir(p)}
                        title="Excluir"
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
