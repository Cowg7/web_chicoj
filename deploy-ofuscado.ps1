# SCRIPT DE DEPLOYMENT CON CODIGO OFUSCADO (PowerShell)
# Genera archivos ofuscados y los despliega en Docker

Write-Host "DEPLOYMENT CON CODIGO OFUSCADO" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Generar archivos ofuscados
Write-Host "Paso 1/4: Generando codigo ofuscado..." -ForegroundColor Yellow
node chicoj-frontend\build-production.js

if (-not (Test-Path "chicoj-frontend\dist\scripts")) {
    Write-Host "Error: No se generaron los archivos ofuscados" -ForegroundColor Red
    exit 1
}

# Paso 2: Copiar dist/ al volumen de Docker
Write-Host "Paso 2/4: Copiando archivos al contenedor..." -ForegroundColor Yellow

# Crear carpeta dist en el contenedor si no existe
docker exec chicoj-nginx mkdir -p /usr/share/nginx/html/dist 2>$null

# Copiar archivos ofuscados
docker cp chicoj-frontend\dist\scripts chicoj-nginx:/usr/share/nginx/html/dist/
docker cp chicoj-frontend\dist\css chicoj-nginx:/usr/share/nginx/html/dist/

Write-Host "Archivos copiados correctamente" -ForegroundColor Green

# Paso 3: Reiniciar Nginx
Write-Host "Paso 3/4: Reiniciando Nginx..." -ForegroundColor Yellow
docker compose restart nginx

Start-Sleep -Seconds 3

# Paso 4: Verificar
Write-Host "Paso 4/4: Verificando deployment..." -ForegroundColor Yellow

# Verificar que Nginx esta corriendo
$nginxRunning = docker ps | Select-String "chicoj-nginx"
if ($nginxRunning) {
    Write-Host "Nginx esta corriendo" -ForegroundColor Green
} else {
    Write-Host "Error: Nginx no esta corriendo" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "RESUMEN DEL DEPLOYMENT:" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "URL: http://localhost" -ForegroundColor White
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment completado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Nota: Recarga la pagina con Ctrl+Shift+R para limpiar cache" -ForegroundColor Yellow
Write-Host ""
