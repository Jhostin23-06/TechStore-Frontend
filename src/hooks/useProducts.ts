import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query'
import { productService } from '@/services/productService'
import { Product, CreateProduct, UpdateProduct } from '@/types/api.types'
import { message } from 'antd'

export const useProducts = () => {
  const queryClient = useQueryClient()

  const { 
    data: products = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAll(),
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (product: CreateProduct) => productService.create(product),
    onSuccess: (data: Product) => {
      message.success('Producto creado exitosamente')
      // Actualizar la caché agregando el nuevo producto
      queryClient.setQueryData<Product[]>(['products'], (old = []) => [...(old || []), data])

      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error: any) => {
      message.error(`Error: ${error.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, product }: { id: number; product: UpdateProduct }) => 
      productService.update(id, product),
    onSuccess: (data: Product, variables) => {
      message.success('Producto actualizado exitosamente')
      // Actualizar la caché con el producto actualizado
      queryClient.setQueryData<Product[]>(['products'], (old = []) =>
        old?.map(item => 
          item.id === variables.id ? { ...item, ...data } : item
        ) || []
      )
      // Forzar un refetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error: any) => {
      message.error(`Error: ${error.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: (_, id) => {
      message.success('Producto eliminado exitosamente')
      // Actualizar la caché removiendo el producto
      queryClient.setQueryData<Product[]>(['products'], (old = []) =>
        old?.filter(item => item.id !== id) || []
      )
    },
    onError: (error: any) => {
      message.error(`Error: ${error.message}`)
    },
  })

  return {
    products,
    isLoading,
    isError,
    error,
    createProduct: createMutation.mutateAsync,
    updateProduct: (id: number, product: UpdateProduct) => 
      updateMutation.mutateAsync({ id, product }),
    deleteProduct: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch,
  }
}