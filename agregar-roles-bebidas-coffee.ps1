# Script PowerShell para agregar roles "Bebidas" y "Coffee"
# Ejecutar desde la raíz del proyecto

Write-Host "`n" -NoNewline
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  🎯 AGREGAR ROLES 'BEBIDAS' Y 'COFFEE'" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "`n"

# Verificar Docker
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

# Verificar PostgreSQL
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
Write-Host "🚀 Agregando roles 'Bebidas' y 'Coffee'..." -ForegroundColor Yellow
Write-Host "`n"

try {
    if (Test-Path "agregar-roles-bebidas-coffee.sql") {
        Write-Host "   📄 Usando archivo agregar-roles-bebidas-coffee.sql" -ForegroundColor Cyan
        Get-Content "agregar-roles-bebidas-coffee.sql" | docker exec -i $postgresContainer psql -U postgres -d restaurante_db
    } else {
        Write-Host "   ⚡ Ejecutando comandos directos" -ForegroundColor Cyan
        $sqlCommand = @"
INSERT INTO roles (nombre_rol, descripcion) 
VALUES 
  ('Bebidas', 'KDS de bebidas (bar y bebidas frías)'),
  ('Coffee', 'KDS de coffee shop (café y postres)')
ON CONFLICT (nombre_rol) DO NOTHING;

SELECT id_rol, nombre_rol, descripcion 
FROM roles 
WHERE nombre_rol IN ('Bebidas', 'Coffee')
ORDER BY nombre_rol;
"@
        $sqlCommand | docker exec -i $postgresContainer psql -U postgres -d restaurante_db
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n   ✅ Comandos ejecutados correctamente" -ForegroundColor Green
    } else {
        Write-Host "`n   ❌ Error al ejecutar los comandos" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n"

# Verificar todos los roles
Write-Host "🔍 Verificando todos los roles..." -ForegroundColor Yellow
Write-Host "`n"

docker exec $postgresContainer psql -U postgres -d restaurante_db -c "SELECT id_rol, nombre_rol, descripcion FROM roles ORDER BY id_rol;"

Write-Host "`n"
Write-Host "================================================" -ForegroundColor Green
Write-Host "  ✅ PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "`n"

Write-Host "📋 Roles agregados:" -ForegroundColor Cyan
Write-Host "   ✅ Bebidas - KDS de bebidas (bar)" -ForegroundColor White
Write-Host "   ✅ Coffee - KDS de coffee shop (café y postres)" -ForegroundColor White
Write-Host "`n"

Write-Host "📱 Ahora puedes:" -ForegroundColor Cyan
Write-Host "   1. Crear usuarios con estos roles" -ForegroundColor White
Write-Host "   2. Asignar áreas de trabajo (Bebidas/Coffee)" -ForegroundColor White
Write-Host "   3. Acceder a sus KDS específicas" -ForegroundColor White
Write-Host "`n"



