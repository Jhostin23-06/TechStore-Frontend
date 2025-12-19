import apiService from './api'
import { Product, CreateProduct, UpdateProduct, ProductFilter } from '@/types/api.types'

export const productService = {
  getAll: (): Promise<Product[]> => 
    apiService.get<Product[]>('/products'),

  getById: (id: number): Promise<Product> => 
    apiService.get<Product>(`/products/${id}`),

  create: (product: CreateProduct): Promise<Product> => 
    apiService.post<Product>('/products', product),

  update: (id: number, product: UpdateProduct): Promise<Product> => 
    apiService.put<Product>(`/products/${id}`, product),

  delete: (id: number): Promise<void> => 
    apiService.delete<void>(`/products/${id}`),

  search: (term: string): Promise<Product[]> => 
    apiService.get<Product[]>(`/products/search?term=${term}`),

  filter: (filter: ProductFilter): Promise<Product[]> => 
    apiService.get<Product[]>('/products/filter', { params: filter }),

  updateStock: (id: number, stock: number): Promise<Product> =>
    apiService.patch<Product>(`/products/${id}/stock`, { stock }),
}