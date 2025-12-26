import React from 'react'
import { Card, Typography } from 'antd'

const { Title, Text } = Typography

interface SimpleBarChartProps {
  title: string
  data: Array<{ label: string; value: number }>
  height?: number
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  title, 
  data, 
  height = 300 
}) => {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  
  return (
    <Card title={<Title level={5}>{title}</Title>}>
      <div style={{ height }} className="flex items-end space-x-2 p-4">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 80)
          const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
            'bg-red-500', 'bg-purple-500', 'bg-pink-500'
          ]
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className={`${colors[index % colors.length]} rounded-t w-3/4`}
                style={{ height: barHeight }}
              />
              <Text className="text-xs mt-2 text-center" type="secondary">
                {item.label}
              </Text>
              <Text strong className="text-sm mt-1">
                {item.value}
              </Text>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default SimpleBarChart