# 🔧 Solución: Error 500 al Agregar Platillos

## ❌ Problema

Al intentar agregar un platillo en producción, aparece el siguiente error:

```
Failed to load resource: the server responded with a status of 500
Error 500: 
```

**Causa**: La columna `categoria` no existe en la tabla `platillos` de la base de datos en producción.

---

## ✅ Solución Rápida

### Opción 1: Script Automático (Recomendado)

```powershell
.\agregar-columna-categoria.ps1
```

Este script:
1. ✅ Verifica si la columna existe
2. ✅ Agrega la columna si no existe
3. ✅ Crea el índice de optimización
4. ✅ Muestra la estructura actualizada

### Opción 2: Comando Manual

```powershell
# Agregar columna categoria
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "ALTER TABLE platillos ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);"

# Crear índice
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "CREATE INDEX IF NOT EXISTS ix_platillos_categoria ON platillos(categoria);"

# Verificar
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "\d+ platillos"
```

---

## 🔍 Diagnóstico Detallado

### Paso 1: Ver Logs del Backend

```powershell
docker logs chicoj-backend --tail 50
```

Busca errores como:
- `column "categoria" does not exist`
- `Invalid column name 'categoria'`
- `SequelizeDatabaseError`

### Paso 2: Verificar Estructura de la Tabla

```powershell
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "\d platillos"
```

Deberías ver la columna `categoria` en la lista. Si no está, aplica la solución.

### Paso 3: Ver Estado de Migraciones

```powershell
docker exec chicoj-backend npx prisma migrate status
```

---

## 🎯 Solución Completa Paso a Paso

### 1. Agregar la Columna

```sql
ALTER TABLE platillos 
ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);
```

### 2. Crear Índice de Optimización

```sql
CREATE INDEX IF NOT EXISTS ix_platillos_categoria 
ON platillos(categoria);
```

### 3. Actualizar Platillos Existentes (Opcional)

Si ya tienes platillos sin categoría, puedes actualizarlos:

```sql
-- Para platillos de Cocina
UPDATE platillos 
SET categoria = 'Almuerzos' 
WHERE id_area = (SELECT id_area FROM area WHERE nombre = 'Cocina') 
AND categoria IS NULL;

-- Para platillos de Bebidas
UPDATE platillos 
SET categoria = 'Bebidas Frias' 
WHERE id_area = (SELECT id_area FROM area WHERE nombre = 'Bebidas') 
AND categoria IS NULL;

-- Para platillos de Coffee
UPDATE platillos 
SET categoria = 'Cafe' 
WHERE id_area = (SELECT id_area FROM area WHERE nombre = 'Coffee') 
AND categoria IS NULL;
```

### 4. Reiniciar Backend

```powershell
docker restart chicoj-backend
```

### 5. Verificar en el Frontend

1. Abre el navegador en tu sitio
2. Ve a "Administrar Platillos"
3. Intenta agregar un nuevo platillo
4. Debería funcionar correctamente

---

## 🧪 Probar la Solución

### Desde el Navegador:

1. Abre las DevTools (F12)
2. Ve a la pestaña "Console"
3. Intenta agregar un platillo
4. No debería aparecer el error 500

### Desde el Backend:

```powershell
# Ver que el platillo se creó
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT nombre, categoria, precio FROM platillos ORDER BY id_platillo DESC LIMIT 5;"
```

---

## 🔄 Alternativa: Resetear Base de Datos

Si prefieres empezar desde cero con la estructura correcta:

```powershell
# ADVERTENCIA: Esto borra TODOS los datos
.\reset-database.ps1
```

Esto:
- ✅ Recrea todas las tablas con la estructura correcta
- ✅ Ejecuta el seed con 41 platillos con categorías
- ❌ **Elimina todos los datos existentes**

---

## 📊 Categorías Disponibles

### Cocina
- Desayunos
- Almuerzos
- Menu Infantil
- Refacciones
- Refacciones Tipicas

### Bebidas
- Bebidas Frias
- Licuados
- Cervezas
- Bebidas Desechables

### Coffee
- Cafe
- Postres

---

## ⚠️ Prevención

Para evitar este problema en el futuro:

### 1. Siempre Aplicar Migraciones en Producción

```powershell
.\aplicar-migraciones.ps1
```

### 2. Usar Prisma Migrate

```powershell
docker exec chicoj-backend npx prisma migrate deploy
```

### 3. Mantener Sincronizados los Ambientes

Desarrollo → Staging → Producción

### 4. Verificar Schema Antes de Desplegar

```powershell
docker exec chicoj-backend npx prisma migrate status
docker exec chicoj-backend npx prisma validate
```

---

## 🆘 Si Aún Hay Problemas

### Problema: La columna existe pero sigue el error

**Solución**: Verifica que el backend esté usando la versión correcta de Prisma:

```powershell
# Regenerar cliente Prisma
docker exec chicoj-backend npx prisma generate

# Reiniciar backend
docker restart chicoj-backend
```

### Problema: Error de permisos al crear la columna

**Solución**: Verifica los permisos del usuario de PostgreSQL:

```powershell
# Conectarse como superusuario
docker exec -it chicoj-postgres psql -U postgres -d restaurante_db

# Otorgar permisos
GRANT ALL PRIVILEGES ON TABLE platillos TO postgres;
```

### Problema: El frontend no muestra las categorías

**Solución**: Verifica el endpoint de categorías:

```powershell
# Ver logs del backend
docker logs chicoj-backend -f

# Probar el endpoint manualmente
curl http://tu-dominio.com/api/menu/categorias/Cocina
```

---

## 📝 Verificación Final

Checklist para confirmar que todo funciona:

- [ ] Columna `categoria` existe en tabla `platillos`
- [ ] Índice `ix_platillos_categoria` existe
- [ ] Backend reiniciado sin errores
- [ ] Frontend carga categorías correctamente
- [ ] Se puede crear un platillo nuevo
- [ ] El platillo aparece en la lista
- [ ] La categoría se muestra correctamente

---

## 📞 Comandos Útiles

```powershell
# Ver estructura de tabla
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "\d+ platillos"

# Ver platillos con categorías
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT nombre, categoria FROM platillos LIMIT 10;"

# Ver logs del backend en tiempo real
docker logs chicoj-backend -f

# Verificar que el backend esté corriendo
docker ps | grep chicoj-backend

# Reiniciar todos los contenedores
docker restart chicoj-backend chicoj-postgres chicoj-nginx
```

---

**Última actualización**: Noviembre 3, 2025  
**Versión**: 1.0  
**Problema**: Error 500 al agregar platillos por falta de columna `categoria`

