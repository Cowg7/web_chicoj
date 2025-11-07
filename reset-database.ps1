# ============================================
# Script para RESETEAR la Base de Datos con Prisma
# ============================================

Write-Host "`n============================================" -ForegroundColor Red
Write-Host "  RESETEAR BASE DE DATOS - PRISMA" -ForegroundColor Red
Write-Host "============================================`n" -ForegroundColor Red

Write-Host "⚠️  ADVERTENCIA CRÍTICA:" -ForegroundColor Yellow
Write-Host "   Este script va a:" -ForegroundColor White
Write-Host "   1. ELIMINAR TODOS LOS DATOS de la base de datos" -ForegroundColor Red
Write-Host "   2. Recrear todas las tablas desde cero" -ForegroundColor Yellow
Write-Host "   3. Ejecutar el seed con datos iniciales" -ForegroundColor Yellow
Write-Host ""
Write-Host "   ESTA ACCIÓN NO SE PUEDE DESHACER" -ForegroundColor Red
Write-Host ""

# Confirmar ejecución
$confirmacion = Read-Host "¿Estás SEGURO que deseas continuar? Escribe 'SI CONFIRMO' para proceder"
if ($confirmacion -ne "SI CONFIRMO") {
    Write-Host "`n❌ Operación cancelada por seguridad`n" -ForegroundColor Red
    exit
}

Write-Host "`n🔄 Iniciando reset de base de datos...`n" -ForegroundColor Cyan

# Paso 1: Borrar migraciones anteriores
Write-Host "1️⃣  Limpiando migraciones antiguas..." -ForegroundColor Cyan
docker exec chicoj-backend sh -c "rm -rf prisma/migrations/*"

# Paso 2: Generar cliente Prisma
Write-Host "2️⃣  Generando cliente Prisma..." -ForegroundColor Cyan
docker exec chicoj-backend npx prisma generate

# Paso 3: Push del schema a la base de datos (forzado)
Write-Host "3️⃣  Aplicando schema a la base de datos..." -ForegroundColor Cyan
docker exec chicoj-backend npx prisma db push --force-reset --skip-generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Schema aplicado correctamente`n" -ForegroundColor Green
    
    # Paso 4: Ejecutar seed
    Write-Host "4️⃣  Ejecutando seed con datos iniciales..." -ForegroundColor Cyan
    docker exec chicoj-backend npm run seed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n============================================" -ForegroundColor Green
        Write-Host "  ✅ BASE DE DATOS RESETEADA EXITOSAMENTE" -ForegroundColor Green
        Write-Host "============================================`n" -ForegroundColor Green
        
        Write-Host "📋 ESTRUCTURA CREADA:" -ForegroundColor Cyan
        Write-Host "  • 11 tablas principales" -ForegroundColor White
        Write-Host "  • 20+ índices para optimización" -ForegroundColor White
        Write-Host "  • Relaciones con integridad referencial" -ForegroundColor White
        Write-Host ""
        
        Write-Host "👥 USUARIOS DISPONIBLES:" -ForegroundColor Cyan
        Write-Host "  • admin / admin123 (Administrador)" -ForegroundColor White
        Write-Host "  • gerente1 / gerente123 (Gerente)" -ForegroundColor White
        Write-Host "  • cajero1 / cajero123 (Cajero)" -ForegroundColor White
        Write-Host "  • mesero1 / mesero123 (Mesero)" -ForegroundColor White
        Write-Host "  • cocina1 / cocina123 (Cocina)" -ForegroundColor White
        Write-Host "  • bebidas1 / bebidas123 (Bebidas)" -ForegroundColor White
        Write-Host "  • coffee1 / coffee123 (Coffee)" -ForegroundColor White
        Write-Host "  • tour1 / tour123 (Tour)" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "🍽️  PLATILLOS CREADOS:" -ForegroundColor Cyan
        Write-Host "  • Cocina: 15 platillos (5 categorías)" -ForegroundColor White
        Write-Host "  • Bebidas: 13 platillos (4 categorías)" -ForegroundColor White
        Write-Host "  • Coffee: 13 platillos (2 categorías)" -ForegroundColor White
        Write-Host "  📊 Total: 41 platillos con categorías" -ForegroundColor Yellow
        Write-Host ""
        
    } else {
        Write-Host "`n⚠️  Schema creado pero hubo un error en el seed" -ForegroundColor Yellow
        Write-Host "   Puedes intentar ejecutar el seed manualmente:" -ForegroundColor White
        Write-Host "   .\ejecutar-seed.ps1`n" -ForegroundColor Gray
    }
    
} else {
    Write-Host "`n============================================" -ForegroundColor Red
    Write-Host "  ❌ ERROR AL RESETEAR BASE DE DATOS" -ForegroundColor Red
    Write-Host "============================================`n" -ForegroundColor Red
    Write-Host "Verifica que:" -ForegroundColor Yellow
    Write-Host "  1. Los contenedores estén corriendo (docker ps)" -ForegroundColor White
    Write-Host "  2. La conexión a la BD sea correcta (.env)" -ForegroundColor White
    Write-Host "  3. PostgreSQL esté accesible" -ForegroundColor White
    Write-Host ""
}

Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
Read-Host

