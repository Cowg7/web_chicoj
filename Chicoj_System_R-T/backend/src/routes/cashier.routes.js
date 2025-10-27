// src/routes/cashier.routes.js
import express from 'express';
import { 
  getPendingOrders,
  finalizeOrder,
  getOrdersHistory,
  getCashierStats
} from '../modules/cashier/cashier.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de caja
router.get('/pending', getPendingOrders);
router.get('/history', getOrdersHistory);
router.get('/stats', getCashierStats);
router.post('/:id/finalize', finalizeOrder);

export default router;
