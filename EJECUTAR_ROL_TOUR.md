# 🚀 AGREGAR ROL "TOUR" DESDE DOCKER

## 📋 Archivo: `agregar-rol-tour.sql`

Este script agrega el rol "Tour" a la base de datos de manera segura (verifica que no exista antes de insertarlo).

---

## 🐳 MÉTODO 1: Ejecutar desde Docker (Recomendado)

### **Windows (PowerShell):**

```powershell
# Opción 1: Con nombre del contenedor
Get-Content agregar-rol-tour.sql | docker exec -i chicoj-postgres psql -U postgres -d restaurante_db

# Opción 2: Con Docker Compose
Get-Content agregar-rol-tour.sql | docker-compose exec -T postgres psql -U postgres -d restaurante_db
```

---

### **Linux/Mac (Bash):**

```bash
# Opción 1: Con nombre del contenedor
docker exec -i chicoj-postgres psql -U postgres -d restaurante_db < agregar-rol-tour.sql

# Opción 2: Con Docker Compose
docker-compose exec -T postgres psql -U postgres -d restaurante_db < agregar-rol-tour.sql
```

---

## 💻 MÉTODO 2: Desde la Consola Interactiva de PostgreSQL

### **Paso 1: Conectar a PostgreSQL**

```bash
docker exec -it chicoj-postgres psql -U postgres -d restaurante_db
```

### **Paso 2: Insertar el rol manualmente**

```sql
-- Insertar el rol Tour
INSERT INTO roles (nombre_rol, descripcion)
VALUES ('Tour', 'Gestión de tours y grupos turísticos');

-- Verificar que se creó
SELECT * FROM roles WHERE nombre_rol = 'Tour';

-- Salir
\q
```

---

## ⚡ MÉTODO 3: Comando Directo (Más Rápido)

### **Windows PowerShell:**

```powershell
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "INSERT INTO roles (nombre_rol, descripcion) VALUES ('Tour', 'Gestión de tours y grupos turísticos') ON CONFLICT (nombre_rol) DO NOTHING; SELECT * FROM roles WHERE nombre_rol = 'Tour';"
```

---

### **Linux/Mac:**

```bash
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "INSERT INTO roles (nombre_rol, descripcion) VALUES ('Tour', 'Gestión de tours y grupos turísticos') ON CONFLICT (nombre_rol) DO NOTHING; SELECT * FROM roles WHERE nombre_rol = 'Tour';"
```

---

## 🔍 VERIFICAR QUE SE CREÓ CORRECTAMENTE

```bash
# Ver el rol creado
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT * FROM roles WHERE nombre_rol = 'Tour';"
```

**Resultado esperado:**
```
 id_rol | nombre_rol |          descripcion          
--------+------------+-------------------------------
      8 | Tour       | Gestión de tours y grupos...
(1 row)
```

---

## 📊 VER TODOS LOS ROLES

```bash
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT * FROM roles ORDER BY id_rol;"
```

**Resultado esperado:**
```
 id_rol |   nombre_rol   |          descripcion          
--------+----------------+-------------------------------
      1 | Administrador  | Acceso completo al sistema
      2 | Mesero         | Gestión de órdenes y comandas
      3 | Cocina         | KDS de cocina (comida caliente)
      4 | Cajero         | Acceso a caja y reportes
      5 | Bebidas        | KDS de bebidas (bar)
      6 | Coffee         | KDS de coffee shop (café y postres)
      7 | Gerente        | Acceso a reportes y estadísticas
      8 | Tour           | Gestión de tours y grupos...
(8 rows)
```

---

## ⚠️ SI EL ROL YA EXISTE

No te preocupes, el script detecta si ya existe y **NO** genera error:

```
⚠️  El rol "Tour" ya existe, no se realizaron cambios
```

---

## 🧹 ELIMINAR EL ROL (Si lo agregaste por error)

```bash
# Eliminar el rol Tour
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "DELETE FROM roles WHERE nombre_rol = 'Tour';"
```

**⚠️ CUIDADO:** Solo elimina el rol si **NO hay usuarios** asociados a él.

---

## ✅ SIGUIENTE PASO: Crear Usuario con Rol Tour

Una vez creado el rol, puedes crear un usuario:

```sql
-- Conectar a la base de datos
docker exec -it chicoj-postgres psql -U postgres -d restaurante_db

-- Crear empleado
INSERT INTO empleados (nombre, apellido, dpi, telefono, direccion, estado)
VALUES ('Juan', 'Pérez', '1234567890101', '12345678', 'Ciudad', 'activo')
RETURNING id_empleado;

-- Supongamos que devolvió id_empleado = 5

-- Crear usuario con rol Tour
INSERT INTO usuarios (username, password, id_rol, id_empleado, estado)
VALUES (
  'tour1',
  '$2b$10$abcdefghijklmnopqrstuv',  -- Password hasheado
  (SELECT id_rol FROM roles WHERE nombre_rol = 'Tour'),
  5,  -- id_empleado del paso anterior
  'activo'
);
```

**💡 NOTA:** El password debe estar hasheado con bcrypt. Es mejor crear usuarios desde el frontend en "Gestionar Usuarios".

---

## 🎯 RESUMEN DE COMANDOS RÁPIDOS

```bash
# 1. Agregar rol Tour
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "INSERT INTO roles (nombre_rol, descripcion) VALUES ('Tour', 'Gestión de tours y grupos turísticos') ON CONFLICT (nombre_rol) DO NOTHING;"

# 2. Verificar
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT * FROM roles WHERE nombre_rol = 'Tour';"

# 3. Ver todos los roles
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "SELECT * FROM roles ORDER BY id_rol;"
```

---

## 📝 NOTAS IMPORTANTES

1. **El script es seguro:** Usa `ON CONFLICT DO NOTHING` para evitar duplicados
2. **No requiere reiniciar:** El backend leerá los roles automáticamente
3. **Múltiples ejecuciones:** Puedes ejecutar el script varias veces sin problemas

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### **Error: "relation 'roles' does not exist"**

La tabla no existe. Ejecuta primero las migraciones:

```bash
cd Chicoj_System_R-T/backend
docker-compose exec backend npx prisma migrate deploy
```

---

### **Error: "permission denied"**

Usa el usuario correcto de PostgreSQL:

```bash
docker exec chicoj-postgres psql -U postgres -d restaurante_db
```

---

### **Error: "could not connect to server"**

El contenedor de PostgreSQL no está corriendo:

```bash
docker-compose up -d postgres
```

---

## ✨ BONUS: Script para Agregar TODOS los Roles

Si necesitas agregar todos los roles del sistema:

```sql
INSERT INTO roles (nombre_rol, descripcion) VALUES 
  ('Administrador', 'Acceso completo al sistema'),
  ('Mesero', 'Gestión de órdenes y comandas'),
  ('Cocina', 'KDS de cocina (comida caliente)'),
  ('Cajero', 'Acceso a caja y reportes'),
  ('Bebidas', 'KDS de bebidas (bar)'),
  ('Coffee', 'KDS de coffee shop (café y postres)'),
  ('Gerente', 'Acceso a reportes y estadísticas'),
  ('Tour', 'Gestión de tours y grupos turísticos')
ON CONFLICT (nombre_rol) DO NOTHING;
```

Ejecutar:

```bash
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "INSERT INTO roles (nombre_rol, descripcion) VALUES ('Administrador', 'Acceso completo al sistema'), ('Mesero', 'Gestión de órdenes y comandas'), ('Cocina', 'KDS de cocina (comida caliente)'), ('Cajero', 'Acceso a caja y reportes'), ('Bebidas', 'KDS de bebidas (bar)'), ('Coffee', 'KDS de coffee shop (café y postres)'), ('Gerente', 'Acceso a reportes y estadísticas'), ('Tour', 'Gestión de tours y grupos turísticos') ON CONFLICT (nombre_rol) DO NOTHING;"
```

---

**¡Listo! Ahora puedes agregar el rol "Tour" desde Docker en segundos.** 🎉






