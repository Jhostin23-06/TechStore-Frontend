import { FormInstance } from 'antd'

// Props para componentes
export interface ModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export interface FormModalProps<T> extends ModalProps {
  data?: T
  isEditing?: boolean
}

export interface FormProps<T> {
  form?: FormInstance<T>
  onSubmit: (values: T) => Promise<void>
  initialValues?: Partial<T>
  loading?: boolean
}

// Tipo más simple para columnas
export type ColumnDefinition<T> = {
  title: string
  dataIndex?: keyof T
  key: string
  width?: number
  align?: 'left' | 'center' | 'right'
  render?: (value: any, record: T, index: number) => React.ReactNode
  sorter?: (a: T, b: T) => number
  filters?: Array<{ text: string; value: string | number }>
  onFilter?: (value: any, record: T) => boolean
}