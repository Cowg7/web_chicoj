#!/bin/bash

# Script para hacer backup completo de la base de datos

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
BACKUP_FILE="backup_restaurante_db_$FECHA.sql"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  📦 BACKUP DE BASE DE DATOS${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# Crear directorio de backups
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    echo -e "${GREEN}✅ Directorio de backups creado: $BACKUP_DIR${NC}"
fi

echo ""

# Verificar Docker
echo -e "${YELLOW}📦 Verificando Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "   ${GREEN}✅ Docker disponible${NC}"
else
    echo -e "   ${RED}❌ Docker no está disponible${NC}"
    exit 1
fi

echo ""

# Verificar PostgreSQL
echo -e "${YELLOW}🐘 Verificando PostgreSQL...${NC}"
POSTGRES_CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -n 1)

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo -e "   ${RED}❌ PostgreSQL NO está corriendo${NC}"
    echo -e "   ${YELLOW}💡 Inicia el contenedor: docker-compose up -d postgres${NC}"
    exit 1
fi

echo -e "   ${GREEN}✅ PostgreSQL corriendo: $POSTGRES_CONTAINER${NC}"
echo ""

# Hacer backup
echo -e "${YELLOW}🔄 Creando backup de la base de datos...${NC}"
echo -e "   ${CYAN}📄 Archivo: $BACKUP_FILE${NC}"

docker exec $POSTGRES_CONTAINER pg_dump -U postgres restaurante_db > "$BACKUP_PATH"

if [ $? -eq 0 ] && [ -f "$BACKUP_PATH" ]; then
    FILE_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    echo ""
    echo -e "   ${GREEN}✅ Backup creado exitosamente${NC}"
    echo -e "   ${GRAY}📊 Tamaño: $FILE_SIZE${NC}"
else
    echo ""
    echo -e "   ${RED}❌ Error al crear el backup${NC}"
    exit 1
fi

echo ""

# Información del backup
echo -e "${CYAN}📋 Información del backup:${NC}"
echo -e "   ${GRAY}📁 Ubicación: $BACKUP_PATH${NC}"
echo -e "   ${GRAY}📅 Fecha: $(date '+%Y-%m-%d %H:%M:%S')${NC}"

# Verificar contenido
echo ""
echo -e "${YELLOW}🔍 Verificando contenido...${NC}"
LINE_COUNT=$(wc -l < "$BACKUP_PATH")
echo -e "   ${GREEN}✅ $LINE_COUNT líneas en el archivo${NC}"

TABLE_COUNT=$(grep -c "CREATE TABLE" "$BACKUP_PATH")
echo -e "   ${GREEN}✅ $TABLE_COUNT tablas incluidas${NC}"

echo ""

# Comprimir el backup (opcional)
echo -e "${YELLOW}📦 ¿Comprimir el backup para envío? (Recomendado)${NC}"
echo -e "   ${GRAY}Esto reduce el tamaño del archivo para enviarlo${NC}"
read -p "   ¿Comprimir? (s/n): " COMPRESS

if [ "$COMPRESS" = "s" ] || [ "$COMPRESS" = "S" ] || [ "$COMPRESS" = "y" ] || [ "$COMPRESS" = "Y" ]; then
    ZIP_FILE="$BACKUP_DIR/backup_restaurante_db_$FECHA.tar.gz"
    echo ""
    echo -e "   ${CYAN}🔄 Comprimiendo...${NC}"
    
    tar -czf "$ZIP_FILE" -C "$BACKUP_DIR" "$BACKUP_FILE"
    
    if [ -f "$ZIP_FILE" ]; then
        ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
        echo -e "   ${GREEN}✅ Archivo comprimido: $ZIP_FILE${NC}"
        echo -e "   ${GRAY}📊 Tamaño: $ZIP_SIZE${NC}"
        echo ""
        echo -e "   ${YELLOW}💡 Envía este archivo: $ZIP_FILE${NC}"
    fi
else
    echo ""
    echo -e "   ${YELLOW}💡 Envía este archivo: $BACKUP_PATH${NC}"
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  ✅ BACKUP COMPLETADO${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

echo -e "${CYAN}📤 PRÓXIMOS PASOS:${NC}"
echo -e "   ${GRAY}1. Envía el archivo de backup al equipo de producción${NC}"
echo -e "   ${GRAY}2. Adjunta también: RESTAURAR_BACKUP_EN_PRODUCCION.md${NC}"
echo -e "   ${GRAY}3. Ellos deben seguir las instrucciones de restauración${NC}"
echo ""

echo -e "${CYAN}📁 ARCHIVOS CREADOS:${NC}"
echo -e "   ${GRAY}• $BACKUP_PATH${NC}"
if [ -f "$BACKUP_DIR/backup_restaurante_db_$FECHA.tar.gz" ]; then
    echo -e "   ${GRAY}• $BACKUP_DIR/backup_restaurante_db_$FECHA.tar.gz${NC}"
fi
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "   ${GRAY}Este backup incluye TODA la base de datos:${NC}"
echo -e "   ${GRAY}• Todas las tablas${NC}"
echo -e "   ${GRAY}• Todos los datos${NC}"
echo -e "   ${GRAY}• Estructura completa${NC}"
echo ""




