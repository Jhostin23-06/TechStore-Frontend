import apiService from './api'
import { Sale, CreateSale, SaleFilter } from '@/types/api.types'

export const saleService = {
  getAll: (): Promise<Sale[]> => 
    apiService.get<Sale[]>('/sales'),

  getById: (id: number): Promise<Sale> => 
    apiService.get<Sale>(`/sales/${id}`),

  create: (sale: CreateSale): Promise<Sale> => 
    apiService.post<Sale>('/sales', sale),

  filter: (filter: SaleFilter): Promise<Sale[]> =>
    apiService.get<Sale[]>('/sales/filter', { params: filter }),

  getByDateRange: (start: string, end: string): Promise<Sale[]> =>
    apiService.get<Sale[]>(`/sales/range?start=${start}&end=${end}`),

  getByClient: (clientId: number): Promise<Sale[]> =>
    apiService.get<Sale[]>(`/sales/client/${clientId}`),
}