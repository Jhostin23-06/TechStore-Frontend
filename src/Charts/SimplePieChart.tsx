import React from 'react'
import { Card, Typography, Space } from 'antd'

const { Title, Text } = Typography

interface SimplePieChartProps {
  title: string
  data: Array<{ label: string; value: number; color: string }>
}

const SimplePieChart: React.FC<SimplePieChartProps> = ({ title, data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <Card title={<Title level={5}>{title}</Title>}>
      <div className="flex">
        {/* Gráfico de torta simple */}
        <div className="relative w-32 h-32 rounded-full">
          {data.map((item, index, array) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0
            const previousPercentages = array
              .slice(0, index)
              .reduce((sum, prevItem) => sum + (prevItem.value / total) * 100, 0)
            
            return (
              <div
                key={index}
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  clipPath: `conic-gradient(
                    ${item.color} ${previousPercentages}% ${previousPercentages + percentage}%,
                    transparent ${previousPercentages + percentage}% 100%
                  )`
                }}
              />
            )
          })}
        </div>
        
        {/* Leyenda */}
        <div className="ml-6 flex-1">
          <Space direction="vertical" className="w-full">
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text>{item.label}</Text>
                  </div>
                  <div>
                    <Text strong>{item.value.toLocaleString()}</Text>
                    <Text type="secondary" className="ml-2">
                      ({percentage.toFixed(1)}%)
                    </Text>
                  </div>
                </div>
              )
            })}
          </Space>
        </div>
      </div>
    </Card>
  )
}

export default SimplePieChart