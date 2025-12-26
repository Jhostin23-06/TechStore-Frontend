import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  DatePicker,
  Select,
  Space,
  Progress,
  Tag,
  Alert
} from 'antd'
import { 
  DownloadOutlined, 
  BarChartOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { reportsService } from '@/services/reports.service'
import { TopSellingProduct } from '@/types/reports.types'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const TopSellingReport: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([])
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('day')
  ])

  useEffect(() => {
    loadTopProducts()
  }, [])

  const loadTopProducts = async () => {
    setLoading(true)
    try {
      const data = await reportsService.getTopSellingProducts()
      setTopProducts(data)
    } catch (error) {
      console.error('Error loading top products:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Posición',
      key: 'position',
      render: (_: any, __: any, index: number) => (
        <div className="text-center">
          <Tag 
            color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'blue'}
            className="w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold"
          >
            {index + 1}
          </Tag>
        </div>
      )
    },
    {
      title: 'Producto',
      dataIndex: 'producto',
      key: 'producto',
      render: (text: string) => (
        <Text strong>{text}</Text>
      )
    },
    {
      title: 'Cantidad Vendida',
      dataIndex: 'totalVendido',
      key: 'totalVendido',
      render: (value: number, record: TopSellingProduct, index: number) => {
        const maxValue = topProducts[0]?.totalVendido || 1
        return (
          <div>
            <div className="flex justify-between mb-1">
              <Text strong>{value} unidades</Text>
              <Text type="secondary">
                {((value / maxValue) * 100).toFixed(1)}%
              </Text>
            </div>
            <Progress 
              percent={(value / maxValue) * 100} 
              strokeColor={index === 0 ? '#faad14' : index === 1 ? '#d9d9d9' : index === 2 ? '#d46b08' : '#1890ff'}
              size="small"
              showInfo={false}
            />
          </div>
        )
      }
    },
    {
      title: 'Tendencia',
      key: 'trend',
      render: () => (
        <Text type="success">↑ 12%</Text>
      )
    }
  ]

  const totalSold = topProducts.reduce((sum, item) => sum + item.totalVendido, 0)
  const averagePerProduct = totalSold > 0 ? totalSold / topProducts.length : 0

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <Link to="/reports" className="mb-2 inline-block">
            <ArrowLeftOutlined /> Volver a Reportes
          </Link>
          <Title level={2} className="mb-1">
            Productos Más Vendidos
          </Title>
          <Text type="secondary">
            Análisis de los productos con mayor rotación
          </Text>
        </div>
        
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            format="DD/MM/YYYY"
          />
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadReport('top-selling')}
          >
            Exportar PDF
          </Button>
        </Space>
      </div>

      {/* Estadísticas */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Vendido"
              value={totalSold}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="unidades"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Productos en Ranking"
              value={topProducts.length}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Promedio por Producto"
              value={averagePerProduct}
              valueStyle={{ color: '#722ed1' }}
              precision={1}
              suffix="unidades"
            />
          </Card>
        </Col>
      </Row>

      {/* Tabla principal */}
      <Card
        title="Top 10 Productos Más Vendidos"
        extra={
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">Todos</Option>
            <Option value="month">Este mes</Option>
            <Option value="year">Este año</Option>
          </Select>
        }
      >
        <Table
          columns={columns}
          dataSource={topProducts}
          rowKey="producto"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Insights */}
      <Card title="Insights y Recomendaciones">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Alert
              message="Producto Estrella"
              description={
                topProducts[0] ? (
                  <>
                    <Text strong>{topProducts[0].producto}</Text> es tu producto más vendido con{' '}
                    <Text strong>{topProducts[0].totalVendido}</Text> unidades. Considera aumentar 
                    el stock y promocionarlo aún más.
                  </>
                ) : 'No hay datos disponibles'
              }
              type="success"
              showIcon
            />
          </Col>
          <Col xs={24} md={12}>
            <Alert
              message="Oportunidad de Mejora"
              description={
                topProducts.length > 1 ? (
                  <>
                    Los productos en las posiciones más bajas podrían necesitar más visibilidad 
                    o mejores estrategias de marketing.
                  </>
                ) : 'No hay suficientes datos para análisis'
              }
              type="info"
              showIcon
            />
          </Col>
        </Row>
      </Card>
    </div>
  )
}

const handleDownloadReport = (type: string) => {
  // Implementar descarga
  console.log('Downloading report:', type)
}

export default TopSellingReport