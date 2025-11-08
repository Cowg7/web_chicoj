# 🚀 Guía de Despliegue a Producción - Sistema Chicoj

## 📋 Pre-requisitos

- ✅ Node.js 18+ instalado
- ✅ PostgreSQL 12+ (local o en la nube)
- ✅ Docker y Docker Compose (opcional pero recomendado)
- ✅ Dominio configurado (si usas HTTPS)

---

## 🔧 Paso 1: Configurar Base de Datos

### Opción A: Base de Datos en la Nube (Recomendado)

#### 1. Crear base de datos en algún proveedor:

**Recomendados:**
- ✅ **Railway** (500 horas/mes gratis) → https://railway.app
- ✅ **Supabase** (2 proyectos gratis) → https://supabase.com
- ✅ **Render** (Plan gratis) → https://render.com
- ✅ **Neon** (3 proyectos gratis) → https://neon.tech

#### 2. Obtener la URL de conexión

Ejemplo de Railway:
```
postgresql://postgres:contraseña123@containers-us-west-xxx.railway.app:1234/railway
```

#### 3. **IMPORTANTE:** Agregar parámetros de conexión

**Añadir al final de la URL:**
```
?connection_limit=10&pool_timeout=30&connect_timeout=30&socket_timeout=30
```

**URL final:**
```
postgresql://postgres:contraseña123@containers-us-west-xxx.railway.app:1234/railway?connection_limit=10&pool_timeout=30&connect_timeout=30&socket_timeout=30
```

### Opción B: Base de Datos Local

```bash
# Instalar PostgreSQL
# En Ubuntu/Debian:
sudo apt update
sudo apt install postgresql postgresql-contrib

# Crear base de datos
sudo -u postgres psql
CREATE DATABASE restaurante_db;
CREATE USER chicoj WITH ENCRYPTED PASSWORD 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE restaurante_db TO chicoj;
\q

# Tu DATABASE_URL será:
postgresql://chicoj:tu_contraseña_segura@localhost:5432/restaurante_db?connection_limit=10&pool_timeout=30
```

---

## 🛠️ Paso 2: Configurar Variables de Entorno

### 1. Crear archivo `.env` en `Chicoj_System_R-T/backend/`

```bash
cd Chicoj_System_R-T/backend
nano .env  # o usa vim, code, etc.
```

### 2. Copiar y editar estas variables:

```bash
# ============ BASE DE DATOS ============
# IMPORTANTE: Incluir los parámetros de conexión
DATABASE_URL="postgresql://usuario:pass@host:5432/restaurante_db?connection_limit=10&pool_timeout=30&connect_timeout=30&socket_timeout=30"

# ============ SERVIDOR ============
PORT=3000
NODE_ENV=production

# ============ SEGURIDAD ============
# CAMBIAR ESTE SECRET POR UNO ÚNICO Y SEGURO
JWT_SECRET="tu_clave_secreta_super_segura_cambiala_ahora_123456789"
JWT_EXPIRES_IN="24h"

# ============ CORS ============
# Tu dominio de producción (separados por coma si son varios)
ALLOWED_ORIGINS="https://coopechicoj.com,https://www.coopechicoj.com"

# ============ LOGS ============
LOG_LEVEL=info
```

### 3. Guardar y cerrar (Ctrl+X, luego Y, luego Enter)

---

## 📦 Paso 3: Instalar Dependencias

```bash
# En Chicoj_System_R-T/backend/
npm install

# Generar cliente de Prisma
npx prisma generate
```

---

## 🗄️ Paso 4: Crear Tablas en la Base de Datos

### Opción A: Usando Prisma Migrate (Recomendado)

```bash
# Ejecutar migraciones
npx prisma migrate deploy

# Poblar con datos iniciales
npm run seed
# O:
node prisma/seed.js
```

### Opción B: Usando el Script SQL

```bash
# Si tienes el archivo BASE_DE_DATOS_CHICOJ.sql
psql -h tu_host -U tu_usuario -d restaurante_db -f ../../BASE_DE_DATOS_CHICOJ.sql
```

---

## ✅ Paso 5: Verificar Conexión

```bash
# Probar conexión a la base de datos
npx prisma db pull

# Debería mostrar: "Introspected X models..."
```

---

## 🚀 Paso 6: Iniciar el Backend

### Modo Desarrollo (para probar):

```bash
npm run dev
```

### Modo Producción:

```bash
# Iniciar
npm start

# O con PM2 (recomendado para servidores):
npm install -g pm2
pm2 start npm --name "chicoj-backend" -- start
pm2 save
pm2 startup
```

---

## 🔍 Paso 7: Verificar que Todo Funciona

### 1. Health Check Básico:

```bash
curl http://localhost:3000/api/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T...",
  "database": {
    "status": "healthy",
    "connected": true,
    "keepAliveCount": 5
  }
}
```

### 2. Health Check Detallado:

```bash
curl http://localhost:3000/api/health/detailed
```

### 3. Verificar Keep-Alive:

```bash
# Ver logs del backend
pm2 logs chicoj-backend

# O si usas Docker:
docker logs chicoj-backend

# Deberías ver cada 5 minutos:
# [DB KEEPALIVE] Ping exitoso #20 - Conexión activa
```

### 4. Probar Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🌐 Paso 8: Configurar Frontend

### 1. Actualizar URL del Backend en Frontend

Archivo: `chicoj-frontend/scripts/config.js` (o similar)

```javascript
// Cambiar:
const API_URL = 'http://localhost:3000/api';

// Por tu URL de producción:
const API_URL = 'https://api.coopechicoj.com/api';
// O si está en el mismo dominio:
const API_URL = '/api';
```

### 2. Actualizar Nginx para servir Frontend

Archivo: `nginx/conf.d/default.conf`

```nginx
server {
    listen 80;
    server_name coopechicoj.com www.coopechicoj.com;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy al Backend
    location /api/ {
        proxy_pass http://chicoj-backend:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🐳 Paso 9: Despliegue con Docker (Opcional)

### 1. Verificar docker-compose.yml

```yaml
version: '3.8'

services:
  chicoj-backend:
    build: ./Chicoj_System_R-T/backend
    container_name: chicoj-backend
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
    ports:
      - "3000:3000"
    depends_on:
      - db  # Si usas DB local

  nginx:
    image: nginx:alpine
    container_name: chicoj-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./chicoj-frontend:/usr/share/nginx/html
      - ./nginx/conf.d:/etc/nginx/conf.d
    depends_on:
      - chicoj-backend

  # Solo si usas base de datos local
  db:
    image: postgres:15-alpine
    container_name: chicoj-db
    restart: always
    environment:
      - POSTGRES_DB=restaurante_db
      - POSTGRES_USER=chicoj
      - POSTGRES_PASSWORD=tu_contraseña_segura
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 2. Iniciar con Docker:

```bash
# Construir y levantar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Ver solo logs del backend
docker-compose logs -f chicoj-backend

# Ver estado
docker-compose ps
```

---

## 📊 Paso 10: Monitoreo en Producción

### 1. Ver logs del Keep-Alive:

```bash
# Con PM2:
pm2 logs chicoj-backend | grep KEEPALIVE

# Con Docker:
docker logs chicoj-backend | grep KEEPALIVE

# Deberías ver:
# [DB KEEPALIVE] Sistema de keep-alive iniciado (cada 15s)
# [DB KEEPALIVE] Ping exitoso #20 - Conexión activa
# [DB KEEPALIVE] Ping exitoso #40 - Conexión activa
```

### 2. Monitorear Health:

```bash
# Instalar un cron job para monitorear cada 5 minutos
crontab -e

# Agregar:
*/5 * * * * curl -s http://localhost:3000/api/health > /dev/null
```

### 3. Configurar Uptime Monitoring (Recomendado):

Servicios gratuitos:
- ✅ **UptimeRobot** → https://uptimerobot.com
- ✅ **Better Uptime** → https://betteruptime.com
- ✅ **Freshping** → https://freshping.io

Configurar para hacer ping a:
```
https://tudominio.com/api/health
```

---

## 🔐 Paso 11: Seguridad (HTTPS)

### Opción A: Usando Certbot (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d coopechicoj.com -d www.coopechicoj.com

# Renovación automática
sudo certbot renew --dry-run
```

### Opción B: Usando Cloudflare

1. Registrar dominio en Cloudflare
2. Activar SSL/TLS (Flexible o Full)
3. Configurar DNS para apuntar a tu servidor

---

## 🔧 Troubleshooting

### Problema: "Database does not exist"

**Solución:**
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Ejecutar migraciones
npx prisma migrate deploy

# Verificar conexión
npx prisma db pull
```

### Problema: Keep-Alive no funciona

**Solución:**
```bash
# Ver si hay errores
pm2 logs chicoj-backend | grep ERROR

# Verificar que los parámetros estén en DATABASE_URL
echo $DATABASE_URL | grep "connection_limit"
```

### Problema: CORS Error

**Solución:**
```bash
# Verificar ALLOWED_ORIGINS en .env
cat .env | grep ALLOWED_ORIGINS

# Debe incluir tu dominio de producción
ALLOWED_ORIGINS="https://tudominio.com"
```

### Problema: "Connection pool timeout"

**Solución:**
```bash
# Aumentar pool_timeout en DATABASE_URL
DATABASE_URL="...?connection_limit=10&pool_timeout=60&..."
```

---

## 📋 Checklist Final

Antes de considerar el despliegue completo:

- [ ] ✅ Base de datos creada y accesible
- [ ] ✅ DATABASE_URL con parámetros de conexión
- [ ] ✅ Migraciones ejecutadas
- [ ] ✅ Datos iniciales cargados (seed)
- [ ] ✅ Backend iniciado y respondiendo
- [ ] ✅ `/api/health` retorna `"status": "healthy"`
- [ ] ✅ Keep-Alive activo (ver logs cada 5 min)
- [ ] ✅ Frontend puede comunicarse con Backend
- [ ] ✅ CORS configurado correctamente
- [ ] ✅ HTTPS configurado (si es producción real)
- [ ] ✅ PM2/Docker configurado para auto-restart
- [ ] ✅ Monitoreo de uptime configurado
- [ ] ✅ Backups de base de datos configurados
- [ ] ✅ JWT_SECRET cambiado a uno único
- [ ] ✅ Variables de entorno protegidas (no en Git)

---

## 🎉 ¡Listo!

Tu sistema Chicoj debería estar:
- ✅ **Funcionando 24/7**
- ✅ **Conexión a DB estable** (gracias al keep-alive)
- ✅ **Reconexión automática** si hay problemas
- ✅ **Monitoreable** vía health checks

---

## 📞 Soporte

Si tienes problemas:

1. **Ver logs detallados:**
   ```bash
   pm2 logs chicoj-backend --lines 200
   ```

2. **Health check detallado:**
   ```bash
   curl http://localhost:3000/api/health/detailed | jq
   ```

3. **Verificar base de datos:**
   ```bash
   psql $DATABASE_URL -c "SELECT NOW();"
   ```

**¡Tu sistema debería funcionar sin problemas de desconexión ahora!** 🚀

