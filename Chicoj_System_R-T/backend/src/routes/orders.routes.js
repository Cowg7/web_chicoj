// src/routes/orders.routes.js
import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrder, 
  sendToKDS, 
  updateOrder, 
  deleteOrderItem, 
  cancelOrder,
  getReadyOrders,
  closeOrder
} from '../modules/orders/orders.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de órdenes
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/ready', getReadyOrders); // Debe ir ANTES de /:id
router.get('/:id', getOrder);
router.post('/:id/send', sendToKDS);
router.post('/:id/close', closeOrder);
router.patch('/:id', updateOrder);
router.delete('/:id/items/:itemId', deleteOrderItem);
router.delete('/:id', cancelOrder);

export default router;
