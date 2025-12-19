import React from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const { Content } = Layout

const MainLayout: React.FC = () => {
  return (
    <Layout className="min-h-screen transition-colors duration-300">
      <Sidebar />
      <Layout>
        <Header />
        <Content className="m-4 transition-colors duration-300">
          <div className="bg-card rounded-lg shadow-sm min-h-[calc(100vh-120px)] p-6 fade-in">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout