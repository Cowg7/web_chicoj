#!/bin/bash

# ================================
# CONFIGURAR SSL CON LET'S ENCRYPT
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
echo "CONFIGURAR SSL CON LET'S ENCRYPT"
echo "================================"
echo ""

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    print_error "Archivo .env no encontrado"
    exit 1
fi

# Leer dominio del .env
DOMAIN=$(grep DOMAIN .env | cut -d '=' -f2)
SSL_EMAIL=$(grep SSL_EMAIL .env | cut -d '=' -f2)

if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "tu-dominio.com" ]; then
    print_error "Por favor configura DOMAIN en el archivo .env"
    exit 1
fi

if [ -z "$SSL_EMAIL" ] || [ "$SSL_EMAIL" = "tu-email@dominio.com" ]; then
    print_error "Por favor configura SSL_EMAIL en el archivo .env"
    exit 1
fi

print_info "Dominio: $DOMAIN"
print_info "Email: $SSL_EMAIL"
echo ""

# Confirmación
read -p "¿Estás seguro de que quieres obtener certificados SSL para $DOMAIN? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_info "Operación cancelada"
    exit 0
fi

# Verificar que el dominio apunta al servidor
print_info "Verificando DNS..."
CURRENT_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)

if [ "$CURRENT_IP" != "$DOMAIN_IP" ]; then
    print_error "El dominio $DOMAIN no apunta a este servidor"
    print_info "IP del servidor: $CURRENT_IP"
    print_info "IP del dominio: $DOMAIN_IP"
    echo ""
    read -p "¿Quieres continuar de todos modos? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        exit 1
    fi
fi

# Detener nginx temporalmente
print_info "Deteniendo nginx..."
docker compose stop nginx

# Obtener certificados
print_info "Obteniendo certificados SSL..."

docker compose run --rm certbot certonly \
  --standalone \
  --email "$SSL_EMAIL" \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

if [ $? -eq 0 ]; then
    print_success "Certificados obtenidos exitosamente"
else
    print_error "Error al obtener certificados"
    docker compose up -d nginx
    exit 1
fi

# Actualizar configuración de nginx
print_info "Configurando nginx para HTTPS..."

# Hacer backup de la configuración actual
cp nginx/conf.d/default.conf nginx/conf.d/default.conf.backup

# Crear nueva configuración con SSL
cat > nginx/conf.d/default.conf <<EOF
# Upstream para el backend
upstream backend {
    server backend:3000;
}

# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Para Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirigir todo a HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # API Backend
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://backend/socket.io/;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
        proxy_buffering off;
    }

    # Frontend (archivos estáticos)
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Cache para archivos estáticos
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # No cache para HTML
        location ~* \.html\$ {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
    }
}
EOF

print_success "Configuración de nginx actualizada"

# Reiniciar nginx
print_info "Reiniciando nginx..."
docker compose up -d nginx

# Esperar un momento
sleep 3

# Verificar que nginx está corriendo
if docker compose ps nginx | grep -q "Up"; then
    print_success "Nginx reiniciado exitosamente"
else
    print_error "Error al reiniciar nginx"
    print_info "Restaurando configuración anterior..."
    mv nginx/conf.d/default.conf.backup nginx/conf.d/default.conf
    docker compose up -d nginx
    exit 1
fi

echo ""
print_success "================================"
print_success "SSL CONFIGURADO EXITOSAMENTE"
print_success "================================"
echo ""
print_info "Tu sitio ahora está disponible en:"
echo "  https://$DOMAIN"
echo ""
print_info "Los certificados se renovarán automáticamente."
echo ""
print_info "Verifica tu configuración en:"
echo "  https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"

