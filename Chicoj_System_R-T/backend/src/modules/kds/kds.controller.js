// src/modules/kds/kds.controller.js
import prisma from '../../config/database.js';
import { AppError, asyncHandler } from '../../middlewares/errorHandler.js';
import { createNotification } from '../notifications/notifications.controller.js';

// GET /kds - Obtener tickets pendientes por área
export const getKDSTickets = asyncHandler(async (req, res) => {
  const { area } = req.query;
  
  const where = {};
  
  // Filtrar por área si se especifica
  if (area) {
    where.area = { nombre: area };
  }
  
  const tickets = await prisma.area_registro.findMany({
    where,
    include: {
      area: true,
      cuenta: {
        include: {
          usuario: {
            include: {
              empleado: true
            }
          }
        }
      },
      comanda: {
        include: {
          platillo: true
        }
      }
    },
    orderBy: {
      fecha: 'asc' // Los más antiguos primero
    }
  });
  
  // Agrupar por área
  const ticketsPorArea = tickets.reduce((acc, ticket) => {
    const areaNombre = ticket.area.nombre;
    if (!acc[areaNombre]) {
      acc[areaNombre] = [];
    }
    acc[areaNombre].push({
      id_area_registro: ticket.id_area_registro,
      id_orden: ticket.id_orden,
      no_mesa: ticket.cuenta.no_mesa,
      mesero: `${ticket.cuenta.usuario.empleado.nombre} ${ticket.cuenta.usuario.empleado.apellidos}`,
      fecha: ticket.fecha, // Hora de llegada
      fecha_terminado: ticket.fecha_terminado, // Hora de terminado
      platillo: ticket.platillo,
      cantidad: ticket.cantidad,
      observaciones: ticket.observaciones,
      extra_observacion: ticket.extra_observacion,
      extra_precio: parseFloat(ticket.extra_precio)
    });
    return acc;
  }, {});
  
  res.json({
    success: true,
    data: {
      tickets: ticketsPorArea,
      total: tickets.length
    }
  });
});

// GET /kds/:area - Tickets de un área específica
export const getAreaTickets = asyncHandler(async (req, res) => {
  const { area } = req.params;
  
  console.log(`[CHECK] Buscando área: "${area}"`);
  
  // Buscar el área (case-insensitive)
  const areaData = await prisma.area.findFirst({
    where: { 
      nombre: {
        equals: area,
        mode: 'insensitive'
      }
    }
  });
  
  if (!areaData) {
    // Listar áreas disponibles para debugging
    const areasDisponibles = await prisma.area.findMany({ select: { nombre: true } });
    console.log('[ERROR] Área no encontrada. Áreas disponibles:', areasDisponibles.map(a => a.nombre));
    throw new AppError(`Área "${area}" no encontrada. Áreas disponibles: ${areasDisponibles.map(a => a.nombre).join(', ')}`, 404);
  }
  
  console.log(`[OK] Área encontrada: ${areaData.nombre} (ID: ${areaData.id_area})`);
  
  const tickets = await prisma.area_registro.findMany({
    where: {
      id_area: areaData.id_area,
      estado: 'Pendiente'  // Solo mostrar tickets pendientes
    },
    include: {
      cuenta: {
        include: {
          usuario: {
            include: {
              empleado: true
            }
          }
        }
      },
      comanda: true
    },
    orderBy: {
      fecha: 'asc'
    }
  });
  
  console.log(`[STATS] ${tickets.length} tickets encontrados para ${areaData.nombre}`);
  
  res.json({
    success: true,
    data: {
      area: areaData.nombre,
      tickets: tickets.map(t => ({
        id_area_registro: t.id_area_registro,
        id_orden: t.id_orden,
        id_comanda: t.id_comanda,
        no_mesa: t.cuenta.no_mesa,
        mesero: `${t.cuenta.usuario.empleado.nombre} ${t.cuenta.usuario.empleado.apellidos}`,
        fecha: t.fecha, // Hora de llegada al KDS
        fecha_terminado: t.fecha_terminado, // Hora de terminado
        platillo: { nombre: t.platillo },  // t.platillo es String, convertir a objeto para compatibilidad
        cantidad: t.cantidad,
        observaciones: t.observaciones,
        extra_observacion: t.extra_observacion,
        extra_precio: parseFloat(t.extra_precio),
        tiempo_transcurrido: Math.floor((new Date() - new Date(t.fecha)) / 60000) // minutos
      })),
      total: tickets.length
    }
  });
});

// PATCH /kds/:ticketId/complete - Marcar ticket como completado
export const completeTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  
  const ticket = await prisma.area_registro.findUnique({
    where: { id_area_registro: parseInt(ticketId) },
    include: {
      cuenta: true,
      area: true,
      comanda: true
    }
  });
  
  if (!ticket) {
    throw new AppError('Ticket no encontrado', 404);
  }
  
  // Marcar como Preparado en vez de eliminar
  await prisma.area_registro.update({
    where: { id_area_registro: parseInt(ticketId) },
    data: { 
      estado: 'Preparado',
      fecha_terminado: new Date() // Registrar hora de terminado
    }
  });
  
  console.log(`[OK] Ticket ${ticketId} marcado como Preparado`);
  
  // [NOTIF] CREAR NOTIFICACIÓN PARA EL MESERO
  try {
    await createNotification({
      id_usuario: ticket.cuenta.id_usuario,
      id_orden: ticket.id_orden,
      tipo: 'platillo_listo',
      titulo: `[OK] Platillo Listo - Mesa ${ticket.no_mesa || ticket.cuenta.no_mesa}`,
      mensaje: `${ticket.platillo} está listo para servir`,
      id_platillo: ticket.id_comanda,
      nombre_platillo: ticket.platillo,
      area_nombre: ticket.area?.nombre,
      no_mesa: ticket.no_mesa || ticket.cuenta.no_mesa
    });
    console.log(`[NOTIF] Notificación enviada al mesero (usuario ${ticket.cuenta.id_usuario})`);
  } catch (error) {
    console.error('[ERROR] Error al crear notificación:', error);
    // No interrumpir el flujo si falla la notificación
  }
  
  // Verificar si todos los items de la orden están preparados
  const ticketsPendientes = await prisma.area_registro.count({
    where: {
      id_orden: ticket.id_orden,
      estado: 'Pendiente'
    }
  });
  
  // Si no hay tickets pendientes, actualizar estado de la orden a "Preparada"
  if (ticketsPendientes === 0) {
    await prisma.cuenta.update({
      where: { id_orden: ticket.id_orden },
      data: { estado: 'Preparada' }
    });
    console.log(`[DATA] Orden ${ticket.id_orden} completamente preparada`);
    
    // [NOTIF] CREAR NOTIFICACIÓN DE ORDEN COMPLETA
    try {
      await createNotification({
        id_usuario: ticket.cuenta.id_usuario,
        id_orden: ticket.id_orden,
        tipo: 'orden_lista',
        titulo: `[SUCCESS] Orden Completa - Mesa ${ticket.no_mesa || ticket.cuenta.no_mesa}`,
        mensaje: `Todos los platillos de la orden #${String(ticket.id_orden).padStart(5, '0')} están listos`,
        no_mesa: ticket.no_mesa || ticket.cuenta.no_mesa
      });
      console.log(`[NOTIF] Notificación de orden completa enviada`);
    } catch (error) {
      console.error('[ERROR] Error al crear notificación de orden completa:', error);
    }
  }
  
  res.json({
    success: true,
    message: 'Ticket completado',
    data: {
      id_orden: ticket.id_orden,
      items_pendientes: ticketsPendientes,
      orden_lista: ticketsPendientes === 0
    }
  });
});

// POST /kds/:ticketId/send-to-cashier - Marcar como servido (enviar a caja)
export const sendToCashier = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  
  const ticket = await prisma.area_registro.findUnique({
    where: { id_area_registro: parseInt(ticketId) },
    include: {
      cuenta: {
        include: {
          comandas: true,
          area_registros: true
        }
      }
    }
  });
  
  if (!ticket) {
    throw new AppError('Ticket no encontrado', 404);
  }
  
  // Eliminar el ticket del KDS
  await prisma.area_registro.delete({
    where: { id_area_registro: parseInt(ticketId) }
  });
  
  // Verificar si todos los items de la orden están listos
  const ticketsRestantes = await prisma.area_registro.count({
    where: { id_orden: ticket.id_orden }
  });
  
  // Si no quedan tickets pendientes, la orden está lista
  let estadoOrden = 'Abierta';
  if (ticketsRestantes === 0) {
    estadoOrden = 'Lista'; // Podrías crear este estado en tu BD
    
    // Opcional: actualizar estado de cuenta
    // await prisma.cuenta.update({
    //   where: { id_orden: ticket.id_orden },
    //   data: { estado: 'Lista' }
    // });
  }
  
  res.json({
    success: true,
    message: 'Item enviado a caja',
    data: {
      id_orden: ticket.id_orden,
      items_pendientes: ticketsRestantes,
      orden_completa: ticketsRestantes === 0
    }
  });
});

// GET /kds/stats - Estadísticas del KDS
export const getKDSStats = asyncHandler(async (req, res) => {
  const { fecha } = req.query;
  
  const where = {};
  if (fecha) {
    const startDate = new Date(fecha);
    const endDate = new Date(fecha);
    endDate.setHours(23, 59, 59, 999);
    where.fecha = {
      gte: startDate,
      lte: endDate
    };
  }
  
  // Contar tickets por área
  const ticketsPorArea = await prisma.area_registro.groupBy({
    by: ['id_area'],
    _count: {
      id_area_registro: true
    },
    where
  });
  
  // Obtener nombres de áreas
  const areas = await prisma.area.findMany();
  
  const stats = ticketsPorArea.map(stat => {
    const area = areas.find(a => a.id_area === stat.id_area);
    return {
      area: area?.nombre || 'Desconocida',
      tickets_pendientes: stat._count.id_area_registro
    };
  });
  
  res.json({
    success: true,
    data: {
      fecha: fecha || 'hoy',
      stats,
      total_pendientes: ticketsPorArea.reduce((sum, s) => sum + s._count.id_area_registro, 0)
    }
  });
});