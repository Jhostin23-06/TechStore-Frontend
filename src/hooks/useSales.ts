import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query'
import { saleService } from '@/services/saleService'
import { CreateSale, Sale } from '@/types/api.types'
import { message } from 'antd'

export const useSales = () => {
  const queryClient = useQueryClient()

  const { 
    data: sales = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['sales'],
    queryFn: () => saleService.getAll(),
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (sale: CreateSale) => saleService.create(sale),
    onSuccess: (data: Sale) => {
      message.success('Venta registrada exitosamente')
      // Actualizar la caché agregando la nueva venta
      queryClient.setQueryData<Sale[]>(['sales'], (old = []) => [...old, data])
      // Invalidar productos para actualizar stock
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['sales'] })
    },
    onError: (error: any) => {
      message.error(`Error: ${error.message}`)
    },
  })

  return {
    sales,
    isLoading,
    isError,
    error,
    createSale: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    refetch,
  }
}