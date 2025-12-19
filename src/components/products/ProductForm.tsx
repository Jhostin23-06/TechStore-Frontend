import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Select, Button } from 'antd'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Product, CreateProduct, UpdateProduct } from '@/types/api.types'
import { Category } from '@/types/api.types'
import CurrencyInput from '../common/CurrencyInput'
import { useTheme } from '@/contexts/ThemeContext' // Importar el hook

const { TextArea } = Input

// Esquema base para producto
const productSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    marca: z.string().min(2, 'La marca es requerida'),
    modelo: z.string().optional(),
    descripcion: z.string().optional(),
    precio: z.number().min(0, 'El precio no puede ser negativo'),
    stock: z.number().int().min(0, 'El stock no puede ser negativo'),
    codigo: z.string().min(3, 'El código debe tener al menos 3 caracteres'),
    categoriaId: z.number().min(1, 'Seleccione una categoría'),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
    open: boolean
    onClose: () => void
    product?: Product
    onSubmit: (data: CreateProduct | UpdateProduct) => Promise<void>
    isSubmitting: boolean
    categories: Category[]
}

const ProductForm: React.FC<ProductFormProps> = ({
    open,
    onClose,
    product,
    onSubmit,
    isSubmitting,
    categories,
}) => {
    const { mode } = useTheme() // Obtener el modo actual
    const isEditing = !!product

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            nombre: '',
            marca: '',
            modelo: '',
            descripcion: '',
            precio: 0,
            stock: 0,
            codigo: '',
            categoriaId: categories[0]?.id || 1,
        },
    })

    // Resetear formulario cuando cambia el producto o se abre/cierra
    useEffect(() => {
        if (open) {
            if (product) {
                reset({
                    nombre: product.nombre,
                    marca: product.marca,
                    modelo: product.modelo || '',
                    descripcion: product.descripcion || '',
                    precio: product.precio,
                    stock: product.stock,
                    codigo: product.codigo,
                    categoriaId: product.categoriaId,
                })
            } else {
                reset({
                    nombre: '',
                    marca: '',
                    modelo: '',
                    descripcion: '',
                    precio: 0,
                    stock: 0,
                    codigo: '',
                    categoriaId: categories[0]?.id || 1,
                })
            }
        }
    }, [open, product, reset, categories])

    // Función para manejar el cierre del modal
    const handleClose = () => {
        reset() // Limpiar formulario
        onClose() // Cerrar modal
    }

    const handleFormSubmit = async (data: ProductFormData) => {
        try {
            if (isEditing && product) {
                await onSubmit({ id: product.id, ...data } as UpdateProduct)
            } else {
                await onSubmit(data as CreateProduct)
            }
            reset() // Limpiar formulario después de guardar
            onClose() // Cerrar modal
        } catch (error) {
            console.error('Error submitting form:', error)
        }
    }

    // Clases dinámicas basadas en el modo
    const modalClasses = mode === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-white text-gray-800'
    
    const inputClasses = mode === 'dark'
        ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'

    const labelClasses = mode === 'dark'
        ? 'text-gray-300'
        : 'text-gray-700'

    const buttonClasses = mode === 'dark'
        ? 'bg-blue-700 hover:bg-blue-600 border-blue-600'
        : 'bg-blue-600 hover:bg-blue-700 border-blue-600'

    return (
        <Modal
            title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            open={open}
            onCancel={handleClose}
            footer={null}
            width={600}
            destroyOnClose
            className={`${modalClasses} transition-colors duration-300`}
        >
            <Form
                layout="vertical"
                onFinish={handleSubmit(handleFormSubmit)}
                className="mt-4"
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        label={<span className={labelClasses}>Código</span>}
                        validateStatus={errors.codigo ? 'error' : ''}
                        help={errors.codigo?.message}
                        required
                    >
                        <Controller
                            name="codigo"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder="Ej: PROD-001"
                                    size="middle"
                                    className={inputClasses}
                                />
                            )}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className={labelClasses}>Categoría</span>}
                        validateStatus={errors.categoriaId ? 'error' : ''}
                        help={errors.categoriaId?.message}
                        required
                    >
                        <Controller
                            name="categoriaId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    placeholder="Seleccionar categoría"
                                    size="middle"
                                    className={inputClasses}
                                    dropdownClassName={mode === 'dark' ? 'bg-gray-800' : ''}
                                    options={categories.map(cat => ({
                                        value: cat.id,
                                        label: cat.nombre,
                                    }))}
                                />
                            )}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    label={<span className={labelClasses}>Nombre del Producto</span>}
                    validateStatus={errors.nombre ? 'error' : ''}
                    help={errors.nombre?.message}
                    required
                >
                    <Controller
                        name="nombre"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="Ej: Laptop Dell XPS 13"
                                size="middle"
                                className={inputClasses}
                            />
                        )}
                    />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        label={<span className={labelClasses}>Marca</span>}
                        validateStatus={errors.marca ? 'error' : ''}
                        help={errors.marca?.message}
                        required
                    >
                        <Controller
                            name="marca"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder="Ej: Dell, HP, etc."
                                    size="middle"
                                    className={inputClasses}
                                />
                            )}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className={labelClasses}>Modelo</span>}
                        validateStatus={errors.modelo ? 'error' : ''}
                        help={errors.modelo?.message}
                    >
                        <Controller
                            name="modelo"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder="Ej: XPS 13 9310"
                                    size="middle"
                                    className={inputClasses}
                                />
                            )}
                        />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        label={<span className={labelClasses}>Precio</span>}
                        validateStatus={errors.precio ? 'error' : ''}
                        help={errors.precio?.message}
                        required
                    >
                        <Controller
                            name="precio"
                            control={control}
                            render={({ field }) => (
                                <CurrencyInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="0.00"
                                    size="middle"
                                    className={`w-full ${inputClasses}`}
                                />
                            )}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className={labelClasses}>Stock</span>}
                        validateStatus={errors.stock ? 'error' : ''}
                        help={errors.stock?.message}
                        required
                    >
                        <Controller
                            name="stock"
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    {...field}
                                    placeholder="0"
                                    size="middle"
                                    min={0}
                                    className={`w-full ${inputClasses}`}
                                />
                            )}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    label={<span className={labelClasses}>Descripción</span>}
                    validateStatus={errors.descripcion ? 'error' : ''}
                    help={errors.descripcion?.message}
                >
                    <Controller
                        name="descripcion"
                        control={control}
                        render={({ field }) => (
                            <TextArea
                                {...field}
                                placeholder="Descripción del producto..."
                                rows={3}
                                size="middle"
                                className={inputClasses}
                            />
                        )}
                    />
                </Form.Item>

                <Form.Item className="mb-0">
                    <div className="flex justify-end space-x-2">
                        <Button 
                            onClick={handleClose} 
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
                            className={buttonClasses}
                        >
                            {isEditing ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ProductForm