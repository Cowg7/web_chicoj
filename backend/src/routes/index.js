// src/routes/index.js
import express from 'express';
import authRoutes from './auth.routes.js';
import menuRoutes from './menu.routes.js';
import ordersRoutes from './orders.routes.js';
import kdsRoutes from './kds.routes.js';
import cashierRoutes from './cashier.routes.js';
import tourRoutes from './tour.routes.js';
import reportsRoutes from './reports.routes.js';
import employeesRoutes from './employees.routes.js';
import usersRoutes from './users.routes.js';
import notificationsRoutes from '../modules/notifications/notifications.routes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Chicoj Backend API'
  });
});

// Rutas de módulos
router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', ordersRoutes);
router.use('/kds', kdsRoutes);
router.use('/cashier', cashierRoutes);
router.use('/tour', tourRoutes);
router.use('/reports', reportsRoutes);
router.use('/employees', employeesRoutes);
router.use('/users', usersRoutes);
router.use('/notifications', notificationsRoutes);

export default router;