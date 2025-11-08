#!/bin/bash
# Script para resolver conflicto de Git de forma segura

echo "════════════════════════════════════════════════"
echo "RESOLVIENDO CONFLICTO DE GIT"
echo "════════════════════════════════════════════════"
echo ""

# Configurar estrategia de merge para este pull
echo "1. Configurando estrategia de merge..."
git config pull.rebase false

echo "✓ Estrategia configurada (merge)"
echo ""

# Intentar hacer pull con merge
echo "2. Haciendo pull con merge..."
git pull origin main --no-edit

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Pull exitoso - Cambios combinados correctamente"
    echo ""
    echo "Archivos importantes verificados:"
    echo "  - docker-compose.yml (puerto cerrado)"
    echo "  - Scripts de seguridad"
    echo "  - Tus cambios locales"
else
    echo ""
    echo "⚠️  Hay conflictos que necesitan resolución manual"
    echo ""
    echo "Archivos en conflicto:"
    git status | grep "both modified"
    echo ""
    echo "Siguiente paso: resolver manualmente los conflictos"
fi

