// src/middlewares/errorHandler.js
import { config } from '../config/index.js';

// Clase de error personalizado
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

// Manejador global de errores
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  
  // Log del error
  console.error('❌ Error:', {
    message: error.message,
    statusCode: error.statusCode,
    stack: config.env === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    originalError: err.message,
    errorName: err.name,
    errorCode: err.code,
  });
  
  // Errores de Prisma
  if (err.code === 'P2002') {
    error.message = 'Ya existe un registro con esos datos.';
    error.statusCode = 409;
  }
  if (err.code === 'P2025') {
    error.message = 'Registro no encontrado.';
    error.statusCode = 404;
  }
  if (err.code === 'P2003') {
    error.message = 'Referencia inválida. Verifica los datos relacionados.';
    error.statusCode = 400;
  }
  
  // Errores de validación
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    error.message = 'Datos de entrada inválidos.';
    error.statusCode = 400;
    error.details = err.errors || err.issues;
  }
  
  // Respuesta
  const response = {
    error: error.message || 'Error interno del servidor',
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
  };
  
  // Incluir detalles en desarrollo
  if (config.env === 'development') {
    response.stack = err.stack;
    response.details = error.details;
  }
  
  res.status(error.statusCode).json(response);
};

// Middleware para rutas no encontradas
export const notFound = (req, res, next) => {
  const error = new AppError(
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};

// Wrapper para async/await en rutas
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};