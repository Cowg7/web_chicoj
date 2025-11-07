# ⚡ Comandos Rápidos - Chicoj System

## 🚀 Comandos Esenciales del Servidor

### Conectarse al Servidor
```bash
ssh root@165.227.103.238
# o
ssh root@coopechicoj.com
```

### Navegar al Directorio del Proyecto
```bash
cd /opt/chicoj
```

---

## 📦 Gestión de Contenedores Docker

### Ver Estado de Contenedores
```bash
docker-compose ps
```

### Ver Logs en Tiempo Real
```bash
# Todos los servicios
docker-compose logs -f

# Solo nginx
docker-compose logs -f nginx

# Solo backend
docker-compose logs -f backend

# Solo postgres
docker-compose logs -f postgres

# Últimas 100 líneas
docker-compose logs --tail=100
```

### Iniciar Servicios
```bash
# Todos los servicios
docker-compose up -d

# Un servicio específico
docker-compose up -d nginx
docker-compose up -d backend
```

### Detener Servicios
```bash
# Todos los servicios
docker-compose down

# Solo detener (sin eliminar)
docker-compose stop

# Un servicio específico
docker-compose stop nginx
```

### Reiniciar Servicios
```bash
# Todos los servicios
docker-compose restart

# Un servicio específico
docker-compose restart nginx
docker-compose restart backend
```

### Reconstruir Contenedores
```bash
# Reconstruir todo
docker-compose build

# Reconstruir y reiniciar
docker-compose up -d --build

# Solo backend
docker-compose build backend
docker-compose up -d --build backend
```

---

## 🔧 Configuración y Mantenimiento

### Editar Archivo .env
```bash
nano .env
# o
vim .env
```

### Editar Configuración de Nginx
```bash
nano nginx/conf.d/default.conf
```

### Aplicar Cambios de Configuración
```bash
# Después de editar .env o nginx
docker-compose down
docker-compose up -d
```

### Ver Variables de Entorno Actuales
```bash
docker-compose config
```

---

## 🔒 Gestión de SSL/Certificados

### Obtener Certificado SSL (Primera Vez)
```bash
# Método 1: Webroot (preferido)
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email tu-email@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d coopechicoj.com \
  -d www.coopechicoj.com

# Método 2: Standalone (si webroot falla)
docker-compose stop nginx
docker-compose run --rm --entrypoint="" certbot \
  certbot certonly --standalone \
  --email tu-email@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d coopechicoj.com \
  -d www.coopechicoj.com
docker-compose up -d nginx
```

### Renovar Certificados SSL
```bash
# Manual
docker-compose run --rm certbot renew

# Probar renovación (dry-run)
docker-compose run --rm certbot renew --dry-run
```

### Ver Información del Certificado
```bash
openssl x509 -in certbot/conf/live/coopechicoj.com/fullchain.pem -noout -dates
```

### Backup de Certificados
```bash
tar -czf certbot-backup-$(date +%Y%m%d).tar.gz certbot/
```

---

## 🗄️ Gestión de Base de Datos

### Acceder a PostgreSQL
```bash
# Usando psql dentro del contenedor
docker-compose exec postgres psql -U postgres -d restaurante_db

# Ver tablas
\dt

# Ver usuarios
SELECT * FROM usuarios;

# Salir
\q
```

### Backup de Base de Datos
```bash
# Crear backup
docker-compose exec postgres pg_dump -U postgres restaurante_db > backup_$(date +%Y%m%d).sql

# Crear backup comprimido
docker-compose exec postgres pg_dump -U postgres restaurante_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restaurar Base de Datos
```bash
# Desde archivo SQL
docker-compose exec -T postgres psql -U postgres restaurante_db < backup.sql

# Desde archivo comprimido
gunzip -c backup.sql.gz | docker-compose exec -T postgres psql -U postgres restaurante_db
```

### Ejecutar Seed (Datos Iniciales)
```bash
docker-compose exec backend npm run seed
```

### Reset de Base de Datos (⚠️ CUIDADO)
```bash
# Esto borrará TODOS los datos
docker-compose exec backend npx prisma migrate reset --force
```

---

## 🔍 Diagnóstico y Troubleshooting

### Ver Uso de Recursos
```bash
# CPU y memoria de contenedores
docker stats

# Espacio en disco
df -h

# Espacio usado por Docker
docker system df
```

### Ver Procesos en Puerto 80
```bash
sudo netstat -tulpn | grep :80
# o
sudo lsof -i :80
```

### Ver Procesos en Puerto 443
```bash
sudo netstat -tulpn | grep :443
```

### Liberar Puerto Ocupado
```bash
# Encontrar proceso
sudo lsof -i :80

# Matar proceso (reemplaza PID)
sudo kill -9 PID

# O detener servicios comunes
sudo systemctl stop apache2
sudo systemctl stop nginx
```

### Verificar DNS
```bash
# Método 1
nslookup coopechicoj.com

# Método 2
dig coopechicoj.com

# Método 3
host coopechicoj.com
```

### Probar Conectividad HTTP/HTTPS
```bash
# HTTP
curl -I http://coopechicoj.com

# HTTPS
curl -I https://coopechicoj.com

# Health check
curl http://coopechicoj.com/health
curl https://coopechicoj.com/health

# API
curl http://coopechicoj.com/api/health
```

### Ver Logs del Sistema
```bash
# Logs de Docker
journalctl -u docker -f

# Logs del sistema
tail -f /var/log/syslog
```

---

## 🧹 Limpieza y Mantenimiento

### Limpiar Contenedores Detenidos
```bash
docker container prune -f
```

### Limpiar Imágenes No Usadas
```bash
docker image prune -a -f
```

### Limpiar Volúmenes No Usados
```bash
docker volume prune -f
```

### Limpiar Todo (⚠️ CUIDADO)
```bash
# Esto elimina TODO lo no usado
docker system prune -a --volumes -f
```

### Limpiar Logs
```bash
# Truncar logs de Docker
echo "" > $(docker inspect --format='{{.LogPath}}' chicoj-nginx)
echo "" > $(docker inspect --format='{{.LogPath}}' chicoj-backend)
```

---

## 📊 Monitoreo

### Ver Logs de Acceso de Nginx
```bash
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

### Ver Logs de Error de Nginx
```bash
docker-compose exec nginx tail -f /var/log/nginx/error.log
```

### Monitorear Conexiones Activas
```bash
# Conexiones a la base de datos
docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Conexiones HTTP
netstat -an | grep :80 | wc -l
```

---

## 🚀 Despliegue de Actualizaciones

### Actualizar Solo el Frontend
```bash
cd /opt/chicoj

# Opción 1: Si actualizaste archivos en el servidor
docker-compose restart nginx

# Opción 2: Subir nuevos archivos desde tu máquina local
# En tu máquina Windows:
scp -r chicoj-frontend/* root@165.227.103.238:/opt/chicoj/chicoj-frontend/

# En el servidor:
docker-compose restart nginx
```

### Actualizar Solo el Backend
```bash
cd /opt/chicoj

# Si actualizaste código
docker-compose build backend
docker-compose up -d backend

# Ver logs para verificar
docker-compose logs -f backend
```

### Actualizar Dependencias del Backend
```bash
# Reconstruir con --no-cache para forzar actualización
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Migración de Base de Datos
```bash
# Aplicar migraciones
docker-compose exec backend npx prisma migrate deploy

# Ver estado de migraciones
docker-compose exec backend npx prisma migrate status
```

---

## 🔐 Seguridad

### Cambiar Contraseñas
```bash
# Editar .env
nano .env

# Cambiar:
# - POSTGRES_PASSWORD
# - JWT_SECRET
# - PGADMIN_PASSWORD

# Aplicar cambios
docker-compose down
docker-compose up -d
```

### Ver Intentos de Acceso Fallidos
```bash
# SSH
grep "Failed password" /var/log/auth.log | tail -20

# Nginx
docker-compose logs nginx | grep "401\|403\|404"
```

### Actualizar Sistema Operativo
```bash
sudo apt update
sudo apt upgrade -y
```

---

## 📱 Comandos Útiles desde Windows (PowerShell)

### Subir Archivos al Servidor
```powershell
# Un archivo
scp archivo.txt root@165.227.103.238:/opt/chicoj/

# Una carpeta completa
scp -r carpeta root@165.227.103.238:/opt/chicoj/

# Frontend completo
scp -r chicoj-frontend/* root@165.227.103.238:/opt/chicoj/chicoj-frontend/
```

### Descargar Archivos del Servidor
```powershell
# Un archivo
scp root@165.227.103.238:/opt/chicoj/backup.sql ./

# Carpeta completa
scp -r root@165.227.103.238:/opt/chicoj/certbot ./
```

### Conectar por SSH
```powershell
ssh root@165.227.103.238
```

---

## 🎯 Scripts de Automatización Incluidos

### Configurar Dominio
```bash
./scripts/setup-domain.sh
```

### Configurar SSL
```bash
./scripts/setup-ssl-certbot.sh
```

### Verificar Sistema
```bash
./scripts/verify-domain.sh
```

### Ver Estado
```bash
./scripts/status.sh
```

### Ver Logs
```bash
./scripts/logs.sh
```

### Backup
```bash
./scripts/backup.sh
```

---

## ⚡ One-Liners Útiles

```bash
# Reiniciar todo el sistema
docker-compose down && docker-compose up -d && docker-compose logs -f

# Ver IPs conectadas
netstat -an | grep ESTABLISHED | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr

# Espacio usado por logs de Docker
du -sh /var/lib/docker/containers/*/*-json.log

# Verificar salud de servicios
docker-compose ps && curl -s http://localhost/health && echo " - HTTP OK" || echo " - HTTP FAIL"

# Backup rápido
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz chicoj-frontend/ Chicoj_System_R-T/backend/ certbot/ .env docker-compose.yml nginx/

# Ver últimos errores
docker-compose logs --tail=50 | grep -i error

# Limpiar cache de Cloudflare (si usas API)
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

## 📞 Números de Emergencia (Comandos de Rescate)

### Sistema No Responde
```bash
# 1. Reiniciar Docker
sudo systemctl restart docker

# 2. Reiniciar todo
docker-compose down && docker-compose up -d

# 3. Ver qué pasó
docker-compose logs --tail=100
```

### Base de Datos Corrupta
```bash
# 1. Backup actual
docker-compose exec postgres pg_dump -U postgres restaurante_db > emergency_backup.sql

# 2. Reiniciar PostgreSQL
docker-compose restart postgres

# 3. Si falla, restaurar desde backup
docker-compose exec -T postgres psql -U postgres restaurante_db < backup_anterior.sql
```

### Nginx No Inicia
```bash
# 1. Verificar configuración
docker-compose exec nginx nginx -t

# 2. Ver logs
docker-compose logs nginx

# 3. Reiniciar
docker-compose restart nginx
```

### Puerto 80 Bloqueado
```bash
# Encontrar y matar proceso
sudo lsof -i :80 | grep LISTEN | awk '{print $2}' | xargs sudo kill -9

# Reiniciar nginx
docker-compose up -d nginx
```

---

## 🎉 ¡Comandos Más Usados!

```bash
# Top 5 comandos que más usarás:

# 1. Ver logs
docker-compose logs -f

# 2. Reiniciar
docker-compose restart

# 3. Ver estado
docker-compose ps

# 4. Conectar a DB
docker-compose exec postgres psql -U postgres -d restaurante_db

# 5. Actualizar backend
docker-compose build backend && docker-compose up -d backend
```

---

**💡 Tip**: Guarda este archivo en tu servidor en `/opt/chicoj/QUICK_COMMANDS.md` para tener siempre acceso rápido a estos comandos.

