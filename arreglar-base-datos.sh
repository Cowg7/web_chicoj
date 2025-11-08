#!/bin/bash
# Script para aplicar las correcciones a PostgreSQL

echo "============================================"
echo "ARREGLANDO PROBLEMAS DE POSTGRESQL"
echo "============================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Detener los contenedores
echo -e "${YELLOW}1. Deteniendo contenedores...${NC}"
docker compose down
echo -e "${GREEN}✓ Contenedores detenidos${NC}"
echo ""

# 2. Verificar archivos de configuración
echo -e "${YELLOW}2. Verificando archivos de configuración...${NC}"
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓ docker-compose.yml existe${NC}"
else
    echo -e "${RED}✗ docker-compose.yml NO encontrado${NC}"
    exit 1
fi

if [ -d "postgres-config" ]; then
    echo -e "${GREEN}✓ Directorio postgres-config existe${NC}"
else
    echo -e "${YELLOW}! Creando directorio postgres-config${NC}"
    mkdir -p postgres-config
fi

if [ -f "postgres-config/01-configuracion-produccion.sql" ]; then
    echo -e "${GREEN}✓ Configuración de PostgreSQL existe${NC}"
else
    echo -e "${RED}✗ Archivo de configuración NO encontrado${NC}"
    echo "Asegúrate de haber creado el archivo postgres-config/01-configuracion-produccion.sql"
    exit 1
fi
echo ""

# 3. Limpiar volumen de PostgreSQL (OPCIONAL - COMENTADO POR SEGURIDAD)
# DESCOMENTAR SOLO SI QUIERES EMPEZAR DE CERO (BORRARÁ TODOS LOS DATOS)
# echo -e "${RED}⚠ ADVERTENCIA: Limpiando volumen de PostgreSQL (BORRARÁ DATOS)${NC}"
# docker volume rm chicoj_postgres_data 2>/dev/null || true
# echo ""

# 4. Levantar los contenedores con la nueva configuración
echo -e "${YELLOW}3. Levantando contenedores con nueva configuración...${NC}"
docker compose up -d postgres
echo -e "${GREEN}✓ PostgreSQL iniciado${NC}"
echo ""

# 5. Esperar a que PostgreSQL esté listo
echo -e "${YELLOW}4. Esperando a que PostgreSQL esté listo...${NC}"
sleep 10
for i in {1..30}; do
    if docker exec chicoj-postgres pg_isready -U postgres -d restaurante_db > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL está listo${NC}"
        break
    fi
    echo "Esperando... ($i/30)"
    sleep 2
done
echo ""

# 6. Verificar que la base de datos existe
echo -e "${YELLOW}5. Verificando base de datos...${NC}"
if docker exec chicoj-postgres psql -U postgres -c "\l" | grep -q restaurante_db; then
    echo -e "${GREEN}✓ Base de datos 'restaurante_db' existe${NC}"
else
    echo -e "${RED}✗ Base de datos NO existe, ejecutando migraciones...${NC}"
    docker compose up -d backend
    sleep 20
fi
echo ""

# 7. Verificar configuración aplicada
echo -e "${YELLOW}6. Verificando configuración de PostgreSQL...${NC}"
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "
SELECT name, setting 
FROM pg_settings 
WHERE name IN ('statement_timeout', 'tcp_keepalives_idle');" 2>/dev/null
echo ""

# 8. Levantar el resto de los contenedores
echo -e "${YELLOW}7. Levantando el resto de los contenedores...${NC}"
docker compose up -d
echo -e "${GREEN}✓ Todos los contenedores levantados${NC}"
echo ""

# 9. Verificar estado final
echo -e "${YELLOW}8. Estado final:${NC}"
docker ps --filter "name=chicoj" --format "table {{.Names}}\t{{.Status}}\t{{.State}}"
echo ""

echo "============================================"
echo "CORRECCIONES APLICADAS"
echo "============================================"
echo ""
echo "Cambios realizados:"
echo "✓ Healthcheck de PostgreSQL más tolerante (30s interval, 10 retries)"
echo "✓ Healthcheck del backend más tolerante (60s interval)"
echo "✓ Límites de memoria configurados para prevenir OOM"
echo "✓ Configuraciones de PostgreSQL para prevenir timeouts"
echo "✓ TCP keepalives configurados"
echo ""
echo "Monitorea los logs con:"
echo "  docker logs -f chicoj-backend"
echo "  docker logs -f chicoj-postgres"
echo ""

