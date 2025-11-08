// config/database.js
// Configuración robusta de conexión a PostgreSQL con Prisma
// Actualizado para manejar desconexiones automáticas en producción

import { PrismaClient } from '@prisma/client';

// Agregar parámetros de conexión optimizados para producción
function buildDatabaseUrl() {
  let dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error('[DB ERROR] DATABASE_URL no está definida');
  }

  // Si la URL no tiene parámetros de conexión, agregarlos
  const hasParams = dbUrl.includes('?');
  const separator = hasParams ? '&' : '?';
  
  // Parámetros para mantener la conexión viva y evitar timeouts
  const connectionParams = [
    'connection_limit=10',           // Límite de conexiones en el pool
    'pool_timeout=30',               // Timeout del pool (30 segundos)
    'connect_timeout=30',            // Timeout de conexión (30 segundos)
    'socket_timeout=30',             // Timeout de socket (30 segundos)
    'pool_mode=transaction',         // Modo de pool optimizado
    'pgbouncer=true'                 // Compatibilidad con PgBouncer
  ].join('&');

  // Solo agregar parámetros si no están ya presentes
  if (!dbUrl.includes('connection_limit')) {
    dbUrl += separator + connectionParams;
  }

  return dbUrl;
}

// Configuración de connection pooling y retry logic
const prismaClientConfig = {
  datasources: {
    db: {
      url: buildDatabaseUrl(),
    },
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
};

// Singleton de Prisma con reconexión automática
let prismaInstance = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000; // 5 segundos

/**
 * Crear o retornar la instancia existente de Prisma
 */
function createPrismaClient() {
  if (prismaInstance) {
    return prismaInstance;
  }

  console.log('[DB] Creando nueva instancia de Prisma...');
  
  const client = new PrismaClient(prismaClientConfig);

  // Middleware para logging de queries lentas
  client.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    const queryTime = after - before;

    // Alertar si la query tarda más de 3 segundos
    if (queryTime > 3000) {
      console.warn(`[DB SLOW] ${params.model}.${params.action} tomó ${queryTime}ms`);
    }

    return result;
  });

  // Middleware para reconexión automática en caso de error
  client.$use(async (params, next) => {
    try {
      return await next(params);
    } catch (error) {
      // Si el error es de conexión, intentar reconectar
      if (isConnectionError(error)) {
        console.error('[DB ERROR] Error de conexión detectado:', error.message);
        await handleConnectionError();
        
        // Reintentar la operación
        try {
          return await next(params);
        } catch (retryError) {
          console.error('[DB ERROR] Reintento falló:', retryError.message);
          throw retryError;
        }
      }
      throw error;
    }
  });

  prismaInstance = client;
  return client;
}

/**
 * Verificar si un error es de conexión
 */
function isConnectionError(error) {
  const connectionErrorMessages = [
    'Connection terminated',
    'Connection closed',
    'Connection lost',
    'Connection refused',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'terminating connection',
    'does not exist',
    'server closed the connection',
    'Connection reset by peer'
  ];

  const errorMessage = error.message || '';
  return connectionErrorMessages.some(msg => 
    errorMessage.toLowerCase().includes(msg.toLowerCase())
  );
}

/**
 * Manejar errores de conexión
 */
async function handleConnectionError() {
  isConnected = false;
  reconnectAttempts++;

  if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
    console.error(`[DB FATAL] Máximo de intentos de reconexión alcanzado (${MAX_RECONNECT_ATTEMPTS})`);
    reconnectAttempts = 0;
    return;
  }

  console.log(`[DB RECONNECT] Intento ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`);
  
  // Desconectar la instancia actual
  if (prismaInstance) {
    try {
      await prismaInstance.$disconnect();
    } catch (err) {
      console.warn('[DB] Error al desconectar:', err.message);
    }
    prismaInstance = null;
  }

  // Esperar antes de reconectar
  await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY));

  // Crear nueva instancia
  prismaInstance = createPrismaClient();
  
  // Intentar conectar
  try {
    await prismaInstance.$connect();
    isConnected = true;
    reconnectAttempts = 0;
    console.log('[DB OK] Reconexión exitosa');
  } catch (error) {
    console.error('[DB ERROR] Reconexión falló:', error.message);
  }
}

/**
 * Conectar a la base de datos
 */
async function connect() {
  if (isConnected && prismaInstance) {
    return prismaInstance;
  }

  try {
    const client = createPrismaClient();
    await client.$connect();
    isConnected = true;
    reconnectAttempts = 0;
    console.log('[DB OK] Conectado a PostgreSQL exitosamente');
    return client;
  } catch (error) {
    console.error('[DB ERROR] Error al conectar:', error);
    await handleConnectionError();
    throw error;
  }
}

/**
 * Desconectar de la base de datos
 */
async function disconnect() {
  if (prismaInstance) {
    try {
      await prismaInstance.$disconnect();
      isConnected = false;
      prismaInstance = null;
      console.log('[DB] Desconectado de PostgreSQL');
    } catch (error) {
      console.error('[DB ERROR] Error al desconectar:', error);
    }
  }
}

/**
 * Verificar el estado de la conexión
 */
async function checkConnection() {
  if (!prismaInstance) {
    return false;
  }

  try {
    // Hacer una query simple para verificar la conexión
    await prismaInstance.$queryRaw`SELECT 1`;
    isConnected = true;
    reconnectAttempts = 0;
    return true;
  } catch (error) {
    console.error('[DB CHECK] Conexión perdida:', error.message);
    isConnected = false;
    await handleConnectionError();
    return false;
  }
}

/**
 * Obtener la instancia de Prisma (crear si no existe)
 */
function getPrisma() {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient();
  }
  return prismaInstance;
}

/**
 * Health check de la base de datos
 */
async function healthCheck() {
  try {
    const isHealthy = await checkConnection();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      connected: isConnected,
      reconnectAttempts,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Sistema de Keep-Alive mejorado para producción
// Verificar conexión cada 15 segundos (más frecuente para evitar desconexiones)
let keepAliveInterval = null;
let keepAliveQueryCount = 0;

function startKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }

  keepAliveInterval = setInterval(async () => {
    if (!isConnected || !prismaInstance) {
      console.log('[DB KEEPALIVE] No conectado, saltando ping...');
      return;
    }

    try {
      // Hacer una query ligera para mantener la conexión viva
      await prismaInstance.$queryRaw`SELECT 1 as ping`;
      keepAliveQueryCount++;
      
      // Log cada 20 pings (cada 5 minutos) para no saturar los logs
      if (keepAliveQueryCount % 20 === 0) {
        console.log(`[DB KEEPALIVE] Ping exitoso #${keepAliveQueryCount} - Conexión activa`);
      }
    } catch (error) {
      console.error('[DB KEEPALIVE] Error en ping:', error.message);
      console.warn('[DB] Conexión perdida detectada por keep-alive, intentando reconectar...');
      await handleConnectionError();
    }
  }, 15000); // 15 segundos

  console.log('[DB KEEPALIVE] Sistema de keep-alive iniciado (cada 15s)');
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('[DB KEEPALIVE] Sistema de keep-alive detenido');
  }
}

// Iniciar keep-alive automáticamente
startKeepAlive();

// Manejar señales de terminación
process.on('SIGINT', async () => {
  console.log('\n[DB] Recibida señal SIGINT, cerrando conexión...');
  stopKeepAlive();
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[DB] Recibida señal SIGTERM, cerrando conexión...');
  stopKeepAlive();
  await disconnect();
  process.exit(0);
});

// Manejar errores no capturados de la base de datos
process.on('unhandledRejection', (reason, promise) => {
  if (reason && typeof reason === 'object' && 'message' in reason) {
    const message = reason.message;
    if (isConnectionError({ message })) {
      console.error('[DB ERROR] Rechazo no manejado relacionado con la conexión:', message);
      handleConnectionError().catch(err => {
        console.error('[DB ERROR] Error al manejar rechazo:', err);
      });
    }
  }
});

export default {
  connect,
  disconnect,
  getPrisma,
  checkConnection,
  healthCheck,
  startKeepAlive,
  stopKeepAlive,
  get isConnected() {
    return isConnected;
  },
  get keepAliveCount() {
    return keepAliveQueryCount;
  }
};
