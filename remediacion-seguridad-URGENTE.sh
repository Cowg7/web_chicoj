#!/bin/bash
# Script de remediación urgente para ataque a PostgreSQL
# EJECUTAR INMEDIATAMENTE

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  🚨 REMEDIACIÓN DE SEGURIDAD POSTGRESQL - URGENTE 🚨  ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que estamos ejecutando como root o con sudo
if [[ $EUID -ne 0 ]] && ! sudo -n true 2>/dev/null; then
   echo -e "${YELLOW}Este script requiere privilegios de root para algunas operaciones.${NC}"
   echo -e "${YELLOW}Se te pedirá sudo cuando sea necesario.${NC}"
   echo ""
fi

# PASO 1: Verificar exposición del puerto
echo -e "${BLUE}[1/7] Verificando exposición del puerto 5432...${NC}"
if netstat -tunlp 2>/dev/null | grep ":5432" | grep -q "0.0.0.0"; then
    echo -e "${RED}⚠️  CRÍTICO: Puerto 5432 EXPUESTO PÚBLICAMENTE${NC}"
    PUERTO_EXPUESTO=1
elif ss -tunlp 2>/dev/null | grep ":5432" | grep -q "0.0.0.0"; then
    echo -e "${RED}⚠️  CRÍTICO: Puerto 5432 EXPUESTO PÚBLICAMENTE${NC}"
    PUERTO_EXPUESTO=1
else
    echo -e "${GREEN}✓ Puerto 5432 no está expuesto públicamente${NC}"
    PUERTO_EXPUESTO=0
fi
echo ""

# PASO 2: Detener contenedores
echo -e "${BLUE}[2/7] Deteniendo contenedores...${NC}"
docker compose down
echo -e "${GREEN}✓ Contenedores detenidos${NC}"
echo ""

# PASO 3: Bloquear puerto con firewall
echo -e "${BLUE}[3/7] Configurando firewall...${NC}"

# Intentar con UFW
if command -v ufw &> /dev/null; then
    echo "Configurando UFW..."
    sudo ufw deny 5432/tcp 2>/dev/null || true
    echo -e "${GREEN}✓ UFW configurado${NC}"
# Intentar con iptables
elif command -v iptables &> /dev/null; then
    echo "Configurando iptables..."
    # Permitir desde localhost
    sudo iptables -A INPUT -p tcp --dport 5432 -s 127.0.0.1 -j ACCEPT 2>/dev/null || true
    # Denegar todo lo demás
    sudo iptables -A INPUT -p tcp --dport 5432 -j DROP 2>/dev/null || true
    echo -e "${GREEN}✓ iptables configurado${NC}"
else
    echo -e "${YELLOW}⚠️  No se encontró firewall (ufw/iptables)${NC}"
fi

# Bloquear IP del atacante conocido
echo "Bloqueando IP del atacante (78.153.140.66)..."
if command -v ufw &> /dev/null; then
    sudo ufw deny from 78.153.140.66 2>/dev/null || true
elif command -v iptables &> /dev/null; then
    sudo iptables -A INPUT -s 78.153.140.66 -j DROP 2>/dev/null || true
fi
echo -e "${GREEN}✓ IP atacante bloqueada${NC}"
echo ""

# PASO 4: Verificar archivos de configuración
echo -e "${BLUE}[4/7] Verificando archivos de configuración...${NC}"

if ! grep -q "127.0.0.1:5432:5432" docker-compose.yml; then
    echo -e "${YELLOW}⚠️  docker-compose.yml no tiene el puerto configurado correctamente${NC}"
    echo -e "${YELLOW}   Debe ser: '127.0.0.1:5432:5432' no '5432:5432'${NC}"
    echo ""
    echo -e "${YELLOW}¿Quieres que lo corrija automáticamente? (s/n)${NC}"
    read -r respuesta
    if [[ "$respuesta" == "s" ]] || [[ "$respuesta" == "S" ]]; then
        sed -i 's/"5432:5432"/"127.0.0.1:5432:5432"/' docker-compose.yml
        echo -e "${GREEN}✓ docker-compose.yml corregido${NC}"
    fi
else
    echo -e "${GREEN}✓ docker-compose.yml configurado correctamente${NC}"
fi

if [ ! -f "postgres-config/02-seguridad.sql" ]; then
    echo -e "${RED}✗ Falta postgres-config/02-seguridad.sql${NC}"
    echo "  Asegúrate de tener todos los archivos actualizados del repositorio."
else
    echo -e "${GREEN}✓ Archivos de seguridad presentes${NC}"
fi
echo ""

# PASO 5: Generar nueva contraseña segura
echo -e "${BLUE}[5/7] Generando nueva contraseña segura...${NC}"
NUEVA_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo -e "${GREEN}✓ Nueva contraseña generada${NC}"
echo -e "${YELLOW}📝 GUARDA ESTA CONTRASEÑA:${NC}"
echo -e "${YELLOW}   ${NUEVA_PASSWORD}${NC}"
echo ""
echo "Presiona Enter para continuar..."
read

# Actualizar .env si existe
if [ -f ".env" ]; then
    if grep -q "POSTGRES_PASSWORD=" .env; then
        sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${NUEVA_PASSWORD}/" .env
        echo -e "${GREEN}✓ Contraseña actualizada en .env${NC}"
    else
        echo "POSTGRES_PASSWORD=${NUEVA_PASSWORD}" >> .env
        echo -e "${GREEN}✓ Contraseña agregada a .env${NC}"
    fi
fi
echo ""

# PASO 6: Iniciar servicios con nueva configuración
echo -e "${BLUE}[6/7] Iniciando servicios con nueva configuración...${NC}"
docker compose up -d postgres
echo "Esperando a que PostgreSQL inicie..."
sleep 15

# Verificar que PostgreSQL esté corriendo
if docker exec chicoj-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL iniciado${NC}"
else
    echo -e "${RED}✗ PostgreSQL no pudo iniciar${NC}"
    echo "Verifica los logs: docker logs chicoj-postgres"
    exit 1
fi

# Cambiar contraseña en PostgreSQL
echo "Cambiando contraseña en PostgreSQL..."
docker exec chicoj-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD '${NUEVA_PASSWORD}';" > /dev/null 2>&1
echo -e "${GREEN}✓ Contraseña de PostgreSQL actualizada${NC}"
echo ""

# PASO 7: Verificar seguridad
echo -e "${BLUE}[7/7] Verificando configuración de seguridad...${NC}"

# Verificar que el puerto no esté expuesto
PUERTO_CHECK=$(netstat -tunlp 2>/dev/null | grep ":5432" | grep "0.0.0.0" || true)
if [ -z "$PUERTO_CHECK" ]; then
    echo -e "${GREEN}✓ Puerto 5432 NO expuesto públicamente${NC}"
else
    echo -e "${RED}✗ Puerto 5432 AÚN EXPUESTO${NC}"
    echo "  Verifica manualmente la configuración"
fi

# Verificar que PostgreSQL esté respondiendo
if docker exec chicoj-postgres psql -U postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL respondiendo correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL no responde con nueva contraseña${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ REMEDIACIÓN BÁSICA COMPLETADA${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}PASOS SIGUIENTES IMPORTANTES:${NC}"
echo ""
echo "1. ACTUALIZA LA DATABASE_URL en tu backend:"
echo "   DATABASE_URL=postgresql://postgres:${NUEVA_PASSWORD}@postgres:5432/restaurante_db?schema=public"
echo ""
echo "2. Verifica que la base de datos existe:"
echo "   docker exec chicoj-postgres psql -U postgres -l | grep restaurante_db"
echo ""
echo "3. Si la base de datos NO existe, restáurala o recréala:"
echo "   a) Desde backup: ./scripts/restore.sh backups/tu_backup.sql.gz"
echo "   b) Recrear nueva: docker exec chicoj-backend npx prisma migrate deploy"
echo ""
echo "4. Inicia el resto de los servicios:"
echo "   docker compose up -d"
echo ""
echo "5. Monitorea los logs por actividad sospechosa:"
echo "   docker logs -f chicoj-postgres | grep -E 'FATAL|ERROR|DROP|COPY.*PROGRAM'"
echo ""
echo "6. Lee el archivo EMERGENCIA_SEGURIDAD_POSTGRESQL.md para pasos adicionales"
echo ""
echo -e "${RED}⚠️  IMPORTANTE: Guarda la nueva contraseña en un lugar seguro${NC}"
echo ""

