# 🌐 Configuración de Cloudflare para coopechicoj.com

## 📋 Resumen Rápido
Este documento te guía para configurar Cloudflare con tu dominio `coopechicoj.com` y servidor en DigitalOcean.

---

## 🎯 PASO 1: Configurar DNS en Cloudflare

### Acceder a Cloudflare
1. Ve a: https://dash.cloudflare.com
2. Inicia sesión
3. Selecciona el dominio: **coopechicoj.com**

### Configurar Registros DNS

#### Ir a la pestaña "DNS" → "Records"

Agrega los siguientes registros:

| Tipo | Nombre | Contenido | Proxy Status | TTL |
|------|--------|-----------|--------------|-----|
| A | @ | 165.227.103.238 | 🌑 DNS only | Auto |
| A | www | 165.227.103.238 | 🌑 DNS only | Auto |
| CNAME | api | coopechicoj.com | 🌑 DNS only | Auto |

**⚠️ IMPORTANTE**: 
- **Proxy Status debe estar en "DNS only" (nube GRIS)** al inicio
- Esto es necesario para que Let's Encrypt pueda validar tu dominio
- Después de obtener SSL, puedes activar el proxy (nube naranja 🟠)

### Ejemplo Visual
```
Tipo: A
Nombre: @
IPv4 address: 165.227.103.238
Proxy status: [🌑 DNS only]  (NO activar proxy aún)
TTL: Auto

Tipo: A
Nombre: www
IPv4 address: 165.227.103.238
Proxy status: [🌑 DNS only]
TTL: Auto
```

---

## 🔒 PASO 2: Configurar SSL/TLS

### Ir a: SSL/TLS → Overview

**Al inicio (antes de tener certificado en servidor):**
- Selecciona: **Flexible**

**Después de configurar Let's Encrypt:**
- Cambia a: **Full (strict)** ← RECOMENDADO

### ¿Qué significa cada modo?

| Modo | Descripción |
|------|-------------|
| Off | Sin encriptación (NO usar) |
| Flexible | Cloudflare ↔️ Visitante: HTTPS<br>Cloudflare ↔️ Servidor: HTTP |
| Full | Ambos usan HTTPS (certificado puede ser auto-firmado) |
| **Full (strict)** | **Ambos usan HTTPS con certificado válido** ⭐ |

---

## 🛡️ PASO 3: Configuraciones de Seguridad (Recomendadas)

### SSL/TLS → Edge Certificates

✅ Activar las siguientes opciones:

- **Always Use HTTPS**: ON (después de tener SSL)
  - Redirige automáticamente HTTP → HTTPS
  
- **HTTP Strict Transport Security (HSTS)**: Configurar después de SSL
  - Max Age: 6 months
  - Apply to subdomains: ON
  - Preload: OFF (a menos que estés seguro)

- **Minimum TLS Version**: TLS 1.2 o superior

- **Opportunistic Encryption**: ON

- **TLS 1.3**: ON

- **Automatic HTTPS Rewrites**: ON

### Configuración de Caché

**Speed → Caching → Configuration**

- **Caching Level**: Standard
- **Browser Cache TTL**: Respect Existing Headers
- **Always Online**: ON (opcional)

### Page Rules (Opcional pero útil)

Crea reglas para optimizar:

**Regla 1: Cache para archivos estáticos**
```
URL: coopechicoj.com/*.{jpg,jpeg,png,gif,ico,css,js,svg,woff,woff2,ttf,eot}
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
```

**Regla 2: No cache para API**
```
URL: coopechicoj.com/api/*
Settings:
  - Cache Level: Bypass
```

**Regla 3: No cache para HTML**
```
URL: coopechicoj.com/*.html
Settings:
  - Cache Level: Bypass
```

---

## 🚀 PASO 4: Configuraciones de Performance

### Speed → Optimization

Activa las siguientes opciones:

- ✅ **Auto Minify**:
  - JavaScript: ON
  - CSS: ON
  - HTML: ON

- ✅ **Brotli**: ON

- ✅ **Early Hints**: ON

- ✅ **HTTP/2**: ON (debería estar ON por defecto)

- ✅ **HTTP/3 (with QUIC)**: ON

- ✅ **0-RTT Connection Resumption**: ON

- ✅ **Rocket Loader**: OFF (puede causar problemas con WebSockets)

---

## 🔥 PASO 5: Configurar Firewall (WAF)

### Security → WAF

**Managed Rules:**
- ✅ Cloudflare Managed Ruleset: ON
- Nivel: Medium o High

**Custom Rules (Opcional):**

**Regla 1: Bloquear países específicos (si es necesario)**
```
Field: Country
Operator: does not equal
Value: GT (Guatemala) - o los países que desees permitir
Action: Block
```

**Regla 2: Rate Limiting en API**
```
When incoming requests match:
  - URI Path contains "/api/"
  
Then:
  - Rate limit: 100 requests per 10 seconds
  - Action: Block
```

**Regla 3: Proteger rutas de admin**
```
When incoming requests match:
  - URI Path contains "/admin"
  - Country does not equal "GT"
  
Then:
  - Action: Challenge (CAPTCHA)
```

---

## 📊 PASO 6: Activar Analytics (Opcional)

### Analytics & Logs

- ✅ **Web Analytics**: Activar para ver estadísticas
- ✅ **Browser Insights**: ON

---

## 🎨 PASO 7: Después de Configurar SSL en el Servidor

### Una vez que hayas configurado Let's Encrypt:

1. **Cambiar SSL/TLS Mode**:
   - SSL/TLS → Overview
   - Cambiar a: **Full (strict)**

2. **Activar Proxy de Cloudflare**:
   - DNS → Records
   - Cambiar proxy status de 🌑 **DNS only** a 🟠 **Proxied**
   - Hacer esto para los registros @ y www

3. **Activar "Always Use HTTPS"**:
   - SSL/TLS → Edge Certificates
   - Always Use HTTPS: ON

4. **Purgar Cache**:
   - Caching → Configuration
   - Purge Everything

---

## ✅ Checklist de Configuración

### Fase 1: Configuración Inicial (DNS sin SSL)
- [ ] Registros DNS A creados (@ y www)
- [ ] Proxy Status en "DNS only" (nube gris)
- [ ] SSL/TLS mode: Flexible
- [ ] DNS propagado (verificado en dnschecker.org)
- [ ] Sitio accesible por HTTP

### Fase 2: Después de Configurar SSL
- [ ] Certificado Let's Encrypt obtenido
- [ ] SSL/TLS mode cambiado a: Full (strict)
- [ ] Proxy Status activado (nube naranja) - Opcional
- [ ] Always Use HTTPS: ON
- [ ] HSTS configurado
- [ ] Sitio accesible por HTTPS
- [ ] Redirección HTTP → HTTPS funcionando

### Fase 3: Optimizaciones
- [ ] Auto Minify activado
- [ ] Brotli activado
- [ ] HTTP/3 activado
- [ ] Page Rules configuradas
- [ ] Firewall WAF activado
- [ ] Rate Limiting configurado
- [ ] Cache configurado
- [ ] Analytics activado

---

## 🔍 Verificaciones

### Verificar DNS
```bash
nslookup coopechicoj.com
dig coopechicoj.com
```

O en línea: https://dnschecker.org/#A/coopechicoj.com

### Verificar SSL
https://www.ssllabs.com/ssltest/analyze.html?d=coopechicoj.com

### Verificar Performance
https://pagespeed.web.dev/analysis?url=https://coopechicoj.com

### Verificar Headers
```bash
curl -I https://coopechicoj.com
```

---

## ⚠️ Troubleshooting

### Problema: "DNS_PROBE_FINISHED_NXDOMAIN"
**Solución:**
- Verifica que los registros DNS estén correctos
- Espera 5-30 minutos para propagación
- Limpia cache DNS: `ipconfig /flushdns` (Windows)

### Problema: "ERR_TOO_MANY_REDIRECTS"
**Solución:**
- Cambia SSL/TLS mode a "Flexible" temporalmente
- Verifica configuración de redirección en nginx

### Problema: "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"
**Solución:**
- Verifica que el certificado SSL esté correctamente instalado
- Cambia a "Full" o "Flexible" temporalmente

### Problema: WebSockets no funcionan
**Solución:**
- Desactiva "Rocket Loader" en Cloudflare
- Verifica configuración de WebSocket en nginx
- Si usas proxy naranja, asegúrate de que el puerto 443 soporte WebSockets

---

## 📱 Configuración Móvil (App Cloudflare)

También puedes gestionar Cloudflare desde tu móvil:

1. Descarga: **Cloudflare** (iOS/Android)
2. Inicia sesión
3. Selecciona tu dominio
4. Gestiona DNS, SSL, Firewall desde la app

---

## 🎯 Configuración Recomendada Final

```
DNS:
  @ → 165.227.103.238 (Proxied 🟠)
  www → 165.227.103.238 (Proxied 🟠)
  api → coopechicoj.com (Proxied 🟠)

SSL/TLS:
  Mode: Full (strict)
  Always Use HTTPS: ON
  HSTS: Enabled
  Minimum TLS: 1.2

Security:
  WAF: Medium or High
  Rate Limiting: ON para /api/*
  
Performance:
  Auto Minify: ON (JS, CSS, HTML)
  Brotli: ON
  HTTP/3: ON
  Rocket Loader: OFF
```

---

## 📞 Recursos Adicionales

- **Cloudflare Docs**: https://developers.cloudflare.com/
- **DNS Checker**: https://dnschecker.org/
- **SSL Test**: https://www.ssllabs.com/ssltest/
- **Community**: https://community.cloudflare.com/

---

## 🎉 ¡Listo!

Tu dominio está completamente configurado con:
- ✅ DNS apuntando a tu servidor
- ✅ SSL/TLS (HTTPS)
- ✅ Protección DDoS
- ✅ Firewall WAF
- ✅ CDN Global
- ✅ Optimización de velocidad

**Tu sitio**: https://coopechicoj.com 🚀

