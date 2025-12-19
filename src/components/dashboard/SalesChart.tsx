import React from 'react'
import { Card } from 'antd'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts'
import { Sale } from '@/types/api.types'
import dayjs from 'dayjs'

interface SalesChartProps {
  sales: Sale[]
}

const SalesChart: React.FC<SalesChartProps> = ({ sales }) => {
  // Agrupar ventas por día (últimos 7 días)
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      days.push(dayjs().subtract(i, 'day').format('DD/MM'))
    }
    return days
  }

  const last7Days = getLast7Days()

  // Inicializar datos para los últimos 7 días
  const initialData = last7Days.map(date => ({
    date,
    cantidadVentas: 0,
    totalVentas: 0,
  }))

  // Procesar datos de ventas
  const chartData = sales.reduce((acc, sale) => {
    const saleDate = dayjs(sale.fecha).format('DD/MM')
    const dayIndex = last7Days.indexOf(saleDate)
    
    if (dayIndex !== -1) {
      acc[dayIndex].cantidadVentas += 1
      acc[dayIndex].totalVentas += sale.total
    }
    
    return acc
  }, [...initialData])

  // Formatear tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            <span className="inline-block w-3 h-3 bg-blue-500 mr-2"></span>
            Ventas: <strong>{payload[0].value}</strong>
          </p>
          <p className="text-sm text-gray-600">
            <span className="inline-block w-3 h-3 bg-green-500 mr-2"></span>
            Total: <strong>S/. {payload[1].value.toFixed(2)}</strong>
          </p>
        </div>
      )
    }
    return null
  }

  // Calcular métricas para mostrar
  const totalVentasPeriodo = chartData.reduce((sum, day) => sum + day.cantidadVentas, 0)
  const totalIngresosPeriodo = chartData.reduce((sum, day) => sum + day.totalVentas, 0)
  const promedioDiario = totalIngresosPeriodo / 7

  return (
    <Card 
      title="Ventas de los últimos 7 días" 
      className="h-full"
      extra={
        <div className="text-sm text-gray-500">
          <div>Total período: <strong>{totalVentasPeriodo} ventas</strong></div>
          <div>Ingresos: <strong>S/. {totalIngresosPeriodo.toFixed(2)}</strong></div>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#666', fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#666', fontSize: 12 }}
            label={{ 
              value: 'Cantidad de Ventas', 
              angle: -90, 
              position: 'insideLeft',
              offset: -10,
              style: { textAnchor: 'middle', fill: '#666' }
            }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tickFormatter={(value) => `S/. ${value}`}
            tick={{ fill: '#666', fontSize: 12 }}
            label={{ 
              value: 'Total Ventas (S/.)', 
              angle: 90, 
              position: 'insideRight',
              offset: -10,
              style: { textAnchor: 'middle', fill: '#666' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            yAxisId="left"
            dataKey="cantidadVentas" 
            name="Cantidad de Ventas" 
            fill="#1890ff" 
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="totalVentas" 
            name="Total Ventas (S/.)" 
            stroke="#52c41a" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Resumen de métricas */}
    </Card>
  )
}

export default SalesChart