#!/bin/bash

# Script de diagnóstico para el error 500 en login
# Uso: ./scripts/diagnostico-login.sh

echo "=========================================="
echo "🔍 DIAGNÓSTICO DE ERROR 500 EN LOGIN"
echo "=========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar contenedores
echo "1️⃣ Verificando contenedores..."
docker-compose ps -a
echo ""

# 2. Ver logs recientes del backend
echo "2️⃣ Últimos 50 logs del backend (últimos errores):"
echo "----------------------------------------"
docker-compose logs --tail=50 backend | grep -E "(Error|error|❌|ERROR)" || echo "No se encontraron errores recientes"
echo ""

# 3. Ver logs completos del backend (últimos 100)
echo "3️⃣ Últimos 100 logs del backend:"
echo "----------------------------------------"
docker-compose logs --tail=100 backend
echo ""

# 4. Verificar variables de entorno del backend
echo "4️⃣ Verificando variables de entorno del backend:"
echo "----------------------------------------"
docker-compose exec -T backend printenv | grep -E "(JWT_SECRET|DATABASE_URL|NODE_ENV)" || echo "No se pudo acceder al contenedor"
echo ""

# 5. Verificar conexión a la base de datos
echo "5️⃣ Verificando conexión a la base de datos:"
echo "----------------------------------------"
docker-compose exec -T backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1\`
  .then(() => console.log('✅ Conexión a BD exitosa'))
  .catch(err => console.error('❌ Error de conexión:', err.message))
  .finally(() => prisma.\$disconnect());
" 2>&1 || echo "No se pudo verificar la conexión"
echo ""

# 6. Verificar si JWT_SECRET está configurado
echo "6️⃣ Verificando JWT_SECRET:"
echo "----------------------------------------"
JWT_SECRET=$(docker-compose exec -T backend printenv JWT_SECRET 2>/dev/null)
if [ -z "$JWT_SECRET" ]; then
  echo -e "${RED}❌ JWT_SECRET no está configurado${NC}"
else
  echo -e "${GREEN}✅ JWT_SECRET está configurado (${#JWT_SECRET} caracteres)${NC}"
fi
echo ""

# 7. Verificar health del backend
echo "7️⃣ Verificando health del backend:"
echo "----------------------------------------"
curl -s http://localhost:3000/api/health || echo "No se pudo acceder al endpoint de health"
echo ""

echo "=========================================="
echo "✅ Diagnóstico completado"
echo "=========================================="
echo ""
echo "💡 Para ver logs en tiempo real:"
echo "   docker-compose logs -f backend"
echo ""
echo "💡 Para reiniciar el backend:"
echo "   docker-compose restart backend"
echo ""

