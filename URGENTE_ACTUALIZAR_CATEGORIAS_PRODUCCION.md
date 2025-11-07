# 🚨 URGENTE: ACTUALIZAR CATEGORÍAS EN PRODUCCIÓN

## ❌ PROBLEMA

En producción, **TODOS los platillos (102) tienen la categoría vacía**, por lo que:
- ❌ El mesero no puede ver platillos al seleccionar categoría
- ❌ Todos aparecen en "Sin Categoría"
- ❌ No se pueden tomar órdenes correctamente

**Logs de producción:**
```
📈 Estadísticas del menú: {total: 102, conCategoria: 0, sinCategoria: 102}
Platillo "Desayuno Chapín": área=true, categoría="" (buscando "Desayunos") = false
📊 Platillos filtrados: 0
```

---

## ✅ SOLUCIÓN (5 minutos)

Ejecutar el script `actualizar-categorias-platillos.sql` en el servidor de producción.

---

## 🔧 PASOS PARA EL EQUIPO DE PRODUCCIÓN

### **PASO 1: Subir el archivo al servidor**

**Archivo a subir:** `actualizar-categorias-platillos.sql`

```bash
# Desde tu máquina local:
scp actualizar-categorias-platillos.sql usuario@servidor:/ruta/al/proyecto/
```

O sube el archivo manualmente vía FTP/SFTP/Panel de control.

---

### **PASO 2: Conectar al servidor**

```bash
ssh usuario@servidor-produccion
cd /ruta/al/proyecto
```

---

### **PASO 3: Ejecutar el script**

**Linux/Mac:**
```bash
docker exec -i chicoj-postgres psql -U postgres -d restaurante_db < actualizar-categorias-platillos.sql
```

**Windows PowerShell:**
```powershell
Get-Content actualizar-categorias-platillos.sql | docker exec -i chicoj-postgres psql -U postgres -d restaurante_db
```

**Salida esperada:**
```
BEGIN
UPDATE XX  (número de platillos actualizados en Cocina)
UPDATE XX  (número de platillos actualizados en Bebidas)
UPDATE XX  (número de platillos actualizados en Coffee)
COMMIT

 area    | categoria        | cantidad_platillos
---------+------------------+-------------------
 Bebidas | Bebidas Frias    | XX
 Cocina  | Almuerzos        | XX
 Coffee  | Postres          | XX
```

---

### **PASO 4: Verificar que funcionó**

```bash
# Ver platillos sin categoría (debe ser 0)
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT COUNT(*) FROM platillos WHERE categoria IS NULL OR categoria = '';"
```

**Resultado esperado:** `count = 0`

---

```bash
# Ver distribución de platillos
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT a.nombre AS area, p.categoria, COUNT(*) AS cantidad FROM platillos p JOIN area a ON p.id_area = a.id_area GROUP BY a.nombre, p.categoria ORDER BY a.nombre;"
```

**Resultado esperado:**
```
  area   |      categoria       | cantidad 
---------+----------------------+----------
 Bebidas | Bebidas Frias        |    39
 Cocina  | Almuerzos            |    55
 Coffee  | Postres              |     8
```

---

### **PASO 5: Probar en el navegador**

1. Ir a: https://coopechicoj.com
2. Login como mesero
3. Ir a **Mesero Comanda**
4. Seleccionar **Área: Cocina**
5. Seleccionar **Categoría: Almuerzos**
6. **Ahora SÍ deben aparecer los platillos** ✅

---

## 📋 QUÉ HACE EL SCRIPT

El script actualiza los platillos sin categoría asignándoles una por defecto:

```sql
-- Cocina sin categoría → "Almuerzos"
UPDATE platillos SET categoria = 'Almuerzos'
WHERE id_area = (SELECT id_area FROM area WHERE nombre = 'Cocina')
AND (categoria IS NULL OR categoria = '');

-- Bebidas sin categoría → "Bebidas Frias"
UPDATE platillos SET categoria = 'Bebidas Frias'
WHERE id_area = (SELECT id_area FROM area WHERE nombre = 'Bebidas')
AND (categoria IS NULL OR categoria = '');

-- Coffee sin categoría → "Postres"
UPDATE platillos SET categoria = 'Postres'
WHERE id_area = (SELECT id_area FROM area WHERE nombre = 'Coffee')
AND (categoria IS NULL OR categoria = '');
```

---

## ⚠️ IMPORTANTE

- **NO requiere reiniciar el backend**
- **NO requiere downtime**
- **Es seguro:** Solo actualiza categorías vacías
- **Reversible:** Si algo sale mal, los platillos siguen existiendo

---

## 🔄 SI QUERÉS ASIGNAR CATEGORÍAS ESPECÍFICAS

Si después querés cambiar las categorías por defecto a algo más específico:

```bash
# Conectar a PostgreSQL
docker exec -it chicoj-postgres psql -U postgres -d restaurante_db

# Actualizar platillos específicos
UPDATE platillos 
SET categoria = 'Desayunos' 
WHERE nombre ILIKE '%desayuno%' OR nombre ILIKE '%huevos%';

UPDATE platillos 
SET categoria = 'Licuados' 
WHERE nombre ILIKE '%licuado%' OR nombre ILIKE '%smoothie%';

UPDATE platillos 
SET categoria = 'Cervezas' 
WHERE nombre ILIKE '%cerveza%' OR nombre ILIKE '%gallo%' OR nombre ILIKE '%heineken%';

-- Salir
\q
```

---

## 📞 RESUMEN PARA EL DESARROLLADOR DE PRODUCCIÓN

```
Hola,

Necesitamos actualizar las categorías de los platillos en producción.

PROBLEMA:
- Los 102 platillos tienen categoría vacía
- El mesero no puede seleccionar platillos
- El sistema funciona en local pero no en producción

SOLUCIÓN:
1. Subir archivo: actualizar-categorias-platillos.sql
2. Ejecutar en el servidor:
   docker exec -i chicoj-postgres psql -U postgres -d restaurante_db < actualizar-categorias-platillos.sql
3. Verificar con:
   docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT COUNT(*) FROM platillos WHERE categoria IS NULL OR categoria = '';"
   (Debe mostrar: count = 0)

TIEMPO: 2 minutos
RIESGO: Muy bajo (solo actualiza categorías)
NO REQUIERE: Reiniciar servicios

Archivo adjunto: actualizar-categorias-platillos.sql

¡Gracias!
```

---

## ✅ DESPUÉS DE EJECUTAR

Los logs en producción deberían verse así:

```
📈 Estadísticas del menú: {total: 102, conCategoria: 102, sinCategoria: 0}
Platillo "Desayuno Chapín": área=true, categoría="Almuerzos" ✅
📊 Platillos filtrados: 15 ✅
```

---

## 📊 COMPARACIÓN: ANTES vs DESPUÉS

### **ANTES:**
```
conCategoria: 0
sinCategoria: 102
Platillos filtrados: 0  ❌
```

### **DESPUÉS:**
```
conCategoria: 102
sinCategoria: 0
Platillos filtrados: 15+  ✅
```

---

## 🆘 TROUBLESHOOTING

### **Error: "relation 'platillos' does not exist"**
La base de datos no está correcta. Contactar al equipo de desarrollo.

### **Error: "permission denied"**
Usar el usuario correcto de PostgreSQL: `-U postgres`

### **El script se ejecutó pero sigue sin funcionar**
1. Verificar que actualizó los registros: `SELECT COUNT(*) FROM platillos WHERE categoria IS NOT NULL;`
2. Limpiar caché del navegador (Ctrl+Shift+R)
3. Verificar logs en la consola del navegador (F12)

---

**PRIORIDAD: ALTA** - El sistema no puede tomar órdenes sin esto.

**TIEMPO ESTIMADO:** 2-5 minutos

**IMPACTO:** Los meseros podrán volver a tomar órdenes correctamente



