# Script para hacer backup completo de la base de datos
# Ejecutar desde la raíz del proyecto

$FECHA = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_DIR = "backups"
$BACKUP_FILE = "backup_restaurante_db_$FECHA.sql"
$BACKUP_PATH = "$BACKUP_DIR/$BACKUP_FILE"

Write-Host "`n" -NoNewline
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  📦 BACKUP DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "`n"

# Crear directorio de backups si no existe
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
    Write-Host "✅ Directorio de backups creado: $BACKUP_DIR" -ForegroundColor Green
}

Write-Host "`n"

# Verificar Docker
Write-Host "📦 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Docker no está disponible" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Docker disponible" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error al verificar Docker" -ForegroundColor Red
    exit 1
}

Write-Host "`n"

# Verificar PostgreSQL
Write-Host "🐘 Verificando PostgreSQL..." -ForegroundColor Yellow
$postgresContainer = docker ps --filter "name=postgres" --format "{{.Names}}" 2>&1 | Select-Object -First 1

if (-not $postgresContainer) {
    Write-Host "   ❌ PostgreSQL NO está corriendo" -ForegroundColor Red
    Write-Host "   💡 Inicia el contenedor: docker-compose up -d postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host "   ✅ PostgreSQL corriendo: $postgresContainer" -ForegroundColor Green
Write-Host "`n"

# Hacer backup
Write-Host "🔄 Creando backup de la base de datos..." -ForegroundColor Yellow
Write-Host "   📄 Archivo: $BACKUP_FILE" -ForegroundColor Cyan

try {
    # Ejecutar pg_dump
    docker exec $postgresContainer pg_dump -U postgres restaurante_db > $BACKUP_PATH
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $BACKUP_PATH)) {
        $fileSize = (Get-Item $BACKUP_PATH).Length / 1KB
        Write-Host "`n   ✅ Backup creado exitosamente" -ForegroundColor Green
        Write-Host "   📊 Tamaño: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Gray
    } else {
        Write-Host "`n   ❌ Error al crear el backup" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n"

# Información del backup
Write-Host "📋 Información del backup:" -ForegroundColor Cyan
Write-Host "   📁 Ubicación: $BACKUP_PATH" -ForegroundColor White
Write-Host "   📅 Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White

# Verificar contenido del backup
Write-Host "`n"
Write-Host "🔍 Verificando contenido..." -ForegroundColor Yellow
$lineCount = (Get-Content $BACKUP_PATH | Measure-Object -Line).Lines
Write-Host "   ✅ $lineCount líneas en el archivo" -ForegroundColor Green

# Buscar tablas en el backup
$tables = Get-Content $BACKUP_PATH | Select-String -Pattern "CREATE TABLE" | Measure-Object
Write-Host "   ✅ $($tables.Count) tablas incluidas" -ForegroundColor Green

Write-Host "`n"

# Comprimir el backup (opcional)
Write-Host "📦 ¿Comprimir el backup para envío? (Recomendado)" -ForegroundColor Yellow
Write-Host "   Esto reduce el tamaño del archivo para enviarlo" -ForegroundColor Gray
$compress = Read-Host "   ¿Comprimir? (s/n)"

if ($compress -eq "s" -or $compress -eq "S" -or $compress -eq "y" -or $compress -eq "Y") {
    $zipFile = "$BACKUP_DIR/backup_restaurante_db_$FECHA.zip"
    Write-Host "`n   🔄 Comprimiendo..." -ForegroundColor Cyan
    
    Compress-Archive -Path $BACKUP_PATH -DestinationPath $zipFile -Force
    
    if (Test-Path $zipFile) {
        $zipSize = (Get-Item $zipFile).Length / 1KB
        Write-Host "   ✅ Archivo comprimido: $zipFile" -ForegroundColor Green
        Write-Host "   📊 Tamaño: $([math]::Round($zipSize, 2)) KB" -ForegroundColor Gray
        Write-Host "`n   💡 Envía este archivo: $zipFile" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n   💡 Envía este archivo: $BACKUP_PATH" -ForegroundColor Yellow
}

Write-Host "`n"
Write-Host "================================================" -ForegroundColor Green
Write-Host "  ✅ BACKUP COMPLETADO" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "`n"

Write-Host "📤 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "   1. Envía el archivo de backup al equipo de producción" -ForegroundColor White
Write-Host "   2. Adjunta también: RESTAURAR_BACKUP_EN_PRODUCCION.md" -ForegroundColor White
Write-Host "   3. Ellos deben seguir las instrucciones de restauración" -ForegroundColor White
Write-Host "`n"

Write-Host "📁 ARCHIVOS CREADOS:" -ForegroundColor Cyan
Write-Host "   • $BACKUP_PATH" -ForegroundColor White
if (Test-Path "$BACKUP_DIR/backup_restaurante_db_$FECHA.zip") {
    Write-Host "   • $BACKUP_DIR/backup_restaurante_db_$FECHA.zip" -ForegroundColor White
}
Write-Host "`n"

Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   Este backup incluye TODA la base de datos:" -ForegroundColor White
Write-Host "   • Todas las tablas" -ForegroundColor Gray
Write-Host "   • Todos los datos" -ForegroundColor Gray
Write-Host "   • Estructura completa" -ForegroundColor Gray
Write-Host "`n"

