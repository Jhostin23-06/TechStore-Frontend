import { DocumentType } from '@/types/api.types'

export class InvoiceGenerator {
  // Contadores locales (en producción, esto vendría de la BD)
  private static counters = {
    [DocumentType.BOLETA]: 1,
    [DocumentType.FACTURA]: 1
  }

  // Generar número único basado en fecha
  static generateDocumentNumber(type: DocumentType = DocumentType.BOLETA): {
    serie: string
    numero: string
    tipoDocumento: DocumentType
  } {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    
    // Incrementar contador
    const currentNumber = this.counters[type]
    this.counters[type]++
    
    // Formato: B001-202312-000001
    const prefix = type === DocumentType.FACTURA ? 'F' : 'B'
    const serie = `${prefix}001`
    const numero = `${year}${month}${currentNumber.toString().padStart(6, '0')}`
    
    return {
      serie,
      numero,
      tipoDocumento: type
    }
  }

  // Calcular totales (por si el backend no los envía completos)
  static calculateTotals(detalles: any[]) {
    const subtotal = detalles.reduce((sum, detalle) => 
      sum + (detalle.subtotal || detalle.cantidad * detalle.precioUnitario), 0
    )
    const igv = subtotal * 0.18
    const total = subtotal + igv
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      igv: parseFloat(igv.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    }
  }

  // Formatear moneda
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Generar código QR simple (base64 de los datos)
  static generateQRCodeData(sale: any): string {
    const data = {
      ruc: '20601234567',
      tipo: sale.tipoDocumento || DocumentType.BOLETA,
      serie: sale.serie || 'B001',
      numero: sale.numeroDocumento || '000001',
      fecha: sale.fecha,
      total: sale.total,
      hash: btoa(`${sale.id}-${sale.fecha}`).substring(0, 20)
    }
    return btoa(JSON.stringify(data))
  }
}