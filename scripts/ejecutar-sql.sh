#!/bin/bash

# Script para ejecutar un archivo SQL en PostgreSQL
# Uso: ./scripts/ejecutar-sql.sh [archivo.sql] [base_de_datos]

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Uso: $0 [archivo.sql] [base_de_datos]${NC}"
    echo ""
    echo "Ejemplos:"
    echo "  $0 mi-script.sql restaurante_db"
    echo "  $0 mi-script.sql postgres"
    echo ""
    echo "Si no especificas la base de datos, se usará 'restaurante_db'"
    exit 1
fi

SQL_FILE=$1
DB_NAME=${2:-restaurante_db}

# Verificar que el archivo existe
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}❌ Error: El archivo '$SQL_FILE' no existe${NC}"
    exit 1
fi

echo -e "${YELLOW}📄 Ejecutando script SQL: $SQL_FILE${NC}"
echo -e "${YELLOW}🗄️  Base de datos: $DB_NAME${NC}"
echo ""

# Ejecutar el script SQL
docker-compose exec -T postgres psql -U postgres -d "$DB_NAME" < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Script ejecutado exitosamente${NC}"
else
    echo ""
    echo -e "${RED}❌ Error al ejecutar el script${NC}"
    exit 1
fi

