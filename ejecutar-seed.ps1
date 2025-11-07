# ============================================
# Script para ejecutar SEED de la base de datos
# ============================================

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  EJECUTANDO SEED DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "⚠️  ADVERTENCIA:" -ForegroundColor Yellow
Write-Host "   Este script va a poblar la base de datos con datos iniciales." -ForegroundColor White
Write-Host "   Si ya existen datos, se actualizarán (upsert)." -ForegroundColor White
Write-Host ""

# Confirmar ejecución
$confirmacion = Read-Host "¿Deseas continuar? (S/N)"
if ($confirmacion -ne "S" -and $confirmacion -ne "s") {
    Write-Host "`n❌ Operación cancelada por el usuario`n" -ForegroundColor Red
    exit
}

Write-Host "`n🔄 Ejecutando seed en el contenedor backend...`n" -ForegroundColor Cyan

# Ejecutar seed dentro del contenedor
docker exec chicoj-backend npm run seed

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n============================================" -ForegroundColor Green
    Write-Host "  ✅ SEED EJECUTADO EXITOSAMENTE" -ForegroundColor Green
    Write-Host "============================================`n" -ForegroundColor Green
    
    Write-Host "📋 USUARIOS DISPONIBLES:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  👤 admin / admin123" -ForegroundColor White -NoNewline
    Write-Host " (Administrador)" -ForegroundColor Gray
    Write-Host "  👤 gerente1 / gerente123" -ForegroundColor White -NoNewline
    Write-Host " (Gerente)" -ForegroundColor Gray
    Write-Host "  👤 cajero1 / cajero123" -ForegroundColor White -NoNewline
    Write-Host " (Cajero)" -ForegroundColor Gray
    Write-Host "  👤 mesero1 / mesero123" -ForegroundColor White -NoNewline
    Write-Host " (Mesero)" -ForegroundColor Gray
    Write-Host "  👤 cocina1 / cocina123" -ForegroundColor White -NoNewline
    Write-Host " (Cocina)" -ForegroundColor Gray
    Write-Host "  👤 bebidas1 / bebidas123" -ForegroundColor White -NoNewline
    Write-Host " (Bebidas)" -ForegroundColor Gray
    Write-Host "  👤 coffee1 / coffee123" -ForegroundColor White -NoNewline
    Write-Host " (Coffee)" -ForegroundColor Gray
    Write-Host "  👤 tour1 / tour123" -ForegroundColor White -NoNewline
    Write-Host " (Tour) ⭐ NUEVO" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🍽️  PLATILLOS CREADOS:" -ForegroundColor Cyan
    Write-Host "  • Cocina: 15 platillos" -ForegroundColor White
    Write-Host "    (Desayunos, Almuerzos, Menu Infantil, Refacciones, Refacciones Tipicas)" -ForegroundColor Gray
    Write-Host "  • Bebidas: 13 platillos" -ForegroundColor White
    Write-Host "    (Bebidas Frias, Licuados, Cervezas, Bebidas Desechables)" -ForegroundColor Gray
    Write-Host "  • Coffee: 13 platillos" -ForegroundColor White
    Write-Host "    (Cafe, Postres)" -ForegroundColor Gray
    Write-Host "  📊 Total: 41 platillos con 12 categorías" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "✨ CARACTERÍSTICAS:" -ForegroundColor Cyan
    Write-Host "  ✅ Todos los platillos incluyen campo 'categoria'" -ForegroundColor Green
    Write-Host "  ✅ Usuario para Tour agregado (tour1/tour123)" -ForegroundColor Green
    Write-Host "  ✅ Rol 'Tour' creado" -ForegroundColor Green
    Write-Host "  ✅ Más variedad de platillos" -ForegroundColor Green
    Write-Host ""
    
} else {
    Write-Host "`n============================================" -ForegroundColor Red
    Write-Host "  ❌ ERROR AL EJECUTAR SEED" -ForegroundColor Red
    Write-Host "============================================`n" -ForegroundColor Red
    Write-Host "Verifica los logs arriba para más detalles.`n" -ForegroundColor Yellow
}

Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
Read-Host

