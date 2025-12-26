// services/saleService.ts
import apiService from './api'
import { Sale, CreateSale, SaleFilter, Client, Product } from '@/types/api.types'

export const saleService = {
  // Obtener todas las ventas con datos enriquecidos
  getAll: async (): Promise<Sale[]> => {
    try {
      const sales = await apiService.get<Sale[]>('/sales')
      
      // Si necesitas datos adicionales, puedes hacer llamadas paralelas
      // Pero idealmente tu backend debería incluir las relaciones
      return sales
    } catch (error) {
      console.error('Error fetching sales:', error)
      throw error
    }
  },

  // Crear venta
  create: (sale: CreateSale): Promise<Sale> => 
    apiService.post<Sale>('/sales', sale),

  // Obtener venta por ID con datos enriquecidos
  getById: async (id: number): Promise<Sale> => {
    const sale = await apiService.get<Sale>(`/sales/${id}`)
    // Aquí podrías enriquecer los datos si tu backend no lo hace
    return sale
  },

  // Función para enriquecer datos de venta (opcional, solo si es necesario)
  enrichSaleData: async (sale: Sale): Promise<Sale> => {
    // Esta función podría llamar a otros servicios para obtener datos faltantes
    return sale
  },

  filter: (filter: SaleFilter): Promise<Sale[]> =>
    apiService.get<Sale[]>('/sales/filter', { params: filter }),

  getByDateRange: (start: string, end: string): Promise<Sale[]> =>
    apiService.get<Sale[]>(`/sales/range?start=${start}&end=${end}`),

  getByClient: (clientId: number): Promise<Sale[]> =>
    apiService.get<Sale[]>(`/sales/client/${clientId}`),
}