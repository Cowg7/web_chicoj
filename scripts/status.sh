#!/bin/bash

# ================================
# SCRIPT DE ESTADO - CHICOJ SYSTEM
# ================================

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

echo ""
print_header "ESTADO DEL SISTEMA CHICOJ"
echo ""

# 1. Estado de contenedores
print_info "Estado de contenedores:"
docker compose ps
echo ""

# 2. Uso de recursos
print_info "Uso de recursos:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
echo ""

# 3. Health checks
print_info "Health checks:"
for container in chicoj-backend chicoj-frontend chicoj-postgres chicoj-nginx; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no health check")
        if [ "$health" = "healthy" ]; then
            print_success "$container: $health"
        elif [ "$health" = "no health check" ]; then
            print_info "$container: sin health check"
        else
            print_error "$container: $health"
        fi
    else
        print_error "$container: no está corriendo"
    fi
done
echo ""

# 4. Espacio en disco
print_info "Espacio en disco:"
df -h / | tail -n 1 | awk '{print "  Usado: "$3" / "$2" ("$5")"}'
echo ""

# 5. Volúmenes
print_info "Volúmenes Docker:"
docker volume ls --filter name=chicoj
echo ""

# 6. Redes
print_info "Redes Docker:"
docker network ls --filter name=chicoj
echo ""

# 7. Últimas actualizaciones
print_info "Últimas líneas de los logs:"
docker compose logs --tail=3 backend 2>/dev/null | head -n 3
echo ""

# 8. Endpoints disponibles
print_info "Endpoints disponibles:"
if docker ps | grep -q "chicoj-nginx"; then
    IP=$(hostname -I | awk '{print $1}')
    echo "  Frontend: http://$IP"
    echo "  API:      http://$IP/api"
    echo "  WebSocket: ws://$IP/socket.io"
fi

# PgAdmin si está corriendo
if docker ps | grep -q "chicoj-pgadmin"; then
    echo "  PgAdmin:  http://$IP:5050"
fi
echo ""

print_header "FIN DEL REPORTE"
echo ""

