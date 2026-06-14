'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'

interface Props {
  onScan: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const doneRef     = useRef(false)
  const [error, setError] = useState('')

  useEffect(() => {
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
              const text = result.getText()
              controlsRef.current?.stop()
              onScan(text)
            }
          },
        )
        if (cancelled) { controls.stop(); return }
        controlsRef.current = controls
      } catch (err) {
        console.error(err)
        setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.')
      }
    }

    start()

    return () => {
      cancelled = true
      controlsRef.current?.stop()
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 text-white">
        <div className="flex items-center gap-2.5">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
            <path strokeLinecap="round" d="M6 12h12"/>
          </svg>
          <span className="font-bold">Escanear Código de Barras</span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 text-white text-2xl leading-none transition-colors"
        >
          &times;
        </button>
      </div>

      {/* Camera */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {error ? (
          <div className="px-8 text-center text-white/90">
            <svg className="w-12 h-12 mx-auto mb-3 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10A8 8 0 11.001 10 8 8 0 0118 0zM9 5a1 1 0 012 0v4a1 1 0 11-2 0V5zm1 8a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            {/* Viewfinder overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[78%] max-w-md aspect-[4/3] border-2 border-white/80 rounded-2xl relative">
                <span className="absolute -top-px -left-px w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-2xl" />
                <span className="absolute -top-px -right-px w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-2xl" />
                <span className="absolute -bottom-px -left-px w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-2xl" />
                <span className="absolute -bottom-px -right-px w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-2xl" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-5 text-center">
        <p className="text-white/70 text-sm mb-3">Aponte a câmera para o código de barras do produto</p>
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
