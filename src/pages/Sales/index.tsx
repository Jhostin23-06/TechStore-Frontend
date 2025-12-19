import React, { useState } from 'react'
import { Button, Card, Table, Tag, Statistic, Row, Col, Space, DatePicker, message } from 'antd'
import { PlusOutlined, DollarOutlined, FilterOutlined, FileTextOutlined } from '@ant-design/icons'
import { useSales } from '@/hooks/useSales'
import { useClients } from '@/hooks/useClients'
import { useProducts } from '@/hooks/useProducts'
import SaleForm from '@/components/sales/SaleForm'
import InvoiceModal from '@/components/sales/InvoiceModal'
import { Sale, CreateSale, DocumentType } from '@/types/api.types'
import { InvoiceGenerator } from '@/services/invoiceGenerator'
import dayjs from 'dayjs'
import QueryBoundary from '@/components/common/QueryBoundary'
import type { RangePickerProps } from 'antd/es/date-picker'
import { useTheme } from '@/contexts/ThemeContext'

const { RangePicker } = DatePicker

const SalesPage: React.FC = () => {
  const { mode } = useTheme()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  const { 
    sales, 
    isLoading: salesLoading, 
    isError: salesError, 
    error: salesErrorObj, 
    createSale,
    isCreating,
    refetch: refetchSales 
  } = useSales()

  const { clients, isLoading: clientsLoading } = useClients()
  const { products, isLoading: productsLoading } = useProducts()

  // Clases dinámicas basadas en el modo
  const textPrimary = mode === 'dark' ? 'text-gray-100' : 'text-gray-800'
  const textSecondary = mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const cardBg = mode === 'dark' ? 'bg-gray-800' : 'bg-white'
  const cardBorder = mode === 'dark' ? 'border-gray-700' : 'border-gray-200'
  const hoverBg = mode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
  const buttonPrimary = mode === 'dark' 
    ? 'bg-green-700 hover:bg-green-600 border-green-600' 
    : 'bg-green-600 hover:bg-green-700 border-green-600'

  // Filtrar ventas por rango de fechas
  const filteredSales = dateRange 
    ? sales.filter(sale => {
        const saleDate = dayjs(sale.fecha)
        return saleDate.isAfter(dateRange[0]) && saleDate.isBefore(dateRange[1])
      })
    : sales

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const todayRevenue = filteredSales
    .filter(sale => dayjs(sale.fecha).isSame(dayjs(), 'day'))
    .reduce((sum, sale) => sum + sale.total, 0)
  
  // Ventas de hoy
  const todaySales = filteredSales
    .filter(sale => dayjs(sale.fecha).isSame(dayjs(), 'day'))
    .length

  const handleCreate = () => {
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: CreateSale) => {
    try {
      // Enviar venta al backend
      const result = await createSale(data)
      
      // Generar datos de boleta en frontend
      const invoiceData = InvoiceGenerator.generateDocumentNumber(
        data.tipoDocumento || DocumentType.BOLETA
      )
      
      // Crear objeto de venta completo con datos de boleta
      const saleWithInvoice: Sale = {
        ...result,
        tipoDocumento: data.tipoDocumento || DocumentType.BOLETA,
        serie: invoiceData.serie,
        numeroDocumento: invoiceData.numero,
        detalles: result.detalles || [],
        // Los demás campos vienen del backend
      }
      
      message.success('✅ Venta registrada exitosamente')
      setIsModalOpen(false)
      
      // Mostrar boleta después de un breve delay
      setTimeout(() => {
        setSelectedSale(saleWithInvoice)
        setShowInvoice(true)
      }, 300)
      
    } catch (error: any) {
      message.error(`❌ Error: ${error.message || 'No se pudo registrar la venta'}`)
      console.error('Error creating sale:', error)
    }
  }

  // Función para ver boleta de ventas existentes
  const handleViewInvoice = (sale: Sale) => {
    // Si la venta no tiene datos de boleta, generarlos
    const saleWithInvoice: Sale = {
      ...sale,
      tipoDocumento: sale.tipoDocumento || DocumentType.BOLETA,
      serie: sale.serie || 'B001',
      numeroDocumento: sale.numeroDocumento || 
        InvoiceGenerator.generateDocumentNumber().numero,
      detalles: sale.detalles || []
    }
    
    setSelectedSale(saleWithInvoice)
    setShowInvoice(true)
  }

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current > dayjs().endOf('day')
  }

  // Columnas de la tabla
  const columns = [
    {
      title: <span className={textSecondary}>ID</span>,
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => <span className={textPrimary}>{id}</span>,
    },
    {
      title: <span className={textSecondary}>Cliente</span>,
      key: 'cliente',
      render: (_: any, record: Sale) => (
        <div>
          <div className={`font-medium ${textPrimary}`}>
            {record.cliente?.nombre || 'Cliente Genérico'}
          </div>
          <div className={`text-xs ${textSecondary}`}>
            {record.cliente?.dniRuc || 'Sin documento'}
          </div>
        </div>
      ),
    },
    {
      title: <span className={textSecondary}>Fecha</span>,
      dataIndex: 'fecha',
      key: 'fecha',
      render: (date: string) => (
        <div>
          <div className={textPrimary}>
            {dayjs(date).format('DD/MM/YYYY')}
          </div>
          <div className={`text-xs ${textSecondary}`}>
            {dayjs(date).format('HH:mm')}
          </div>
        </div>
      ),
      sorter: (a: Sale, b: Sale) => dayjs(a.fecha).unix() - dayjs(b.fecha).unix(),
    },
    {
      title: <span className={textSecondary}>Documento</span>,
      key: 'documento',
      render: (_: any, record: Sale) => {
        const tipo = record.tipoDocumento === DocumentType.FACTURA ? 'Factura' : 'Boleta'
        const serie = record.serie || 'B001'
        const numero = record.numeroDocumento || '000001'
        
        return (
          <div>
            <Tag color={mode === 'dark' ? 'blue' : 'processing'} className="text-xs">
              {tipo}
            </Tag>
            <div className={`text-xs mt-1 ${textSecondary}`}>
              {serie}-{numero}
            </div>
          </div>
        )
      },
    },
    {
      title: <span className={textSecondary}>Total</span>,
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => (
        <span className={`font-semibold ${mode === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
          S/. {total.toFixed(2)}
        </span>
      ),
      sorter: (a: Sale, b: Sale) => a.total - b.total,
    },
    {
      title: <span className={textSecondary}>Método</span>,
      dataIndex: 'metodoPago',
      key: 'metodoPago',
      render: (method: string) => {
        const tagConfig = {
          efectivo: { color: mode === 'dark' ? 'green' : 'success', text: 'EFECTIVO' },
          tarjeta: { color: mode === 'dark' ? 'blue' : 'processing', text: 'TARJETA' },
          transferencia: { color: mode === 'dark' ? 'purple' : 'purple', text: 'TRANSFERENCIA' }
        }
        
        const config = tagConfig[method as keyof typeof tagConfig] || { 
          color: mode === 'dark' ? 'default' : 'default', 
          text: method?.toUpperCase() || 'EFECTIVO'
        }
        
        return (
          <Tag
            color={config.color}
            className={`capitalize ${mode === 'dark' ? 'border-gray-600' : ''}`}
          >
            {config.text}
          </Tag>
        )
      },
    },
    {
      title: <span className={textSecondary}>Productos</span>,
      key: 'productCount',
      render: (_: any, record: Sale) => (
        <div className="flex items-center">
          <span className={textPrimary}>
            {record.detalles?.length || 0} productos
          </span>
        </div>
      ),
    },
    {
      title: <span className={textSecondary}>Acciones</span>,
      key: 'actions',
      width: 120,
      render: (_: any, record: Sale) => (
        <Space>
          <Button
            type="text"
            icon={<FileTextOutlined className={mode === 'dark' ? 'text-blue-400' : 'text-blue-600'} />}
            onClick={() => handleViewInvoice(record)}
            size="small"
            title="Ver boleta"
          />
        </Space>
      ),
    },
  ]

  const isLoading = salesLoading || clientsLoading || productsLoading
  const isError = salesError
  const error = salesErrorObj

  return (
    <QueryBoundary 
      isLoading={isLoading} 
      isError={isError} 
      error={error} 
      onRetry={refetchSales}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Ventas</h1>
            <p className={textSecondary}>
              Historial y registro de ventas | Total: {filteredSales.length} ventas
            </p>
          </div>
          <Space>
            <RangePicker
              placeholder={['Fecha inicio', 'Fecha fin']}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              disabledDate={disabledDate}
              size="middle"
              className={`mr-2 ${mode === 'dark' ? 'ant-picker-dark' : ''}`}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="middle"
              className={buttonPrimary}
              loading={isCreating}
            >
              Nueva Venta
            </Button>
          </Space>
        </div>

        {/* Estadísticas */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${cardBg} ${cardBorder}`}>
              <Statistic
                title={<span className={textSecondary}>Total de Ventas</span>}
                value={filteredSales.length}
                prefix={<DollarOutlined className={mode === 'dark' ? 'text-blue-400' : 'text-blue-600'} />}
                valueStyle={{ color: mode === 'dark' ? '#60A5FA' : '#1890ff' }}
              />
              <div className={`mt-2 text-sm ${textSecondary}`}>
                Hoy: {todaySales} ventas
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${cardBg} ${cardBorder}`}>
              <Statistic
                title={<span className={textSecondary}>Ingresos Totales</span>}
                value={totalRevenue}
                prefix={<DollarOutlined className={mode === 'dark' ? 'text-green-400' : 'text-green-600'} />}
                valueStyle={{ color: mode === 'dark' ? '#34D399' : '#3f8600' }}
                precision={2}
                suffix="S/."
              />
              <div className={`mt-2 text-sm ${textSecondary}`}>
                Promedio: S/. {filteredSales.length > 0 ? (totalRevenue / filteredSales.length).toFixed(2) : '0.00'}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${cardBg} ${cardBorder}`}>
              <Statistic
                title={<span className={textSecondary}>Ingresos Hoy</span>}
                value={todayRevenue}
                prefix={<DollarOutlined className={mode === 'dark' ? 'text-purple-400' : 'text-purple-600'} />}
                valueStyle={{ color: mode === 'dark' ? '#A78BFA' : '#722ed1' }}
                precision={2}
                suffix="S/."
              />
              <div className={`mt-2 text-sm ${textSecondary}`}>
                {todaySales > 0 ? `${todaySales} ventas hoy` : 'Sin ventas hoy'}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${cardBg} ${cardBorder}`}>
              <Statistic
                title={<span className={textSecondary}>Boletas Emitidas</span>}
                value={filteredSales.filter(s => s.tipoDocumento === DocumentType.BOLETA).length}
                prefix={<FileTextOutlined className={mode === 'dark' ? 'text-orange-400' : 'text-orange-600'} />}
                valueStyle={{ color: mode === 'dark' ? '#FBBF24' : '#faad14' }}
              />
              <div className={`mt-2 text-sm ${textSecondary}`}>
                Facturas: {filteredSales.filter(s => s.tipoDocumento === DocumentType.FACTURA).length}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Tabla de ventas */}
        <Card 
          title={
            <div className="flex items-center justify-between">
              <span className={textPrimary}>
                Historial de Ventas
              </span>
              <div className="flex items-center space-x-2">
                {dateRange && (
                  <Button
                    size="small"
                    onClick={() => setDateRange(null)}
                    className={mode === 'dark' ? 'text-gray-300' : 'text-gray-600'}
                  >
                    Limpiar filtro
                  </Button>
                )}
                <span className={`text-sm ${textSecondary}`}>
                  {filteredSales.length} registros
                </span>
              </div>
            </div>
          }
          className={`${cardBg} ${cardBorder}`}
        >
          <Table
            columns={columns}
            dataSource={filteredSales}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => (
                <span className={textSecondary}>
                  {range[0]}-{range[1]} de {total} ventas
                </span>
              ),
              className: mode === 'dark' ? 'dark-pagination' : '',
            }}
            scroll={{ x: 1000 }}
            className={`sales-table ${mode === 'dark' ? 'dark-table' : ''}`}
            rowClassName={() => hoverBg}
            locale={{
              emptyText: (
                <div className="py-8 text-center">
                  <DollarOutlined className="text-3xl text-gray-400 mb-2" />
                  <div className={textSecondary}>No hay ventas registradas</div>
                  <Button 
                    type="primary" 
                    onClick={handleCreate}
                    className="mt-4"
                  >
                    Crear primera venta
                  </Button>
                </div>
              )
            }}
          />
        </Card>

        {/* Formulario de nueva venta */}
        <SaleForm
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          isSubmitting={isCreating}
          clients={clients}
          products={products.filter(p => p.stock > 0)}
        />

        {/* Modal de boleta */}
        {selectedSale && (
          <InvoiceModal
            sale={selectedSale}
            open={showInvoice}
            onClose={() => {
              setShowInvoice(false)
              setSelectedSale(null)
            }}
          />
        )}
      </div>
    </QueryBoundary>
  )
}

export default SalesPage