'use client'

import type { TabId, UserRole } from '@/lib/types'

const baseTabs: { id: TabId; label: string; shortLabel: string; icon: React.ReactNode }[] = [
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
    label: 'Saldo',
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

const producaoTab: { id: TabId; label: string; shortLabel: string; icon: React.ReactNode } = {
  id: 'producao',
  label: 'Produção',
  shortLabel: 'Produção',
  icon: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
}

interface NavTabsProps {
  active: TabId
  onChange: (id: TabId) => void
  userRole?: UserRole
}

export default function NavTabs({ active, onChange, userRole }: NavTabsProps) {
  const tabs = userRole === 'admin' ? [...baseTabs, producaoTab] : baseTabs
  const mobileColCount = tabs.length

  return (
    <>
      <nav className="hidden lg:block bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`inline-flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap relative top-px ${
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

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
        style={{
          boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="w-full" style={{ display: 'grid', gridTemplateColumns: `repeat(${mobileColCount}, 1fr)` }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 pt-3 pb-2 w-full transition-colors active:bg-gray-50 ${
                active === tab.id ? 'text-blue-700' : 'text-gray-400'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${active === tab.id ? 'bg-blue-100' : ''}`}>
                {tab.icon}
              </div>
              <span className="text-[0.6rem] font-semibold leading-none">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
