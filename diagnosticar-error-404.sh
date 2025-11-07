#!/bin/bash

# Script de Diagnóstico Rápido para Error 404 en Roles
# Para ejecutar en el servidor de producción (Linux/Mac)

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  🔍 DIAGNÓSTICO ERROR 404 - ROLES${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# 1. Verificar Docker
echo -e "${YELLOW}📦 1. Verificando Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "   ${GREEN}✅ Docker instalado${NC}"
    docker --version
else
    echo -e "   ${RED}❌ Docker NO encontrado${NC}"
    exit 1
fi

echo ""

# 2. Verificar docker-compose
echo -e "${YELLOW}🐳 2. Verificando Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    echo -e "   ${GREEN}✅ Docker Compose instalado${NC}"
    docker-compose --version
else
    echo -e "   ${YELLOW}⚠️  docker-compose no encontrado, verificando 'docker compose'...${NC}"
    if docker compose version &> /dev/null; then
        echo -e "   ${GREEN}✅ Docker Compose (plugin) disponible${NC}"
        DOCKER_COMPOSE="docker compose"
    else
        echo -e "   ${RED}❌ Docker Compose NO disponible${NC}"
        exit 1
    fi
fi

# Determinar comando de docker-compose
if [ -z "$DOCKER_COMPOSE" ]; then
    DOCKER_COMPOSE="docker-compose"
fi

echo ""

# 3. Contenedores activos
echo -e "${YELLOW}🐳 3. Contenedores activos:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""

# 4. Verificar backend
echo -e "${YELLOW}🔧 4. Estado del Backend:${NC}"
BACKEND_CONTAINER=$(docker ps --filter "name=backend" --format "{{.Names}}" | head -n 1)
if [ -n "$BACKEND_CONTAINER" ]; then
    echo -e "   ${GREEN}✅ Backend está corriendo: $BACKEND_CONTAINER${NC}"
    
    echo ""
    echo -e "   ${CYAN}📋 Últimas 10 líneas del log:${NC}"
    docker logs $BACKEND_CONTAINER --tail 10
else
    echo -e "   ${RED}❌ Backend NO está corriendo${NC}"
    echo -e "   ${YELLOW}💡 Solución: $DOCKER_COMPOSE up -d backend${NC}"
fi

echo ""

# 5. Verificar Nginx
echo -e "${YELLOW}🌐 5. Estado de Nginx:${NC}"
NGINX_CONTAINER=$(docker ps --filter "name=nginx" --format "{{.Names}}" | head -n 1)
if [ -n "$NGINX_CONTAINER" ]; then
    echo -e "   ${GREEN}✅ Nginx está corriendo: $NGINX_CONTAINER${NC}"
else
    echo -e "   ${RED}❌ Nginx NO está corriendo${NC}"
fi

echo ""

# 6. Verificar PostgreSQL
echo -e "${YELLOW}🗄️  6. Estado de PostgreSQL:${NC}"
POSTGRES_CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -n 1)
if [ -n "$POSTGRES_CONTAINER" ]; then
    echo -e "   ${GREEN}✅ PostgreSQL está corriendo: $POSTGRES_CONTAINER${NC}"
else
    echo -e "   ${RED}❌ PostgreSQL NO está corriendo${NC}"
fi

echo ""

# 7. Probar endpoint de health
echo -e "${YELLOW}🏥 7. Probando endpoint /api/health:${NC}"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✅ Backend respondiendo correctamente${NC}"
    HEALTH_DATA=$(curl -s http://localhost:3000/api/health 2>/dev/null)
    echo -e "   ${GRAY}📄 Respuesta: $HEALTH_DATA${NC}"
else
    echo -e "   ${RED}❌ Backend NO responde en http://localhost:3000/api/health${NC}"
    echo -e "   ${YELLOW}💡 Código de respuesta: $HEALTH_RESPONSE${NC}"
fi

echo ""

# 8. Verificar conectividad entre contenedores
echo -e "${YELLOW}🔗 8. Conectividad entre contenedores:${NC}"
if [ -n "$NGINX_CONTAINER" ] && [ -n "$BACKEND_CONTAINER" ]; then
    if docker exec $NGINX_CONTAINER ping -c 2 backend &> /dev/null; then
        echo -e "   ${GREEN}✅ Nginx puede comunicarse con Backend${NC}"
    else
        echo -e "   ${RED}❌ Nginx NO puede comunicarse con Backend${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  No se puede verificar (algún contenedor no está corriendo)${NC}"
fi

echo ""

# 9. Verificar archivos de rutas en el backend
echo -e "${YELLOW}📁 9. Verificando archivos de rutas del backend:${NC}"
if [ -n "$BACKEND_CONTAINER" ]; then
    echo -e "   ${CYAN}🔍 Buscando users.routes.js...${NC}"
    if docker exec $BACKEND_CONTAINER test -f /app/src/routes/users.routes.js; then
        echo -e "   ${GREEN}✅ Archivo users.routes.js existe${NC}"
        
        echo ""
        echo -e "   ${CYAN}📄 Rutas de roles encontradas:${NC}"
        docker exec $BACKEND_CONTAINER cat /app/src/routes/users.routes.js | grep -E "router\.(get|post|patch|delete)\('/roles"
    else
        echo -e "   ${RED}❌ Archivo users.routes.js NO encontrado${NC}"
    fi
fi

echo ""

# 10. Verificar variables de entorno
echo -e "${YELLOW}⚙️  10. Variables de entorno del backend:${NC}"
if [ -n "$BACKEND_CONTAINER" ]; then
    echo -e "   ${CYAN}📋 Variables importantes:${NC}"
    docker exec $BACKEND_CONTAINER env | grep -E "PORT|NODE_ENV|DATABASE_URL"
fi

echo ""

# 11. Verificar configuración de Nginx
echo -e "${YELLOW}🌐 11. Configuración de Nginx:${NC}"
if [ -n "$NGINX_CONTAINER" ]; then
    echo -e "   ${CYAN}🔍 Verificando proxy a /api/:${NC}"
    if docker exec $NGINX_CONTAINER cat /etc/nginx/conf.d/default.conf | grep -A 5 "location /api/" | grep "proxy_pass" &> /dev/null; then
        echo -e "   ${GREEN}✅ Proxy a /api/ configurado${NC}"
        docker exec $NGINX_CONTAINER cat /etc/nginx/conf.d/default.conf | grep -A 5 "location /api/" | grep "proxy_pass"
    else
        echo -e "   ${RED}❌ Proxy a /api/ NO encontrado${NC}"
    fi
fi

echo ""

# Resumen y recomendaciones
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  📊 RESUMEN DEL DIAGNÓSTICO${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

ALL_OK=true

if [ -z "$BACKEND_CONTAINER" ]; then
    echo -e "${RED}❌ Backend NO está corriendo${NC}"
    echo -e "   ${YELLOW}💡 Ejecuta: $DOCKER_COMPOSE up -d backend${NC}"
    ALL_OK=false
fi

if [ -z "$NGINX_CONTAINER" ]; then
    echo -e "${RED}❌ Nginx NO está corriendo${NC}"
    echo -e "   ${YELLOW}💡 Ejecuta: $DOCKER_COMPOSE up -d nginx${NC}"
    ALL_OK=false
fi

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo -e "${RED}❌ PostgreSQL NO está corriendo${NC}"
    echo -e "   ${YELLOW}💡 Ejecuta: $DOCKER_COMPOSE up -d postgres${NC}"
    ALL_OK=false
fi

if [ "$HEALTH_RESPONSE" != "200" ] && [ -n "$BACKEND_CONTAINER" ]; then
    echo -e "${RED}❌ Backend NO responde correctamente${NC}"
    echo -e "   ${YELLOW}💡 Ejecuta: $DOCKER_COMPOSE restart backend${NC}"
    ALL_OK=false
fi

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✅ TODOS LOS SERVICIOS ESTÁN FUNCIONANDO${NC}"
    echo ""
    echo -e "${CYAN}🔍 Próximos pasos:${NC}"
    echo -e "   ${GRAY}1. Probar el endpoint desde el navegador:${NC}"
    echo -e "      fetch('https://coopechicoj.com/api/health')"
    echo ""
    echo -e "   ${GRAY}2. Verificar token de autenticación:${NC}"
    echo -e "      console.log(localStorage.getItem('auth_token'))"
    echo ""
    echo -e "   ${GRAY}3. Probar endpoint de roles:${NC}"
    echo -e "      const token = localStorage.getItem('auth_token');"
    echo -e "      fetch('https://coopechicoj.com/api/users/roles', {"
    echo -e "        headers: { 'Authorization': \`Bearer \${token}\` }"
    echo -e "      })"
else
    echo -e "${YELLOW}⚠️  HAY PROBLEMAS QUE NECESITAN ATENCIÓN${NC}"
    echo ""
    echo -e "${CYAN}🔧 Comandos de solución rápida:${NC}"
    echo ""
    echo -e "   ${GRAY}# Reiniciar servicios${NC}"
    echo -e "   $DOCKER_COMPOSE restart backend nginx"
    echo ""
    echo -e "   ${GRAY}# Ver logs en tiempo real${NC}"
    echo -e "   $DOCKER_COMPOSE logs -f backend"
    echo ""
    echo -e "   ${GRAY}# Ver estado de todos los contenedores${NC}"
    echo -e "   $DOCKER_COMPOSE ps"
    echo ""
    echo -e "   ${GRAY}# Si nada funciona, rebuild completo:${NC}"
    echo -e "   $DOCKER_COMPOSE down"
    echo -e "   $DOCKER_COMPOSE build backend"
    echo -e "   $DOCKER_COMPOSE up -d"
fi

echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  📄 Documentación completa:${NC}"
echo -e "  ${GRAY}FIX_ERROR_404_ROLES_PRODUCCION.md${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# Ofrecer ejecutar comandos de solución
if [ "$ALL_OK" = false ]; then
    echo -e "${YELLOW}¿Quieres intentar reiniciar los servicios ahora? (s/n)${NC}"
    read -r RESPUESTA
    if [ "$RESPUESTA" = "s" ] || [ "$RESPUESTA" = "S" ]; then
        echo ""
        echo -e "${CYAN}🔄 Reiniciando servicios...${NC}"
        $DOCKER_COMPOSE restart backend nginx
        echo ""
        echo -e "${GREEN}✅ Servicios reiniciados${NC}"
        echo -e "${YELLOW}💡 Espera 10 segundos y vuelve a ejecutar este script${NC}"
    fi
fi






