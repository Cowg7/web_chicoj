#!/bin/bash

# ================================
# SCRIPT DE DEPLOYMENT - CHICOJ RESTAURANT SYSTEM
# Para Ubuntu 22.04 en DigitalOcean
# ================================

set -e  # Salir si hay algún error

echo "================================"
echo "CHICOJ DEPLOYMENT SCRIPT"
echo "================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    print_error "Error: docker-compose.yml no encontrado. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# 1. Verificar que Docker está instalado
print_info "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Ejecuta primero: ./setup-server.sh"
    exit 1
fi
print_success "Docker encontrado"

# 2. Verificar que Docker Compose está instalado
print_info "Verificando Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose no está instalado. Ejecuta primero: ./setup-server.sh"
    exit 1
fi
print_success "Docker Compose encontrado"

# 3. Verificar que existe archivo .env
print_info "Verificando archivo .env..."
if [ ! -f ".env" ]; then
    print_error "Archivo .env no encontrado."
    print_info "Copia env.example a .env y configúralo:"
    print_info "  cp env.example .env"
    print_info "  nano .env"
    exit 1
fi
print_success "Archivo .env encontrado"

# 4. Crear directorios necesarios
print_info "Creando directorios necesarios..."
mkdir -p certbot/conf certbot/www nginx/conf.d
print_success "Directorios creados"

# 5. Detener contenedores existentes si los hay
print_info "Deteniendo contenedores existentes..."
docker compose down 2>/dev/null || true
print_success "Contenedores detenidos"

# 6. Construir imágenes
print_info "Construyendo imágenes Docker..."
docker compose build --no-cache
print_success "Imágenes construidas"

# 7. Iniciar servicios
print_info "Iniciando servicios..."
docker compose up -d
print_success "Servicios iniciados"

# 8. Esperar a que los servicios estén listos
print_info "Esperando a que los servicios estén listos..."
sleep 10

# 9. Verificar estado de los servicios
print_info "Verificando estado de los servicios..."
docker compose ps

# 10. Ejecutar migraciones de base de datos
print_info "Ejecutando migraciones de base de datos..."
docker compose exec -T backend npx prisma migrate deploy || print_error "Error al ejecutar migraciones"

# 11. Ejecutar seed de base de datos (opcional)
read -p "¿Deseas ejecutar el seed de la base de datos? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    print_info "Ejecutando seed..."
    docker compose exec -T backend npm run db:seed || print_error "Error al ejecutar seed"
    print_success "Seed ejecutado"
fi

# 12. Mostrar logs
print_info "Mostrando logs de los últimos 50 líneas..."
docker compose logs --tail=50

echo ""
print_success "================================"
print_success "DEPLOYMENT COMPLETADO"
print_success "================================"
echo ""
print_info "Para ver logs en tiempo real:"
echo "  docker compose logs -f"
echo ""
print_info "Para detener los servicios:"
echo "  docker compose down"
echo ""
print_info "Para reiniciar un servicio:"
echo "  docker compose restart [backend|frontend|postgres|nginx]"
echo ""
print_info "Para ver el estado:"
echo "  docker compose ps"
echo ""

