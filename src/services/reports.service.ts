import apiService from './api'
import {
  TopSellingProduct,
  LowStockProduct,
  IncomeByCategory,
  PriceVariation,
  ProductWithoutCategory,
  ReportFilter,
  SalesStatistics
} from '@/types/reports.types'

export const reportsService = {
  // Productos más vendidos
  getTopSellingProducts: (): Promise<TopSellingProduct[]> =>
    apiService.get<TopSellingProduct[]>('/reports/top-selling'),

  // Productos sin categoría
  getProductsWithoutCategory: (): Promise<ProductWithoutCategory[]> =>
    apiService.get<ProductWithoutCategory[]>('/reports/without-category'),

  // Productos con bajo stock
  getLowStockProducts: (threshold: number = 5): Promise<LowStockProduct[]> =>
    apiService.get<LowStockProduct[]>(`/reports/low-stock?threshold=${threshold}`),

  // Ingresos por categoría
  getIncomeByCategory: (): Promise<IncomeByCategory[]> =>
    apiService.get<IncomeByCategory[]>('/reports/income-by-category'),

  // Variación de precios
  getPriceVariation: (): Promise<PriceVariation[]> =>
    apiService.get<PriceVariation[]>('/reports/price-variation'),

  // Método para descargar reportes
  downloadReport: async (reportType: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<Blob> => {
    const response = await apiService.get(`/reports/download/${reportType}`, {
      responseType: 'blob',
      params: { format }
    })
    return response as Blob
  }
}