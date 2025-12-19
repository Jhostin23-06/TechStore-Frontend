import React from 'react'
import { Card, Form, Input, Select, DatePicker, Button, Space } from 'antd'
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

export type FilterFieldType = 'text' | 'select' | 'date' | 'dateRange' | 'number'

export interface FilterField {
  name: string
  label: string
  type: FilterFieldType  // Usar el tipo literal
  options?: Array<{ label: string; value: string | number }>
  placeholder?: string
}

export interface AdvancedFiltersProps {
  fields: FilterField[]  // Ahora usa FilterField con tipo literal
  onFilter: (values: any) => void
  onReset: () => void
  loading?: boolean
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  fields,
  onFilter,
  onReset,
  loading = false,
}) => {
  const [form] = Form.useForm()

  const handleSubmit = (values: any) => {
    onFilter(values)
  }

  const handleReset = () => {
    form.resetFields()
    onReset()
  }

  const renderField = (field: FilterField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder || `Buscar ${field.label.toLowerCase()}`}
            allowClear
          />
        )
      
      case 'select':
        return (
          <Select
            placeholder={field.placeholder || `Seleccionar ${field.label.toLowerCase()}`}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {field.options?.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        )
      
      case 'date':
        return <DatePicker className="w-full" />
      
      case 'dateRange':
        return <RangePicker className="w-full" />
      
      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder || field.label}
            allowClear
          />
        )
      
      default:
        return null
    }
  }

  return (
    <Card size="small" className="mb-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fields.map(field => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              className="mb-0"
            >
              {renderField(field)}
            </Form.Item>
          ))}
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            disabled={loading}
          >
            Limpiar
          </Button>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            htmlType="submit"
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Buscar
          </Button>
        </div>
      </Form>
    </Card>
  )
}

export default AdvancedFilters