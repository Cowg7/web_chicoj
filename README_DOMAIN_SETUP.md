# 🚀 Configuración del Dominio coopechicoj.com

## 📄 Documentación Creada

He creado una guía completa para configurar tu nuevo dominio `coopechicoj.com`. Aquí está toda la documentación:

### 📚 Guías Principales

1. **`SETUP_COOPECHICOJ_COM.md`** ⭐ **EMPIEZA AQUÍ**
   - Guía paso a paso completa y concisa
   - Organizada en 4 fases claras
   - Tiempo estimado: 45-60 minutos
   - Incluye verificaciones y troubleshooting

2. **`DOMAIN_CHECKLIST.md`** ✅ **CHECKLIST IMPRIMIBLE**
   - Lista de verificación paso a paso
   - Marca cada paso completado
   - Ideal para seguir durante la configuración
   - Incluye espacio para notas

3. **`DOMAIN_SETUP_GUIDE.md`** 📖 **GUÍA DETALLADA**
   - Explicación exhaustiva de cada paso
   - Troubleshooting avanzado
   - Comandos útiles
   - Mejores prácticas

4. **`CLOUDFLARE_SETUP.md`** ☁️ **CONFIGURACIÓN DE CLOUDFLARE**
   - Guía específica para Cloudflare
   - Configuraciones de seguridad
   - Optimizaciones de performance
   - Firewall y WAF

5. **`QUICK_COMMANDS.md`** ⚡ **REFERENCIA RÁPIDA**
   - Comandos más usados
   - Copy-paste friendly
   - Organizado por categorías
   - Comandos de emergencia

### 🛠️ Scripts Automatizados

He creado scripts para automatizar el proceso:

1. **`scripts/setup-domain.sh`**
   - Configura automáticamente el dominio
   - Verifica DNS y puertos
   - Inicia servicios

2. **`scripts/setup-ssl-certbot.sh`**
   - Obtiene certificado SSL automáticamente
   - Configura HTTPS en nginx
   - Activa renovación automática

3. **`scripts/verify-domain.sh`**
   - Verifica configuración completa
   - Chequea DNS, puertos, SSL
   - Diagnóstico del sistema

---

## 🎯 Cómo Empezar

### Opción 1: Guía Paso a Paso (Recomendado)

1. **Lee primero**: `SETUP_COOPECHICOJ_COM.md`
2. **Imprime**: `DOMAIN_CHECKLIST.md` (o ábrelo en otra ventana)
3. **Sigue los pasos** marcando el checklist
4. **Consulta** `CLOUDFLARE_SETUP.md` para configuraciones específicas
5. **Usa** `QUICK_COMMANDS.md` como referencia de comandos

### Opción 2: Scripts Automatizados (Avanzado)

```bash
# En tu servidor (después de subir los archivos)
cd /opt/chicoj

# 1. Hacer scripts ejecutables
chmod +x scripts/*.sh

# 2. Configurar dominio
./scripts/setup-domain.sh

# 3. Configurar SSL
./scripts/setup-ssl-certbot.sh

# 4. Verificar todo
./scripts/verify-domain.sh
```

---

## 📋 Resumen de Pasos

### 1️⃣ CLOUDFLARE (10 min)
- Configurar DNS (registros A para @ y www)
- IP: `165.227.103.238`
- Proxy: **DNS only** (nube gris) ← IMPORTANTE
- SSL/TLS: **Flexible** (por ahora)

### 2️⃣ SERVIDOR (15 min)
- Conectar: `ssh root@165.227.103.238`
- Actualizar `.env` con nuevo dominio
- Verificar `nginx/conf.d/default.conf`
- Reiniciar servicios: `docker-compose down && docker-compose up -d`

### 3️⃣ SSL (15 min)
- Esperar propagación DNS (5-10 min)
- Obtener certificado Let's Encrypt
- Activar HTTPS en nginx
- Configurar redirección HTTP → HTTPS

### 4️⃣ CLOUDFLARE FINAL (5 min)
- Cambiar SSL a: **Full (strict)**
- Activar: **Always Use HTTPS**
- Opcional: Activar proxy (nube naranja)

---

## ✅ Archivos Actualizados

Ya he actualizado estos archivos con el nuevo dominio `coopechicoj.com`:

- ✅ `nginx/conf.d/default.conf` - Configuración de nginx
- ✅ `docker-compose.yml` - Email de PgAdmin
- ✅ `env.example` - Variables de entorno de ejemplo

**⚠️ IMPORTANTE**: Necesitas crear/actualizar el archivo `.env` en tu servidor con estos valores:

```bash
DOMAIN=coopechicoj.com
ALLOWED_ORIGINS=http://coopechicoj.com,https://coopechicoj.com,http://www.coopechicoj.com,https://www.coopechicoj.com
SSL_EMAIL=tu-email@gmail.com
```

---

## 🚀 Subir Archivos al Servidor

Desde tu PowerShell (Windows):

```powershell
# Subir configuración de nginx actualizada
scp nginx/conf.d/default.conf root@165.227.103.238:/opt/chicoj/nginx/conf.d/default.conf

# Subir scripts
scp scripts/setup-domain.sh root@165.227.103.238:/opt/chicoj/scripts/
scp scripts/setup-ssl-certbot.sh root@165.227.103.238:/opt/chicoj/scripts/
scp scripts/verify-domain.sh root@165.227.103.238:/opt/chicoj/scripts/

# O subir todas las guías (opcional)
scp *.md root@165.227.103.238:/opt/chicoj/
```

---

## 🔑 Información Importante

| Item | Valor |
|------|-------|
| **Dominio** | coopechicoj.com |
| **IP Servidor** | 165.227.103.238 |
| **DNS Provider** | Cloudflare |
| **Directorio Proyecto** | /opt/chicoj |
| **Certificados SSL** | Let's Encrypt (gratis, auto-renovable) |

---

## ⚠️ Checklist Antes de Empezar

Asegúrate de tener:

- [ ] Acceso a Cloudflare Dashboard
- [ ] Acceso SSH al servidor (165.227.103.238)
- [ ] Email válido para Let's Encrypt
- [ ] Contraseñas para `.env` (JWT_SECRET, POSTGRES_PASSWORD)

---

## 🎯 Orden de Lectura Recomendado

### Para Configuración Inicial:
1. `README_DOMAIN_SETUP.md` (este archivo) - Resumen
2. `SETUP_COOPECHICOJ_COM.md` - Guía principal
3. `DOMAIN_CHECKLIST.md` - Seguimiento paso a paso
4. `CLOUDFLARE_SETUP.md` - Configuración Cloudflare

### Para Mantenimiento:
1. `QUICK_COMMANDS.md` - Comandos rápidos
2. `scripts/verify-domain.sh` - Verificación

### Para Troubleshooting:
1. `DOMAIN_SETUP_GUIDE.md` - Guía detallada
2. `QUICK_COMMANDS.md` - Sección de diagnóstico

---

## 📞 Scripts Disponibles

### Setup Scripts
```bash
./scripts/setup-domain.sh        # Configurar dominio inicial
./scripts/setup-ssl-certbot.sh   # Configurar SSL/HTTPS
./scripts/verify-domain.sh       # Verificar configuración
```

### Utility Scripts (ya existentes)
```bash
./scripts/status.sh    # Ver estado del sistema
./scripts/logs.sh      # Ver logs
./scripts/backup.sh    # Crear backup
```

---

## 🎉 Resultado Final

Una vez completados todos los pasos, tendrás:

- ✅ Sitio accesible en: **https://coopechicoj.com**
- ✅ SSL/TLS con certificado válido (Let's Encrypt)
- ✅ Redirección automática HTTP → HTTPS
- ✅ Renovación automática de certificados (cada 12h)
- ✅ (Opcional) CDN y protección DDoS con Cloudflare

---

## 🔍 Verificación Rápida

Después de completar la configuración:

```bash
# En el servidor
curl -I https://coopechicoj.com
# Debería devolver: HTTP/2 200

# En tu navegador
https://coopechicoj.com
# Debería mostrar candado verde 🔒
```

---

## 🆘 ¿Necesitas Ayuda?

### Durante la Configuración:
1. Revisa la sección de Troubleshooting en `SETUP_COOPECHICOJ_COM.md`
2. Consulta `DOMAIN_SETUP_GUIDE.md` para detalles
3. Verifica logs: `docker-compose logs -f`

### Herramientas de Diagnóstico:
- DNS: https://dnschecker.org/#A/coopechicoj.com
- SSL: https://www.ssllabs.com/ssltest/analyze.html?d=coopechicoj.com
- Script: `./scripts/verify-domain.sh`

---

## 📝 Notas Adicionales

### Sobre el Proxy de Cloudflare:
- **Inicialmente**: Nube GRIS (DNS only) - necesario para Let's Encrypt
- **Después de SSL**: Puedes activar nube NARANJA (Proxied) para CDN

### Sobre Let's Encrypt:
- Certificados válidos por 90 días
- Renovación automática configurada (cada 12 horas)
- Primer certificado toma ~2-5 minutos

### Sobre Propagación DNS:
- Puede tomar 5-30 minutos
- A veces hasta 48 horas (raro)
- Verifica en: https://dnschecker.org

---

## 🔗 Enlaces Útiles

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **DigitalOcean**: https://cloud.digitalocean.com
- **DNS Checker**: https://dnschecker.org
- **SSL Test**: https://www.ssllabs.com/ssltest/
- **Let's Encrypt Docs**: https://letsencrypt.org/docs/

---

## 💡 Tips

1. **Guarda las contraseñas** que uses en `.env` de forma segura
2. **Haz backup** de los certificados SSL
3. **Documenta** cualquier cambio que hagas
4. **Prueba** todo después de cada fase
5. **Lee los logs** si algo no funciona

---

## 🎊 ¡Éxito!

Sigue la guía paso a paso en `SETUP_COOPECHICOJ_COM.md` y tendrás tu sitio funcionando en HTTPS en menos de 1 hora.

**¡Mucha suerte! 🚀**

---

**Última actualización**: Octubre 2025  
**Dominio**: coopechicoj.com  
**Versión**: 1.0

