import React, { useState, useEffect } from 'react'
import {
    Modal, Form, Input, Button, Select, Table,
    InputNumber, Space, Tag, Card, Divider, Alert, message
} from 'antd'
import {
    PlusOutlined, DeleteOutlined, ShoppingCartOutlined,
    DollarOutlined, UserOutlined
} from '@ant-design/icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CreateSale, Client, Product, PaymentMethod } from '@/types/api.types'
import { useTheme } from '@/contexts/ThemeContext' // Importar el hook
import DocumentTypeSelector from './DocumentTypeSelector'
import { DocumentType } from '@/types/api.types'

const { Option } = Select

// Esquema para detalle de venta
const saleDetailSchema = z.object({
    productoId: z.number().min(1, 'Seleccione un producto'),
    cantidad: z.number().min(1, 'La cantidad debe ser al menos 1'),
    precioUnitario: z.number().min(0, 'El precio no puede ser negativo'),
})

// Esquema para venta
const saleSchema = z.object({
    clienteId: z.number().min(1, 'Seleccione un cliente'),
    metodoPago: z.string().min(1, 'Seleccione un método de pago'),
})

type SaleFormData = z.infer<typeof saleSchema>

interface SaleDetailWithProduct {
    productoId: number
    cantidad: number
    precioUnitario: number
    producto?: Product
}

interface SaleFormProps {
    open: boolean
    onClose: () => void
    onSubmit: (data: CreateSale) => Promise<void>
    isSubmitting: boolean
    clients: Client[]
    products: Product[]
}

const SaleForm: React.FC<SaleFormProps> = ({
    open,
    onClose,
    onSubmit,
    isSubmitting,
    clients,
    products,
}) => {
    const { mode } = useTheme() // Obtener el modo actual
    const [selectedProducts, setSelectedProducts] = useState<SaleDetailWithProduct[]>([])
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
    const [cantidad, setCantidad] = useState<number>(1)
    const [tipoDocumento, setTipoDocumento] = useState<DocumentType>(DocumentType.BOLETA)

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<SaleFormData>({
        resolver: zodResolver(saleSchema),
        defaultValues: {
            clienteId: clients[0]?.id || 0,
            metodoPago: PaymentMethod.CASH,
        },
    })

    // Resetear todo cuando se abre/cierra el modal
    useEffect(() => {
        if (open) {
            resetForm()
        }
    }, [open, reset])

    const selectedClientId = watch('clienteId')
    const metodoPago = watch('metodoPago')

    // Calcular totales
    const subtotal = selectedProducts.reduce((sum, item) =>
        sum + (item.cantidad * item.precioUnitario), 0
    )
    const igv = subtotal * 0.18 // 18% IGV
    const total = subtotal + igv

    // Clases dinámicas basadas en el modo
    const modalClasses = mode === 'dark'
        ? 'bg-gray-900 text-gray-100'
        : 'bg-white text-gray-800'

    const inputClasses = mode === 'dark'
        ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'

    const cardClasses = mode === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'

    const labelClasses = mode === 'dark'
        ? 'text-gray-300'
        : 'text-gray-700'

    const tableRowClasses = mode === 'dark'
        ? 'bg-gray-800 hover:bg-gray-700'
        : 'bg-white hover:bg-gray-50'

    const agregarProducto = () => {
        if (!selectedProductId || cantidad < 1) return

        const producto = products.find(p => p.id === selectedProductId)
        if (!producto) {
            message.error('Producto no encontrado')
            return
        }

        // Verificar stock disponible
        if (producto.stock < cantidad) {
            message.warning(`Stock insuficiente. Disponible: ${producto.stock} unidades`)
            return
        }

        const nuevoDetalle: SaleDetailWithProduct = {
            productoId: selectedProductId,
            cantidad,
            precioUnitario: producto.precio,
            producto,
        }

        setSelectedProducts([...selectedProducts, nuevoDetalle])
        setSelectedProductId(null)
        setCantidad(1)
    }

    const eliminarProducto = (index: number) => {
        const nuevosProductos = [...selectedProducts]
        nuevosProductos.splice(index, 1)
        setSelectedProducts(nuevosProductos)
    }

    const handleFormSubmit = async (data: SaleFormData) => {
        try {
            // Preparar los detalles para enviar al backend
            const saleData: CreateSale = {
                clienteId: data.clienteId,
                metodoPago: data.metodoPago,
                tipoDocumento: tipoDocumento,
                detalles: selectedProducts.map(item => ({
                    productoId: item.productoId,
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario,
                }))
            }

            await onSubmit(saleData)
            onClose()
            resetForm()
        } catch (error: any) {
            message.error(`Error al registrar venta: ${error.message}`)
        }
    }

    const resetForm = () => {
        setSelectedProducts([])
        setSelectedProductId(null)
        setCantidad(1)
        reset({
            clienteId: clients[0]?.id || 0,
            metodoPago: PaymentMethod.CASH,
        })
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const columns = [
        {
            title: <span className={labelClasses}>Producto</span>,
            dataIndex: 'producto',
            key: 'producto',
            render: (producto: Product | undefined) => (
                <div>
                    <div className={`font-medium ${mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                        {producto?.nombre || 'N/A'}
                    </div>
                    <div className={`text-xs ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {producto?.codigo || 'N/A'}
                    </div>
                </div>
            ),
        },
        {
            title: <span className={labelClasses}>Cantidad</span>,
            dataIndex: 'cantidad',
            key: 'cantidad',
            width: 100,
        },
        {
            title: <span className={labelClasses}>Precio Unit.</span>,
            dataIndex: 'precioUnitario',
            key: 'precioUnitario',
            render: (precio: number) => (
                <span className={mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}>
                    S/. {precio.toFixed(2)}
                </span>
            ),
            width: 120,
        },
        {
            title: <span className={labelClasses}>Subtotal</span>,
            key: 'subtotal',
            render: (_: any, record: SaleDetailWithProduct) => (
                <span className={`font-semibold ${mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                    S/. {(record.cantidad * record.precioUnitario).toFixed(2)}
                </span>
            ),
            width: 120,
        },
        {
            title: <span className={labelClasses}>Acciones</span>,
            key: 'actions',
            width: 80,
            render: (_: any, __: any, index: number) => (
                <Button
                    type="text"
                    icon={<DeleteOutlined className={mode === 'dark' ? 'text-red-400' : 'text-red-600'} />}
                    onClick={() => eliminarProducto(index)}
                    className={mode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                />
            ),
        },
    ]

    // Filtrar productos con stock
    const productosConStock = products.filter(p => p.stock > 0)

    return (
        <Modal
            title="Nueva Venta"
            open={open}
            onCancel={handleClose}
            footer={null}
            width={1200}
            destroyOnClose
        >
            <Form
                layout="vertical"
                onFinish={handleSubmit(handleFormSubmit)}
                className="mt-4"
            >
                <div className="grid grid-cols-2 gap-6">
                    {/* Columna Izquierda: Información de la venta */}
                    <div>
                        <Card
                            title={<span className={labelClasses}>Información de la Venta</span>}
                            size="small"
                            className={`mb-4 ${cardClasses}`}
                        >
                            <Form.Item
                                label={<span className={labelClasses}>Cliente</span>}
                                validateStatus={errors.clienteId ? 'error' : ''}
                                help={errors.clienteId?.message}
                                required
                            >
                                <Controller
                                    name="clienteId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            placeholder="Seleccionar cliente"
                                            size="middle"
                                            className={`w-full ${inputClasses}`}
                                            showSearch
                                            optionFilterProp="children"
                                            dropdownClassName={mode === 'dark' ? 'bg-gray-800 border-gray-700' : ''}
                                        >
                                            {clients.map(client => (
                                                <Option key={client.id} value={client.id}>
                                                    <div className="flex items-center">
                                                        <UserOutlined className={`mr-2 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                                                        <div>
                                                            <div className={mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}>
                                                                {client.nombre}
                                                            </div>
                                                            <div className={`text-xs ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                DNI: {client.dniRuc}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Option>
                                            ))}
                                        </Select>
                                    )}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className={labelClasses}>Método de Pago</span>}
                                validateStatus={errors.metodoPago ? 'error' : ''}
                                help={errors.metodoPago?.message}
                                required
                            >
                                <Controller
                                    name="metodoPago"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            placeholder="Seleccionar método"
                                            size="middle"
                                            className={`w-full ${inputClasses}`}
                                            dropdownClassName={mode === 'dark' ? 'bg-gray-800 border-gray-700' : ''}
                                        >
                                            <Option value={PaymentMethod.CASH}>
                                                <span className={mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}>Efectivo</span>
                                            </Option>
                                            <Option value={PaymentMethod.CARD}>
                                                <span className={mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}>Tarjeta</span>
                                            </Option>
                                            <Option value={PaymentMethod.TRANSFER}>
                                                <span className={mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}>Transferencia</span>
                                            </Option>
                                        </Select>
                                    )}
                                />
                            </Form.Item>

                            <div className="mb-4">
                                <DocumentTypeSelector
                                    value={tipoDocumento}
                                    onChange={setTipoDocumento}
                                />
                            </div>

                        </Card>

                        {/* Agregar Productos */}
                        <Card
                            title={<span className={labelClasses}>Agregar Productos</span>}
                            size="small"
                            className={cardClasses}
                        >
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <Select
                                            placeholder="Seleccionar producto"
                                            value={selectedProductId}
                                            onChange={setSelectedProductId}
                                            className={`w-full ${inputClasses}`}
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
                                            }
                                            dropdownClassName={mode === 'dark' ? 'bg-gray-800 border-gray-700' : ''}
                                        >
                                            {productosConStock.map(product => (
                                                <Option key={product.id} value={product.id}>
                                                    <div>
                                                        <div className={mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}>
                                                            {product.nombre}
                                                        </div>
                                                        <div className={`text-xs ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Stock: {product.stock} | S/. {product.precio.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div>
                                        <InputNumber
                                            placeholder="Cant."
                                            value={cantidad}
                                            onChange={value => setCantidad(value || 1)}
                                            min={1}
                                            className={`w-full ${inputClasses}`}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={agregarProducto}
                                    className={`w-full ${mode === 'dark'
                                        ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-gray-200'
                                        : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800'
                                        }`}
                                    disabled={!selectedProductId || cantidad < 1}
                                >
                                    Agregar Producto
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Columna Derecha: Resumen de la venta */}
                    <div>
                        <Card
                            title={<span className={labelClasses}>Resumen de la Venta</span>}
                            size="small"
                            className={cardClasses}
                        >
                            {selectedProducts.length === 0 ? (
                                <Alert
                                    message="No hay productos"
                                    description="Agregue productos a la venta"
                                    type="info"
                                    showIcon
                                    className={mode === 'dark' ? 'bg-gray-900 border-gray-700' : ''}
                                />
                            ) : (
                                <>
                                    <Table
                                        dataSource={selectedProducts}
                                        columns={columns}
                                        rowKey={(record, index) => `${record.productoId}-${index}`}
                                        pagination={false}
                                        size="small"
                                        className="mb-4"
                                        rowClassName={() => tableRowClasses}
                                    />

                                    <Divider className={`my-3 ${mode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className={mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                                Subtotal:
                                            </span>
                                            <span className={`font-medium ${mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                                S/. {subtotal.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                                IGV (18%):
                                            </span>
                                            <span className={`font-medium ${mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                                S/. {igv.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className={`flex justify-between text-lg font-bold border-t pt-2 ${mode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <span className={mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}>
                                                Total:
                                            </span>
                                            <span className="text-green-500">
                                                S/. {total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card>
                    </div>
                </div>

                <div className="mt-6">
                    <Form.Item className="mb-0">
                        <div className="flex justify-between items-center">
                            <div>
                                {selectedProducts.length > 0 && (
                                    <Tag
                                        color={mode === 'dark' ? 'blue' : 'processing'}
                                        icon={<ShoppingCartOutlined />}
                                        className={mode === 'dark' ? 'border-blue-800 bg-blue-900/20' : ''}
                                    >
                                        <span className={mode === 'dark' ? 'text-blue-200' : ''}>
                                            {selectedProducts.length} producto(s) | Total: S/. {total.toFixed(2)}
                                        </span>
                                    </Tag>
                                )}
                            </div>
                            <Space>
                                <Button
                                    onClick={onClose}
                                    size="middle"
                                    className={mode === 'dark'
                                        ? 'text-gray-300 border-gray-600 hover:border-gray-500 hover:text-gray-200'
                                        : 'text-gray-700 border-gray-300 hover:border-gray-400 hover:text-gray-800'
                                    }
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="middle"
                                    loading={isSubmitting}
                                    disabled={selectedProducts.length === 0}
                                    icon={<DollarOutlined />}
                                    className={`${mode === 'dark'
                                        ? 'bg-green-700 hover:bg-green-600 border-green-600'
                                        : 'bg-green-600 hover:bg-green-700 border-green-600 hover:text-white'
                                        }`}
                                >
                                    Registrar Venta
                                </Button>
                            </Space>
                        </div>
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    )
}

export default SaleForm