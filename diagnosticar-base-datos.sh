#!/bin/bash
# Script para diagnosticar problemas de conexión con PostgreSQL

echo "============================================"
echo "DIAGNÓSTICO DE POSTGRESQL"
echo "============================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Estado de los contenedores
echo -e "${YELLOW}1. Estado de los contenedores:${NC}"
docker ps -a --filter "name=chicoj" --format "table {{.Names}}\t{{.Status}}\t{{.State}}"
echo ""

# 2. Healthcheck de PostgreSQL
echo -e "${YELLOW}2. Healthcheck de PostgreSQL:${NC}"
docker inspect chicoj-postgres --format='{{json .State.Health}}' | python3 -m json.tool 2>/dev/null || echo "Healthcheck no disponible"
echo ""

# 3. Uso de memoria
echo -e "${YELLOW}3. Uso de memoria de los contenedores:${NC}"
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}" chicoj-postgres chicoj-backend
echo ""

# 4. Últimos 50 logs de PostgreSQL
echo -e "${YELLOW}4. Últimos logs de PostgreSQL:${NC}"
docker logs chicoj-postgres --tail 50 | grep -E "FATAL|ERROR|terminating|restart|OOM" || echo "No se encontraron errores críticos en los logs recientes"
echo ""

# 5. Conexiones activas en PostgreSQL
echo -e "${YELLOW}5. Conexiones activas en PostgreSQL:${NC}"
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "
SELECT 
    count(*) as total_conexiones,
    sum(case when state = 'active' then 1 else 0 end) as conexiones_activas,
    sum(case when state = 'idle' then 1 else 0 end) as conexiones_idle
FROM pg_stat_activity
WHERE datname = 'restaurante_db';" 2>/dev/null || echo -e "${RED}No se pudo conectar a PostgreSQL${NC}"
echo ""

# 6. Configuración de PostgreSQL
echo -e "${YELLOW}6. Configuración relevante de PostgreSQL:${NC}"
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "
SELECT name, setting, unit 
FROM pg_settings 
WHERE name IN (
    'max_connections',
    'shared_buffers',
    'statement_timeout',
    'idle_in_transaction_session_timeout',
    'tcp_keepalives_idle',
    'tcp_keepalives_interval',
    'tcp_keepalives_count'
);" 2>/dev/null || echo -e "${RED}No se pudo consultar configuración${NC}"
echo ""

# 7. Últimos reinicios del contenedor
echo -e "${YELLOW}7. Información del contenedor de PostgreSQL:${NC}"
docker inspect chicoj-postgres --format='Estado: {{.State.Status}}
Iniciado: {{.State.StartedAt}}
Reinicios: {{.RestartCount}}
OOMKilled: {{.State.OOMKilled}}' 2>/dev/null
echo ""

# 8. Verificar existencia de la base de datos
echo -e "${YELLOW}8. Verificar base de datos:${NC}"
docker exec chicoj-postgres psql -U postgres -c "\l" | grep restaurante_db && echo -e "${GREEN}✓ Base de datos 'restaurante_db' existe${NC}" || echo -e "${RED}✗ Base de datos 'restaurante_db' NO existe${NC}"
echo ""

# 9. Logs del backend relacionados con DB
echo -e "${YELLOW}9. Últimos logs del backend (errores de DB):${NC}"
docker logs chicoj-backend --tail 100 | grep -E "DB|database|Database|prisma|FATAL" | tail -20
echo ""

echo "============================================"
echo "DIAGNÓSTICO COMPLETADO"
echo "============================================"
echo ""
echo "Si ves errores de 'OOMKilled: true', el contenedor se quedó sin memoria."
echo "Si ves 'terminating connection due to administrator command', el contenedor se reinició."
echo "Si ves 'Database does not exist', la base de datos fue eliminada o no se creó correctamente."
echo ""

