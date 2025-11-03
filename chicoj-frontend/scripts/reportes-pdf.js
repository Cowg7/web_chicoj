// Funciones específicas para generar PDFs de reportes
// Este archivo complementa reportes.js

// Función auxiliar para crear encabezado del PDF
function crearEncabezadoPDF(doc, titulo, params) {
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(74, 144, 226);
  doc.text('Restaurante Chicooj', 105, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(titulo, 105, 23, { align: 'center' });

  // Línea separadora
  doc.setDrawColor(74, 144, 226);
  doc.setLineWidth(0.5);
  doc.line(14, 27, 196, 27);

  // Información del período
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Período: ${params.fecha_desde || 'Inicio'} a ${params.fecha_hasta || 'Hoy'}`, 14, 33);
  doc.text(`Generado: ${new Date().toLocaleString('es-GT')}`, 14, 38);
}

// Función auxiliar para agregar footer
function agregarFooterPDF(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(128, 128, 128);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, doc.internal.pageSize.height - 15, 196, doc.internal.pageSize.height - 15);
    doc.text(`Página ${i} de ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
    doc.text('Restaurante Chicooj', 14, doc.internal.pageSize.height - 10);
  }
}

// PDF 1: Platillos Vendidos
window.generarPDFPlatillos = async function() {
  try {
    const params = window.getFilterParams();
    console.log('📄 Generando PDF de Platillos...');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    crearEncabezadoPDF(doc, 'Reporte de Platillos Vendidos', params);

    let y = 45;

    // Obtener datos
    const dishesData = await API.reports.getTopDishes({ ...params, limit: 50 });
    const salesData = await API.reports.getSales(params);
    
    const dishesInfo = dishesData.data || dishesData;
    const platillos = dishesInfo.top_platillos || dishesInfo.top_dishes || [];
    
    const resumen = salesData.data || salesData;
    const totalVentas = parseFloat(resumen.total_ventas || 0);

    // Resumen
    doc.setFillColor(240, 248, 255);
    doc.rect(14, y - 5, 182, 18, 'F');
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN', 105, y + 2, { align: 'center' });
    y += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Platillos: ${platillos.length}`, 20, y);
    doc.text(`Ventas: Q${totalVentas.toFixed(2)}`, 110, y);
    y += 15;

    // Tabla de platillos
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(74, 144, 226);
    doc.text('Detalle de Platillos Vendidos', 14, y);
    y += 5;

    const datosPlatillos = platillos.map((dish, index) => [
      (index + 1).toString(),
      dish.nombre || 'N/A',
      (dish.cantidad_vendida || 0).toString(),
      (dish.veces_ordenado || 0).toString(),
      dish.area || 'N/A',
      `Q${parseFloat(dish.total_ingresos || 0).toFixed(2)}`
    ]);

    // Totales
    const totalCantidad = platillos.reduce((sum, d) => sum + (d.cantidad_vendida || 0), 0);
    const totalIngresos = platillos.reduce((sum, d) => sum + parseFloat(d.total_ingresos || 0), 0);
    datosPlatillos.push(['', 'TOTAL', totalCantidad.toString(), '', '', `Q${totalIngresos.toFixed(2)}`]);

    doc.autoTable({
      startY: y,
      head: [['#', 'Platillo', 'Cant.', 'Pedidos', 'Área', 'Ingresos']],
      body: datosPlatillos,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [74, 144, 226], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 75 },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 30 },
        5: { cellWidth: 29, halign: 'right' }
      },
      didParseCell: function(data) {
        if (data.row.index === datosPlatillos.length - 1) {
          data.cell.styles.fillColor = [220, 220, 220];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    agregarFooterPDF(doc);
    const fecha = new Date().toISOString().split('T')[0];
    doc.save(`Platillos_Vendidos_${fecha}.pdf`);
    console.log('✅ PDF de platillos generado');
    alert('✅ PDF de Platillos Vendidos descargado');

  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error al generar PDF');
  }
};

// PDF 2: Ventas por Áreas
window.generarPDFAreas = async function() {
  try {
    const params = window.getFilterParams();
    console.log('📄 Generando PDF de Ventas por Áreas...');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    crearEncabezadoPDF(doc, 'Ventas por Áreas de Cocina', params);

    let y = 45;

    // Obtener datos
    const areasData = await API.reports.getSalesByArea(params);
    const salesData = await API.reports.getSales(params);
    
    const areasInfo = areasData.data || areasData;
    const areas = areasInfo.ventas_por_area || areasInfo.revenue_by_area || [];
    
    const resumen = salesData.data || salesData;
    const totalVentas = parseFloat(resumen.total_ventas || 0);

    // Resumen
    doc.setFillColor(240, 248, 255);
    doc.rect(14, y - 5, 182, 18, 'F');
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN', 105, y + 2, { align: 'center' });
    y += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Áreas: ${areas.length}`, 20, y);
    doc.text(`Ventas Totales: Q${totalVentas.toFixed(2)}`, 110, y);
    y += 15;

    // Tabla de áreas
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(74, 144, 226);
    doc.text('Detalle de Ventas por Área', 14, y);
    y += 5;

    const totalAreas = areas.reduce((sum, area) => sum + parseFloat(area.total_ingresos || 0), 0);
    
    const datosAreas = areas.map(area => {
      const ingresos = parseFloat(area.total_ingresos || 0);
      const porcentaje = totalAreas > 0 ? (ingresos / totalAreas * 100) : 0;
      return [
        area.area,
        (area.cantidad_items || 0).toString(),
        `Q${ingresos.toFixed(2)}`,
        `${porcentaje.toFixed(1)}%`
      ];
    });

    // Totales
    datosAreas.push([
      'TOTAL',
      areas.reduce((sum, area) => sum + (area.cantidad_items || 0), 0).toString(),
      `Q${totalAreas.toFixed(2)}`,
      '100.0%'
    ]);

    doc.autoTable({
      startY: y,
      head: [['Área', 'Items Vendidos', 'Ingresos', '% del Total']],
      body: datosAreas,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [74, 144, 226], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      },
      didParseCell: function(data) {
        if (data.row.index === datosAreas.length - 1) {
          data.cell.styles.fillColor = [220, 220, 220];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    agregarFooterPDF(doc);
    const fecha = new Date().toISOString().split('T')[0];
    doc.save(`Ventas_Por_Areas_${fecha}.pdf`);
    console.log('✅ PDF de áreas generado');
    alert('✅ PDF de Ventas por Áreas descargado');

  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error al generar PDF');
  }
};

// PDF 3: Distribución por Horas
window.generarPDFHoras = async function() {
  try {
    const params = window.getFilterParams();
    console.log('📄 Generando PDF de Horas de Venta...');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    crearEncabezadoPDF(doc, 'Distribución de Ventas por Hora', params);

    let y = 45;

    // Obtener datos
    const hoursData = await API.reports.getPeakHours({ ...params, groupBy: 'hour' });
    const salesData = await API.reports.getSales(params);
    
    const hoursInfo = hoursData.data || hoursData;
    const horas = hoursInfo.horarios || hoursInfo.results || [];
    
    const resumen = salesData.data || salesData;
    const totalVentas = parseFloat(resumen.total_ventas || 0);
    const totalOrdenes = parseInt(resumen.total_ordenes || 0);

    // Resumen
    doc.setFillColor(240, 248, 255);
    doc.rect(14, y - 5, 182, 18, 'F');
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN', 105, y + 2, { align: 'center' });
    y += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Órdenes: ${totalOrdenes}`, 20, y);
    doc.text(`Ventas: Q${totalVentas.toFixed(2)}`, 110, y);
    y += 15;

    // Tabla de horas
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(74, 144, 226);
    doc.text('Distribución Horaria de Ventas', 14, y);
    y += 5;

    const datosHoras = horas.map(item => [
      item.hora || item.periodo,
      (item.total_ordenes || item.cantidad_ordenes || 0).toString(),
      `Q${parseFloat(item.total_ventas || 0).toFixed(2)}`
    ]);

    // Totales
    const totalOrdenesHoras = horas.reduce((sum, h) => sum + (h.total_ordenes || h.cantidad_ordenes || 0), 0);
    const totalVentasHoras = horas.reduce((sum, h) => sum + parseFloat(h.total_ventas || 0), 0);
    datosHoras.push([
      'TOTAL',
      totalOrdenesHoras.toString(),
      `Q${totalVentasHoras.toFixed(2)}`
    ]);

    doc.autoTable({
      startY: y,
      head: [['Hora', 'Cantidad de Órdenes', 'Total Ventas']],
      body: datosHoras,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [74, 144, 226], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 60, halign: 'center' },
        1: { cellWidth: 60, halign: 'center' },
        2: { cellWidth: 60, halign: 'right' }
      },
      didParseCell: function(data) {
        if (data.row.index === datosHoras.length - 1) {
          data.cell.styles.fillColor = [220, 220, 220];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    agregarFooterPDF(doc);
    const fecha = new Date().toISOString().split('T')[0];
    doc.save(`Distribucion_Por_Horas_${fecha}.pdf`);
    console.log('✅ PDF de horas generado');
    alert('✅ PDF de Distribución por Horas descargado');

  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error al generar PDF');
  }
};

console.log('✅ Módulo de PDFs específicos cargado');


