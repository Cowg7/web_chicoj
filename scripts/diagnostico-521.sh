#!/bin/bash

# Script de diagnóstico para error 521 de Cloudflare
# Uso: ./diagnostico-521.sh

set -e

echo "=========================================="
echo "DIAGNÓSTICO ERROR 521 CLOUDFLARE"
echo "=========================================="
echo ""

cd /opt/chicoj

echo "1. Verificando estado de contenedores Docker..."
echo "--------------------------------------------"
docker-compose ps
echo ""

echo "2. Verificando si los contenedores están corriendo..."
echo "--------------------------------------------"
if docker ps | grep -q chicoj-nginx; then
    echo "✓ Nginx está corriendo"
else
    echo "✗ Nginx NO está corriendo"
fi

if docker ps | grep -q chicoj-backend; then
    echo "✓ Backend está corriendo"
else
    echo "✗ Backend NO está corriendo"
fi

if docker ps | grep -q chicoj-postgres; then
    echo "✓ PostgreSQL está corriendo"
else
    echo "✗ PostgreSQL NO está corriendo"
fi
echo ""

echo "3. Verificando puertos expuestos..."
echo "--------------------------------------------"
netstat -tuln | grep -E ':(80|443)' || echo "⚠️  No se encontraron puertos 80 o 443 escuchando"
echo ""

echo "4. Verificando logs de Nginx (últimas 20 líneas)..."
echo "--------------------------------------------"
docker logs --tail 20 chicoj-nginx 2>&1 || echo "⚠️  No se pueden obtener logs de nginx"
echo ""

echo "5. Verificando logs de Backend (últimas 20 líneas)..."
echo "--------------------------------------------"
docker logs --tail 20 chicoj-backend 2>&1 || echo "⚠️  No se pueden obtener logs de backend"
echo ""

echo "6. Verificando si Nginx responde localmente..."
echo "--------------------------------------------"
if curl -f -s http://localhost/health > /dev/null 2>&1; then
    echo "✓ Nginx responde en localhost"
    curl -v http://localhost/health 2>&1 | head -20
else
    echo "✗ Nginx NO responde en localhost"
fi
echo ""

echo "7. Verificando configuración de red Docker..."
echo "--------------------------------------------"
docker network inspect chicoj_chicoj-network 2>/dev/null || docker network inspect chicoj-network 2>/dev/null || echo "⚠️  Red no encontrada"
echo ""

echo "8. Verificando configuración de Cloudflare..."
echo "--------------------------------------------"
echo "⚠️  VERIFICA EN EL DASHBOARD DE CLOUDFLARE:"
echo "   - El DNS debe apuntar a tu IP del servidor: 165.227.103.238"
echo "   - El modo Proxy (nube naranja) debe estar ACTIVADO"
echo "   - SSL/TLS debe estar en modo 'Flexible' o 'Full'"
echo "   - Si usas HTTPS en Cloudflare, el servidor debe responder en HTTP o tener certificados SSL"
echo ""

echo "9. Verificando acceso desde fuera (puerto 80)..."
echo "--------------------------------------------"
EXTERNAL_IP=$(curl -s ifconfig.me || curl -s icanhazip.com)
echo "IP externa del servidor: $EXTERNAL_IP"
if timeout 2 bash -c "echo > /dev/tcp/$EXTERNAL_IP/80" 2>/dev/null; then
    echo "✓ Puerto 80 es accesible desde fuera"
else
    echo "✗ Puerto 80 NO es accesible desde fuera (puede ser firewall)"
    echo "  Verifica tu firewall: sudo ufw status"
fi
echo ""

echo "10. Comprobando healthcheck de Nginx..."
echo "--------------------------------------------"
docker exec chicoj-nginx wget --no-verbose --tries=1 --spider http://localhost/health 2>&1 || echo "✗ Healthcheck falló"
echo ""

echo "=========================================="
echo "RESUMEN DE ACCIONES RECOMENDADAS:"
echo "=========================================="
echo ""
echo "Si los contenedores no están corriendo:"
echo "  docker-compose up -d"
echo ""
echo "Si hay errores en los logs:"
echo "  docker logs chicoj-nginx"
echo "  docker logs chicoj-backend"
echo ""
echo "Si el puerto 80 no es accesible:"
echo "  sudo ufw allow 80/tcp"
echo "  sudo ufw allow 443/tcp"
echo ""
echo "Si Cloudflare está en modo HTTPS pero el servidor solo tiene HTTP:"
echo "  - Cambia SSL/TLS a modo 'Flexible' en Cloudflare"
echo "  - O configura SSL en el servidor"
echo ""
echo "Para reiniciar todos los servicios:"
echo "  docker-compose restart"
echo ""


