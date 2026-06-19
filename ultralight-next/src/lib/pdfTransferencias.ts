import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Movimento } from './types'
import { fmtDate } from './utils'

function loadLogo(): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = '/logo.png'
  })
}

const RED: [number, number, number] = [214, 16, 24]
const RED_LIGHT: [number, number, number] = [253, 232, 232]
const RED_TINT_TEXT: [number, number, number] = [252, 205, 205]

export async function baixarTransferenciasPdf(transferencias: Movimento[], periodoLabel: string) {
  const logo = await loadLogo()

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth  = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 32

  // ── Cabeçalho com logo e nome do sistema ──
  doc.setFillColor(...RED)
  doc.rect(0, 0, pageWidth, 58, 'F')

  if (logo) {
    doc.addImage(logo, 'PNG', margin, 12, 34, 34)
  }

  const textX = logo ? margin + 44 : margin
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('ULTRALIGHT', textX, 26)

  doc.setFontSize(8)
  doc.setTextColor(...RED_TINT_TEXT)
  doc.setFont('helvetica', 'normal')
  doc.text('GESTÃO DE PRODUÇÃO · Relatório de Transferências', textX, 38)

  doc.setFontSize(9)
  doc.setTextColor(...RED_TINT_TEXT)
  doc.setFont('helvetica', 'normal')
  doc.text(periodoLabel, pageWidth - margin, 38, { align: 'right' })

  let cursorY = 80

  if (transferencias.length === 0) {
    doc.setFontSize(11)
    doc.setTextColor(156, 163, 175)
    doc.text('Nenhuma transferência encontrada para o filtro selecionado.', pageWidth / 2, 120, { align: 'center' })
  } else {
    const porEmpresa = new Map<string, Movimento[]>()
    for (const m of transferencias) {
      const empresa = m.empresaDestino || 'Sem destino'
      if (!porEmpresa.has(empresa)) porEmpresa.set(empresa, [])
      porEmpresa.get(empresa)!.push(m)
    }

    for (const [empresa, movs] of [...porEmpresa.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      if (cursorY > pageHeight - 90) { doc.addPage(); cursorY = 44 }

      doc.setFillColor(...RED_LIGHT)
      doc.roundedRect(margin, cursorY - 11, pageWidth - margin * 2, 18, 3, 3, 'F')
      doc.setFontSize(10)
      doc.setTextColor(...RED)
      doc.setFont('helvetica', 'bold')
      doc.text(empresa, margin + 8, cursorY + 1)

      autoTable(doc, {
        startY: cursorY + 11,
        margin: { left: margin, right: margin },
        head: [['Modelo', 'Quantidade', 'Data']],
        body: movs
          .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
          .map(m => [m.produtoNome, String(m.qtd), fmtDate(m.data)]),
        headStyles: { fillColor: RED, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 8, cellPadding: 3.5, textColor: [55, 65, 81] },
        theme: 'grid',
      })

      cursorY = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cursorY) + 18
    }
  }

  const pageCount = doc.getNumberOfPages()
  const now = new Date()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.5)
    doc.line(margin, pageHeight - 28, pageWidth - margin, pageHeight - 28)
    doc.setFontSize(7.5)
    doc.setTextColor(156, 163, 175)
    doc.setFont('helvetica', 'normal')
    doc.text('Ultralight · Gestão de Produção', margin, pageHeight - 16)
    doc.text(
      `Gerado em ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')} · Página ${i}/${pageCount}`,
      pageWidth - margin,
      pageHeight - 16,
      { align: 'right' }
    )
  }

  doc.save(`transferencias_${now.toISOString().slice(0, 10)}.pdf`)
}
