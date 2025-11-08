# Solución Error 521 de Cloudflare

El error **521** significa que Cloudflare no puede conectarse a tu servidor de origen.

## Diagnóstico Rápido

Ejecuta estos comandos en tu servidor para diagnosticar:

### 1. Verificar estado de contenedores

```bash
cd /opt/chicoj
docker-compose ps
```

Todos los contenedores deberían mostrar `Up` o `healthy`. Si alguno está `Exit` o `unhealthy`, ese es el problema.

### 2. Ver logs de Nginx

```bash
docker logs chicoj-nginx
docker logs chicoj-nginx --tail 50
```

Busca errores como:
- `address already in use` (puerto ocupado)
- `permission denied` (problemas de permisos)
- `no such file or directory` (archivo de configuración faltante)

### 3. Ver logs del Backend

```bash
docker logs chicoj-backend
docker logs chicoj-backend --tail 50
```

### 4. Verificar si Nginx responde localmente

```bash
curl http://localhost/health
```

Si esto funciona, el problema está en la conexión externa o Cloudflare.

### 5. Verificar puertos

```bash
sudo netstat -tuln | grep -E ':(80|443)'
# O en sistemas más nuevos:
sudo ss -tuln | grep -E ':(80|443)'
```

Debes ver que el puerto 80 está escuchando.

### 6. Verificar firewall

```bash
sudo ufw status
```

Si el firewall está activo, asegúrate de que los puertos 80 y 443 estén abiertos:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Soluciones Comunes

### Problema 1: Contenedores no iniciaron correctamente

**Solución:**
```bash
cd /opt/chicoj
docker-compose down
docker-compose up -d
docker-compose ps  # Verificar que todos estén "Up"
```

### Problema 2: Nginx tiene errores de configuración

**Solución:**
```bash
# Verificar sintaxis de configuración
docker exec chicoj-nginx nginx -t

# Si hay errores, revisa los logs
docker logs chicoj-nginx
```

### Problema 3: Puertos ocupados por otro proceso

**Solución:**
```bash
# Ver qué proceso usa el puerto 80
sudo lsof -i :80
# O
sudo netstat -tulpn | grep :80

# Si hay otro proceso (como Apache), deténlo o cambia el puerto
```

### Problema 4: Cloudflare en modo HTTPS pero servidor solo HTTP

**En Cloudflare Dashboard:**
1. Ve a SSL/TLS → Overview
2. Cambia el modo a **"Flexible"** (si tu servidor solo tiene HTTP)
3. O **"Full"** (si tu servidor tiene HTTPS)

**Verificar configuración de DNS:**
1. Ve a DNS → Records
2. Verifica que tu registro A apunta a: `165.227.103.238`
3. Verifica que el proxy (nube naranja) está **ACTIVADO** ☁️

### Problema 5: Backend no está respondiendo

**Solución:**
```bash
# Verificar si el backend está saludable
docker exec chicoj-backend wget --spider http://localhost:3000/api/health

# Reiniciar el backend
docker-compose restart backend
```

### Problema 6: Red Docker no configurada correctamente

**Solución:**
```bash
# Recrear la red
docker-compose down
docker network prune -f
docker-compose up -d
```

## Script de Diagnóstico Automatizado

He creado un script que hace todas estas verificaciones:

```bash
cd /opt/chicoj
chmod +x scripts/diagnostico-521.sh
./scripts/diagnostico-521.sh
```

## Pasos de Verificación Completa

```bash
# 1. Ir al directorio del proyecto
cd /opt/chicoj

# 2. Verificar estado
docker-compose ps

# 3. Si hay problemas, reiniciar todo
docker-compose down
docker-compose up -d

# 4. Esperar unos segundos y verificar logs
sleep 10
docker-compose ps
docker logs chicoj-nginx --tail 30

# 5. Probar localmente
curl http://localhost/health

# 6. Probar desde fuera (desde tu máquina local o otro servidor)
curl http://165.227.103.238/health
```

## Configuración de Cloudflare

### Verificar DNS
1. **DNS → Records**
   - Tipo: `A`
   - Nombre: `@` o `coopechicoj.com`
   - IPv4: `165.227.103.238`
   - Proxy: ☁️ **Activado** (nube naranja)

### Verificar SSL/TLS
1. **SSL/TLS → Overview**
   - Modo recomendado: **"Flexible"** (si solo tienes HTTP en el servidor)
   - O **"Full"** (si tienes HTTPS configurado)

### Verificar que el proxy esté activo
- El registro DNS debe tener la nube ☁️ **naranja**, no gris ⚪
- Si está gris, Cloudflare no está protegiendo la conexión

## Si Nada Funciona

1. **Reiniciar todos los servicios:**
   ```bash
   docker-compose restart
   ```

2. **Reiniciar Docker:**
   ```bash
   sudo systemctl restart docker
   docker-compose up -d
   ```

3. **Verificar espacio en disco:**
   ```bash
   df -h
   docker system df
   ```

4. **Limpiar recursos Docker si es necesario:**
   ```bash
   docker system prune -f
   ```


