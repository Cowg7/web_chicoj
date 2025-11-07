# Script para configurar archivo .env con credenciales seguras

Write-Host "Configurando archivo .env con credenciales seguras..." -ForegroundColor Cyan

# Generar contraseñas seguras
$postgresPass = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
$pgadminPass = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | % {[char]$_})

# Crear archivo .env
$envContent = @"
# ================================
# CHICOJ RESTAURANT SYSTEM
# Configuracion de Variables de Entorno
# ================================

# ============ BASE DE DATOS ============
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$postgresPass
POSTGRES_DB=restaurante_db

# ============ BACKEND / API ============
NODE_ENV=development
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# CORS - Dominios permitidos (separados por coma)
ALLOWED_ORIGINS=http://localhost,http://localhost:80,http://127.0.0.1

# ============ PUERTOS ============
HTTP_PORT=80
HTTPS_PORT=443
FRONTEND_PORT=8080

# ============ PGADMIN (OPCIONAL - SOLO DESARROLLO) ============
PGADMIN_PORT=5050
PGADMIN_EMAIL=admin@coopechicoj.com
PGADMIN_PASSWORD=$pgadminPass

# ============ SSL / DOMINIO (PARA PRODUCCION) ============
DOMAIN=coopechicoj.com
SSL_EMAIL=admin@coopechicoj.com

# ============ CONFIGURACION ADICIONAL ============
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost
"@

# Guardar archivo
$envContent | Out-File -FilePath .env -Encoding UTF8 -Force

Write-Host ""
Write-Host "Archivo .env creado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciales generadas:" -ForegroundColor Yellow
Write-Host "  POSTGRES_PASSWORD: $postgresPass" -ForegroundColor Gray
Write-Host "  JWT_SECRET: [64 caracteres aleatorios]" -ForegroundColor Gray
Write-Host "  PGADMIN_PASSWORD: $pgadminPass" -ForegroundColor Gray
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "  1. docker compose down" -ForegroundColor White
Write-Host "  2. docker compose up -d" -ForegroundColor White
Write-Host ""

