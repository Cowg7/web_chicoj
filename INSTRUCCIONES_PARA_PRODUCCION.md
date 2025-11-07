# 🚀 Instrucciones para Aplicar en Producción

## 📋 Problema
El sistema está generando **Error 500** al intentar agregar platillos porque falta la columna `categoria` en la tabla `platillos`.

---

## ✅ Solución - Ejecutar en el Servidor de Producción

### Opción 1: Script SQL Directo (Recomendado)

Ejecutar este archivo: **`fix-categoria-produccion.sql`**

```bash
# Si usan Docker:
docker exec -i <nombre-contenedor-postgres> psql -U postgres -d restaurante_db < fix-categoria-produccion.sql

# Si PostgreSQL está instalado directamente:
psql -U postgres -d restaurante_db -f fix-categoria-produccion.sql
```

### Opción 2: Comandos Uno por Uno

```bash
# 1. Agregar columna categoria
docker exec <nombre-contenedor-postgres> psql -U postgres -d restaurante_db -c "ALTER TABLE platillos ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);"

# 2. Crear índice para optimización
docker exec <nombre-contenedor-postgres> psql -U postgres -d restaurante_db -c "CREATE INDEX IF NOT EXISTS ix_platillos_categoria ON platillos(categoria);"

# 3. Reiniciar el backend
docker restart <nombre-contenedor-backend>
```

### Opción 3: Usando Prisma (Si tienen configurado)

```bash
# Aplicar migraciones pendientes
docker exec <nombre-contenedor-backend> npx prisma migrate deploy

# Reiniciar backend
docker restart <nombre-contenedor-backend>
```

---

## 🔍 Verificación

Después de aplicar los cambios, verificar:

### 1. Verificar que la columna existe

```bash
docker exec <nombre-contenedor-postgres> psql -U postgres -d restaurante_db -c "\d platillos"
```

**Buscar en la salida**:
```
 categoria | character varying(100) |
```

### 2. Ver logs del backend

```bash
docker logs <nombre-contenedor-backend> --tail 50
```

No debería haber errores relacionados con la columna `categoria`.

### 3. Probar desde el frontend

1. Ir a: `https://tu-dominio.com/templates/administracion/platillo`
2. Intentar agregar un nuevo platillo
3. No debería aparecer el error 500

---

## 📦 Archivos a Transferir

Necesitas estos archivos del repositorio actualizado:

### Backend (Obligatorios):
```
Chicoj_System_R-T/backend/prisma/schema.prisma
Chicoj_System_R-T/backend/prisma/seed.js
Chicoj_System_R-T/backend/prisma/migrations/20251103_schema_completo/migration.sql
```

### SQL para ejecutar directamente:
```
fix-categoria-produccion.sql
```

### Documentación:
```
INSTRUCCIONES_PARA_PRODUCCION.md (este archivo)
chicoj-frontend/docs/FIX_ERROR_500_PLATILLOS.md
```

---

## 🔄 Proceso Completo de Actualización

### Paso 1: Backup de la Base de Datos

```bash
# Hacer backup antes de cualquier cambio
docker exec <nombre-contenedor-postgres> pg_dump -U postgres restaurante_db > backup_antes_categoria_$(date +%Y%m%d_%H%M%S).sql
```

### Paso 2: Aplicar Cambios

```bash
# Opción A: Usando el archivo SQL
docker exec -i <nombre-contenedor-postgres> psql -U postgres -d restaurante_db < fix-categoria-produccion.sql

# Opción B: Comando directo
docker exec <nombre-contenedor-postgres> psql -U postgres -d restaurante_db -c "
ALTER TABLE platillos ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);
CREATE INDEX IF NOT EXISTS ix_platillos_categoria ON platillos(categoria);
"
```

### Paso 3: Actualizar Código del Backend (Si hay cambios)

```bash
# Copiar nuevos archivos al servidor
scp -r Chicoj_System_R-T/backend/prisma usuario@servidor:/ruta/al/proyecto/Chicoj_System_R-T/backend/

# En el servidor, regenerar cliente Prisma
docker exec <nombre-contenedor-backend> npx prisma generate

# Reiniciar backend
docker restart <nombre-contenedor-backend>
```

### Paso 4: Verificar

```bash
# Ver que todo funciona
docker ps
docker logs <nombre-contenedor-backend> --tail 20
```

---

## ⚠️ Problemas Comunes y Soluciones

### Problema 1: "Permission denied"

```bash
# Ejecutar con sudo
sudo docker exec <nombre-contenedor-postgres> psql -U postgres -d restaurante_db -c "ALTER TABLE platillos ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);"
```

### Problema 2: "Database does not exist"

```bash
# Verificar nombre de la base de datos
docker exec <nombre-contenedor-postgres> psql -U postgres -c "\l"

# Usar el nombre correcto (podría ser 'chicoj_db' o similar)
```

### Problema 3: "Column already exists"

```bash
# Verificar que la columna existe
docker exec <nombre-contenedor-postgres> psql -U postgres -d restaurante_db -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'platillos';"

# Si ya existe, solo reiniciar el backend
docker restart <nombre-contenedor-backend>
```

### Problema 4: Backend sigue dando error

```bash
# Verificar que el backend esté usando la versión correcta
docker exec <nombre-contenedor-backend> npx prisma generate
docker exec <nombre-contenedor-backend> npx prisma migrate status
docker restart <nombre-contenedor-backend>

# Ver logs en tiempo real
docker logs <nombre-contenedor-backend> -f
```

---

## 📊 Datos de Ejemplo (Opcional)

Si desean poblar la base de datos con platillos de ejemplo:

```bash
# Ejecutar el seed
docker exec <nombre-contenedor-backend> npm run seed
```

Esto creará:
- 6 roles (Administrador, Gerente, Cajero, Mesero, Cocina, Tour)
- 8 usuarios de prueba
- 41 platillos con categorías
- 3 áreas (Cocina, Bebidas, Coffee)

**⚠️ Advertencia**: El seed usa `upsert`, por lo que actualizará registros existentes.

---

## 🆘 Si Nada Funciona

### Opción Nuclear: Resetear Solo la Tabla Platillos

```sql
-- ADVERTENCIA: Esto borra todos los platillos
TRUNCATE TABLE platillos CASCADE;

-- Recrear con la estructura correcta
DROP TABLE IF EXISTS platillos;
CREATE TABLE platillos (
    id_platillo SERIAL PRIMARY KEY,
    nombre VARCHAR(120) UNIQUE NOT NULL,
    descripcion VARCHAR(255),
    precio DECIMAL(10, 2) NOT NULL,
    id_area INTEGER NOT NULL,
    categoria VARCHAR(100),
    disponible BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_area) REFERENCES area(id_area)
);

CREATE INDEX ix_platillos_area ON platillos(id_area);
CREATE INDEX ix_platillos_categoria ON platillos(categoria);
CREATE INDEX ix_platillos_disponible ON platillos(disponible);
```

Luego ejecutar el seed para poblar con datos.

---

## 📞 Contacto y Soporte

Si tienen problemas aplicando los cambios:

1. Tomar captura de pantalla del error
2. Enviar logs del backend: `docker logs <nombre-contenedor-backend> --tail 100`
3. Enviar resultado de: `docker exec <nombre-contenedor-postgres> psql -U postgres -d restaurante_db -c "\d platillos"`

---

## ✅ Checklist de Verificación Final

Después de aplicar todos los cambios, verificar:

- [ ] Columna `categoria` existe en tabla `platillos`
- [ ] Índice `ix_platillos_categoria` existe
- [ ] Backend se inició sin errores
- [ ] Frontend carga categorías correctamente:
  - [ ] Cocina: Desayunos, Almuerzos, Menu Infantil, Refacciones, Refacciones Tipicas
  - [ ] Bebidas: Bebidas Frias, Licuados, Cervezas, Bebidas Desechables
  - [ ] Coffee: Cafe, Postres
- [ ] Se puede crear un nuevo platillo desde el frontend
- [ ] El platillo nuevo aparece en la lista
- [ ] No hay errores 500 en la consola del navegador

---

## 📝 Notas Adicionales

- **Tiempo estimado**: 5-10 minutos
- **Downtime**: ~1 minuto (solo al reiniciar backend)
- **Reversible**: Sí (se puede eliminar la columna si es necesario)
- **Afecta datos existentes**: No (solo agrega columna nueva)

---

**Fecha de creación**: Noviembre 3, 2025  
**Versión**: 1.0  
**Urgencia**: Media-Alta (funcionalidad crítica bloqueada)

