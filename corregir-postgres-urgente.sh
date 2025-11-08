#!/bin/bash
# Corrección urgente para error de initdb

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}════════════════════════════════════════${NC}"
echo -e "${RED}CORRECCIÓN DE ERROR DE POSTGRES${NC}"
echo -e "${RED}════════════════════════════════════════${NC}"
echo ""

# 1. Detener contenedores
echo -e "${YELLOW}[1/6] Deteniendo contenedores...${NC}"
docker compose down
echo -e "${GREEN}✓ Contenedores detenidos${NC}"
echo ""

# 2. Corregir docker-compose.yml
echo -e "${YELLOW}[2/6] Corrigiendo docker-compose.yml...${NC}"
if grep -q "POSTGRES_INITDB_ARGS" docker-compose.yml; then
    # Eliminar las líneas problemáticas
    sed -i '/POSTGRES_INITDB_ARGS/d' docker-compose.yml
    sed -i '/Configuraciones de PostgreSQL para producción/d' docker-compose.yml
    sed -i '/Prevenir desconexiones automáticas/d' docker-compose.yml
    echo -e "${GREEN}✓ docker-compose.yml corregido${NC}"
else
    echo -e "${GREEN}✓ docker-compose.yml ya está correcto${NC}"
fi
echo ""

# 3. Verificar backups
echo -e "${YELLOW}[3/6] Verificando backups disponibles...${NC}"
if [ -d "backups" ] && [ "$(ls -A backups/*.sql.gz 2>/dev/null)" ]; then
    echo -e "${GREEN}✓ Se encontraron backups:${NC}"
    ls -lh backups/*.sql.gz | tail -3
    TIENE_BACKUP=true
else
    echo -e "${YELLOW}⚠️  No se encontraron backups${NC}"
    TIENE_BACKUP=false
fi
echo ""

# 4. Preguntar si eliminar volumen
echo -e "${YELLOW}[4/6] El volumen de PostgreSQL está corrupto por el error de initdb.${NC}"
echo -e "${YELLOW}¿Quieres eliminarlo y recrearlo? (s/n)${NC}"
read -r respuesta

if [[ "$respuesta" == "s" ]] || [[ "$respuesta" == "S" ]]; then
    echo "Eliminando volumen corrupto..."
    docker volume rm chicoj_postgres_data 2>/dev/null || true
    echo -e "${GREEN}✓ Volumen eliminado${NC}"
else
    echo -e "${YELLOW}⚠️  Volumen no eliminado - puede haber problemas${NC}"
fi
echo ""

# 5. Iniciar PostgreSQL con configuración corregida
echo -e "${YELLOW}[5/6] Iniciando PostgreSQL con configuración corregida...${NC}"
docker compose up -d postgres
echo "Esperando a que PostgreSQL inicie..."
sleep 20

# Verificar que inició correctamente
if docker exec chicoj-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL iniciado correctamente${NC}"
    
    # Ver últimos logs
    echo ""
    echo "Últimos logs de PostgreSQL:"
    docker logs chicoj-postgres --tail 5
else
    echo -e "${RED}✗ PostgreSQL falló al iniciar${NC}"
    echo "Logs completos:"
    docker logs chicoj-postgres --tail 30
    exit 1
fi
echo ""

# 6. Restaurar o recrear base de datos
echo -e "${YELLOW}[6/6] Configurando base de datos...${NC}"

# Verificar si la base de datos ya existe
if docker exec chicoj-postgres psql -U postgres -l 2>/dev/null | grep -q "restaurante_db"; then
    echo -e "${GREEN}✓ Base de datos 'restaurante_db' ya existe${NC}"
else
    if [ "$TIENE_BACKUP" = true ]; then
        echo -e "${YELLOW}¿Quieres restaurar desde backup? (s/n)${NC}"
        read -r respuesta_backup
        
        if [[ "$respuesta_backup" == "s" ]] || [[ "$respuesta_backup" == "S" ]]; then
            echo "Backups disponibles:"
            ls -1 backups/*.sql.gz 2>/dev/null
            echo ""
            echo "Ingresa el nombre del backup a restaurar:"
            read -r backup_file
            
            if [ -f "$backup_file" ]; then
                echo "Restaurando backup..."
                # Aquí iría tu script de restore
                if [ -f "./scripts/restore.sh" ]; then
                    ./scripts/restore.sh "$backup_file"
                else
                    echo "Creando base de datos..."
                    docker exec chicoj-postgres psql -U postgres -c "CREATE DATABASE restaurante_db;"
                    echo "Restaurando con pg_restore..."
                    gunzip < "$backup_file" | docker exec -i chicoj-postgres psql -U postgres -d restaurante_db
                fi
                echo -e "${GREEN}✓ Backup restaurado${NC}"
            else
                echo -e "${RED}Backup no encontrado${NC}"
            fi
        fi
    else
        echo "Creando base de datos desde cero..."
        docker exec chicoj-postgres psql -U postgres -c "CREATE DATABASE restaurante_db;"
        echo -e "${GREEN}✓ Base de datos creada${NC}"
        
        echo ""
        echo "Levantando backend para ejecutar migraciones..."
        docker compose up -d backend
        sleep 15
        
        echo "Ejecutando migraciones..."
        docker exec chicoj-backend npx prisma migrate deploy
        
        echo "Cargando datos iniciales..."
        docker exec chicoj-backend npx prisma db seed 2>/dev/null || echo "No hay seed configurado"
        
        echo -e "${GREEN}✓ Base de datos inicializada${NC}"
    fi
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ CORRECCIÓN COMPLETADA${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""

# Levantar todos los servicios
echo "Levantando todos los servicios..."
docker compose up -d

echo ""
echo "Estado de los contenedores:"
docker ps --filter "name=chicoj"

echo ""
echo -e "${YELLOW}Siguiente paso:${NC}"
echo "  ./verificar-seguridad.sh"

