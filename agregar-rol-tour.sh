#!/bin/bash

# Script para agregar el rol "Tour"
# Ejecutar desde la raíz del proyecto

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}===============================================${NC}"
echo -e "${CYAN}  🎯 AGREGAR ROL 'TOUR' A LA BASE DE DATOS${NC}"
echo -e "${CYAN}===============================================${NC}"
echo ""

# Verificar si Docker está corriendo
echo -e "${YELLOW}📦 Verificando Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "   ${GREEN}✅ Docker está disponible${NC}"
    docker --version
else
    echo -e "   ${RED}❌ Docker no está disponible${NC}"
    exit 1
fi

echo ""

# Verificar si el contenedor de PostgreSQL está corriendo
echo -e "${YELLOW}🐘 Verificando PostgreSQL...${NC}"
POSTGRES_CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -n 1)

if [ -n "$POSTGRES_CONTAINER" ]; then
    echo -e "   ${GREEN}✅ PostgreSQL está corriendo: $POSTGRES_CONTAINER${NC}"
else
    echo -e "   ${RED}❌ PostgreSQL NO está corriendo${NC}"
    echo -e "   ${YELLOW}💡 Inicia el contenedor: docker-compose up -d postgres${NC}"
    exit 1
fi

echo ""

# Ejecutar el script SQL
echo -e "${YELLOW}🚀 Agregando rol 'Tour'...${NC}"
echo ""

# Opción 1: Usar el archivo SQL si existe
if [ -f "agregar-rol-tour.sql" ]; then
    echo -e "   ${CYAN}📄 Usando archivo agregar-rol-tour.sql${NC}"
    docker exec -i $POSTGRES_CONTAINER psql -U postgres -d restaurante_db < agregar-rol-tour.sql
else
    # Opción 2: Comando directo
    echo -e "   ${CYAN}⚡ Ejecutando comando directo${NC}"
    SQL_COMMAND="
INSERT INTO roles (nombre_rol, descripcion) 
VALUES ('Tour', 'Gestión de tours y grupos turísticos') 
ON CONFLICT (nombre_rol) DO NOTHING;

SELECT 
    id_rol,
    nombre_rol,
    descripcion
FROM roles
WHERE nombre_rol = 'Tour';
"
    echo "$SQL_COMMAND" | docker exec -i $POSTGRES_CONTAINER psql -U postgres -d restaurante_db
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "   ${GREEN}✅ Comando ejecutado correctamente${NC}"
else
    echo ""
    echo -e "   ${RED}❌ Error al ejecutar el comando${NC}"
    exit 1
fi

echo ""

# Verificar el resultado
echo -e "${YELLOW}🔍 Verificando todos los roles...${NC}"
echo ""

docker exec $POSTGRES_CONTAINER psql -U postgres -d restaurante_db -c "SELECT id_rol, nombre_rol, descripcion FROM roles ORDER BY id_rol;"

echo ""
echo -e "${GREEN}===============================================${NC}"
echo -e "${GREEN}  ✅ PROCESO COMPLETADO${NC}"
echo -e "${GREEN}===============================================${NC}"
echo ""

echo -e "${CYAN}📋 Próximos pasos:${NC}"
echo -e "   ${GRAY}1. El rol 'Tour' ya está disponible${NC}"
echo -e "   ${GRAY}2. Puedes crear usuarios con este rol desde:${NC}"
echo -e "      👉 Panel de administración > Gestionar Usuarios"
echo ""






