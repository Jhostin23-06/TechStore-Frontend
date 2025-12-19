// components/products/ProductTable.tsx
import React from 'react'
import { Table, Tag, Button, Space, Popconfirm, message } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { Product } from '@/types/api.types'
import { useTheme } from '@/contexts/ThemeContext'

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
  isLoading?: boolean
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const { mode } = useTheme()

  // Clases dinámicas basadas en el modo
  const textPrimary = mode === 'dark' ? 'text-gray-100' : 'text-gray-800'
  const textSecondary = mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const hoverBg = mode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
  const lowStockColor = mode === 'dark' ? 'text-red-400' : 'text-red-500'
  const okStockColor = mode === 'dark' ? 'text-green-400' : 'text-green-500'

  const handleDelete = (id: number) => {
    onDelete(id)
    message.success('Producto eliminado correctamente')
  }

  const columns = [
    {
      title: <span className={textSecondary}>ID</span>,
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a: Product, b: Product) => a.id - b.id,
      render: (id: number) => <span className={textPrimary}>{id}</span>,
    },
    {
      title: <span className={textSecondary}>Código</span>,
      dataIndex: 'codigo',
      key: 'codigo',
      render: (codigo: string) => (
        <Tag color={mode === 'dark' ? 'blue' : 'processing'} className="font-mono">
          {codigo}
        </Tag>
      ),
    },
    {
      title: <span className={textSecondary}>Nombre</span>,
      dataIndex: 'nombre',
      key: 'nombre',
      render: (nombre: string, record: Product) => (
        <div>
          <div className={`font-medium ${textPrimary}`}>{nombre}</div>
          <div className={`text-xs ${textSecondary}`}>{record.marca} - {record.modelo || 'Sin modelo'}</div>
        </div>
      ),
    },
    {
      title: <span className={textSecondary}>Categoría</span>,
      key: 'categoria',
      render: (_: any, record: Product) => (
        <Tag color={mode === 'dark' ? 'purple' : 'purple'}>
          {record.categoria?.nombre || 'Sin categoría'}
        </Tag>
      ),
    },
    {
      title: <span className={textSecondary}>Precio</span>,
      dataIndex: 'precio',
      key: 'precio',
      render: (precio: number) => (
        <div className={textPrimary}>
          <span className="font-bold">S/. {precio.toFixed(2)}</span>
        </div>
      ),
      sorter: (a: Product, b: Product) => a.precio - b.precio,
    },
    {
      title: <span className={textSecondary}>Stock</span>,
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number, record: Product) => (
        <div>
          <Tag 
            color={stock === 0 ? (mode === 'dark' ? 'red' : 'error') : 
                   stock < 10 ? (mode === 'dark' ? 'orange' : 'warning') : 
                   (mode === 'dark' ? 'green' : 'success')}
            className={`font-bold ${mode === 'dark' ? 'border-gray-600' : ''}`}
          >
            {stock} unidades
          </Tag>
          {stock < 10 && stock > 0 && (
            <div className={`text-xs mt-1 ${lowStockColor}`}>
              ¡Stock bajo!
            </div>
          )}
          {stock === 0 && (
            <div className={`text-xs mt-1 ${lowStockColor}`}>
              ¡Agotado!
            </div>
          )}
        </div>
      ),
      sorter: (a: Product, b: Product) => a.stock - b.stock,
    },
    {
      title: <span className={textSecondary}>Acciones</span>,
      key: 'actions',
      width: 120,
      render: (_: any, record: Product) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined className={mode === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} />}
            onClick={() => onEdit(record)}
            size="small"
          />
          <Popconfirm
            title="¿Eliminar producto?"
            description="¿Estás seguro de que deseas eliminar este producto?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
            okButtonProps={{
              danger: true,
              className: mode === 'dark' ? 'bg-red-600' : '',
            }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined className={mode === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Table
      dataSource={products}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      pagination={{
        pageSize: 5,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => (
          <span className={textSecondary}>
            {range[0]}-{range[1]} de {total} productos
          </span>
        ),
      }}
      className={`product-table ${mode === 'dark' ? 'dark-table' : ''}`}
      rowClassName={() => `${hoverBg}`}
      scroll={{ x: 800 }}
    />
  )
}

export default ProductTable