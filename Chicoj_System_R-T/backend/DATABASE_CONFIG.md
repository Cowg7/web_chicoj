# 🔧 Configuración de Base de Datos para Producción

## 🚨 Solución al Error: "terminating connection due to administrator command"

Este documento explica cómo configurar correctamente la base de datos para **evitar desconexiones automáticas** en producción.

---

## 📋 Problema Común

```
Error in PostgreSQL connection: terminating connection due to administrator command
Database restaurante_db does not exist
```

### Causas:
1. ✅ **Servicios gratuitos suspenden la base de datos** por inactividad
2. ✅ **Pool de conexiones mal configurado**
3. ✅ **Timeouts muy cortos**
4. ✅ **Falta de keep-alive activo**

---

## ✅ Solución Implementada

### 1. **Keep-Alive Automático** (NUEVO)
El sistema ahora hace un "ping" a la base de datos **cada 15 segundos** para mantenerla viva.

```javascript
// En database.js
Sistema de keep-alive cada 15 segundos
Reconexión automática si falla
Logs cada 5 minutos
```

### 2. **Parámetros de Conexión Optimizados** (NUEVO)
```
connection_limit=10       → Máximo 10 conexiones simultáneas
pool_timeout=30          → Timeout de 30 segundos
connect_timeout=30       → Timeout de conexión 30s
socket_timeout=30        → Timeout de socket 30s
pool_mode=transaction    → Modo optimizado
pgbouncer=true          → Compatible con PgBouncer
```

### 3. **Reconexión Automática Mejorada**
- ✅ Detecta errores de conexión automáticamente
- ✅ Reintenta hasta 5 veces
- ✅ Espera 5 segundos entre intentos
- ✅ Maneja errores no capturados

---

## 🔧 Configuración de DATABASE_URL

### Formato Básico:
```bash
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/base_de_datos?parámetros"
```

### ⭐ Configuración Recomendada para Producción:

#### **Render.com** (Plan Gratis/Starter)
```bash
DATABASE_URL="postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/database?ssl=true&connection_limit=5&pool_timeout=30&connect_timeout=30"
```
⚠️ **Nota:** Plan gratis se suspende después de 15 minutos de inactividad

#### **Railway.app**
```bash
DATABASE_URL="postgresql://postgres:pass@containers-us-west-xxx.railway.app:1234/railway?connection_limit=10&pool_timeout=30"
```
✅ **500 horas/mes gratis**

#### **Supabase**
```bash
DATABASE_URL="postgresql://postgres:pass@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=10&pool_timeout=30"
```
✅ **2 proyectos gratis, pool limit: 10**

#### **Neon.tech**
```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&connection_limit=10&pool_timeout=30"
```
⚠️ **Autosuspend después de 5 minutos** (keep-alive previene esto)

#### **AWS RDS** (Producción profesional)
```bash
DATABASE_URL="postgresql://postgres:pass@chicoj.xxxxx.us-east-1.rds.amazonaws.com:5432/restaurante_db?connection_limit=20&pool_timeout=60"
```
✅ **No se suspende, alta disponibilidad**

#### **Digital Ocean Managed Database**
```bash
DATABASE_URL="postgresql://doadmin:pass@db-postgresql-nyc3-xxxxx.ondigitalocean.com:25060/defaultdb?sslmode=require&connection_limit=15"
```
✅ **$15/mes, muy estable**

---

## 📊 Parámetros de Conexión Explicados

| Parámetro | Valor Recomendado | Descripción |
|-----------|------------------|-------------|
| `connection_limit` | 5-20 | Número máximo de conexiones simultáneas |
| `pool_timeout` | 30-60 | Segundos antes de timeout en el pool |
| `connect_timeout` | 30 | Segundos para establecer conexión |
| `socket_timeout` | 30 | Segundos de timeout en el socket |
| `sslmode` | `require` | Forzar SSL (depende del proveedor) |
| `pgbouncer` | `true` | Si tu proveedor usa PgBouncer |
| `pool_mode` | `transaction` | Modo de pool optimizado |

---

## 🛠️ Cómo Actualizar tu DATABASE_URL

### Opción 1: Variables de Entorno (Recomendado)

**En tu servidor/servicio:**
```bash
# Editar .env en producción
DATABASE_URL="postgresql://tu_usuario:tu_contraseña@tu_host:5432/restaurante_db?connection_limit=10&pool_timeout=30&connect_timeout=30"
```

### Opción 2: Panel del Proveedor

1. Ve a tu servicio de base de datos (Render, Railway, etc.)
2. Copia la URL de conexión
3. **Agregar los parámetros al final:**
   ```
   ?connection_limit=10&pool_timeout=30&connect_timeout=30&socket_timeout=30
   ```
4. Actualizar en las variables de entorno de tu aplicación
5. **Reiniciar el servicio**

---

## 🔍 Verificar que Funciona

### 1. Ver logs del keep-alive:
```bash
docker logs chicoj-backend | grep KEEPALIVE
```

Deberías ver:
```
[DB KEEPALIVE] Sistema de keep-alive iniciado (cada 15s)
[DB KEEPALIVE] Ping exitoso #20 - Conexión activa
[DB KEEPALIVE] Ping exitoso #40 - Conexión activa
```

### 2. Endpoint de Health Check:
```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "database": {
    "status": "healthy",
    "connected": true,
    "keepAliveCount": 45
  }
}
```

---

## ⚠️ Servicios Gratuitos - Limitaciones

| Servicio | Suspensión | Solución |
|----------|-----------|----------|
| **Render (Free)** | 15 min inactividad | ✅ Keep-alive previene |
| **Neon (Free)** | 5 min inactividad | ✅ Keep-alive previene |
| **Railway (Free)** | No se suspende | ✅ Sin problemas |
| **Supabase (Free)** | No se suspende | ✅ Sin problemas |
| **Heroku (Free)** | Ya no existe plan gratis | ❌ No disponible |

---

## 🚀 Implementación del Keep-Alive

El sistema ahora incluye:

```javascript
✅ Ping cada 15 segundos
✅ Reconexión automática si falla
✅ Manejo de errores no capturados
✅ Logs informativos cada 5 minutos
✅ Compatible con todos los proveedores
```

**No necesitas hacer nada adicional**, el keep-alive se inicia automáticamente al arrancar el backend.

---

## 📈 Monitoreo en Producción

### Ver estado de la conexión:
```bash
# Ver logs en tiempo real
docker logs -f chicoj-backend

# Filtrar solo DB
docker logs chicoj-backend | grep "\[DB"

# Ver keep-alive
docker logs chicoj-backend | grep "KEEPALIVE"
```

### Métricas importantes:
- ✅ `keepAliveCount`: Número de pings exitosos
- ✅ `reconnectAttempts`: Intentos de reconexión (debe ser 0)
- ✅ `isConnected`: Estado de conexión

---

## 🔧 Troubleshooting

### Problema: Base de datos sigue desconectándose

**Solución 1:** Verificar los parámetros en DATABASE_URL
```bash
echo $DATABASE_URL
# Debe incluir: ?connection_limit=10&pool_timeout=30...
```

**Solución 2:** Reducir el intervalo de keep-alive
En `database.js`, cambiar de 15000 a 10000 (10 segundos):
```javascript
}, 10000); // 10 segundos
```

**Solución 3:** Aumentar connection_limit
```bash
# Si tu plan lo permite
DATABASE_URL="...?connection_limit=20&..."
```

**Solución 4:** Cambiar de proveedor
- **Render Free → Railway** (no se suspende)
- **Neon → Supabase** (más estable)
- **Cualquiera → AWS RDS** (profesional, $)

---

### Problema: "Connection pool timeout"

**Solución:** Aumentar `pool_timeout`
```bash
DATABASE_URL="...?pool_timeout=60&..."
```

---

### Problema: "Too many connections"

**Solución:** Reducir `connection_limit`
```bash
DATABASE_URL="...?connection_limit=5&..."
```

---

## 💡 Mejores Prácticas

1. ✅ **Usar keep-alive** (ya implementado)
2. ✅ **Configurar parámetros de conexión** en DATABASE_URL
3. ✅ **Monitorear logs** regularmente
4. ✅ **Usar plan pago** si el tráfico es alto
5. ✅ **Hacer backup** de la base de datos
6. ✅ **Probar reconexiones** antes de producción

---

## 📚 Recursos Adicionales

- [Prisma Connection Pool](https://www.prisma.io/docs/concepts/components/prisma-client/connection-pool)
- [PostgreSQL Connection Parameters](https://www.postgresql.org/docs/current/libpq-connect.html)
- [Render PostgreSQL Docs](https://render.com/docs/databases)
- [Railway PostgreSQL Docs](https://docs.railway.app/databases/postgresql)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

---

## 📞 Soporte

Si después de aplicar estas configuraciones el problema persiste:

1. Verificar logs completos: `docker logs chicoj-backend > logs.txt`
2. Revisar el plan de tu proveedor de base de datos
3. Considerar migrar a un servicio más estable
4. Contactar soporte del proveedor

---

**¡La configuración actual debería prevenir el 99% de las desconexiones automáticas!** 🎉

