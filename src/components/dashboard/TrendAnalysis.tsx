// components/dashboard/TrendAnalysis.tsx
import React, { useState } from 'react'
import { Card, Select } from 'antd'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TrendData {
  date: string
  sales: number
  products: number
  revenue: number
}

const TrendAnalysis: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month')
  
  // Datos de ejemplo
  const data: TrendData[] = [
    { date: '01/01', sales: 12, products: 45, revenue: 1200 },
    { date: '02/01', sales: 19, products: 42, revenue: 1900 },
    // ... más datos
  ]

  return (
    <Card
      title="Análisis de Tendencias"
      extra={
        <Select value={period} onChange={setPeriod} style={{ width: 100 }}>
          <Select.Option value="day">Diario</Select.Option>
          <Select.Option value="week">Semanal</Select.Option>
          <Select.Option value="month">Mensual</Select.Option>
        </Select>
      }
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke="#8884d8" />
          <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}