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

export async function baixarTransferenciasPdf(transferencias: Movimento[], periodoLabel: string) {
  const logo = await loadLogo()

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth  = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40

  // ── Cabeçalho com logo e nome do sistema ──
  doc.setFillColor(15, 45, 94)
  doc.rect(0, 0, pageWidth, 92, 'F')

  if (logo) {
    doc.addImage(logo, 'PNG', margin, 18, 56, 56)
  }

  const textX = logo ? margin + 70 : margin
  doc.setFontSize(20)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('ULTRALIGHT', textX, 44)

  doc.setFontSize(9)
  doc.setTextColor(199, 210, 254)
  doc.setFont('helvetica', 'normal')
  doc.text('GESTÃO DE PRODUÇÃO', textX, 58)

  doc.setFontSize(15)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('Relatório de Transferências', textX, 78)

  doc.setFontSize(10)
  doc.setTextColor(199, 210, 254)
  doc.setFont('helvetica', 'normal')
  doc.text(periodoLabel, pageWidth - margin, 78, { align: 'right' })

  let cursorY = 122

  if (transferencias.length === 0) {
    doc.setFontSize(11)
    doc.setTextColor(156, 163, 175)
    doc.text('Nenhuma transferência encontrada para o filtro selecionado.', pageWidth / 2, 160, { align: 'center' })
  } else {
    const porEmpresa = new Map<string, Movimento[]>()
    for (const m of transferencias) {
      const empresa = m.empresaDestino || 'Sem destino'
      if (!porEmpresa.has(empresa)) porEmpresa.set(empresa, [])
      porEmpresa.get(empresa)!.push(m)
    }

    for (const [empresa, movs] of [...porEmpresa.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      if (cursorY > pageHeight - 120) { doc.addPage(); cursorY = 50 }

      doc.setFillColor(238, 242, 255)
      doc.roundedRect(margin, cursorY - 14, pageWidth - margin * 2, 22, 4, 4, 'F')
      doc.setFontSize(12)
      doc.setTextColor(15, 45, 94)
      doc.setFont('helvetica', 'bold')
      doc.text(empresa, margin + 10, cursorY + 1)

      autoTable(doc, {
        startY: cursorY + 14,
        margin: { left: margin, right: margin },
        head: [['Modelo', 'Quantidade', 'Data']],
        body: movs
          .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
          .map(m => [m.produtoNome, String(m.qtd), fmtDate(m.data)]),
        headStyles: { fillColor: [15, 45, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 9, cellPadding: 6 },
        theme: 'grid',
      })

      cursorY = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cursorY) + 34
    }
  }

  const pageCount = doc.getNumberOfPages()
  const now = new Date()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.5)
    doc.line(margin, pageHeight - 34, pageWidth - margin, pageHeight - 34)
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.setFont('helvetica', 'normal')
    doc.text('Ultralight · Gestão de Produção', margin, pageHeight - 20)
    doc.text(
      `Gerado em ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')} · Página ${i}/${pageCount}`,
      pageWidth - margin,
      pageHeight - 20,
      { align: 'right' }
    )
  }

  doc.save(`transferencias_${now.toISOString().slice(0, 10)}.pdf`)
}
