#!/bin/bash

# ================================
# DAR PERMISOS DE EJECUCIÓN A SCRIPTS
# ================================

echo "Dando permisos de ejecución a todos los scripts..."

# Scripts principales
chmod +x setup-server.sh
chmod +x deploy.sh

# Scripts de utilidad
chmod +x scripts/backup.sh
chmod +x scripts/restore.sh
chmod +x scripts/logs.sh
chmod +x scripts/status.sh
chmod +x scripts/update.sh
chmod +x scripts/ssl-setup.sh

echo "✅ Permisos configurados correctamente"
echo ""
echo "Scripts disponibles:"
echo "  ./setup-server.sh         - Configurar servidor (primera vez)"
echo "  ./deploy.sh               - Hacer deployment"
echo "  ./scripts/backup.sh       - Hacer backup"
echo "  ./scripts/restore.sh      - Restaurar backup"
echo "  ./scripts/logs.sh         - Ver logs"
echo "  ./scripts/status.sh       - Ver estado"
echo "  ./scripts/update.sh       - Actualizar sistema"
echo "  ./scripts/ssl-setup.sh    - Configurar SSL"

