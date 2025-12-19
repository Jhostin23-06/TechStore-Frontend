import React, { useState } from 'react'
import { Card, Select, Radio, Space, Empty } from 'antd'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, Bar } from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'

const { Option } = Select

interface TrendData {
  date: string
  sales: number
  revenue: number
  products: number
  customers: number
}

interface TrendChartProps {
  data: TrendData[]
  title?: string
  height?: number
  showControls?: boolean
  isLoading?: boolean
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title = 'Análisis de Tendencias',
  height = 300,
  showControls = true,
  isLoading = false,
}) => {
  const { mode } = useTheme()
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line')
  const [metric, setMetric] = useState<'sales' | 'revenue' | 'products' | 'customers'>('sales')

  const getMetricConfig = () => {
    const configs = {
      sales: { 
        color: mode === 'dark' ? '#60A5FA' : '#1890ff',
        name: 'Ventas',
        unit: ' ventas'
      },
      revenue: { 
        color: mode === 'dark' ? '#34D399' : '#52c41a',
        name: 'Ingresos',
        unit: ' S/.'
      },
      products: { 
        color: mode === 'dark' ? '#A78BFA' : '#722ed1',
        name: 'Productos Vendidos',
        unit: ' productos'
      },
      customers: { 
        color: mode === 'dark' ? '#FBBF24' : '#faad14',
        name: 'Clientes',
        unit: ' clientes'
      },
    }
    return configs[metric]
  }

  const config = getMetricConfig()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg ${
          mode === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          <p className={`font-medium ${mode === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
              {entry.name}: <span className="font-bold ml-1">
                {entry.value.toLocaleString()}
                {config.unit}
              </span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      dataKey: metric,
      stroke: config.color,
      fill: mode === 'dark' ? `${config.color}40` : `${config.color}20`,
      strokeWidth: 2,
      activeDot: { 
        r: 6, 
        stroke: config.color, 
        strokeWidth: 2,
        fill: mode === 'dark' ? '#1F2937' : '#FFFFFF'
      },
    }

    switch (chartType) {
      case 'area':
        return <Area {...commonProps} />
      case 'bar':
        return <Bar {...commonProps} fill={config.color} />
      default:
        return <Line {...commonProps} />
    }
  }

  // Si no hay datos, mostrar estado vacío
  if (data.length === 0 && !isLoading) {
    return (
      <Card 
        title={title}
        className={mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      >
        <Empty 
          description="No hay datos de tendencias disponibles"
          className="py-8"
          imageStyle={{ 
            height: 80,
            opacity: mode === 'dark' ? 0.3 : 0.5
          }}
        />
      </Card>
    )
  }

  return (
    <Card 
      title={title}
      className={mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      extra={
        showControls && (
          <Space>
            <Radio.Group value={chartType} onChange={e => setChartType(e.target.value)} size="small">
              <Radio.Button value="line">Línea</Radio.Button>
              <Radio.Button value="area">Área</Radio.Button>
              <Radio.Button value="bar">Barras</Radio.Button>
            </Radio.Group>
            
            <Select 
              value={metric} 
              onChange={setMetric} 
              size="small"
              className="w-40"
              dropdownClassName={mode === 'dark' ? 'bg-gray-800' : ''}
            >
              <Option value="sales">Ventas</Option>
              <Option value="revenue">Ingresos</Option>
              <Option value="products">Productos</Option>
              <Option value="customers">Clientes</Option>
            </Select>
          </Space>
        )
      }
      loading={isLoading}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={mode === 'dark' ? '#374151' : '#e5e7eb'}
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            stroke={mode === 'dark' ? '#9CA3AF' : '#6B7280'}
            tick={{ fill: mode === 'dark' ? '#9CA3AF' : '#6B7280' }}
            axisLine={{ stroke: mode === 'dark' ? '#374151' : '#e5e7eb' }}
          />
          <YAxis 
            stroke={mode === 'dark' ? '#9CA3AF' : '#6B7280'}
            tick={{ fill: mode === 'dark' ? '#9CA3AF' : '#6B7280' }}
            axisLine={{ stroke: mode === 'dark' ? '#374151' : '#e5e7eb' }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          {renderChart()}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

export default TrendChart