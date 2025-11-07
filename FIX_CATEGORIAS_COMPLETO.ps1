# Script completo para verificar y arreglar categorías

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  VERIFICACION Y ARREGLO DE CATEGORIAS" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Verificar PostgreSQL
Write-Host "1. Verificando PostgreSQL..." -ForegroundColor Yellow
$postgresContainer = docker ps --filter "name=postgres" --format "{{.Names}}" | Select-Object -First 1

if (-not $postgresContainer) {
    Write-Host "   ❌ PostgreSQL NO está corriendo" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ PostgreSQL corriendo: $postgresContainer" -ForegroundColor Green

Write-Host "`n2. Verificando platillos sin categoría..." -ForegroundColor Yellow
$sinCategoria = docker exec $postgresContainer psql -U postgres -d restaurante_db -t -c "SELECT COUNT(*) FROM platillos WHERE categoria IS NULL OR categoria = '';"
$sinCategoria = $sinCategoria.Trim()
Write-Host "   📊 Platillos sin categoría: $sinCategoria" -ForegroundColor $(if ($sinCategoria -eq "0") { "Green" } else { "Red" })

if ($sinCategoria -ne "0") {
    Write-Host "`n3. Actualizando platillos sin categoría..." -ForegroundColor Yellow
    
    if (Test-Path "actualizar-categorias-platillos.sql") {
        Get-Content "actualizar-categorias-platillos.sql" | docker exec -i $postgresContainer psql -U postgres -d restaurante_db
        Write-Host "   ✅ Script ejecutado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Archivo actualizar-categorias-platillos.sql no encontrado" -ForegroundColor Yellow
        Write-Host "   Ejecutando actualización directa..." -ForegroundColor Cyan
        
        docker exec $postgresContainer psql -U postgres -d restaurante_db -c @"
BEGIN;

UPDATE platillos SET categoria = 'Almuerzos'
WHERE id_area = (SELECT id_area FROM area WHERE nombre = 'Cocina')
  AND (categoria IS NULL OR categoria = '' OR categoria = 'null');

UPDATE platillos SET categoria = 'Bebidas Frias'
WHERE id_area = (SELECT id_area FROM area WHERE nombre = 'Bebidas')
  AND (categoria IS NULL OR categoria = '' OR categoria = 'null');

UPDATE platillos SET categoria = 'Postres'
WHERE id_area = (SELECT id_area FROM area WHERE nombre = 'Coffee')
  AND (categoria IS NULL OR categoria = '' OR categoria = 'null');

COMMIT;
"@
        Write-Host "   ✅ Actualización completada" -ForegroundColor Green
    }
    
    # Verificar de nuevo
    Write-Host "`n4. Verificando resultado..." -ForegroundColor Yellow
    $sinCategoriaFinal = docker exec $postgresContainer psql -U postgres -d restaurante_db -t -c "SELECT COUNT(*) FROM platillos WHERE categoria IS NULL OR categoria = '';"
    $sinCategoriaFinal = $sinCategoriaFinal.Trim()
    
    if ($sinCategoriaFinal -eq "0") {
        Write-Host "   ✅ TODOS los platillos tienen categoría ahora" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Aún quedan $sinCategoriaFinal platillos sin categoría" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n   ✅ No hay platillos sin categoría" -ForegroundColor Green
}

Write-Host "`n5. Distribución de platillos por categoría:" -ForegroundColor Yellow
docker exec $postgresContainer psql -U postgres -d restaurante_db -c "
SELECT 
  a.nombre AS area,
  p.categoria,
  COUNT(*) AS cantidad
FROM platillos p
JOIN area a ON p.id_area = a.id_area
GROUP BY a.nombre, p.categoria
ORDER BY a.nombre, p.categoria;
"

Write-Host "`n================================================" -ForegroundColor Green
Write-Host "  ✅ VERIFICACION COMPLETADA" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host "`n📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Probar en la vista de mesero" -ForegroundColor White
Write-Host "   2. Seleccionar área y categoría" -ForegroundColor White
Write-Host "   3. Los platillos deben aparecer correctamente" -ForegroundColor White
Write-Host ""



