import React, { useState } from 'react'
import { Card, Typography, Space, Tooltip, theme, Progress } from 'antd'
import { InfoCircleOutlined, PieChartOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { useToken } = theme

interface EnhancedPieChartProps {
  title: string
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  height?: number
  showDonut?: boolean
  showLabels?: boolean
}

const EnhancedPieChart: React.FC<EnhancedPieChartProps> = ({ 
  title, 
  data, 
  height = 320,
  showDonut = true,
  showLabels = true
}) => {
  const { token } = useToken()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  // Colores por defecto
  const defaultColors = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
    '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'
  ]
  
  // Calcular ángulos para el gráfico de torta
  let cumulativeAngle = 0
  const segments = data.map((item, index) => {
    const percentage = total > 0 ? item.value / total : 0
    const angle = percentage * 360
    const startAngle = cumulativeAngle
    cumulativeAngle += angle
    
    return {
      ...item,
      percentage,
      startAngle,
      angle,
      color: item.color || defaultColors[index % defaultColors.length],
      endAngle: startAngle + angle
    }
  })
  
  const chartSize = Math.min(height - 100, 450)
  const radius = chartSize / 3
  const donutRadius = showDonut ? radius * 0.6 : 0
  const centerX = chartSize / 2
  const centerY = chartSize / 2

  // Función para convertir grados a coordenadas SVG
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  // Función para crear path de arco SVG
  const describeArc = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const start = polarToCartesian(centerX, centerY, outerRadius, endAngle)
    const end = polarToCartesian(centerX, centerY, outerRadius, startAngle)
    const innerStart = polarToCartesian(centerX, centerY, innerRadius, endAngle)
    const innerEnd = polarToCartesian(centerX, centerY, innerRadius, startAngle)
    
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    
    const path = [
      'M', start.x, start.y,
      'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z'
    ].join(' ')
    
    return path
  }

  return (
    <Card 
      title={
        <div className="flex justify-between items-center">
          <Space className='flex items-center justify-center'>
            <PieChartOutlined style={{ color: token.colorPrimary }} />
            <Title level={5} className="!mb-0 !mt-0" >{title}</Title>
          </Space>
          <Tooltip title={`Total: ${total.toLocaleString()}`}>
            <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
          </Tooltip>
        </div>
      }
      className="hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex flex-col md:flex-row">
        {/* Gráfico SVG */}
        <div className="flex-1 flex justify-center items-center p-4">
          <svg 
            width={chartSize} 
            height={chartSize} 
            className="transform transition-transform duration-300 hover:scale-105"
          >
            {/* Segmentos del gráfico */}
            {segments.map((segment, index) => {
              const isHovered = hoveredIndex === index
              const segmentRadius = isHovered ? radius + 5 : radius
              
              return (
                <g key={index}>
                  {/* Segmento principal */}
                  <path
                    d={describeArc(segment.startAngle, segment.endAngle, donutRadius, segmentRadius)}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'none',
                      transformOrigin: `${centerX}px ${centerY}px`,
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  
                  {/* Etiqueta en el segmento */}
                  {showLabels && segment.percentage > 0.1 && (
                    <text
                      x={centerX}
                      y={centerY}
                      textAnchor="middle"
                      dy="0.3em"
                      className="text-xs font-bold fill-white pointer-events-none"
                      style={{
                        fontSize: isHovered ? '13px' : '11px',
                        transition: 'font-size 0.3s'
                      }}
                    >
                      {segment.label.substring(0, 8)}{segment.label.length > 8 ? '...' : ''}
                    </text>
                  )}
                </g>
              )
            })}
            
            {/* Centro del donut */}
            {showDonut && (
              <circle
                cx={centerX}
                cy={centerY}
                r={donutRadius * 0.8}
                fill="white"
                className="shadow-inner"
              />
            )}
            
            {/* Texto central */}
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dy="0.1em"
              className="font-bold text-gray-700"
              style={{ fontSize: '14px', marginBottom: 10 }}
            >
              Total
            </text>
            <text
              x={centerX}
              y={centerY + 20}
              textAnchor="middle"
              className="text-lg font-bold"
              fill={token.colorPrimary}
              style={{
                marginTop: 10
              }}
            >
              {total.toLocaleString()}
            </text>
          </svg>
        </div>

        {/* Leyenda y detalles */}
        <div className="flex-1 p-4 border-l border-gray-100">
          <Title level={5} className="mb-4">Detalles por Categoría</Title>
          
          <Space direction="vertical" className="w-full">
            {segments.map((segment, index) => {
              const isHovered = hoveredIndex === index
              
              return (
                <div 
                  key={index}
                  className={`p-3 rounded-lg transition-all duration-200 cursor-pointer ${isHovered ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-3 shadow-sm"
                        style={{ backgroundColor: segment.color }}
                      />
                      <Text strong className={isHovered ? 'text-blue-600' : ''}>
                        {segment.label}
                      </Text>
                    </div>
                    <div className="text-right">
                      <Text strong className="text-lg">
                        {segment.value.toLocaleString()}
                      </Text>
                      <Text type="secondary" className="block text-xs">
                        {segment.percentage.toFixed(1)}%
                      </Text>
                    </div>
                  </div>
                  
                  <Progress 
                    percent={segment.percentage * 100}
                    strokeColor={segment.color}
                    showInfo={false}
                    size="small"
                    className="mb-1"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>{Math.round(segment.value / 2).toLocaleString()}</span>
                    <span>{segment.value.toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </Space>

          {/* Estadísticas */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Text type="secondary" className="text-xs block">Categorías</Text>
                <Text strong className="text-2xl">{segments.length}</Text>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Text type="secondary" className="text-xs block">Mayor %</Text>
                <Text strong className="text-2xl text-green-600">
                  {Math.max(...segments.map(s => s.percentage * 100)).toFixed(1)}%
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default EnhancedPieChart