import React, { useEffect } from 'react'
import { Modal, Form, Input, Button } from 'antd'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Category, CreateCategory, UpdateCategory } from '@/types/api.types'

const { TextArea } = Input

// Esquema de validación
const categorySchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  open: boolean
  onClose: () => void
  category?: Category
  onSubmit: (data: CreateCategory | UpdateCategory) => Promise<void>
  isSubmitting: boolean
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  open,
  onClose,
  category,
  onSubmit,
  isSubmitting,
}) => {
  const isEditing = !!category

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          nombre: category.nombre,
          descripcion: category.descripcion || '',
        })
      } else {
        reset({
          nombre: '',
          descripcion: '',
        })
      }
    }
  }, [open, category, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditing && category) {
        await onSubmit({ id: category.id, ...data } as UpdateCategory)
      } else {
        await onSubmit(data as CreateCategory)
      }
      reset()
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Modal
      title={isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form
        layout="vertical"
        onFinish={handleSubmit(handleFormSubmit)}
        className="mt-4"
      >
        <Form.Item
          label="Nombre de la Categoría"
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
                placeholder="Ej: Electrónica, Computadoras, etc."
                size="middle"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Descripción"
          validateStatus={errors.descripcion ? 'error' : ''}
          help={errors.descripcion?.message}
        >
          <Controller
            name="descripcion"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                placeholder="Descripción de la categoría..."
                rows={3}
                size="middle"
              />
            )}
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end space-x-2">
            <Button onClick={handleClose} size="middle">
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="middle"
              loading={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CategoryForm