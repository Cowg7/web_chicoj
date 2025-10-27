// src/routes/tour.routes.js
import express from 'express';
import { 
  createTour, 
  getTours, 
  getTour, 
  updateTour, 
  deleteTour, 
  getTourStats 
} from '../modules/tour/tour.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', getTours);
router.get('/stats', getTourStats);
router.get('/:id', getTour);

// Rutas protegidas
router.post('/', authenticateToken, createTour);
router.patch('/:id', authenticateToken, updateTour);
router.delete('/:id', authenticateToken, deleteTour);

export default router;
