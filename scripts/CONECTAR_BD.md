# 📚 Guía para Ejecutar Scripts SQL en PostgreSQL

## 🚀 Métodos para Ejecutar SQL

### **Método 1: Ejecutar un Archivo SQL**

```bash
# Ejecutar un archivo SQL completo
docker-compose exec -T postgres psql -U postgres -d restaurante_db < mi-script.sql

# O usar el script helper
chmod +x scripts/ejecutar-sql.sh
./scripts/ejecutar-sql.sh mi-script.sql restaurante_db
```

### **Método 2: Ejecutar Comandos SQL Directamente**

```bash
# Ejecutar un comando SQL desde la línea de comandos
docker-compose exec -T postgres psql -U postgres -d restaurante_db -c "SELECT * FROM usuarios;"

# O usar el script helper
chmod +x scripts/ejecutar-sql-directo.sh
./scripts/ejecutar-sql-directo.sh "SELECT * FROM usuarios;" restaurante_db
```

### **Método 3: Conectarse Interactivamente a PostgreSQL**

```bash
# Conectarse a PostgreSQL de forma interactiva
docker-compose exec postgres psql -U postgres -d restaurante_db

# Una vez dentro, puedes ejecutar comandos SQL:
# SELECT * FROM usuarios;
# \dt  (ver tablas)
# \d usuarios  (ver estructura de tabla)
# \q  (salir)
```

### **Método 4: Ejecutar Múltiples Comandos SQL**

```bash
# Ejecutar múltiples comandos separados por punto y coma
docker-compose exec -T postgres psql -U postgres -d restaurante_db <<EOF
SELECT * FROM usuarios;
SELECT * FROM empleados;
SELECT * FROM roles;
EOF
```

## 📋 Ejemplos Útiles

### **Ver Usuarios con Relaciones**

```bash
docker-compose exec -T postgres psql -U postgres -d restaurante_db -c "
SELECT 
    u.id_usuario,
    u.usuario_nombre,
    e.nombre || ' ' || e.apellidos AS nombre_completo,
    e.correo_electronico,
    r.nombre_rol
FROM usuarios u
LEFT JOIN empleados e ON u.id_empleado = e.id_empleado
LEFT JOIN roles r ON u.id_rol = r.id_rol
ORDER BY u.id_usuario;
"
```

### **Crear un Usuario de Prueba**

```bash
docker-compose exec -T postgres psql -U postgres -d restaurante_db -c "
-- Primero crear el empleado
INSERT INTO empleados (nombre, apellidos, correo_electronico)
VALUES ('Test', 'Usuario', 'test@example.com')
RETURNING id_empleado;

-- Luego crear el usuario (necesitas el id_empleado del paso anterior)
-- Y también necesitas un id_rol válido
"
```

### **Ver Todas las Tablas**

```bash
docker-compose exec -T postgres psql -U postgres -d restaurante_db -c "\dt"
```

### **Ver Estructura de una Tabla**

```bash
docker-compose exec -T postgres psql -U postgres -d restaurante_db -c "\d usuarios"
```

### **Ver Datos de una Tabla Específica**

```bash
# Ver usuarios
docker-compose exec -T postgres psql -U postgres -d restaurante_db -c "SELECT * FROM usuarios;"

# Ver empleados
docker-compose exec -T postgres psql -U postgres -d restaurante_db -c "SELECT * FROM empleados;"

# Ver roles
docker-compose exec -T postgres psql -U postgres -d restaurante_db -c "SELECT * FROM roles;"
```

### **Actualizar un Usuario**

```bash
docker-compose exec -T postgres psql -U postgres -d restaurante_db -c "
UPDATE usuarios 
SET usuario_nombre = 'nuevo_nombre'
WHERE id_usuario = 1;
"
```

### **Eliminar un Usuario**

```bash
docker-compose exec -T postgres psql -U postgres -d restaurante_db -c "
DELETE FROM usuarios 
WHERE id_usuario = 1;
"
```

## 🔧 Scripts Helper Disponibles

### **1. ejecutar-sql.sh**
Ejecuta un archivo SQL completo.

```bash
chmod +x scripts/ejecutar-sql.sh
./scripts/ejecutar-sql.sh mi-script.sql restaurante_db
```

### **2. ejecutar-sql-directo.sh**
Ejecuta un comando SQL directamente.

```bash
chmod +x scripts/ejecutar-sql-directo.sh
./scripts/ejecutar-sql-directo.sh "SELECT * FROM usuarios;" restaurante_db
```

## ⚠️ Notas Importantes

1. **Base de Datos**: Si no especificas la base de datos, usa `restaurante_db` por defecto.
2. **Usuario**: El usuario por defecto es `postgres`.
3. **Backups**: Siempre haz un backup antes de ejecutar scripts que modifiquen datos:
   ```bash
   ./scripts/backup.sh
   ```
4. **Transacciones**: Para operaciones críticas, considera usar transacciones:
   ```sql
   BEGIN;
   -- tus comandos SQL
   COMMIT;
   -- o ROLLBACK; si hay error
   ```

## 🆘 Solución de Problemas

### **Error: "database does not exist"**
```bash
# Ver qué bases de datos existen
docker-compose exec -T postgres psql -U postgres -c "\l"

# Crear la base de datos si no existe
docker-compose exec -T postgres psql -U postgres -c "CREATE DATABASE restaurante_db;"
```

### **Error: "relation does not exist"**
```bash
# Verificar si las tablas existen
docker-compose exec -T postgres psql -U postgres -d restaurante_db -c "\dt"

# Si no existen, ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy
```

