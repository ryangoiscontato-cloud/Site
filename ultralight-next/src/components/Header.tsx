'use client'

interface HeaderProps {
  onEntrada: () => void
  onSaida: () => void
}

export default function Header({ onEntrada, onSaida }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo — using <img> tag for guaranteed rendering on all devices */}
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpeg"
            alt="Ultralight"
            width={40}
            height={40}
            className="rounded-full object-cover flex-shrink-0 w-10 h-10"
          />
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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Entrada</span>
          </button>
          <button
            onClick={onSaida}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>Saída</span>
          </button>
        </div>
      </div>
    </header>
  )
}
