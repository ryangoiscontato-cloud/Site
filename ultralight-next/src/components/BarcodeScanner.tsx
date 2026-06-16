'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'

interface Props {
  onScan: (barcode: string) => void
  onClose: () => void
}

type Mode = 'camera' | 'bluetooth'

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('camera')
  const [btCode, setBtCode] = useState('')
  const [error, setError] = useState('')
  const videoRef    = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const doneRef     = useRef(false)
  const btInputRef  = useRef<HTMLInputElement>(null)

  // Camera mode
  useEffect(() => {
    if (mode !== 'camera') return
    const reader = new BrowserMultiFormatReader()
    let cancelled = false

    async function start() {
      try {
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current!,
          (result) => {
            if (result && !doneRef.current) {
              doneRef.current = true
              controlsRef.current?.stop()
              onScan(result.getText())
            }
          },
        )
        if (cancelled) { controls.stop(); return }
        controlsRef.current = controls
      } catch (err) {
        console.error(err)
        setError('Não foi possível acessar a câmera. Verifique as permissões.')
      }
    }

    start()
    return () => {
      cancelled = true
      controlsRef.current?.stop()
    }
  }, [mode, onScan])

  // Bluetooth mode: focus input
  useEffect(() => {
    if (mode === 'bluetooth') {
      setTimeout(() => btInputRef.current?.focus(), 100)
    } else {
      setBtCode('')
    }
  }, [mode])

  function handleBtSubmit() {
    const v = btCode.trim()
    if (!v) return
    onScan(v)
    setBtCode('')
  }

  function handleBtKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleBtSubmit()
  }

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 text-white">
        <div className="flex items-center gap-2.5">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
            <path strokeLinecap="round" d="M6 12h12"/>
          </svg>
          <span className="font-bold">Scanning</span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 text-white text-2xl leading-none transition-colors"
        >
          &times;
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center px-5 pb-3">
        <div className="flex bg-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => { doneRef.current = false; setError(''); setMode('camera') }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === 'camera' ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
            </svg>
            Câmera
          </button>
          <button
            onClick={() => { controlsRef.current?.stop(); setMode('bluetooth') }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === 'bluetooth' ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
            </svg>
            Bluetooth
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {mode === 'camera' ? (
          error ? (
            <div className="px-8 text-center text-white/90">
              <svg className="w-12 h-12 mx-auto mb-3 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10A8 8 0 11.001 10 8 8 0 0118 0zM9 5a1 1 0 012 0v4a1 1 0 11-2 0V5zm1 8a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
              </svg>
              <p className="text-sm mb-4">{error}</p>
              <button
                onClick={() => setMode('bluetooth')}
                className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Usar modo Bluetooth
              </button>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[78%] max-w-md aspect-[4/3] border-2 border-white/80 rounded-2xl relative">
                  <span className="absolute -top-px -left-px w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-2xl" />
                  <span className="absolute -top-px -right-px w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-2xl" />
                  <span className="absolute -bottom-px -left-px w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-2xl" />
                  <span className="absolute -bottom-px -right-px w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-2xl" />
                </div>
              </div>
            </>
          )
        ) : (
          <div className="w-full max-w-sm px-6 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Leitor Bluetooth / Teclado</p>
            <p className="text-white/60 text-sm mb-6">
              Escaneie com o leitor ou digite o código manualmente e pressione Enter
            </p>
            <input
              ref={btInputRef}
              type="text"
              value={btCode}
              onChange={e => setBtCode(e.target.value)}
              onKeyDown={handleBtKey}
              placeholder="Aguardando leitura..."
              className="w-full px-4 py-4 text-center text-lg font-bold bg-white/10 border-2 border-white/20 focus:border-blue-400 rounded-xl text-white placeholder-white/30 outline-none transition-colors"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {btCode && (
              <button
                onClick={handleBtSubmit}
                className="mt-4 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
              >
                Confirmar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-5 text-center">
        <p className="text-white/50 text-xs mb-3">
          {mode === 'camera'
            ? 'Aponte a câmera para o código de barras'
            : 'O leitor Bluetooth digita automaticamente no campo acima'}
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}
