import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query'
import { clientService } from '@/services/clientService'
import { Client, CreateClient, UpdateClient } from '@/types/api.types'
import { message } from 'antd'

export const useClients = () => {
  const queryClient = useQueryClient()

  const { 
    data: clients = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAll(),
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (client: CreateClient) => clientService.create(client),
    onSuccess: (data: Client) => {
      message.success('Cliente creado exitosamente')
      // Actualizar la caché agregando el nuevo cliente
      queryClient.setQueryData<Client[]>(['clients'], (old = []) => [...old, data])
    },
    onError: (error: any) => {
      message.error(`Error: ${error.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, client }: { id: number; client: UpdateClient }) => 
      clientService.update(id, client),
    onSuccess: (data: Client, variables) => {
      message.success('Cliente actualizado exitosamente')
      // Actualizar la caché con el cliente actualizado
      queryClient.setQueryData<Client[]>(['clients'], (old = []) =>
        old.map(item => 
          item.id === variables.id ? { ...item, ...data } : item
        )
      )
      // Forzar un refetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
    onError: (error: any) => {
      message.error(`Error: ${error.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientService.delete(id),
    onSuccess: (_, id) => {
      message.success('Cliente eliminado exitosamente')
      // Actualizar la caché removiendo el cliente
      queryClient.setQueryData<Client[]>(['clients'], (old = []) =>
        old.filter(item => item.id !== id)
      )
    },
    onError: (error: any) => {
      message.error(`Error: ${error.message}`)
    },
  })

  return {
    clients,
    isLoading,
    isError,
    error,
    createClient: createMutation.mutateAsync,
    updateClient: (id: number, client: UpdateClient) => 
      updateMutation.mutateAsync({ id, client }),
    deleteClient: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch,
  }
}