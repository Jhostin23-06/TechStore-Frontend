import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query'
import { categoryService } from '@/services/categoryService'
import { Category, CreateCategory, UpdateCategory } from '@/types/api.types'
import { message } from 'antd'

export const useCategories = () => {
  const queryClient = useQueryClient()

  const { 
    data: categories = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (category: CreateCategory) => categoryService.create(category),
    onSuccess: (data: Category) => {
      message.success('Categoría creada exitosamente')
      // Actualizar la caché agregando la nueva categoría
      queryClient.setQueryData<Category[]>(['categories'], (old = []) => [...old, data])
    },
    onError: (error: any) => {
      message.error(`Error: ${error.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, category }: { id: number; category: UpdateCategory }) => 
      categoryService.update(id, category),
    onSuccess: (data: Category, variables) => {
      message.success('Categoría actualizada exitosamente')
      // Actualizar la caché con la categoría actualizada
      queryClient.setQueryData<Category[]>(['categories'], (old = []) =>
        old.map(item => 
          item.id === variables.id ? { ...item, ...data } : item
        )
      )
      // Forzar un refetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error: any) => {
      message.error(`Error: ${error.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: (_, id) => {
      message.success('Categoría eliminada exitosamente')
      // Actualizar la caché removiendo la categoría
      queryClient.setQueryData<Category[]>(['categories'], (old = []) =>
        old.filter(item => item.id !== id)
      )
    },
    onError: (error: any) => {
      message.error(`Error: ${error.message}`)
    },
  })

  return {
    categories,
    isLoading,
    isError,
    error,
    createCategory: createMutation.mutateAsync,
    updateCategory: (id: number, category: UpdateCategory) => 
      updateMutation.mutateAsync({ id, category }),
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch,
  }
}