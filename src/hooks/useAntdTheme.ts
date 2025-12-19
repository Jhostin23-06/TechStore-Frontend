import { ThemeConfig } from 'antd'
import { useTheme } from '@/contexts/ThemeContext'

export const useAntdTheme = (): ThemeConfig => {
  const { mode } = useTheme()

  const lightTheme: ThemeConfig = {
    token: {
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1890ff',
      colorBgBase: '#ffffff',
      colorTextBase: '#333333',
      colorBorder: '#d9d9d9',
      borderRadius: 8,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      Layout: {
        colorBgHeader: '#ffffff',
        colorBgBody: '#f5f5f5',
        colorBgTrigger: '#f0f0f0',
      },
      Card: {
        colorBgContainer: '#ffffff',
        colorBorderSecondary: '#f0f0f0',
      },
      Table: {
        colorBgContainer: '#ffffff',
        colorBorderSecondary: '#f0f0f0',
        colorFillAlter: '#fafafa',
      },
      Input: {
        colorBgContainer: '#ffffff',
      },
      Select: {
        colorBgContainer: '#ffffff',
      },
      Button: {
        borderRadius: 6,
      },
    },
  }

  const darkTheme: ThemeConfig = {
    token: {
      colorPrimary: '#177ddc',
      colorSuccess: '#49aa19',
      colorWarning: '#d89614',
      colorError: '#a61d24',
      colorInfo: '#177ddc',
      colorBgBase: '#141414',
      colorTextBase: '#ffffff',
      colorBorder: '#424242',
      borderRadius: 8,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      Layout: {
        colorBgHeader: '#1f1f1f',
        colorBgBody: '#000000',
        colorBgTrigger: '#262626',
      },
      Card: {
        colorBgContainer: '#1f1f1f',
        colorBorderSecondary: '#303030',
      },
      Table: {
        colorBgContainer: '#1f1f1f',
        colorBorderSecondary: '#303030',
        colorFillAlter: '#1a1a1a',
      },
      Input: {
        colorBgContainer: '#1f1f1f',
      },
      Select: {
        colorBgContainer: '#1f1f1f',
      },
      Button: {
        borderRadius: 6,
      },
      Modal: {
        colorBgElevated: '#1f1f1f',
      },
      Drawer: {
        colorBgElevated: '#1f1f1f',
      },
      Dropdown: {
        colorBgElevated: '#1f1f1f',
      },
      Popover: {
        colorBgElevated: '#1f1f1f',
      },
    },
  }

  return mode === 'dark' ? darkTheme : lightTheme
}