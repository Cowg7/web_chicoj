// src/modules/cashier/cashier.controller.js
import prisma from '../../config/database.js';
import { AppError, asyncHandler } from '../../middlewares/errorHandler.js';

// GET /cashier/pending - Obtener cuentas pendientes de pago
export const getPendingOrders = asyncHandler(async (req, res) => {
  const cuentasPendientes = await prisma.cuenta.findMany({
    where: {
      estado: {
        in: ['Abierta', 'Lista'] // Puedes ajustar según tus estados
      }
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
      },
      area_registros: true // Para verificar si hay items pendientes en cocina
    },
    orderBy: {
      fecha: 'asc'
    }
  });
  
  // Formatear respuesta
  const cuentas = cuentasPendientes.map(cuenta => ({
    id_orden: cuenta.id_orden,
    no_mesa: cuenta.no_mesa,
    fecha: cuenta.fecha,
    mesero: `${cuenta.usuario.empleado.nombre} ${cuenta.usuario.empleado.apellidos}`,
    total: parseFloat(cuenta.total),
    estado: cuenta.estado,
    items: cuenta.comandas.map(c => ({
      platillo: c.platillo_nombre,
      cantidad: c.cantidad,
      precio_unitario: parseFloat(c.precio_unitario),
      subtotal: parseFloat(c.subtotal),
      extra_precio: parseFloat(c.extra_precio || 0),
      total_linea: parseFloat(c.total_linea),
      observaciones: c.observaciones,
      extra_observacion: c.extra_observacion
    })),
    items_pendientes_cocina: cuenta.area_registros.length
  }));
  
  res.json({
    success: true,
    data: {
      cuentas,
      total: cuentas.length
    }
  });
});

// GET /cashier/:orderId - Obtener detalle de una cuenta
export const getOrderDetail = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  const cuenta = await prisma.cuenta.findUnique({
    where: { id_orden: parseInt(orderId) },
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
      },
      caja_comprobantes: true
    }
  });
  
  if (!cuenta) {
    throw new AppError('Cuenta no encontrada', 404);
  }
  
  res.json({
    success: true,
    data: { cuenta }
  });
});

// POST /cashier/:orderId/charge - Procesar pago
export const processPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { 
    lugar, 
    nombre_cliente, 
    nit, 
    total_capturado 
  } = req.body;
  
  // Validación básica
  if (!lugar || !total_capturado) {
    throw new AppError('Lugar y total capturado son requeridos', 400);
  }
  
  // Verificar que la cuenta existe
  const cuenta = await prisma.cuenta.findUnique({
    where: { id_orden: parseInt(orderId) },
    include: {
      comandas: true
    }
  });
  
  if (!cuenta) {
    throw new AppError('Cuenta no encontrada', 404);
  }
  
  if (cuenta.estado === 'Cerrada') {
    throw new AppError('Esta cuenta ya fue pagada', 400);
  }
  
  // Validar que el total capturado sea correcto
  const totalCuenta = parseFloat(cuenta.total);
  const totalPagado = parseFloat(total_capturado);
  
  if (totalPagado < totalCuenta) {
    throw new AppError(
      `El monto capturado (Q${totalPagado}) es menor al total de la cuenta (Q${totalCuenta})`,
      400
    );
  }
  
  // Crear comprobante y cerrar cuenta en transacción
  const resultado = await prisma.$transaction(async (tx) => {
    // Crear comprobante
    const comprobante = await tx.caja_comprobante.create({
      data: {
        lugar,
        nombre_cliente: nombre_cliente || 'Consumidor Final',
        nit: nit || 'CF',
        id_orden: parseInt(orderId),
        total_capturado: totalPagado
      }
    });
    
    // Cerrar cuenta
    const cuentaCerrada = await tx.cuenta.update({
      where: { id_orden: parseInt(orderId) },
      data: { estado: 'Cerrada' }
    });
    
    return { comprobante, cuenta: cuentaCerrada };
  });
  
  // Calcular cambio si aplica
  const cambio = totalPagado - totalCuenta;
  
  res.json({
    success: true,
    message: 'Pago procesado exitosamente',
    data: {
      comprobante: resultado.comprobante,
      total_cuenta: totalCuenta,
      total_pagado: totalPagado,
      cambio: cambio > 0 ? cambio : 0
    }
  });
});

// GET /cashier/history - Historial de pagos
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const { fecha_desde, fecha_hasta, limit = 50 } = req.query;
  
  const where = {};
  
  if (fecha_desde || fecha_hasta) {
    where.fecha = {};
    if (fecha_desde) where.fecha.gte = new Date(fecha_desde);
    if (fecha_hasta) {
      const hasta = new Date(fecha_hasta);
      hasta.setHours(23, 59, 59, 999);
      where.fecha.lte = hasta;
    }
  }
  
  const comprobantes = await prisma.caja_comprobante.findMany({
    where,
    include: {
      cuenta: {
        include: {
          comandas: true,
          usuario: {
            include: {
              empleado: true
            }
          }
        }
      }
    },
    orderBy: {
      fecha: 'desc'
    },
    take: parseInt(limit)
  });
  
  res.json({
    success: true,
    data: {
      comprobantes,
      total: comprobantes.length
    }
  });
});

// GET /cashier/stats - Estadísticas de caja
export const getCashierStats = asyncHandler(async (req, res) => {
  const { fecha } = req.query;
  
  let fechaInicio, fechaFin;
  
  if (fecha) {
    fechaInicio = new Date(fecha);
    fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);
  } else {
    // Por defecto, hoy
    fechaInicio = new Date();
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin = new Date();
    fechaFin.setHours(23, 59, 59, 999);
  }
  
  // Total de ventas del día
  const comprobantes = await prisma.caja_comprobante.findMany({
    where: {
      fecha: {
        gte: fechaInicio,
        lte: fechaFin
      }
    },
    include: {
      cuenta: true
    }
  });
  
  const totalVentas = comprobantes.reduce(
    (sum, c) => sum + parseFloat(c.total_capturado), 
    0
  );
  
  const totalTransacciones = comprobantes.length;
  const ticketPromedio = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0;
  
  // Cuentas pendientes
  const cuentasPendientes = await prisma.cuenta.count({
    where: {
      estado: {
        in: ['Abierta', 'Lista']
      }
    }
  });
  
  res.json({
    success: true,
    data: {
      fecha: fecha || 'hoy',
      total_ventas: totalVentas.toFixed(2),
      total_transacciones: totalTransacciones,
      ticket_promedio: ticketPromedio.toFixed(2),
      cuentas_pendientes: cuentasPendientes
    }
  });
});

// POST /cashier/:orderId/print - Generar datos para impresión
export const generatePrintData = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  const cuenta = await prisma.cuenta.findUnique({
    where: { id_orden: parseInt(orderId) },
    include: {
      comandas: {
        include: {
          platillo: true
        }
      },
      usuario: {
        include: {
          empleado: true
        }
      },
      caja_comprobantes: true
    }
  });
  
  if (!cuenta) {
    throw new AppError('Cuenta no encontrada', 404);
  }
  
  const comprobante = cuenta.caja_comprobantes[0];
  
  // Formato para impresión térmica
  const printData = {
    restaurante: 'Chicoj Restaurant',
    fecha: new Date().toLocaleString('es-GT'),
    no_orden: cuenta.id_orden,
    mesa: cuenta.no_mesa,
    mesero: `${cuenta.usuario.empleado.nombre} ${cuenta.usuario.empleado.apellidos}`,
    items: cuenta.comandas.map(c => ({
      cantidad: c.cantidad,
      nombre: c.platillo_nombre,
      precio: parseFloat(c.precio_unitario),
      total: parseFloat(c.total_linea)
    })),
    subtotal: parseFloat(cuenta.total),
    total: parseFloat(cuenta.total),
    cliente: comprobante?.nombre_cliente || 'Consumidor Final',
    nit: comprobante?.nit || 'CF'
  };
  
  res.json({
    success: true,
    data: printData
  });
});