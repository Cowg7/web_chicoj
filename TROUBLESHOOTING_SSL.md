# 🔧 Solución de Problemas: Certificado SSL

## ❌ Error: "Certificate Authority failed to authenticate some domains"

### Síntoma
```
Detail: Invalid response from http://coopechicoj.com/.well-known/acme-challenge/...: 404
```

---

## 🔍 Diagnóstico

### Causa 1: Nginx está corriendo (MÁS PROBABLE)
El método `standalone` requiere que el puerto 80 esté COMPLETAMENTE libre. Si nginx está corriendo, bloqueará a Certbot.

### Causa 2: Cloudflare Proxy activado
Si el proxy de Cloudflare está en modo "Proxied" (nube naranja 🟠), intercepta las peticiones y Let's Encrypt no puede validar directamente.

---

## ✅ SOLUCIÓN COMPLETA

### OPCIÓN 1: Método Standalone (RECOMENDADO para este caso)

```bash
# Paso 1: Detener COMPLETAMENTE nginx
cd /opt/chicoj
docker-compose stop nginx

# Paso 2: Verificar que el puerto 80 está libre
sudo netstat -tulpn | grep :80
# NO debería mostrar nada

# Paso 3: Obtener certificado con standalone
docker-compose run --rm --entrypoint="" certbot \
  certbot certonly --standalone \
  --email cooperativachicoj@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d coopechicoj.com \
  -d www.coopechicoj.com

# Paso 4: Iniciar nginx de nuevo
docker-compose up -d nginx
```

---

### OPCIÓN 2: Método Webroot (Alternativo)

Si quieres mantener nginx corriendo:

```bash
# Paso 1: Asegurarse de que nginx está corriendo
cd /opt/chicoj
docker-compose up -d nginx

# Paso 2: Verificar que la configuración de nginx permite ACME
# Debe tener este bloque en nginx/conf.d/default.conf:
location /.well-known/acme-challenge/ {
    root /var/www/certbot;
}

# Paso 3: Crear directorio si no existe
mkdir -p certbot/www/.well-known/acme-challenge

# Paso 4: Probar que nginx puede servir archivos de ese directorio
echo "test" > certbot/www/.well-known/acme-challenge/test.txt
curl http://coopechicoj.com/.well-known/acme-challenge/test.txt
# Debería devolver: test

# Paso 5: Obtener certificado con webroot
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email cooperativachicoj@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d coopechicoj.com \
  -d www.coopechicoj.com

# Paso 6: Limpiar archivo de prueba
rm certbot/www/.well-known/acme-challenge/test.txt
```

---

### OPCIÓN 3: Verificar y Corregir Cloudflare

```bash
# Paso 1: Verificar DNS directamente
dig coopechicoj.com

# Si muestra IPs de Cloudflare (diferentes a 165.227.103.238):
# El proxy está activado, necesitas desactivarlo
```

**En Cloudflare Dashboard:**
1. Ve a DNS → Records
2. Para el registro `@` (coopechicoj.com):
   - Debe estar en 🌑 **DNS only** (nube GRIS)
   - NO 🟠 Proxied (nube naranja)
3. Para el registro `www`:
   - Debe estar en 🌑 **DNS only** (nube GRIS)

Luego espera 2-5 minutos y vuelve a intentar obtener el certificado.

---

## 🚀 SOLUCIÓN RÁPIDA (Paso a Paso)

### Ejecuta estos comandos en orden:

```bash
# 1. Ir al directorio del proyecto
cd /opt/chicoj

# 2. Detener nginx COMPLETAMENTE
docker-compose stop nginx

# 3. Verificar que nada usa el puerto 80
sudo netstat -tulpn | grep :80
# Si muestra algo, anota el PID y ejecuta:
# sudo kill -9 <PID>

# 4. Verificar que nada usa el puerto 443
sudo netstat -tulpn | grep :443
# Si muestra algo, anota el PID y ejecuta:
# sudo kill -9 <PID>

# 5. Obtener certificado
docker-compose run --rm --entrypoint="" certbot \
  certbot certonly --standalone \
  --email cooperativachicoj@gmail.com \
  --agree-tos \
  --no-eff-email \
  --preferred-challenges http \
  -d coopechicoj.com \
  -d www.coopechicoj.com

# 6. Si sale exitoso, verificar certificados
ls -la certbot/conf/live/coopechicoj.com/

# 7. Iniciar nginx de nuevo
docker-compose up -d nginx

# 8. Verificar logs
docker-compose logs nginx
```

---

## 🔍 Diagnóstico Detallado

### Verificar DNS
```bash
# Método 1
nslookup coopechicoj.com

# Método 2
dig coopechicoj.com

# Método 3
host coopechicoj.com

# Debería mostrar: 165.227.103.238
# Si muestra otras IPs, Cloudflare proxy está activado
```

### Verificar Conectividad Directa
```bash
# Desde el servidor
curl -v http://coopechicoj.com/.well-known/acme-challenge/test

# Desde fuera (otra máquina)
curl -v http://165.227.103.238/.well-known/acme-challenge/test
```

### Verificar Firewall
```bash
# Ver reglas de firewall
sudo ufw status

# Si está bloqueando puerto 80 o 443, permitir:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Verificar Puertos
```bash
# Ver qué está usando el puerto 80
sudo lsof -i :80

# Ver qué está usando el puerto 443
sudo lsof -i :443

# Ver todos los puertos en uso
sudo netstat -tulpn | grep LISTEN
```

---

## 🎯 SOLUCIÓN DEFINITIVA (Si nada funciona)

```bash
# 1. Limpiar TODO
cd /opt/chicoj
docker-compose down
docker ps -a | grep certbot | awk '{print $1}' | xargs docker rm -f 2>/dev/null || true

# 2. Matar procesos en puertos
sudo lsof -ti:80 | xargs sudo kill -9 2>/dev/null || true
sudo lsof -ti:443 | xargs sudo kill -9 2>/dev/null || true

# 3. Verificar que NADA usa los puertos
sudo netstat -tulpn | grep -E ':(80|443) '
# No debería mostrar NADA

# 4. Verificar Cloudflare
# Ir a Cloudflare Dashboard
# DNS → Records
# Asegurarse de que @ y www estén en "DNS only" (gris)

# 5. Esperar 2-3 minutos para que DNS se actualice

# 6. Obtener certificado
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -p 80:80 \
  -p 443:443 \
  certbot/certbot certonly --standalone \
  --email cooperativachicoj@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d coopechicoj.com \
  -d www.coopechicoj.com

# 7. Si sale exitoso, verificar
ls -la certbot/conf/live/coopechicoj.com/

# 8. Iniciar servicios
docker-compose up -d
```

---

## ⚠️ VERIFICACIÓN DE CLOUDFLARE

### Cómo saber si Cloudflare está bloqueando:

```bash
# En tu servidor, ejecuta:
dig coopechicoj.com

# Si ves IPs como:
# 104.21.x.x
# 172.67.x.x
# O cualquier IP que NO sea 165.227.103.238
# Entonces el proxy está activado

# Solución: Desactivar proxy en Cloudflare
```

**En Cloudflare:**
1. Inicia sesión: https://dash.cloudflare.com
2. Selecciona: coopechicoj.com
3. Ve a: DNS → Records
4. Busca el registro `@`:
   - Si tiene nube naranja 🟠, haz click para cambiarla a gris 🌑
5. Busca el registro `www`:
   - Si tiene nube naranja 🟠, haz click para cambiarla a gris 🌑
6. Espera 2-5 minutos
7. Vuelve a intentar obtener el certificado

---

## 📋 Checklist de Solución

Marca cada uno antes de intentar obtener el certificado:

- [ ] Nginx está COMPLETAMENTE detenido: `docker-compose ps | grep nginx`
- [ ] Puerto 80 está libre: `sudo netstat -tulpn | grep :80` (no muestra nada)
- [ ] Puerto 443 está libre: `sudo netstat -tulpn | grep :443` (no muestra nada)
- [ ] DNS apunta a 165.227.103.238: `dig coopechicoj.com`
- [ ] Cloudflare proxy DESACTIVADO (🌑 gris, NO 🟠 naranja)
- [ ] Firewall permite puerto 80: `sudo ufw status`
- [ ] El servidor es accesible desde internet: `curl http://165.227.103.238`

Si todos están ✅, ejecuta el comando de obtención de certificado.

---

## 🎉 Si Todo Sale Bien

Verás algo como:
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/coopechicoj.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/coopechicoj.com/privkey.pem
This certificate expires on 2025-XX-XX.
```

Luego:
```bash
# Verificar certificados
ls -la certbot/conf/live/coopechicoj.com/

# Iniciar nginx
docker-compose up -d nginx

# Continuar con el Paso 3.3 de la guía
```

---

## 💡 Consejo Final

**El método standalone es más simple pero requiere detener nginx.**

Si vas a usar standalone:
1. Detén nginx
2. Obtén certificado
3. Inicia nginx
4. ✅ Listo

Es el método más confiable para la primera vez.

