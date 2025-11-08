# 🔍 Otros Factores que Pueden Causar Desconexión de Base de Datos

## ❌ Error que Sigues Viendo:
```
terminating connection due to administrator command
Database restaurante_db does not exist
```

---

## 🎯 FACTORES ADICIONALES A VERIFICAR

### **1. 🚫 Límites del Proveedor de Base de Datos**

#### **A) Plan Gratuito con Límites Estrictos**

**Render.com (Free Tier):**
```
❌ Se DUERME después de 15 minutos de inactividad
❌ Tarda 30-60 segundos en despertar
❌ Máximo 1 GB de almacenamiento
❌ Conexiones limitadas a 5-10
```

**Neon.tech (Free Tier):**
```
❌ Se SUSPENDE después de 5 minutos de inactividad
❌ Límite de 3 proyectos
❌ 0.5 GB de almacenamiento
❌ Compute hours limitadas
```

**Supabase (Free Tier):**
```
✅ NO se suspende
❌ Pero pausa después de 1 semana sin actividad
❌ Máximo 500 MB de almacenamiento
❌ Pool limit: 10 conexiones (60 con pooler)
```

**Railway (Free Tier):**
```
✅ NO se suspende automáticamente
❌ Pero tienes 500 horas/mes ($5 crédito)
❌ Después se detiene hasta el siguiente mes
```

**VERIFICAR:**
```bash
# 1. Ver plan de tu base de datos
# En el panel de tu proveedor, verificar:
- Plan actual
- Límite de conexiones
- Políticas de suspensión
- Horas/crédito disponibles

# 2. Ver si se está quedando sin recursos
curl https://coopechicoj.com/api/health/detailed

# Buscar:
{
  "database": {
    "status": "unhealthy"  ← Problema
  }
}
```

**SOLUCIÓN:**
```bash
# Opción 1: Cambiar a plan de pago (más estable)
# Render: $7/mes
# Railway: $5/mes + uso
# Supabase: $25/mes

# Opción 2: Cambiar de proveedor
# Migrar a Railway o Supabase (más estables en plan gratis)
```

---

### **2. 🔥 Firewall o Timeout de Red**

#### **A) Firewall del Servidor Bloqueando Conexiones**

**Síntoma:** Conexiones se cortan después de X minutos

**VERIFICAR:**
```bash
# En tu servidor (si tienes acceso SSH)
sudo iptables -L -n

# Ver si hay reglas que limiten conexiones persistentes
sudo netstat -anp | grep :5432

# Ver timeouts de conexión
cat /proc/sys/net/ipv4/tcp_keepalive_time
# Debería ser >= 300 (5 minutos)
```

**SOLUCIÓN:**
```bash
# Aumentar TCP keepalive
sudo sysctl -w net.ipv4.tcp_keepalive_time=300
sudo sysctl -w net.ipv4.tcp_keepalive_intvl=30
sudo sysctl -w net.ipv4.tcp_keepalive_probes=5

# Hacer permanente
echo "net.ipv4.tcp_keepalive_time=300" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_keepalive_intvl=30" | sudo tee -a /etc/sysctl.conf
```

#### **B) Proxy/Load Balancer con Timeout Corto**

Si usas Nginx, Cloudflare, o algún proxy:

**VERIFICAR en `nginx.conf`:**
```nginx
# Buscar estos valores
proxy_read_timeout 60s;      ← Muy corto
proxy_connect_timeout 60s;   ← Muy corto
keepalive_timeout 65s;       ← Muy corto
```

**SOLUCIÓN:**
```nginx
# Aumentar timeouts en nginx/conf.d/default.conf
location /api/ {
    proxy_pass http://chicoj-backend:3000;
    
    # AGREGAR ESTOS:
    proxy_read_timeout 300s;      # 5 minutos
    proxy_connect_timeout 300s;   # 5 minutos
    proxy_send_timeout 300s;      # 5 minutos
    
    # Keep-alive
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    keepalive_timeout 300s;       # 5 minutos
}
```

---

### **3. 🐳 Problemas con Docker/Contenedores**

#### **A) Contenedor Reiniciándose Automáticamente**

**VERIFICAR:**
```bash
# Ver si el contenedor se reinicia
docker ps -a
# Buscar en "STATUS": "Up 2 minutes" (indica reinicios recientes)

# Ver historial de reinicios
docker inspect chicoj-backend | grep RestartCount

# Ver logs de Docker
docker logs chicoj-backend --tail 500 | grep -i "error\|fatal\|restart"
```

**CAUSAS COMUNES:**
```
❌ Límite de memoria excedido
❌ Proceso se crashea por error no manejado
❌ Health check fallando en Docker
❌ OOMKiller matando el proceso
```

**SOLUCIÓN:**
```yaml
# En docker-compose.yml
services:
  chicoj-backend:
    # Aumentar límites de memoria
    mem_limit: 1g
    memswap_limit: 1g
    
    # Política de restart más inteligente
    restart: unless-stopped  # En vez de "always"
    
    # Health check para Docker
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health/ping"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### **B) Múltiples Instancias Compitiendo por Conexiones**

Si tienes **varias instancias del backend** corriendo:

**VERIFICAR:**
```bash
# Ver cuántas instancias están corriendo
docker ps | grep chicoj-backend
# Deberías ver solo 1

# O con PM2
pm2 list
# Deberías ver solo 1 proceso
```

**PROBLEMA:**
```
Si tienes 3 instancias con connection_limit=10 cada una
= 30 conexiones totales
Pero tu plan solo permite 10 conexiones
= ERROR "too many connections"
```

**SOLUCIÓN:**
```bash
# Detener instancias duplicadas
docker stop $(docker ps -q --filter name=chicoj-backend)
docker-compose up -d chicoj-backend  # Solo 1 instancia

# O con PM2
pm2 delete all
pm2 start npm --name "chicoj-backend" -i 1 -- start
# -i 1 = solo 1 instancia (NO usar -i max)
```

---

### **4. 📊 Base de Datos Realmente Se Está Eliminando**

#### **A) Proveedor Eliminando la BD por Inactividad**

Algunos proveedores **ELIMINAN** (no solo suspenden) bases de datos inactivas:

**Heroku (ya no gratis):**
```
❌ Eliminaba BDs después de 7 días sin actividad
```

**ElephantSQL (free tier):**
```
❌ Elimina después de 30 días sin uso
```

**VERIFICAR:**
```bash
# Conectarte directamente a la BD
psql $DATABASE_URL -c "\l"

# Si no aparece "restaurante_db", fue eliminada
```

**SOLUCIÓN:**
```bash
# 1. Si fue eliminada, recrearla
# Usar el script SQL que creamos:
psql $DATABASE_URL < BASE_DE_DATOS_CHICOJ.sql

# 2. Prevenir futuras eliminaciones
# - Usar keep-alive (ya implementado)
# - O cambiar a proveedor más confiable
```

#### **B) Migraciones de Prisma Borrando Datos**

**VERIFICAR:**
```bash
# Ver historial de migraciones
cd Chicoj_System_R-T/backend
npx prisma migrate status

# Ver si hay migraciones pendientes o fallidas
```

**SOLUCIÓN:**
```bash
# Si hay problemas con migraciones
npx prisma migrate resolve --rolled-back "NOMBRE_MIGRACION"
npx prisma migrate deploy

# O recrear desde cero (¡PERDERÁS DATOS!)
npx prisma migrate reset
npm run seed
```

---

### **5. 🔐 Problemas de SSL/TLS**

#### **A) Certificado SSL Expirado o Inválido**

**VERIFICAR:**
```bash
# Probar conexión con SSL
psql "$DATABASE_URL?sslmode=require" -c "SELECT NOW();"

# Si falla, probar sin SSL
psql "$DATABASE_URL?sslmode=disable" -c "SELECT NOW();"
```

**SÍNTOMA:**
```
Error: SSL SYSCALL error: EOF detected
Error: server closed the connection unexpectedly
```

**SOLUCIÓN:**
```bash
# Opción 1: Deshabilitar SSL temporalmente
DATABASE_URL="postgresql://...?sslmode=disable&connection_limit=10"

# Opción 2: Configurar SSL correctamente
DATABASE_URL="postgresql://...?sslmode=require&connection_limit=10"

# Opción 3: Usar modo prefer (intenta SSL, fallback a no-SSL)
DATABASE_URL="postgresql://...?sslmode=prefer&connection_limit=10"
```

---

### **6. 💾 Variables de Entorno No Persistentes**

#### **A) .env No Cargándose Correctamente**

**VERIFICAR:**
```bash
# Dentro del contenedor
docker exec -it chicoj-backend env | grep DATABASE_URL

# O con PM2
pm2 env 0  # ID del proceso

# Debe mostrar la DATABASE_URL completa con parámetros
```

**PROBLEMA COMÚN:**
```bash
# Si el archivo .env tiene caracteres especiales en la contraseña
DATABASE_URL="postgresql://user:p@ssw0rd@host:5432/db"
                              ↑ Esto rompe el parsing
```

**SOLUCIÓN:**
```bash
# Opción 1: Escapar caracteres especiales
# @ → %40
# # → %23
# & → %26
DATABASE_URL="postgresql://user:p%40ssw0rd@host:5432/db"

# Opción 2: Usar variables de entorno del sistema
# En lugar de .env, configurar en:
# - Docker: environment en docker-compose.yml
# - PM2: ecosystem.config.js
# - Sistema: /etc/environment
```

---

### **7. 🔄 PgBouncer o Connection Pooler Intermedio**

#### **A) Proveedor Usa PgBouncer (Supabase, etc.)**

PgBouncer puede cerrar conexiones idle:

**VERIFICAR si tu proveedor usa PgBouncer:**
```bash
# Supabase SÍ usa PgBouncer
# Neon NO usa PgBouncer
# Render NO usa PgBouncer
# Railway NO usa PgBouncer
```

**SOLUCIÓN para Supabase:**
```bash
# IMPORTANTE: Usar el puerto de PgBouncer (6543) no el directo (5432)
# URL con PgBouncer:
DATABASE_URL="postgresql://postgres:pass@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=10"

# NO usar:
DATABASE_URL="postgresql://postgres:pass@db.xxxxx.supabase.co:5432/postgres"
```

**Configuración adicional para PgBouncer:**
```javascript
// En prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // AGREGAR si usas PgBouncer:
  directUrl = env("DIRECT_URL")  // URL sin pgbouncer para migraciones
}
```

```bash
# En .env
DATABASE_URL="postgresql://...co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...co:5432/postgres"  # Para migraciones
```

---

### **8. 🧠 Límites de Memoria del Backend**

#### **A) Node.js Quedándose Sin Memoria**

**VERIFICAR:**
```bash
# Ver uso de memoria
curl https://coopechicoj.com/api/health/detailed | jq .memory

# Respuesta:
{
  "memory": {
    "heapUsed": 450,    ← Si está cerca de "heapTotal", problema
    "heapTotal": 512,
    "unit": "MB"
  }
}
```

**SOLUCIÓN:**
```bash
# Aumentar límite de memoria de Node.js
# En package.json, cambiar:
{
  "scripts": {
    "start": "node --max-old-space-size=1024 src/server.js"
  }
}

# O en docker-compose.yml:
services:
  chicoj-backend:
    environment:
      - NODE_OPTIONS="--max-old-space-size=1024"
```

---

### **9. 🕐 Zona Horaria o Configuración Regional**

#### **A) Problemas con TIMESTAMP y Timezone**

**VERIFICAR:**
```bash
# Conectar a la BD y ver configuración
psql $DATABASE_URL -c "SHOW timezone;"
psql $DATABASE_URL -c "SELECT NOW();"

# Ver zona del servidor
docker exec -it chicoj-backend date
```

**SOLUCIÓN:**
```bash
# Configurar timezone en PostgreSQL
# En DATABASE_URL agregar:
DATABASE_URL="...?timezone=UTC&connection_limit=10"

# O en Docker:
services:
  chicoj-backend:
    environment:
      - TZ=America/Guatemala  # O UTC
```

---

### **10. 📝 Logs de PostgreSQL Deshabilitados**

#### **A) No Puedes Ver Qué Está Pasando en la BD**

**SOLUCIÓN:**
```bash
# Habilitar logs en Prisma (ya lo tenemos en desarrollo)
# Pero en producción, cambiar a:

const prismaClientConfig = {
  log: ['error', 'warn'],  // En producción
  // log: ['query', 'info', 'warn', 'error'],  // En desarrollo
};
```

---

## 🎯 PLAN DE DIAGNÓSTICO COMPLETO

### **Paso 1: Verificar Proveedor de BD**
```bash
# 1. Entrar al panel de tu proveedor
# 2. Ver métricas:
#    - Conexiones activas
#    - Uso de CPU/RAM
#    - Logs de la base de datos
#    - Estado (activa/suspendida/pausada)
```

### **Paso 2: Verificar Conexión Directa**
```bash
# Probar conexión directa desde tu máquina local
psql "$DATABASE_URL" -c "SELECT NOW();"

# Si funciona aquí pero no en el servidor:
# → Problema de red/firewall

# Si NO funciona:
# → Problema con la BD o credenciales
```

### **Paso 3: Ver Logs Completos**
```bash
# Backend
docker logs chicoj-backend --tail 1000 > backend-logs.txt

# Buscar patrones:
cat backend-logs.txt | grep -i "error\|fatal\|terminating\|lost\|closed"

# Ver cuándo empiezan los errores
cat backend-logs.txt | grep -B 10 "terminating connection"
```

### **Paso 4: Monitoreo Continuo**
```bash
# Dejar corriendo en terminal separada
watch -n 5 'curl -s https://coopechicoj.com/api/health | jq .database'

# O instalar herramienta de monitoreo:
# - UptimeRobot (gratis): https://uptimerobot.com
# - Better Uptime: https://betteruptime.com
```

---

## 🛠️ HERRAMIENTA DE DIAGNÓSTICO AUTOMÁTICA

Voy a crear un script que verifica todos estos factores:

**Archivo:** `diagnosticar-conexion-bd.sh`

```bash
#!/bin/bash

echo "🔍 DIAGNÓSTICO DE CONEXIÓN A BASE DE DATOS"
echo "=========================================="
echo ""

# 1. Verificar DATABASE_URL
echo "1️⃣ DATABASE_URL configurada:"
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL no está definida"
else
    echo "✅ DATABASE_URL existe"
    echo "   Tiene parámetros: $(echo $DATABASE_URL | grep -o 'connection_limit\|pool_timeout' || echo '❌ NO')"
fi
echo ""

# 2. Probar conexión
echo "2️⃣ Probando conexión directa..."
if psql "$DATABASE_URL" -c "SELECT 1" &> /dev/null; then
    echo "✅ Conexión exitosa"
else
    echo "❌ No se puede conectar"
fi
echo ""

# 3. Ver contenedores
echo "3️⃣ Contenedores corriendo:"
docker ps --filter name=chicoj-backend --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 4. Verificar health
echo "4️⃣ Health check:"
curl -s http://localhost:3000/api/health | jq '.database' || echo "❌ No responde"
echo ""

# 5. Ver logs recientes
echo "5️⃣ Últimos errores en logs:"
docker logs chicoj-backend --tail 50 | grep -i "error\|fatal" | tail -5
echo ""

echo "=========================================="
echo "✅ Diagnóstico completo"
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

Revisar TODOS estos puntos:

- [ ] ✅ Plan de BD no es free tier con suspensión automática
- [ ] ✅ Límite de conexiones del plan >= 10
- [ ] ✅ No hay firewall bloqueando puerto 5432
- [ ] ✅ Nginx/Proxy tiene timeouts >= 300 segundos
- [ ] ✅ Solo 1 instancia del backend corriendo
- [ ] ✅ Contenedor no se reinicia cada pocos minutos
- [ ] ✅ DATABASE_URL tiene todos los parámetros
- [ ] ✅ Keep-alive aparece en logs cada 5 minutos
- [ ] ✅ Base de datos realmente existe (no fue eliminada)
- [ ] ✅ SSL configurado correctamente (si es requerido)
- [ ] ✅ Si usa PgBouncer, puerto correcto (6543)
- [ ] ✅ Variables de entorno se cargan bien
- [ ] ✅ Memoria del backend suficiente (>= 512 MB)
- [ ] ✅ Logs de Prisma habilitados
- [ ] ✅ `/api/health` retorna "healthy"

---

## 🎯 RECOMENDACIÓN FINAL

Si después de verificar TODO esto el problema persiste:

### **Opción 1: Cambiar de Proveedor (más fácil)**
```
❌ Si estás en Render Free → Migrar a Railway o Supabase
❌ Si estás en Neon Free → Migrar a Railway o Supabase
✅ Railway: No se suspende, 500h/mes gratis
✅ Supabase: No se suspende, 2 proyectos gratis
```

### **Opción 2: Pagar Plan Básico (más confiable)**
```
✅ Render: $7/mes
✅ Railway: ~$5-10/mes
✅ Supabase: $25/mes
✅ Digital Ocean: $15/mes
```

### **Opción 3: Base de Datos Local en tu Servidor**
```bash
# Instalar PostgreSQL en tu mismo servidor
sudo apt install postgresql

# Crear BD local
sudo -u postgres createdb restaurante_db

# DATABASE_URL local
DATABASE_URL="postgresql://postgres:pass@localhost:5432/restaurante_db?connection_limit=20"

# Ventaja: Sin suspensión, sin límites, conexión súper rápida
# Desventaja: Tienes que hacer backups manualmente
```

---

¿Cuál de estos factores crees que podría ser el problema en tu caso? 🤔

