# ============================================
# Script para Generar Diagramas PlantUML
# Sistema Chicoj
# ============================================

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  GENERADOR DE DIAGRAMAS PLANTUML - CHICOJ" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# ============ CONFIGURACIÓN ============

$PLANTUML_URL = "https://sourceforge.net/projects/plantuml/files/plantuml.jar/download"
$PLANTUML_JAR = "plantuml.jar"
$DIAGRAMAS_DIR = "diagramas"
$OUTPUT_DIR = "diagramas/output"

# ============ FUNCIONES ============

function Test-JavaInstalled {
    try {
        $javaVersion = java -version 2>&1
        if ($javaVersion -match "version") {
            Write-Host "✅ Java encontrado: $($javaVersion[0])" -ForegroundColor Green
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Download-PlantUML {
    if (Test-Path $PLANTUML_JAR) {
        Write-Host "✅ PlantUML JAR ya existe" -ForegroundColor Green
        return $true
    }
    
    Write-Host "📥 Descargando PlantUML JAR..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $PLANTUML_URL -OutFile $PLANTUML_JAR -UseBasicParsing
        Write-Host "✅ PlantUML descargado exitosamente" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Error descargando PlantUML: $_" -ForegroundColor Red
        return $false
    }
}

function New-OutputDirectory {
    if (!(Test-Path $OUTPUT_DIR)) {
        New-Item -ItemType Directory -Path $OUTPUT_DIR -Force | Out-Null
        Write-Host "✅ Directorio de salida creado: $OUTPUT_DIR" -ForegroundColor Green
    }
}

function Generate-Diagrams {
    param (
        [string]$Format
    )
    
    $formatFlag = switch ($Format) {
        "PNG" { "-tpng" }
        "SVG" { "-tsvg" }
        "PDF" { "-tpdf" }
        default { "-tpng" }
    }
    
    Write-Host ""
    Write-Host "📊 Generando diagramas en formato $Format..." -ForegroundColor Cyan
    Write-Host ""
    
    $files = Get-ChildItem -Path $DIAGRAMAS_DIR -Filter "*.puml"
    $total = $files.Count
    $current = 0
    
    foreach ($file in $files) {
        $current++
        $percent = [math]::Round(($current / $total) * 100)
        
        Write-Host "[$current/$total] ($percent%) Procesando: $($file.Name)" -ForegroundColor White
        
        try {
            $result = java -jar $PLANTUML_JAR $formatFlag -o "../$OUTPUT_DIR" "$($file.FullName)" 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Generado exitosamente" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️ Advertencia: $result" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ❌ Error: $_" -ForegroundColor Red
        }
    }
}

function Show-Summary {
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host "  RESUMEN DE GENERACIÓN" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host ""
    
    $pngFiles = @(Get-ChildItem -Path $OUTPUT_DIR -Filter "*.png" -ErrorAction SilentlyContinue)
    $svgFiles = @(Get-ChildItem -Path $OUTPUT_DIR -Filter "*.svg" -ErrorAction SilentlyContinue)
    $pdfFiles = @(Get-ChildItem -Path $OUTPUT_DIR -Filter "*.pdf" -ErrorAction SilentlyContinue)
    
    Write-Host "📁 Directorio de salida: $OUTPUT_DIR" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Archivos generados:" -ForegroundColor White
    Write-Host "  • PNG: $($pngFiles.Count) archivos" -ForegroundColor $(if ($pngFiles.Count -gt 0) { "Green" } else { "Gray" })
    Write-Host "  • SVG: $($svgFiles.Count) archivos" -ForegroundColor $(if ($svgFiles.Count -gt 0) { "Green" } else { "Gray" })
    Write-Host "  • PDF: $($pdfFiles.Count) archivos" -ForegroundColor $(if ($pdfFiles.Count -gt 0) { "Green" } else { "Gray" })
    Write-Host ""
    
    if ($pngFiles.Count -gt 0 -or $svgFiles.Count -gt 0 -or $pdfFiles.Count -gt 0) {
        Write-Host "✅ Diagramas generados exitosamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No se generaron diagramas" -ForegroundColor Yellow
    }
}

function Open-OutputDirectory {
    Write-Host ""
    $response = Read-Host "¿Deseas abrir el directorio de salida? (S/N)"
    if ($response -eq "S" -or $response -eq "s") {
        Start-Process explorer.exe -ArgumentList $OUTPUT_DIR
    }
}

# ============ MAIN ============

# Verificar Java
if (!(Test-JavaInstalled)) {
    Write-Host "❌ Java no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor instala Java:" -ForegroundColor Yellow
    Write-Host "  • Opción 1: choco install openjdk11" -ForegroundColor White
    Write-Host "  • Opción 2: https://adoptium.net/" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Verificar directorio de diagramas
if (!(Test-Path $DIAGRAMAS_DIR)) {
    Write-Host "❌ Directorio '$DIAGRAMAS_DIR' no encontrado" -ForegroundColor Red
    exit 1
}

# Descargar PlantUML si no existe
if (!(Download-PlantUML)) {
    Write-Host "❌ No se pudo descargar PlantUML" -ForegroundColor Red
    Write-Host "Descarga manualmente desde: $PLANTUML_URL" -ForegroundColor Yellow
    exit 1
}

# Crear directorio de salida
New-OutputDirectory

# Menú de opciones
Write-Host "Selecciona formato(s) de salida:" -ForegroundColor Cyan
Write-Host "  1. PNG (recomendado para documentos)" -ForegroundColor White
Write-Host "  2. SVG (escalable, para web)" -ForegroundColor White
Write-Host "  3. PDF (para presentaciones)" -ForegroundColor White
Write-Host "  4. Todos los formatos" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Opción (1-4)"

switch ($choice) {
    "1" {
        Generate-Diagrams -Format "PNG"
    }
    "2" {
        Generate-Diagrams -Format "SVG"
    }
    "3" {
        Generate-Diagrams -Format "PDF"
    }
    "4" {
        Generate-Diagrams -Format "PNG"
        Generate-Diagrams -Format "SVG"
        Generate-Diagrams -Format "PDF"
    }
    default {
        Write-Host "⚠️ Opción inválida, generando PNG por defecto" -ForegroundColor Yellow
        Generate-Diagrams -Format "PNG"
    }
}

# Mostrar resumen
Show-Summary

# Abrir directorio
Open-OutputDirectory

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  ✅ PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

