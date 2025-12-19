import apiService from './api'
import { Category, CreateCategory, UpdateCategory } from '@/types/api.types'

export const categoryService = {
  getAll: (): Promise<Category[]> => 
    apiService.get<Category[]>('/categories'),

  getById: (id: number): Promise<Category> => 
    apiService.get<Category>(`/categories/${id}`),

  create: (category: CreateCategory): Promise<Category> => 
    apiService.post<Category>('/categories', category),

  update: (id: number, category: UpdateCategory): Promise<Category> => 
    apiService.put<Category>(`/categories/${id}`, category),

  delete: (id: number): Promise<void> => 
    apiService.delete<void>(`/categories/${id}`),

  getWithProducts: (id: number): Promise<Category> =>
    apiService.get<Category>(`/categories/${id}/products`),
}