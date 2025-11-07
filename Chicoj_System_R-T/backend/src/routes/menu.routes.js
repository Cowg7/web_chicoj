// src/routes/menu.routes.js
import express from 'express';
import { 
  getMenu, 
  getPlatillo, 
  createPlatillo, 
  updatePlatillo, 
  deletePlatillo, 
  getAreas,
  toggleDisponibilidad
} from '../modules/menu/menu.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', getMenu);
router.get('/areas', getAreas);
router.get('/:id', getPlatillo);

// Rutas protegidas (requieren autenticación)
router.post('/', authenticateToken, createPlatillo);
router.patch('/:id', authenticateToken, updatePlatillo);
router.patch('/:id/disponibilidad', authenticateToken, toggleDisponibilidad);
router.delete('/:id', authenticateToken, deletePlatillo);

export default router;
