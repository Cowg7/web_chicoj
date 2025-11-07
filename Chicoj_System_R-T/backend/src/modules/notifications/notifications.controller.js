// src/modules/notifications/notifications.controller.js
import prisma from '../../config/database.js';
import { AppError, asyncHandler } from '../../middlewares/errorHandler.js';

// GET /notifications - Obtener notificaciones del usuario actual
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?.id_usuario;
  
  if (!userId) {
    throw new AppError('Usuario no autenticado', 401);
  }

  const { leidas, limite = 50 } = req.query;
  
  const where = { id_usuario: userId };
  
  // Filtrar por estado de lectura si se especifica
  if (leidas !== undefined) {
    where.leida = leidas === 'true';
  }
  
  const notificaciones = await prisma.notificacion.findMany({
    where,
    orderBy: {
      fecha_creacion: 'desc'
    },
    take: parseInt(limite),
    include: {
      cuenta: {
        select: {
          no_mesa: true,
          estado: true
        }
      }
    }
  });
  
  // Contar no leídas
  const noLeidas = await prisma.notificacion.count({
    where: {
      id_usuario: userId,
      leida: false
    }
  });
  
  res.json({
    success: true,
    data: {
      notificaciones,
      total: notificaciones.length,
      no_leidas: noLeidas
    }
  });
});

// GET /notifications/unread - Obtener solo notificaciones no leídas
export const getUnreadNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?.id_usuario;
  
  if (!userId) {
    throw new AppError('Usuario no autenticado', 401);
  }
  
  const notificaciones = await prisma.notificacion.findMany({
    where: {
      id_usuario: userId,
      leida: false
    },
    orderBy: {
      fecha_creacion: 'desc'
    },
    include: {
      cuenta: {
        select: {
          no_mesa: true,
          estado: true
        }
      }
    }
  });
  
  res.json({
    success: true,
    data: {
      notificaciones,
      total: notificaciones.length
    }
  });
});

// PATCH /notifications/:id/read - Marcar notificación como leída
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId || req.user?.id_usuario;
  
  if (!userId) {
    throw new AppError('Usuario no autenticado', 401);
  }
  
  // Verificar que la notificación pertenece al usuario
  const notificacion = await prisma.notificacion.findUnique({
    where: { id_notificacion: parseInt(id) }
  });
  
  if (!notificacion) {
    throw new AppError('Notificación no encontrada', 404);
  }
  
  if (notificacion.id_usuario !== userId) {
    throw new AppError('No tienes permiso para modificar esta notificación', 403);
  }
  
  // Marcar como leída
  const updated = await prisma.notificacion.update({
    where: { id_notificacion: parseInt(id) },
    data: {
      leida: true,
      fecha_leida: new Date()
    }
  });
  
  res.json({
    success: true,
    message: 'Notificación marcada como leída',
    data: updated
  });
});

// POST /notifications/read-all - Marcar todas como leídas
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?.id_usuario;
  
  if (!userId) {
    throw new AppError('Usuario no autenticado', 401);
  }
  
  const result = await prisma.notificacion.updateMany({
    where: {
      id_usuario: userId,
      leida: false
    },
    data: {
      leida: true,
      fecha_leida: new Date()
    }
  });
  
  res.json({
    success: true,
    message: `${result.count} notificaciones marcadas como leídas`,
    data: {
      actualizadas: result.count
    }
  });
});

// DELETE /notifications/:id - Eliminar notificación
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId || req.user?.id_usuario;
  
  if (!userId) {
    throw new AppError('Usuario no autenticado', 401);
  }
  
  // Verificar que la notificación pertenece al usuario
  const notificacion = await prisma.notificacion.findUnique({
    where: { id_notificacion: parseInt(id) }
  });
  
  if (!notificacion) {
    throw new AppError('Notificación no encontrada', 404);
  }
  
  if (notificacion.id_usuario !== userId) {
    throw new AppError('No tienes permiso para eliminar esta notificación', 403);
  }
  
  await prisma.notificacion.delete({
    where: { id_notificacion: parseInt(id) }
  });
  
  res.json({
    success: true,
    message: 'Notificación eliminada'
  });
});

// GET /notifications/count - Obtener conteo de notificaciones
export const getNotificationCount = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?.id_usuario;
  
  if (!userId) {
    throw new AppError('Usuario no autenticado', 401);
  }
  
  const [total, noLeidas, leidas] = await Promise.all([
    prisma.notificacion.count({
      where: { id_usuario: userId }
    }),
    prisma.notificacion.count({
      where: { id_usuario: userId, leida: false }
    }),
    prisma.notificacion.count({
      where: { id_usuario: userId, leida: true }
    })
  ]);
  
  res.json({
    success: true,
    data: {
      total,
      no_leidas: noLeidas,
      leidas
    }
  });
});

// ===== FUNCIÓN AUXILIAR PARA CREAR NOTIFICACIÓN =====
// Usada por otros módulos (KDS, orders, etc.)
export const createNotification = async ({
  id_usuario,
  id_orden,
  tipo = 'platillo_listo',
  titulo,
  mensaje,
  id_platillo = null,
  nombre_platillo = null,
  area_nombre = null,
  no_mesa = null
}) => {
  try {
    const notificacion = await prisma.notificacion.create({
      data: {
        id_usuario,
        id_orden,
        tipo,
        titulo,
        mensaje,
        id_platillo,
        nombre_platillo,
        area_nombre,
        no_mesa
      }
    });
    
    console.log(`[NOTIF] Notificación creada: "${titulo}" para usuario ${id_usuario}`);
    return notificacion;
  } catch (error) {
    console.error('[ERROR] Error al crear notificación:', error);
    throw error;
  }
};

