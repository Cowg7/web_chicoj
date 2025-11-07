// src/server.js
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { config } from './config/index.js';
import { checkDatabaseConnection } from './config/database.js';

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar Socket.io para WebSockets
const io = new Server(server, {
  cors: {
    origin: config.cors.origins,
    credentials: true
  },
  path: config.socket.path
});

// ============ WEBSOCKET HANDLERS ============
io.on('connection', (socket) => {
  console.log(`[SOCKET] Cliente conectado: ${socket.id}`);
  
  // Unirse a salas específicas (por área de KDS)
  socket.on('join-area', (area) => {
    socket.join(`kds-${area}`);
    console.log(`Cliente ${socket.id} se unió a kds-${area}`);
  });
  
  // Unirse a sala de caja
  socket.on('join-cashier', () => {
    socket.join('cashier');
    console.log(`Cliente ${socket.id} se unió a cashier`);
  });
  
  // Desconexión
  socket.on('disconnect', () => {
    console.log(`[SOCKET] Cliente desconectado: ${socket.id}`);
  });
});

// Hacer io accesible globalmente para emitir eventos desde controladores
app.set('io', io);
global.io = io;

// ============ FUNCIONES DE NOTIFICACIÓN ============
export const notifyKDS = (area, data) => {
  io.to(`kds-${area}`).emit('new-order', data);
};

export const notifyCashier = (data) => {
  io.to('cashier').emit('order-ready', data);
};

export const notifyOrderUpdate = (orderId, data) => {
  io.emit('order-updated', { orderId, ...data });
};

// ============ INICIAR SERVIDOR ============
const startServer = async () => {
  try {
    // Verificar conexión a base de datos
    const dbConnected = await checkDatabaseConnection();
    
    if (!dbConnected) {
      console.error('[ERROR] No se pudo conectar a la base de datos');
      process.exit(1);
    }
    
    // Iniciar servidor
    server.listen(config.port, () => {
      console.log('\n[START] ========================================');
      console.log(`   Servidor iniciado exitosamente`);
      console.log(`   Ambiente: ${config.env}`);
      console.log(`   Puerto: ${config.port}`);
      console.log(`   API: http://localhost:${config.port}/api`);
      console.log(`   WebSocket: ws://localhost:${config.port}`);
      console.log('========================================\n');
    });
    
  } catch (error) {
    console.error('[ERROR] Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  console.error('[ERROR] Uncaught Exception:', error);
  server.close(() => process.exit(1));
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('[OK] Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('[OK] Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Iniciar
startServer();