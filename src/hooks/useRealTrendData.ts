import { useMemo } from 'react'
import dayjs from 'dayjs'
import { Sale } from '@/types/api.types'

interface TrendData {
  date: string
  sales: number
  revenue: number
  products: number
  customers: number
}

// Función auxiliar para calcular semana manualmente
const getWeekNumber = (date: dayjs.Dayjs) => {
  const firstDayOfYear = dayjs(date).startOf('year')
  const pastDaysOfYear = date.diff(firstDayOfYear, 'day')
  return Math.ceil((pastDaysOfYear + firstDayOfYear.day() + 1) / 7)
}

export const useRealTrendData = (sales: Sale[], period: 'day' | 'week' | 'month' = 'day') => {
  const trendData = useMemo(() => {
    if (!sales || sales.length === 0) return []
    
    const data: TrendData[] = []
    const now = dayjs()
    
    // Determinar el rango basado en el período
    let periodsToShow = 0
    let dateFormat = ''
    let periodUnit: dayjs.ManipulateType = 'day'
    
    switch (period) {
      case 'day':
        periodsToShow = 30
        dateFormat = 'DD/MM'
        periodUnit = 'day'
        break
      case 'week':
        periodsToShow = 8
        dateFormat = ''
        periodUnit = 'week'
        break
      case 'month':
        periodsToShow = 12
        dateFormat = 'MMM/YY'
        periodUnit = 'month'
        break
    }
    
    // Crear datos para cada período
    for (let i = periodsToShow - 1; i >= 0; i--) {
      const currentDate = now.subtract(i, periodUnit)
      let startDate: dayjs.Dayjs
      let endDate: dayjs.Dayjs
      let dateLabel: string
      
      switch (period) {
        case 'day':
          startDate = currentDate.startOf('day')
          endDate = currentDate.endOf('day')
          dateLabel = currentDate.format('DD/MM')
          break
          
        case 'week':
          startDate = currentDate.startOf('week')
          endDate = currentDate.endOf('week')
          // Calcular número de semana manualmente
          const weekNumber = getWeekNumber(currentDate)
          dateLabel = `Sem ${weekNumber}`
          break
          
        case 'month':
          startDate = currentDate.startOf('month')
          endDate = currentDate.endOf('month')
          dateLabel = currentDate.format('MMM/YY')
          break
      }
      
      // Filtrar ventas para este período
      const periodSales = sales.filter(sale => {
        try {
          const saleDate = dayjs(sale.fecha)
          return saleDate.isAfter(startDate) && saleDate.isBefore(endDate)
        } catch (error) {
          console.error('Error al procesar fecha:', sale.fecha, error)
          return false
        }
      })
      
      // Calcular métricas
      const salesCount = periodSales.length
      const revenue = periodSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
      
      // Contar productos únicos vendidos
      const productIds = new Set<number>()
      periodSales.forEach(sale => {
        sale.detalles?.forEach(detalle => {
          if (detalle.productoId) {
            productIds.add(detalle.productoId)
          }
        })
      })
      
      // Contar clientes únicos
      const clientIds = new Set<number>()
      periodSales.forEach(sale => {
        if (sale.clienteId) {
          clientIds.add(sale.clienteId)
        }
      })
      
      data.push({
        date: dateLabel,
        sales: salesCount,
        revenue: revenue,
        products: productIds.size,
        customers: clientIds.size,
      })
    }
    
    return data
  }, [sales, period])

  return trendData
}