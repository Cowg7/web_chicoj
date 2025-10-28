#!/bin/bash

# ================================================
# Script de Configuración SSL con Let's Encrypt
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
║     Configuración SSL - Chicoj System        ║
║           Let's Encrypt / Certbot            ║
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
    print_error "No se encontró archivo .env. Ejecuta primero setup-domain.sh"
    exit 1
fi

source .env

DOMAIN=${DOMAIN:-coopechicoj.com}
SSL_EMAIL=${SSL_EMAIL:-admin@coopechicoj.com}

print_info "Dominio: $DOMAIN"
print_info "Email SSL: $SSL_EMAIL"
echo ""

# Verificar DNS
print_info "Verificando DNS..."
DNS_IP=$(dig +short $DOMAIN | head -n 1)
DNS_WWW=$(dig +short www.$DOMAIN | head -n 1)

if [ -z "$DNS_IP" ]; then
    print_error "El dominio $DOMAIN no resuelve"
    exit 1
fi

print_success "DNS $DOMAIN → $DNS_IP"
print_success "DNS www.$DOMAIN → $DNS_WWW"

# Advertencia sobre Cloudflare Proxy
print_warning "IMPORTANTE: Si estás usando Cloudflare, asegúrate de que:"
print_warning "  1. El proxy esté DESACTIVADO (nube gris) para los registros DNS"
print_warning "  2. Esto es temporal, solo durante la obtención del certificado"
echo ""
read -p "¿Has desactivado el proxy de Cloudflare? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Por favor, desactiva el proxy en Cloudflare y vuelve a ejecutar este script"
    exit 1
fi

# Verificar que nginx está corriendo
print_info "Verificando estado de nginx..."
if ! docker-compose ps | grep nginx | grep -q "Up"; then
    print_warning "Nginx no está corriendo. Iniciando..."
    docker-compose up -d nginx
    sleep 5
fi
print_success "Nginx está corriendo"

# Probar accesibilidad del dominio
print_info "Verificando accesibilidad del dominio..."
if curl -f -s -o /dev/null "http://$DOMAIN/health"; then
    print_success "Dominio accesible por HTTP"
else
    print_error "No se puede acceder al dominio por HTTP"
    print_info "Verifica que:"
    print_info "  1. El DNS esté correctamente configurado"
    print_info "  2. El firewall permita el puerto 80"
    print_info "  3. Nginx esté corriendo correctamente"
    exit 1
fi

# Crear directorios necesarios
mkdir -p certbot/conf certbot/www

# Obtener certificado SSL
print_info "Obteniendo certificado SSL de Let's Encrypt..."
print_warning "Este proceso puede tardar unos minutos..."

# Método 1: Webroot (preferido)
print_info "Intentando método webroot..."
if docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$SSL_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --dry-run; then
    
    print_success "Validación dry-run exitosa. Obteniendo certificado real..."
    
    docker-compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$SSL_EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN" \
        -d "www.$DOMAIN"
    
    print_success "Certificado obtenido exitosamente"
    
else
    print_warning "El método webroot falló. Intentando método standalone..."
    
    # Detener nginx temporalmente
    docker-compose stop nginx
    
    # Método 2: Standalone
    docker-compose run --rm --entrypoint="" certbot \
        certbot certonly \
        --standalone \
        --email "$SSL_EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN" \
        -d "www.$DOMAIN"
    
    print_success "Certificado obtenido exitosamente"
    
    # Reiniciar nginx
    docker-compose up -d nginx
fi

# Verificar certificados
print_info "Verificando certificados..."
if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    print_success "Certificados encontrados en certbot/conf/live/$DOMAIN/"
    ls -lh "certbot/conf/live/$DOMAIN/"
else
    print_error "No se encontraron los certificados"
    exit 1
fi

# Activar configuración HTTPS en nginx
print_info "¿Deseas activar HTTPS en nginx ahora? (recomendado)"
read -p "Activar HTTPS? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Activando configuración HTTPS..."
    
    # Descomentar bloque HTTPS
    sed -i 's/^# server {/server {/g' nginx/conf.d/default.conf
    sed -i 's/^#     /    /g' nginx/conf.d/default.conf
    sed -i 's/^# }/}/g' nginx/conf.d/default.conf
    
    # Agregar redirección HTTP → HTTPS si no existe
    if ! grep -q "return 301 https" nginx/conf.d/default.conf; then
        print_info "Agregando redirección HTTP → HTTPS..."
        sed -i '/server_name.*80;/a \    # Redirigir HTTP a HTTPS\n    location / {\n        return 301 https://$host$request_uri;\n    }\n' nginx/conf.d/default.conf
    fi
    
    print_success "Configuración HTTPS activada"
    
    # Reiniciar nginx
    print_info "Reiniciando nginx..."
    docker-compose restart nginx
    sleep 5
    
    # Verificar HTTPS
    print_info "Verificando HTTPS..."
    if curl -f -s -o /dev/null "https://$DOMAIN/health"; then
        print_success "HTTPS funcionando correctamente"
    else
        print_warning "No se pudo verificar HTTPS"
        print_info "Revisa los logs: docker-compose logs nginx"
    fi
else
    print_info "Puedes activar HTTPS manualmente editando nginx/conf.d/default.conf"
fi

# Configurar renovación automática
print_info "Configurando renovación automática de certificados..."
docker-compose up -d certbot
print_success "Certbot configurado para renovar certificados automáticamente cada 12 horas"

# Backup de certificados
print_info "Creando backup de certificados..."
BACKUP_FILE="certbot-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$BACKUP_FILE" certbot/
print_success "Backup creado: $BACKUP_FILE"

# Resumen final
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  SSL configurado exitosamente${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
print_info "Certificados SSL para: $DOMAIN y www.$DOMAIN"
print_info "Válidos por: 90 días (renovación automática)"
print_info "Backup guardado en: $BACKUP_FILE"
echo ""
print_success "Sitio accesible en:"
echo "  • https://$DOMAIN"
echo "  • https://www.$DOMAIN"
echo ""
print_warning "Próximos pasos (opcional):"
echo "  1. Activa el proxy de Cloudflare (nube naranja) para CDN y protección"
echo "  2. Configura Cloudflare SSL/TLS en modo 'Full (strict)'"
echo "  3. Activa 'Always Use HTTPS' en Cloudflare"
echo ""
print_info "Verifica la calidad SSL en: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""

