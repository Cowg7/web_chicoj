# Script PowerShell para agregar el rol "Tour"
# Ejecutar desde la raíz del proyecto

Write-Host "`n" -NoNewline
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  🎯 AGREGAR ROL 'TOUR' A LA BASE DE DATOS" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "`n"

# Verificar si Docker está corriendo
Write-Host "📦 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker está disponible" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Docker no está disponible" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Error al verificar Docker" -ForegroundColor Red
    exit 1
}

Write-Host "`n"

# Verificar si el contenedor de PostgreSQL está corriendo
Write-Host "🐘 Verificando PostgreSQL..." -ForegroundColor Yellow
$postgresContainer = docker ps --filter "name=postgres" --format "{{.Names}}" 2>&1 | Select-Object -First 1

if ($postgresContainer) {
    Write-Host "   ✅ PostgreSQL está corriendo: $postgresContainer" -ForegroundColor Green
} else {
    Write-Host "   ❌ PostgreSQL NO está corriendo" -ForegroundColor Red
    Write-Host "   💡 Inicia el contenedor: docker-compose up -d postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n"

# Ejecutar el script SQL
Write-Host "🚀 Agregando rol 'Tour'..." -ForegroundColor Yellow
Write-Host "`n"

try {
    # Opción 1: Usar el archivo SQL si existe
    if (Test-Path "agregar-rol-tour.sql") {
        Write-Host "   📄 Usando archivo agregar-rol-tour.sql" -ForegroundColor Cyan
        Get-Content "agregar-rol-tour.sql" | docker exec -i $postgresContainer psql -U postgres -d restaurante_db
    } else {
        # Opción 2: Comando directo
        Write-Host "   ⚡ Ejecutando comando directo" -ForegroundColor Cyan
        $sqlCommand = @"
INSERT INTO roles (nombre_rol, descripcion) 
VALUES ('Tour', 'Gestión de tours y grupos turísticos') 
ON CONFLICT (nombre_rol) DO NOTHING;

SELECT 
    id_rol,
    nombre_rol,
    descripcion
FROM roles
WHERE nombre_rol = 'Tour';
"@
        $sqlCommand | docker exec -i $postgresContainer psql -U postgres -d restaurante_db
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n   ✅ Comando ejecutado correctamente" -ForegroundColor Green
    } else {
        Write-Host "`n   ❌ Error al ejecutar el comando" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n"

# Verificar el resultado
Write-Host "🔍 Verificando todos los roles..." -ForegroundColor Yellow
Write-Host "`n"

docker exec $postgresContainer psql -U postgres -d restaurante_db -c "SELECT id_rol, nombre_rol, descripcion FROM roles ORDER BY id_rol;"

Write-Host "`n"
Write-Host "===============================================" -ForegroundColor Green
Write-Host "  ✅ PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "`n"

Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. El rol 'Tour' ya está disponible" -ForegroundColor White
Write-Host "   2. Puedes crear usuarios con este rol desde:" -ForegroundColor White
Write-Host "      👉 Panel de administración > Gestionar Usuarios" -ForegroundColor Gray
Write-Host "`n"







