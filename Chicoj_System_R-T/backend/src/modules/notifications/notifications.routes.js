// src/modules/notifications/notifications.routes.js
import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.js';
import {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationCount
} from './notifications.controller.js';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/notifications - Obtener todas las notificaciones del usuario
router.get('/', getNotifications);

// GET /api/notifications/unread - Obtener notificaciones no leídas
router.get('/unread', getUnreadNotifications);

// GET /api/notifications/count - Obtener conteo de notificaciones
router.get('/count', getNotificationCount);

// PATCH /api/notifications/:id/read - Marcar como leída
router.patch('/:id/read', markAsRead);

// POST /api/notifications/read-all - Marcar todas como leídas
router.post('/read-all', markAllAsRead);

// DELETE /api/notifications/:id - Eliminar notificación
router.delete('/:id', deleteNotification);

export default router;

