import React, { useState, useEffect } from 'react'
import { InputNumber, InputNumberProps } from 'antd'

interface CurrencyInputProps extends Omit<InputNumberProps, 'value' | 'onChange'> {
  value?: number
  onChange?: (value: number) => void
  currency?: string
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value = 0,
  onChange,
  currency = 'S/.',
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState<string>(
    value?.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || '0.00'
  )

  useEffect(() => {
    if (value !== undefined) {
      setDisplayValue(
        value.toLocaleString('es-PE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      )
    }
  }, [value])

  const handleChange = (inputValue: string) => {
    // Remover comas y convertir a número
    const numericString = inputValue.replace(/,/g, '')
    const numericValue = parseFloat(numericString) || 0
    
    // Actualizar valor numérico
    if (onChange) {
      onChange(numericValue)
    }
    
    // Actualizar display manteniendo formato
    setDisplayValue(
      numericValue.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
        {currency}
      </span>
      <InputNumber
        {...props}
        className="w-full pl-10"
        value={displayValue}
        onChange={(val) => handleChange(val?.toString() || '0')}
        formatter={(value) => {
          const num = parseFloat(value?.toString().replace(/,/g, '') || '0')
          return num.toLocaleString('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        }}
        parser={(value) => {
          return parseFloat(value?.replace(/,/g, '') || '0')
        }}
        min={0}
        step={0.01}
        precision={2}
        stringMode={false}
      />
    </div>
  )
}

export default CurrencyInput