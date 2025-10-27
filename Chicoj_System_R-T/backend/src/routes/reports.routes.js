// src/routes/reports.routes.js
import express from 'express';
import { 
  getSalesReport,
  getTopDishes,
  getPeakHours,
  getSalesByArea,
  getDashboard,
  generateReportPDF
} from '../modules/reports/reports.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de reportes
router.get('/sales', getSalesReport);
router.get('/top-dishes', getTopDishes);
router.get('/peak-hours', getPeakHours);
router.get('/by-area', getSalesByArea);
router.get('/dashboard', getDashboard);
router.get('/pdf', generateReportPDF);

export default router;
