// services/saleTagger.ts
import { Sale, DocumentType } from '@/types/api.types'

export class SaleTagger {
  private static STORAGE_KEY = 'sale_document_types'
  
  // Guardar el tipo de documento para una venta específica
  static setDocumentType(saleId: number, type: DocumentType) {
    const types = this.getDocumentTypes()
    types[saleId] = type
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(types))
  }
  
  // Obtener el tipo de documento para una venta
  static getDocumentType(saleId: number): DocumentType | null {
    const types = this.getDocumentTypes()
    return types[saleId] || null
  }
  
  // Obtener todos los tipos guardados
  private static getDocumentTypes(): Record<number, DocumentType> {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  }
  
  // Etiquetar una venta al crearla
  static tagSale(sale: Sale, type: DocumentType): Sale {
    this.setDocumentType(sale.id, type)
    
    return {
      ...sale,
      tipoDocumento: type,
    }
  }
  
  // Obtener venta etiquetada
  static getTaggedSale(sale: Sale): Sale {
    const savedType = this.getDocumentType(sale.id)
    
    if (savedType) {
      return {
        ...sale,
        tipoDocumento: savedType,
      }
    }
    
    return sale
  }
}