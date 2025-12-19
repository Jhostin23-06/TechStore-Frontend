import React, { useState } from 'react'
import { Modal, Button, message } from 'antd'
import { Sale } from '@/types/api.types'
import InvoiceTemplate from './InvoiceTemplate'
import { DocumentService } from '@/services/documentService'

interface InvoiceModalProps {
  sale: Sale
  open: boolean
  onClose: () => void
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, open, onClose }) => {
  const [generatingPDF, setGeneratingPDF] = useState(false)

  const handlePrint = async () => {
    try {
      setGeneratingPDF(true)
      const pdfBlob = await DocumentService.generateInvoicePDF(sale)
      DocumentService.printPDF(pdfBlob)
      message.success('Enviado a impresión')
    } catch (error) {
      message.error('Error al generar el PDF para imprimir')
      console.error(error)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setGeneratingPDF(true)
      const pdfBlob = await DocumentService.generateInvoicePDF(sale)
      const docType = sale.tipoDocumento === 'factura' ? 'Factura' : 'Boleta'
      const filename = `${docType}_${sale.serie || 'B001'}-${sale.numeroDocumento || '000001'}.pdf`
      DocumentService.downloadPDF(pdfBlob, filename)
      message.success('PDF descargado correctamente')
    } catch (error) {
      message.error('Error al generar el PDF')
      console.error(error)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleViewFullScreen = async () => {
    try {
      const pdfBlob = await DocumentService.generateInvoicePDF(sale)
      DocumentService.openInNewTab(pdfBlob)
    } catch (error) {
      message.error('Error al abrir el PDF')
      console.error(error)
    }
  }

  const handleShare = () => {
    // Futura implementación para compartir por WhatsApp/Email
    message.info('Función de compartir disponible próximamente')
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
          sale={sale}
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