// src/config/index.js
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Database
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Security
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
  },
  
  // CORS
  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:8080',
      'http://localhost:5173',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:5173',
      'http://192.168.0.2:8080',  // IP local para acceso desde otros dispositivos
      'http://192.168.0.2:3000'   // Backend IP local
    ],
    credentials: true,
  },
  
  // WebSocket
  socket: {
    port: parseInt(process.env.SOCKET_PORT || process.env.PORT || '3000'),
    path: '/socket.io',
  },
  
  // Rate limiting - Configuración para producción con múltiples usuarios
  rateLimit: {
    // Límite global: 1000 peticiones en 1 minuto (suficiente para 10+ usuarios)
    global: {
      windowMs: 1 * 60 * 1000, // 1 minuto
      max: 1000, // 1000 requests por minuto
    },
    
    // Límite para operaciones críticas (crear orden, enviar a cocina, cobrar)
    critical: {
      windowMs: 1 * 60 * 1000, // 1 minuto
      max: 500, // 500 requests por minuto (suficiente para operaciones intensivas)
    },
    
    // Límite para autenticación (evitar brute force)
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 50, // 50 intentos de login en 15 minutos
    },
    
    // Límite para consultas (GET)
    query: {
      windowMs: 1 * 60 * 1000, // 1 minuto
      max: 2000, // 2000 queries por minuto (para auto-refresh de múltiples vistas)
    },
  },
  
  // Uploads
  uploads: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    dir: process.env.UPLOAD_DIR || './uploads',
  },
};

// Validar configuración crítica
const validateConfig = () => {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0 && config.env === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

validateConfig();