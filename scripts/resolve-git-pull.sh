#!/bin/bash

# Script para resolver conflictos de git pull en el servidor
# Uso: ./resolve-git-pull.sh

set -e

echo "=== Verificando cambios locales en nginx/conf.d/default.conf ==="
cd /opt/chicoj

# Ver qué cambios hay localmente
echo ""
echo "Cambios locales encontrados:"
git diff nginx/conf.d/default.conf

echo ""
read -p "¿Deseas guardar estos cambios antes de hacer pull? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "Guardando cambios en stash..."
    git stash push -m "Cambios locales de nginx config - $(date '+%Y-%m-%d %H:%M:%S')" nginx/conf.d/default.conf
    echo "✓ Cambios guardados en stash"
    
    echo ""
    echo "Haciendo pull..."
    git pull origin main
    echo "✓ Pull completado"
    
    echo ""
    read -p "¿Deseas restaurar los cambios guardados? (s/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "Restaurando cambios..."
        if git stash pop; then
            echo "✓ Cambios restaurados"
            echo ""
            echo "⚠️  ATENCIÓN: Revisa los cambios manualmente y resuelve cualquier conflicto"
            echo "Archivo: nginx/conf.d/default.conf"
        else
            echo "✗ Hubo conflictos al restaurar. Revisa manualmente con: git stash list"
        fi
    else
        echo "Cambios guardados en stash. Para verlos: git stash list"
        echo "Para restaurarlos después: git stash pop"
    fi
else
    echo "Descartando cambios locales..."
    git checkout -- nginx/conf.d/default.conf
    echo "✓ Cambios descartados"
    
    echo ""
    echo "Haciendo pull..."
    git pull origin main
    echo "✓ Pull completado"
fi

echo ""
echo "=== Proceso completado ==="


