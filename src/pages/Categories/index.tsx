import React, { useState } from 'react'
import { Button, Card, Table, Input, Popconfirm, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useCategories } from '@/hooks/useCategories'
import CategoryForm from '@/components/categories/CategoryForm'
import { Category, CreateCategory, UpdateCategory } from '@/types/api.types'
import QueryBoundary from '@/components/common/QueryBoundary'

const { Search } = Input

const CategoriesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const [searchText, setSearchText] = useState('')

  const { 
    categories, 
    isLoading, 
    isError, 
    error, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
    refetch 
  } = useCategories()

  const filteredCategories = categories.filter(category =>
    category.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
    category.descripcion.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleCreate = () => {
    setEditingCategory(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id)
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleSubmit = async (data: CreateCategory | UpdateCategory) => {
    try {
      if ('id' in data) {
        await updateCategory(data.id, data)
      } else {
        await createCategory(data)
      }
      setIsModalOpen(false)
      setEditingCategory(undefined)
    } catch (error: any) {
      console.error('Error saving category:', error)
    }
  }

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a: Category, b: Category) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: true,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (_: any, record: Category) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-blue-600"
          />
          <Popconfirm
            title="¿Eliminar categoría?"
            description="Los productos de esta categoría quedarán sin categoría"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <QueryBoundary 
      isLoading={isLoading} 
      isError={isError} 
      error={error} 
      onRetry={refetch}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
            <p className="text-gray-600">Organiza tus productos por categorías</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="middle"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Nueva Categoría
          </Button>
        </div>

        <Card>
          <div className="mb-4">
            <Search
              placeholder="Buscar categorías..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Table
            columns={columns}
            dataSource={filteredCategories}
            rowKey="id"
            loading={isLoading || isDeleting}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
          />
        </Card>

        <CategoryForm
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCategory(undefined)
          }}
          category={editingCategory}
          onSubmit={handleSubmit}
          isSubmitting={isCreating || isUpdating}
        />
      </div>
    </QueryBoundary>
  )
}

export default CategoriesPage