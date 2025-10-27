// src/config/database.js
import { PrismaClient } from '@prisma/client';
import { config } from './index.js';

// Crear instancia única de Prisma (singleton)
const prisma = new PrismaClient({
  log: config.env === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

// Manejo de desconexión limpia
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Verificar conexión
export const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

export default prisma;