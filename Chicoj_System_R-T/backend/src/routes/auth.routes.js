// src/routes/auth.routes.js
import express from 'express';
import { 
  login, 
  register, 
  getMe, 
  solicitarRecuperacion, 
  restablecerPassword 
} from '../modules/auth/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/login', login);
router.post('/register', register);
router.post('/solicitar-recuperacion', solicitarRecuperacion);
router.post('/restablecer-password', restablecerPassword);

// Rutas protegidas
router.get('/me', authenticateToken, getMe);

export default router;

