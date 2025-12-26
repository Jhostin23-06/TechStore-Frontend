import React from 'react'
import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  ProductOutlined,
  UserOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'

const { Sider } = Layout

const Sidebar: React.FC = () => {
  const location = useLocation()
  const { mode } = useTheme()

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/products',
      icon: <ProductOutlined />,
      label: <Link to="/products">Productos</Link>,
    },
    {
      key: '/clients',
      icon: <UserOutlined />,
      label: <Link to="/clients">Clientes</Link>,
    },
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: <Link to="/categories">Categorías</Link>,
    },
    {
      key: '/sales',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/sales">Ventas</Link>,
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Reportes',
      children: [
        {
          key: '/reports',
          icon: <LineChartOutlined />,
          label: <Link to="/reports">Todos los Reportes</Link>,
        },
      ],
    },
  ]

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      width={250}
      className={`sidebar border-r transition-colors duration-300 ${
        mode === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}
      theme={mode === 'dark' ? 'dark' : 'light'}
    >
      <div className={`sidebar-logo h-16 flex items-center justify-center border-b ${
        mode === 'dark' ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <h1 className={`text-xl font-bold ${
          mode === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          TechStore
        </h1>
      </div>
      <Menu
        theme={mode === 'dark' ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['reports']}
        items={menuItems}
        className="border-none px-2"
      />
    </Sider>
  )
}

export default Sidebar