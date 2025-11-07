#!/bin/bash

# ================================
# SCRIPT PARA VER LOGS - CHICOJ SYSTEM
# ================================

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Si no hay argumentos, mostrar todos los logs
if [ -z "$1" ]; then
    print_info "Mostrando logs de todos los servicios..."
    docker compose logs -f --tail=100
    exit 0
fi

# Mostrar logs del servicio específico
case "$1" in
    backend|api)
        print_info "Mostrando logs del backend..."
        docker compose logs -f --tail=100 backend
        ;;
    frontend|web)
        print_info "Mostrando logs del frontend..."
        docker compose logs -f --tail=100 frontend
        ;;
    postgres|db|database)
        print_info "Mostrando logs de PostgreSQL..."
        docker compose logs -f --tail=100 postgres
        ;;
    nginx|proxy)
        print_info "Mostrando logs de Nginx..."
        docker compose logs -f --tail=100 nginx
        ;;
    pgadmin)
        print_info "Mostrando logs de PgAdmin..."
        docker compose logs -f --tail=100 pgadmin
        ;;
    *)
        echo "Uso: $0 [backend|frontend|postgres|nginx|pgadmin]"
        echo ""
        echo "Servicios disponibles:"
        echo "  backend   - API y WebSocket"
        echo "  frontend  - Aplicación web"
        echo "  postgres  - Base de datos"
        echo "  nginx     - Reverse proxy"
        echo "  pgadmin   - Administrador de BD"
        echo ""
        echo "Sin argumentos, muestra todos los logs"
        exit 1
        ;;
esac

