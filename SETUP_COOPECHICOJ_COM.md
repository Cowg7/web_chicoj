# 🌐 Guía Completa de Configuración: coopechicoj.com

## 📋 Información del Sistema

| Item | Valor |
|------|-------|
| **Dominio** | coopechicoj.com |
| **DNS Provider** | Cloudflare |
| **Servidor** | DigitalOcean Droplet |
| **IP Servidor** | 165.227.103.238 |
| **Sistema Operativo** | Ubuntu (Linux) |
| **Directorio del Proyecto** | /opt/chicoj |

---

## 🎯 Resumen de Pasos

1. ✅ Configurar DNS en Cloudflare
2. ✅ Actualizar archivos de configuración en el servidor
3. ✅ Reiniciar servicios con nuevo dominio
4. ✅ Obtener certificado SSL con Let's Encrypt
5. ✅ Activar HTTPS en nginx
6. ✅ (Opcional) Activar proxy de Cloudflare

**Tiempo estimado total**: 45-60 minutos

---

## 📚 Documentación de Referencia

Antes de comenzar, revisa estos archivos:

- **`DOMAIN_SETUP_GUIDE.md`** - Guía detallada paso a paso
- **`CLOUDFLARE_SETUP.md`** - Configuración específica de Cloudflare
- **`QUICK_COMMANDS.md`** - Comandos rápidos de referencia

---

## PARTE 1: CLOUDFLARE (10 minutos)

### 🌐 Paso 1.1: Configurar DNS

1. Ve a: https://dash.cloudflare.com
2. Selecciona: **coopechicoj.com**
3. Ve a: **DNS** → **Records**
4. Agrega estos registros:

```
Tipo: A
Nombre: @
Contenido: 165.227.103.238
Proxy: 🌑 DNS only (IMPORTANTE: nube GRIS, NO naranja)
TTL: Auto
---
Tipo: A
Nombre: www
Contenido: 165.227.103.238
Proxy: 🌑 DNS only
TTL: Auto
```

### 🔒 Paso 1.2: Configurar SSL/TLS

1. Ve a: **SSL/TLS** → **Overview**
2. Selecciona: **Flexible** (por ahora)

### ✅ Verificar DNS

Espera 5-10 minutos, luego verifica en:
- https://dnschecker.org/#A/coopechicoj.com

Debería mostrar: **165.227.103.238**

---

## PARTE 2: SERVIDOR - Configuración Inicial (15 minutos)

### 🔐 Paso 2.1: Conectarse al Servidor

Desde tu PowerShell (Windows):

```powershell
ssh root@165.227.103.238
```

### 📂 Paso 2.2: Ir al Directorio del Proyecto

```bash
cd /opt/chicoj
```

### 📝 Paso 2.3: Crear/Actualizar Archivo .env

```bash
nano .env
```

**Contenido del archivo .env:**

```bash
# Base de datos
POSTGRES_USER=postgres
POSTGRES_PASSWORD=TuPasswordSeguro123!
POSTGRES_DB=restaurante_db

# Backend
NODE_ENV=production
JWT_SECRET=tu-jwt-secret-super-largo-y-seguro-minimo-32-caracteres
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# CORS - Dominios permitidos
ALLOWED_ORIGINS=http://coopechicoj.com,https://coopechicoj.com,http://www.coopechicoj.com,https://www.coopechicoj.com

# Puertos
HTTP_PORT=80
HTTPS_PORT=443

# PgAdmin (opcional)
PGADMIN_PORT=5050
PGADMIN_EMAIL=admin@coopechicoj.com
PGADMIN_PASSWORD=TuPasswordPgAdmin123!

# Dominio y SSL
DOMAIN=coopechicoj.com
SSL_EMAIL=tu-email@gmail.com
```

**Guardar**: `Ctrl + X`, luego `Y`, luego `Enter`

### 🔧 Paso 2.4: Actualizar Configuración de Nginx

```bash
nano /opt/chicoj/nginx/conf.d/default.conf
```

Verifica que la línea 9 diga:
```nginx
server_name coopechicoj.com www.coopechicoj.com 165.227.103.238;
```

Si dice `coopechicoj.net`, cámbialo a `coopechicoj.com`

**Guardar**: `Ctrl + X`, luego `Y`, luego `Enter`

### 🛑 Paso 2.5: Detener Servicios Existentes

```bash
cd /opt/chicoj

# Detener todo
docker-compose down

# Verificar que puertos estén libres
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Si hay algo en el puerto 80 o 443, detenerlo:
sudo systemctl stop apache2 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true
```

### 🚀 Paso 2.6: Iniciar Servicios con Nueva Configuración

```bash
cd /opt/chicoj

# Iniciar servicios
docker-compose up -d

# Esperar 10 segundos
sleep 10

# Ver estado
docker-compose ps

# Ver logs (Ctrl+C para salir)
docker-compose logs -f
```

### ✅ Paso 2.7: Verificar que el Sitio Funciona

En tu navegador o terminal:

```bash
# Desde el servidor
curl -I http://coopechicoj.com

# Debería devolver: HTTP/1.1 200 OK
```

También prueba en tu navegador: http://coopechicoj.com

⚠️ **Si no funciona**, espera 5-10 minutos más para que el DNS se propague.

---

## PARTE 3: SSL con Let's Encrypt (15 minutos)

### 🔒 Paso 3.1: Verificar Propagación de DNS

```bash
# Desde el servidor
nslookup coopechicoj.com
```

Debería mostrar tu IP: **165.227.103.238**

### 📜 Paso 3.2: Obtener Certificado SSL

```bash
cd /opt/chicoj

# Crear directorios necesarios
mkdir -p certbot/conf certbot/www

# Obtener certificado (reemplaza tu-email@gmail.com)
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email tu-email@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d coopechicoj.com \
  -d www.coopechicoj.com
```

**Si el comando anterior falla**, usa este método alternativo:

```bash
# Detener nginx temporalmente
docker-compose stop nginx

# Obtener certificado con método standalone
docker-compose run --rm --entrypoint="" certbot \
  certbot certonly --standalone \
  --email tu-email@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d coopechicoj.com \
  -d www.coopechicoj.com

# Reiniciar nginx
docker-compose up -d nginx
```

### ✅ Paso 3.3: Verificar Certificados

```bash
# Verificar que se crearon los certificados
ls -la certbot/conf/live/coopechicoj.com/

# Deberías ver:
# - fullchain.pem
# - privkey.pem
```

### 🔐 Paso 3.4: Activar HTTPS en Nginx

```bash
nano /opt/chicoj/nginx/conf.d/default.conf
```

**Opción 1: Manualmente**
- Busca las líneas que empiezan con `#` (comentadas)
- Desde la línea 89 hasta 163
- Elimina el `#` al inicio de cada línea

**Opción 2: Con comando sed (más rápido)**

```bash
cd /opt/chicoj

# Descomentar bloque HTTPS
sed -i 's/^# server {/server {/g' nginx/conf.d/default.conf
sed -i 's/^#     /    /g' nginx/conf.d/default.conf
sed -i 's/^# }/}/g' nginx/conf.d/default.conf
```

### 🔄 Paso 3.5: Agregar Redirección HTTP → HTTPS

Edita nuevamente el archivo:

```bash
nano /opt/chicoj/nginx/conf.d/default.conf
```

En el bloque HTTP (después de la línea 9), agrega:

```nginx
server {
    listen 80;
    server_name coopechicoj.com www.coopechicoj.com 165.227.103.238;

    # Para Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirigir HTTP a HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}
```

**Guardar**: `Ctrl + X`, luego `Y`, luego `Enter`

### 🔄 Paso 3.6: Reiniciar Nginx

```bash
cd /opt/chicoj

# Verificar configuración de nginx
docker-compose exec nginx nginx -t

# Si dice "successful", reiniciar
docker-compose restart nginx

# Ver logs
docker-compose logs -f nginx
```

### ✅ Paso 3.7: Verificar HTTPS

Abre en tu navegador:
- https://coopechicoj.com
- https://www.coopechicoj.com

Deberías ver el **candado verde** 🔒

---

## PARTE 4: Cloudflare - Configuración Final (5 minutos)

### 🔒 Paso 4.1: Cambiar Modo SSL

1. Ve a Cloudflare Dashboard
2. **SSL/TLS** → **Overview**
3. Cambia de "Flexible" a: **Full (strict)**

### 🔄 Paso 4.2: Activar "Always Use HTTPS"

1. **SSL/TLS** → **Edge Certificates**
2. Activa: **Always Use HTTPS**

### 🚀 Paso 4.3: Activar Proxy de Cloudflare (Opcional)

1. **DNS** → **Records**
2. Para el registro `@` (coopechicoj.com):
   - Cambia de 🌑 DNS only a 🟠 Proxied
3. Para el registro `www`:
   - Cambia de 🌑 DNS only a 🟠 Proxied

**Beneficios del Proxy**:
- ✅ CDN global (más rápido)
- ✅ Protección DDoS
- ✅ Firewall WAF
- ✅ Cache automático

### 🧹 Paso 4.4: Purgar Cache

1. **Caching** → **Configuration**
2. **Purge Everything**

---

## ✅ VERIFICACIÓN FINAL

### Checklist de Verificación

Ejecuta estos comandos para verificar todo:

```bash
# En el servidor
cd /opt/chicoj

# Ver estado de contenedores
docker-compose ps

# Probar HTTP (debería redirigir a HTTPS)
curl -I http://coopechicoj.com

# Probar HTTPS
curl -I https://coopechicoj.com

# Probar API
curl https://coopechicoj.com/api/health

# Probar WebSocket
curl https://coopechicoj.com/socket.io/
```

### Verificaciones en Navegador

- ✅ https://coopechicoj.com - Muestra el sitio
- ✅ https://www.coopechicoj.com - Muestra el sitio
- ✅ http://coopechicoj.com - Redirige a HTTPS
- ✅ Candado verde en la barra de direcciones

### Herramientas Externas

- **DNS**: https://dnschecker.org/#A/coopechicoj.com
- **SSL**: https://www.ssllabs.com/ssltest/analyze.html?d=coopechicoj.com
- **Performance**: https://pagespeed.web.dev/analysis?url=https://coopechicoj.com

---

## 🎯 Configuración Opcional (Recomendada)

### 1. Configurar Auto-renovación de SSL

El contenedor `certbot` ya está configurado para renovar automáticamente cada 12 horas.

Verificar:
```bash
docker-compose ps certbot
```

### 2. Configurar Cloudflare Firewall

Ver: `CLOUDFLARE_SETUP.md` - Sección "Firewall"

### 3. Optimizaciones de Performance

Ver: `CLOUDFLARE_SETUP.md` - Sección "Performance"

---

## 📊 Monitoreo y Mantenimiento

### Comandos Útiles Diarios

```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Ver uso de recursos
docker stats
```

### Backup Semanal

```bash
# Backup completo
cd /opt/chicoj
./scripts/backup.sh

# O manual:
tar -czf backup-$(date +%Y%m%d).tar.gz \
  chicoj-frontend/ \
  Chicoj_System_R-T/backend/ \
  certbot/ \
  .env \
  docker-compose.yml \
  nginx/
```

### Actualizar Sistema

```bash
# Sistema operativo
sudo apt update && sudo apt upgrade -y

# Reiniciar servicios
cd /opt/chicoj
docker-compose restart
```

---

## ⚠️ Solución de Problemas

### Problema: "DNS no resuelve"

**Solución:**
```bash
# Esperar 5-30 minutos para propagación
# Verificar en: https://dnschecker.org

# Limpiar cache DNS local (Windows)
ipconfig /flushdns
```

### Problema: "Error 502 Bad Gateway"

**Solución:**
```bash
cd /opt/chicoj

# Ver logs del backend
docker-compose logs backend

# Reiniciar backend
docker-compose restart backend
```

### Problema: "Puerto 80 en uso"

**Solución:**
```bash
# Ver qué usa el puerto
sudo netstat -tulpn | grep :80

# Detener todo
docker-compose down

# Matar proceso si es necesario
sudo systemctl stop apache2
sudo systemctl stop nginx

# Reiniciar
docker-compose up -d
```

### Problema: "Certificado SSL no válido"

**Solución:**
```bash
# Verificar certificados
ls -la certbot/conf/live/coopechicoj.com/

# Volver a obtener certificado
docker-compose run --rm certbot renew --force-renewal

# Reiniciar nginx
docker-compose restart nginx
```

### Problema: "WebSockets no funcionan"

**Solución:**
1. En Cloudflare, desactiva "Rocket Loader"
2. Verifica que el proxy naranja esté activado
3. Verifica logs: `docker-compose logs backend`

---

## 📞 Scripts Útiles

### Script de Configuración Automática

```bash
# Ejecutar en el servidor
cd /opt/chicoj

# Configurar dominio
./scripts/setup-domain.sh

# Configurar SSL
./scripts/setup-ssl-certbot.sh

# Verificar sistema
./scripts/verify-domain.sh
```

---

## 🎉 ¡Felicidades!

Tu sitio **coopechicoj.com** está ahora completamente configurado con:

- ✅ Dominio personalizado
- ✅ DNS configurado en Cloudflare
- ✅ SSL/TLS (HTTPS) con Let's Encrypt
- ✅ Redirección HTTP → HTTPS
- ✅ Auto-renovación de certificados
- ✅ (Opcional) CDN y protección con Cloudflare Proxy

---

## 📚 Documentación Adicional

- **`DOMAIN_SETUP_GUIDE.md`** - Guía detallada completa
- **`CLOUDFLARE_SETUP.md`** - Configuración avanzada de Cloudflare
- **`QUICK_COMMANDS.md`** - Referencia rápida de comandos
- **`DEPLOYMENT.md`** - Guía de despliegue completa

---

## 💡 Próximos Pasos

1. ✅ Prueba todas las funcionalidades del sistema
2. ✅ Configura backups automáticos
3. ✅ Configura monitoreo (Uptime Robot, etc.)
4. ✅ Optimiza performance en Cloudflare
5. ✅ Configura firewall y rate limiting

---

**🚀 Tu sitio**: https://coopechicoj.com

**¡Todo listo para producción!** 🎊

