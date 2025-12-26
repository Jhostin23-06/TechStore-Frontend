// utils/saleEnricher.ts
import { Sale, Client, Product, SaleDetail } from '@/types/api.types'

// Helper functions para crear objetos compatibles
export const createCompatibleProduct = (productoId: number, precioUnitario: number): Product => {
  return {
    id: productoId,
    nombre: `Producto ${productoId}`,
    marca: 'N/A',
    modelo: 'N/A',
    descripcion: 'Producto no especificado',
    precio: precioUnitario,
    stock: 0,
    codigo: `PROD-${productoId}`,
    fechaRegistro: new Date().toISOString(),
    categoriaId: 0,
    categoria: undefined,
    detallesVenta: undefined
  }
}

export const createCompatibleClient = (clientId: number): Client => {
  return {
    id: clientId,
    nombre: 'Cliente Genérico',
    dniRuc: '00000000',
    direccion: 'Sin dirección',
    telefono: '',
    email: '',
    ventas: undefined
  }
}

export const enrichSaleData = (
  sale: Sale, 
  clients: Client[] = [], 
  products: Product[] = []
): Sale => {
  // Buscar cliente
  const cliente = clients.find(c => c.id === sale.clienteId) || 
                  createCompatibleClient(sale.clienteId)
  
  // Enriquecer detalles con productos
  const detallesEnriquecidos: SaleDetail[] = (sale.detalles || []).map(detalle => {
    const producto = products.find(p => p.id === detalle.productoId) || 
                     createCompatibleProduct(detalle.productoId, detalle.precioUnitario)
    
    return {
      ...detalle,
      producto: producto
    }
  })
  
  return {
    ...sale,
    cliente: cliente,
    detalles: detallesEnriquecidos
  }
}

// Clase enriquecedora (opcional, para mayor organización)
export class SaleDataEnricher {
  constructor(
    private clients: Client[] = [],
    private products: Product[] = []
  ) {}

  enrichSale(sale: Sale): Sale {
    return enrichSaleData(sale, this.clients, this.products)
  }

  enrichSales(sales: Sale[]): Sale[] {
    return sales.map(sale => this.enrichSale(sale))
  }
}