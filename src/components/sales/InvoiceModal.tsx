// InvoiceModal.tsx - Versión mejorada
import React, { useState, useEffect } from 'react'
import { Modal, Button, message } from 'antd'
import { Sale, Client, Product } from '@/types/api.types'
import InvoiceTemplate from './InvoiceTemplate'
import { DocumentService } from '@/services/documentService'
import { useClients } from '@/hooks/useClients'
import { useProducts } from '@/hooks/useProducts'

interface InvoiceModalProps {
  sale: Sale
  open: boolean
  onClose: () => void
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, open, onClose }) => {
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [enrichedSale, setEnrichedSale] = useState<Sale | null>(null)
  
  const { clients } = useClients()
  const { products } = useProducts()

  // Enriquecer datos cuando se abra el modal
  useEffect(() => {
    if (open && sale) {
      // Función para enriquecer la venta
      const enrichSaleData = (): Sale => {
        // Buscar cliente
        const cliente = sale.cliente || clients?.find(c => c.id === sale.clienteId)
        
        // Enriquecer detalles con productos
        const detallesEnriquecidos = sale.detalles?.map(detalle => {
          const producto = detalle.producto || products?.find(p => p.id === detalle.productoId)
          
          return {
            ...detalle,
            producto: producto || {
              id: detalle.productoId,
              nombre: `Producto ${detalle.productoId}`,
              marca: 'N/A',
              modelo: 'N/A',
              descripcion: 'Producto no especificado',
              precio: detalle.precioUnitario,
              stock: 0,
              codigo: `PROD-${detalle.productoId}`,
              fechaRegistro: new Date().toISOString(),
              categoriaId: 0
            }
          }
        }) || []
        
        return {
          ...sale,
          cliente: cliente || {
            id: sale.clienteId,
            nombre: 'Cliente Genérico',
            dniRuc: '00000000',
            direccion: 'Sin dirección',
            telefono: '',
            email: ''
          },
          detalles: detallesEnriquecidos
        }
      }
      
      const enriched = enrichSaleData()
      console.log('Venta enriquecida:', enriched)
      console.log('Cliente en venta enriquecida:', enriched.cliente)
      
      setEnrichedSale(enriched)
    }
  }, [open, sale, clients, products])

  const handlePrint = async () => {
    try {
      setGeneratingPDF(true)
      
      if (!enrichedSale) {
        throw new Error('No hay datos de venta enriquecidos')
      }
      
      console.log('Generando PDF con venta:', enrichedSale)
      console.log('Cliente para PDF:', enrichedSale.cliente)
      
      const pdfBlob = await DocumentService.generateInvoicePDF(enrichedSale)
      DocumentService.printPDF(pdfBlob)
      message.success('Enviado a impresión')
    } catch (error) {
      message.error('Error al generar el PDF para imprimir')
      console.error('Error en print:', error)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setGeneratingPDF(true)
      
      if (!enrichedSale) {
        throw new Error('No hay datos de venta enriquecidos')
      }
      
      const pdfBlob = await DocumentService.generateInvoicePDF(enrichedSale)
      const docType = enrichedSale.tipoDocumento === 'factura' ? 'Factura' : 'Boleta'
      const filename = `${docType}_${enrichedSale.serie || 'B001'}-${enrichedSale.numeroDocumento || '000001'}.pdf`
      DocumentService.downloadPDF(pdfBlob, filename)
      message.success('PDF descargado correctamente')
    } catch (error) {
      message.error('Error al generar el PDF')
      console.error('Error en download:', error)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleViewFullScreen = async () => {
    try {
      if (!enrichedSale) {
        throw new Error('No hay datos de venta enriquecidos')
      }
      
      const pdfBlob = await DocumentService.generateInvoicePDF(enrichedSale)
      DocumentService.openInNewTab(pdfBlob)
    } catch (error) {
      message.error('Error al abrir el PDF')
      console.error('Error en view:', error)
    }
  }

  const handleShare = () => {
    message.info('Función de compartir disponible próximamente')
  }

  if (!enrichedSale) {
    return null
  }

  return (
    <Modal
      title="Comprobante de Venta"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,
        <Button 
          key="download" 
          type="primary" 
          onClick={handleDownloadPDF}
          loading={generatingPDF}
        >
          Guardar PDF
        </Button>
      ]}
      width={1000}
      centered
      className="invoice-modal"
    >
      <div className="mt-4 max-h-[70vh] overflow-y-auto">
        <InvoiceTemplate
          sale={enrichedSale}
          onPrint={handlePrint}
          onDownload={handleDownloadPDF}
          onView={handleViewFullScreen}
          onShare={handleShare}
        />
      </div>
    </Modal>
  )
}

export default InvoiceModal