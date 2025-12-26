// documentService.ts - Versión híbrida (texto + autoTable)
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Sale, DocumentType } from '@/types/api.types'
import { InvoiceGenerator } from './invoiceGenerator'

export class DocumentService {
  static async generateInvoicePDF(sale: Sale): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF('p', 'mm', 'a4')
        const pageWidth = doc.internal.pageSize.width
        const margin = 20
        let y = margin

        // ========== ENCABEZADO ==========
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('TECHSTORE PERÚ', pageWidth / 2, y, { align: 'center' })
        y += 8

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('Av. Tecnología 123, San Isidro, Lima - Perú', pageWidth / 2, y, { align: 'center' })
        y += 5
        doc.text('RUC: 20601234567 | Teléfono: (01) 234-5678', pageWidth / 2, y, { align: 'center' })
        y += 10

        // Tipo de documento usando InvoiceGenerator
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        const docTypeLabel = InvoiceGenerator.getDocumentTypeLabel(sale.tipoDocumento)
        doc.text(docTypeLabel.toUpperCase(), pageWidth / 2, y, { align: 'center' })
        y += 15

        const invoiceData = InvoiceGenerator.generateDocumentNumberForSale(sale)

        // ========== INFORMACIÓN DEL COMPROBANTE (TEXTO SIMPLE) ==========
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('INFORMACIÓN DEL COMPROBANTE', margin, y)
        y += 7

        // Dibujar fondo para la sección
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, y, pageWidth - 2 * margin, 38, 'F')

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')

        // Primera columna (izquierda)
        doc.text(`Serie/Número:`, margin + 5, y + 7)
        doc.text(`${invoiceData.serie}-${invoiceData.numero}`, margin + 40, y + 7)

        doc.text(`Fecha:`, margin + 5, y + 14)
        doc.text(new Date(sale.fecha).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }), margin + 40, y + 14)

        doc.text(`Forma de Pago:`, margin + 5, y + 21)
        doc.text(`${sale.metodoPago?.toUpperCase() || 'EFECTIVO'}`, margin + 40, y + 21)

        // Segunda columna (derecha)
        doc.text(`Cliente:`, pageWidth / 2 + 10, y + 7)
        doc.text(`${sale.cliente?.nombre || 'CLIENTE GENÉRICO'}`, pageWidth / 2 + 35, y + 7)

        doc.text(`DNI/RUC:`, pageWidth / 2 + 10, y + 14)
        doc.text(`${sale.cliente?.dniRuc || '00000000'}`, pageWidth / 2 + 35, y + 14)

        doc.text(`Dirección:`, pageWidth / 2 + 10, y + 21)
        doc.text(`${sale.cliente?.direccion || 'LIMA, PERÚ'}`, pageWidth / 2 + 35, y + 21)

        doc.text(`Teléfono:`, pageWidth / 2 + 10, y + 28)
        doc.text(`${sale.cliente?.telefono || 'No registrado'}`, pageWidth / 2 + 35, y + 28)

        y += 45 // Avanzar posición Y después de la sección de información

        // ========== TABLA DE PRODUCTOS (CON autoTable) ==========
        const productsData = sale.detalles?.map(detalle => [
          detalle.cantidad.toString(),
          detalle.producto?.nombre || `Producto ${detalle.productoId}`,
          `S/. ${detalle.precioUnitario.toFixed(2)}`,
          `S/. ${(detalle.subtotal || detalle.cantidad * detalle.precioUnitario).toFixed(2)}`
        ]) || []

        autoTable(doc, {
          startY: y,
          head: [['CANT.', 'DESCRIPCIÓN', 'P. UNITARIO', 'TOTAL']],
          body: productsData,
          theme: 'grid',
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontSize: 11,
            halign: 'center',
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 10,
            cellPadding: 4
          },
          columnStyles: {
            0: { cellWidth: 20, halign: 'center' },
            1: { cellWidth: 90 },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' }
          },
          margin: { left: margin, right: margin }
        })

        // Obtener posición después de la tabla
        const yAfterProducts = (doc as any).lastAutoTable?.finalY || y + 50

        // ========== CÁLCULO DE TOTALES CORREGIDO ==========
        // Calcular subtotal (suma de todos los items)
        const subtotal = sale.detalles?.reduce((sum, detalle) => {
          const itemTotal = detalle.subtotal || (detalle.cantidad * detalle.precioUnitario)
          return sum + itemTotal
        }, 0) || 0

        console.log('📊 Cálculos:')
        console.log('Subtotal calculado:', subtotal)
        console.log('Total en venta:', sale.total)

        // Calcular IGV (18% del subtotal)
        const igv = subtotal * 0.18

        // IMPORTANTE: Para boletas, el total DEBE ser subtotal + igv
        // No confiar en sale.total si es una boleta
        const totalFinal = sale.tipoDocumento === DocumentType.FACTURA
          ? (sale.total || subtotal + igv)  // Para facturas, usar sale.total si existe
          : subtotal + igv                  // Para boletas, siempre calcular

        console.log('IGV (18%):', igv)
        console.log('Total final:', totalFinal)

        // Dibujar fondo para totales
        const totalsX = pageWidth - margin - 90
        const totalsY = yAfterProducts + 10

        doc.setFillColor(240, 240, 240)
        doc.rect(totalsX - 5, totalsY - 7, 90, 28, 'F')

        // Borde
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.5)
        doc.rect(totalsX - 5, totalsY - 7, 90, 28)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')

        // Subtotal (Operación Gravada)
        doc.text('OP. GRAVADA:', totalsX, totalsY)
        doc.text(`S/. ${subtotal.toFixed(2)}`, totalsX + 70, totalsY, { align: 'right' })

        // IGV (18%)
        doc.text('I.G.V. (18%):', totalsX, totalsY + 7)
        doc.text(`S/. ${igv.toFixed(2)}`, totalsX + 70, totalsY + 7, { align: 'right' })

        // Línea separadora
        doc.setDrawColor(150, 150, 150)
        doc.setLineWidth(0.3)
        doc.line(totalsX - 5, totalsY + 11, totalsX + 85, totalsY + 11)

        // Total final
        doc.setFontSize(12)
        doc.text('TOTAL:', totalsX, totalsY + 16)
        doc.text(`S/. ${totalFinal.toFixed(2)}`, totalsX + 70, totalsY + 16, { align: 'right' })

        // ========== PIE DE PÁGINA ==========
        const footerY = doc.internal.pageSize.height - 20

        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100)

        const footerLines = [
          'Representación impresa del comprobante de pago electrónico',
          'Autorizado mediante Resolución de Intendencia N° 034-005-0004434/SUNAT',
          `Documento generado el: ${new Date().toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`,
          `ID Transacción: ${sale.id.toString().padStart(8, '0')}`
        ]

        footerLines.forEach((line, index) => {
          doc.text(line, pageWidth / 2, footerY + (index * 4), { align: 'center' })
        })

        // ========== GENERAR BLOB ==========
        const pdfBlob = doc.output('blob')
        resolve(pdfBlob)

      } catch (error) {
        console.error('Error generando PDF:', error)
        reject(error)
      }
    })
  }

  static downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  static printPDF(blob: Blob) {
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  static openInNewTab(blob: Blob) {
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }
}