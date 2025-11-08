# ============================================
# Script para APLICAR MIGRACIONES con Prisma
# ============================================

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  APLICAR MIGRACIONES - PRISMA" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "📋 Este script va a:" -ForegroundColor Yellow
Write-Host "   1. Generar el cliente Prisma" -ForegroundColor White
Write-Host "   2. Aplicar migraciones pendientes" -ForegroundColor White
Write-Host "   3. Actualizar la base de datos" -ForegroundColor White
Write-Host ""

# Confirmar ejecución
$confirmacion = Read-Host "¿Deseas continuar? (S/N)"
if ($confirmacion -ne "S" -and $confirmacion -ne "s") {
    Write-Host "`n❌ Operación cancelada`n" -ForegroundColor Red
    exit
}

Write-Host "`n🔄 Iniciando proceso de migración...`n" -ForegroundColor Cyan

# Paso 1: Generar cliente Prisma
Write-Host "1️⃣  Generando cliente Prisma..." -ForegroundColor Cyan
docker exec chicoj-backend npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error al generar cliente Prisma`n" -ForegroundColor Red
    exit
}

Write-Host "   ✅ Cliente generado`n" -ForegroundColor Green

# Paso 2: Aplicar migraciones
Write-Host "2️⃣  Aplicando migraciones..." -ForegroundColor Cyan
docker exec chicoj-backend npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Migraciones aplicadas correctamente`n" -ForegroundColor Green
    
    Write-Host "`n============================================" -ForegroundColor Green
    Write-Host "  ✅ MIGRACIONES APLICADAS EXITOSAMENTE" -ForegroundColor Green
    Write-Host "============================================`n" -ForegroundColor Green
    
    Write-Host "📊 PRÓXIMOS PASOS:" -ForegroundColor Cyan
    Write-Host "  1. Verificar que la BD esté actualizada:" -ForegroundColor White
    Write-Host "     docker exec chicoj-backend npx prisma db pull" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Si es primera vez, ejecutar seed:" -ForegroundColor White
    Write-Host "     .\ejecutar-seed.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Abrir Prisma Studio para visualizar:" -ForegroundColor White
    Write-Host "     docker exec chicoj-backend npx prisma studio" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host "`n============================================" -ForegroundColor Red
    Write-Host "  ❌ ERROR AL APLICAR MIGRACIONES" -ForegroundColor Red
    Write-Host "============================================`n" -ForegroundColor Red
    
    Write-Host "🔍 DIAGNÓSTICO:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verifica que:" -ForegroundColor White
    Write-Host "  1. Los contenedores estén corriendo:" -ForegroundColor White
    Write-Host "     docker ps" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. La conexión a la BD sea correcta:" -ForegroundColor White
    Write-Host "     Revisa el archivo .env" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. PostgreSQL esté accesible:" -ForegroundColor White
    Write-Host "     docker logs chicoj-postgres" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  4. Las migraciones estén en la carpeta:" -ForegroundColor White
    Write-Host "     Chicoj_System_R-T/backend/prisma/migrations/" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "💡 SOLUCIÓN ALTERNATIVA:" -ForegroundColor Cyan
    Write-Host "   Si las migraciones fallan, puedes resetear todo:" -ForegroundColor White
    Write-Host "   .\reset-database.ps1" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
Read-Host

