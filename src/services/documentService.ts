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
        
        // ========== ENCABEZADO ==========
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text('TECHSTORE PERÚ', pageWidth / 2, margin, { align: 'center' })
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('Av. Tecnología 123, San Isidro, Lima - Perú', pageWidth / 2, margin + 8, { align: 'center' })
        doc.text('RUC: 20601234567 | Teléfono: (01) 234-5678', pageWidth / 2, margin + 14, { align: 'center' })
        
        // Tipo de documento
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        const docType = sale.tipoDocumento === DocumentType.FACTURA ? 'FACTURA' : 'BOLETA DE VENTA'
        doc.text(docType, pageWidth / 2, margin + 25, { align: 'center' })
        
        // ========== INFORMACIÓN DEL COMPROBANTE ==========
        const docInfo = [
          [`Serie/Número:`, `${sale.serie || 'B001'}-${sale.numeroDocumento || '000001'}`],
          [`Fecha Emisión:`, new Date(sale.fecha).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })],
          [`Cliente:`, sale.cliente?.nombre || 'CLIENTE GENÉRICO'],
          [`Documento:`, sale.cliente?.dniRuc || '00000000'],
          [`Dirección:`, sale.cliente?.direccion || 'LIMA, PERÚ'],
          [`Forma de Pago:`, sale.metodoPago?.toUpperCase() || 'EFECTIVO']
        ]
        
        autoTable(doc, {
          startY: margin + 35,
          head: [['INFORMACIÓN DEL COMPROBANTE']],
          body: docInfo,
          theme: 'grid',
          headStyles: { 
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontSize: 11
          },
          styles: { fontSize: 10 },
          margin: { left: margin, right: margin }
        })
        
        // ========== DETALLE DE PRODUCTOS ==========
        const productsData = sale.detalles?.map(detalle => [
          detalle.cantidad.toString(),
          detalle.producto?.nombre || `Producto ${detalle.productoId}`,
          `S/. ${detalle.precioUnitario.toFixed(2)}`,
          `S/. ${(detalle.subtotal || detalle.cantidad * detalle.precioUnitario).toFixed(2)}`
        ]) || []
        
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 10,
          head: [['CANT.', 'DESCRIPCIÓN', 'P. UNITARIO', 'TOTAL']],
          body: productsData,
          theme: 'grid',
          headStyles: { 
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontSize: 11
          },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 90 },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' }
          },
          styles: { fontSize: 10 },
          margin: { left: margin, right: margin }
        })
        
        // ========== TOTALES ==========
        const subtotal = sale.detalles?.reduce((sum, detalle) => 
          sum + (detalle.subtotal || detalle.cantidad * detalle.precioUnitario), 0
        ) || 0
        
        const igv = subtotal * 0.18
        const total = sale.total || subtotal + igv
        
        const totalsData = [
          ['OP. GRAVADA:', `S/. ${subtotal.toFixed(2)}`],
          ['I.G.V. (18%):', `S/. ${igv.toFixed(2)}`],
          ['TOTAL:', `S/. ${total.toFixed(2)}`]
        ]
        
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 5,
          body: totalsData,
          theme: 'plain',
          styles: { 
            fontSize: 11,
            textColor: [0, 0, 0]
          },
          columnStyles: {
            0: { cellWidth: 40, fontStyle: 'bold', halign: 'right' },
            1: { cellWidth: 40, fontStyle: 'bold', halign: 'right' }
          },
          margin: { left: pageWidth - 100 }
        })
        
        // ========== PIE DE PÁGINA ==========
        const footerY = doc.internal.pageSize.height - 30
        
        doc.setFontSize(8)
        doc.setTextColor(100)
        doc.text(
          'Representación impresa del comprobante de pago electrónico',
          pageWidth / 2,
          footerY,
          { align: 'center' }
        )
        
        doc.text(
          'Autorizado mediante Resolución de Intendencia N° 034-005-0004434/SUNAT',
          pageWidth / 2,
          footerY + 5,
          { align: 'center' }
        )
        
        // Código Hash (simulado)
        const hash = InvoiceGenerator.generateQRCodeData(sale)
        doc.text(
          `Código Hash: ${hash.substring(0, 30)}...`,
          pageWidth / 2,
          footerY + 10,
          { align: 'center' }
        )
        
        doc.text(
          `N° ${sale.id.toString().padStart(8, '0')}`,
          pageWidth / 2,
          footerY + 15,
          { align: 'center' }
        )
        
        // ========== GENERAR BLOB ==========
        const pdfBlob = doc.output('blob')
        resolve(pdfBlob)
      } catch (error) {
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