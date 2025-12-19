import React, { createContext, useContext, useState, useCallback } from 'react'
import { message } from 'antd'
import { SmartAlertProps } from '@/components/common/SmartAlert'

interface Alert extends Omit<SmartAlertProps, 'id'> {
  id: string
  timestamp: number
}

interface AlertContextType {
  alerts: Alert[]
  addAlert: (alert: Omit<SmartAlertProps, 'id'>) => void
  removeAlert: (id: string) => void
  clearAllAlerts: () => void
  showToast: (type: 'success' | 'info' | 'warning' | 'error', content: string) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const addAlert = useCallback((alert: Omit<SmartAlertProps, 'id'>) => {
    const id = Date.now().toString()
    const newAlert = {
      ...alert,
      id,
      timestamp: Date.now(),
    }
    
    setAlerts(prev => [...prev, newAlert])
    
    // Auto remover si tiene autoClose
    if (alert.autoClose && alert.autoClose > 0) {
      setTimeout(() => {
        removeAlert(id)
      }, alert.autoClose * 1000)
    }
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }, [])

  const clearAllAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  const showToast = useCallback((type: 'success' | 'info' | 'warning' | 'error', content: string) => {
    message[type](content)
  }, [])

  return (
    <AlertContext.Provider 
      value={{ 
        alerts, 
        addAlert, 
        removeAlert, 
        clearAllAlerts,
        showToast 
      }}
    >
      {children}
    </AlertContext.Provider>
  )
}

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider')
  }
  return context
}