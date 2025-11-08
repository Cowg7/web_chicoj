#!/bin/bash

# Script de diagnóstico completo para problemas de conexión a base de datos
# Sistema Chicoj

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🔍 DIAGNÓSTICO DE CONEXIÓN A BASE DE DATOS - CHICOJ  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0
SUCCESS=0

# Función para mostrar check
check_ok() {
    echo -e "${GREEN}✅ $1${NC}"
    ((SUCCESS++))
}

check_error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

check_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

check_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "🕐 Fecha: $(date)"
echo "🖥️  Sistema: $(uname -s)"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# ============================================
# 1. VERIFICAR VARIABLES DE ENTORNO
# ============================================
echo "1️⃣  VARIABLES DE ENTORNO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -z "$DATABASE_URL" ]; then
    check_error "DATABASE_URL no está definida"
    check_info "Intentando cargar desde .env..."
    
    if [ -f "Chicoj_System_R-T/backend/.env" ]; then
        source Chicoj_System_R-T/backend/.env
        if [ -z "$DATABASE_URL" ]; then
            check_error "Archivo .env existe pero DATABASE_URL no está definida"
        else
            check_ok "DATABASE_URL cargada desde .env"
        fi
    else
        check_error "Archivo .env no encontrado"
    fi
else
    check_ok "DATABASE_URL está definida"
fi

if [ ! -z "$DATABASE_URL" ]; then
    # Verificar parámetros de conexión
    if echo "$DATABASE_URL" | grep -q "connection_limit"; then
        check_ok "Tiene parámetro connection_limit"
    else
        check_warning "Falta parámetro connection_limit"
    fi
    
    if echo "$DATABASE_URL" | grep -q "pool_timeout"; then
        check_ok "Tiene parámetro pool_timeout"
    else
        check_warning "Falta parámetro pool_timeout"
    fi
    
    if echo "$DATABASE_URL" | grep -q "connect_timeout"; then
        check_ok "Tiene parámetro connect_timeout"
    else
        check_warning "Falta parámetro connect_timeout"
    fi
    
    # Extraer información de la URL (sin mostrar contraseña)
    MASKED_URL=$(echo "$DATABASE_URL" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/')
    check_info "URL: $MASKED_URL"
fi

echo ""

# ============================================
# 2. PROBAR CONEXIÓN DIRECTA
# ============================================
echo "2️⃣  CONEXIÓN DIRECTA A BASE DE DATOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -z "$DATABASE_URL" ]; then
    if command -v psql &> /dev/null; then
        if timeout 10 psql "$DATABASE_URL" -c "SELECT 1" &> /dev/null; then
            check_ok "Conexión exitosa"
            
            # Obtener información de la BD
            DB_VERSION=$(psql "$DATABASE_URL" -t -c "SELECT version();" 2>/dev/null | head -1)
            check_info "PostgreSQL: $DB_VERSION"
            
            # Verificar que la base de datos existe
            DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
            if psql "$DATABASE_URL" -t -c "\l" | grep -q "$DB_NAME"; then
                check_ok "Base de datos '$DB_NAME' existe"
            else
                check_error "Base de datos '$DB_NAME' NO existe"
            fi
            
            # Ver número de conexiones activas
            CONNECTIONS=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | tr -d ' ')
            check_info "Conexiones activas: $CONNECTIONS"
            
        else
            check_error "No se puede conectar a la base de datos"
            check_info "Posibles causas:"
            check_info "  - Credenciales incorrectas"
            check_info "  - Base de datos suspendida"
            check_info "  - Firewall bloqueando conexión"
            check_info "  - Servicio caído"
        fi
    else
        check_warning "psql no está instalado, no se puede probar conexión"
        check_info "Instalar con: sudo apt install postgresql-client"
    fi
else
    check_error "No se puede probar conexión sin DATABASE_URL"
fi

echo ""

# ============================================
# 3. VERIFICAR DOCKER
# ============================================
echo "3️⃣  CONTENEDORES DOCKER"
echo "━━━━━━━━━━━━━━━━━━━━━━"

if command -v docker &> /dev/null; then
    BACKEND_CONTAINERS=$(docker ps -a --filter name=chicoj-backend --format "{{.Names}}" | wc -l)
    
    if [ $BACKEND_CONTAINERS -eq 0 ]; then
        check_error "No hay contenedores de backend"
    elif [ $BACKEND_CONTAINERS -eq 1 ]; then
        check_ok "1 contenedor de backend encontrado"
        
        CONTAINER_STATUS=$(docker ps --filter name=chicoj-backend --format "{{.Status}}")
        if echo "$CONTAINER_STATUS" | grep -q "Up"; then
            check_ok "Contenedor está corriendo"
            check_info "Estado: $CONTAINER_STATUS"
            
            # Ver restart count
            RESTART_COUNT=$(docker inspect chicoj-backend --format='{{.RestartCount}}' 2>/dev/null)
            if [ ! -z "$RESTART_COUNT" ]; then
                if [ $RESTART_COUNT -eq 0 ]; then
                    check_ok "Sin reinicios (RestartCount: 0)"
                elif [ $RESTART_COUNT -lt 5 ]; then
                    check_warning "Reinicios recientes: $RESTART_COUNT"
                else
                    check_error "Muchos reinicios: $RESTART_COUNT"
                fi
            fi
        else
            check_error "Contenedor NO está corriendo"
        fi
    else
        check_warning "Múltiples contenedores encontrados: $BACKEND_CONTAINERS"
        check_info "Puede causar conflictos de conexión"
    fi
    
    # Ver contenedores relacionados
    echo ""
    check_info "Contenedores activos:"
    docker ps --filter name=chicoj --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -v "^NAMES" | while read line; do
        echo "  $line"
    done
else
    check_error "Docker no está instalado o no está corriendo"
fi

echo ""

# ============================================
# 4. HEALTH CHECK DEL BACKEND
# ============================================
echo "4️⃣  HEALTH CHECK DEL BACKEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v curl &> /dev/null; then
    # Intentar localhost primero
    HEALTH_URL="http://localhost:3000/api/health"
    
    HEALTH_RESPONSE=$(curl -s --max-time 5 "$HEALTH_URL" 2>/dev/null)
    
    if [ ! -z "$HEALTH_RESPONSE" ]; then
        if echo "$HEALTH_RESPONSE" | grep -q '"status".*"healthy"'; then
            check_ok "Backend está saludable"
            
            if command -v jq &> /dev/null; then
                DB_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.database.status' 2>/dev/null)
                DB_CONNECTED=$(echo "$HEALTH_RESPONSE" | jq -r '.database.connected' 2>/dev/null)
                KEEPALIVE_COUNT=$(echo "$HEALTH_RESPONSE" | jq -r '.database.keepAliveCount' 2>/dev/null)
                
                if [ "$DB_STATUS" = "healthy" ]; then
                    check_ok "Base de datos: healthy"
                else
                    check_error "Base de datos: $DB_STATUS"
                fi
                
                if [ "$DB_CONNECTED" = "true" ]; then
                    check_ok "Conectado: true"
                else
                    check_error "Conectado: false"
                fi
                
                if [ ! -z "$KEEPALIVE_COUNT" ] && [ "$KEEPALIVE_COUNT" != "null" ]; then
                    if [ $KEEPALIVE_COUNT -gt 0 ]; then
                        check_ok "Keep-alive activo (count: $KEEPALIVE_COUNT)"
                    else
                        check_warning "Keep-alive en 0 (acabando de iniciar?)"
                    fi
                fi
            else
                check_info "Instalar 'jq' para ver detalles: sudo apt install jq"
            fi
        else
            check_error "Backend responde pero NO está healthy"
            echo "$HEALTH_RESPONSE"
        fi
    else
        check_error "Backend no responde en $HEALTH_URL"
        check_info "Posibles causas:"
        check_info "  - Backend no está corriendo"
        check_info "  - Puerto 3000 no accesible"
        check_info "  - Backend crasheó"
    fi
else
    check_warning "curl no está instalado"
fi

echo ""

# ============================================
# 5. LOGS RECIENTES
# ============================================
echo "5️⃣  LOGS DEL BACKEND (últimos errores)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v docker &> /dev/null; then
    if docker ps --filter name=chicoj-backend --format "{{.Names}}" | grep -q "chicoj-backend"; then
        # Ver errores recientes
        ERROR_COUNT=$(docker logs chicoj-backend --tail 200 2>&1 | grep -i "error\|fatal\|terminating" | wc -l)
        
        if [ $ERROR_COUNT -eq 0 ]; then
            check_ok "No hay errores recientes en los logs"
        else
            check_warning "Se encontraron $ERROR_COUNT líneas con errores"
            echo ""
            echo "Últimos 5 errores:"
            docker logs chicoj-backend --tail 200 2>&1 | grep -i "error\|fatal\|terminating" | tail -5 | while read line; do
                echo "  $line"
            done
        fi
        
        # Verificar keep-alive
        echo ""
        KEEPALIVE_COUNT=$(docker logs chicoj-backend 2>&1 | grep -c "KEEPALIVE")
        
        if [ $KEEPALIVE_COUNT -gt 0 ]; then
            check_ok "Keep-alive detectado en logs ($KEEPALIVE_COUNT menciones)"
            
            # Última actividad de keep-alive
            LAST_KEEPALIVE=$(docker logs chicoj-backend --tail 100 2>&1 | grep "KEEPALIVE" | tail -1)
            if [ ! -z "$LAST_KEEPALIVE" ]; then
                check_info "Último keep-alive: $LAST_KEEPALIVE"
            fi
        else
            check_warning "No se detectó keep-alive en logs"
            check_info "Puede que el backend acabe de iniciar"
        fi
    else
        check_error "Contenedor no está corriendo, no se pueden ver logs"
    fi
fi

echo ""

# ============================================
# 6. VERIFICAR PUERTOS
# ============================================
echo "6️⃣  PUERTOS Y CONEXIONES"
echo "━━━━━━━━━━━━━━━━━━━━━━"

if command -v netstat &> /dev/null || command -v ss &> /dev/null; then
    # Verificar puerto 3000
    if netstat -tuln 2>/dev/null | grep -q ":3000" || ss -tuln 2>/dev/null | grep -q ":3000"; then
        check_ok "Puerto 3000 está escuchando"
    else
        check_error "Puerto 3000 NO está escuchando"
    fi
    
    # Verificar puerto 5432 (PostgreSQL)
    if netstat -tuln 2>/dev/null | grep -q ":5432" || ss -tuln 2>/dev/null | grep -q ":5432"; then
        check_info "Puerto 5432 (PostgreSQL) está abierto localmente"
    fi
else
    check_warning "netstat/ss no disponible"
fi

echo ""

# ============================================
# 7. CONFIGURACIÓN DE SISTEMA
# ============================================
echo "7️⃣  CONFIGURACIÓN DEL SISTEMA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Memoria disponible
if command -v free &> /dev/null; then
    TOTAL_MEM=$(free -m | awk 'NR==2 {print $2}')
    USED_MEM=$(free -m | awk 'NR==2 {print $3}')
    FREE_MEM=$(free -m | awk 'NR==2 {print $4}')
    
    check_info "Memoria total: ${TOTAL_MEM}MB"
    check_info "Memoria usada: ${USED_MEM}MB"
    check_info "Memoria libre: ${FREE_MEM}MB"
    
    if [ $FREE_MEM -lt 100 ]; then
        check_warning "Poca memoria libre (< 100 MB)"
    fi
fi

# Espacio en disco
if command -v df &> /dev/null; then
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $DISK_USAGE -lt 80 ]; then
        check_ok "Espacio en disco: ${DISK_USAGE}% usado"
    else
        check_warning "Espacio en disco: ${DISK_USAGE}% usado (alto)"
    fi
fi

echo ""

# ============================================
# RESUMEN FINAL
# ============================================
echo "╔════════════════════════════════════════════════════════╗"
echo "║                    RESUMEN FINAL                       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

TOTAL_CHECKS=$((SUCCESS + WARNINGS + ERRORS))

echo -e "${GREEN}✅ Exitosos: $SUCCESS${NC}"
echo -e "${YELLOW}⚠️  Advertencias: $WARNINGS${NC}"
echo -e "${RED}❌ Errores: $ERRORS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Total: $TOTAL_CHECKS checks"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Todo parece estar bien!${NC}"
    echo ""
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Hay algunas advertencias que deberías revisar${NC}"
    echo ""
else
    echo -e "${RED}❌ Se encontraron $ERRORS errores que necesitan atención${NC}"
    echo ""
    echo "Recomendaciones:"
    echo "1. Revisar los errores marcados arriba"
    echo "2. Verificar logs completos: docker logs chicoj-backend"
    echo "3. Consultar OTROS_FACTORES_DESCONEXION.md"
    echo ""
fi

echo "Logs guardados en: diagnostico-$(date +%Y%m%d-%H%M%S).log"
echo ""

