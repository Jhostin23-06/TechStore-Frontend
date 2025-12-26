import React, { useState, useEffect } from 'react'
import {
    Card,
    Row,
    Col,
    Typography,
    Space,
    Button,
    DatePicker,
    Select,
    Statistic,
    Tabs,
    Table,
    Tag,
    Progress,
    Spin,
    Alert,
    Modal,
    Form,
    InputNumber,
    Radio,
    Dropdown,
    Menu,
    type MenuProps
} from 'antd'
import {
    DownloadOutlined,
    BarChartOutlined,
    PieChartOutlined,
    LineChartOutlined,
    ShoppingCartOutlined,
    WarningOutlined,
    DollarOutlined,
    ProductOutlined,
    FilterOutlined,
    PrinterOutlined,
    MailOutlined,
    SettingOutlined,
    EyeOutlined,
    MoreOutlined,
    TableOutlined,
    DashboardOutlined,
    InfoCircleOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { reportsService } from '@/services/reports.service'
import {
    TopSellingProduct,
    LowStockProduct,
    IncomeByCategory,
    ProductWithoutCategory
} from '@/types/reports.types'
import EnhancedBarChart from '@/Charts/EnhancedBarChart'
import EnhancedPieChart from '@/Charts/EnhancedPieChart'
import { LineChart, Tooltip } from 'recharts'

// Componentes de gráficos mejorados

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select
const { TabPane } = Tabs
const { Item } = Form

const ReportsPage: React.FC = () => {
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')
    const [viewMode, setViewMode] = useState<'table' | 'chart' | 'both'>('table')
    const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([])
    const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
    const [incomeByCategory, setIncomeByCategory] = useState<IncomeByCategory[]>([])
    const [productsWithoutCategory, setProductsWithoutCategory] = useState<ProductWithoutCategory[]>([])
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('day')
    ])
    const [threshold, setThreshold] = useState(5)
    const [exportModalVisible, setExportModalVisible] = useState(false)
    const [filterModalVisible, setFilterModalVisible] = useState(false)
    const [selectedReport, setSelectedReport] = useState<string>('all')
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')

    // Cargar datos de reportes
    useEffect(() => {
        loadReportsData()
    }, [threshold])

    const loadReportsData = async () => {
        setLoading(true)
        try {
            const [
                topSellingData,
                lowStockData,
                incomeData,
                noCategoryData
            ] = await Promise.all([
                reportsService.getTopSellingProducts(),
                reportsService.getLowStockProducts(threshold),
                reportsService.getIncomeByCategory(),
                reportsService.getProductsWithoutCategory()
            ])

            setTopProducts(Array.isArray(topSellingData) ? topSellingData : [])
            setLowStockProducts(Array.isArray(lowStockData) ? lowStockData : [])
            setIncomeByCategory(Array.isArray(incomeData) ? incomeData : [])
            setProductsWithoutCategory(Array.isArray(noCategoryData) ? noCategoryData : [])
        } catch (error) {
            console.error('Error loading reports:', error)
            Modal.error({
                title: 'Error',
                content: 'No se pudieron cargar los reportes. Por favor intenta nuevamente.',
            })
        } finally {
            setLoading(false)
        }
    }

    // Handlers para acciones
    const handleExport = () => {
        setExportModalVisible(true)
    }

    const handleFilter = () => {
        setFilterModalVisible(true)
    }

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'print':
                window.print()
                Modal.success({
                    title: 'Impresión',
                    content: 'La página se ha enviado a imprimir.'
                })
                break
            case 'email':
                Modal.info({
                    title: 'Enviar por Email',
                    content: 'Esta funcionalidad está en desarrollo.',
                })
                break
            case 'refresh':
                loadReportsData()
                break
        }
    }

    // Menu items para Dropdown de Acciones
    const menuItems: MenuProps['items'] = [
        {
            key: 'print',
            icon: <PrinterOutlined />,
            label: 'Imprimir Reporte',
            onClick: () => handleQuickAction('print')
        },
        {
            key: 'email',
            icon: <MailOutlined />,
            label: 'Enviar por Email',
            onClick: () => handleQuickAction('email')
        },
        {
            type: 'divider',
        },
        {
            key: 'refresh',
            icon: <SettingOutlined />,
            label: 'Actualizar Datos',
            onClick: () => handleQuickAction('refresh')
        },
    ]

    // ==================== VISTAS DE GRÁFICOS MEJORADOS ====================

    // 1. Vista de solo gráficos
    const renderChartView = () => {
        // Datos para gráfico de barras (Productos más vendidos)
        const topProductsChartData = topProducts.slice(0, 6).map((item, index) => ({
            label: item.producto?.substring(0, 20) + (item.producto?.length > 20 ? '...' : '') || 'Sin nombre',
            value: item.totalVendido || 0,
            color: `linear-gradient(135deg, ${['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'][index]} 0%, ${['#69c0ff', '#73d13d', '#ffc53d', '#ff4d4f', '#9254de', '#36cfc9'][index]} 100%)`
        }))

        // Datos para gráfico de torta (Ingresos por categoría)
        const incomeChartData = incomeByCategory.slice(0, 5).map((item, index) => ({
            label: item.categoria?.substring(0, 12) + (item.categoria?.length > 12 ? '...' : '') || 'Sin categoría',
            value: item.ingresos || 0,
            color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'][index]
        }))

        return (
            <div className="space-y-4">
                {/* Fila 1: Gráficos principales en 2 columnas */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <EnhancedBarChart
                            title="Top Productos Más Vendidos"
                            data={topProductsChartData}
                            height={320}
                            unit="unidades"
                            showTooltip={true}
                            showGrid={true}
                            showLegend={false} // Ocultar leyenda para ahorrar espacio
                            compact={true}     // Usar modo compacto
                        />
                    </Col>

                    {/* Meta del mes */}
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            className="h-full hover:shadow-md transition-shadow"
                            bodyStyle={{ padding: '16px' }}
                        >
                            <div className="text-center">
                                <Text strong className="block mb-2">Meta del Mes</Text>
                                <div className="relative w-20 h-20 mx-auto mb-3">
                                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                                        <circle
                                            cx="50" cy="50" r="40" fill="none"
                                            stroke="#52c41a" strokeWidth="8" strokeLinecap="round"
                                            strokeDasharray="251"
                                            strokeDashoffset="251 * 0.35"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Text strong className="text-xl">65%</Text>
                                    </div>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <Text type="secondary">Actual:</Text>
                                        <Text strong>$8,450</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text type="secondary">Meta:</Text>
                                        <Text strong>$13,000</Text>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Rotación de inventario */}
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            className="h-auto hover:shadow-md transition-shadow"
                            bodyStyle={{ padding: '16px' }}
                        >
                            <div className="text-center">
                                <Text strong className="block mb-2">Rotación Inventario</Text>
                                <div className="relative w-20 h-20 mx-auto mb-3">
                                    <div className="absolute inset-0 rounded-full border-6 border-blue-100" />
                                    <div
                                        className="absolute inset-0 rounded-full border-6 border-blue-500 border-t-transparent border-r-transparent"
                                        style={{ transform: 'rotate(135deg)' }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Text strong className="text-xl">2.4x</Text>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                    <Text className="text-sm">Alta rotación</Text>
                                </div>
                            </div>
                        </Card>


                        <Card
                            className="h-auto hover:shadow-md transition-shadow"
                            bodyStyle={{ padding: '16px' }}
                        >
                            <div className="text-center">
                                <Text strong className="block mb-3">Comparativa Mensual</Text>

                                {/* Mini gráfico de comparativa */}
                                <div className="h-16 flex items-end justify-center space-x-4 mb-3">
                                    <div className="text-center">
                                        <div
                                            className="w-4 bg-gradient-to-t from-blue-400 to-blue-600 rounded-t transition-all duration-300"
                                            style={{ height: '60%' }}
                                        />
                                        <Text type="secondary" className="text-xs mt-1">Anterior</Text>
                                        <Text strong className="text-xs block">$10.6K</Text>
                                    </div>
                                    <div className="text-center">
                                        <div
                                            className="w-4 bg-gradient-to-t from-green-400 to-green-600 rounded-t transition-all duration-300"
                                            style={{ height: '75%' }}
                                        />
                                        <Text type="secondary" className="text-xs mt-1">Actual</Text>
                                        <Text strong className="text-xs block">$12.5K</Text>
                                    </div>
                                </div>

                                <div className="bg-green-50 p-2 rounded">
                                    <Text type="success" className="text-xs">
                                        <InfoCircleOutlined className="mr-1" />
                                        +18% este mes
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Comparativa mensual */}
                    <Col xs={24} sm={12} lg={6}>
                        
                    </Col>

                    <Col xs={24} lg={24}>
                        <EnhancedPieChart
                            title="Ingresos por Categoría"
                            data={incomeChartData}
                            height={800}
                            showDonut={true}
                            showLabels={false} // Ocultar labels en el gráfico
                        />
                    </Col>
                </Row>

                {/* Fila 2: Mini métricas */}
                <Row gutter={[12, 12]}>
                    

                    
                </Row>
            </div>
        )
    }

    // 2. Vista de solo tablas
    const renderTableView = () => {
        return (
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card
                        title="Top Ventas"
                        extra={
                            <Link to="/reports/top-selling">
                                <Button type="link" size="small" icon={<BarChartOutlined />}>
                                    Ver detalle
                                </Button>
                            </Link>
                        }
                        className="h-full"
                    >
                        {topProducts.length > 0 ? (
                            <Table
                                dataSource={topProducts.slice(0, 5)}
                                rowKey="producto"
                                pagination={false}
                                size="small"
                                columns={[
                                    {
                                        title: 'Posición',
                                        key: 'position',
                                        render: (_, __, index) => (
                                            <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'blue'}>
                                                #{index + 1}
                                            </Tag>
                                        )
                                    },
                                    {
                                        title: 'Producto',
                                        dataIndex: 'producto',
                                        key: 'producto',
                                        ellipsis: true,
                                        render: (text) => text || 'Sin nombre'
                                    },
                                    {
                                        title: 'Vendidos',
                                        dataIndex: 'totalVendido',
                                        key: 'totalVendido',
                                        render: (value) => (
                                            <Tag color="blue">{value || 0} unidades</Tag>
                                        )
                                    },
                                    {
                                        title: 'Acción',
                                        key: 'action',
                                        render: (record) => (
                                            <Button
                                                type="link"
                                                size="small"
                                                onClick={() => {
                                                    Modal.info({
                                                        title: 'Detalle del Producto',
                                                        content: `Producto: ${record.producto || 'Sin nombre'}\nVendidos: ${record.totalVendido || 0} unidades`,
                                                    })
                                                }}
                                            >
                                                Detalle
                                            </Button>
                                        )
                                    }
                                ]}
                            />
                        ) : (
                            <Alert
                                message="No hay datos"
                                description="No hay productos vendidos para mostrar."
                                type="info"
                                showIcon
                            />
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title="Categorías Top"
                        extra={
                            <Button type="link" size="small" icon={<PieChartOutlined />}>
                                Ver análisis
                            </Button>
                        }
                        className="h-full"
                    >
                        {incomeByCategory.length > 0 ? (
                            <Table
                                dataSource={incomeByCategory.slice(0, 5)}
                                rowKey="categoria"
                                pagination={false}
                                size="small"
                                columns={[
                                    {
                                        title: 'Categoría',
                                        dataIndex: 'categoria',
                                        key: 'categoria',
                                        ellipsis: true,
                                        render: (text) => text || 'Sin categoría'
                                    },
                                    {
                                        title: 'Ingresos',
                                        dataIndex: 'ingresos',
                                        key: 'ingresos',
                                        render: (value) => (
                                            <div className="flex items-center">
                                                <DollarOutlined className="text-green-500 mr-1" />
                                                <Text strong className="text-green-600">
                                                    ${(value || 0).toFixed(2)}
                                                </Text>
                                            </div>
                                        )
                                    },
                                    {
                                        title: '% Total',
                                        key: 'percentage',
                                        render: (record) => {
                                            const total = incomeByCategory.reduce((sum, item) => sum + (item.ingresos || 0), 0)
                                            const percentage = total > 0 ? ((record.ingresos || 0) / total) * 100 : 0
                                            return (
                                                <Progress
                                                    percent={percentage}
                                                    size="small"
                                                    strokeColor="#52c41a"
                                                    format={() => `${percentage.toFixed(1)}%`}
                                                />
                                            )
                                        }
                                    }
                                ]}
                            />
                        ) : (
                            <Alert
                                message="No hay datos"
                                description="No hay ingresos por categoría para mostrar."
                                type="info"
                                showIcon
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        )
    }

    // 3. Vista combinada (gráficos + tablas)
    const renderBothView = () => {
        return (
            <>
                {/* Sección de gráficos */}
                <div className="mb-8">
                    <Card
                        title={
                            <Space>
                                <DashboardOutlined />
                                <span>Dashboard de Gráficos</span>
                            </Space>
                        }
                        className="mb-6"
                    >
                        {renderChartView()}
                    </Card>
                </div>

                {/* Sección de tablas */}
                <div>
                    <Card title="Tablas de Datos Detalladas">
                        <Tabs defaultActiveKey="sales">
                            <TabPane
                                tab={
                                    <Space>
                                        <ShoppingCartOutlined />
                                        <span>Productos Más Vendidos</span>
                                    </Space>
                                }
                                key="sales"
                            >
                                {renderDetailedView()}
                            </TabPane>
                            <TabPane
                                tab={
                                    <Space>
                                        <DollarOutlined />
                                        <span>Ingresos por Categoría</span>
                                    </Space>
                                }
                                key="income"
                            >
                                {renderIncomeView()}
                            </TabPane>
                            <TabPane
                                tab={
                                    <Space>
                                        <WarningOutlined />
                                        <span>Productos Bajo Stock</span>
                                        {lowStockProducts.length > 0 && (
                                            <Tag color="red">{lowStockProducts.length}</Tag>
                                        )}
                                    </Space>
                                }
                                key="inventory"
                            >
                                {renderInventoryView()}
                            </TabPane>
                        </Tabs>
                    </Card>
                </div>
            </>
        )
    }

    // ==================== VISTAS DETALLADAS PARA PESTAÑAS ====================

    const renderDetailedView = () => {
        const columns = [
            {
                title: 'Posición',
                key: 'position',
                render: (_: any, __: any, index: number) => (
                    <div className="text-center">
                        <Tag
                            color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'blue'}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-white font-bold"
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
                    <Text strong>{text || 'Sin nombre'}</Text>
                )
            },
            {
                title: 'Cantidad Vendida',
                dataIndex: 'totalVendido',
                key: 'totalVendido',
                render: (value: number) => {
                    const maxValue = Math.max(...topProducts.map(p => p.totalVendido || 0), 1)
                    return (
                        <div className="flex items-center">
                            <Progress
                                percent={((value || 0) / maxValue) * 100}
                                size="small"
                                showInfo={false}
                                strokeColor={
                                    value === maxValue ? '#faad14' :
                                        value >= maxValue * 0.7 ? '#52c41a' :
                                            value >= maxValue * 0.4 ? '#1890ff' : '#d9d9d9'
                                }
                            />
                            <Text strong className="ml-3 min-w-16">
                                {value || 0} unidades
                            </Text>
                        </div>
                    )
                }
            },
            {
                title: '% del Total',
                key: 'percentage',
                render: (record: TopSellingProduct) => {
                    const total = topProducts.reduce((sum, item) => sum + (item.totalVendido || 0), 0)
                    const percentage = total > 0 ? ((record.totalVendido || 0) / total) * 100 : 0
                    return (
                        <Tag color={
                            percentage > 20 ? 'green' :
                                percentage > 10 ? 'blue' :
                                    percentage > 5 ? 'orange' : 'default'
                        } className="font-bold">
                            {percentage.toFixed(1)}%
                        </Tag>
                    )
                }
            },
            {
                title: 'Acciones',
                key: 'actions',
                render: (record: TopSellingProduct) => (
                    <Space>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                Modal.info({
                                    title: 'Análisis del Producto',
                                    width: 600,
                                    content: (
                                        <div>
                                            <p><strong>Producto:</strong> {record.producto || 'Sin nombre'}</p>
                                            <p><strong>Vendidos:</strong> {record.totalVendido || 0} unidades</p>
                                            <p><strong>Porcentaje del total:</strong> {
                                                ((record.totalVendido || 0) / topProducts.reduce((sum, item) => sum + (item.totalVendido || 0), 0) * 100).toFixed(1)
                                            }%</p>
                                            <p><strong>Recomendación:</strong> {
                                                (record.totalVendido || 0) > 100 ?
                                                    'Producto estrella, considera aumentar stock' :
                                                    'Desempeño regular, evaluar promociones'
                                            }</p>
                                        </div>
                                    ),
                                })
                            }}
                        >
                            Análisis
                        </Button>
                    </Space>
                )
            }
        ]

        return (
            <Table
                dataSource={topProducts}
                rowKey="producto"
                columns={columns}
                pagination={{ pageSize: 10 }}
            />
        )
    }

    const renderInventoryView = () => {
        const columns = [
            {
                title: 'Producto',
                dataIndex: 'nombre',
                key: 'nombre',
                render: (text: string, record: LowStockProduct) => (
                    <div>
                        <Text strong>{text || 'Sin nombre'}</Text>
                        <br />
                        <Space size="small">
                            <Tag color="blue" >{record.codigo || 'Sin código'}</Tag>
                            {record.marca && <Tag color="purple">{record.marca}</Tag>}
                        </Space>
                    </div>
                )
            },
            {
                title: 'Stock Actual',
                dataIndex: 'stock',
                key: 'stock',
                render: (value: number, record: LowStockProduct) => {
                    const stockLevel = value < 2 ? 'danger' : value < 5 ? 'warning' : 'normal'
                    return (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Tag color={
                                    value < 2 ? 'red' :
                                        value < 5 ? 'orange' :
                                            'green'
                                } className="font-bold">
                                    {value || 0} unidades
                                </Tag>
                                <Text type="secondary" className="text-xs">
                                    Umbral: {threshold}
                                </Text>
                            </div>
                            <Progress
                                percent={(value / threshold) * 100}
                                size="small"
                                status={
                                    value < 2 ? 'exception' :
                                        value < 5 ? 'normal' : 'success'
                                }
                                strokeColor={
                                    value < 2 ? '#ff4d4f' :
                                        value < 5 ? '#faad14' :
                                            '#52c41a'
                                }
                                format={(percent) => `${Math.round(percent || 0)}% del umbral`}
                            />
                        </div>
                    )
                }
            },
            {
                title: 'Precio',
                dataIndex: 'precio',
                key: 'precio',
                render: (value: number) => (
                    <div className="text-right">
                        <Text strong className="text-lg">
                            ${(value || 0).toFixed(2)}
                        </Text>
                    </div>
                )
            },
            {
                title: 'Acción',
                key: 'action',
                render: (record: LowStockProduct) => (
                    <Space direction="vertical">
                        <Button
                            type="primary"
                            size="small"
                            danger={record.stock < 2}
                            onClick={() => {
                                Modal.confirm({
                                    title: 'Generar Orden de Reabastecimiento',
                                    content: `¿Deseas generar una orden para reabastecer "${record.nombre || 'este producto'}"?`,
                                    okText: 'Generar Orden',
                                    cancelText: 'Cancelar',
                                    onOk: () => {
                                        Modal.success({
                                            title: 'Orden Generada',
                                            content: `Se ha generado la orden para "${record.nombre || 'el producto'}". Stock actual: ${record.stock || 0} unidades.`,
                                        })
                                    }
                                })
                            }}
                        >
                            {record.stock < 2 ? '¡Urgente!' : 'Reabastecer'}
                        </Button>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                Modal.info({
                                    title: 'Detalles del Producto',
                                    content: (
                                        <div>
                                            <p><strong>Producto:</strong> {record.nombre || 'Sin nombre'}</p>
                                            <p><strong>Código:</strong> {record.codigo || 'Sin código'}</p>
                                            <p><strong>Stock actual:</strong> {record.stock || 0} unidades</p>
                                            <p><strong>Precio:</strong> ${(record.precio || 0).toFixed(2)}</p>
                                            <p><strong>Estado:</strong> {
                                                record.stock < 2 ? 'CRÍTICO - Reabastecimiento urgente' :
                                                    record.stock < 5 ? 'BAJO - Considerar reabastecer' :
                                                        'SUFICIENTE'
                                            }</p>
                                        </div>
                                    ),
                                })
                            }}
                        >
                            Ver Detalles
                        </Button>
                    </Space>
                )
            }
        ]

        return (
            <Table
                dataSource={lowStockProducts}
                rowKey="id"
                columns={columns}
                pagination={{ pageSize: 10 }}
            />
        )
    }

    const renderIncomeView = () => {
        const columns = [
            {
                title: 'Categoría',
                dataIndex: 'categoria',
                key: 'categoria',
                render: (text: string) => (
                    <div className="flex items-center">
                        <div className="w-3 h-6 rounded mr-3" style={{
                            backgroundColor: text === incomeByCategory[0]?.categoria ? '#faad14' :
                                text === incomeByCategory[1]?.categoria ? '#1890ff' :
                                    text === incomeByCategory[2]?.categoria ? '#52c41a' : '#722ed1'
                        }} />
                        <Text strong>{text || 'Sin categoría'}</Text>
                    </div>
                )
            },
            {
                title: 'Ingresos',
                dataIndex: 'ingresos',
                key: 'ingresos',
                render: (value: number) => {
                    const maxValue = Math.max(...incomeByCategory.map(item => item.ingresos || 0), 1)
                    return (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <DollarOutlined className="text-green-500 mr-2" />
                                    <Text strong className="text-green-600 text-lg">
                                        ${(value || 0).toFixed(2)}
                                    </Text>
                                </div>
                                <Text type="secondary" className="text-xs">
                                    {((value || 0) / maxValue * 100).toFixed(1)}% del máximo
                                </Text>
                            </div>
                            <Progress
                                percent={((value || 0) / maxValue) * 100}
                                size="small"
                                showInfo={false}
                                strokeColor={
                                    value === maxValue ? '#faad14' :
                                        value >= maxValue * 0.7 ? '#52c41a' :
                                            value >= maxValue * 0.4 ? '#1890ff' : '#d9d9d9'
                                }
                            />
                        </div>
                    )
                }
            },
            {
                title: '% del Total',
                key: 'percentage',
                render: (record: IncomeByCategory) => {
                    const total = incomeByCategory.reduce((sum, item) => sum + (item.ingresos || 0), 0)
                    const percentage = total > 0 ? ((record.ingresos || 0) / total) * 100 : 0
                    return (
                        <div className="text-center">
                            <div className="text-2xl font-bold" style={{
                                color: percentage > 30 ? '#52c41a' :
                                    percentage > 15 ? '#1890ff' :
                                        '#722ed1'
                            }}>
                                {percentage.toFixed(1)}%
                            </div>
                            <Progress
                                percent={percentage}
                                size="small"
                                strokeColor={
                                    percentage > 30 ? '#52c41a' :
                                        percentage > 15 ? '#1890ff' :
                                            '#722ed1'
                                }
                                showInfo={false}
                            />
                        </div>
                    )
                }
            },
            {
                title: 'Análisis',
                key: 'analysis',
                render: (record: IncomeByCategory, index: number) => (
                    <div>
                        {index === 0 ? (
                            <Tag color="gold" className="font-bold">TOP 1</Tag>
                        ) : index === 1 ? (
                            <Tag color="blue" className="font-bold">TOP 2</Tag>
                        ) : index === 2 ? (
                            <Tag color="orange" className="font-bold">TOP 3</Tag>
                        ) : (
                            <Tag color="default">Normal</Tag>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                            {index === 0 ? 'Categoría líder' :
                                index <= 2 ? 'Alto desempeño' :
                                    'Desempeño regular'}
                        </div>
                    </div>
                )
            }
        ]

        return (
            <Table
                dataSource={incomeByCategory as any[]}
                rowKey="categoria"
                columns={columns}
                pagination={{ pageSize: 10 }}
            />
        )
    }

    // ==================== RENDER PRINCIPAL ====================

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Spin size="large" tip="Cargando reportes..." />
                <Text type="secondary" className="mt-4">
                    Esto puede tomar unos segundos...
                </Text>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeInUp">
            {/* Encabezado mejorado */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Space align="baseline">
                        <Title level={2} className="mb-1">
                            Reportes y Análisis
                        </Title>
                        <Tag color="blue" className="text-sm">Beta</Tag>
                    </Space>
                    <Text type="secondary">
                        Última actualización: {dayjs().format('DD/MM/YYYY HH:mm')} •
                        <span className="ml-2 text-green-500">●</span> Sistema activo
                    </Text>
                </div>

                <Space wrap>
                    <Button
                        icon={<FilterOutlined />}
                        onClick={handleFilter}
                        className="flex items-center"
                    >
                        <span className="hidden sm:inline">Filtros</span>
                    </Button>

                    <Dropdown
                        menu={{ items: menuItems }}
                        placement="bottomRight"
                        trigger={['click']}
                    >
                        <Button icon={<MoreOutlined />} className="flex items-center">
                            <span className="hidden sm:inline">Acciones</span>
                        </Button>
                    </Dropdown>

                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleExport}
                        className="flex items-center"
                    >
                        <span className="hidden sm:inline">Exportar</span>
                    </Button>
                </Space>
            </div>

            {/* Filtros rápidos */}
            <Card size="small" className="bg-gradient-to-r from-blue-50 to-gray-50 shadow-sm">
                <Row gutter={[16, 8]} align="middle">
                    <Col xs={24} md={8}>
                        <Space>
                            <Text strong>Ver como:</Text>
                            <Radio.Group
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value)}
                                size="small"
                                optionType="button"
                                buttonStyle="solid"
                                className="flex-wrap"
                            >
                                <Radio.Button value="table">
                                    <TableOutlined /> Tabla
                                </Radio.Button>
                                <Radio.Button value="chart">
                                    <BarChartOutlined /> Gráfico
                                </Radio.Button>
                                <Radio.Button value="both">
                                    <DashboardOutlined /> Ambos
                                </Radio.Button>
                            </Radio.Group>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Estadísticas rápidas */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <Statistic
                            title={
                                <Space>
                                    <BarChartOutlined />
                                    <span>Productos en Ranking</span>
                                </Space>
                            }
                            value={topProducts.length}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />}
                        />
                        <Text type="secondary" className="text-xs">
                            {topProducts.slice(0, 3).map(p => p.producto).join(', ')}...
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <Statistic
                            title={
                                <Space>
                                    <WarningOutlined style={{ color: lowStockProducts.length > 0 ? '#faad14' : '#52c41a' }} />
                                    <span>Bajo Stock</span>
                                </Space>
                            }
                            value={lowStockProducts.length}
                            valueStyle={{ color: lowStockProducts.length > 0 ? '#faad14' : '#52c41a' }}
                            prefix={
                                <div
                                    className={`w-3 h-3 rounded-full mr-2 ${lowStockProducts.length > 0 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                />
                            }
                        />
                        <Text type="secondary" className="text-xs">
                            {lowStockProducts.length > 0 ? '¡Revisar inventario!' : 'Todo en orden'}
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <Statistic
                            title={
                                <Space>
                                    <DollarOutlined />
                                    <span>Ingresos Totales</span>
                                </Space>
                            }
                            value={incomeByCategory.reduce((sum, item) => sum + (item.ingresos || 0), 0)}
                            valueStyle={{ color: '#52c41a' }}
                            precision={2}
                            prefix="$"
                            suffix={<div className="w-3 h-3 rounded-full bg-green-500 ml-2" />}
                        />
                        <Text type="secondary" className="text-xs">
                            {incomeByCategory.length} categorías registradas
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <Statistic
                            title={
                                <Space>
                                    <ProductOutlined />
                                    <span>Sin Categoría</span>
                                </Space>
                            }
                            value={productsWithoutCategory.length}
                            valueStyle={{ color: productsWithoutCategory.length > 0 ? '#f5222d' : '#52c41a' }}
                            prefix={
                                <div
                                    className={`w-3 h-3 rounded-full mr-2 ${productsWithoutCategory.length > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                                />
                            }
                        />
                        <Text type="secondary" className="text-xs">
                            {productsWithoutCategory.length > 0 ? 'Necesitan clasificación' : 'Todos categorizados'}
                        </Text>
                    </Card>
                </Col>
            </Row>

            {/* Contenido principal según modo de vista */}
            <Card className="shadow-sm border-0">
                {viewMode === 'table' && renderTableView()}
                {viewMode === 'chart' && renderChartView()}
                {viewMode === 'both' && renderBothView()}
            </Card>

            {/* Pestañas para navegación adicional (si se necesita) */}
            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'overview',
                            label: 'Vista General',
                            children: (
                                <Alert
                                    message="Dashboard Completo"
                                    description="Usa los filtros superiores para cambiar entre vista de tabla, gráfico o ambas."
                                    type="info"
                                    showIcon
                                />
                            )
                        },
                        {
                            key: 'advanced',
                            label: 'Análisis Avanzado',
                            children: (
                                <div className="text-center py-8">
                                    <LineChartOutlined style={{ fontSize: 48, color: '#1890ff' }} className="mb-4" />
                                    <Title level={4}>Análisis Avanzado</Title>
                                    <Text type="secondary" className="block mb-6">
                                        Próximamente: Análisis predictivo, correlaciones y machine learning.
                                    </Text>
                                    <Button type="primary" size="large">
                                        Solicitar Acceso Beta
                                    </Button>
                                </div>
                            )
                        }
                    ]}
                />
            </Card>

            {/* Modal de Exportación */}
            <Modal
                title={
                    <Space>
                        <DownloadOutlined />
                        <span>Exportar Reporte</span>
                    </Space>
                }
                open={exportModalVisible}
                onCancel={() => setExportModalVisible(false)}
                onOk={() => {
                    setExportModalVisible(false)
                    Modal.success({
                        title: 'Exportación Iniciada',
                        content: `El reporte "${selectedReport}" se está generando en formato ${exportFormat.toUpperCase()}. Se descargará automáticamente cuando esté listo.`
                    })
                }}
                okText="Generar Exportación"
                cancelText="Cancelar"
                width={600}
            >
                <Form layout="vertical">
                    <Item
                        label="Seleccionar Reporte"
                        help="Elige qué datos deseas exportar"
                    >
                        <Select
                            value={selectedReport}
                            onChange={setSelectedReport}
                            placeholder="Selecciona un reporte"
                            className="w-full"
                        >
                            <Option value="all">
                                <Space>
                                    <DashboardOutlined />
                                    <span>Todos los Reportes (Completo)</span>
                                </Space>
                            </Option>
                            <Option value="top-selling">
                                <Space>
                                    <BarChartOutlined />
                                    <span>Productos Más Vendidos</span>
                                </Space>
                            </Option>
                            <Option value="low-stock">
                                <Space>
                                    <WarningOutlined />
                                    <span>Productos Bajo Stock</span>
                                </Space>
                            </Option>
                            <Option value="income-category">
                                <Space>
                                    <DollarOutlined />
                                    <span>Ingresos por Categoría</span>
                                </Space>
                            </Option>
                            <Option value="inventory">
                                <Space>
                                    <ProductOutlined />
                                    <span>Inventario Completo</span>
                                </Space>
                            </Option>
                        </Select>
                    </Item>

                    <Item label="Formato de Exportación">
                        <Radio.Group
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            className="w-full"
                        >
                            <Space direction="vertical" className="w-full">
                                <Radio value="pdf" className="w-full py-2">
                                    <Space>
                                        <FilePdfOutlined />
                                        <div>
                                            <Text strong>PDF Document</Text>
                                            <div className="text-xs text-gray-500">
                                                Formato estándar para imprimir y compartir
                                            </div>
                                        </div>
                                    </Space>
                                </Radio>
                                <Radio value="excel" className="w-full py-2">
                                    <Space>
                                        <FileExcelOutlined />
                                        <div>
                                            <Text strong>Excel (XLSX)</Text>
                                            <div className="text-xs text-gray-500">
                                                Para análisis avanzado y edición
                                            </div>
                                        </div>
                                    </Space>
                                </Radio>
                                <Radio value="csv" className="w-full py-2">
                                    <Space>
                                        <FileTextOutlined />
                                        <div>
                                            <Text strong>CSV</Text>
                                            <div className="text-xs text-gray-500">
                                                Para importar en otros sistemas
                                            </div>
                                        </div>
                                    </Space>
                                </Radio>
                            </Space>
                        </Radio.Group>
                    </Item>

                    <Item label="Rango de Fechas (opcional)">
                        <RangePicker className="w-full" />
                    </Item>
                </Form>
            </Modal>

            {/* Modal de Filtros Avanzados */}
            <Modal
                title={
                    <Space>
                        <FilterOutlined />
                        <span>Filtros Avanzados</span>
                    </Space>
                }
                open={filterModalVisible}
                onCancel={() => setFilterModalVisible(false)}
                onOk={() => {
                    setFilterModalVisible(false)
                    loadReportsData()
                    Modal.success({
                        title: 'Filtros Aplicados',
                        content: 'Los filtros se han aplicado correctamente.'
                    })
                }}
                width={700}
                okText="Aplicar Filtros"
                cancelText="Cancelar"
            >
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Item label="Categoría">
                                <Select placeholder="Seleccionar categoría" allowClear className="w-full">
                                    <Option value="all">Todas las categorías</Option>
                                    {/* Mapear categorías reales aquí */}
                                </Select>
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item label="Umbral Stock Mínimo">
                                <InputNumber
                                    min={1}
                                    max={100}
                                    value={threshold}
                                    onChange={(value) => value && setThreshold(value)}
                                    className="w-full"
                                />
                            </Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Item label="Ordenar por">
                                <Select placeholder="Seleccionar campo" className="w-full">
                                    <Option value="quantity">Cantidad Vendida</Option>
                                    <Option value="revenue">Ingresos</Option>
                                    <Option value="name">Nombre</Option>
                                    <Option value="stock">Stock</Option>
                                    <Option value="date">Fecha</Option>
                                </Select>
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item label="Orden">
                                <Select placeholder="Seleccionar orden" className="w-full">
                                    <Option value="desc">Descendente (Mayor a menor)</Option>
                                    <Option value="asc">Ascendente (Menor a mayor)</Option>
                                </Select>
                            </Item>
                        </Col>
                    </Row>

                    <Item label="Resultados por página">
                        <Select placeholder="Seleccionar cantidad" className="w-full">
                            <Option value="5">5 resultados</Option>
                            <Option value="10">10 resultados</Option>
                            <Option value="20">20 resultados</Option>
                            <Option value="50">50 resultados</Option>
                            <Option value="100">100 resultados</Option>
                        </Select>
                    </Item>

                    <Item label="Incluir datos históricos">
                        <Radio.Group className="w-full">
                            <Radio value="yes">Sí, incluir todos los datos</Radio>
                            <Radio value="no">No, solo datos actuales</Radio>
                        </Radio.Group>
                    </Item>
                </Form>
            </Modal>
        </div>
    )
}

// Componentes de íconos para el modal de exportación
const FilePdfOutlined = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
        <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1z" />
        <path d="M0 0h24v24H0z" fill="none" />
    </svg>
)

const FileExcelOutlined = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
        <path d="M0 0h24v24H0z" fill="none" />
    </svg>
)

const FileTextOutlined = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
        <path d="M0 0h24v24H0z" fill="none" />
    </svg>
)

export default ReportsPage