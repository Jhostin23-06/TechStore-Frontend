import React from 'react'
import { Button, Dropdown, MenuProps } from 'antd'
import { ExportOutlined, FileExcelOutlined, FilePdfOutlined, PrinterOutlined } from '@ant-design/icons'
import { exportToExcel, exportToPDF, printTable } from '@/utils/exportUtils'
import { useTheme } from '@/contexts/ThemeContext'

interface ExportColumn {
  title: string
  dataIndex: string | string[]
  render?: (value: any, record: any) => React.ReactNode
}

interface ExportButtonProps {
  data: any[]
  filename: string
  columns: ExportColumn[]
  buttonText?: string
  disabled?: boolean
}

// Función para obtener valores de objetos anidados
const getNestedValue = (obj: any, path: string | string[]): any => {
  if (typeof path === 'string') {
    return obj[path]
  }
  
  // Si es array, navegar a través de los objetos anidados
  return path.reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  columns,
  buttonText = 'Exportar',
  disabled = false,
}) => {
  const { mode } = useTheme()

  const handleExportExcel = () => {
    const simpleData = data.map(item => {
      const obj: any = {}
      columns.forEach(col => {
        const value = getNestedValue(item, col.dataIndex)
        obj[col.title] = col.render ? col.render(value, item) : value
      })
      return obj
    })
    exportToExcel(simpleData, filename)
  }

  const handleExportPDF = () => {
    // Para PDF, creamos columnas simplificadas
    const simpleColumns = columns.map(col => ({
      title: col.title,
      dataIndex: Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex
    }))
    
    // Creamos datos simplificados para PDF
    const simpleData = data.map(item => {
      const obj: any = {}
      columns.forEach(col => {
        obj[Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex] = 
          getNestedValue(item, col.dataIndex)
      })
      return obj
    })
    
    exportToPDF(simpleData, simpleColumns, filename)
  }

  const handlePrint = () => {
    const simpleColumns = columns.map(col => ({
      title: col.title,
      dataIndex: Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex
    }))
    
    const simpleData = data.map(item => {
      const obj: any = {}
      columns.forEach(col => {
        obj[Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex] = 
          getNestedValue(item, col.dataIndex)
      })
      return obj
    })
    
    printTable(simpleData, simpleColumns, filename)
  }

  const items: MenuProps['items'] = [
    {
      key: 'excel',
      icon: <FileExcelOutlined />,
      label: 'Exportar a Excel',
      onClick: handleExportExcel,
    },
    {
      key: 'pdf',
      icon: <FilePdfOutlined />,
      label: 'Exportar a PDF',
      onClick: handleExportPDF,
    },
    {
      key: 'print',
      icon: <PrinterOutlined />,
      label: 'Imprimir',
      onClick: handlePrint,
    },
  ]

  return (
    <Dropdown 
      menu={{ items }} 
      placement="bottomRight"
      disabled={disabled || data.length === 0}
    >
      <Button 
        icon={<ExportOutlined />}
        className={mode === 'dark' 
          ? 'border-gray-600 hover:border-gray-500' 
          : 'border-gray-300 hover:border-gray-400'
        }
        disabled={disabled || data.length === 0}
      >
        {buttonText}
      </Button>
    </Dropdown>
  )
}

export default ExportButton