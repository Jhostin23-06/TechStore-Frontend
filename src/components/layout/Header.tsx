import React from 'react'
import { Layout, Avatar, Dropdown, Space, message } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useNavigate } from 'react-router-dom'
import Notifications from '@/components/common/Notifications'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from '../common/ThemeToggle'

const { Header: AntHeader } = Layout

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    message.success('Sesión cerrada exitosamente')
    navigate('/login')
  }

  const handleProfileClick = () => {
    // Puedes redirigir a una página de perfil si la tienes
    message.info('Funcionalidad de perfil en desarrollo')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      danger: true,
      onClick: handleLogout,
    },
  ]

  // Si no hay usuario, no renderizar el header
  if (!user) {
    return null
  }

  // Función para obtener iniciales del usuario
  const getUserInitials = () => {
    if (!user.username) return 'U'
    const parts = user.username.split(' ')
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return user.username.substring(0, 2).toUpperCase()
  }

  // Función para obtener color del avatar basado en el nombre de usuario
  const getAvatarColor = (username: string) => {
    const colors = [
      '#1890ff', // Azul
      '#52c41a', // Verde
      '#faad14', // Amarillo
      '#f5222d', // Rojo
      '#722ed1', // Púrpura
      '#13c2c2', // Cian
      '#eb2f96', // Rosa
    ]
    
    if (!username) return colors[0]
    
    let hash = 0
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <AntHeader className="bg-card shadow-sm px-6 flex items-center justify-between transition-colors duration-300">
      <div className="text-lg font-semibold text-primary">
        TechStore Dashboard
      </div>
      
      <Space size="large">
        {/* Toggle del tema */}
        <ThemeToggle />

        {/* Notificaciones */}
        <Notifications />

        {/* Perfil de usuario */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div className="flex items-center space-x-2 cursor-pointer px-3 py-1 rounded-md hover:bg-hover transition-colors duration-200">
            <Avatar 
              size="small" 
              style={{ 
                backgroundColor: getAvatarColor(user.username),
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              {getUserInitials()}
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-primary text-sm font-medium">
                {user.username}
              </span>
              <span className="text-muted text-xs">
                {user.role}
              </span>
            </div>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}

export default AppHeader