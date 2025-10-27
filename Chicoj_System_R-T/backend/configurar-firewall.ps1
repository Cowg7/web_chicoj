# ========================================
# CONFIGURAR FIREWALL PARA ACCESO REMOTO
# ========================================
# Este script crea reglas en el Firewall de Windows
# para permitir acceso al sistema desde otros dispositivos
#
# IMPORTANTE: Ejecutar como Administrador
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAR FIREWALL - RESTAURANTE CHICOJ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como administrador
$esAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $esAdmin) {
    Write-Host "❌ ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cómo ejecutar como Administrador:" -ForegroundColor Yellow
    Write-Host "1. Clic derecho en PowerShell" -ForegroundColor Yellow
    Write-Host "2. 'Ejecutar como administrador'" -ForegroundColor Yellow
    Write-Host "3. Ejecutar: .\configurar-firewall.ps1" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "✅ Ejecutando como Administrador" -ForegroundColor Green
Write-Host ""

# ========================================
# PASO 1: Eliminar reglas existentes (si existen)
# ========================================

Write-Host "🧹 Limpiando reglas anteriores..." -ForegroundColor Yellow

try {
    Remove-NetFirewallRule -DisplayName "Restaurante Frontend" -ErrorAction SilentlyContinue
    Remove-NetFirewallRule -DisplayName "Restaurante Backend" -ErrorAction SilentlyContinue
    Remove-NetFirewallRule -DisplayName "Restaurante Chicoj Frontend" -ErrorAction SilentlyContinue
    Remove-NetFirewallRule -DisplayName "Restaurante Chicoj Backend" -ErrorAction SilentlyContinue
    Write-Host "   Reglas anteriores eliminadas" -ForegroundColor Gray
} catch {
    Write-Host "   No hay reglas anteriores" -ForegroundColor Gray
}

Write-Host ""

# ========================================
# PASO 2: Crear regla para Frontend (puerto 8080)
# ========================================

Write-Host "📱 Configurando Frontend (puerto 8080)..." -ForegroundColor Cyan

try {
    New-NetFirewallRule `
        -DisplayName "Restaurante Chicoj Frontend" `
        -Description "Permite acceso al frontend del sistema de restaurante desde otros dispositivos" `
        -Direction Inbound `
        -LocalPort 8080 `
        -Protocol TCP `
        -Action Allow `
        -Profile Private,Public `
        -Enabled True | Out-Null
    
    Write-Host "   ✅ Puerto 8080 configurado correctamente" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error al configurar puerto 8080: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ========================================
# PASO 3: Crear regla para Backend (puerto 3000)
# ========================================

Write-Host "🖥️  Configurando Backend (puerto 3000)..." -ForegroundColor Cyan

try {
    New-NetFirewallRule `
        -DisplayName "Restaurante Chicoj Backend" `
        -Description "Permite acceso al backend API del sistema de restaurante desde otros dispositivos" `
        -Direction Inbound `
        -LocalPort 3000 `
        -Protocol TCP `
        -Action Allow `
        -Profile Private,Public `
        -Enabled True | Out-Null
    
    Write-Host "   ✅ Puerto 3000 configurado correctamente" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error al configurar puerto 3000: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ========================================
# PASO 4: Verificar las reglas creadas
# ========================================

Write-Host "🔍 Verificando reglas creadas..." -ForegroundColor Cyan
Write-Host ""

$frontendRule = Get-NetFirewallRule -DisplayName "Restaurante Chicoj Frontend" -ErrorAction SilentlyContinue
$backendRule = Get-NetFirewallRule -DisplayName "Restaurante Chicoj Backend" -ErrorAction SilentlyContinue

if ($frontendRule -and $backendRule) {
    Write-Host "   ✅ Frontend: Habilitada ($($frontendRule.Enabled))" -ForegroundColor Green
    Write-Host "   ✅ Backend:  Habilitada ($($backendRule.Enabled))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error: No se pudieron crear las reglas" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ========================================
# PASO 5: Obtener IP local
# ========================================

Write-Host "🌐 Detectando tu IP local..." -ForegroundColor Cyan

$ipAddress = Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.InterfaceAlias -notlike "*VMware*" -and $_.IPAddress -notlike "169.254.*" } |
    Select-Object -First 1 -ExpandProperty IPAddress

if ($ipAddress) {
    Write-Host "   📍 Tu IP local es: $ipAddress" -ForegroundColor Yellow
} else {
    Write-Host "   ⚠️  No se pudo detectar IP automáticamente" -ForegroundColor Yellow
    Write-Host "   Ejecuta 'ipconfig' para verla manualmente" -ForegroundColor Gray
}

Write-Host ""

# ========================================
# RESUMEN
# ========================================

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Reglas de Firewall creadas:" -ForegroundColor White
Write-Host "  ✅ Puerto 8080 (Frontend) - PERMITIDO" -ForegroundColor Green
Write-Host "  ✅ Puerto 3000 (Backend)  - PERMITIDO" -ForegroundColor Green
Write-Host ""

if ($ipAddress) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  CÓMO ACCEDER DESDE OTROS DISPOSITIVOS" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Desde tu computadora:" -ForegroundColor White
    Write-Host "  http://localhost:8080/templates/login.html" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Desde celular u otra PC (misma WiFi):" -ForegroundColor White
    Write-Host "  http://${ipAddress}:8080/templates/login.html" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SIGUIENTE PASO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Asegúrate de que los servidores estén corriendo:" -ForegroundColor White
Write-Host ""
Write-Host "   Backend (Terminal 1):" -ForegroundColor Gray
Write-Host "   cd backend" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Frontend (Terminal 2):" -ForegroundColor Gray
Write-Host "   cd fronted" -ForegroundColor Yellow
Write-Host "   npx http-server -p 8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Conecta tu celular/otra PC a la misma WiFi" -ForegroundColor White
Write-Host ""
Write-Host "3. Abre el navegador y accede a:" -ForegroundColor White
if ($ipAddress) {
    Write-Host "   http://${ipAddress}:8080/templates/login.html" -ForegroundColor Yellow
} else {
    Write-Host "   http://[TU_IP]:8080/templates/login.html" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ¡LISTO! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Mantener ventana abierta
Write-Host "Presiona Enter para cerrar..." -ForegroundColor Gray
Read-Host


