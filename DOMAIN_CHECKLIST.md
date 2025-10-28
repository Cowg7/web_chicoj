# ✅ Checklist de Configuración de Dominio
## coopechicoj.com

**Fecha de inicio**: _______________  
**Completado**: _______________

---

## 🌐 FASE 1: CLOUDFLARE - DNS (10 min)

### Configurar DNS
- [ ] Acceder a Cloudflare Dashboard (https://dash.cloudflare.com)
- [ ] Seleccionar dominio: coopechicoj.com
- [ ] Ir a: DNS → Records
- [ ] Agregar registro A: `@` → `165.227.103.238` (Proxy: DNS only 🌑)
- [ ] Agregar registro A: `www` → `165.227.103.238` (Proxy: DNS only 🌑)
- [ ] **IMPORTANTE**: Verificar que ambos tengan nube GRIS (DNS only), NO naranja

### Configurar SSL Inicial
- [ ] Ir a: SSL/TLS → Overview
- [ ] Seleccionar modo: **Flexible**

### Verificar DNS
- [ ] Esperar 5-10 minutos
- [ ] Verificar en: https://dnschecker.org/#A/coopechicoj.com
- [ ] Confirmar que muestra IP: 165.227.103.238

**Notas**:
```


```

---

## 🖥️ FASE 2: SERVIDOR - Configuración (15 min)

### Conectar al Servidor
- [ ] Abrir PowerShell/Terminal
- [ ] Ejecutar: `ssh root@165.227.103.238`
- [ ] Navegar a: `cd /opt/chicoj`

### Actualizar Archivos de Configuración
- [ ] Subir archivos actualizados desde local (opcional)
- [ ] Editar archivo .env: `nano .env`
- [ ] Configurar variables:
  - [ ] POSTGRES_PASSWORD
  - [ ] JWT_SECRET
  - [ ] ALLOWED_ORIGINS (con coopechicoj.com)
  - [ ] DOMAIN=coopechicoj.com
  - [ ] SSL_EMAIL=tu-email@gmail.com
- [ ] Guardar archivo: Ctrl+X, Y, Enter

### Verificar Nginx
- [ ] Editar: `nano nginx/conf.d/default.conf`
- [ ] Verificar línea 9: `server_name coopechicoj.com www.coopechicoj.com 165.227.103.238;`
- [ ] Guardar si hiciste cambios

### Detener Servicios Existentes
- [ ] Ejecutar: `docker-compose down`
- [ ] Verificar puertos libres: `sudo netstat -tulpn | grep :80`
- [ ] Si hay conflicto, detener:
  - [ ] `sudo systemctl stop apache2`
  - [ ] `sudo systemctl stop nginx`

### Iniciar Servicios
- [ ] Ejecutar: `docker-compose up -d`
- [ ] Esperar 10 segundos
- [ ] Verificar estado: `docker-compose ps`
- [ ] Ver logs: `docker-compose logs -f` (Ctrl+C para salir)

### Probar HTTP
- [ ] En servidor: `curl -I http://coopechicoj.com`
- [ ] En navegador: http://coopechicoj.com
- [ ] ✅ Debería mostrar el sitio

**Notas**:
```


```

---

## 🔒 FASE 3: SSL - Let's Encrypt (15 min)

### Verificar Propagación DNS
- [ ] Ejecutar: `nslookup coopechicoj.com`
- [ ] Confirmar que muestra: 165.227.103.238

### Crear Directorios SSL
- [ ] Ejecutar: `mkdir -p certbot/conf certbot/www`

### Obtener Certificado SSL
- [ ] Ejecutar comando de obtención de certificado (método webroot)
- [ ] Reemplazar `tu-email@gmail.com` con tu email real
- [ ] Si webroot falla, usar método standalone
- [ ] ✅ Certificado obtenido exitosamente

### Verificar Certificados
- [ ] Ejecutar: `ls -la certbot/conf/live/coopechicoj.com/`
- [ ] Confirmar archivos:
  - [ ] fullchain.pem
  - [ ] privkey.pem

### Activar HTTPS en Nginx

**Opción A: Comando sed (rápido)**
- [ ] Ejecutar comandos sed para descomentar bloque HTTPS

**Opción B: Manual**
- [ ] Editar: `nano nginx/conf.d/default.conf`
- [ ] Descomentar líneas 89-163 (quitar `#` al inicio)
- [ ] Guardar

### Agregar Redirección HTTP → HTTPS
- [ ] Editar: `nano nginx/conf.d/default.conf`
- [ ] En bloque HTTP, agregar redirección
- [ ] Guardar

### Reiniciar Nginx
- [ ] Verificar config: `docker-compose exec nginx nginx -t`
- [ ] Reiniciar: `docker-compose restart nginx`
- [ ] Ver logs: `docker-compose logs -f nginx`

### Probar HTTPS
- [ ] En navegador: https://coopechicoj.com
- [ ] En navegador: https://www.coopechicoj.com
- [ ] ✅ Candado verde visible

**Notas**:
```


```

---

## 🎨 FASE 4: CLOUDFLARE - Configuración Final (5 min)

### Actualizar Modo SSL
- [ ] Ir a Cloudflare: SSL/TLS → Overview
- [ ] Cambiar de "Flexible" a: **Full (strict)**

### Activar Always Use HTTPS
- [ ] Ir a: SSL/TLS → Edge Certificates
- [ ] Activar: **Always Use HTTPS**

### Activar Proxy de Cloudflare (Opcional)
- [ ] Ir a: DNS → Records
- [ ] Registro `@`: Cambiar a 🟠 Proxied
- [ ] Registro `www`: Cambiar a 🟠 Proxied

### Purgar Cache
- [ ] Ir a: Caching → Configuration
- [ ] Click: **Purge Everything**

**Notas**:
```


```

---

## ✅ VERIFICACIÓN FINAL

### Pruebas en Servidor
- [ ] `docker-compose ps` - Todos UP
- [ ] `curl -I http://coopechicoj.com` - Redirige a HTTPS
- [ ] `curl -I https://coopechicoj.com` - HTTP 200 OK
- [ ] `curl https://coopechicoj.com/api/health` - Funciona

### Pruebas en Navegador
- [ ] https://coopechicoj.com - ✅ Funciona
- [ ] https://www.coopechicoj.com - ✅ Funciona
- [ ] http://coopechicoj.com - ✅ Redirige a HTTPS
- [ ] Candado verde 🔒 - ✅ Visible

### Pruebas Funcionales
- [ ] Login funciona
- [ ] API responde
- [ ] WebSockets funcionan (notificaciones)
- [ ] Base de datos conecta
- [ ] Imágenes cargan

### Verificaciones Externas
- [ ] DNS Check: https://dnschecker.org/#A/coopechicoj.com
- [ ] SSL Test: https://www.ssllabs.com/ssltest/analyze.html?d=coopechicoj.com
- [ ] Performance: https://pagespeed.web.dev/analysis?url=https://coopechicoj.com

**Resultado SSL Test**: _________ (esperado: A o A+)

---

## 🎯 CONFIGURACIÓN OPCIONAL

### Seguridad Cloudflare
- [ ] Configurar Firewall WAF
- [ ] Configurar Rate Limiting
- [ ] Configurar Reglas Personalizadas

### Performance
- [ ] Activar Auto Minify (JS, CSS, HTML)
- [ ] Activar Brotli
- [ ] Activar HTTP/3
- [ ] Configurar Page Rules

### Monitoring
- [ ] Configurar Uptime Robot o similar
- [ ] Configurar alertas de downtime
- [ ] Configurar Google Analytics

### Backups
- [ ] Configurar backup automático de DB
- [ ] Backup de certificados SSL
- [ ] Backup de archivos de configuración

---

## 📊 INFORMACIÓN FINAL

### URLs del Sitio
```
✅ https://coopechicoj.com
✅ https://www.coopechicoj.com
✅ https://coopechicoj.com/api/health
```

### Credenciales (NO compartir)
```
Servidor IP: 165.227.103.238
SSH User: root
DB User: postgres
DB Password: [EN .env]
JWT Secret: [EN .env]
```

### Archivos Importantes
```
/opt/chicoj/.env
/opt/chicoj/docker-compose.yml
/opt/chicoj/nginx/conf.d/default.conf
/opt/chicoj/certbot/conf/live/coopechicoj.com/
```

### Comandos de Mantenimiento
```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Renovar SSL (manual)
docker-compose run --rm certbot renew
```

---

## 🎉 COMPLETADO

- [ ] **Todos los pasos completados**
- [ ] **Sitio funcionando en HTTPS**
- [ ] **Certificado SSL válido**
- [ ] **Documentación revisada**

**Fecha de finalización**: _______________  
**Configurado por**: _______________

---

## 📝 NOTAS ADICIONALES

```








```

---

## 📞 CONTACTOS DE EMERGENCIA

**Proveedor de Dominio**: Cloudflare  
**Soporte**: https://support.cloudflare.com

**Hosting**: DigitalOcean  
**Soporte**: https://www.digitalocean.com/support

**Certificados SSL**: Let's Encrypt  
**Docs**: https://letsencrypt.org/docs/

---

**💾 Guardar este checklist completado para referencia futura**

