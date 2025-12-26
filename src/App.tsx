import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ConfigProvider, App as AntdApp } from 'antd'
import esES from 'antd/locale/es_ES'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

// Contexto y hooks
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext' // Nuevo
import { useAntdTheme } from '@/hooks/useAntdTheme'

// Layout y páginas
import Login from '@/pages/Login' // Nuevo
import Register from '@/pages/Register' // Nuevo
import Dashboard from '@/pages/Dashboard'
import ProductsPage from '@/pages/Products'
import ClientsPage from '@/pages/Clients'
import CategoriesPage from '@/pages/Categories'
import SalesPage from '@/pages/Sales'
// import Unauthorized from '@/pages/Unauthorized' // Nuevo (opcional)

// Estilos globales
import '@/styles/globals.css'
import { AlertProvider } from './contexts/AlertContext'
import ProtectedLayout from './components/ProtectedLayout'
import Unauthorized from './pages/Unauthorized'
import ReportsPage from './pages/Reports'
import TopSellingReport from './pages/Reports/TopSellingReport'

// Configurar dayjs en español
dayjs.locale('es')

// Componente envuelto para acceder al hook
const AppContent: React.FC = () => {
  const theme = useAntdTheme()

  return (
    <ConfigProvider locale={esES} theme={theme}>
      <AntdApp>
        <AlertProvider>
          <AuthProvider> {/* Envolver todo con AuthProvider */}
            <Router>
              <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Rutas protegidas - usar ProtectedLayout */}
                <Route path="/" element={<ProtectedLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="clients" element={<ClientsPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="sales" element={<SalesPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="reports/top-selling" element={<TopSellingReport />} />
                </Route>
                
                {/* Ruta por defecto */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </AuthProvider>
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