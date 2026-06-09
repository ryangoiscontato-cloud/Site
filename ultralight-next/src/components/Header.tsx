'use client'

interface HeaderProps {
  onEntrada: () => void
  onSaida: () => void
}

export default function Header({ onEntrada, onSaida }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <svg className="w-10 h-10 flex-shrink-0" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#0f2d5e" />
            <path d="M10 28 L20 12 L30 28 Z" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="20" cy="12" r="2.5" fill="#4a9eff" />
          </svg>
          <div>
            <span className="block text-[1.35rem] font-extrabold text-[#0f2d5e] leading-none tracking-tight">
              Ultralight
            </span>
            <span className="block text-[0.68rem] text-gray-400 uppercase tracking-widest mt-0.5">
              Sistema de Estoque
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onEntrada}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all hover:-translate-y-px hover:shadow-md active:translate-y-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Entrada</span>
          </button>
          <button
            onClick={onSaida}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all hover:-translate-y-px hover:shadow-md active:translate-y-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Saída</span>
          </button>
        </div>
      </div>
    </header>
  )
}
