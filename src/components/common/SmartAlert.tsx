import React, { useState, useEffect } from 'react'
import { Alert, Button, Space } from 'antd'
import { BellOutlined, CloseOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useTheme } from '@/contexts/ThemeContext'

export interface SmartAlertProps {
  id?: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  autoClose?: number
  onClose?: () => void
  closable?: boolean
}

const getAlertIcon = (type: SmartAlertProps['type'], mode: 'light' | 'dark') => {
  const iconSize = { fontSize: '16px' }
  const colors = {
    success: mode === 'dark' ? '#34D399' : '#52c41a',
    info: mode === 'dark' ? '#60A5FA' : '#1890ff',
    warning: mode === 'dark' ? '#FBBF24' : '#faad14',
    error: mode === 'dark' ? '#F87171' : '#ff4d4f',
  }
  
  const icons = {
    success: <CheckCircleOutlined style={{ ...iconSize, color: colors.success }} />,
    info: <InfoCircleOutlined style={{ ...iconSize, color: colors.info }} />,
    warning: <WarningOutlined style={{ ...iconSize, color: colors.warning }} />,
    error: <ExclamationCircleOutlined style={{ ...iconSize, color: colors.error }} />,
  }
  
  return icons[type]
}

const SmartAlert: React.FC<SmartAlertProps> = ({
  type,
  title,
  message,
  action,
  autoClose = 5,
  onClose,
  closable = true,
}) => {
  const { mode } = useTheme()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (autoClose > 0 && visible) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoClose * 1000)
      return () => clearTimeout(timer)
    }
  }, [autoClose, visible])

  const handleClose = () => {
    setVisible(false)
    onClose?.()
  }

  if (!visible) return null

  const alertStyle = mode === 'dark' 
    ? {
        background: type === 'success' ? '#064E3B' :
                   type === 'info' ? '#1E3A8A' :
                   type === 'warning' ? '#78350F' :
                   '#7F1D1D',
        border: type === 'success' ? '1px solid #065F46' :
                type === 'info' ? '1px solid #1E40AF' :
                type === 'warning' ? '1px solid #92400E' :
                '1px solid #991B1B',
        color: mode === 'dark' ? '#E5E7EB' : undefined,
      }
    : {}

  return (
    <div className="mb-4 animate-fadeIn">
      <Alert
        message={
          <div className="flex items-center">
            <BellOutlined className="mr-2" />
            <span className="font-medium">{title}</span>
          </div>
        }
        description={message}
        type={type}
        showIcon={false}
        style={alertStyle}
        className="rounded-lg shadow-sm"
        action={
          <Space size="small">
            {action && (
              <Button 
                size="small" 
                onClick={action.onClick}
                className={mode === 'dark' ? 'text-blue-300' : ''}
              >
                {action.label}
              </Button>
            )}
            {closable && (
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={handleClose}
                className={mode === 'dark' ? 'text-gray-300 hover:text-gray-100' : ''}
              />
            )}
          </Space>
        }
        icon={getAlertIcon(type, mode)}
        closable={false}
      />
    </div>
  )
}

export default SmartAlert