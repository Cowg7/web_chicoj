# Script de Diagnóstico Rápido para Error 404 en Roles
# Para ejecutar en el servidor de producción

Write-Host "`n" -NoNewline
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  🔍 DIAGNÓSTICO ERROR 404 - ROLES" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "`n"

# Función para verificar comando
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# 1. Verificar Docker
Write-Host "📦 1. Verificando Docker..." -ForegroundColor Yellow
if (Test-CommandExists docker) {
    Write-Host "   ✅ Docker instalado" -ForegroundColor Green
    docker --version
} else {
    Write-Host "   ❌ Docker NO encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "`n"

# 2. Verificar contenedores corriendo
Write-Host "🐳 2. Contenedores activos:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n"

# 3. Verificar backend específicamente
Write-Host "🔧 3. Estado del Backend:" -ForegroundColor Yellow
$backendRunning = docker ps --filter "name=backend" --format "{{.Names}}"
if ($backendRunning) {
    Write-Host "   ✅ Backend está corriendo: $backendRunning" -ForegroundColor Green
    
    # Ver últimas líneas del log
    Write-Host "`n   📋 Últimas 10 líneas del log:" -ForegroundColor Cyan
    docker logs $backendRunning --tail 10
} else {
    Write-Host "   ❌ Backend NO está corriendo" -ForegroundColor Red
    Write-Host "   💡 Solución: docker-compose up -d backend" -ForegroundColor Yellow
}

Write-Host "`n"

# 4. Verificar Nginx
Write-Host "🌐 4. Estado de Nginx:" -ForegroundColor Yellow
$nginxRunning = docker ps --filter "name=nginx" --format "{{.Names}}"
if ($nginxRunning) {
    Write-Host "   ✅ Nginx está corriendo: $nginxRunning" -ForegroundColor Green
} else {
    Write-Host "   ❌ Nginx NO está corriendo" -ForegroundColor Red
}

Write-Host "`n"

# 5. Verificar PostgreSQL
Write-Host "🗄️  5. Estado de PostgreSQL:" -ForegroundColor Yellow
$postgresRunning = docker ps --filter "name=postgres" --format "{{.Names}}"
if ($postgresRunning) {
    Write-Host "   ✅ PostgreSQL está corriendo: $postgresRunning" -ForegroundColor Green
} else {
    Write-Host "   ❌ PostgreSQL NO está corriendo" -ForegroundColor Red
}

Write-Host "`n"

# 6. Probar endpoint de health
Write-Host "🏥 6. Probando endpoint /api/health:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend respondiendo correctamente" -ForegroundColor Green
        Write-Host "   📄 Respuesta: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Backend NO responde en http://localhost:3000/api/health" -ForegroundColor Red
    Write-Host "   💡 Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n"

# 7. Verificar conectividad entre contenedores
Write-Host "🔗 7. Conectividad entre contenedores:" -ForegroundColor Yellow
if ($nginxRunning -and $backendRunning) {
    try {
        $pingResult = docker exec $nginxRunning ping -c 2 backend 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Nginx puede comunicarse con Backend" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Nginx NO puede comunicarse con Backend" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ⚠️  No se pudo verificar conectividad" -ForegroundColor Yellow
    }
}

Write-Host "`n"

# 8. Verificar archivos de rutas en el backend
Write-Host "📁 8. Verificando archivos de rutas del backend:" -ForegroundColor Yellow
if ($backendRunning) {
    Write-Host "   🔍 Buscando users.routes.js..." -ForegroundColor Cyan
    $routesExist = docker exec $backendRunning test -f /app/src/routes/users.routes.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Archivo users.routes.js existe" -ForegroundColor Green
        
        # Ver contenido del archivo de rutas
        Write-Host "`n   📄 Contenido de users.routes.js:" -ForegroundColor Cyan
        docker exec $backendRunning cat /app/src/routes/users.routes.js | Select-String -Pattern "router\.(get|post|patch|delete)\('/roles"
        
    } else {
        Write-Host "   ❌ Archivo users.routes.js NO encontrado" -ForegroundColor Red
    }
}

Write-Host "`n"

# 9. Verificar variables de entorno
Write-Host "⚙️  9. Variables de entorno del backend:" -ForegroundColor Yellow
if ($backendRunning) {
    Write-Host "   📋 Variables importantes:" -ForegroundColor Cyan
    docker exec $backendRunning env | Select-String -Pattern "PORT|NODE_ENV|DATABASE_URL"
}

Write-Host "`n"

# 10. Resumen y recomendaciones
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  📊 RESUMEN DEL DIAGNÓSTICO" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "`n"

$allOk = $true

if (-not $backendRunning) {
    Write-Host "❌ Backend NO está corriendo" -ForegroundColor Red
    Write-Host "   💡 Ejecuta: docker-compose up -d backend" -ForegroundColor Yellow
    $allOk = $false
}

if (-not $nginxRunning) {
    Write-Host "❌ Nginx NO está corriendo" -ForegroundColor Red
    Write-Host "   💡 Ejecuta: docker-compose up -d nginx" -ForegroundColor Yellow
    $allOk = $false
}

if ($backendRunning) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -ne 200) {
            Write-Host "❌ Backend NO responde correctamente" -ForegroundColor Red
            Write-Host "   💡 Ejecuta: docker-compose restart backend" -ForegroundColor Yellow
            $allOk = $false
        }
    } catch {
        Write-Host "❌ Backend NO responde en puerto 3000" -ForegroundColor Red
        Write-Host "   💡 Verifica logs: docker-compose logs backend" -ForegroundColor Yellow
        $allOk = $false
    }
}

if ($allOk) {
    Write-Host "✅ TODOS LOS SERVICIOS ESTÁN FUNCIONANDO" -ForegroundColor Green
    Write-Host "`n"
    Write-Host "🔍 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Probar el endpoint desde el navegador:" -ForegroundColor White
    Write-Host "      fetch('https://coopechicoj.com/api/health')" -ForegroundColor Gray
    Write-Host "`n"
    Write-Host "   2. Verificar token de autenticación:" -ForegroundColor White
    Write-Host "      console.log(localStorage.getItem('auth_token'))" -ForegroundColor Gray
    Write-Host "`n"
    Write-Host "   3. Probar endpoint de roles:" -ForegroundColor White
    Write-Host "      const token = localStorage.getItem('auth_token');" -ForegroundColor Gray
    Write-Host "      fetch('https://coopechicoj.com/api/users/roles', {" -ForegroundColor Gray
    Write-Host "        headers: { 'Authorization': `Bearer `${token}` }" -ForegroundColor Gray
    Write-Host "      })" -ForegroundColor Gray
} else {
    Write-Host "⚠️  HAY PROBLEMAS QUE NECESITAN ATENCIÓN" -ForegroundColor Yellow
    Write-Host "`n"
    Write-Host "🔧 Comandos de solución rápida:" -ForegroundColor Cyan
    Write-Host "   # Reiniciar servicios" -ForegroundColor White
    Write-Host "   docker-compose restart backend nginx" -ForegroundColor Gray
    Write-Host "`n"
    Write-Host "   # Ver logs en tiempo real" -ForegroundColor White
    Write-Host "   docker-compose logs -f backend" -ForegroundColor Gray
    Write-Host "`n"
    Write-Host "   # Si nada funciona, rebuild completo:" -ForegroundColor White
    Write-Host "   docker-compose down" -ForegroundColor Gray
    Write-Host "   docker-compose build backend" -ForegroundColor Gray
    Write-Host "   docker-compose up -d" -ForegroundColor Gray
}

Write-Host "`n"
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  📄 Documentación completa:" -ForegroundColor Cyan
Write-Host "  FIX_ERROR_404_ROLES_PRODUCCION.md" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "`n"

