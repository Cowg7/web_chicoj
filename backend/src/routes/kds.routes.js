// src/routes/kds.routes.js
import express from 'express';
import { 
  getKDSTickets, 
  getAreaTickets, 
  completeTicket, 
  sendToCashier, 
  getKDSStats 
} from '../modules/kds/kds.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas del KDS
router.get('/', getKDSTickets);
router.get('/stats', getKDSStats);
router.get('/:area', getAreaTickets);
router.patch('/:ticketId/complete', completeTicket);
router.post('/:ticketId/send-to-cashier', sendToCashier);

export default router;
