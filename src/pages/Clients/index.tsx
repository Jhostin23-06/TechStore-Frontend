import React, { useState } from 'react'
import { Button, Card, Table, Input, Popconfirm, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useClients } from '@/hooks/useClients'
import ClientForm from '@/components/clients/ClientForm'
import { Client, CreateClient, UpdateClient } from '@/types/api.types'
import QueryBoundary from '@/components/common/QueryBoundary'

const { Search } = Input

const ClientsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | undefined>()
  const [searchText, setSearchText] = useState('')

  const { 
    clients, 
    isLoading, 
    isError, 
    error, 
    createClient, 
    updateClient, 
    deleteClient,
    isCreating,
    isUpdating,
    isDeleting,
    refetch 
  } = useClients()

  const filteredClients = clients.filter(client =>
    client.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
    client.dniRuc.includes(searchText) ||
    client.email.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleCreate = () => {
    setEditingClient(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteClient(id)
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  const handleSubmit = async (data: CreateClient | UpdateClient) => {
    try {
      if ('id' in data) {
        await updateClient(data.id, data)
      } else {
        await createClient(data)
      }
      setIsModalOpen(false)
      setEditingClient(undefined)
    } catch (error: any) {
      console.error('Error saving client:', error)
    }
  }

  const columns = [
    {
      title: 'DNI/RUC',
      dataIndex: 'dniRuc',
      key: 'dniRuc',
      width: 120,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (_: any, record: Client) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-blue-600"
          />
          <Popconfirm
            title="¿Eliminar cliente?"
            description="Esta acción no se puede deshacer"
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
            <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
            <p className="text-gray-600">Gestiona tu lista de clientes</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="middle"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Nuevo Cliente
          </Button>
        </div>

        <Card>
          <div className="mb-4">
            <Search
              placeholder="Buscar clientes..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Table
            columns={columns}
            dataSource={filteredClients}
            rowKey="id"
            loading={isLoading || isDeleting}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        <ClientForm
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingClient(undefined)
          }}
          client={editingClient}
          onSubmit={handleSubmit}
          isSubmitting={isCreating || isUpdating}
        />
      </div>
    </QueryBoundary>
  )
}

export default ClientsPage