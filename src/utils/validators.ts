import { z } from 'zod'

// Validadores reutilizables
export const validators = {
  dni: z.string()
    .min(8, 'El DNI debe tener 8 dígitos')
    .max(8, 'El DNI debe tener 8 dígitos')
    .regex(/^\d+$/, 'El DNI debe contener solo números'),
  
  ruc: z.string()
    .min(11, 'El RUC debe tener 11 dígitos')
    .max(11, 'El RUC debe tener 11 dígitos')
    .regex(/^\d+$/, 'El RUC debe contener solo números'),
  
  phone: z.string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos')
    .regex(/^[0-9+\-\s]+$/, 'Teléfono inválido'),
  
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  
  price: z.number()
    .min(0, 'El precio no puede ser negativo')
    .max(1000000, 'El precio no puede exceder 1,000,000'),
  
  stock: z.number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .max(10000, 'El stock no puede exceder 10,000'),
}

// Función para validar DNI o RUC
export const validateDniRuc = (value: string): boolean => {
  if (value.length === 8) {
    // Validar DNI
    return /^\d{8}$/.test(value)
  } else if (value.length === 11) {
    // Validar RUC
    return /^\d{11}$/.test(value)
  }
  return false
}

// Función para formatear precio
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(price)
}

// Función para calcular total de venta
export const calculateSaleTotal = (detalles: Array<{
  cantidad: number
  precioUnitario: number
}>): number => {
  return detalles.reduce((total, detalle) => {
    return total + (detalle.cantidad * detalle.precioUnitario)
  }, 0)
}