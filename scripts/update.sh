#!/bin/bash

# ================================
# SCRIPT DE ACTUALIZACIÓN - CHICOJ SYSTEM
# ================================

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

echo "================================"
echo "ACTUALIZACIÓN DEL SISTEMA CHICOJ"
echo "================================"
echo ""

# 1. Hacer backup antes de actualizar
print_info "Creando backup de seguridad..."
./scripts/backup.sh

# 2. Pull de cambios
print_info "Descargando últimos cambios..."
git pull origin main

# 3. Detener servicios
print_info "Deteniendo servicios..."
docker compose down

# 4. Reconstruir imágenes
print_info "Reconstruyendo imágenes..."
docker compose build --no-cache

# 5. Iniciar servicios
print_info "Iniciando servicios..."
docker compose up -d

# 6. Ejecutar migraciones
print_info "Ejecutando migraciones de base de datos..."
sleep 5
docker compose exec -T backend npx prisma migrate deploy

# 7. Verificar estado
print_info "Verificando estado..."
docker compose ps

echo ""
print_success "================================"
print_success "ACTUALIZACIÓN COMPLETADA"
print_success "================================"
echo ""
print_info "Para ver logs:"
echo "  docker compose logs -f"

