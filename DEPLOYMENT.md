# 🚀 Guía de Deployment - Sistema Chicoj

Esta guía te llevará paso a paso para hacer deployment del Sistema Chicoj en un VPS de DigitalOcean con Ubuntu 22.04.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Paso 1: Configurar el Servidor](#paso-1-configurar-el-servidor)
- [Paso 2: Clonar el Proyecto](#paso-2-clonar-el-proyecto)
- [Paso 3: Configurar Variables de Entorno](#paso-3-configurar-variables-de-entorno)
- [Paso 4: Hacer Deployment](#paso-4-hacer-deployment)
- [Paso 5: Configurar Dominio (Opcional)](#paso-5-configurar-dominio-opcional)
- [Paso 6: Configurar SSL con Let's Encrypt](#paso-6-configurar-ssl-con-lets-encrypt)
- [Mantenimiento](#mantenimiento)
- [Solución de Problemas](#solución-de-problemas)

---

## 📦 Requisitos Previos

### Lo que necesitas:

1. **VPS en DigitalOcean** (o cualquier proveedor)
   - OS: Ubuntu 22.04 x64 LTS
   - Mínimo: 2GB RAM, 1 vCPU, 50GB SSD
   - Recomendado: 4GB RAM, 2 vCPU, 80GB SSD

2. **Acceso SSH** al servidor
   - Usuario root o usuario con privilegios sudo

3. **Dominio** (opcional pero recomendado)
   - Para configurar SSL/HTTPS
   - Apuntando al IP de tu VPS

---

## 🔧 Paso 1: Configurar el Servidor

### 1.1 Conectarse al servidor vía SSH

```bash
ssh root@TU_IP_DEL_SERVIDOR
```

### 1.2 Ejecutar script de configuración inicial

Una vez en el servidor, descarga el repositorio y ejecuta el script de configuración:

```bash
# Crear directorio para la aplicación
mkdir -p /opt/chicoj
cd /opt/chicoj

# Clonar el repositorio (usa tu URL)
git clone https://github.com/TU_USUARIO/chicoj.git .

# O si ya tienes los archivos, súbelos con scp desde tu máquina local:
# scp -r * root@TU_IP:/opt/chicoj/

# Dar permisos de ejecución a los scripts
chmod +x setup-server.sh
chmod +x deploy.sh

# Ejecutar configuración inicial del servidor
sudo ./setup-server.sh
```

Este script:
- ✅ Actualiza el sistema
- ✅ Instala Docker y Docker Compose
- ✅ Configura firewall (UFW)
- ✅ Crea swap de 2GB
- ✅ Configura fail2ban
- ✅ Crea usuario 'chicoj'
- ✅ Optimiza el kernel

**Tiempo estimado:** 5-10 minutos

---

## 📁 Paso 2: Clonar el Proyecto

Si no lo hiciste en el paso anterior:

```bash
cd /opt/chicoj

# Clonar tu repositorio
git clone https://github.com/TU_USUARIO/chicoj.git .

# O subir archivos desde tu máquina local
# Desde tu máquina local (no en el servidor):
# scp -r /ruta/local/chicoj/* root@TU_IP:/opt/chicoj/
```

---

## ⚙️ Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo .env

```bash
cd /opt/chicoj
cp env.example .env
nano .env
```

### 3.2 Configurar variables importantes

Edita las siguientes variables en el archivo `.env`:

```bash
# ============ BASE DE DATOS ============
POSTGRES_USER=postgres
POSTGRES_PASSWORD=TuPasswordSuperSeguro123!
POSTGRES_DB=restaurante_db

# ============ BACKEND / API ============
NODE_ENV=production
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro_minimo_32_caracteres_aqui
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# CORS - Agrega tu dominio aquí
ALLOWED_ORIGINS=http://tu-dominio.com,https://tu-dominio.com

# ============ PUERTOS ============
HTTP_PORT=80
HTTPS_PORT=443
FRONTEND_PORT=8080

# ============ PGADMIN (OPCIONAL) ============
PGADMIN_PORT=5050
PGADMIN_EMAIL=admin@chicoj.com
PGADMIN_PASSWORD=OtroPasswordSeguro456!
```

### 3.3 Generar JWT_SECRET seguro

Puedes generar un JWT_SECRET aleatorio con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

O usa este generador online: https://www.grc.com/passwords.htm

**⚠️ IMPORTANTE:** 
- Nunca uses las contraseñas de ejemplo
- Guarda una copia segura de tu archivo `.env`
- Nunca subas `.env` a Git

---

## 🚀 Paso 4: Hacer Deployment

### 4.1 Ejecutar script de deployment

```bash
cd /opt/chicoj
./deploy.sh
```

Este script:
- ✅ Verifica que Docker esté instalado
- ✅ Construye las imágenes Docker
- ✅ Inicia todos los servicios
- ✅ Ejecuta migraciones de base de datos
- ✅ Opcionalmente ejecuta el seed

**Tiempo estimado:** 5-10 minutos (primera vez)

### 4.2 Verificar que todo esté corriendo

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### 4.3 Probar la aplicación

Abre tu navegador y visita:

```
http://TU_IP_DEL_SERVIDOR
```

Deberías ver la página de login del sistema Chicoj.

---

## 🌐 Paso 5: Configurar Dominio (Opcional)

### 5.1 Configurar DNS

En tu proveedor de dominios (Namecheap, GoDaddy, etc.):

1. Crea un registro A:
   - **Host:** `@` (o tu dominio)
   - **Apunta a:** `TU_IP_DEL_SERVIDOR`
   - **TTL:** 300 (5 minutos)

2. Crea un registro A para www (opcional):
   - **Host:** `www`
   - **Apunta a:** `TU_IP_DEL_SERVIDOR`
   - **TTL:** 300

**Espera 5-30 minutos** para que los cambios DNS se propaguen.

### 5.2 Verificar DNS

```bash
# Desde tu máquina local
ping tu-dominio.com
nslookup tu-dominio.com
```

---

## 🔒 Paso 6: Configurar SSL con Let's Encrypt

### 6.1 Actualizar variables de entorno

Edita `.env`:

```bash
nano .env
```

Agrega:

```bash
DOMAIN=tu-dominio.com
SSL_EMAIL=tu-email@dominio.com
```

### 6.2 Obtener certificados SSL

```bash
# Detener nginx temporalmente
docker compose stop nginx

# Obtener certificado
docker compose run --rm certbot certonly \
  --standalone \
  --email tu-email@dominio.com \
  --agree-tos \
  --no-eff-email \
  -d tu-dominio.com \
  -d www.tu-dominio.com
```

### 6.3 Configurar nginx para HTTPS

Edita `nginx/conf.d/default.conf`:

```bash
nano nginx/conf.d/default.conf
```

Descomenta la sección HTTPS (líneas con `# server { listen 443...`)

Reemplaza `tu-dominio.com` con tu dominio real.

### 6.4 Reiniciar nginx

```bash
docker compose up -d nginx
```

### 6.5 Verificar SSL

Visita: `https://tu-dominio.com`

Deberías ver el candado verde en tu navegador.

---

## 🔧 Mantenimiento

### Ver logs

```bash
# Todos los servicios
docker compose logs -f

# Servicio específico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Reiniciar servicios

```bash
# Reiniciar todo
docker compose restart

# Reiniciar servicio específico
docker compose restart backend
docker compose restart frontend
```

### Actualizar código

```bash
cd /opt/chicoj

# Pull cambios desde git
git pull origin main

# Reconstruir y reiniciar
docker compose down
docker compose build --no-cache
docker compose up -d

# O simplemente usa el script
./deploy.sh
```

### Backup de base de datos

```bash
# Crear backup
docker compose exec postgres pg_dump -U postgres restaurante_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker compose exec -T postgres psql -U postgres restaurante_db < backup_20240101_120000.sql
```

### Ver uso de recursos

```bash
# CPU, RAM, etc.
docker stats

# Espacio en disco
df -h
docker system df
```

### Limpiar espacio

```bash
# Limpiar imágenes no usadas
docker image prune -a

# Limpiar volúmenes no usados
docker volume prune

# Limpiar todo lo no usado
docker system prune -a --volumes
```

---

## 🐛 Solución de Problemas

### El backend no inicia

```bash
# Ver logs
docker compose logs backend

# Verificar conexión a BD
docker compose exec backend npx prisma db pull

# Reiniciar
docker compose restart backend
```

### Error de conexión a base de datos

```bash
# Verificar que postgres esté corriendo
docker compose ps postgres

# Ver logs de postgres
docker compose logs postgres

# Reiniciar postgres
docker compose restart postgres
```

### Error de CORS

Asegúrate de que tu dominio esté en `ALLOWED_ORIGINS` en el archivo `.env`:

```bash
ALLOWED_ORIGINS=http://tu-dominio.com,https://tu-dominio.com
```

Luego reinicia:

```bash
docker compose restart backend
```

### WebSocket no funciona

Verifica la configuración de nginx:

```bash
# Ver logs de nginx
docker compose logs nginx

# Reiniciar nginx
docker compose restart nginx
```

### Quedarse sin espacio

```bash
# Ver uso de disco
df -h

# Limpiar Docker
docker system prune -a --volumes

# Ver logs y eliminar los viejos
docker compose logs --tail=100 > logs.txt
```

### Contenedores no inician

```bash
# Ver estado
docker compose ps

# Ver por qué falló
docker compose logs

# Reiniciar todo desde cero
docker compose down -v
docker compose up -d
```

---

## 📊 Monitoreo

### Ver estado general

```bash
# Estado de contenedores
docker compose ps

# Uso de recursos
docker stats

# Health checks
docker compose ps --format "table {{.Name}}\t{{.Status}}"
```

### Ver logs en tiempo real

```bash
# Todos los logs
docker compose logs -f --tail=100

# Solo errores
docker compose logs -f | grep -i error
```

---

## 🔐 Seguridad

### Recomendaciones:

1. **Cambia el puerto SSH** (opcional):
   ```bash
   nano /etc/ssh/sshd_config
   # Cambia Port 22 a otro puerto
   systemctl restart sshd
   ```

2. **Configura autenticación por llave SSH**:
   ```bash
   ssh-copy-id root@TU_IP
   ```

3. **Desactiva login con contraseña**:
   ```bash
   nano /etc/ssh/sshd_config
   # PasswordAuthentication no
   systemctl restart sshd
   ```

4. **Mantén el sistema actualizado**:
   ```bash
   apt update && apt upgrade -y
   ```

5. **Monitorea logs de fail2ban**:
   ```bash
   fail2ban-client status
   tail -f /var/log/fail2ban.log
   ```

---

## 📚 Comandos Útiles

```bash
# Entrar a un contenedor
docker compose exec backend sh
docker compose exec postgres psql -U postgres restaurante_db

# Ver variables de entorno
docker compose exec backend env

# Ejecutar comando en contenedor
docker compose exec backend npm run db:seed

# Ver redes
docker network ls

# Ver volúmenes
docker volume ls

# Ver IP del contenedor
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' chicoj-backend
```

---

## 🎉 ¡Listo!

Tu sistema Chicoj ahora está corriendo en producción.

### URLs importantes:

- **Aplicación:** `http://tu-dominio.com` o `http://TU_IP`
- **API:** `http://tu-dominio.com/api` o `http://TU_IP/api`
- **PgAdmin:** `http://TU_IP:5050` (si está activado)

### Credenciales por defecto (del seed):

- **Admin:** `admin` / `admin123`
- **Mesero:** `mesero1` / `mesero123`

**⚠️ IMPORTANTE:** Cambia estas contraseñas en producción.

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs: `docker compose logs -f`
2. Verifica la sección [Solución de Problemas](#solución-de-problemas)
3. Busca el error en Google
4. Contacta al equipo de desarrollo

---

## 📝 Notas Adicionales

### Costos estimados (DigitalOcean):

- **Droplet Básico (2GB):** $12/mes
- **Droplet Recomendado (4GB):** $24/mes
- **Dominio:** ~$10-15/año
- **SSL:** Gratis con Let's Encrypt

### Performance:

- El sistema puede manejar 10-20 usuarios simultáneos con el Droplet básico
- Para más de 20 usuarios, considera el Droplet de 4GB o superior
- La base de datos crece ~1GB por año con uso moderado

### Backups:

Configura backups automáticos en DigitalOcean ($1/mes por Droplet)

---

**¡Éxito con tu deployment! 🚀**

