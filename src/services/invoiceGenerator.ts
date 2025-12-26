import { DocumentType } from '@/types/api.types'
import { Sale } from '@/types/api.types'

export class InvoiceGenerator {
  // Lógica para determinar tipo de documento
  static determineDocumentType(sale: Sale): DocumentType {
    // 1. Si ya tiene tipoDocumento, usarlo
    if (sale.tipoDocumento) {
      const tipo = sale.tipoDocumento.toString().toLowerCase()
      return tipo === 'factura' ? DocumentType.FACTURA : DocumentType.BOLETA
    }
    
    // 2. Determinar por cliente (si tiene RUC -> factura)
    if (sale.cliente?.dniRuc && sale.cliente.dniRuc.length === 11) {
      return DocumentType.FACTURA
    }
    
    // 3. Por monto (si es mayor a cierto monto -> factura)
    const total = sale.total || sale.detalles?.reduce((sum, detalle) => 
      sum + (detalle.subtotal || detalle.cantidad * detalle.precioUnitario), 0
    ) || 0
    
    if (total > 700) { // Ejemplo: Montos mayores a 700 soles son factura
      return DocumentType.FACTURA
    }
    
    // 4. Por defecto: boleta
    return DocumentType.BOLETA
  }
  
  // Generar número basado en ID, fecha y TIPO
  static generateDocumentNumberForSale(sale: Sale): {
    serie: string
    numero: string
    tipoDocumento: DocumentType
  } {
    // Determinar el tipo basado en lógica de frontend
    const tipoDocumento = this.determineDocumentType(sale)

    const fecha = new Date(sale.fecha)
    const year = fecha.getFullYear().toString().slice(-2)
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0')
    const day = fecha.getDate().toString().padStart(2, '0')

    // Usar ID de la venta
    const idNumero = sale.id
      ? sale.id.toString().padStart(6, '0')
      : Date.now().toString().slice(-6)

    // DIFERENCIAR POR TIPO
    let prefix: string
    let serieNumber: string

    if (tipoDocumento === DocumentType.FACTURA) {
      prefix = 'F'
      serieNumber = '001'
      // Para facturas, podríamos usar un formato diferente
      const numero = `${year}${month}${day}F${idNumero}`
      return {
        serie: `${prefix}${serieNumber}`,
        numero,
        tipoDocumento
      }
    } else {
      // Boleta
      prefix = 'B'
      serieNumber = '001'
      const numero = `${year}${month}${day}B${idNumero}`
      return {
        serie: `${prefix}${serieNumber}`,
        numero,
        tipoDocumento
      }
    }
  }

  // Generar número TEMPORAL para nueva venta (antes de tener ID)
  static generateTemporaryNumber(type: DocumentType = DocumentType.BOLETA): {
    serie: string
    numero: string
    tipoDocumento: DocumentType
  } {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')

    // Usar timestamp + random para evitar duplicados
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')

    // Formato: B001-251219-123456
    const prefix = type === DocumentType.FACTURA ? 'F' : 'B'
    const serie = `${prefix}001`
    const numero = `${year}${month}${day}${timestamp.slice(-5)}${random}`

    return {
      serie,
      numero,
      tipoDocumento: type
    }
  }

  // Función de compatibilidad (mantener para no romper código existente)
  static generateDocumentNumber(type: DocumentType = DocumentType.BOLETA): {
    serie: string
    numero: string
    tipoDocumento: DocumentType
  } {
    return this.generateTemporaryNumber(type)
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

  // Formatear número de documento para mostrar
  static formatInvoiceNumber(sale: Sale): string {
    const { serie, numero } = this.generateDocumentNumberForSale(sale)
    return `${serie}-${numero}`
  }

  // Obtener etiqueta del tipo de documento
  static getDocumentTypeLabel(tipoDocumento?: DocumentType | string): string {
    if (!tipoDocumento) return 'Boleta'

    const tipo = tipoDocumento.toString().toLowerCase()
    return tipo === 'factura' || tipo === DocumentType.FACTURA ? 'Factura' : 'Boleta'
  }

  // Generar código QR simple (base64 de los datos)
  static generateQRCodeData(sale: Sale): string {
    const invoiceData = this.generateDocumentNumberForSale(sale)
    const totals = this.calculateTotals(sale.detalles || [])

    const data = {
      ruc: '20601234567',
      tipo: invoiceData.tipoDocumento,
      serie: invoiceData.serie,
      numero: invoiceData.numero,
      fecha: sale.fecha,
      total: sale.total || totals.total,
      cliente: sale.cliente?.nombre || 'Cliente Genérico',
      dni: sale.cliente?.dniRuc || '00000000',
      hash: btoa(`${sale.id}-${sale.fecha}`).substring(0, 20)
    }
    return btoa(JSON.stringify(data))
  }

  // Validar si un número de documento es temporal
  static isTemporaryNumber(numero: string): boolean {
    // Los números temporales tienen más de 8 dígitos después de la fecha
    return numero.length > 14
  }
}