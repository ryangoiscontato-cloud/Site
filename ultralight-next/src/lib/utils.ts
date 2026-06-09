export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function fmtDate(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('pt-BR') +
    ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  )
}

export function todayLong(): string {
  const s = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}
