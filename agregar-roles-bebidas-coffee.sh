#!/bin/bash

# Script para agregar roles "Bebidas" y "Coffee"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  🎯 AGREGAR ROLES 'BEBIDAS' Y 'COFFEE'${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# Verificar Docker
echo -e "${YELLOW}📦 Verificando Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "   ${GREEN}✅ Docker está disponible${NC}"
    docker --version
else
    echo -e "   ${RED}❌ Docker no está disponible${NC}"
    exit 1
fi

echo ""

# Verificar PostgreSQL
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
echo -e "${YELLOW}🚀 Agregando roles 'Bebidas' y 'Coffee'...${NC}"
echo ""

if [ -f "agregar-roles-bebidas-coffee.sql" ]; then
    echo -e "   ${CYAN}📄 Usando archivo agregar-roles-bebidas-coffee.sql${NC}"
    docker exec -i $POSTGRES_CONTAINER psql -U postgres -d restaurante_db < agregar-roles-bebidas-coffee.sql
else
    echo -e "   ${CYAN}⚡ Ejecutando comandos directos${NC}"
    SQL_COMMAND="
INSERT INTO roles (nombre_rol, descripcion) 
VALUES 
  ('Bebidas', 'KDS de bebidas (bar y bebidas frías)'),
  ('Coffee', 'KDS de coffee shop (café y postres)')
ON CONFLICT (nombre_rol) DO NOTHING;

SELECT id_rol, nombre_rol, descripcion 
FROM roles 
WHERE nombre_rol IN ('Bebidas', 'Coffee')
ORDER BY nombre_rol;
"
    echo "$SQL_COMMAND" | docker exec -i $POSTGRES_CONTAINER psql -U postgres -d restaurante_db
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "   ${GREEN}✅ Comandos ejecutados correctamente${NC}"
else
    echo ""
    echo -e "   ${RED}❌ Error al ejecutar los comandos${NC}"
    exit 1
fi

echo ""

# Verificar todos los roles
echo -e "${YELLOW}🔍 Verificando todos los roles...${NC}"
echo ""

docker exec $POSTGRES_CONTAINER psql -U postgres -d restaurante_db -c "SELECT id_rol, nombre_rol, descripcion FROM roles ORDER BY id_rol;"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  ✅ PROCESO COMPLETADO${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

echo -e "${CYAN}📋 Roles agregados:${NC}"
echo -e "   ${GRAY}✅ Bebidas - KDS de bebidas (bar)${NC}"
echo -e "   ${GRAY}✅ Coffee - KDS de coffee shop (café y postres)${NC}"
echo ""

echo -e "${CYAN}📱 Ahora puedes:${NC}"
echo -e "   ${GRAY}1. Crear usuarios con estos roles${NC}"
echo -e "   ${GRAY}2. Asignar áreas de trabajo (Bebidas/Coffee)${NC}"
echo -e "   ${GRAY}3. Acceder a sus KDS específicas${NC}"
echo ""




