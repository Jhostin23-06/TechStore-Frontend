// Tipos basados en las entidades C#

export interface Category {
  id: number
  nombre: string
  descripcion: string
  productos?: Product[]
}

export interface Client {
  id: number
  nombre: string
  dniRuc: string
  direccion: string
  telefono: string
  email: string
  ventas?: Sale[]
}

export interface Product {
  id: number
  categoriaId: number
  nombre: string
  marca: string
  modelo: string
  descripcion: string
  precio: number
  stock: number
  codigo: string
  fechaRegistro: string
  categoria?: Category
  detallesVenta?: SaleDetail[]
  
}

export interface Sale {
  id: number
  clienteId: number
  fecha: string
  total: number
  metodoPago: string
  cliente?: Client
  detalles: SaleDetail[]
  tipoDocumento?: DocumentType
  serie?: string
  numeroDocumento?: string
}

export interface SaleDetail {
  id: number
  ventaId: number
  productoId: number
  cantidad: number
  precioUnitario: number
  subtotal: number
  venta?: Sale
  producto?: Product
}

export interface CreateSaleDetail {
  productoId: number
  cantidad: number
  precioUnitario: number
  tipoDocumento?: DocumentType
}

// Tipo para venta al crear
export interface CreateSale {
  clienteId: number
  metodoPago: string
  detalles: CreateSaleDetail[]
  tipoDocumento?: DocumentType
}

// Tipo para venta al actualizar
export interface UpdateSale {
  id: number
  clienteId?: number
  metodoPago?: string
  detalles?: UpdateSaleDetail[]
}

// Tipo para detalle de venta al actualizar
export interface UpdateSaleDetail {
  id?: number
  productoId?: number
  cantidad?: number
  precioUnitario?: number
}

// Tipos para formularios
export type CreateCategory = Omit<Category, 'id' | 'productos'>
export type UpdateCategory = Omit<Category, 'productos'>

export type CreateClient = Omit<Client, 'id' | 'ventas'>
export type UpdateClient = Omit<Client, 'ventas'>

export type CreateProduct = Omit<Product, 'id' | 'categoria' | 'detallesVenta' | 'fechaRegistro'>
export type UpdateProduct = Omit<Product, 'categoria' | 'detallesVenta' | 'fechaRegistro'>

// export type CreateSale = Omit<Sale, 'id' | 'fecha' | 'total' | 'cliente'> & {
//   detalles: Omit<SaleDetail, 'id' | 'ventaId' | 'subtotal' | 'venta' | 'producto'>[]
// }
// export type UpdateSale = Omit<Sale, 'fecha' | 'total' | 'cliente'>

// Type guard para diferenciar entre Create y Update
export function isUpdateProduct(product: CreateProduct | UpdateProduct): product is UpdateProduct {
  return 'id' in product
}

export function isCreateProduct(product: CreateProduct | UpdateProduct): product is CreateProduct {
  return !('id' in product)
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  data?: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Enums
export enum PaymentMethod {
  CASH = 'efectivo',
  CARD = 'tarjeta',
  TRANSFER = 'transferencia'
}

export enum DocumentType {
  BOLETA = 'boleta',
  FACTURA = 'factura'
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock'
}

// Tipos para filtros
export interface ProductFilter {
  categoriaId?: number
  minPrice?: number
  maxPrice?: number
  searchTerm?: string
}

export interface SaleFilter {
  fechaDesde?: string
  fechaHasta?: string
  clienteId?: number
}