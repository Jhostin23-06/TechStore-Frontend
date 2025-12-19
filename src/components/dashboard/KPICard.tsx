import React from 'react'
import { Card, Progress, Tooltip } from 'antd'
import { TrophyOutlined, RiseOutlined, FallOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useTheme } from '@/contexts/ThemeContext'

interface KPICardProps {
  title: string
  value: number
  target: number
  unit?: string
  description?: string
  trend?: 'up' | 'down' | 'stable'
  loading?: boolean
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  target,
  unit = '%',
  description,
  trend = 'stable',
  loading = false,
}) => {
  const { mode } = useTheme()
  const percentage = target > 0 ? (value / target) * 100 : 0
  
  const cardBg = mode === 'dark' ? 'bg-gray-800' : 'bg-white'
  const cardBorder = mode === 'dark' ? 'border-gray-700' : 'border-gray-200'
  const textSecondary = mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const textPrimary = mode === 'dark' ? 'text-gray-100' : 'text-gray-800'
  
  const getProgressColor = () => {
    if (percentage >= 100) return '#10B981'
    if (percentage >= 80) return '#F59E0B'
    return '#EF4444'
  }
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <RiseOutlined className="text-green-500" />
      case 'down': return <FallOutlined className="text-red-500" />
      default: return null
    }
  }

  return (
    <Card 
      loading={loading} 
      className={`h-full ${cardBg} ${cardBorder}`}
      bodyStyle={{ padding: '16px' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <TrophyOutlined className={`mr-2 ${mode === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
          <span className={`font-medium ${textPrimary}`}>{title}</span>
        </div>
        {description && (
          <Tooltip title={description}>
            <InfoCircleOutlined className={textSecondary} />
          </Tooltip>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-2xl font-bold ${textPrimary}`}>
            {value.toFixed(1)}{unit}
          </span>
          <div className="flex items-center">
            {getTrendIcon()}
            <span className={`text-sm ${textSecondary} ml-1`}>
              Meta: {target.toFixed(1)}{unit}
            </span>
          </div>
        </div>
        
        <Progress
          percent={percentage}
          strokeColor={getProgressColor()}
          showInfo={false}
          strokeWidth={8}
        />
        
        <div className="flex justify-between mt-2">
          <span className={`text-xs ${textSecondary}`}>
            {percentage >= 100 ? '✅ Meta superada' : '🎯 En progreso'}
          </span>
          <span className={`text-xs ${textSecondary}`}>
            {percentage.toFixed(1)}% completado
          </span>
        </div>
      </div>
    </Card>
  )
}

export default KPICard