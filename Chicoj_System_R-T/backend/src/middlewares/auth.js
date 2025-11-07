// src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import prisma from '../config/database.js';

// Verificar token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // "Bearer TOKEN"
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Acceso denegado. Token no proporcionado.' 
      });
    }
    
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Verificar que el usuario aún existe
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: decoded.userId },
      include: {
        empleado: true,
        rol: true
      }
    });
    
    if (!usuario) {
      return res.status(401).json({ 
        error: 'Usuario inválido o no encontrado.' 
      });
    }
    
    // Agregar usuario a la request con el formato que el frontend espera
    req.user = {
      userId: usuario.id_usuario,
      username: usuario.usuario_nombre,
      role: usuario.rol.nombre_rol,
      empleadoId: usuario.empleado.id_empleado,
      nombre: usuario.empleado.nombre,
      apellidos: usuario.empleado.apellidos
    };
    
    next();
  } catch (error) {
    console.error('[ERROR] Error en authenticateToken:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    return res.status(500).json({ 
      error: 'Error al verificar token.',
      details: error.message 
    });
  }
};

// Verificar roles específicos
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción.',
        required: allowedRoles,
        current: req.user.role
      });
    }
    
    next();
  };
};

// Middleware combinado: auth + role
export const authorize = (...roles) => {
  return [authenticateToken, requireRole(...roles)];
};

// Verificar que el usuario puede acceder a su propio recurso
export const requireOwnership = (userIdParam = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
    
    // Admin puede acceder a todo
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    // Otros solo a sus propios recursos
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({ 
        error: 'Solo puedes acceder a tus propios recursos.' 
      });
    }
    
    next();
  };
};