// hooks/useSales.ts
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import { saleService } from '@/services/saleService'
import { Client, CreateSale, DocumentType, Product, Sale, SaleDetail } from '@/types/api.types'
import { message } from 'antd'
import apiService from '@/services/api'
import { InvoiceGenerator } from '@/services/invoiceGenerator'

let defaultDocumentType: DocumentType = DocumentType.BOLETA

export const setDefaultDocumentType = (type: DocumentType) => {
  defaultDocumentType = type
  localStorage.setItem('defaultDocumentType', type)
}

export const getDefaultDocumentType = (): DocumentType => {
  const saved = localStorage.getItem('defaultDocumentType')
  return (saved as DocumentType) || DocumentType.BOLETA
}

const generateInvoiceNumber = (sale: Sale): { serie: string; numero: string } => {
  // Usar el nuevo método que genera basado en ID y fecha
  const invoiceData = InvoiceGenerator.generateDocumentNumberForSale(sale)

  return {
    serie: invoiceData.serie,
    numero: invoiceData.numero
  }
}

// Helper function para crear un Product compatible
const createCompatibleProduct = (productoId: number, precioUnitario: number): Product => {
  return {
    id: productoId,
    nombre: `Producto ${productoId}`,
    marca: 'N/A',
    modelo: 'N/A',
    descripcion: 'Producto no especificado',
    precio: precioUnitario,
    stock: 0,
    codigo: `PROD-${productoId}`,
    fechaRegistro: new Date().toISOString(),
    categoriaId: 0
  }
}

// Helper function para crear un Client compatible
const createCompatibleClient = (clientId: number): Client => {
  return {
    id: clientId,
    nombre: 'Cliente Genérico',
    dniRuc: '00000000',
    direccion: 'Sin dirección',
    telefono: '',
    email: ''
  }
}

// Helper function para crear un SaleDetail compatible
const createCompatibleSaleDetail = (detalle: any, product: Product): SaleDetail => {
  return {
    id: detalle.id || 0,
    ventaId: detalle.ventaId || 0,
    productoId: detalle.productoId,
    cantidad: detalle.cantidad,
    precioUnitario: detalle.precioUnitario,
    subtotal: detalle.subtotal || detalle.cantidad * detalle.precioUnitario,
    producto: product
  }
}

// Helper function para enriquecer datos localmente
const enrichSaleData = (sale: Sale, clients: Client[] = [], products: Product[] = []): Sale => {
  // Buscar cliente en la lista local
  const cliente = clients?.find(c => c.id === sale.clienteId)

  // Enriquecer detalles con productos
  const detallesEnriquecidos: SaleDetail[] = (sale.detalles || []).map(detalle => {
    const producto = products?.find(p => p.id === detalle.productoId) ||
      createCompatibleProduct(detalle.productoId, detalle.precioUnitario)

    return {
      ...detalle,
      producto: producto
    }
  })

  let tipoDocumento = defaultDocumentType

  // Opción 2: Determinar basado en el cliente (si tiene RUC -> factura)
  if (cliente && cliente.dniRuc && cliente.dniRuc.length === 11) {
    // Si tiene 11 dígitos (RUC), podría ser factura
    tipoDocumento = DocumentType.FACTURA
  }

  const metadata = sale as any
  if (metadata._tipoDocumento) {
    tipoDocumento = metadata._tipoDocumento
  }

  const invoiceData = InvoiceGenerator.generateDocumentNumberForSale({
    ...sale,
    tipoDocumento
  })

  return {
    ...sale,
    cliente: cliente || createCompatibleClient(sale.clienteId),
    detalles: detallesEnriquecidos,
    // Usar los datos generados por InvoiceGenerator
    serie: invoiceData.serie,
    numeroDocumento: invoiceData.numero,
    // Asegurar tipoDocumento
    tipoDocumento: invoiceData.tipoDocumento,
    // Agregar metadatos para identificar que esto fue generado en frontend
    // _metadata: {
    //   documentTypeGenerated: true,
    //   generatedAt: new Date().toISOString()
    // }
  }
}

export const useSales = (options?: {
  includeClientData?: boolean
  includeProductData?: boolean
}) => {
  const queryClient = useQueryClient()

  // Obtener clientes y productos para enriquecer datos
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => apiService.get<Client[]>('/clients'),
    enabled: options?.includeClientData !== false,
    staleTime: 10 * 60 * 1000,
  })

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => apiService.get<Product[]>('/products'),
    enabled: options?.includeProductData !== false,
    staleTime: 10 * 60 * 1000,
  })

  const {
    data: sales = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: () => saleService.getAll(),
    staleTime: 5 * 60 * 1000,
    select: (data) => {
      // Si no necesitamos enriquecer datos, retornar tal cual
      if (!options?.includeClientData && !options?.includeProductData) {
        return data
      }

      // Enriquecer datos de ventas
      return data.map(sale => enrichSaleData(sale, clients, products))
    },
  })

  const createMutation = useMutation<Sale, Error, CreateSale>({
    mutationFn: (sale: CreateSale) => saleService.create(sale),
    onSuccess: (data: Sale) => {

      // Enriquecer la nueva venta antes de agregarla al cache
      const enrichedSale = enrichSaleData(data, clients, products)

      // Actualizar la caché agregando la nueva venta enriquecida
      queryClient.setQueryData<Sale[]>(['sales'], (old = []) => [...old, enrichedSale])

      // Invalidar productos para actualizar stock
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
    onError: (error: Error) => {
      message.error(`Error: ${error.message}`)
    },
  })

  // Función para obtener una venta enriquecida por ID
  const getEnrichedSale = (saleId: number): Sale | undefined => {
    const sale = sales.find(s => s.id === saleId)
    if (!sale) return undefined

    return enrichSaleData(sale, clients, products)
  }

  return {
    sales,
    isLoading,
    isError,
    error,
    createSale: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    refetch,
    getEnrichedSale,
    clients,
    products
  }
}