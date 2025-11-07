#!/bin/bash

# ================================================
# Script de Verificación de Dominio y SSL
# Chicoj Restaurant System
# ================================================

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
║   Verificación de Sistema - Chicoj           ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Cargar variables de entorno
if [ -f ".env" ]; then
    source .env
fi

DOMAIN=${DOMAIN:-coopechicoj.com}

echo "═══════════════════════════════════════════════"
echo " 1. VERIFICACIÓN DE DNS"
echo "═══════════════════════════════════════════════"

# Verificar DNS
print_info "Consultando DNS para $DOMAIN..."
DNS_IP=$(dig +short $DOMAIN | head -n 1)
DNS_WWW=$(dig +short www.$DOMAIN | head -n 1)

if [ -z "$DNS_IP" ]; then
    print_error "El dominio $DOMAIN no resuelve"
else
    print_success "$DOMAIN → $DNS_IP"
fi

if [ -z "$DNS_WWW" ]; then
    print_error "www.$DOMAIN no resuelve"
else
    print_success "www.$DOMAIN → $DNS_WWW"
fi

# IP del servidor
SERVER_IP=$(curl -s ifconfig.me)
print_info "IP del servidor: $SERVER_IP"

if [ "$DNS_IP" == "$SERVER_IP" ]; then
    print_success "DNS apunta directamente al servidor (Cloudflare proxy OFF)"
else
    print_warning "DNS no coincide con IP del servidor (posiblemente Cloudflare proxy ON)"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo " 2. VERIFICACIÓN DE PUERTOS"
echo "═══════════════════════════════════════════════"

# Verificar puerto 80
print_info "Verificando puerto 80 (HTTP)..."
if netstat -tuln | grep -q ':80 '; then
    print_success "Puerto 80 en uso"
else
    print_warning "Puerto 80 no está en uso"
fi

# Verificar puerto 443
print_info "Verificando puerto 443 (HTTPS)..."
if netstat -tuln | grep -q ':443 '; then
    print_success "Puerto 443 en uso"
else
    print_warning "Puerto 443 no está en uso"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo " 3. VERIFICACIÓN DE CONTENEDORES"
echo "═══════════════════════════════════════════════"

# Verificar contenedores
print_info "Estado de contenedores Docker:"
docker-compose ps

echo ""

# Verificar cada servicio
services=("postgres" "backend" "nginx" "certbot")
for service in "${services[@]}"; do
    if docker-compose ps | grep "$service" | grep -q "Up"; then
        print_success "$service está corriendo"
    else
        print_error "$service NO está corriendo"
    fi
done

echo ""
echo "═══════════════════════════════════════════════"
echo " 4. VERIFICACIÓN DE ACCESIBILIDAD"
echo "═══════════════════════════════════════════════"

# Verificar HTTP
print_info "Probando HTTP..."
if curl -f -s -o /dev/null -w "%{http_code}" "http://$DOMAIN/health" | grep -q "200"; then
    print_success "HTTP accesible (http://$DOMAIN)"
else
    print_error "HTTP no accesible"
fi

# Verificar HTTPS
print_info "Probando HTTPS..."
if curl -f -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/health" 2>/dev/null | grep -q "200"; then
    print_success "HTTPS accesible (https://$DOMAIN)"
else
    print_warning "HTTPS no accesible (puede que aún no esté configurado)"
fi

# Verificar API
print_info "Probando API..."
if curl -f -s -o /dev/null "http://$DOMAIN/api/health" 2>/dev/null; then
    print_success "API accesible (http://$DOMAIN/api/health)"
else
    print_warning "API no accesible"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo " 5. VERIFICACIÓN DE CERTIFICADOS SSL"
echo "═══════════════════════════════════════════════"

# Verificar certificados
if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    print_success "Certificados SSL encontrados"
    
    # Información del certificado
    print_info "Información del certificado:"
    openssl x509 -in "certbot/conf/live/$DOMAIN/fullchain.pem" -noout -dates 2>/dev/null || echo "No se pudo leer el certificado"
else
    print_warning "No se encontraron certificados SSL"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo " 6. VERIFICACIÓN DE LOGS (ÚLTIMAS 10 LÍNEAS)"
echo "═══════════════════════════════════════════════"

print_info "Logs de Nginx:"
docker-compose logs --tail=10 nginx | tail -5

print_info "Logs de Backend:"
docker-compose logs --tail=10 backend | tail -5

echo ""
echo "═══════════════════════════════════════════════"
echo " RESUMEN"
echo "═══════════════════════════════════════════════"

echo ""
print_info "URLs del sitio:"
echo "  • http://$DOMAIN"
echo "  • https://$DOMAIN"
echo "  • http://www.$DOMAIN"
echo "  • https://www.$DOMAIN"

echo ""
print_info "Herramientas de verificación externa:"
echo "  • DNS: https://dnschecker.org/#A/$DOMAIN"
echo "  • SSL: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "  • Velocidad: https://pagespeed.web.dev/analysis?url=https://$DOMAIN"

echo ""
print_info "Comandos útiles:"
echo "  • Ver logs: docker-compose logs -f"
echo "  • Reiniciar: docker-compose restart"
echo "  • Estado: docker-compose ps"

echo ""

