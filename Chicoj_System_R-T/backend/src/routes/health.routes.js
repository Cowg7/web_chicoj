// routes/health.routes.js
// Endpoint de health check para monitoreo

import { Router } from 'express';
import database from '../config/database.js';

const router = Router();

/**
 * GET /health
 * Verificar estado general del sistema
 */
router.get('/health', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbHealth.status,
        connected: dbHealth.connected,
        reconnectAttempts: dbHealth.reconnectAttempts,
        keepAliveCount: database.keepAliveCount
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    };

    // Si la base de datos no está saludable, retornar 503
    if (dbHealth.status !== 'healthy') {
      health.status = 'unhealthy';
      return res.status(503).json(health);
    }

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /health/ping
 * Ping simple (no verifica base de datos)
 */
router.get('/health/ping', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /health/database
 * Health check específico de base de datos
 */
router.get('/health/database', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    
    if (dbHealth.status !== 'healthy') {
      return res.status(503).json(dbHealth);
    }

    res.json({
      ...dbHealth,
      keepAliveCount: database.keepAliveCount,
      isConnected: database.isConnected
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /health/detailed
 * Health check detallado con toda la información
 */
router.get('/health/detailed', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    
    const detailed = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid,
        uptime: process.uptime(),
        uptimeFormatted: formatUptime(process.uptime())
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000
      },
      database: {
        status: dbHealth.status,
        connected: dbHealth.connected,
        reconnectAttempts: dbHealth.reconnectAttempts,
        keepAliveCount: database.keepAliveCount,
        keepAliveActive: database.keepAliveCount > 0
      },
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        unit: 'MB'
      },
      cpu: {
        user: process.cpuUsage().user,
        system: process.cpuUsage().system
      }
    };

    // Si la base de datos no está saludable, cambiar status
    if (dbHealth.status !== 'healthy') {
      detailed.status = 'degraded';
    }

    res.json(detailed);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Formatear uptime a formato legible
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

export default router;

