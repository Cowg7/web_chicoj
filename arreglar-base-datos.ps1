# Script PowerShell para aplicar las correcciones a PostgreSQL
# Para ejecutar en Windows local y luego transferir al servidor

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "PREPARANDO CORRECCIONES PARA POSTGRESQL" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar archivos necesarios
Write-Host "Verificando archivos..." -ForegroundColor Yellow

$archivosNecesarios = @(
    "docker-compose.yml",
    "postgres-config/01-configuracion-produccion.sql",
    "arreglar-base-datos.sh",
    "diagnosticar-base-datos.sh"
)

$todosBien = $true
foreach ($archivo in $archivosNecesarios) {
    if (Test-Path $archivo) {
        Write-Host "✓ $archivo" -ForegroundColor Green
    } else {
        Write-Host "✗ $archivo NO encontrado" -ForegroundColor Red
        $todosBien = $false
    }
}

Write-Host ""

if (-not $todosBien) {
    Write-Host "Faltan archivos necesarios. Abortando." -ForegroundColor Red
    exit 1
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "INSTRUCCIONES PARA APLICAR EN PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Sube estos archivos al servidor:" -ForegroundColor Yellow
Write-Host "   - docker-compose.yml (MODIFICADO)" -ForegroundColor White
Write-Host "   - postgres-config/01-configuracion-produccion.sql (NUEVO)" -ForegroundColor White
Write-Host "   - arreglar-base-datos.sh (NUEVO)" -ForegroundColor White
Write-Host "   - diagnosticar-base-datos.sh (NUEVO)" -ForegroundColor White
Write-Host ""

Write-Host "2. Conéctate al servidor VPS por SSH:" -ForegroundColor Yellow
Write-Host "   ssh usuario@tu-servidor.com" -ForegroundColor White
Write-Host ""

Write-Host "3. Navega al directorio del proyecto:" -ForegroundColor Yellow
Write-Host "   cd /ruta/de/tu/proyecto" -ForegroundColor White
Write-Host ""

Write-Host "4. Da permisos de ejecución a los scripts:" -ForegroundColor Yellow
Write-Host "   chmod +x arreglar-base-datos.sh diagnosticar-base-datos.sh" -ForegroundColor White
Write-Host ""

Write-Host "5. PRIMERO ejecuta el diagnóstico:" -ForegroundColor Yellow
Write-Host "   ./diagnosticar-base-datos.sh" -ForegroundColor White
Write-Host ""

Write-Host "6. Luego aplica las correcciones:" -ForegroundColor Yellow
Write-Host "   ./arreglar-base-datos.sh" -ForegroundColor White
Write-Host ""

Write-Host "7. Monitorea los logs:" -ForegroundColor Yellow
Write-Host "   docker logs -f chicoj-backend" -ForegroundColor White
Write-Host "   docker logs -f chicoj-postgres" -ForegroundColor White
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "CAMBIOS APLICADOS EN ESTE COMMIT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Healthcheck de PostgreSQL MÁS TOLERANTE:" -ForegroundColor Green
Write-Host "  - Interval: 10s → 30s" -ForegroundColor White
Write-Host "  - Retries: 5 → 10" -ForegroundColor White
Write-Host "  - Start period: sin configurar → 60s" -ForegroundColor White
Write-Host ""
Write-Host "✓ Healthcheck del Backend MÁS TOLERANTE:" -ForegroundColor Green
Write-Host "  - Interval: 30s → 60s" -ForegroundColor White
Write-Host "  - Timeout: 10s → 15s" -ForegroundColor White
Write-Host "  - Start period: 40s → 90s" -ForegroundColor White
Write-Host ""
Write-Host "✓ Límites de memoria configurados:" -ForegroundColor Green
Write-Host "  - PostgreSQL: 512MB límite, 256MB reservados" -ForegroundColor White
Write-Host "  - Backend: 768MB límite, 384MB reservados" -ForegroundColor White
Write-Host ""
Write-Host "✓ Configuraciones de PostgreSQL:" -ForegroundColor Green
Write-Host "  - statement_timeout: 300 segundos" -ForegroundColor White
Write-Host "  - idle_in_transaction_session_timeout: desactivado" -ForegroundColor White
Write-Host "  - tcp_keepalives configurados" -ForegroundColor White
Write-Host ""

Write-Host "Presiona Enter para continuar..." -ForegroundColor Yellow
Read-Host

