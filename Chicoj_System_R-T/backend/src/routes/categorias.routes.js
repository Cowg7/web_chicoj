// src/routes/categorias.routes.js
import express from 'express';
import { 
  getCategorias, 
  getCategoria, 
  createCategoria, 
  updateCategoria, 
  deleteCategoria,
  toggleCategoria
} from '../modules/categorias/categorias.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas (para consultar categorías)
router.get('/', getCategorias);
router.get('/:id', getCategoria);

// Rutas protegidas (requieren autenticación)
router.post('/', authenticateToken, createCategoria);
router.patch('/:id', authenticateToken, updateCategoria);
router.patch('/:id/toggle', authenticateToken, toggleCategoria);
router.delete('/:id', authenticateToken, deleteCategoria);

export default router;

