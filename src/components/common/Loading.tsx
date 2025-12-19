import React from 'react'
import { Spin } from 'antd'

interface LoadingProps {
  size?: 'small' | 'default' | 'large'
  tip?: string
  fullScreen?: boolean
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'large', 
  tip = 'Cargando...', 
  fullScreen = false 
}) => {
  const className = fullScreen 
    ? 'fixed inset-0 flex justify-center items-center bg-white bg-opacity-75 z-50' 
    : 'flex justify-center items-center p-8'

  return (
    <div className={className}>
      <Spin size={size} tip={tip} />
    </div>
  )
}

export default Loading