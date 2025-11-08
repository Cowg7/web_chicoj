# Script para actualizar la vista de caja en producción
# Sistema Chicoj

Write-Host "`n=== ACTUALIZANDO VISTA DE CAJA ===" -ForegroundColor Cyan
Write-Host ""

# Verificar que el archivo existe
$archivoLocal = "chicoj-frontend\templates\caja\caja.html"
if (-not (Test-Path $archivoLocal)) {
    Write-Host "ERROR: No se encuentra el archivo $archivoLocal" -ForegroundColor Red
    exit 1
}

Write-Host "Archivo encontrado: $archivoLocal" -ForegroundColor Green
Write-Host ""

# Detener Nginx
Write-Host "1. Deteniendo Nginx..." -ForegroundColor Yellow
docker compose stop nginx

# Copiar el archivo actualizado
Write-Host "2. Copiando archivo actualizado..." -ForegroundColor Yellow
docker cp $archivoLocal chicoj-nginx:/usr/share/nginx/html/templates/caja/caja.html

# Iniciar Nginx
Write-Host "3. Iniciando Nginx..." -ForegroundColor Yellow
docker compose start nginx

Write-Host ""
Write-Host "=== ACTUALIZACIÓN COMPLETADA ===" -ForegroundColor Green
Write-Host ""
Write-Host "ARCHIVO ACTUALIZADO:" -ForegroundColor Cyan
Write-Host "  templates/caja/caja.html" -ForegroundColor White
Write-Host ""
Write-Host "CAMBIOS APLICADOS:" -ForegroundColor Yellow
Write-Host "  • CSS con !important para tabs" -ForegroundColor White
Write-Host "  • JavaScript inline para inicializar tabs" -ForegroundColor White
Write-Host "  • Solo una seccion visible a la vez" -ForegroundColor White
Write-Host ""
Write-Host "PROBAR EN:" -ForegroundColor Cyan
Write-Host "  Local: http://localhost/templates/caja/caja" -ForegroundColor White
Write-Host "  Produccion: https://coopechicoj.com/templates/caja/caja" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Magenta
Write-Host "  Limpia el cache del navegador: Ctrl+Shift+R" -ForegroundColor Yellow
Write-Host "  Verifica en consola (F12): 'Tabs inicializadas correctamente'" -ForegroundColor Yellow
Write-Host ""



