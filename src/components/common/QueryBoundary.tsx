import React from 'react'
import Loading from './Loading'
import ErrorMessage from './ErrorMessage'

interface QueryBoundaryProps {
  children: React.ReactNode
  isLoading: boolean
  isError: boolean
  error?: any
  onRetry?: () => void
}

const QueryBoundary: React.FC<QueryBoundaryProps> = ({ 
  children, 
  isLoading, 
  isError, 
  error, 
  onRetry 
}) => {
  if (isLoading) {
    return <Loading />
  }

  if (isError) {
    return <ErrorMessage message={error?.message} onRetry={onRetry} />
  }

  return <>{children}</>
}

export default QueryBoundary