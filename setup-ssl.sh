#!/bin/bash

# ================================
# Setup SSL para Chicoj System
# ================================

set -e

DOMAIN="${1:-coopechicoj.net}"
EMAIL="${2:-admin@coopechicoj.net}"

echo "================================"
echo "CONFIGURACIÓN DE SSL"
echo "================================"
echo ""
echo "Dominio: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que el dominio apunte al servidor
echo -e "${YELLOW}ℹ Verificando DNS...${NC}"
CURRENT_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN | head -n1)

if [ -z "$DOMAIN_IP" ]; then
    echo -e "${RED}✗ Error: El dominio $DOMAIN no resuelve a ninguna IP${NC}"
    echo "Por favor, configura los registros DNS en DigitalOcean antes de continuar."
    exit 1
fi

if [ "$CURRENT_IP" != "$DOMAIN_IP" ]; then
    echo -e "${YELLOW}⚠ Advertencia: El dominio $DOMAIN apunta a $DOMAIN_IP pero tu servidor es $CURRENT_IP${NC}"
    echo "Los certificados SSL podrían fallar. ¿Deseas continuar de todos modos? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Abortando..."
        exit 1
    fi
else
    echo -e "${GREEN}✓ DNS configurado correctamente${NC}"
fi

# Verificar que Nginx esté corriendo
echo -e "${YELLOW}ℹ Verificando Nginx...${NC}"
if ! docker-compose ps | grep -q "chicoj-nginx.*Up"; then
    echo -e "${RED}✗ Error: Nginx no está corriendo${NC}"
    echo "Ejecuta primero: docker-compose up -d"
    exit 1
fi
echo -e "${GREEN}✓ Nginx está corriendo${NC}"

# Crear directorios necesarios
echo -e "${YELLOW}ℹ Creando directorios...${NC}"
mkdir -p certbot/conf certbot/www
echo -e "${GREEN}✓ Directorios creados${NC}"

# Detener certbot si está corriendo
echo -e "${YELLOW}ℹ Deteniendo certbot...${NC}"
docker-compose stop certbot 2>/dev/null || true

# Obtener certificado SSL
echo -e "${YELLOW}ℹ Solicitando certificado SSL de Let's Encrypt...${NC}"
echo "Esto puede tardar unos minutos..."

docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN \
    -d www.$DOMAIN

# Verificar que los certificados se crearon
if [ ! -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${RED}✗ Error: No se pudieron obtener los certificados SSL${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Certificados SSL obtenidos exitosamente${NC}"

# Descomentar configuración HTTPS en Nginx
echo -e "${YELLOW}ℹ Activando HTTPS en Nginx...${NC}"

# Hacer backup de la configuración actual
cp nginx/conf.d/default.conf nginx/conf.d/default.conf.backup

# Descomentar bloque HTTPS
sed -i 's/^# server {/server {/g' nginx/conf.d/default.conf
sed -i 's/^#     /    /g' nginx/conf.d/default.conf
sed -i 's/^# }/}/g' nginx/conf.d/default.conf

echo -e "${GREEN}✓ Configuración HTTPS activada${NC}"

# Reiniciar Nginx
echo -e "${YELLOW}ℹ Reiniciando Nginx...${NC}"
docker-compose restart nginx
sleep 5

# Verificar que Nginx esté saludable
if docker-compose ps | grep -q "chicoj-nginx.*Up.*healthy"; then
    echo -e "${GREEN}✓ Nginx reiniciado correctamente${NC}"
else
    echo -e "${RED}✗ Error: Nginx no está saludable${NC}"
    echo "Restaurando configuración anterior..."
    mv nginx/conf.d/default.conf.backup nginx/conf.d/default.conf
    docker-compose restart nginx
    exit 1
fi

# Iniciar certbot para renovación automática
echo -e "${YELLOW}ℹ Iniciando servicio de renovación automática...${NC}"
docker-compose up -d certbot
echo -e "${GREEN}✓ Renovación automática configurada${NC}"

# Agregar redirect HTTP a HTTPS
echo -e "${YELLOW}ℹ Configurando redirect HTTP → HTTPS...${NC}"
cat > nginx/conf.d/redirect.conf << 'EOF'
# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name coopechicoj.net www.coopechicoj.net;

    # Excepto para Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirigir todo lo demás a HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}
EOF

docker-compose restart nginx
sleep 3

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ ¡SSL CONFIGURADO EXITOSAMENTE!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Tu sitio ahora está disponible en:"
echo -e "${GREEN}• https://$DOMAIN${NC}"
echo -e "${GREEN}• https://www.$DOMAIN${NC}"
echo ""
echo "Los certificados se renovarán automáticamente cada 90 días."
echo ""
echo "Para verificar el estado de SSL:"
echo "  https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""

