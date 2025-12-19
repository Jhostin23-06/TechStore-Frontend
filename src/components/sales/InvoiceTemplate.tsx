import React from 'react'
import { Card, Button, Space, QRCode } from 'antd'
import { PrinterOutlined, DownloadOutlined, EyeOutlined, ShareAltOutlined } from '@ant-design/icons'
import { Sale, DocumentType, PaymentMethod } from '@/types/api.types'
import { InvoiceGenerator } from '@/services/invoiceGenerator'
import dayjs from 'dayjs'
import { useTheme } from '@/contexts/ThemeContext'

interface InvoiceTemplateProps {
  sale: Sale
  onPrint?: () => void
  onDownload?: () => void
  onView?: () => void
  onShare?: () => void
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ 
  sale, 
  onPrint, 
  onDownload, 
  onView,
  onShare 
}) => {
  const { mode } = useTheme()
  
  // Calcular totales
  const subtotal = sale.detalles?.reduce((sum, detalle) => 
    sum + (detalle.subtotal || detalle.cantidad * detalle.precioUnitario), 0
  ) || 0
  
  const igv = subtotal * 0.18
  const total = sale.total || subtotal + igv
  
  // Formatear valores
  const formatCurrency = InvoiceGenerator.formatCurrency
  const getDocTypeText = () => sale.tipoDocumento === DocumentType.FACTURA ? 'FACTURA' : 'BOLETA DE VENTA'
  const getPaymentMethodText = () => {
    if (!sale.metodoPago) return 'EFECTIVO'
    return sale.metodoPago.toUpperCase()
  }

  return (
    <div className={`rounded-lg border ${mode === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} shadow-lg p-6 max-w-4xl mx-auto`}>
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h1 className={`text-2xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
          TECHSTORE PERÚ
        </h1>
        <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
          Av. Tecnología 123, San Isidro, Lima - Perú
        </p>
        <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
          RUC: 20601234567 | Teléfono: (01) 234-5678
        </p>
        <div className="mt-3">
          <span className={`inline-block px-4 py-2 rounded-full font-bold ${mode === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
            {getDocTypeText()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Información del documento */}
        <div className={`p-4 rounded-lg ${mode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h3 className={`font-bold mb-3 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            DATOS DEL COMPROBANTE
          </h3>
          <div className="space-y-2">
            <p className={mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">Serie/Número:</span><br/>
              {sale.serie || 'B001'}-{sale.numeroDocumento || '000001'}
            </p>
            <p className={mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">Fecha:</span><br/>
              {dayjs(sale.fecha).format('DD/MM/YYYY HH:mm:ss')}
            </p>
            <p className={mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">Tipo:</span><br/>
              {getDocTypeText()}
            </p>
          </div>
        </div>

        {/* Información del cliente */}
        <div className={`p-4 rounded-lg ${mode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h3 className={`font-bold mb-3 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            DATOS DEL CLIENTE
          </h3>
          <div className="space-y-2">
            <p className={mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">Nombre/Razón Social:</span><br/>
              {sale.cliente?.nombre || 'CLIENTE GENÉRICO'}
            </p>
            <p className={mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">Documento:</span><br/>
              {sale.cliente?.dniRuc || '00000000'}
            </p>
            <p className={mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">Dirección:</span><br/>
              {sale.cliente?.direccion || 'LIMA, PERÚ'}
            </p>
          </div>
        </div>

        {/* QR Code */}
        <div className={`p-4 rounded-lg flex flex-col items-center justify-center ${mode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <QRCode 
            value={InvoiceGenerator.generateQRCodeData(sale)}
            size={120}
            color={mode === 'dark' ? '#ffffff' : '#000000'}
            bgColor={mode === 'dark' ? 'transparent' : 'transparent'}
          />
          <p className={`text-xs mt-2 text-center ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Código QR del comprobante
          </p>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="mb-8">
        <h3 className={`font-bold mb-4 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          DETALLE DE PRODUCTOS
        </h3>
        <div className={`overflow-x-auto rounded-lg border ${mode === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
          <table className="w-full">
            <thead className={mode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}>
              <tr>
                <th className={`py-3 px-4 text-left font-semibold ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cant.
                </th>
                <th className={`py-3 px-4 text-left font-semibold ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Descripción
                </th>
                <th className={`py-3 px-4 text-left font-semibold ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  P. Unitario
                </th>
                <th className={`py-3 px-4 text-left font-semibold ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {sale.detalles?.map((detalle, index) => (
                <tr 
                  key={index} 
                  className={`border-t ${mode === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <td className="py-3 px-4">{detalle.cantidad}</td>
                  <td className="py-3 px-4">{detalle.producto?.nombre || `Producto ${detalle.productoId}`}</td>
                  <td className="py-3 px-4">{formatCurrency(detalle.precioUnitario)}</td>
                  <td className="py-3 px-4 font-medium">
                    {formatCurrency(detalle.subtotal || detalle.cantidad * detalle.precioUnitario)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totales y forma de pago */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className={`font-bold mb-3 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            FORMA DE PAGO
          </h3>
          <div className={`p-4 rounded-lg ${mode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-lg font-medium ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {getPaymentMethodText()}
            </p>
          </div>
        </div>

        <div>
          <h3 className={`font-bold mb-3 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            RESUMEN DE IMPORTES
          </h3>
          <div className={`p-4 rounded-lg space-y-3 ${mode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex justify-between">
              <span className={mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className={mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>IGV (18%):</span>
              <span className="font-medium">{formatCurrency(igv)}</span>
            </div>
            <div className={`flex justify-between text-xl font-bold pt-3 border-t ${mode === 'dark' ? 'border-gray-700 text-green-400' : 'border-gray-300 text-green-600'}`}>
              <span>TOTAL:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <div className={`text-center text-xs ${mode === 'dark' ? 'text-gray-500' : 'text-gray-400'} border-t pt-4 mt-6`}>
        <p>Representación impresa del comprobante de pago electrónico</p>
        <p>Autorizado mediante Resolución de Intendencia N° 034-005-0004434/SUNAT</p>
        <p className="mt-2">Código Hash: {InvoiceGenerator.generateQRCodeData(sale).substring(0, 30)}...</p>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <Button 
          type="primary" 
          icon={<PrinterOutlined />} 
          onClick={onPrint}
          size="large"
        >
          Imprimir
        </Button>
        <Button 
          icon={<DownloadOutlined />} 
          onClick={onDownload}
          size="large"
        >
          Descargar PDF
        </Button>
        <Button 
          icon={<EyeOutlined />} 
          onClick={onView}
          size="large"
        >
          Ver en Pantalla Completa
        </Button>
        <Button 
          icon={<ShareAltOutlined />} 
          onClick={onShare}
          size="large"
        >
          Compartir
        </Button>
      </div>
    </div>
  )
}

export default InvoiceTemplate