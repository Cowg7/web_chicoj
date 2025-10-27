#!/bin/bash

# ================================
# FIX DOCKER COMPOSE - Instalación Rápida
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
echo "INSTALAR DOCKER COMPOSE"
echo "================================"
echo ""

# Verificar que se ejecuta como root
if [[ $EUID -ne 0 ]]; then
   print_error "Este script debe ejecutarse como root o con sudo"
   exit 1
fi

# Método 1: Instalar plugin desde apt
print_info "Intentando instalar Docker Compose plugin..."
apt-get update
apt-get install -y docker-compose-plugin docker-buildx-plugin

# Verificar instalación
echo ""
print_info "Verificando instalación..."
if docker compose version &> /dev/null; then
    print_success "¡Docker Compose instalado correctamente!"
    echo ""
    docker compose version
    echo ""
    print_success "Ahora puedes continuar con el deployment:"
    echo "  ./deploy.sh"
    exit 0
fi

# Método 2: Si el método 1 falla, instalar manualmente
print_info "Método 1 falló. Intentando método alternativo..."

# Obtener última versión
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)

if [ -z "$DOCKER_COMPOSE_VERSION" ]; then
    DOCKER_COMPOSE_VERSION="v2.24.5"
    print_info "No se pudo obtener última versión, usando: $DOCKER_COMPOSE_VERSION"
fi

print_info "Descargando Docker Compose $DOCKER_COMPOSE_VERSION..."

# Crear directorio para plugins
mkdir -p /usr/local/lib/docker/cli-plugins
mkdir -p ~/.docker/cli-plugins

# Descargar para sistema
curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose

chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Verificar instalación
echo ""
print_info "Verificando instalación..."
if docker compose version &> /dev/null; then
    print_success "¡Docker Compose instalado correctamente!"
    echo ""
    docker compose version
    echo ""
    print_success "Ahora puedes continuar con el deployment:"
    echo "  ./deploy.sh"
    exit 0
else
    print_error "No se pudo instalar Docker Compose"
    echo ""
    print_info "Por favor, intenta instalarlo manualmente:"
    echo ""
    echo "1. Visita: https://docs.docker.com/compose/install/linux/"
    echo "2. Sigue las instrucciones para Ubuntu"
    echo ""
    exit 1
fi

