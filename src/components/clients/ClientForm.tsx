import React, { useEffect } from 'react'
import { Modal, Form, Input, Button } from 'antd'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Client, CreateClient, UpdateClient } from '@/types/api.types'

// Esquema de validación
const clientSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  dniRuc: z.string().min(8, 'El DNI/RUC debe tener al menos 8 caracteres'),
  direccion: z.string().min(5, 'La dirección es requerida'),
  telefono: z.string().min(9, 'El teléfono debe tener al menos 9 caracteres'),
  email: z.string().email('Email inválido'),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  open: boolean
  onClose: () => void
  client?: Client
  onSubmit: (data: CreateClient | UpdateClient) => Promise<void>
  isSubmitting: boolean
}

const ClientForm: React.FC<ClientFormProps> = ({
  open,
  onClose,
  client,
  onSubmit,
  isSubmitting,
}) => {
  const isEditing = !!client

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nombre: '',
      dniRuc: '',
      direccion: '',
      telefono: '',
      email: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (client) {
        reset({
          nombre: client.nombre,
          dniRuc: client.dniRuc,
          direccion: client.direccion,
          telefono: client.telefono,
          email: client.email,
        })
      } else {
        reset({
          nombre: '',
          dniRuc: '',
          direccion: '',
          telefono: '',
          email: '',
        })
      }
    }
  }, [open, client, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFormSubmit = async (data: ClientFormData) => {
    try {
      if (isEditing && client) {
        await onSubmit({ id: client.id, ...data } as UpdateClient)
      } else {
        await onSubmit(data as CreateClient)
      }
      reset()
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Modal
      title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        layout="vertical"
        onFinish={handleSubmit(handleFormSubmit)}
        className="mt-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Nombre Completo"
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
                  placeholder="Ej: Juan Pérez"
                  size="middle"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="DNI/RUC"
            validateStatus={errors.dniRuc ? 'error' : ''}
            help={errors.dniRuc?.message}
            required
          >
            <Controller
              name="dniRuc"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ej: 12345678"
                  size="middle"
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Email"
          validateStatus={errors.email ? 'error' : ''}
          help={errors.email?.message}
          required
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Ej: cliente@email.com"
                size="middle"
                type="email"
              />
            )}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Teléfono"
            validateStatus={errors.telefono ? 'error' : ''}
            help={errors.telefono?.message}
            required
          >
            <Controller
              name="telefono"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ej: 987654321"
                  size="middle"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Dirección"
            validateStatus={errors.direccion ? 'error' : ''}
            help={errors.direccion?.message}
            required
          >
            <Controller
              name="direccion"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ej: Av. Principal 123"
                  size="middle"
                />
              )}
            />
          </Form.Item>
        </div>

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

export default ClientForm