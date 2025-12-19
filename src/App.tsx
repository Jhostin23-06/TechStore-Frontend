import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ConfigProvider, App as AntdApp } from 'antd'
import esES from 'antd/locale/es_ES'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

// Contexto y hooks
import { ThemeProvider } from '@/contexts/ThemeContext'
import { useAntdTheme } from '@/hooks/useAntdTheme'

// Layout y páginas
import MainLayout from '@/components/layout/MainLayout'
import Dashboard from '@/pages/Dashboard'
import ProductsPage from '@/pages/Products'
import ClientsPage from '@/pages/Clients'
import CategoriesPage from '@/pages/Categories'
import SalesPage from '@/pages/Sales'

// Estilos globales
import '@/styles/globals.css'
import { AlertProvider } from './contexts/AlertContext'

// Configurar dayjs en español
dayjs.locale('es')

// Componente envuelto para acceder al hook
const AppContent: React.FC = () => {
  const theme = useAntdTheme()

  return (
    <ConfigProvider locale={esES} theme={theme}>
      <AntdApp>
        <AlertProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="sales" element={<SalesPage />} />
            </Route>
            <Route path="*" element={<div>404 - Página no encontrada</div>} />
          </Routes>
        </Router>
        </AlertProvider>
      </AntdApp>
    </ConfigProvider>
  )
}

// Configurar TanStack Query v5
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
})

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
      <ReactQueryDevtools 
        initialIsOpen={false}
        buttonPosition="bottom-left"
      />
    </QueryClientProvider>
  )
}

export default App