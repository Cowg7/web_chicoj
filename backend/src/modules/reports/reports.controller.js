// src/modules/reports/reports.controller.js
import prisma from '../../config/database.js';
import { AppError, asyncHandler } from '../../middlewares/errorHandler.js';
import PDFDocument from 'pdfkit';

// GET /reports/sales - Reporte de ventas
export const getSalesReport = asyncHandler(async (req, res) => {
  const { fecha_desde, fecha_hasta } = req.query;

  const where = {
    estado: 'Finalizada'
  };

  // Filtrar por rango de fechas
  if (fecha_desde || fecha_hasta) {
    where.fecha = {};
    if (fecha_desde) {
      where.fecha.gte = new Date(fecha_desde);
    }
    if (fecha_hasta) {
      const endDate = new Date(fecha_hasta);
      endDate.setHours(23, 59, 59, 999);
      where.fecha.lte = endDate;
    }
  }

  const ordenes = await prisma.cuenta.findMany({
    where,
    include: {
      comandas: {
        include: {
          platillo: {
            include: {
              area: true
            }
          }
        }
      },
      usuario: {
        include: {
          empleado: true
        }
      }
    },
    orderBy: {
      fecha: 'desc'
    }
  });

  // Calcular totales
  const totalVentas = ordenes.reduce((sum, orden) => sum + parseFloat(orden.total), 0);
  const totalOrdenes = ordenes.length;

  // Agrupar por fecha
  const ventasPorDia = {};
  ordenes.forEach(orden => {
    const fecha = orden.fecha.toISOString().split('T')[0];
    if (!ventasPorDia[fecha]) {
      ventasPorDia[fecha] = {
        fecha,
        total_ventas: 0,
        total_ordenes: 0
      };
    }
    ventasPorDia[fecha].total_ventas += parseFloat(orden.total);
    ventasPorDia[fecha].total_ordenes += 1;
  });

  res.json({
    success: true,
    data: {
      total_ventas: totalVentas,
      total_ordenes: totalOrdenes,
      promedio_venta: totalOrdenes > 0 ? totalVentas / totalOrdenes : 0,
      ventas_por_dia: Object.values(ventasPorDia),
      ordenes
    }
  });
});

// GET /reports/top-dishes - Platillos más vendidos
export const getTopDishes = asyncHandler(async (req, res) => {
  const { fecha_desde, fecha_hasta, limit = 10 } = req.query;

  const where = {
    cuenta: {
      estado: 'Finalizada'
    }
  };

  // Filtrar por rango de fechas
  if (fecha_desde || fecha_hasta) {
    where.cuenta = {
      ...where.cuenta,
      fecha: {}
    };
    if (fecha_desde) {
      where.cuenta.fecha.gte = new Date(fecha_desde);
    }
    if (fecha_hasta) {
      const endDate = new Date(fecha_hasta);
      endDate.setHours(23, 59, 59, 999);
      where.cuenta.fecha.lte = endDate;
    }
  }

  const comandas = await prisma.comanda.findMany({
    where,
    include: {
      platillo: {
        include: {
          area: true
        }
      },
      cuenta: true
    }
  });

  // Agrupar por platillo
  const platillosStats = {};
  comandas.forEach(comanda => {
    const nombre = comanda.platillo_nombre;
    const area = comanda.platillo?.area?.nombre || 'Sin área';
    
    if (!platillosStats[nombre]) {
      platillosStats[nombre] = {
        nombre,
        area,
        cantidad_vendida: 0,
        total_ingresos: 0,
        veces_ordenado: 0
      };
    }
    
    platillosStats[nombre].cantidad_vendida += comanda.cantidad;
    platillosStats[nombre].total_ingresos += parseFloat(comanda.precio_unitario) * comanda.cantidad;
    platillosStats[nombre].veces_ordenado += 1;
  });

  const topPlatillos = Object.values(platillosStats)
    .sort((a, b) => b.cantidad_vendida - a.cantidad_vendida)
    .slice(0, parseInt(limit));

  res.json({
    success: true,
    data: {
      top_platillos: topPlatillos,
      total_platillos_unicos: Object.keys(platillosStats).length
    }
  });
});

// GET /reports/peak-hours - Horarios de mayor afluencia
export const getPeakHours = asyncHandler(async (req, res) => {
  const { fecha_desde, fecha_hasta } = req.query;

  const where = {
    estado: 'Finalizada'
  };

  // Filtrar por rango de fechas
  if (fecha_desde || fecha_hasta) {
    where.fecha = {};
    if (fecha_desde) {
      where.fecha.gte = new Date(fecha_desde);
    }
    if (fecha_hasta) {
      const endDate = new Date(fecha_hasta);
      endDate.setHours(23, 59, 59, 999);
      where.fecha.lte = endDate;
    }
  }

  const ordenes = await prisma.cuenta.findMany({
    where,
    select: {
      fecha: true,
      total: true
    }
  });

  // Agrupar por hora
  const ordenesPorHora = {};
  ordenes.forEach(orden => {
    const hora = new Date(orden.fecha).getHours();
    if (!ordenesPorHora[hora]) {
      ordenesPorHora[hora] = {
        hora: `${hora}:00`,
        total_ordenes: 0,
        total_ventas: 0
      };
    }
    ordenesPorHora[hora].total_ordenes += 1;
    ordenesPorHora[hora].total_ventas += parseFloat(orden.total);
  });

  const horariosOrdenados = Object.values(ordenesPorHora)
    .sort((a, b) => b.total_ordenes - a.total_ordenes);

  res.json({
    success: true,
    data: {
      horarios: horariosOrdenados,
      hora_pico: horariosOrdenados[0] || null
    }
  });
});

// GET /reports/by-area - Ventas por área
export const getSalesByArea = asyncHandler(async (req, res) => {
  const { fecha_desde, fecha_hasta } = req.query;

  const where = {
    cuenta: {
      estado: 'Finalizada'
    }
  };

  // Filtrar por rango de fechas
  if (fecha_desde || fecha_hasta) {
    where.cuenta = {
      ...where.cuenta,
      fecha: {}
    };
    if (fecha_desde) {
      where.cuenta.fecha.gte = new Date(fecha_desde);
    }
    if (fecha_hasta) {
      const endDate = new Date(fecha_hasta);
      endDate.setHours(23, 59, 59, 999);
      where.cuenta.fecha.lte = endDate;
    }
  }

  const comandas = await prisma.comanda.findMany({
    where,
    include: {
      platillo: {
        include: {
          area: true
        }
      }
    }
  });

  // Agrupar por área
  const ventasPorArea = {};
  comandas.forEach(comanda => {
    const areaNombre = comanda.platillo?.area?.nombre || 'Sin área';
    
    if (!ventasPorArea[areaNombre]) {
      ventasPorArea[areaNombre] = {
        area: areaNombre,
        cantidad_items: 0,
        total_ingresos: 0
      };
    }
    
    ventasPorArea[areaNombre].cantidad_items += comanda.cantidad;
    ventasPorArea[areaNombre].total_ingresos += parseFloat(comanda.precio_unitario) * comanda.cantidad;
  });

  res.json({
    success: true,
    data: {
      ventas_por_area: Object.values(ventasPorArea)
    }
  });
});

// GET /reports/dashboard - Dashboard general
export const getDashboard = asyncHandler(async (req, res) => {
  // Obtener datos del día actual
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Órdenes del día
  const ordenesHoy = await prisma.cuenta.findMany({
    where: {
      fecha: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  const ordenesFinalizadas = ordenesHoy.filter(o => o.estado === 'Finalizada');
  const ordenesEnProceso = ordenesHoy.filter(o => ['Pendiente', 'En Preparación', 'Preparada', 'En Caja'].includes(o.estado));

  const totalVentasHoy = ordenesFinalizadas.reduce((sum, orden) => sum + parseFloat(orden.total), 0);

  // Órdenes en cada estado
  const estadosCount = {
    pendientes: ordenesHoy.filter(o => o.estado === 'Pendiente').length,
    en_preparacion: ordenesHoy.filter(o => o.estado === 'En Preparación').length,
    preparadas: ordenesHoy.filter(o => o.estado === 'Preparada').length,
    en_caja: ordenesHoy.filter(o => o.estado === 'En Caja').length,
    finalizadas: ordenesFinalizadas.length
  };

  res.json({
    success: true,
    data: {
      fecha: today.toISOString().split('T')[0],
      total_ventas_hoy: totalVentasHoy,
      total_ordenes_hoy: ordenesHoy.length,
      ordenes_finalizadas: ordenesFinalizadas.length,
      ordenes_en_proceso: ordenesEnProceso.length,
      promedio_venta: ordenesFinalizadas.length > 0 ? totalVentasHoy / ordenesFinalizadas.length : 0,
      estados: estadosCount
    }
  });
});

// GET /reports/pdf - Generar PDF del reporte
export const generateReportPDF = asyncHandler(async (req, res) => {
  const { fecha_desde, fecha_hasta } = req.query;

  // Obtener datos del reporte
  const where = {
    estado: 'Finalizada'
  };

  if (fecha_desde || fecha_hasta) {
    where.fecha = {};
    if (fecha_desde) {
      where.fecha.gte = new Date(fecha_desde);
    }
    if (fecha_hasta) {
      const endDate = new Date(fecha_hasta);
      endDate.setHours(23, 59, 59, 999);
      where.fecha.lte = endDate;
    }
  }

  const ordenes = await prisma.cuenta.findMany({
    where,
    include: {
      comandas: {
        include: {
          platillo: {
            include: {
              area: true
            }
          }
        }
      }
    },
    orderBy: {
      fecha: 'desc'
    }
  });

  // Calcular totales
  const totalVentas = ordenes.reduce((sum, orden) => sum + parseFloat(orden.total), 0);
  const totalOrdenes = ordenes.length;

  // Crear PDF
  const doc = new PDFDocument({ margin: 50 });
  
  // Configurar headers para descarga de PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=reporte-${new Date().toISOString().split('T')[0]}.pdf`);
  
  // Pipe el PDF directamente a la respuesta
  doc.pipe(res);

  // Título
  doc.fontSize(20).font('Helvetica-Bold').text('Restaurante Chicooj', { align: 'center' });
  doc.fontSize(16).text('Reporte de Ventas', { align: 'center' });
  doc.moveDown();

  // Fecha del reporte
  const fechaInicio = fecha_desde ? new Date(fecha_desde).toLocaleDateString('es-GT') : 'Inicio';
  const fechaFin = fecha_hasta ? new Date(fecha_hasta).toLocaleDateString('es-GT') : 'Hoy';
  doc.fontSize(12).font('Helvetica').text(`Período: ${fechaInicio} - ${fechaFin}`, { align: 'center' });
  doc.text(`Generado: ${new Date().toLocaleString('es-GT')}`, { align: 'center' });
  doc.moveDown(2);

  // Resumen
  doc.fontSize(14).font('Helvetica-Bold').text('Resumen General');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica')
    .text(`Total de Órdenes: ${totalOrdenes}`)
    .text(`Total de Ventas: Q ${totalVentas.toFixed(2)}`)
    .text(`Promedio por Orden: Q ${(totalVentas / totalOrdenes || 0).toFixed(2)}`);
  doc.moveDown(2);

  // Detalle de órdenes (solo las últimas 20)
  doc.fontSize(14).font('Helvetica-Bold').text('Últimas 20 Órdenes');
  doc.moveDown(0.5);

  const ordenesLimitadas = ordenes.slice(0, 20);
  ordenesLimitadas.forEach((orden, index) => {
    if (index > 0 && index % 8 === 0) {
      doc.addPage(); // Nueva página cada 8 órdenes
    }
    
    doc.fontSize(11).font('Helvetica-Bold')
      .text(`Orden #${String(orden.id_orden).padStart(5, '0')} - Mesa ${orden.no_mesa}`);
    doc.fontSize(10).font('Helvetica')
      .text(`Fecha: ${new Date(orden.fecha).toLocaleString('es-GT')}`)
      .text(`Total: Q ${parseFloat(orden.total).toFixed(2)}`);
    
    if (orden.comandas && orden.comandas.length > 0) {
      orden.comandas.forEach(comanda => {
        doc.text(`  • ${comanda.cantidad}x ${comanda.platillo_nombre} - Q ${parseFloat(comanda.precio_unitario).toFixed(2)}`);
      });
    }
    doc.moveDown(0.5);
  });

  // Pie de página
  doc.moveDown(2);
  doc.fontSize(10).text('© Restaurante Chicooj - Todos los derechos reservados', { align: 'center' });

  // Finalizar el PDF
  doc.end();
});
