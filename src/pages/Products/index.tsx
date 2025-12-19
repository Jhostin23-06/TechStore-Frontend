import React, { useState, useMemo } from 'react'
import { Button, Card, Space, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ProductTable from '@/components/products/ProductTable'
import ProductForm from '@/components/products/ProductForm'
import AdvancedFilters, { FilterField } from '@/components/common/AdvancedFilters'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { Product, CreateProduct, UpdateProduct } from '@/types/api.types'
import QueryBoundary from '@/components/common/QueryBoundary'
import { useTheme } from '@/contexts/ThemeContext' // Importar el hook

const ProductsPage: React.FC = () => {
  const { mode } = useTheme() // Obtener el modo actual
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()
  const [filters, setFilters] = useState<any>({})

  const { 
    products, 
    isLoading, 
    isError, 
    error, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    isCreating,
    isUpdating,
    isDeleting,
    refetch 
  } = useProducts()

  const { categories } = useCategories()

  // Clases dinámicas basadas en el modo
  const textPrimary = mode === 'dark' ? 'text-gray-100' : 'text-gray-800'
  const textSecondary = mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const cardBg = mode === 'dark' ? 'bg-gray-800' : 'bg-white'
  const cardBorder = mode === 'dark' ? 'border-gray-700' : 'border-gray-200'
  const buttonPrimary = mode === 'dark' 
    ? 'bg-blue-700 hover:bg-blue-600 border-blue-600' 
    : 'bg-blue-600 hover:bg-blue-700 border-blue-600'

  // Definir campos de filtro
  const filterFields: FilterField[] = [
    {
      name: 'search',
      label: 'Buscar',
      type: 'text',
      placeholder: 'Buscar por nombre, código o marca',
    },
    {
      name: 'categoriaId',
      label: 'Categoría',
      type: 'select',
      options: categories.map(cat => ({
        label: cat.nombre,
        value: cat.id,
      })),
    },
    {
      name: 'minPrice',
      label: 'Precio Mínimo',
      type: 'number',
      placeholder: 'Precio mínimo',
    },
    {
      name: 'maxPrice',
      label: 'Precio Máximo',
      type: 'number',
      placeholder: 'Precio máximo',
    },
    {
      name: 'minStock',
      label: 'Stock Mínimo',
      type: 'number',
      placeholder: 'Stock mínimo',
    },
    {
      name: 'maxStock',
      label: 'Stock Máximo',
      type: 'number',
      placeholder: 'Stock máximo',
    },
  ]

  // Filtrar productos según los filtros aplicados
  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      result = result.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm) ||
        product.codigo.toLowerCase().includes(searchTerm) ||
        product.marca.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.categoriaId) {
      result = result.filter(product => 
        product.categoriaId === parseInt(filters.categoriaId)
      )
    }

    if (filters.minPrice) {
      result = result.filter(product => 
        product.precio >= parseFloat(filters.minPrice)
      )
    }

    if (filters.maxPrice) {
      result = result.filter(product => 
        product.precio <= parseFloat(filters.maxPrice)
      )
    }

    if (filters.minStock) {
      result = result.filter(product => 
        product.stock >= parseInt(filters.minStock)
      )
    }

    if (filters.maxStock) {
      result = result.filter(product => 
        product.stock <= parseInt(filters.maxStock)
      )
    }

    return result
  }, [products, filters])

  const handleCreate = () => {
    setEditingProduct(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleSubmit = async (data: CreateProduct | UpdateProduct) => {
    try {
      if ('id' in data) {
        await updateProduct(data.id, data)
      } else {
        await createProduct(data)
      }
      setIsModalOpen(false)
      setEditingProduct(undefined)
    } catch (error: any) {
      message.error(error.message || 'Error al guardar el producto')
    }
  }

  const handleFilter = (values: any) => {
    console.log('Filtros aplicados:', values)
    setFilters(values)
  }

  const handleResetFilters = () => {
    setFilters({})
  }

  return (
    <QueryBoundary 
      isLoading={isLoading} 
      isError={isError} 
      error={error} 
      onRetry={refetch}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Productos</h1>
            <p className={textSecondary}>
              Mostrando {filteredProducts.length} de {products.length} productos
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="middle"
            className={buttonPrimary}
          >
            Nuevo Producto
          </Button>
        </div>

        {/* Filtros Avanzados */}
        <div className="mb-6">
          <AdvancedFilters
            fields={filterFields}
            onFilter={handleFilter}
            onReset={handleResetFilters}
            loading={isLoading}
          />
        </div>

        <Card className={`${cardBg} ${cardBorder}`}>
          <ProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isDeleting}
          />
        </Card>

        <ProductForm
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingProduct(undefined)
          }}
          product={editingProduct}
          onSubmit={handleSubmit}
          isSubmitting={isCreating || isUpdating}
          categories={categories}
        />
      </div>
    </QueryBoundary>
  )
}

export default ProductsPage