# ============================================
# Script para AGREGAR columna categoria a platillos
# ============================================

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "  AGREGAR COLUMNA CATEGORIA A PLATILLOS" -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

Write-Host "📋 Este script va a:" -ForegroundColor Yellow
Write-Host "   1. Verificar si la columna 'categoria' existe" -ForegroundColor White
Write-Host "   2. Agregar la columna si no existe" -ForegroundColor White
Write-Host "   3. Crear índice para optimización" -ForegroundColor White
Write-Host ""

# Confirmar ejecución
$confirmacion = Read-Host "¿Deseas continuar? (S/N)"
if ($confirmacion -ne "S" -and $confirmacion -ne "s") {
    Write-Host "`n❌ Operación cancelada`n" -ForegroundColor Red
    exit
}

Write-Host "`n🔄 Iniciando proceso...`n" -ForegroundColor Cyan

# Paso 1: Verificar si la columna existe
Write-Host "1️⃣  Verificando si la columna 'categoria' existe..." -ForegroundColor Cyan
$verificar = "SELECT column_name FROM information_schema.columns WHERE table_name = 'platillos' AND column_name = 'categoria';"
$resultado = docker exec chicoj-postgres psql -U postgres -d restaurante_db -t -c $verificar

if ($resultado -match "categoria") {
    Write-Host "   ✅ La columna 'categoria' YA EXISTE`n" -ForegroundColor Green
    Write-Host "El problema puede ser otro. Revisa los logs del backend:" -ForegroundColor Yellow
    Write-Host "   docker logs chicoj-backend --tail 50" -ForegroundColor White
    Write-Host ""
    Write-Host "Presiona Enter para ver los logs ahora..." -ForegroundColor Gray
    Read-Host
    docker logs chicoj-backend --tail 50
    exit
}

Write-Host "   ⚠️  La columna 'categoria' NO existe - Procediendo a crearla...`n" -ForegroundColor Yellow

# Paso 2: Agregar la columna categoria
Write-Host "2️⃣  Agregando columna 'categoria'..." -ForegroundColor Cyan
$agregarColumna = "ALTER TABLE platillos ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);"
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c $agregarColumna

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Columna agregada exitosamente`n" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error al agregar columna`n" -ForegroundColor Red
    exit
}

# Paso 3: Crear índice
Write-Host "3️⃣  Creando índice para optimización..." -ForegroundColor Cyan
$crearIndice = "CREATE INDEX IF NOT EXISTS ix_platillos_categoria ON platillos(categoria);"
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c $crearIndice

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Índice creado exitosamente`n" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  El índice ya existe o hubo un error menor`n" -ForegroundColor Yellow
}

# Paso 4: Verificar que se creó correctamente
Write-Host "4️⃣  Verificando estructura actualizada..." -ForegroundColor Cyan
$verificarEstructura = "\d+ platillos"
Write-Host ""
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c $verificarEstructura

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  ✅ COLUMNA AGREGADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Green

Write-Host "📊 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Intenta agregar un platillo de nuevo desde el frontend" -ForegroundColor White
Write-Host ""
Write-Host "2. Si aún hay error, revisa los logs del backend:" -ForegroundColor White
Write-Host "   docker logs chicoj-backend --tail 50" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Actualizar platillos existentes con categorías:" -ForegroundColor White
Write-Host "   Edita cada platillo desde el frontend" -ForegroundColor Gray
Write-Host "   O ejecuta: .\ejecutar-seed.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Reiniciar backend (si es necesario):" -ForegroundColor White
Write-Host "   docker restart chicoj-backend" -ForegroundColor Gray
Write-Host ""

Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
Read-Host

