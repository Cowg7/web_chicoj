# 🚀 CÓMO EJECUTAR EL SCRIPT DE PLATILLOS

## 📋 Resumen del Script

**Archivo:** `platillos-chicoj-completo.sql`

**Total de platillos:** ~90 platillos

### Distribución:
- **Cocina (53 platillos):**
  - Desayunos: 15
  - Almuerzos: 16
  - Menú Infantil: 5
  - Refacciones: 13
  - Refacciones Típicas: 5

- **Bebidas (39 platillos):**
  - Bebidas Frías: 10
  - Licuados: 13
  - Cervezas: 14

- **Coffee (8 platillos):**
  - Postres: 8

---

## 🐳 MÉTODO 1: Ejecutar desde Docker (Recomendado)

### **Windows (PowerShell):**

```powershell
# Ejecutar el script
Get-Content platillos-chicoj-completo.sql | docker exec -i chicoj-postgres psql -U postgres -d restaurante_db

# O con Docker Compose
Get-Content platillos-chicoj-completo.sql | docker-compose exec -T postgres psql -U postgres -d restaurante_db
```

### **Linux/Mac (Bash):**

```bash
# Ejecutar el script
docker exec -i chicoj-postgres psql -U postgres -d restaurante_db < platillos-chicoj-completo.sql

# O con Docker Compose
docker-compose exec -T postgres psql -U postgres -d restaurante_db < platillos-chicoj-completo.sql
```

---

## 💻 MÉTODO 2: Desde la Consola Interactiva

### **Paso 1: Conectar a PostgreSQL**

```bash
docker exec -it chicoj-postgres psql -U postgres -d restaurante_db
```

### **Paso 2: Copiar y Pegar el Contenido**

Una vez dentro:
```sql
restaurante_db=# 
```

Abre el archivo `platillos-chicoj-completo.sql`, copia TODO el contenido y pégalo en la consola.

### **Paso 3: Verificar**

```sql
-- Ver resumen
SELECT 
  a.nombre AS area,
  p.categoria,
  COUNT(*) AS cantidad
FROM platillos p
JOIN area a ON p.id_area = a.id_area
GROUP BY a.nombre, p.categoria
ORDER BY a.nombre, p.categoria;
```

---

## 🔍 VERIFICACIÓN DESPUÉS DE EJECUTAR

### **Contar platillos totales:**

```bash
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT COUNT(*) FROM platillos;"
```

**Resultado esperado:**
```
 count 
-------
    90
(1 row)
```

---

### **Ver resumen por categoría:**

```bash
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT a.nombre AS area, p.categoria, COUNT(*) AS cantidad FROM platillos p JOIN area a ON p.id_area = a.id_area GROUP BY a.nombre, p.categoria ORDER BY a.nombre, p.categoria;"
```

**Resultado esperado:**
```
  area   |      categoria       | cantidad 
---------+----------------------+----------
 Bebidas | Bebidas Frias        |       10
 Bebidas | Cervezas             |       14
 Bebidas | Licuados             |       13
 Cocina  | Almuerzos            |       16
 Cocina  | Desayunos            |       15
 Cocina  | Menu Infantil        |        5
 Cocina  | Refacciones          |       13
 Cocina  | Refacciones Tipicas  |        5
 Coffee  | Postres              |        8
(9 rows)
```

---

### **Ver platillos más caros:**

```bash
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT nombre, CONCAT('Q', precio) AS precio FROM platillos ORDER BY precio DESC LIMIT 5;"
```

**Resultado esperado:**
```
       nombre        | precio  
---------------------+---------
 Caldo de Kaq Ik     | Q125.00
 Caldo de Gallina    | Q80.00
 Ensalada del Chef   | Q75.00
 Costilla a la Barba | Q75.00
 ...
```

---

## ⚠️ ANTES DE EJECUTAR

### **1. Hacer Backup (Opcional pero Recomendado):**

```bash
# Backup de la tabla platillos
docker exec chicoj-postgres pg_dump -U postgres -d restaurante_db -t platillos > backup-platillos-$(date +%Y%m%d).sql
```

---

### **2. Verificar que las áreas existen:**

```bash
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT * FROM area;"
```

**Debe mostrar:**
```
 id_area | nombre  |         descripcion          
---------+---------+------------------------------
       1 | Cocina  | Preparación de alimentos...
       2 | Bebidas | Bebidas y cocteles
       3 | Coffee  | Café y postres
```

Si no existen, ejecuta primero:
```sql
INSERT INTO area (nombre, descripcion) VALUES 
  ('Cocina', 'Preparación de alimentos calientes'),
  ('Bebidas', 'Bebidas y cocteles'),
  ('Coffee', 'Café y postres');
```

---

## 🧹 LIMPIAR PLATILLOS EXISTENTES (OPCIONAL)

Si quieres empezar desde cero:

```bash
# ⚠️ CUIDADO: Esto elimina TODOS los platillos
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "DELETE FROM platillos;"
```

Luego ejecuta el script completo.

---

## 🔄 ACTUALIZAR PLATILLOS EXISTENTES

Si ya tienes platillos y quieres actualizar solo algunos:

```bash
# Actualizar precio de un platillo específico
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "UPDATE platillos SET precio = 40.00 WHERE nombre = 'Desayuno Chapín';"

# Cambiar disponibilidad
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "UPDATE platillos SET disponible = false WHERE nombre = 'Caldo de Kaq Ik';"
```

---

## 📊 CONSULTAS ÚTILES

### **Ver todos los desayunos:**

```bash
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT nombre, CONCAT('Q', precio) AS precio FROM platillos WHERE categoria = 'Desayunos' ORDER BY precio;"
```

---

### **Ver platillos de Coffee:**

```bash
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT nombre, CONCAT('Q', precio) AS precio FROM platillos WHERE id_area = 3 ORDER BY nombre;"
```

---

### **Buscar platillo por nombre:**

```bash
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT * FROM platillos WHERE nombre ILIKE '%chocolate%';"
```

---

## ❌ SOLUCIÓN DE PROBLEMAS

### **Error: "duplicate key value"**

**Causa:** Ya existen platillos con esos nombres.

**Solución:**
```bash
# Ver qué platillos ya existen
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT nombre FROM platillos ORDER BY nombre;"

# Opción 1: Eliminar duplicados antes de ejecutar
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "DELETE FROM platillos WHERE nombre = 'Desayuno Chapín';"

# Opción 2: Limpiar todo
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "DELETE FROM platillos;"
```

---

### **Error: "relation 'platillos' does not exist"**

**Causa:** La tabla no existe.

**Solución:**
```bash
# Ejecutar migraciones de Prisma
cd Chicoj_System_R-T/backend
docker-compose exec backend npx prisma migrate deploy
```

---

### **Error: "relation 'area' does not exist"**

**Causa:** La tabla área no existe.

**Solución:** Igual que arriba, ejecutar migraciones de Prisma.

---

## 📝 NOTAS IMPORTANTES

1. **Transacción:** El script usa `BEGIN` y `COMMIT`, por lo que si hay un error, no se insertará nada.

2. **Nombres únicos:** Cada platillo debe tener un nombre único. Si intentas insertar uno duplicado, fallará.

3. **Precios:** Usa punto (.) no coma (,) para decimales: `35.00` ✅, `35,00` ❌

4. **IDs de área:**
   - `1` = Cocina
   - `2` = Bebidas
   - `3` = Coffee

5. **Categorías:** Deben coincidir exactamente con las definidas en el sistema (mayúsculas/minúsculas importan).

---

## ✅ CHECKLIST DE EJECUCIÓN

- [ ] Hacer backup (opcional)
- [ ] Verificar que las áreas existen
- [ ] Ejecutar el script `platillos-chicoj-completo.sql`
- [ ] Verificar que se insertaron correctamente
- [ ] Probar desde el frontend

---

## 🎯 COMANDOS RÁPIDOS

```bash
# Todo en uno: Ejecutar y verificar
docker exec -i chicoj-postgres psql -U postgres -d restaurante_db < platillos-chicoj-completo.sql && \
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT COUNT(*) AS total FROM platillos;" && \
echo "✅ Script ejecutado exitosamente"
```

---

**¡Listo! Ahora tienes todos los platillos del restaurante Chicoj en tu base de datos.** 🎉

