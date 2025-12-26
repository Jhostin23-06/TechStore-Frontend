// EnhancedBarChart.tsx - Versión mejorada
import React from 'react'
import { Card, Typography, Tooltip, Space, theme } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { useToken } = theme

interface EnhancedBarChartProps {
  title: string
  data: Array<{
    label: string
    value: number
    color?: string
    percentage?: number
  }>
  height?: number
  showTooltip?: boolean
  showGrid?: boolean
  showLegend?: boolean
  unit?: string
  compact?: boolean // Nueva prop para modo compacto
}

const EnhancedBarChart: React.FC<EnhancedBarChartProps> = ({ 
  title, 
  data, 
  height = 320,
  showTooltip = true,
  showGrid = true,
  showLegend = true,
  unit = 'unidades',
  compact = false // Por defecto no compacto
}) => {
  const { token } = useToken()
  
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  // Colores por defecto con gradientes
  const defaultColors = [
    'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
    'linear-gradient(135deg, #faad14 0%, #f5222d 100%)',
    'linear-gradient(135deg, #722ed1 0%, #eb2f96 100%)',
    'linear-gradient(135deg, #13c2c2 0%, #52c41a 100%)',
    'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
    'linear-gradient(135deg, #2f54eb 0%, #1890ff 100%)',
    'linear-gradient(135deg, #eb2f96 0%, #722ed1 100%)',
    'linear-gradient(135deg, #52c41a 0%, #13c2c2 100%)'
  ]
  
  const chartHeight = compact ? height - 80 : height - 100
  const barWidth = compact ? 40 : 60
  const spacing = compact ? 12 : 20
  const barGap = compact ? '8px' : '0 12px'

  return (
    <Card 
      title={
        <div className="flex justify-between items-center">
          <Title level={compact ? 5 : 4} className="mb-0">{title}</Title>
          {showTooltip && (
            <Tooltip title={`Total: ${total.toLocaleString()} ${unit}`}>
              <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
            </Tooltip>
          )}
        </div>
      }
      className={`hover:shadow-lg transition-shadow duration-300 ${compact ? 'p-3' : ''}`}
      bodyStyle={{ padding: compact ? '12px' : '24px' }}
    >
      <div style={{ height: chartHeight }} className="relative">
        {/* Grid de fondo */}
        {showGrid && (
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 25, 50, 75, 100].map((percent, index) => (
              <div 
                key={index}
                className="w-full border-t border-dashed"
                style={{ 
                  top: `${percent}%`,
                  position: 'absolute',
                  borderColor: token.colorBorderSecondary
                }}
              >
                <div className="absolute right-0 -top-3 pr-2 text-xs" style={{ color: token.colorTextQuaternary }}>
                  {Math.round((percent / 100) * maxValue).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Barras del gráfico */}
        <div 
          className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-4"
          style={{ gap: barGap }}
        >
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (chartHeight - (compact ? 30 : 40))
            const barColor = item.color || defaultColors[index % defaultColors.length]
            const percentage = total > 0 ? (item.value / total) * 100 : 0
            
            return (
              <div 
                key={index}
                className="flex flex-col items-center relative group flex-1 max-w-16"
                style={{ 
                  minWidth: `${barWidth}px`
                }}
              >
                {/* Barra con gradiente */}
                <div
                  className={`rounded-t-lg transition-all duration-300 cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md ${
                    compact ? 'w-3/4' : 'w-4/5'
                  }`}
                  style={{
                    height: `${Math.max(barHeight, 4)}px`,
                    background: barColor,
                    minHeight: '4px'
                  }}
                >
                  {/* Efecto de brillo interno */}
                  <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/20 to-transparent" />
                  
                  {/* Tooltip hover */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-10 pointer-events-none">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-gray-300">
                      {item.value.toLocaleString()} {unit}
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                </div>

                {/* Valor sobre la barra */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  {item.value.toLocaleString()}
                </div>

                {/* Etiqueta */}
                <div className={`mt-2 text-center w-full ${compact ? 'px-1' : 'px-2'}`}>
                  <Text 
                    className="block truncate font-medium" 
                    style={{ 
                      fontSize: compact ? '11px' : '12px',
                      color: token.colorTextSecondary
                    }}
                    title={item.label}
                  >
                    {item.label.length > (compact ? 10 : 12) 
                      ? `${item.label.substring(0, compact ? 8 : 10)}...` 
                      : item.label}
                  </Text>
                  <Text 
                    type="secondary" 
                    style={{ fontSize: compact ? '10px' : '11px' }}
                  >
                    {percentage.toFixed(1)}%
                  </Text>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leyenda - Solo mostrar si hay espacio */}
      {showLegend && data.length > 0 && !compact && (
        <div className="mt-6 pt-4 border-t" style={{ borderColor: token.colorBorder }}>
          <Text strong className="text-sm mb-2 block">Leyenda:</Text>
          <div className="flex flex-wrap gap-2">
            {data.map((item, index) => {
              const color = item.color || defaultColors[index % defaultColors.length]
              return (
                <div 
                  key={index} 
                  className="flex items-center bg-gray-50 px-3 py-1 rounded-full"
                  style={{ backgroundColor: token.colorBgContainerDisabled }}
                >
                  <div 
                    className="w-3 h-3 rounded mr-2 shadow-sm"
                    style={{ background: color }}
                  />
                  <Text className="text-xs">
                    {item.label} ({item.value.toLocaleString()})
                  </Text>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Estadísticas en footer - Solo si no es compacto */}
      {!compact && (
        <div className="mt-6 pt-4 border-t" style={{ borderColor: token.colorBorder }}>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <Text type="secondary" className="text-xs">Total:</Text>
              <Text strong className="text-lg ml-2">
                {total.toLocaleString()} {unit}
              </Text>
            </div>
            <div>
              <Text type="secondary" className="text-xs">Promedio:</Text>
              <Text strong className="text-lg ml-2">
                {(total / data.length || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} {unit}
              </Text>
            </div>
            <div>
              <Text type="secondary" className="text-xs">Máximo:</Text>
              <Text strong className="text-lg ml-2">
                {maxValue.toLocaleString()} {unit}
              </Text>
            </div>
            <div>
              <Text type="secondary" className="text-xs">Categorías:</Text>
              <Text strong className="text-lg ml-2">
                {data.length}
              </Text>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default EnhancedBarChart