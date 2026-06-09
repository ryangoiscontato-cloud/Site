'use client'

import type { TabId } from '@/lib/types'

const tabs: { id: TabId; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Início',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
      </svg>
    ),
  },
  {
    id: 'saldo',
    label: 'Saldo de Estoque',
    shortLabel: 'Saldo',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h7a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'produtos',
    label: 'Produtos',
    shortLabel: 'Produtos',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    ),
  },
  {
    id: 'historico',
    label: 'Histórico',
    shortLabel: 'Histórico',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
]

interface NavTabsProps {
  active: TabId
  onChange: (id: TabId) => void
}

export default function NavTabs({ active, onChange }: NavTabsProps) {
  return (
    <>
      {/* ── Desktop: top tabs (md+) ── */}
      <nav className="hidden md:block bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap relative top-px ${
                active === tab.id
                  ? 'text-blue-700 border-blue-600 font-semibold'
                  : 'text-gray-500 border-transparent hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Mobile: bottom nav bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-1 transition-all active:scale-95 ${
                active === tab.id
                  ? 'text-blue-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {/* Icon with active indicator */}
              <div className={`relative p-1.5 rounded-xl transition-all ${active === tab.id ? 'bg-blue-100' : ''}`}>
                {tab.icon}
                {active === tab.id && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
              <span className="text-[0.65rem] font-semibold leading-none">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
