import React from 'react'
import { Card, Statistic, Tooltip } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useTheme } from '@/contexts/ThemeContext'

interface MetricCardProps {
  title: string
  value: number | string
  prefix?: React.ReactNode
  suffix?: string
  trend?: number
  description?: string
  precision?: number
  loading?: boolean
  valueStyle?: React.CSSProperties
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  trend,
  description,
  precision = 0,
  loading = false,
  valueStyle,
}) => {
  const { mode } = useTheme()
  const isPositive = trend && trend > 0
  
  const cardBg = mode === 'dark' ? 'bg-gray-800' : 'bg-white'
  const cardBorder = mode === 'dark' ? 'border-gray-700' : 'border-gray-200'
  const textSecondary = mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const trendColor = isPositive 
    ? (mode === 'dark' ? '#34D399' : '#3f8600') 
    : (mode === 'dark' ? '#F87171' : '#cf1322')

  return (
    <Card 
      loading={loading} 
      className={`h-full ${cardBg} ${cardBorder}`}
      bodyStyle={{ padding: '16px' }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-4">
            <span className={`text-sm ${textSecondary}`}>{title}</span>
            {description && (
              <Tooltip title={description}>
                <InfoCircleOutlined className={`ml-2 ${mode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              </Tooltip>
            )}
          </div>
          
          <div className="flex items-baseline mb-3">
            {prefix && <span className="text-lg text-gray-500 mr-1">{prefix}</span>}
            <Statistic
              value={value}
              valueStyle={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: mode === 'dark' ? '#F3F4F6' : '#111827',
                ...valueStyle,
              }}
              precision={precision}
            />
            {suffix && <span className={`text-lg ml-1 ${textSecondary}`}>{suffix}</span>}
          </div>
          
          {trend !== undefined && (
            <div className="flex items-center">
              {isPositive ? (
                <ArrowUpOutlined style={{ color: trendColor }} />
              ) : (
                <ArrowDownOutlined style={{ color: trendColor }} />
              )}
              <span style={{ color: trendColor }} className="ml-1 font-medium">
                {Math.abs(trend)}%
              </span>
              <span className={`text-xs ${textSecondary} ml-2`}>vs. periodo anterior</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default MetricCard