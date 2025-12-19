import React from 'react'
import { Alert, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message = 'Ha ocurrido un error al cargar los datos', 
  onRetry 
}) => {
  return (
    <div className="p-4">
      <Alert
        message="Error"
        description={message}
        type="error"
        showIcon
        action={
          onRetry && (
            <Button
              size="small"
              type="primary"
              icon={<ReloadOutlined />}
              onClick={onRetry}
            >
              Reintentar
            </Button>
          )
        }
      />
    </div>
  )
}

export default ErrorMessage