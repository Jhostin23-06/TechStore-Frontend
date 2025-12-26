import React from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import AppHeader from './Header'
import Sider from 'antd/es/layout/Sider'
import Sidebar from './Sidebar'

const { Content } = Layout

interface MainLayoutProps {
  children?: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Layout className="min-h-screen">
      <Sidebar />
      <Layout>
        <AppHeader />
        <Content className="p-6 overflow-auto">
          {children ?? <Outlet />} {/* render children if provided, otherwise Outlet */}
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout