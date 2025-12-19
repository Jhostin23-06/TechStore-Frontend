import apiService from './api'
import { Client, CreateClient, UpdateClient } from '@/types/api.types'

export const clientService = {
  getAll: (): Promise<Client[]> => 
    apiService.get<Client[]>('/clients'),

  getById: (id: number): Promise<Client> => 
    apiService.get<Client>(`/clients/${id}`),

  create: (client: CreateClient): Promise<Client> => 
    apiService.post<Client>('/clients', client),

  update: (id: number, client: UpdateClient): Promise<Client> => 
    apiService.put<Client>(`/clients/${id}`, client),

  delete: (id: number): Promise<void> => 
    apiService.delete<void>(`/clients/${id}`),

  search: (term: string): Promise<Client[]> => 
    apiService.get<Client[]>(`/clients/search?term=${term}`),

  getByDni: (dni: string): Promise<Client | null> =>
    apiService.get<Client | null>(`/clients/dni/${dni}`),
}