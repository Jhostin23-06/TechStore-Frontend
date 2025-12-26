// Tipos para reportes
export interface TopSellingProduct {
  producto: string
  totalVendido: number
}

export interface LowStockProduct {
  id: number
  nombre: string
  marca: string
  modelo: string
  precio: number
  stock: number
  categoriaId: number
  codigo: string
  descripcion: string
  fechaRegistro: string
}

export interface IncomeByCategory {
  categoria: string
  ingresos: number
}

export interface PriceVariation {
  producto: string
  precioActual: number
}

export interface ProductWithoutCategory {
  id: number
  nombre: string
  marca: string
  modelo: string
  precio: number
  stock: number
  categoriaId: number
  codigo: string
  descripcion: string
  fechaRegistro: string
}

// Filtros para reportes
export interface ReportFilter {
  startDate?: string
  endDate?: string
  categoryId?: number
  threshold?: number
}

// Estadísticas generales
export interface SalesStatistics {
  totalSales: number
  totalRevenue: number
  averageTicket: number
  bestSellingProduct: string
  bestSellingCategory: string
}

// Para gráficos
export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
    borderWidth?: number
  }>
}