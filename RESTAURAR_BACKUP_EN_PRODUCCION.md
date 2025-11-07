# 📥 RESTAURAR BACKUP EN PRODUCCIÓN

## ⚠️ IMPORTANTE - LEER ANTES DE EJECUTAR

Este proceso **reemplazará TODA la base de datos** de producción con los datos del backup.

**Antes de continuar, asegúrate de:**
1. ✅ Hacer un backup de la base de datos actual de producción
2. ✅ Detener el backend temporalmente
3. ✅ Notificar a los usuarios (habrá downtime)
4. ✅ Tener permisos de administrador

---

## 📋 TIEMPO ESTIMADO

- **Backup de producción:** 2 minutos
- **Restauración:** 3-5 minutos
- **Verificación:** 2 minutos
- **Total:** ~10 minutos

---

## 🎯 PASO 1: HACER BACKUP DE PRODUCCIÓN ACTUAL

**⚠️ MUY IMPORTANTE: No omitas este paso**

```bash
# Conectar al servidor de producción
ssh usuario@servidor-produccion

# Ir al directorio del proyecto
cd /ruta/al/proyecto

# Crear directorio de backups
mkdir -p backups

# Hacer backup de la BD actual
FECHA=$(date +%Y%m%d_%H%M%S)
docker exec chicoj-postgres pg_dump -U postgres restaurante_db > backups/backup_produccion_antes_restaurar_$FECHA.sql

# Verificar que se creó
ls -lh backups/backup_produccion_antes_restaurar_$FECHA.sql
```

**Guarda este backup en un lugar seguro. Lo necesitarás si algo sale mal.**

---

## 🔄 PASO 2: DETENER EL BACKEND

```bash
# Detener el backend (para evitar conexiones durante la restauración)
docker-compose stop backend

# Verificar que se detuvo
docker ps | grep backend
# No debe mostrar nada
```

---

## 📤 PASO 3: SUBIR EL BACKUP AL SERVIDOR

Desde tu máquina local, sube el archivo de backup al servidor:

### **Opción A: Con SCP (Linux/Mac/PowerShell)**

```bash
# Desde tu máquina local
scp backups/backup_restaurante_db_XXXXXXXX.sql usuario@servidor:/ruta/al/proyecto/backups/

# O si está comprimido (.tar.gz)
scp backups/backup_restaurante_db_XXXXXXXX.tar.gz usuario@servidor:/ruta/al/proyecto/backups/
```

### **Opción B: Con SFTP**

```bash
sftp usuario@servidor
cd /ruta/al/proyecto/backups
put backups/backup_restaurante_db_XXXXXXXX.sql
exit
```

### **Opción C: Por Panel de Control / FTP**

Si tu hosting tiene panel de control (cPanel, Plesk, etc.):
1. Accede al panel
2. Ve a "Administrador de archivos"
3. Sube el archivo al directorio `/ruta/al/proyecto/backups/`

---

## 📥 PASO 4: DESCOMPRIMIR (Si está comprimido)

```bash
# Si el archivo es .tar.gz
cd backups
tar -xzf backup_restaurante_db_XXXXXXXX.tar.gz

# Si el archivo es .zip
unzip backup_restaurante_db_XXXXXXXX.zip

# Verificar que se descomprimió
ls -lh backup_restaurante_db_XXXXXXXX.sql
```

---

## 🗄️ PASO 5: RESTAURAR LA BASE DE DATOS

### **Opción A: Restauración Completa (REEMPLAZA TODO)**

```bash
# CUIDADO: Esto elimina TODA la base de datos actual y la reemplaza
docker exec -i chicoj-postgres psql -U postgres -d restaurante_db < backups/backup_restaurante_db_XXXXXXXX.sql
```

**Si aparece el error: "database is being accessed by other users"**

Necesitas eliminar conexiones activas:

```bash
# Ver conexiones activas
docker exec chicoj-postgres psql -U postgres -c "SELECT pid, usename, application_name FROM pg_stat_activity WHERE datname = 'restaurante_db';"

# Terminar todas las conexiones (excepto la tuya)
docker exec chicoj-postgres psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'restaurante_db' AND pid <> pg_backend_pid();"

# Ahora sí, restaurar
docker exec -i chicoj-postgres psql -U postgres -d restaurante_db < backups/backup_restaurante_db_XXXXXXXX.sql
```

---

### **Opción B: Restauración Segura (Drop y Create)**

```bash
# 1. Conectar a PostgreSQL
docker exec -it chicoj-postgres psql -U postgres

# 2. Dentro de psql, ejecutar:
-- Desconectar todos los usuarios
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'restaurante_db' 
AND pid <> pg_backend_pid();

-- Eliminar la base de datos
DROP DATABASE restaurante_db;

-- Crear nueva base de datos
CREATE DATABASE restaurante_db;

-- Salir
\q

# 3. Restaurar el backup
docker exec -i chicoj-postgres psql -U postgres -d restaurante_db < backups/backup_restaurante_db_XXXXXXXX.sql
```

---

## ✅ PASO 6: VERIFICAR LA RESTAURACIÓN

```bash
# Conectar a la base de datos
docker exec -it chicoj-postgres psql -U postgres -d restaurante_db

# Dentro de psql, ejecutar:
```

```sql
-- Ver todas las tablas
\dt

-- Contar registros en tablas importantes
SELECT 'roles' as tabla, COUNT(*) as registros FROM roles
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'empleados', COUNT(*) FROM empleados
UNION ALL
SELECT 'platillos', COUNT(*) FROM platillos
UNION ALL
SELECT 'area', COUNT(*) FROM area
UNION ALL
SELECT 'ordenes', COUNT(*) FROM ordenes;

-- Ver los roles disponibles
SELECT * FROM roles ORDER BY id_rol;

-- Salir
\q
```

**Verifica que:**
- ✅ Todas las tablas existen
- ✅ Los roles "Bebidas", "Coffee", "Tour" están presentes
- ✅ Los platillos están cargados
- ✅ Los usuarios existen

---

## 🚀 PASO 7: REINICIAR EL BACKEND

```bash
# Iniciar el backend
docker-compose up -d backend

# Ver logs para verificar que inició correctamente
docker-compose logs -f backend

# Debes ver:
# ✅ Conectado a la base de datos
# ✅ Servidor corriendo en puerto 3000
```

**Presiona Ctrl+C para salir de los logs**

---

## 🧪 PASO 8: PROBAR QUE TODO FUNCIONA

### **Desde el servidor:**

```bash
# Probar health check
curl http://localhost:3000/api/health

# Debe responder:
# {"status":"OK","timestamp":"...","service":"Chicoj Backend API"}

# Probar endpoint de roles
# Primero obtén un token:
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"TU_PASSWORD"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Probar roles
curl -X GET http://localhost:3000/api/users/roles \
  -H "Authorization: Bearer $TOKEN"

# Debe mostrar todos los roles incluyendo Bebidas, Coffee, Tour
```

---

### **Desde el navegador:**

1. Ir a https://coopechicoj.com
2. Iniciar sesión
3. Ir a "Gestionar Usuarios"
4. Intentar crear un nuevo rol
5. Verificar que los roles "Bebidas", "Coffee", "Tour" aparezcan

---

## 🎉 PASO 9: NOTIFICAR A LOS USUARIOS

Una vez que todo esté funcionando:
- ✅ Notifica que el sistema ya está disponible
- ✅ Los usuarios pueden volver a acceder

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **Error: "role 'postgres' does not exist"**

```bash
# Verificar el usuario correcto
docker exec chicoj-postgres psql -U postgres -l

# Si el usuario es diferente, ajusta los comandos
docker exec chicoj-postgres psql -U TU_USUARIO -d restaurante_db
```

---

### **Error: "permission denied"**

```bash
# Dar permisos al archivo
chmod 644 backups/backup_restaurante_db_XXXXXXXX.sql

# Intentar de nuevo
docker exec -i chicoj-postgres psql -U postgres -d restaurante_db < backups/backup_restaurante_db_XXXXXXXX.sql
```

---

### **Error: "No such file or directory"**

```bash
# Verificar la ruta completa
pwd
ls -la backups/

# Usar ruta absoluta
docker exec -i chicoj-postgres psql -U postgres -d restaurante_db < /ruta/completa/backups/backup_restaurante_db_XXXXXXXX.sql
```

---

### **La restauración se cuelga o tarda mucho**

Es normal si la base de datos es grande. Espera pacientemente.

Si quieres ver el progreso:

```bash
# En otra terminal, ver el tamaño del proceso
docker exec chicoj-postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('restaurante_db'));"
```

---

## 🔄 ROLLBACK: RESTAURAR BACKUP ANTERIOR

Si algo sale mal, puedes restaurar el backup que hiciste en el PASO 1:

```bash
# Detener backend
docker-compose stop backend

# Restaurar backup anterior
docker exec -i chicoj-postgres psql -U postgres -d restaurante_db < backups/backup_produccion_antes_restaurar_FECHA.sql

# Reiniciar backend
docker-compose up -d backend
```

---

## 📊 CHECKLIST COMPLETO

- [ ] 1. Hacer backup de producción actual
- [ ] 2. Detener el backend
- [ ] 3. Subir archivo de backup al servidor
- [ ] 4. Descomprimir (si es necesario)
- [ ] 5. Restaurar la base de datos
- [ ] 6. Verificar tablas y datos
- [ ] 7. Reiniciar el backend
- [ ] 8. Probar endpoints y frontend
- [ ] 9. Notificar a usuarios

---

## 📞 COMANDOS TODO EN UNO (Avanzado)

Si tienes experiencia, puedes usar este script completo:

```bash
#!/bin/bash

# Variables
BACKUP_FILE="backup_restaurante_db_XXXXXXXX.sql"  # Reemplaza con tu archivo
FECHA=$(date +%Y%m%d_%H%M%S)

# 1. Backup de producción
docker exec chicoj-postgres pg_dump -U postgres restaurante_db > backups/backup_produccion_$FECHA.sql

# 2. Detener backend
docker-compose stop backend

# 3. Restaurar
docker exec -i chicoj-postgres psql -U postgres -d restaurante_db < backups/$BACKUP_FILE

# 4. Reiniciar backend
docker-compose up -d backend

# 5. Verificar
sleep 5
curl http://localhost:3000/api/health

echo "✅ Restauración completada"
```

---

## ⏱️ TIEMPO DE DOWNTIME

- **Mínimo:** 2-3 minutos
- **Normal:** 5-7 minutos
- **Con problemas:** 10-15 minutos

**Recomendación:** Hazlo en horario de bajo tráfico (madrugada).

---

## 🎯 RESULTADO FINAL

Después de completar estos pasos:
- ✅ Base de datos actualizada con todos los roles (Bebidas, Coffee, Tour)
- ✅ Todos los platillos actualizados
- ✅ Endpoint `/api/users/roles` funcionando
- ✅ Panel de administración completamente funcional

---

**¿Necesitas ayuda durante el proceso? Contacta al equipo de desarrollo.**




