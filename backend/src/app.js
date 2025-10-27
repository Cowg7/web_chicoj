// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const app = express();

// ============ SEGURIDAD ============
// Configuración de Helmet más permisiva para desarrollo
app.use(helmet({
  contentSecurityPolicy: config.env === 'production' ? undefined : false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configurado para desarrollo (más permisivo)
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    // En desarrollo, permitir cualquier localhost o red local
    if (config.env === 'development' || config.env !== 'production') {
      // Permitir localhost, 127.0.0.1 y cualquier IP de red local (192.168.x.x)
      if (origin.includes('localhost') || 
          origin.includes('127.0.0.1') || 
          origin.match(/^http:\/\/172\.20\.\d+\.\d+:\d+$/)) {
        console.log('✅ Origin permitido (desarrollo):', origin);
        return callback(null, true);
      }
    }
    
    // Verificar si el origin está en la lista permitida
    if (config.cors.origins.indexOf(origin) !== -1) {
      console.log('✅ Origin permitido (lista):', origin);
      callback(null, true);
    } else {
      console.log('❌ Origin no permitido:', origin);
      console.log('   Origins permitidos:', config.cors.origins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cachear preflight por 10 minutos
}));

// Rate limiters diferenciados por tipo de operación
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.global.windowMs,
  max: config.rateLimit.global.max,
  message: 'Demasiadas peticiones, intenta de nuevo en un momento',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limit para operaciones críticas (tienen su propio limiter)
    return req.path.startsWith('/api/auth') || 
           req.path.startsWith('/api/orders') ||
           req.path.startsWith('/api/cashier') ||
           req.path.startsWith('/api/kds');
  }
});

const criticalLimiter = rateLimit({
  windowMs: config.rateLimit.critical.windowMs,
  max: config.rateLimit.critical.max,
  message: 'Demasiadas operaciones críticas, espera un momento',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  message: 'Demasiados intentos de autenticación, intenta en 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
});

const queryLimiter = rateLimit({
  windowMs: config.rateLimit.query.windowMs,
  max: config.rateLimit.query.max,
  message: 'Demasiadas consultas, intenta de nuevo en un momento',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== 'GET' // Solo aplicar a queries GET
});

// Aplicar limiters
app.use('/api', globalLimiter); // Límite global suave
app.use('/api/auth', authLimiter); // Límite estricto para autenticación
app.use('/api/orders', criticalLimiter); // Límite moderado para órdenes
app.use('/api/cashier', criticalLimiter); // Límite moderado para caja
app.use('/api/kds', queryLimiter); // Límite permisivo para KDS (muchas queries)

// ============ PARSERS ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ LOGGING (desarrollo) ============
if (config.env === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  });
}

// ============ RUTAS ============
app.get('/', (req, res) => {
  res.json({
    message: 'Chicoj Restaurant API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      menu: '/api/menu',
      orders: '/api/orders',
      kds: '/api/kds',
      cashier: '/api/cashier',
      tour: '/api/tour',
      reports: '/api/reports'
    }
  });
});

app.use('/api', routes);

// ============ MANEJO DE ERRORES ============
app.use(notFound);
app.use(errorHandler);

export default app;