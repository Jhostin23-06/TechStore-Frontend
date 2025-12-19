import React from 'react'
import { Select, Radio, Space } from 'antd'
import { FileTextOutlined, FileDoneOutlined } from '@ant-design/icons'
import { DocumentType } from '@/types/api.types'
import { useTheme } from '@/contexts/ThemeContext'

const { Option } = Select

interface DocumentTypeSelectorProps {
  value?: DocumentType
  onChange?: (value: DocumentType) => void
  showLabels?: boolean
}

const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
  value = DocumentType.BOLETA,
  onChange,
  showLabels = true
}) => {
  const { mode } = useTheme()

  return (
    <div className="space-y-2">
      {showLabels && (
        <label className={`block text-sm font-medium ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Tipo de Documento
        </label>
      )}
      
      <Radio.Group 
        value={value} 
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full"
      >
        <Space direction="vertical" className="w-full">
          <Radio 
            value={DocumentType.BOLETA} 
            className={`w-full p-3 rounded-lg border ${
              mode === 'dark' 
                ? 'border-gray-700 hover:border-gray-600' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center">
              <FileTextOutlined className="mr-2 text-blue-500" />
              <div>
                <div className="font-medium">Boleta de Venta</div>
                <div className={`text-xs ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Para público en general
                </div>
              </div>
            </div>
          </Radio>
          
          <Radio 
            value={DocumentType.FACTURA} 
            className={`w-full p-3 rounded-lg border ${
              mode === 'dark' 
                ? 'border-gray-700 hover:border-gray-600' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center">
              <FileDoneOutlined className="mr-2 text-green-500" />
              <div>
                <div className="font-medium">Factura</div>
                <div className={`text-xs ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Para empresas con RUC
                </div>
              </div>
            </div>
          </Radio>
        </Space>
      </Radio.Group>
    </div>
  )
}

export default DocumentTypeSelector