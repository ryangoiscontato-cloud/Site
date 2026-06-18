import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Movimento } from './types'
import { fmtDate } from './utils'

export function baixarTransferenciasPdf(transferencias: Movimento[], periodoLabel: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth  = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40

  doc.setFontSize(16)
  doc.setTextColor(15, 45, 94)
  doc.setFont('helvetica', 'bold')
  doc.text('TRANSFERÊNCIAS', margin, 50)

  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text(periodoLabel, margin, 66)

  doc.setDrawColor(15, 45, 94)
  doc.setLineWidth(1.5)
  doc.line(margin, 76, pageWidth - margin, 76)

  if (transferencias.length === 0) {
    doc.setFontSize(11)
    doc.setTextColor(156, 163, 175)
    doc.text('Nenhuma transferência encontrada para o filtro selecionado.', pageWidth / 2, 140, { align: 'center' })
  } else {
    const porEmpresa = new Map<string, Movimento[]>()
    for (const m of transferencias) {
      const empresa = m.empresaDestino || 'Sem destino'
      if (!porEmpresa.has(empresa)) porEmpresa.set(empresa, [])
      porEmpresa.get(empresa)!.push(m)
    }

    let cursorY = 96
    for (const [empresa, movs] of [...porEmpresa.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      if (cursorY > pageHeight - 120) { doc.addPage(); cursorY = 50 }

      doc.setFontSize(12)
      doc.setTextColor(15, 45, 94)
      doc.setFont('helvetica', 'bold')
      doc.text(empresa, margin, cursorY)

      autoTable(doc, {
        startY: cursorY + 8,
        margin: { left: margin, right: margin },
        head: [['Modelo', 'Quantidade', 'Data']],
        body: movs
          .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
          .map(m => [m.produtoNome, String(m.qtd), fmtDate(m.data)]),
        headStyles: { fillColor: [239, 246, 255], textColor: [15, 45, 94], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 6 },
        theme: 'grid',
      })

      cursorY = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cursorY) + 28
    }
  }

  const now = new Date()
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text(
    `Gerado em ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`,
    pageWidth - margin,
    pageHeight - 20,
    { align: 'right' }
  )

  doc.save(`transferencias_${now.toISOString().slice(0, 10)}.pdf`)
}
