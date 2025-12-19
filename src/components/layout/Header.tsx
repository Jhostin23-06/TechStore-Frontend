import React from 'react'
import { Layout, Avatar, Dropdown, Space } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import Notifications from '@/components/common/Notifications'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '../common/ThemeToggle'

const { Header: AntHeader } = Layout

const AppHeader: React.FC = () => {
  const { mode, toggleTheme } = useTheme()

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      danger: true,
    },
  ]

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
          <div className="flex items-center space-x-2 cursor-pointer px-3 rounded-md transition-colors duration-200">
            <Avatar icon={<UserOutlined />} size="small" />
            <span className="text-primary">Administrador</span>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}

export default AppHeader