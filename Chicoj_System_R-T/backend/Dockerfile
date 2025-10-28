# Backend Dockerfile
FROM node:20-alpine AS base

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    wget

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias de producción
FROM base AS dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Instalar todas las dependencias (incluyendo devDependencies para el build)
FROM base AS build-dependencies
RUN npm ci

# Generar Prisma Client
FROM build-dependencies AS build
COPY . .
RUN npx prisma generate

# Imagen final de producción
FROM node:20-alpine AS production

# Instalar wget para healthcheck
RUN apk add --no-cache wget openssl

WORKDIR /app

# Copiar node_modules de producción
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar Prisma client generado
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Copiar código fuente
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Script de inicio que ejecuta migraciones y luego inicia el servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]


