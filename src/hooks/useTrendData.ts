import { useState, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'

interface TrendData {
  date: string
  sales: number
  revenue: number
  products: number
  customers: number
}

interface UseTrendDataOptions {
  period?: 'day' | 'week' | 'month'
  startDate?: Date
  endDate?: Date
}

export const useTrendData = (sales: any[], products: any[], clients: any[], options: UseTrendDataOptions = {}) => {
  const { period = 'month', startDate, endDate } = options

  const trendData = useMemo(() => {
    const data: TrendData[] = []
    const now = dayjs()
    
    let currentDate = startDate ? dayjs(startDate) : now.subtract(1, 'month')
    const finalDate = endDate ? dayjs(endDate) : now

    while (currentDate.isBefore(finalDate)) {
      const dateStr = currentDate.format('DD/MM')
      
      // Filtrar datos para esta fecha
      const dailySales = sales.filter(sale => 
        dayjs(sale.fecha).isSame(currentDate, period)
      )
      
      const dailyProducts = products.filter(product => 
        dayjs(product.createdAt || product.fecha).isSame(currentDate, period)
      )
      
      const dailyCustomers = clients.filter(client => 
        dayjs(client.createdAt || client.fecha).isSame(currentDate, period)
      )

      data.push({
        date: dateStr,
        sales: dailySales.length,
        revenue: dailySales.reduce((sum, sale) => sum + sale.total, 0),
        products: dailyProducts.length,
        customers: dailyCustomers.length,
      })

      currentDate = currentDate.add(1, period === 'day' ? 'day' : period === 'week' ? 'week' : 'month')
    }

    return data
  }, [sales, products, clients, period, startDate, endDate])

  return trendData
}