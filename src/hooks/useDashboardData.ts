import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services/productService'
import { clientService } from '@/services/clientService'
import { saleService } from '@/services/saleService'
import { Product, Sale } from '@/types/api.types'

interface DashboardStats {
  totalProducts: number
  totalClients: number
  totalSales: number
  totalRevenue: number
  lowStockCount: number
}

interface UseDashboardDataReturn {
  stats: DashboardStats
  recentSales: Sale[]
  lowStockProducts: Product[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const { 
    data: products = [], 
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorObj,
    refetch: refetchProducts 
  } = useQuery({
    queryKey: ['products', 'dashboard'],
    queryFn: () => productService.getAll(),
  })

  const { 
    data: clients = [], 
    isLoading: clientsLoading,
    isError: clientsError,
    error: clientsErrorObj,
    refetch: refetchClients 
  } = useQuery({
    queryKey: ['clients', 'dashboard'],
    queryFn: () => clientService.getAll(),
  })

  const { 
    data: sales = [], 
    isLoading: salesLoading,
    isError: salesError,
    error: salesErrorObj,
    refetch: refetchSales 
  } = useQuery({
    queryKey: ['sales', 'dashboard'],
    queryFn: () => saleService.getAll(),
  })

  // Calcular estadísticas
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const lowStockProducts = products.filter(p => p.stock < 10)
  const recentSales = sales.slice(-5).reverse()

  const stats: DashboardStats = {
    totalProducts: products.length,
    totalClients: clients.length,
    totalSales: sales.length,
    totalRevenue,
    lowStockCount: lowStockProducts.length,
  }

  // Combinar estados de loading y error
  const isLoading = productsLoading || clientsLoading || salesLoading
  const isError = productsError || clientsError || salesError
  const error = productsErrorObj || clientsErrorObj || salesErrorObj || null

  // Función para refetch de todos
  const refetch = () => {
    refetchProducts()
    refetchClients()
    refetchSales()
  }

  return {
    stats,
    recentSales,
    lowStockProducts,
    isLoading,
    isError,
    error,
    refetch,
  }
}