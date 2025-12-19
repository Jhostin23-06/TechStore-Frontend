import { utils, writeFile } from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ExportData {
  [key: string]: any
}

export const exportToExcel = (data: ExportData[], filename: string) => {
  try {
    // Limpiar datos para Excel
    const cleanedData = data.map(item => {
      const cleanItem: any = {}
      Object.keys(item).forEach(key => {
        // Convertir valores a string para evitar problemas
        const value = item[key]
        cleanItem[key] = value === null || value === undefined ? '' : 
                       typeof value === 'object' ? JSON.stringify(value) : 
                       String(value)
      })
      return cleanItem
    })
    
    const worksheet = utils.json_to_sheet(cleanedData)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Datos')
    writeFile(workbook, `${filename}.xlsx`)
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    throw error
  }
}

export const exportToPDF = (data: ExportData[], columns: Array<{title: string, dataIndex: string}>, filename: string) => {
  try {
    const doc = new jsPDF()
    
    // Preparar datos para la tabla
    const tableData = data.map(item => 
      columns.map(col => {
        const value = item[col.dataIndex]
        return value === null || value === undefined ? '' : 
               typeof value === 'object' ? JSON.stringify(value) : 
               String(value)
      })
    )
    
    // Preparar encabezados
    const headers = columns.map(col => col.title)
    
    autoTable(doc, {
      head: [headers],
      body: tableData,
      theme: 'grid',
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      margin: { top: 20 },
    })
    
    doc.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Error al exportar a PDF:', error)
    throw error
  }
}

export const printTable = (data: ExportData[], columns: Array<{title: string, dataIndex: string}>, filename: string) => {
  try {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    // Crear tabla HTML
    const tableRows = data.map(item => `
      <tr>
        ${columns.map(col => `
          <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">
            ${item[col.dataIndex] || ''}
          </td>
        `).join('')}
      </tr>
    `).join('')
    
    const tableHTML = `
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            h2 { 
              color: #2c3e50; 
              margin-bottom: 10px;
            }
            .info {
              color: #666;
              margin-bottom: 20px;
              font-size: 14px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              font-size: 12px;
            }
            th { 
              background-color: #2980b9; 
              color: white; 
              font-weight: bold;
              padding: 10px;
              text-align: left;
              border: 1px solid #1c5a7d;
            }
            td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            tr:nth-child(even) { background-color: #f9f9f9; }
            tr:hover { background-color: #f5f5f5; }
            @media print {
              body { margin: 0; padding: 10px; }
              h2 { color: #000; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h2>${filename}</h2>
          <div class="info">
            Generado el: ${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <table>
            <thead>
              <tr>${columns.map(col => `<th>${col.title}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="no-print" style="margin-top: 20px;">
            <button onclick="window.print()" style="
              background-color: #2980b9;
              color: white;
              border: none;
              padding: 10px 20px;
              cursor: pointer;
              border-radius: 4px;
              font-size: 14px;
            ">
              Imprimir
            </button>
            <button onclick="window.close()" style="
              background-color: #e74c3c;
              color: white;
              border: none;
              padding: 10px 20px;
              cursor: pointer;
              border-radius: 4px;
              font-size: 14px;
              margin-left: 10px;
            ">
              Cerrar
            </button>
          </div>
        </body>
      </html>
    `
    
    printWindow.document.write(tableHTML)
    printWindow.document.close()
    
    // Esperar a que cargue el contenido antes de imprimir
    printWindow.onload = () => {
      printWindow.focus()
    }
  } catch (error) {
    console.error('Error al imprimir:', error)
    throw error
  }
}