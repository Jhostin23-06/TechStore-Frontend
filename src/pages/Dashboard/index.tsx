import React, { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, Table, Tag, Progress, Tooltip, Space, Button, Select, DatePicker } from 'antd'
import {
  ShoppingCartOutlined,
  ProductOutlined,
  UserOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  StockOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useSales } from '@/hooks/useSales' // Importa el hook de ventas
import QueryBoundary from '@/components/common/QueryBoundary'
import SalesChart from '@/components/dashboard/SalesChart'
import MetricCard from '@/components/dashboard/MetricCard'
import KPICard from '@/components/dashboard/KPICard'
import TrendChart from '@/components/dashboard/TrendChart'
import SmartAlert from '@/components/common/SmartAlert'
import ExportButton from '@/components/common/ExportButton'
import { useAlert } from '@/hooks/useAlert'
import { useTheme } from '@/contexts/ThemeContext'
import { useRealTrendData } from '@/hooks/useRealTrendData' // Importa el nuevo hook
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

const exportColumns = [
  { title: 'ID', dataIndex: 'id' },
  { title: 'Cliente', dataIndex: ['cliente', 'nombre'] },
  { title: 'Fecha', dataIndex: 'fecha' },
  { title: 'Total', dataIndex: 'total' },
  { title: 'Método Pago', dataIndex: 'metodoPago' },
]

const Dashboard: React.FC = () => {
  const { mode } = useTheme()
  const { addAlert, showToast } = useAlert()
  const { stats, recentSales, lowStockProducts, isLoading, isError, error, refetch } = useDashboardData()

  // Obtener todas las ventas para las tendencias
  const { sales: allSales, isLoading: salesLoading } = useSales()

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(1, 'month'),
    dayjs()
  ])
  const [metricPeriod, setMetricPeriod] = useState<'day' | 'week' | 'month'>('month')

  // REFs para prevenir bucles - TODOS AQUÍ AL INICIO
  const stockAlertShown = useRef(false)
  const salesAlertShown = useRef(false)
  const welcomeAlertShown = useRef(false)

  // Usar datos REALES para las tendencias
  const trendData = useRealTrendData(allSales, metricPeriod)

  // Calcular métricas
  const promedioVenta = stats.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0
  const productosConStockBajo = lowStockProducts.length
  const porcentajeStockBajo = stats.totalProducts > 0
    ? (productosConStockBajo / stats.totalProducts) * 100
    : 0

  // Calcular tendencias REALES (último período vs anterior)
  const calculateRealTrends = () => {
    if (trendData.length < 2) return { sales: 0, revenue: 0, products: 0, customers: 0 }

    const currentPeriod = trendData[trendData.length - 1]
    const previousPeriod = trendData[trendData.length - 2]

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    return {
      sales: calculateTrend(currentPeriod.sales, previousPeriod.sales),
      revenue: calculateTrend(currentPeriod.revenue, previousPeriod.revenue),
      products: calculateTrend(currentPeriod.products, previousPeriod.products),
      customers: calculateTrend(currentPeriod.customers, previousPeriod.customers),
    }
  }

  const realTrends = calculateRealTrends()

  // useEffect(() => {
  //   if (!welcomeAlertShown.current && !isLoading) {
  //     addAlert({
  //       type: 'info',
  //       title: '¡Bienvenido al Dashboard!',
  //       message: `Total de ventas: ${stats.totalSales} | Total de productos: ${stats.totalProducts}`,
  //       action: {
  //         label: 'Ver Estadísticas',
  //         onClick: () => showToast('info', 'Mostrando estadísticas completas...')
  //       },
  //       autoClose: 10,
  //     })
  //     welcomeAlertShown.current = true
  //   }
  // }, [isLoading, stats.totalSales, stats.totalProducts, addAlert, showToast])

  // // ALERTA DE STOCK BAJO (solo cuando cambia)
  // useEffect(() => {
  //   if (productosConStockBajo > 0 && !stockAlertShown.current) {
  //     addAlert({
  //       type: 'warning',
  //       title: 'Stock Bajo Detectado',
  //       message: `${productosConStockBajo} productos tienen stock bajo. Verificar inventario.`,
  //       action: {
  //         label: 'Ver Productos',
  //         onClick: () => showToast('info', 'Redirigiendo a productos...')
  //       },
  //       autoClose: 10,
  //     })
  //     stockAlertShown.current = true
  //   }

  //   // Resetear si el stock bajo vuelve a 0
  //   if (productosConStockBajo === 0) {
  //     stockAlertShown.current = false
  //   }
  // }, [productosConStockBajo, addAlert, showToast])

  // // ALERTA DE VENTAS DEL DÍA
  // useEffect(() => {
  //   if (!salesAlertShown.current && stats.totalSales > 0 && recentSales.length > 0) {
  //     const todaySales = recentSales.filter(sale =>
  //       dayjs(sale.fecha).isSame(dayjs(), 'day')
  //     ).length

  //     if (todaySales > 0) {
  //       addAlert({
  //         type: 'success',
  //         title: '¡Ventas del día!',
  //         message: `Has realizado ${todaySales} ventas hoy.`,
  //         autoClose: 8,
  //       })
  //       salesAlertShown.current = true
  //     }
  //   }
  // }, [stats.totalSales, recentSales.length, addAlert])

  // Columnas para tabla de ventas recientes
  const salesColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Cliente',
      key: 'cliente',
      render: (_: any, record: any) => record.cliente?.nombre || 'N/A',
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => (
        <span className="font-semibold text-green-600">S/. {total.toFixed(2)}</span>
      ),
    },
    {
      title: 'Método Pago',
      dataIndex: 'metodoPago',
      key: 'metodoPago',
      render: (method: string) => (
        <Tag color={method === 'efectivo' ? 'green' : 'blue'}>
          {method.toUpperCase()}
        </Tag>
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
        {/* Cabecera con controles */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
              Dashboard
            </h1>
            <p className={mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Resumen general del sistema - {dayjs().format('DD [de] MMMM [de] YYYY')}
            </p>
          </div>

          <Space>
            {/* <RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates) {
                  setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
                } else {
                  setDateRange(null)
                }
              }}
              size="middle"
              className={mode === 'dark' ? 'ant-picker-dark' : ''}
            /> */}

            <Select
              value={metricPeriod}
              onChange={setMetricPeriod}
              size="middle"
              className="w-32"
              dropdownClassName={mode === 'dark' ? 'bg-gray-800' : ''}
            >
              <Option value="day">Diario</Option>
              <Option value="week">Semanal</Option>
              <Option value="month">Mensual</Option>
            </Select>

            <ExportButton
              data={recentSales}
              filename={`ventas-${dayjs().format('YYYY-MM-DD')}`}
              columns={exportColumns}
              buttonText="Exportar Ventas"
            />

            <Button
              icon={<BellOutlined />}
              onClick={() => addAlert({
                type: 'info',
                title: 'Información del sistema',
                message: `Total de ventas: ${stats.totalSales} | Total de productos: ${stats.totalProducts}`,
                autoClose: 5,
              })}
            >
              Ver Resumen
            </Button>
          </Space>
        </div>

        {/* Alertas Inteligentes */}
        <div className="mb-6">
          <SmartAlert
            type="info"
            title="¡Bienvenido al Dashboard!"
            message={`Total de ventas: ${stats.totalSales} | Total de productos: ${stats.totalProducts}`}
            action={{
              label: 'Ver Estadísticas',
              onClick: () => showToast('info', 'Mostrando estadísticas completas...')
            }}
            autoClose={10}
          />
        </div>

        {/* Primera fila: Métricas principales con tendencias REALES */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={12} lg={6}>
            <MetricCard
              title="Ventas Totales"
              value={stats.totalSales}
              prefix={<ShoppingCartOutlined />}
              trend={realTrends.sales}
              description={`Total de ventas | Tendencia: ${realTrends.sales >= 0 ? '+' : ''}${realTrends.sales.toFixed(1)}%`}
            />
          </Col>

          <Col xs={24} md={12} lg={6}>
            <MetricCard
              title="Ingresos Totales"
              value={stats.totalRevenue}
              prefix="S/."
              suffix=""
              trend={realTrends.revenue}
              precision={2}
              description={`Ingresos totales | Tendencia: ${realTrends.revenue >= 0 ? '+' : ''}${realTrends.revenue.toFixed(1)}%`}
              valueStyle={{ color: mode === 'dark' ? '#34D399' : '#3f8600' }}
            />
          </Col>

          <Col xs={24} md={12} lg={6}>
            <MetricCard
              title="Productos"
              value={stats.totalProducts}
              prefix={<ProductOutlined />}
              trend={realTrends.products}
              description={`Total de productos | Tendencia: ${realTrends.products >= 0 ? '+' : ''}${realTrends.products.toFixed(1)}%`}
            />
          </Col>

          <Col xs={24} md={12} lg={6}>
            <MetricCard
              title="Clientes Activos"
              value={stats.totalClients || 0}
              prefix={<UserOutlined />}
              trend={realTrends.customers}
              description={`Clientes registrados | Tendencia: ${realTrends.customers >= 0 ? '+' : ''}${realTrends.customers.toFixed(1)}%`}
            />
          </Col>
        </Row>

        {/* Segunda fila: Gráficos */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={12}>
            <SalesChart sales={allSales} />
          </Col>

          <Col xs={24} lg={12}>
            <TrendChart
              data={trendData}
              title={`Tendencias ${metricPeriod === 'day' ? 'Diarias' : metricPeriod === 'week' ? 'Semanales' : 'Mensuales'}`}
              height={300}
              isLoading={salesLoading}
            />
          </Col>
        </Row>

        {/* Resto del código permanece igual... */}
        {/* Tercera fila: KPIs y Stock Bajo */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={12} lg={8}>
            <KPICard
              title="Meta de Ventas"
              value={stats.totalSales}
              target={50}
              unit=" ventas"
              trend={realTrends.sales > 0 ? "up" : "down"}
              description="Meta mensual de ventas"
            />
          </Col>

          <Col xs={24} md={12} lg={8}>
            <KPICard
              title="Conversión"
              value={stats.totalSales > 0 && stats.totalClients > 0
                ? (stats.totalSales / stats.totalClients) * 100
                : 0
              }
              target={30}
              unit="%"
              trend="stable"
              description="Tasa de conversión de clientes a ventas"
            />
          </Col>

          <Col xs={24} md={24} lg={8}>
            <Card
              title={
                <div className="flex items-center">
                  <StockOutlined className="mr-2" />
                  <span>Stock Bajo</span>
                  <Tag color="red" className="ml-2">{productosConStockBajo}</Tag>
                </div>
              }
              className={mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            >
              {lowStockProducts.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {lowStockProducts.slice(0, 5).map(product => (
                    <div
                      key={product.id}
                      className={`flex justify-between items-center p-2 rounded ${mode === 'dark'
                        ? 'hover:bg-gray-700 border-gray-600'
                        : 'hover:bg-gray-50 border-gray-200'
                        } border`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${mode === 'dark' ? 'text-gray-100' : 'text-gray-800'
                          }`}>
                          {product.nombre}
                        </div>
                        <div className={`text-xs truncate ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          Stock: {product.stock} | Mín: 10
                        </div>
                      </div>
                      <Progress
                        percent={(product.stock / 10) * 100}
                        size="small"
                        strokeColor={product.stock === 0 ? '#ff4d4f' : '#faad14'}
                        showInfo={false}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <StockOutlined className={`text-3xl mb-2 ${mode === 'dark' ? 'text-green-400' : 'text-green-500'
                    }`} />
                  <div className={mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    Stock en niveles óptimos
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Cuarta fila: Tabla de ventas recientes */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title={
                <div className="flex items-center justify-between">
                  <span className={mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}>
                    Ventas Recientes ({recentSales.length})
                  </span>
                  <ExportButton
                    data={recentSales}
                    filename={`ventas-${dayjs().format('YYYY-MM-DD')}`}
                    columns={exportColumns}
                    buttonText="Exportar Ventas"
                  />
                </div>
              }
              className={mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            >
              {recentSales.length > 0 ? (
                <Table
                  dataSource={recentSales.slice(0, 5)}
                  columns={salesColumns}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                  scroll={{ x: 600 }}
                  className={mode === 'dark' ? 'dark-table' : ''}
                  rowClassName={() => mode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                />
              ) : (
                <div className="text-center py-8">
                  <p className={mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    No hay ventas recientes para mostrar
                  </p>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </QueryBoundary>
  )
}

export default Dashboard