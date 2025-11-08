#!/bin/bash
# Script para verificar el estado de seguridad de PostgreSQL

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  VERIFICACIÓN DE SEGURIDAD DE POSTGRESQL         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

ISSUES_FOUND=0

# 1. Verificar exposición de puerto
echo -e "${YELLOW}[1/8] Verificando exposición del puerto 5432...${NC}"
if netstat -tunlp 2>/dev/null | grep ":5432" | grep -q "0.0.0.0" || \
   ss -tunlp 2>/dev/null | grep ":5432" | grep -q "0.0.0.0"; then
    echo -e "${RED}✗ CRÍTICO: Puerto 5432 EXPUESTO A INTERNET${NC}"
    echo "  Esto permite ataques desde cualquier IP"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
elif docker compose ps | grep -q chicoj-postgres; then
    echo -e "${GREEN}✓ Puerto 5432 solo accesible localmente${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL no está corriendo${NC}"
fi
echo ""

# 2. Verificar docker-compose.yml
echo -e "${YELLOW}[2/8] Verificando docker-compose.yml...${NC}"
if grep -q '"127.0.0.1:5432:5432"' docker-compose.yml || \
   grep -q "'127.0.0.1:5432:5432'" docker-compose.yml; then
    echo -e "${GREEN}✓ docker-compose.yml configurado correctamente${NC}"
elif grep -q '"5432:5432"' docker-compose.yml; then
    echo -e "${RED}✗ docker-compose.yml expone el puerto a Internet${NC}"
    echo "  Cambiar: '5432:5432' → '127.0.0.1:5432:5432'"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

# 3. Verificar actividad sospechosa reciente
echo -e "${YELLOW}[3/8] Buscando actividad sospechosa en logs...${NC}"
SUSPICIOUS=$(docker logs chicoj-postgres --since 1h 2>&1 | \
    grep -E "COPY.*FROM.*PROGRAM|DROP DATABASE|ALTER USER.*pgg_|password authentication failed" | \
    wc -l)
    
if [ "$SUSPICIOUS" -gt 0 ]; then
    echo -e "${RED}✗ Se encontraron $SUSPICIOUS eventos sospechosos en la última hora${NC}"
    echo "  Eventos detectados:"
    docker logs chicoj-postgres --since 1h 2>&1 | \
        grep -E "COPY.*FROM.*PROGRAM|DROP DATABASE|ALTER USER.*pgg_|password authentication failed" | \
        head -5
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✓ No se detectó actividad sospechosa reciente${NC}"
fi
echo ""

# 4. Verificar conexiones activas
echo -e "${YELLOW}[4/8] Verificando conexiones activas...${NC}"
if docker exec chicoj-postgres psql -U postgres -d restaurante_db -c \
    "SELECT client_addr, usename, application_name, state FROM pg_stat_activity WHERE datname = 'restaurante_db';" \
    2>/dev/null | grep -v "^$"; then
    echo -e "${GREEN}✓ Conexiones mostradas arriba${NC}"
else
    echo -e "${YELLOW}⚠️  No se pudo consultar conexiones activas${NC}"
fi
echo ""

# 5. Verificar que la base de datos existe
echo -e "${YELLOW}[5/8] Verificando existencia de base de datos...${NC}"
if docker exec chicoj-postgres psql -U postgres -l 2>/dev/null | grep -q "restaurante_db"; then
    echo -e "${GREEN}✓ Base de datos 'restaurante_db' existe${NC}"
else
    echo -e "${RED}✗ Base de datos 'restaurante_db' NO EXISTE${NC}"
    echo "  Necesitas restaurar desde backup o recrearla"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

# 6. Verificar configuraciones de seguridad
echo -e "${YELLOW}[6/8] Verificando configuraciones de seguridad de PostgreSQL...${NC}"
if docker exec chicoj-postgres psql -U postgres -c \
    "SHOW log_connections;" 2>/dev/null | grep -q "on"; then
    echo -e "${GREEN}✓ Logging de conexiones habilitado${NC}"
else
    echo -e "${YELLOW}⚠️  Logging de conexiones no habilitado${NC}"
fi
echo ""

# 7. Verificar firewall
echo -e "${YELLOW}[7/8] Verificando firewall...${NC}"
if command -v ufw &> /dev/null; then
    if sudo ufw status 2>/dev/null | grep -q "5432.*DENY"; then
        echo -e "${GREEN}✓ UFW bloqueando puerto 5432${NC}"
    else
        echo -e "${YELLOW}⚠️  UFW no está bloqueando puerto 5432${NC}"
        echo "  Ejecuta: sudo ufw deny 5432/tcp"
    fi
elif command -v iptables &> /dev/null; then
    if sudo iptables -L -n 2>/dev/null | grep -q "5432.*DROP"; then
        echo -e "${GREEN}✓ iptables bloqueando puerto 5432${NC}"
    else
        echo -e "${YELLOW}⚠️  iptables no está bloqueando puerto 5432${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No se encontró firewall configurado${NC}"
fi
echo ""

# 8. Verificar IP del atacante bloqueada
echo -e "${YELLOW}[8/8] Verificando bloqueo de IP atacante...${NC}"
ATTACKER_IP="78.153.140.66"
if command -v ufw &> /dev/null; then
    if sudo ufw status 2>/dev/null | grep -q "$ATTACKER_IP"; then
        echo -e "${GREEN}✓ IP del atacante ($ATTACKER_IP) bloqueada${NC}"
    else
        echo -e "${YELLOW}⚠️  IP del atacante no está bloqueada${NC}"
        echo "  Ejecuta: sudo ufw deny from $ATTACKER_IP"
    fi
elif command -v iptables &> /dev/null; then
    if sudo iptables -L -n 2>/dev/null | grep -q "$ATTACKER_IP"; then
        echo -e "${GREEN}✓ IP del atacante ($ATTACKER_IP) bloqueada${NC}"
    else
        echo -e "${YELLOW}⚠️  IP del atacante no está bloqueada${NC}"
    fi
fi
echo ""

# Resumen
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓ VERIFICACIÓN COMPLETADA - NO SE ENCONTRARON PROBLEMAS CRÍTICOS${NC}"
else
    echo -e "${RED}⚠️  SE ENCONTRARON $ISSUES_FOUND PROBLEMAS QUE REQUIEREN ATENCIÓN${NC}"
fi
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Recomendaciones
echo -e "${YELLOW}RECOMENDACIONES:${NC}"
echo ""
echo "1. Ejecuta verificaciones periódicas:"
echo "   ./verificar-seguridad.sh"
echo ""
echo "2. Monitorea logs regularmente:"
echo "   docker logs chicoj-postgres | grep -E 'FATAL|ERROR' | tail -20"
echo ""
echo "3. Realiza backups diarios:"
echo "   ./hacer-backup-bd.sh"
echo ""
echo "4. Mantén el sistema actualizado:"
echo "   docker compose pull"
echo "   docker compose up -d"
echo ""

exit $ISSUES_FOUND

