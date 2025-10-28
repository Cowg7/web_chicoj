# 🎨 Guía Visual de Configuración - coopechicoj.com

## 🗺️ Mapa del Proceso

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONFIGURACIÓN COMPLETA                       │
│                         45-60 minutos                           │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────────┐
        │  FASE 1: CLOUDFLARE DNS (10 min)      │
        │  ☁️ Configurar registros DNS          │
        └────────────────────────────────────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────────┐
        │  FASE 2: SERVIDOR (15 min)            │
        │  🖥️ Actualizar configuración          │
        └────────────────────────────────────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────────┐
        │  FASE 3: SSL (15 min)                 │
        │  🔒 Let's Encrypt + HTTPS             │
        └────────────────────────────────────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────────┐
        │  FASE 4: CLOUDFLARE FINAL (5 min)     │
        │  🚀 Optimizaciones finales            │
        └────────────────────────────────────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────────┐
        │  ✅ SITIO FUNCIONANDO EN HTTPS        │
        │  https://coopechicoj.com 🎉           │
        └────────────────────────────────────────┘
```

---

## 🌐 FASE 1: CLOUDFLARE DNS

```
┌──────────────────────────────────────────────────────────┐
│ CLOUDFLARE DASHBOARD                                     │
│ https://dash.cloudflare.com                              │
└──────────────────────────────────────────────────────────┘
                       │
                       │ Seleccionar dominio
                       ▼
┌──────────────────────────────────────────────────────────┐
│ DNS → Records                                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Tipo: A                                                 │
│  Nombre: @                                               │
│  Contenido: 165.227.103.238                              │
│  Proxy: 🌑 DNS only (IMPORTANTE: GRIS)                   │
│  TTL: Auto                                               │
│                                                          │
│  ────────────────────────────────────                    │
│                                                          │
│  Tipo: A                                                 │
│  Nombre: www                                             │
│  Contenido: 165.227.103.238                              │
│  Proxy: 🌑 DNS only                                      │
│  TTL: Auto                                               │
│                                                          │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ SSL/TLS → Overview                                       │
│ Modo: Flexible                                           │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
           ⏱️ Esperar 5-10 minutos
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ ✅ DNS CONFIGURADO                                       │
│ Verificar: https://dnschecker.org                        │
└──────────────────────────────────────────────────────────┘
```

---

## 🖥️ FASE 2: SERVIDOR

```
┌─────────────────────────────────────────────────────────┐
│ TU COMPUTADORA (Windows)                                │
├─────────────────────────────────────────────────────────┤
│ PowerShell                                              │
│ > ssh root@165.227.103.238                              │
└─────────────────────────────────────────────────────────┘
                      │
                      │ SSH Conectado
                      ▼
┌─────────────────────────────────────────────────────────┐
│ SERVIDOR (DigitalOcean Droplet)                         │
│ root@web-chicoj:~#                                      │
└─────────────────────────────────────────────────────────┘
                      │
                      │ cd /opt/chicoj
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 1. EDITAR .env                                          │
│    $ nano .env                                          │
│                                                         │
│    DOMAIN=coopechicoj.com                               │
│    ALLOWED_ORIGINS=http://coopechicoj.com,...           │
│    SSL_EMAIL=tu-email@gmail.com                         │
│    JWT_SECRET=tu-secret-largo                           │
│    POSTGRES_PASSWORD=tu-password                        │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 2. VERIFICAR NGINX                                      │
│    $ nano nginx/conf.d/default.conf                     │
│                                                         │
│    Línea 9:                                             │
│    server_name coopechicoj.com www.coopechicoj.com;     │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 3. DETENER SERVICIOS                                    │
│    $ docker-compose down                                │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 4. LIBERAR PUERTOS                                      │
│    $ sudo systemctl stop apache2                        │
│    $ sudo systemctl stop nginx                          │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 5. INICIAR SERVICIOS                                    │
│    $ docker-compose up -d                               │
│    $ docker-compose ps                                  │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 6. PROBAR HTTP                                          │
│    $ curl -I http://coopechicoj.com                     │
│                                                         │
│    ✅ HTTP/1.1 200 OK                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 FASE 3: SSL / HTTPS

```
┌─────────────────────────────────────────────────────────┐
│ SERVIDOR: /opt/chicoj                                   │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 1. VERIFICAR DNS                                        │
│    $ nslookup coopechicoj.com                           │
│                                                         │
│    ✅ Debe mostrar: 165.227.103.238                     │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 2. CREAR DIRECTORIOS                                    │
│    $ mkdir -p certbot/conf certbot/www                  │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 3. OBTENER CERTIFICADO SSL                              │
│    $ docker-compose run --rm certbot certonly \         │
│      --webroot \                                        │
│      --webroot-path=/var/www/certbot \                  │
│      --email tu-email@gmail.com \                       │
│      -d coopechicoj.com \                               │
│      -d www.coopechicoj.com                             │
│                                                         │
│    ⏱️ Proceso: 2-5 minutos                              │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 4. VERIFICAR CERTIFICADOS                               │
│    $ ls certbot/conf/live/coopechicoj.com/              │
│                                                         │
│    ✅ fullchain.pem                                     │
│    ✅ privkey.pem                                       │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 5. ACTIVAR HTTPS EN NGINX                               │
│    $ nano nginx/conf.d/default.conf                     │
│                                                         │
│    Descomentar líneas 89-163:                           │
│    server {                                             │
│        listen 443 ssl http2;                            │
│        server_name coopechicoj.com www.coopechicoj.com; │
│        ssl_certificate /etc/letsencrypt/...             │
│        ...                                              │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 6. AGREGAR REDIRECCIÓN HTTP → HTTPS                     │
│    En bloque HTTP (línea 9):                            │
│                                                         │
│    location / {                                         │
│        return 301 https://$host$request_uri;            │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 7. REINICIAR NGINX                                      │
│    $ docker-compose exec nginx nginx -t                 │
│    $ docker-compose restart nginx                       │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ ✅ HTTPS FUNCIONANDO                                    │
│    https://coopechicoj.com 🔒                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 FASE 4: CLOUDFLARE OPTIMIZACIÓN

```
┌─────────────────────────────────────────────────────────┐
│ CLOUDFLARE DASHBOARD                                    │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 1. SSL/TLS → Overview                                   │
│    Cambiar de: Flexible                                 │
│    A: Full (strict) ✅                                  │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 2. SSL/TLS → Edge Certificates                          │
│    Always Use HTTPS: ON ✅                              │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 3. DNS → Records (OPCIONAL)                             │
│                                                         │
│    Registro @:                                          │
│    Cambiar de: 🌑 DNS only                              │
│    A: 🟠 Proxied                                        │
│                                                         │
│    Registro www:                                        │
│    Cambiar de: 🌑 DNS only                              │
│    A: 🟠 Proxied                                        │
│                                                         │
│    ⚠️ Beneficios:                                       │
│    - CDN Global                                         │
│    - Protección DDoS                                    │
│    - Firewall WAF                                       │
│    - Cache automático                                   │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Caching → Configuration                              │
│    Purge Everything                                     │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ ✅ CONFIGURACIÓN COMPLETA                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Tráfico Final

### Sin Proxy de Cloudflare (DNS only):
```
Usuario
  │
  │ DNS Query
  ▼
Cloudflare DNS
  │
  │ Responde: 165.227.103.238
  ▼
Usuario
  │
  │ HTTPS Request
  ▼
Tu Servidor (165.227.103.238)
  │
  ├─► Nginx (Proxy Reverso)
  │     │
  │     ├─► Frontend (Archivos estáticos)
  │     └─► Backend API (Node.js + WebSockets)
  │           │
  │           └─► PostgreSQL
  │
  │ HTTPS Response
  ▼
Usuario
```

### Con Proxy de Cloudflare (Proxied):
```
Usuario
  │
  │ DNS Query
  ▼
Cloudflare DNS
  │
  │ Responde: IP de Cloudflare
  ▼
Usuario
  │
  │ HTTPS Request
  ▼
Cloudflare Edge (CDN)
  │
  ├─► Cache (si está cacheado)
  │     │
  │     └─► Respuesta inmediata
  │
  ├─► WAF / Firewall
  │
  ├─► DDoS Protection
  │
  │ HTTPS Request
  ▼
Tu Servidor (165.227.103.238)
  │
  ├─► Nginx
  │     │
  │     ├─► Frontend
  │     └─► Backend
  │           │
  │           └─► PostgreSQL
  │
  │ HTTPS Response
  ▼
Cloudflare Edge
  │
  │ Optimizaciones (minify, compress, etc.)
  ▼
Usuario
```

---

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE                              │
│  • DNS Management                                           │
│  • SSL/TLS                                                  │
│  • CDN (si proxy activado)                                  │
│  • WAF / Firewall                                           │
│  • DDoS Protection                                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│         DIGITALOCEAN DROPLET (165.227.103.238)              │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ DOCKER COMPOSE                                        │ │
│  │                                                       │ │
│  │  ┌─────────────────┐  ┌─────────────────┐            │ │
│  │  │  Nginx          │  │  Certbot        │            │ │
│  │  │  • Port 80/443  │  │  • SSL Certs    │            │ │
│  │  │  • Reverse Proxy│  │  • Auto-renew   │            │ │
│  │  │  • Static Files │  │                 │            │ │
│  │  └────────┬────────┘  └─────────────────┘            │ │
│  │           │                                           │ │
│  │           ├─► Frontend (HTML/CSS/JS)                  │ │
│  │           │                                           │ │
│  │           └─► ┌─────────────────┐                     │ │
│  │               │  Backend        │                     │ │
│  │               │  • Node.js      │                     │ │
│  │               │  • Express      │                     │ │
│  │               │  • Socket.io    │                     │ │
│  │               │  • Prisma ORM   │                     │ │
│  │               └────────┬────────┘                     │ │
│  │                        │                              │ │
│  │                        ▼                              │ │
│  │               ┌─────────────────┐                     │ │
│  │               │  PostgreSQL     │                     │ │
│  │               │  • Database     │                     │ │
│  │               │  • restaurante_db│                    │ │
│  │               └─────────────────┘                     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 URLs y Endpoints

```
┌──────────────────────────────────────────────────────────┐
│ PRINCIPALES URLs                                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🌐 https://coopechicoj.com                              │
│     └─► Frontend principal                              │
│                                                          │
│  🌐 https://www.coopechicoj.com                          │
│     └─► Alias del sitio principal                       │
│                                                          │
│  🔌 https://coopechicoj.com/api/                         │
│     └─► REST API del backend                            │
│                                                          │
│  ⚡ https://coopechicoj.com/socket.io/                   │
│     └─► WebSocket (notificaciones en tiempo real)       │
│                                                          │
│  ❤️ https://coopechicoj.com/api/health                  │
│     └─► Health check del sistema                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔑 Archivos Clave en el Servidor

```
/opt/chicoj/
│
├── 📄 .env ← Variables de entorno (IMPORTANTE: Mantener seguro)
│   ├─ DOMAIN=coopechicoj.com
│   ├─ ALLOWED_ORIGINS=...
│   ├─ JWT_SECRET=...
│   └─ POSTGRES_PASSWORD=...
│
├── 📄 docker-compose.yml ← Orquestación de contenedores
│
├── 📁 nginx/
│   └── conf.d/
│       └── 📄 default.conf ← Configuración de nginx
│           ├─ server_name coopechicoj.com
│           ├─ SSL certificates
│           └─ Proxy rules
│
├── 📁 certbot/
│   ├── conf/
│   │   └── live/coopechicoj.com/
│   │       ├── 🔐 fullchain.pem
│   │       └── 🔐 privkey.pem
│   └── www/ ← Para validación ACME
│
├── 📁 chicoj-frontend/ ← Archivos del frontend
│   ├── index.html
│   ├── css/
│   ├── scripts/
│   └── templates/
│
└── 📁 Chicoj_System_R-T/backend/ ← Código del backend
    ├── server.js
    ├── prisma/
    └── routes/
```

---

## ⏱️ Timeline de Configuración

```
Minuto 0-10: CLOUDFLARE
├─ 0:00  Acceder a Cloudflare
├─ 0:02  Configurar DNS (@ y www)
├─ 0:05  Configurar SSL/TLS (Flexible)
└─ 0:10  Verificar propagación DNS

Minuto 10-25: SERVIDOR
├─ 10:00 Conectar SSH
├─ 10:02 Actualizar .env
├─ 10:05 Verificar nginx config
├─ 10:08 Detener servicios
├─ 10:10 Liberar puertos
├─ 10:12 Iniciar servicios
├─ 10:15 Esperar que levanten
└─ 10:25 Probar HTTP

Minuto 25-40: SSL
├─ 25:00 Verificar DNS propagado
├─ 25:02 Crear directorios
├─ 25:05 Obtener certificado Let's Encrypt
├─ 25:10 Verificar certificados
├─ 25:12 Activar HTTPS en nginx
├─ 25:20 Agregar redirección HTTP→HTTPS
├─ 25:25 Reiniciar nginx
└─ 25:40 Probar HTTPS

Minuto 40-45: CLOUDFLARE FINAL
├─ 40:00 Cambiar SSL a Full (strict)
├─ 40:02 Activar Always Use HTTPS
├─ 40:03 (Opcional) Activar proxy
└─ 40:05 Purgar cache

Minuto 45-50: VERIFICACIÓN
├─ 45:00 Probar todas las URLs
├─ 45:02 Verificar SSL
├─ 45:05 Probar API
└─ 45:10 ✅ COMPLETADO
```

---

## 🎉 Estado Final

```
┌────────────────────────────────────────────────────────┐
│              SISTEMA COMPLETAMENTE CONFIGURADO         │
└────────────────────────────────────────────────────────┘

✅ DNS          Cloudflare → 165.227.103.238
✅ HTTP         Redirige → HTTPS
✅ HTTPS        Let's Encrypt SSL válido
✅ Certificado  Renovación automática cada 12h
✅ Backend      Node.js + Express + Socket.io
✅ Database     PostgreSQL
✅ Frontend     Archivos estáticos vía Nginx
✅ WebSockets   Funcionando
✅ CORS         Configurado correctamente

┌────────────────────────────────────────────────────────┐
│  🌐 https://coopechicoj.com                            │
│  🔒 SSL: A+ Rating                                     │
│  🚀 Listo para producción                              │
└────────────────────────────────────────────────────────┘
```

---

**💡 Tip**: Imprime esta guía visual y tenla a mano durante la configuración.

**📖 Siguiente paso**: Lee `SETUP_COOPECHICOJ_COM.md` para instrucciones detalladas.

