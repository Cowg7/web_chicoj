// src/modules/cashier/cashier.controller.js
import prisma from '../../config/database.js';
import { AppError, asyncHandler } from '../../middlewares/errorHandler.js';

// GET /cashier/pending - Obtener órdenes pendientes en caja
export const getPendingOrders = asyncHandler(async (req, res) => {
  const ordenes = await prisma.cuenta.findMany({
    where: {
      estado: 'En Caja'
    },
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
      fecha: 'asc'
    }
  });

  console.log(`💰 ${ordenes.length} órdenes en caja`);

  res.json({
    success: true,
    data: { orders: ordenes, total: ordenes.length }
  });
});

// POST /cashier/:id/finalize - Finalizar orden (cobrar)
export const finalizeOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { metodo_pago, monto_recibido, cambio_devuelto, nombre_cliente, nit } = req.body;

  const orden = await prisma.cuenta.findUnique({
    where: { id_orden: parseInt(id) },
    include: {
      comandas: true,
      area_registros: true
    }
  });

  if (!orden) {
    throw new AppError('Orden no encontrada', 404);
  }

  if (orden.estado !== 'En Caja') {
    throw new AppError('La orden no está en caja', 400);
  }

  // Calcular total si no está calculado
  let total = parseFloat(orden.total);
  if (total === 0) {
    total = orden.comandas.reduce((sum, comanda) => {
      const subtotal = parseFloat(comanda.precio_unitario) * comanda.cantidad;
      const extra = parseFloat(comanda.extra_precio || 0);
      return sum + subtotal + extra;
    }, 0);
  }

  // Crear comprobante de caja
  const comprobante = await prisma.caja_comprobante.create({
    data: {
      id_orden: parseInt(id),
      lugar: 'Restaurante Chicooj',
      nombre_cliente: nombre_cliente || 'Consumidor Final',
      nit: nit || 'C/F',
      total_capturado: total,
      metodo_pago: metodo_pago,
      monto_recibido: monto_recibido ? parseFloat(monto_recibido) : null,
      cambio_devuelto: cambio_devuelto ? parseFloat(cambio_devuelto) : null,
      fecha: new Date()
    }
  });

  // Actualizar orden a Finalizada
  const ordenFinalizada = await prisma.cuenta.update({
    where: { id_orden: parseInt(id) },
    data: {
      estado: 'Finalizada',
      total
    }
  });

  console.log(`✅ Orden ${id} finalizada. Total: Q${total}, Método: ${metodo_pago}`);

  res.json({
    success: true,
    message: 'Orden finalizada exitosamente',
    data: {
      orden: ordenFinalizada,
      comprobante
    }
  });
});

// GET /cashier/history - Historial de órdenes finalizadas
export const getOrdersHistory = asyncHandler(async (req, res) => {
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
  } else {
    // Por defecto, mostrar solo del día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    where.fecha = {
      gte: today,
      lt: tomorrow
    };
  }

  const ordenes = await prisma.cuenta.findMany({
    where,
    include: {
      comandas: true,
      usuario: {
        include: {
          empleado: true
        }
      },
      caja_comprobantes: true
    },
    orderBy: {
      fecha: 'desc'
    }
  });

  // Calcular estadísticas
  const totalVentas = ordenes.reduce((sum, orden) => sum + parseFloat(orden.total), 0);
  const totalOrdenes = ordenes.length;

  console.log(`📊 ${totalOrdenes} órdenes finalizadas. Total: Q${totalVentas}`);

  res.json({
    success: true,
    data: {
      orders: ordenes,
      total_ordenes: totalOrdenes,
      total_ventas: totalVentas
    }
  });
});

// GET /cashier/stats - Estadísticas de caja
export const getCashierStats = asyncHandler(async (req, res) => {
  const { fecha } = req.query;

  // Determinar rango de fecha
  const startDate = fecha ? new Date(fecha) : new Date();
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setHours(23, 59, 59, 999);

  // Órdenes finalizadas del día
  const ordenesFinalizadas = await prisma.cuenta.findMany({
    where: {
      estado: 'Finalizada',
      fecha: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      comandas: {
        include: {
          platillo: true
        }
      }
    }
  });

  // Órdenes en caja (pendientes de pago)
  const ordenesEnCaja = await prisma.cuenta.count({
    where: {
      estado: 'En Caja'
    }
  });

  // Calcular estadísticas
  const totalVentas = ordenesFinalizadas.reduce((sum, orden) => sum + parseFloat(orden.total || 0), 0);
  const totalOrdenes = ordenesFinalizadas.length;

  // Platillos más vendidos
  const platillosVendidos = {};
  ordenesFinalizadas.forEach(orden => {
    orden.comandas.forEach(comanda => {
      const nombre = comanda.platillo_nombre;
      if (!platillosVendidos[nombre]) {
        platillosVendidos[nombre] = {
          nombre,
          cantidad: 0,
          total: 0
        };
      }
      platillosVendidos[nombre].cantidad += comanda.cantidad;
      platillosVendidos[nombre].total += parseFloat(comanda.precio_unitario) * comanda.cantidad;
    });
  });

  const topPlatillos = Object.values(platillosVendidos)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);

  console.log(`📊 Stats - Ventas: Q${totalVentas}, Órdenes: ${totalOrdenes}, En Caja: ${ordenesEnCaja}`);

  res.json({
    success: true,
    data: {
      fecha: startDate.toISOString().split('T')[0],
      total_ventas_hoy: totalVentas,
      ordenes_finalizadas_hoy: totalOrdenes,
      ordenes_en_caja: ordenesEnCaja,
      promedio_venta: totalOrdenes > 0 ? totalVentas / totalOrdenes : 0,
      top_platillos: topPlatillos
    }
  });
});

