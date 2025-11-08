#!/bin/bash

# Script para verificar y conectar a la base de datos
# Uso: ./scripts/verificar-bd.sh

echo "=========================================="
echo "🔍 VERIFICANDO BASE DE DATOS"
echo "=========================================="
echo ""

# 1. Ver todas las bases de datos existentes
echo "1️⃣ Bases de datos disponibles:"
echo "----------------------------------------"
docker-compose exec -T postgres psql -U postgres -c "\l"
echo ""

# 2. Verificar si restaurante_db existe
echo "2️⃣ Verificando si restaurante_db existe:"
echo "----------------------------------------"
docker-compose exec -T postgres psql -U postgres -c "SELECT datname FROM pg_database WHERE datname = 'restaurante_db';" || echo "Base de datos no encontrada"
echo ""

# 3. Conectarse a la base de datos postgres (por defecto)
echo "3️⃣ Conectándose a la base de datos 'postgres' (por defecto):"
echo "----------------------------------------"
echo "Ejecuta este comando para conectarte:"
echo "docker-compose exec postgres psql -U postgres -d postgres"
echo ""

# 4. Ver tablas en la base de datos postgres
echo "4️⃣ Verificando tablas en 'postgres':"
echo "----------------------------------------"
docker-compose exec -T postgres psql -U postgres -d postgres -c "\dt" || echo "No se encontraron tablas"
echo ""

echo "=========================================="
echo "💡 Si restaurante_db no existe, necesitas:"
echo "   1. Ejecutar las migraciones de Prisma"
echo "   2. O crear la base de datos manualmente"
echo "=========================================="

