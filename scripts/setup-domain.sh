#!/bin/bash

# ================================================
# Script de Configuración de Dominio
# Chicoj Restaurant System
# ================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════╗
║   Configuración de Dominio - Chicoj System   ║
║              coopechicoj.com                  ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# Cargar variables de entorno
if [ ! -f ".env" ]; then
    print_warning "No se encontró archivo .env"
    print_info "Copiando env.example a .env..."
    cp env.example .env
    print_warning "Por favor, edita el archivo .env con tus valores antes de continuar"
    exit 1
fi

source .env

# Verificar DNS
print_info "Verificando configuración DNS..."
DOMAIN=${DOMAIN:-coopechicoj.com}
DNS_IP=$(dig +short $DOMAIN | head -n 1)

if [ -z "$DNS_IP" ]; then
    print_error "El dominio $DOMAIN no resuelve a ninguna IP"
    print_info "Asegúrate de haber configurado los registros DNS en Cloudflare"
    exit 1
fi

print_success "DNS resuelve a: $DNS_IP"

# Obtener IP del servidor
SERVER_IP=$(curl -s ifconfig.me)
print_info "IP del servidor: $SERVER_IP"

if [ "$DNS_IP" != "$SERVER_IP" ]; then
    print_warning "La IP del DNS ($DNS_IP) no coincide con la IP del servidor ($SERVER_IP)"
    print_info "Esto es normal si estás usando Cloudflare Proxy (nube naranja)"
    read -p "¿Deseas continuar? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verificar que el puerto 80 está libre
print_info "Verificando disponibilidad del puerto 80..."
if netstat -tuln | grep -q ':80 '; then
    print_warning "El puerto 80 está en uso"
    print_info "Deteniendo servicios que puedan estar usando el puerto 80..."
    
    # Detener posibles servicios
    systemctl stop apache2 2>/dev/null || true
    systemctl stop nginx 2>/dev/null || true
    
    # Detener contenedores actuales
    docker-compose down 2>/dev/null || true
    
    print_success "Servicios detenidos"
else
    print_success "Puerto 80 disponible"
fi

# Verificar que el puerto 443 está libre
print_info "Verificando disponibilidad del puerto 443..."
if netstat -tuln | grep -q ':443 '; then
    print_warning "El puerto 443 está en uso"
    docker-compose down 2>/dev/null || true
else
    print_success "Puerto 443 disponible"
fi

# Actualizar configuración de nginx
print_info "Verificando configuración de nginx..."
if grep -q "coopechicoj.com" nginx/conf.d/default.conf; then
    print_success "Configuración de nginx actualizada"
else
    print_error "El archivo nginx/conf.d/default.conf no está configurado correctamente"
    exit 1
fi

# Crear directorios necesarios
print_info "Creando directorios necesarios..."
mkdir -p certbot/conf certbot/www
print_success "Directorios creados"

# Detener servicios existentes
print_info "Deteniendo servicios existentes..."
docker-compose down
print_success "Servicios detenidos"

# Iniciar servicios
print_info "Iniciando servicios..."
docker-compose up -d postgres backend nginx
print_success "Servicios iniciados"

# Esperar a que los servicios estén listos
print_info "Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
print_info "Verificando estado de los servicios..."
if docker-compose ps | grep -q "Up"; then
    print_success "Servicios en ejecución"
    docker-compose ps
else
    print_error "Algunos servicios no están en ejecución"
    docker-compose ps
    exit 1
fi

# Probar conectividad
print_info "Probando conectividad HTTP..."
if curl -f -s -o /dev/null "http://$DOMAIN/health"; then
    print_success "Sitio accesible por HTTP"
else
    print_warning "No se pudo acceder al sitio por HTTP"
    print_info "Esto puede ser normal si aún no se ha propagado el DNS"
fi

# Resumen
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Configuración inicial completada${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
print_info "Dominio: $DOMAIN"
print_info "DNS IP: $DNS_IP"
print_info "Servidor IP: $SERVER_IP"
echo ""
print_warning "Próximos pasos:"
echo "  1. Verifica que el sitio esté accesible en http://$DOMAIN"
echo "  2. Ejecuta ./scripts/setup-ssl-certbot.sh para configurar HTTPS"
echo "  3. Después de obtener SSL, activa el bloque HTTPS en nginx/conf.d/default.conf"
echo ""

