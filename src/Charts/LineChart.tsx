import React, { useState } from 'react'
import { Card, Typography, Select, Space, theme } from 'antd'
import { LineChartOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select
const { useToken } = theme

interface LineChartProps {
  title: string
  data: Array<{
    date: string
    value: number
    label?: string
  }>
  height?: number
  showTrend?: boolean
  timeRange?: 'day' | 'week' | 'month' | 'year'
}

const LineChart: React.FC<LineChartProps> = ({ 
  title, 
  data, 
  height = 300,
  showTrend = true,
  timeRange = 'month'
}) => {
  const { token } = useToken()
  const [selectedRange, setSelectedRange] = useState(timeRange)
  
  const values = data.map(d => d.value)
  const maxValue = Math.max(...values, 1)
  const minValue = Math.min(...values, 0)
  const chartHeight = height - 100
  const chartWidth = 100
  
  // Calcular tendencia
  const trend = values.length > 1 
    ? ((values[values.length - 1] - values[0]) / values[0]) * 100 
    : 0
  
  // Puntos para la línea
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1 || 1)) * chartWidth
    const y = ((maxValue - value) / (maxValue - minValue || 1)) * chartHeight
    return { x, y, value }
  })

  // Crear path para la línea
  const linePath = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  // Crear área bajo la línea
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight} L 0 ${chartHeight} Z`
    : ''

  return (
    <Card 
      title={
        <div className="flex justify-between items-center">
          <Space>
            <LineChartOutlined style={{ color: token.colorPrimary }} />
            <Title level={5} className="mb-0">{title}</Title>
          </Space>
          
          <Select 
            value={selectedRange} 
            onChange={setSelectedRange}
            size="small"
            style={{ width: 120 }}
          >
            <Option value="day">Hoy</Option>
            <Option value="week">Semana</Option>
            <Option value="month">Mes</Option>
            <Option value="year">Año</Option>
          </Select>
        </div>
      }
      className="hover:shadow-lg transition-shadow duration-300"
    >
      {/* Header con estadísticas */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Text type="secondary" className="text-xs">Valor Actual</Text>
          <Text strong className="text-3xl block">
            {values[values.length - 1]?.toLocaleString() || '0'}
          </Text>
        </div>
        
        {showTrend && (
          <div className={`text-right ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <div className="flex items-center justify-end">
              {trend >= 0 }
              <Text strong className="text-xl ml-2">
                {Math.abs(trend).toFixed(1)}%
              </Text>
            </div>
            <Text type="secondary" className="text-xs">
              {trend >= 0 ? 'Incremento' : 'Decremento'} vs inicio
            </Text>
          </div>
        )}
      </div>

      {/* Gráfico SVG */}
      <div style={{ height: chartHeight }} className="relative">
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid horizontal */}
          <g className="grid">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <g key={index}>
                <line
                  x1="0"
                  y1={ratio * chartHeight}
                  x2="100%"
                  y2={ratio * chartHeight}
                  stroke="#f0f0f0"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text
                  x="100%"
                  y={ratio * chartHeight}
                  dy="-5"
                  textAnchor="end"
                  className="text-xs fill-gray-400"
                  style={{ fontSize: '10px' }}
                >
                  {Math.round(maxValue - ratio * (maxValue - minValue)).toLocaleString()}
                </text>
              </g>
            ))}
          </g>

          {/* Área bajo la línea */}
          <path
            d={areaPath}
            fill="url(#areaGradient)"
            fillOpacity="0.3"
          />

          {/* Línea del gráfico */}
          <path
            d={linePath}
            fill="none"
            stroke={token.colorPrimary}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-drawLine"
          />

          {/* Puntos de datos */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="white"
                stroke={token.colorPrimary}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 hover:r-6"
              />
              
              {/* Tooltip en hover */}
              <g className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                <rect
                  x={point.x - 25}
                  y={point.y - 45}
                  width="50"
                  height="30"
                  rx="4"
                  fill="#333"
                  className="shadow-lg"
                />
                <text
                  x={point.x}
                  y={point.y - 30}
                  textAnchor="middle"
                  className="text-xs fill-white font-medium"
                >
                  {point.value.toLocaleString()}
                </text>
                <text
                  x={point.x}
                  y={point.y - 15}
                  textAnchor="middle"
                  className="text-xs fill-gray-300"
                >
                  {data[index].label || `Día ${index + 1}`}
                </text>
              </g>
            </g>
          ))}

          {/* Gradiente para el área */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={token.colorPrimary} stopOpacity="0.4" />
              <stop offset="100%" stopColor={token.colorPrimary} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Eje X con labels */}
      <div className="flex justify-between mt-2 px-4">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <Text type="secondary" className="text-xs block">
              {item.label || item.date.split('-').slice(1).join('/')}
            </Text>
            <div className="w-8 h-1 bg-gray-300 mx-auto mt-1 rounded-full" />
          </div>
        ))}
      </div>

      {/* Estadísticas footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <Text type="secondary" className="text-xs block">Promedio</Text>
            <Text strong className="text-lg">
              {(values.reduce((a, b) => a + b, 0) / values.length || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </Text>
          </div>
          <div className="text-center">
            <Text type="secondary" className="text-xs block">Máximo</Text>
            <Text strong className="text-lg text-green-600">
              {maxValue.toLocaleString()}
            </Text>
          </div>
          <div className="text-center">
            <Text type="secondary" className="text-xs block">Mínimo</Text>
            <Text strong className="text-lg text-red-600">
              {minValue.toLocaleString()}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default LineChart