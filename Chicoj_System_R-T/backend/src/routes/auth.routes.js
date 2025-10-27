// src/routes/auth.routes.js
import express from 'express';
import { login, register, getMe } from '../modules/auth/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/login', login);
router.post('/register', register);

// Rutas protegidas
router.get('/me', authenticateToken, getMe);

export default router;

