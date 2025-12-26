import React, { useState, useEffect } from 'react'
import { Badge, Popover, List, Tag, Button, Space, Empty } from 'antd'
import { 
  BellOutlined, 
  WarningOutlined, 
  CheckCircleOutlined, 
  InfoCircleOutlined,
  NotificationOutlined 
} from '@ant-design/icons'
import { useProducts } from '@/hooks/useProducts'
import dayjs from 'dayjs'
import { useTheme } from '@/contexts/ThemeContext' // Importar el hook

interface Notification {
  id: number
  type: 'warning' | 'success' | 'info' | 'error'
  title: string
  message: string
  time: string
  read: boolean
}

const Notifications: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { mode } = useTheme() // Obtener el modo actual

  const { products } = useProducts()

  // useEffect(() => {
  //   // Generar notificaciones basadas en datos
  //   const newNotifications: Notification[] = []

  //   // Productos con bajo stock
  //   const lowStockProducts = products.filter(p => p.stock < 10)
  //   lowStockProducts.forEach(product => {
  //     newNotifications.push({
  //       id: Date.now() + product.id,
  //       type: 'warning',
  //       title: 'Stock Bajo',
  //       message: `${product.nombre} tiene solo ${product.stock} unidades`,
  //       time: dayjs().format('HH:mm'),
  //       read: false,
  //     })
  //   })

  //   // Productos sin stock
  //   const outOfStockProducts = products.filter(p => p.stock === 0)
  //   outOfStockProducts.forEach(product => {
  //     newNotifications.push({
  //       id: Date.now() + product.id + 1000,
  //       type: 'error',
  //       title: 'Stock Agotado',
  //       message: `${product.nombre} está agotado`,
  //       time: dayjs().format('HH:mm'),
  //       read: false,
  //     })
  //   })

  //   setNotifications(newNotifications)
  // }, [products])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    setOpen(false)
  }

  // Clases dinámicas basadas en el modo
  const popoverClasses = mode === 'dark' 
    ? 'bg-gray-900 text-gray-100 border-gray-700' 
    : 'bg-white text-gray-800 border-gray-200'
  
  const listItemClasses = mode === 'dark'
    ? 'bg-gray-800 hover:bg-gray-700 border-gray-700'
    : 'bg-white hover:bg-gray-50 border-gray-200'
  
  const unreadBgClass = mode === 'dark'
    ? 'bg-blue-900/30' // Más sutil en modo oscuro
    : 'bg-blue-50'
  
  const textClasses = mode === 'dark'
    ? 'text-gray-300' 
    : 'text-gray-800'
  
  const secondaryTextClasses = mode === 'dark'
    ? 'text-gray-400'
    : 'text-gray-600'

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning': return <WarningOutlined className={mode === 'dark' ? 'text-yellow-400' : 'text-yellow-500'} />
      case 'success': return <CheckCircleOutlined className={mode === 'dark' ? 'text-green-400' : 'text-green-500'} />
      case 'error': return <WarningOutlined className={mode === 'dark' ? 'text-red-400' : 'text-red-500'} />
      default: return <InfoCircleOutlined className={mode === 'dark' ? 'text-blue-400' : 'text-blue-500'} />
    }
  }

  const getTagColor = (type: Notification['type']) => {
    if (mode === 'dark') {
      switch (type) {
        case 'warning': return 'yellow'
        case 'success': return 'green'
        case 'error': return 'red'
        default: return 'blue'
      }
    } else {
      switch (type) {
        case 'warning': return 'gold'
        case 'success': return 'success'
        case 'error': return 'error'
        default: return 'processing'
      }
    }
  }

  const EmptyState = () => (
    <Empty
      image={<NotificationOutlined className="text-3xl" />}
      imageStyle={{
        fontSize: '48px',
        color: mode === 'dark' ? '#4B5563' : '#9CA3AF',
      }}
      description={
        <span className={secondaryTextClasses}>
          No hay notificaciones
        </span>
      }
      className="py-8"
    />
  )

  const notificationContent = (
    <div className={`w-80 rounded-lg shadow-xl ${popoverClasses} transition-colors duration-300`}>
      {/* Header */}
      <div className={`p-4 border-b ${mode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center">
          <h3 className={`font-semibold ${textClasses}`}>Notificaciones</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Tag color={mode === 'dark' ? 'blue' : 'processing'} className="m-0">
                {unreadCount} {unreadCount === 1 ? 'nueva' : 'nuevas'}
              </Tag>
            )}
            {unreadCount > 0 && (
              <Button 
                type="link" 
                size="small" 
                onClick={markAllAsRead}
                className={mode === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}
              >
                Marcar todas
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Lista de notificaciones */}
      <List
        dataSource={notifications.slice(0, 5)}
        renderItem={(notification) => (
          <List.Item
            className={`px-4 py-3 cursor-pointer transition-colors duration-200 ${listItemClasses} ${
              !notification.read ? unreadBgClass : ''
            } ${mode === 'dark' ? 'border-b border-gray-700 last:border-b-0' : 'border-b border-gray-100 last:border-b-0'}`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex items-start space-x-3 w-full">
              {/* Icono */}
              <div className="mt-1 flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              
              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className={`font-medium ${textClasses}`}>
                    {notification.title}
                  </span>
                  <Tag 
                    color={getTagColor(notification.type)}
                    className={`m-0 ${mode === 'dark' ? 'border-gray-600' : ''}`}
                  >
                    {notification.time}
                  </Tag>
                </div>
                <p className={`text-sm mt-1 ${secondaryTextClasses}`}>
                  {notification.message}
                </p>
              </div>
              
              {/* Indicador de no leído */}
              {!notification.read && (
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                  mode === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                }`} />
              )}
            </div>
          </List.Item>
        )}
        locale={{ emptyText: <EmptyState /> }}
      />
      
      {/* Footer */}
      {notifications.length > 5 && (
        <div className={`p-3 border-t ${mode === 'dark' ? 'border-gray-700' : 'border-gray-200'} text-center`}>
          <Button 
            type="link" 
            size="small"
            className={mode === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}
          >
            Ver todas las notificaciones ({notifications.length})
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <Popover
      content={notificationContent}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayClassName="notification-popover"
    >
      <div className="relative cursor-pointer">
        <Badge 
          count={unreadCount} 
          size="small"
          className={mode === 'dark' ? 'ant-badge-count-dark' : ''}
          style={mode === 'dark' ? {
            backgroundColor: '#3B82F6',
            color: 'white',
          } : {}}
        >
          <div className={`p-2 rounded-lg transition-colors duration-200 ${
            mode === 'dark' 
              ? 'hover:bg-gray-700' 
              : 'hover:bg-gray-100'
          }`}>
            <BellOutlined className={`text-lg transition-colors duration-200 ${
              mode === 'dark' 
                ? 'text-gray-300 hover:text-blue-400' 
                : 'text-gray-600 hover:text-blue-600'
            }`} />
          </div>
        </Badge>
      </div>
    </Popover>
  )
}

export default Notifications