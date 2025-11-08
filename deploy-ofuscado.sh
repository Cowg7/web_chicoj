#!/bin/bash

# SCRIPT DE DEPLOYMENT CON CÓDIGO OFUSCADO
# Genera archivos ofuscados y los despliega en Docker

set -e  # Salir si hay error

echo "🚀 DEPLOYMENT CON CÓDIGO OFUSCADO"
echo "=================================="
echo ""

# Paso 1: Generar archivos ofuscados
echo "📦 Paso 1/4: Generando código ofuscado..."
node chicoj-frontend/build-production.js

if [ ! -d "chicoj-frontend/dist/scripts" ]; then
  echo "❌ Error: No se generaron los archivos ofuscados"
  exit 1
fi

# Paso 2: Copiar dist/ al volumen de Docker
echo "📂 Paso 2/4: Copiando archivos al contenedor..."

# Crear carpeta dist en el volumen si no existe
docker exec chicoj-nginx mkdir -p /usr/share/nginx/html/dist

# Copiar archivos ofuscados
docker cp chicoj-frontend/dist/. chicoj-nginx:/usr/share/nginx/html/dist/

echo "✅ Archivos copiados correctamente"

# Paso 3: Reiniciar Nginx
echo "🔄 Paso 3/4: Reiniciando Nginx..."
docker compose restart nginx

sleep 2

# Paso 4: Verificar
echo "✅ Paso 4/4: Verificando deployment..."

# Verificar que Nginx está corriendo
if docker ps | grep -q chicoj-nginx; then
  echo "✅ Nginx está corriendo"
else
  echo "❌ Error: Nginx no está corriendo"
  exit 1
fi

# Verificar archivos en el contenedor
SCRIPT_COUNT=$(docker exec chicoj-nginx find /usr/share/nginx/html/dist/scripts -name "*.js" | wc -l)
CSS_COUNT=$(docker exec chicoj-nginx find /usr/share/nginx/html/dist/css -name "*.css" | wc -l)

echo ""
echo "=================================="
echo "📊 RESUMEN DEL DEPLOYMENT:"
echo "=================================="
echo "   📜 Archivos JS ofuscados: $SCRIPT_COUNT"
echo "   🎨 Archivos CSS minificados: $CSS_COUNT"
echo "   🌐 URL: http://localhost"
echo "=================================="
echo ""
echo "✅ Deployment completado exitosamente!"
echo ""
echo "📝 Nota: Recarga la página con Ctrl+Shift+R para limpiar cache"
echo ""



