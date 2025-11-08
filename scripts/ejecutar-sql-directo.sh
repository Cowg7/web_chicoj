#!/bin/bash

# Script para ejecutar comandos SQL directamente desde la línea de comandos
# Uso: ./scripts/ejecutar-sql-directo.sh "SELECT * FROM usuarios;" [base_de_datos]

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Uso: $0 \"comando_sql\" [base_de_datos]${NC}"
    echo ""
    echo "Ejemplos:"
    echo "  $0 \"SELECT * FROM usuarios;\" restaurante_db"
    echo "  $0 \"SELECT * FROM empleados;\""
    echo "  $0 \"CREATE TABLE test (id INT);\""
    echo ""
    echo "Si no especificas la base de datos, se usará 'restaurante_db'"
    exit 1
fi

SQL_COMMAND=$1
DB_NAME=${2:-restaurante_db}

echo -e "${YELLOW}📝 Ejecutando comando SQL:${NC}"
echo -e "${YELLOW}   $SQL_COMMAND${NC}"
echo -e "${YELLOW}🗄️  Base de datos: $DB_NAME${NC}"
echo ""

# Ejecutar el comando SQL
docker-compose exec -T postgres psql -U postgres -d "$DB_NAME" -c "$SQL_COMMAND"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Comando ejecutado exitosamente${NC}"
else
    echo ""
    echo -e "${RED}❌ Error al ejecutar el comando${NC}"
    exit 1
fi

