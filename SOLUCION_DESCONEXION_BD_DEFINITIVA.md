# 🔧 Solución Definitiva para Desconexiones de PostgreSQL

## 📋 Resumen del Problema

Tu servidor estaba experimentando reinicios constantes de PostgreSQL debido a:

### Causa Raíz Identificada

El error `terminating connection due to administrator command` (código E57P01) **NO es un problema de keepalive**, sino que **el contenedor de PostgreSQL se estaba reiniciando**.

#### ¿Por qué se reiniciaba?

1. **Healthcheck muy agresivo**: 
   - Verificaba cada 10 segundos
   - Solo 5 intentos fallidos = reinicio del contenedor
   - Timeout de 5 segundos muy corto

2. **Sin límites de recursos**:
   - PostgreSQL podía consumir toda la memoria disponible
   - OOM (Out of Memory) killer mataba el proceso

3. **Sin configuraciones de PostgreSQL**:
   - No había timeouts configurados
   - No había TCP keepalives en el lado del servidor

## ✅ Soluciones Implementadas

### 1. Healthcheck Más Tolerante

**Antes:**
```yaml
healthcheck:
  interval: 10s
  timeout: 5s
  retries: 5
```

**Después:**
```yaml
healthcheck:
  interval: 30s          # Verifica cada 30s (3x más tiempo)
  timeout: 10s           # 10s para responder (2x más tiempo)
  retries: 10            # 10 intentos antes de reiniciar (2x más)
  start_period: 60s      # 60s de gracia al iniciar
```

**Resultado**: El contenedor ahora tolera hasta **5 minutos** de problemas antes de reiniciar (30s × 10 retries).

### 2. Límites de Recursos

```yaml
deploy:
  resources:
    limits:
      memory: 512M      # PostgreSQL no puede usar más de 512MB
    reservations:
      memory: 256M      # Docker garantiza mínimo 256MB
```

**Resultado**: Previene OOM killer y reinicios por falta de memoria.

### 3. Configuraciones de PostgreSQL

Se creó `postgres-config/01-configuracion-produccion.sql` con:

```sql
-- Prevenir timeouts de queries largas
statement_timeout = 300000 (5 minutos)

-- Desactivar timeout de transacciones inactivas
idle_in_transaction_session_timeout = 0

-- TCP keepalives para mantener conexiones vivas
tcp_keepalives_idle = 30 (segundos)
tcp_keepalives_interval = 10 (segundos)
tcp_keepalives_count = 10 (intentos)
```

**Resultado**: Las conexiones no se cierran automáticamente.

### 4. Backend Más Tolerante

**Healthcheck del backend actualizado:**
```yaml
interval: 60s          # Antes: 30s
timeout: 15s           # Antes: 10s
retries: 5             # Antes: 3
start_period: 90s      # Antes: 40s
```

**Resultado**: Menos stress en el backend durante inicios y bajo carga.

## 🚀 Cómo Aplicar las Correcciones

### Desde Windows (Local)

1. **Ejecuta el script de preparación**:
   ```powershell
   .\arreglar-base-datos.ps1
   ```

2. **Sube los archivos al servidor** (vía SCP, FTP, o Git):
   - `docker-compose.yml`
   - `postgres-config/01-configuracion-produccion.sql`
   - `arreglar-base-datos.sh`
   - `diagnosticar-base-datos.sh`

### En el Servidor (Linux/VPS)

1. **Conéctate por SSH**:
   ```bash
   ssh usuario@tu-servidor.com
   cd /ruta/proyecto
   ```

2. **Da permisos de ejecución**:
   ```bash
   chmod +x arreglar-base-datos.sh diagnosticar-base-datos.sh
   ```

3. **PRIMERO ejecuta el diagnóstico**:
   ```bash
   ./diagnosticar-base-datos.sh
   ```
   
   Esto te mostrará:
   - Estado actual de los contenedores
   - Uso de memoria
   - Logs de errores
   - Configuración actual de PostgreSQL
   - Si ha habido reinicios (OOMKilled)

4. **Aplica las correcciones**:
   ```bash
   ./arreglar-base-datos.sh
   ```

5. **Monitorea los logs**:
   ```bash
   # En una terminal
   docker logs -f chicoj-backend
   
   # En otra terminal
   docker logs -f chicoj-postgres
   ```

## 📊 Validación de la Solución

### Señales de que está funcionando:

✅ **Logs del backend**:
```
[DB KEEPALIVE] Ping exitoso #520 - Conexión activa
[DB KEEPALIVE] Ping exitoso #540 - Conexión activa
[DB KEEPALIVE] Ping exitoso #560 - Conexión activa
```

✅ **Logs de PostgreSQL**:
```
# SIN errores de "terminating connection"
# SIN "Database does not exist"
```

✅ **Estado de contenedores**:
```bash
docker ps --filter "name=chicoj"
# Todos deben mostrar "healthy" en STATUS
```

✅ **Healthcheck**:
```bash
docker inspect chicoj-postgres --format='{{json .State.Health.Status}}'
# Debe retornar: "healthy"
```

### Si sigues teniendo problemas:

1. **Verifica memoria disponible en el servidor**:
   ```bash
   free -h
   ```
   Necesitas al menos **2GB** de RAM libre para correr todo el stack.

2. **Verifica logs del sistema**:
   ```bash
   dmesg | grep -i "out of memory"
   ```
   Si hay mensajes OOM, necesitas más RAM o reducir `deploy.resources.limits`.

3. **Verifica disco**:
   ```bash
   df -h
   ```
   PostgreSQL necesita espacio para crecer.

## 🔍 Monitoreo Continuo

### Comandos útiles:

```bash
# Ver uso de recursos en tiempo real
docker stats

# Ver logs de PostgreSQL filtrando errores
docker logs chicoj-postgres | grep -E "FATAL|ERROR"

# Ver conexiones activas
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "
SELECT count(*) FROM pg_stat_activity WHERE datname = 'restaurante_db';"

# Ver configuración aplicada
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "
SHOW statement_timeout;
SHOW tcp_keepalives_idle;"
```

## 🎯 Resumen de Cambios

| Componente | Antes | Después | Mejora |
|------------|-------|---------|--------|
| PG Healthcheck Interval | 10s | 30s | 3x más tolerante |
| PG Healthcheck Retries | 5 | 10 | 2x más intentos |
| PG Memoria Límite | Sin límite | 512MB | Previene OOM |
| Backend Healthcheck | 30s | 60s | 2x menos stress |
| statement_timeout | Default (0) | 300s | Queries largas permitidas |
| tcp_keepalives | No configurado | 30s/10s/10 | Conexiones persistentes |

## ⚠️ Notas Importantes

1. **NO borra datos**: Estas correcciones NO eliminan tu base de datos actual.

2. **Downtime mínimo**: El reinicio de contenedores toma ~2 minutos.

3. **Rollback**: Si algo sale mal, puedes revertir los cambios:
   ```bash
   git checkout docker-compose.yml
   docker compose down
   docker compose up -d
   ```

4. **Backup recomendado**: Antes de aplicar, haz un backup:
   ```bash
   ./hacer-backup-bd.sh
   ```

## 📞 Soporte

Si después de aplicar estos cambios sigues experimentando problemas:

1. Ejecuta el diagnóstico: `./diagnosticar-base-datos.sh`
2. Guarda los logs: `docker logs chicoj-postgres > postgres-logs.txt`
3. Comparte los resultados para análisis adicional

---

**Fecha de creación**: $(date)  
**Versión**: 1.0  
**Estado**: ✅ Listo para producción

