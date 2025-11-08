#!/bin/bash

# Script completo de diagnóstico de base de datos
# Uso: ./scripts/diagnostico-bd-completo.sh

echo "=========================================="
echo "🔍 DIAGNÓSTICO COMPLETO DE BASE DE DATOS"
echo "=========================================="
echo ""

# 1. Verificar qué base de datos está configurada en .env
echo "1️⃣ Verificando configuración en .env:"
echo "----------------------------------------"
if [ -f .env ]; then
    echo "POSTGRES_DB: $(grep POSTGRES_DB .env | cut -d'=' -f2)"
    echo "POSTGRES_USER: $(grep POSTGRES_USER .env | cut -d'=' -f2)"
else
    echo "❌ Archivo .env no encontrado"
fi
echo ""

# 2. Verificar qué base de datos está usando el backend
echo "2️⃣ Base de datos configurada en el backend:"
echo "----------------------------------------"
docker-compose exec -T backend printenv | grep DATABASE_URL || echo "No se pudo acceder al contenedor"
echo ""

# 3. Verificar tablas en la base de datos postgres
echo "3️⃣ Verificando tablas en la base de datos 'postgres':"
echo "----------------------------------------"
docker-compose exec -T postgres psql -U postgres -d postgres -c "\dt" 2>&1
echo ""

# 4. Verificar si existe la tabla usuarios en postgres
echo "4️⃣ Verificando si existe la tabla 'usuarios' en 'postgres':"
echo "----------------------------------------"
docker-compose exec -T postgres psql -U postgres -d postgres -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('usuarios', 'empleados', 'roles', 'platillos', 'cuenta');
" 2>&1
echo ""

# 5. Si existen tablas, mostrar usuarios
echo "5️⃣ Intentando ver usuarios (si las tablas existen):"
echo "----------------------------------------"
docker-compose exec -T postgres psql -U postgres -d postgres -c "
SELECT 
    u.id_usuario,
    u.usuario_nombre,
    CASE 
        WHEN e.id_empleado IS NULL THEN '❌ Sin empleado' 
        ELSE '✅ ' || e.nombre || ' ' || e.apellidos 
    END AS empleado,
    CASE 
        WHEN r.id_rol IS NULL THEN '❌ Sin rol' 
        ELSE '✅ ' || r.nombre_rol 
    END AS rol
FROM usuarios u
LEFT JOIN empleados e ON u.id_empleado = e.id_empleado
LEFT JOIN roles r ON u.id_rol = r.id_rol
ORDER BY u.id_usuario;
" 2>&1 || echo "Las tablas no existen en la base de datos 'postgres'"
echo ""

echo "=========================================="
echo "💡 PRÓXIMOS PASOS:"
echo "=========================================="
echo ""
echo "Si las tablas NO existen, necesitas:"
echo "1. Crear la base de datos restaurante_db"
echo "2. Ejecutar las migraciones de Prisma"
echo ""
echo "Comandos:"
echo "  docker-compose exec -T postgres psql -U postgres -c 'CREATE DATABASE restaurante_db;'"
echo "  docker-compose exec backend npx prisma migrate deploy"
echo ""

