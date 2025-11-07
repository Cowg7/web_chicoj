# 🔧 COMANDOS MANUALES PARA BACKUP

Si prefieres hacer el backup manualmente sin usar los scripts.

---

## 📦 WINDOWS (PowerShell)

### **1. Crear directorio de backups**
```powershell
New-Item -ItemType Directory -Path "backups" -Force
```

### **2. Hacer backup**
```powershell
$fecha = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec chicoj-postgres pg_dump -U postgres restaurante_db > "backups/backup_$fecha.sql"
```

### **3. Verificar**
```powershell
Get-ChildItem backups/ | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

### **4. Comprimir (opcional)**
```powershell
$fecha = Get-Date -Format "yyyyMMdd_HHmmss"
Compress-Archive -Path "backups/backup_$fecha.sql" -DestinationPath "backups/backup_$fecha.zip"
```

---

## 🐧 LINUX/MAC (Bash)

### **1. Crear directorio de backups**
```bash
mkdir -p backups
```

### **2. Hacer backup**
```bash
FECHA=$(date +%Y%m%d_%H%M%S)
docker exec chicoj-postgres pg_dump -U postgres restaurante_db > backups/backup_$FECHA.sql
```

### **3. Verificar**
```bash
ls -lh backups/ | tail -5
```

### **4. Comprimir (opcional)**
```bash
FECHA=$(date +%Y%m%d_%H%M%S)
tar -czf backups/backup_$FECHA.tar.gz -C backups backup_$FECHA.sql
```

---

## 🔍 VERIFICAR EL BACKUP

### **Ver tamaño del archivo**
```bash
# Windows
(Get-Item backups/backup_XXXXXXXX.sql).Length / 1KB

# Linux/Mac
du -h backups/backup_XXXXXXXX.sql
```

### **Contar líneas**
```bash
# Windows
(Get-Content backups/backup_XXXXXXXX.sql | Measure-Object -Line).Lines

# Linux/Mac
wc -l backups/backup_XXXXXXXX.sql
```

### **Ver qué tablas incluye**
```bash
# Windows
Get-Content backups/backup_XXXXXXXX.sql | Select-String "CREATE TABLE"

# Linux/Mac
grep "CREATE TABLE" backups/backup_XXXXXXXX.sql
```

---

## 📤 SUBIR A PRODUCCIÓN (SCP)

### **Desde tu máquina local al servidor**

```bash
# Reemplaza:
# - usuario: tu usuario SSH
# - servidor: IP o dominio del servidor
# - /ruta/proyecto: ruta donde está el proyecto

scp backups/backup_XXXXXXXX.sql usuario@servidor:/ruta/proyecto/backups/

# O si está comprimido
scp backups/backup_XXXXXXXX.zip usuario@servidor:/ruta/proyecto/backups/
```

---

## 🔄 RESTAURAR EN PRODUCCIÓN

### **En el servidor de producción**

```bash
# 1. Hacer backup de seguridad
FECHA=$(date +%Y%m%d_%H%M%S)
docker exec chicoj-postgres pg_dump -U postgres restaurante_db > backups/backup_antes_restaurar_$FECHA.sql

# 2. Detener backend
docker-compose stop backend

# 3. Restaurar
docker exec -i chicoj-postgres psql -U postgres -d restaurante_db < backups/backup_XXXXXXXX.sql

# 4. Reiniciar backend
docker-compose up -d backend

# 5. Verificar
curl http://localhost:3000/api/health
```

---

## 🧹 LIMPIAR BACKUPS ANTIGUOS

### **Mantener solo los últimos 5 backups**

**Windows:**
```powershell
Get-ChildItem backups/ -Filter "backup_*.sql" | 
  Sort-Object LastWriteTime -Descending | 
  Select-Object -Skip 5 | 
  Remove-Item
```

**Linux/Mac:**
```bash
cd backups
ls -t backup_*.sql | tail -n +6 | xargs rm -f
```

---

## 📊 INFORMACIÓN DEL BACKUP

### **Ver qué contiene el backup**

```bash
# Conectar a una BD temporal y cargar el backup
docker exec -it chicoj-postgres psql -U postgres

# Dentro de psql:
CREATE DATABASE test_backup;
\c test_backup
\i /path/to/backup.sql

-- Ver tablas
\dt

-- Contar registros
SELECT 'roles' as tabla, COUNT(*) FROM roles
UNION ALL
SELECT 'platillos', COUNT(*) FROM platillos
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios;

-- Eliminar BD de prueba
\c postgres
DROP DATABASE test_backup;
\q
```

---

## 🔐 BACKUP SOLO DE DATOS (Sin estructura)

```bash
# Solo datos (INSERT statements)
docker exec chicoj-postgres pg_dump -U postgres --data-only restaurante_db > backups/solo_datos.sql

# Solo estructura (CREATE statements)
docker exec chicoj-postgres pg_dump -U postgres --schema-only restaurante_db > backups/solo_estructura.sql
```

---

## 📋 BACKUP DE TABLAS ESPECÍFICAS

```bash
# Solo la tabla roles
docker exec chicoj-postgres pg_dump -U postgres -t roles restaurante_db > backups/backup_roles.sql

# Solo roles y usuarios
docker exec chicoj-postgres pg_dump -U postgres -t roles -t usuarios restaurante_db > backups/backup_roles_usuarios.sql
```

---

## ⚡ COMANDO TODO EN UNO

**Windows:**
```powershell
$f = "backups/backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"; 
docker exec chicoj-postgres pg_dump -U postgres restaurante_db > "$f.sql"; 
Compress-Archive -Path "$f.sql" -DestinationPath "$f.zip"; 
Write-Host "Backup creado: $f.zip"
```

**Linux/Mac:**
```bash
f="backups/backup_$(date +%Y%m%d_%H%M%S)" && \
docker exec chicoj-postgres pg_dump -U postgres restaurante_db > "$f.sql" && \
tar -czf "$f.tar.gz" -C backups "$(basename $f.sql)" && \
echo "Backup creado: $f.tar.gz"
```

---

## 🆘 TROUBLESHOOTING

### **Error: "No such file or directory"**
```bash
# Crear el directorio primero
mkdir -p backups
```

### **Error: "permission denied"**
```bash
# Dar permisos
chmod 755 backups
```

### **Error: "could not connect to server"**
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Si no está, iniciarlo
docker-compose up -d postgres
```

### **Backup vacío (0 KB)**
```bash
# Verificar el nombre del contenedor
docker ps --filter "name=postgres"

# Verificar el nombre de la BD
docker exec TU_CONTENEDOR psql -U postgres -l
```

---

## 📅 AUTOMATIZAR BACKUPS (Cron)

### **Linux/Mac - Backup automático diario**

```bash
# Editar crontab
crontab -e

# Agregar esta línea (backup diario a las 2 AM)
0 2 * * * cd /ruta/proyecto && docker exec chicoj-postgres pg_dump -U postgres restaurante_db > backups/backup_$(date +\%Y\%m\%d).sql
```

### **Windows - Tarea programada**

Crear archivo `backup-automatico.ps1`:
```powershell
$fecha = Get-Date -Format "yyyyMMdd"
docker exec chicoj-postgres pg_dump -U postgres restaurante_db > "C:\ruta\proyecto\backups\backup_$fecha.sql"
```

Luego programar con Task Scheduler.

---

**Listo! Con estos comandos puedes hacer backups manualmente cuando lo necesites.** 🚀



