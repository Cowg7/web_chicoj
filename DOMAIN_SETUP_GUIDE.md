# 🌐 Guía Completa de Configuración del Dominio coopechicoj.com

## 📋 Información General
- **Dominio**: coopechicoj.com
- **Proveedor DNS**: Cloudflare
- **Hosting**: DigitalOcean
- **IP del Servidor**: 165.227.103.238

---

## 🎯 PASO 1: Configuración en Cloudflare

### 1.1 Accede a Cloudflare Dashboard
1. Ve a [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu dominio `coopechicoj.com`

### 1.2 Configurar DNS Records
Ve a la pestaña **DNS** y agrega los siguientes registros:

#### Registros A (IPv4):
```
Tipo: A
Nombre: @
Contenido: 165.227.103.238
Proxy status: ⚠️ DNS only (nube gris) - IMPORTANTE PARA SSL
TTL: Auto
```

```
Tipo: A
Nombre: www
Contenido: 165.227.103.238
Proxy status: ⚠️ DNS only (nube gris) - IMPORTANTE PARA SSL
TTL: Auto
```

**⚠️ MUY IMPORTANTE**: 
- Deja el proxy de Cloudflare **DESACTIVADO** (nube gris) al principio
- Esto es necesario para que Let's Encrypt pueda validar tu dominio
- Después de obtener el certificado SSL, puedes activar el proxy (nube naranja)

#### Registro CNAME (opcional, para subdominio api):
```
Tipo: CNAME
Nombre: api
Contenido: coopechicoj.com
Proxy status: DNS only (nube gris)
TTL: Auto
```

### 1.3 Configuración SSL/TLS en Cloudflare
1. Ve a **SSL/TLS** en el menú lateral
2. Selecciona el modo: **Full (strict)** (cuando ya tengas SSL en el servidor)
3. Por ahora, usa **Flexible** hasta que configures Let's Encrypt

### 1.4 Configuración de Seguridad (Opcional pero Recomendado)
1. **Firewall Rules**: 
   - Ve a Security → WAF
   - Deja las reglas por defecto activas

2. **Always Use HTTPS**:
   - Ve a SSL/TLS → Edge Certificates
   - Activa "Always Use HTTPS" (SOLO después de tener SSL)

---

## 🖥️ PASO 2: Configuración en DigitalOcean

### 2.1 Verificar que los Nameservers están en Cloudflare

Cuando compraste el dominio en Cloudflare, automáticamente debería estar usando los nameservers de Cloudflare. Verifica:

1. Ve a tu dominio en Cloudflare
2. Busca en la parte inferior los nameservers (algo como):
   ```
   albert.ns.cloudflare.com
   brenda.ns.cloudflare.com
   ```

### 2.2 (Opcional) Configurar Floating IP en DigitalOcean

Si tienes o quieres una IP flotante:
1. Ve a DigitalOcean Dashboard
2. Networking → Floating IPs
3. Asigna una IP flotante a tu droplet

---

## 🔧 PASO 3: Configuración en el Servidor

Conéctate a tu servidor:
```bash
ssh root@165.227.103.238
cd /opt/chicoj
```

### 3.1 Crear/Actualizar archivo .env

```bash
nano .env
```

Actualiza con estos valores (los archivos ya están actualizados localmente):
```bash
# Base de datos
POSTGRES_USER=postgres
POSTGRES_PASSWORD=TU_PASSWORD_SEGURO_AQUI
POSTGRES_DB=restaurante_db

# Backend
NODE_ENV=production
JWT_SECRET=TU_JWT_SECRET_SUPER_SEGURO_AQUI
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
PGADMIN_PASSWORD=TU_PASSWORD_PGADMIN

# Dominio
DOMAIN=coopechicoj.com
SSL_EMAIL=tu-email@gmail.com
```

### 3.2 Actualizar archivos de configuración en el servidor

Sube los nuevos archivos al servidor (desde tu máquina local):

```powershell
# Desde tu máquina Windows
scp nginx/conf.d/default.conf root@165.227.103.238:/opt/chicoj/nginx/conf.d/default.conf
```

O edita directamente en el servidor:
```bash
nano /opt/chicoj/nginx/conf.d/default.conf
```

### 3.3 Detener servicios actuales

```bash
cd /opt/chicoj
docker-compose down
```

### 3.4 Verificar que el puerto 80 está libre

```bash
# Verificar qué está usando el puerto 80
sudo netstat -tulpn | grep :80

# Si hay algo más (Apache, nginx del sistema), detenlo:
sudo systemctl stop apache2 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true
```

### 3.5 Iniciar servicios con nueva configuración

```bash
cd /opt/chicoj
docker-compose up -d
```

### 3.6 Verificar que todo está funcionando

```bash
# Ver logs
docker-compose logs -f nginx

# Verificar estado
docker-compose ps

# Probar el dominio
curl -I http://coopechicoj.com
```

---

## 🔒 PASO 4: Configurar SSL con Let's Encrypt

### 4.1 Esperar propagación DNS (5-30 minutos)

Verifica que el DNS se haya propagado:
```bash
# Desde tu servidor o cualquier máquina
nslookup coopechicoj.com
dig coopechicoj.com
```

Debería mostrar tu IP: **165.227.103.238**

También puedes verificar en: https://dnschecker.org

### 4.2 Obtener certificado SSL

```bash
cd /opt/chicoj

# Detener nginx temporalmente
docker-compose stop nginx

# Obtener certificado
docker-compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email tu-email@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d coopechicoj.com \
  -d www.coopechicoj.com
```

Si obtienes un error, usa el modo standalone:
```bash
docker-compose run --rm --entrypoint="" certbot \
  certbot certonly --standalone \
  --email tu-email@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d coopechicoj.com \
  -d www.coopechicoj.com
```

### 4.3 Activar HTTPS en nginx

Edita el archivo de configuración:
```bash
nano /opt/chicoj/nginx/conf.d/default.conf
```

Descomenta las líneas del bloque HTTPS (líneas 89-163).

### 4.4 Agregar redirección HTTP → HTTPS

En el bloque del servidor HTTP (puerto 80), agrega después de la línea 9:
```nginx
# Redirigir todo el tráfico HTTP a HTTPS
location / {
    return 301 https://$host$request_uri;
}
```

### 4.5 Reiniciar nginx

```bash
docker-compose up -d nginx
docker-compose logs -f nginx
```

---

## 🎨 PASO 5: Activar Cloudflare Proxy (Opcional)

Una vez que tengas SSL funcionando:

1. Ve a Cloudflare Dashboard
2. DNS Records
3. Cambia el proxy status a **Proxied** (nube naranja) para @ y www
4. Esto activará:
   - CDN de Cloudflare
   - Protección DDoS
   - Firewall WAF
   - Cache automático

**Configuración SSL en Cloudflare**:
- Cambia a **Full (strict)** en SSL/TLS
- Activa "Always Use HTTPS"

---

## ✅ PASO 6: Verificación Final

### 6.1 Probar HTTP y HTTPS
```bash
curl -I http://coopechicoj.com
curl -I https://coopechicoj.com
curl -I https://www.coopechicoj.com
```

### 6.2 Probar el API
```bash
curl https://coopechicoj.com/api/health
```

### 6.3 Probar en navegador
1. Abre: https://coopechicoj.com
2. Verifica que muestre el candado verde (SSL válido)
3. Prueba el login

### 6.4 Verificar SSL
- https://www.ssllabs.com/ssltest/analyze.html?d=coopechicoj.com

---

## 🔧 PASO 7: Actualizar Frontend (si es necesario)

Si tu frontend tiene URLs hardcodeadas, actualízalas:

```bash
# En tu servidor
cd /opt/chicoj/chicoj-frontend/scripts
nano config.js
```

Asegúrate de que use rutas relativas o el nuevo dominio.

---

## 📱 Comandos Útiles

### Ver logs en tiempo real
```bash
docker-compose logs -f
docker-compose logs -f nginx
docker-compose logs -f backend
```

### Reiniciar servicios
```bash
docker-compose restart nginx
docker-compose restart backend
```

### Renovar certificado SSL (automático cada 12h)
```bash
docker-compose run --rm certbot renew
```

### Backup de certificados
```bash
cd /opt/chicoj
tar -czf certbot-backup-$(date +%Y%m%d).tar.gz certbot/
```

---

## ⚠️ Troubleshooting

### Problema: DNS no resuelve
```bash
# Verificar DNS
nslookup coopechicoj.com
dig coopechicoj.com

# Limpiar cache DNS (Windows)
ipconfig /flushdns
```

### Problema: Error 502 Bad Gateway
```bash
# Verificar backend
docker-compose logs backend
docker-compose ps

# Reiniciar backend
docker-compose restart backend
```

### Problema: Certificado SSL no se genera
1. Verifica que el DNS apunte correctamente
2. Desactiva proxy de Cloudflare (nube gris)
3. Verifica que el puerto 80 esté abierto
4. Intenta con método standalone

### Problema: Puerto 80 en uso
```bash
# Ver qué usa el puerto
sudo netstat -tulpn | grep :80

# Detener todo Docker
docker-compose down

# Matar proceso si es necesario
sudo kill -9 <PID>
```

---

## 📊 Checklist de Configuración

- [ ] DNS configurado en Cloudflare (registros A)
- [ ] Proxy de Cloudflare desactivado (nube gris)
- [ ] Archivo .env actualizado en servidor
- [ ] nginx/conf.d/default.conf actualizado con nuevo dominio
- [ ] Contenedores reiniciados
- [ ] DNS propagado (verificado con nslookup)
- [ ] Sitio accesible por HTTP
- [ ] Certificado SSL obtenido
- [ ] Configuración HTTPS activada en nginx
- [ ] Sitio accesible por HTTPS
- [ ] Redirección HTTP → HTTPS activa
- [ ] Proxy de Cloudflare activado (opcional)
- [ ] Cloudflare en modo Full (strict)
- [ ] Always Use HTTPS activado en Cloudflare
- [ ] API funcionando correctamente
- [ ] WebSockets funcionando
- [ ] Frontend actualizado con nuevo dominio

---

## 🎉 ¡Listo!

Tu sitio debería estar funcionando en:
- 🌐 https://coopechicoj.com
- 🌐 https://www.coopechicoj.com

**Tiempo estimado de configuración**: 30-60 minutos
**Tiempo de propagación DNS**: 5-30 minutos

---

## 📞 Soporte

Si encuentras problemas, verifica:
1. Logs de Docker: `docker-compose logs -f`
2. Estado de contenedores: `docker-compose ps`
3. Propagación DNS: https://dnschecker.org
4. Validación SSL: https://www.ssllabs.com/ssltest/

