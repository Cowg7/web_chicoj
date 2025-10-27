// src/modules/orders/orders.controller.js
import prisma from '../../config/database.js';
import { AppError, asyncHandler } from '../../middlewares/errorHandler.js';

// POST /orders - Crear nueva orden
export const createOrder = asyncHandler(async (req, res) => {
  const { no_mesa, items } = req.body;
  const userId = req.user.userId;
  
  if (!items || items.length === 0) {
    throw new AppError('La orden debe tener al menos un item', 400);
  }
  
  // Validar que todos los platillos existen y obtener sus datos
  const platillosIds = items.map(item => item.id_platillo);
  const platillos = await prisma.platillos.findMany({
    where: { id_platillo: { in: platillosIds } }
  });
  
  if (platillos.length !== platillosIds.length) {
    throw new AppError('Uno o más platillos no existen', 404);
  }
  
  // Crear orden con comandas en transacción
  const orden = await prisma.$transaction(async (tx) => {
    // Crear cuenta con estado inicial "Pendiente"
    const nuevaCuenta = await tx.cuenta.create({
      data: {
        no_mesa: no_mesa || 'S/N',
        id_usuario: userId,
        estado: 'Pendiente'  // Estado inicial cuando el mesero crea la orden
      }
    });
    
    // Crear comandas
    const comandasData = items.map(item => {
      const platillo = platillos.find(p => p.id_platillo === item.id_platillo);
      return {
        id_orden: nuevaCuenta.id_orden,
        id_platillo: item.id_platillo,
        platillo_nombre: platillo.nombre,
        precio_unitario: platillo.precio,
        cantidad: item.cantidad,
        observaciones: item.observaciones || null,
        extra_observacion: item.extra_observacion || null,
        extra_precio: item.extra_precio || 0
      };
    });
    
    await tx.comanda.createMany({
      data: comandasData
    });
    
    // Obtener la cuenta completa con comandas
    const cuentaCompleta = await tx.cuenta.findUnique({
      where: { id_orden: nuevaCuenta.id_orden },
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
            empleado: true,
            rol: true
          }
        }
      }
    });
    
    return cuentaCompleta;
  });
  
  res.status(201).json({
    success: true,
    message: 'Orden creada exitosamente',
    data: { orden }
  });
});

// GET /orders - Listar órdenes con filtros
export const getOrders = asyncHandler(async (req, res) => {
  const { estado, fecha_desde, fecha_hasta, no_mesa, include_finalizadas } = req.query;
  
  const where = {};
  
  // Filtro por estado
  if (estado) {
    // Permitir múltiples estados separados por coma
    if (estado.includes(',')) {
      where.estado = { in: estado.split(',') };
    } else {
      where.estado = estado;
    }
  } else if (include_finalizadas !== 'true') {
    // Por defecto, excluir órdenes finalizadas
    where.estado = { not: 'Finalizado' };
  }
  
  if (fecha_desde || fecha_hasta) {
    where.fecha = {};
    if (fecha_desde) where.fecha.gte = new Date(fecha_desde);
    if (fecha_hasta) where.fecha.lte = new Date(fecha_hasta);
  }
  
  if (no_mesa) {
    where.no_mesa = no_mesa;
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
  
  res.json({
    success: true,
    data: {
      orders: ordenes,  // Cambiar 'ordenes' a 'orders' para consistencia
      total: ordenes.length
    }
  });
});

// GET /orders/:id - Obtener orden específica
export const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const orden = await prisma.cuenta.findUnique({
    where: { id_orden: parseInt(id) },
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
          empleado: true,
          rol: true
        }
      },
      area_registros: {
        include: {
          area: true
        }
      }
    }
  });
  
  if (!orden) {
    throw new AppError('Orden no encontrada', 404);
  }
  
  res.json({
    success: true,
    data: orden
  });
});

// POST /orders/:id/send - Enviar orden a KDS (área_registro)
export const sendToKDS = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Verificar que la orden existe
  const orden = await prisma.cuenta.findUnique({
    where: { id_orden: parseInt(id) },
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
    }
  });
  
  if (!orden) {
    throw new AppError('Orden no encontrada', 404);
  }
  
  if (orden.estado !== 'Pendiente' && orden.estado !== 'Abierta') {
    throw new AppError('Solo se pueden enviar órdenes pendientes', 400);
  }
  
  // Cambiar estado de la orden a "En Preparación"
  await prisma.cuenta.update({
    where: { id_orden: parseInt(id) },
    data: { estado: 'En Preparación' }
  });
  
  // Crear registros en area_registro para cada comanda
  console.log('📝 Creando registros en KDS...');
  const areaRegistros = [];
  
  for (const comanda of orden.comandas) {
    areaRegistros.push({
      id_area: comanda.platillo.id_area,
      id_comanda: comanda.id_comanda,
      id_orden: orden.id_orden,
      no_mesa: orden.no_mesa,  // 👈 Agregar número de mesa
      platillo: comanda.platillo_nombre,  // Nombre del platillo, no ID
      cantidad: comanda.cantidad,
      observaciones: comanda.observaciones,
      extra_observacion: comanda.extra_observacion,
      extra_precio: comanda.extra_precio,
      fecha: new Date(),
      estado: 'Pendiente'  // 👈 Agregar estado inicial
    });
  }
  
  await prisma.area_registro.createMany({
    data: areaRegistros
  });
  
  console.log(`✅ ${areaRegistros.length} items enviados a KDS`);
  
  const areasNotificadas = [...new Set(orden.comandas.map(c => c.platillo.area.nombre))];
  console.log('📢 Áreas notificadas:', areasNotificadas);
  
  res.json({
    success: true,
    message: 'Orden enviada a cocina/bar',
    data: {
      id_orden: orden.id_orden,
      no_mesa: orden.no_mesa,
      estado: 'En Preparación',
      items_enviados: areaRegistros.length,
      areas_notificadas: areasNotificadas
    }
  });
});

// PATCH /orders/:id - Actualizar orden (agregar items o cambiar estado)
export const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { items, estado, replaceAllItems } = req.body;
  
  console.log(`📝 Actualizando orden ${id}:`, { items: items?.length || 0, estado, replaceAllItems });
  
  const orden = await prisma.cuenta.findUnique({
    where: { id_orden: parseInt(id) }
  });
  
  if (!orden) {
    throw new AppError('Orden no encontrada', 404);
  }
  
  if (orden.estado === 'Cerrada') {
    throw new AppError('No se puede modificar una orden cerrada', 400);
  }
  
  // Si replaceAllItems = true, eliminar todos los items existentes primero
  if (replaceAllItems && items && items.length > 0) {
    console.log('🗑️ Eliminando comandas existentes antes de reemplazar...');
    
    // ⚠️ IMPORTANTE: NO eliminar area_registro si la orden ya fue enviada a cocina
    // Solo eliminar las comandas (los items de la orden)
    
    if (orden.estado === 'Pendiente') {
      // Si la orden NO ha sido enviada a cocina, podemos eliminar todo
      await prisma.area_registro.deleteMany({
        where: { id_orden: parseInt(id) }
      });
      console.log('✅ Registros de KDS eliminados (orden pendiente)');
    } else {
      // Si ya fue enviada a cocina, NO tocar los area_registro
      // Los tickets del KDS deben mantenerse hasta que cocina los termine
      console.log('⚠️ Orden ya enviada a cocina - manteniendo tickets en KDS');
    }
    
    // Eliminar comandas
    await prisma.comanda.deleteMany({
      where: { id_orden: parseInt(id) }
    });
    console.log('✅ Comandas existentes eliminadas');
  }
  
  // Agregar items si se proporcionan
  if (items && items.length > 0) {
    const platillosIds = items.map(item => item.id_platillo);
    const platillos = await prisma.platillos.findMany({
      where: { id_platillo: { in: platillosIds } }
    });
    
    const comandasData = items.map(item => {
      const platillo = platillos.find(p => p.id_platillo === item.id_platillo);
      return {
        id_orden: parseInt(id),
        id_platillo: item.id_platillo,
        platillo_nombre: platillo.nombre,
        precio_unitario: platillo.precio,
        cantidad: item.cantidad,
        observaciones: item.observaciones || null,
        extra_observacion: item.extra_observacion || null,
        extra_precio: item.extra_precio || 0
      };
    });
    
    const nuevasComandas = await prisma.comanda.createMany({
      data: comandasData
    });
    
    console.log(`✅ ${comandasData.length} items ${replaceAllItems ? 'reemplazados' : 'agregados'}`);
    
    // Si la orden ya fue enviada a cocina, enviar los nuevos items al KDS automáticamente
    if (orden.estado === 'En Preparación' || orden.estado === 'Preparada') {
      console.log('🍳 Orden ya en cocina - enviando nuevos items al KDS...');
      
      // Obtener las comandas recién creadas con sus platillos y áreas
      const comandasConPlatillos = await prisma.comanda.findMany({
        where: {
          id_orden: parseInt(id)
        },
        include: {
          platillo: {
            include: {
              area: true
            }
          }
        }
      });
      
      // Obtener IDs de area_registro existentes para no duplicar
      const areaRegistrosExistentes = await prisma.area_registro.findMany({
        where: { id_orden: parseInt(id) },
        select: { id_comanda: true }
      });
      const idsExistentes = new Set(areaRegistrosExistentes.map(ar => ar.id_comanda));
      
      // Crear registros de KDS solo para comandas nuevas (que no tienen area_registro)
      const nuevosRegistrosKDS = [];
      for (const comanda of comandasConPlatillos) {
        if (!idsExistentes.has(comanda.id_comanda)) {
          nuevosRegistrosKDS.push({
            id_area: comanda.platillo.id_area,
            id_comanda: comanda.id_comanda,
            id_orden: parseInt(id),
            no_mesa: orden.no_mesa,  // 👈 Agregar número de mesa
            platillo: comanda.platillo_nombre,
            cantidad: comanda.cantidad,
            observaciones: comanda.observaciones,
            extra_observacion: comanda.extra_observacion,
            extra_precio: comanda.extra_precio,
            fecha: new Date(),
            estado: 'Pendiente'
          });
        }
      }
      
      if (nuevosRegistrosKDS.length > 0) {
        await prisma.area_registro.createMany({
          data: nuevosRegistrosKDS
        });
        console.log(`✅ ${nuevosRegistrosKDS.length} nuevos items enviados al KDS automáticamente`);
      } else {
        console.log('ℹ️ No hay items nuevos para enviar al KDS');
      }
    }
  }
  
  // Actualizar estado si se proporciona
  let ordenActualizada = orden;
  if (estado) {
    ordenActualizada = await prisma.cuenta.update({
      where: { id_orden: parseInt(id) },
      data: { estado }
    });
  }
  
  // Obtener orden actualizada completa
  const ordenCompleta = await prisma.cuenta.findUnique({
    where: { id_orden: parseInt(id) },
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
    }
  });
  
  res.json({
    success: true,
    message: 'Orden actualizada',
    data: { orden: ordenCompleta }
  });
});

// DELETE /orders/:id/items/:itemId - Eliminar item de la orden
export const deleteOrderItem = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;
  
  const comanda = await prisma.comanda.findUnique({
    where: { id_comanda: parseInt(itemId) },
    include: {
      cuenta: true
    }
  });
  
  if (!comanda) {
    throw new AppError('Item no encontrado', 404);
  }
  
  if (comanda.id_orden !== parseInt(id)) {
    throw new AppError('El item no pertenece a esta orden', 400);
  }
  
  if (comanda.cuenta.estado === 'Cerrada') {
    throw new AppError('No se pueden eliminar items de una orden cerrada', 400);
  }
  
  await prisma.comanda.delete({
    where: { id_comanda: parseInt(itemId) }
  });
  
  res.json({
    success: true,
    message: 'Item eliminado de la orden'
  });
});

// DELETE /orders/:id - Cancelar orden completa
export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
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
  
  // No permitir eliminar órdenes ya en caja o finalizadas
  if (orden.estado === 'En Caja' || orden.estado === 'Finalizada') {
    throw new AppError('No se puede eliminar una orden que ya está en caja o finalizada', 400);
  }
  
  console.log(`🗑️ Eliminando orden ${id} completamente...`);
  
  // Eliminar en cascada: primero tickets KDS, luego comandas, luego la orden
  if (orden.area_registros && orden.area_registros.length > 0) {
    await prisma.area_registro.deleteMany({
      where: { id_orden: parseInt(id) }
    });
    console.log(`✅ ${orden.area_registros.length} tickets de KDS eliminados`);
  }
  
  if (orden.comandas && orden.comandas.length > 0) {
    await prisma.comanda.deleteMany({
      where: { id_orden: parseInt(id) }
    });
    console.log(`✅ ${orden.comandas.length} comandas eliminadas`);
  }
  
  // Eliminar la orden principal
  await prisma.cuenta.delete({
    where: { id_orden: parseInt(id) }
  });
  
  console.log(`✅ Orden ${id} eliminada completamente`);
  
  res.json({
    success: true,
    message: 'Orden eliminada completamente'
  });
});

// GET /orders/ready - Obtener órdenes listas para cerrar (todas preparadas)
export const getReadyOrders = asyncHandler(async (req, res) => {
  const { mesero_id } = req.query;
  
  const where = {
    estado: 'Preparada'  // Todas las áreas terminaron
  };
  
  // Si se especifica mesero, filtrar por él
  if (mesero_id) {
    where.id_usuario = parseInt(mesero_id);
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
      fecha: 'asc'
    }
  });
  
  console.log(`📋 ${ordenes.length} órdenes listas para cerrar`);
  
  res.json({
    success: true,
    data: { orders: ordenes, total: ordenes.length }
  });
});

// POST /orders/:id/close - Cerrar orden y enviar a caja
export const closeOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
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
  
  if (orden.estado !== 'Preparada') {
    throw new AppError('La orden no está lista para cerrar. Todos los platillos deben estar preparados.', 400);
  }
  
  // Calcular total de la orden
  const total = orden.comandas.reduce((sum, comanda) => {
    const subtotal = parseFloat(comanda.precio_unitario) * comanda.cantidad;
    const extra = parseFloat(comanda.extra_precio || 0);
    return sum + subtotal + extra;
  }, 0);
  
  // Actualizar orden a "En Caja"
  const ordenActualizada = await prisma.cuenta.update({
    where: { id_orden: parseInt(id) },
    data: {
      estado: 'En Caja',
      total
    }
  });
  
  console.log(`💰 Orden ${id} cerrada y enviada a caja. Total: Q${total}`);
  
  res.json({
    success: true,
    message: 'Orden cerrada y enviada a caja',
    data: { orden: ordenActualizada }
  });
});