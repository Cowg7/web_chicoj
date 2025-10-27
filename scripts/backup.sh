#!/bin/bash

# ================================
# SCRIPT DE BACKUP - CHICOJ SYSTEM
# ================================

set -e

# Configuración
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
POSTGRES_CONTAINER="chicoj-postgres"
DB_USER="postgres"
DB_NAME="restaurante_db"

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

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

print_info "Iniciando backup de la base de datos..."

# Verificar que el contenedor esté corriendo
if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
    print_error "El contenedor de PostgreSQL no está corriendo"
    exit 1
fi

# Hacer backup
BACKUP_FILE="$BACKUP_DIR/chicoj_backup_$DATE.sql"

docker compose exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

if [ -f "$BACKUP_FILE" ]; then
    # Comprimir backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    print_success "Backup creado exitosamente: $BACKUP_FILE (Tamaño: $BACKUP_SIZE)"
    
    # Limpiar backups antiguos (mantener solo los últimos 7)
    print_info "Limpiando backups antiguos..."
    cd "$BACKUP_DIR"
    ls -t chicoj_backup_*.sql.gz | tail -n +8 | xargs -r rm
    print_success "Backups antiguos eliminados"
    
    # Mostrar backups disponibles
    print_info "Backups disponibles:"
    ls -lh chicoj_backup_*.sql.gz 2>/dev/null || echo "  No hay otros backups"
else
    print_error "Error al crear el backup"
    exit 1
fi

echo ""
print_success "¡Backup completado!"
echo ""
print_info "Para restaurar este backup, ejecuta:"
echo "  ./scripts/restore.sh $BACKUP_FILE"

