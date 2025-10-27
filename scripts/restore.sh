#!/bin/bash

# ================================
# SCRIPT DE RESTAURACIÓN - CHICOJ SYSTEM
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

# Verificar argumento
if [ -z "$1" ]; then
    print_error "Uso: $0 <archivo_backup.sql.gz>"
    print_info "Backups disponibles:"
    ls -lh backups/chicoj_backup_*.sql.gz 2>/dev/null || echo "  No hay backups disponibles"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "El archivo $BACKUP_FILE no existe"
    exit 1
fi

print_info "Archivo de backup: $BACKUP_FILE"

# Confirmación
read -p "⚠️  ¿Estás seguro de que quieres restaurar este backup? Esto sobrescribirá la base de datos actual. (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_info "Restauración cancelada"
    exit 0
fi

# Configuración
POSTGRES_CONTAINER="chicoj-postgres"
DB_USER="postgres"
DB_NAME="restaurante_db"

# Verificar que el contenedor esté corriendo
if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
    print_error "El contenedor de PostgreSQL no está corriendo"
    exit 1
fi

print_info "Descomprimiendo backup..."
if [[ $BACKUP_FILE == *.gz ]]; then
    TEMP_SQL="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"
else
    TEMP_SQL="$BACKUP_FILE"
fi

print_info "Restaurando base de datos..."

# Restaurar
docker compose exec -T postgres psql -U "$DB_USER" "$DB_NAME" < "$TEMP_SQL"

# Limpiar archivo temporal si fue creado
if [[ $BACKUP_FILE == *.gz ]]; then
    rm "$TEMP_SQL"
fi

print_success "¡Base de datos restaurada exitosamente!"
print_info "Reiniciando backend..."
docker compose restart backend

echo ""
print_success "¡Restauración completada!"

