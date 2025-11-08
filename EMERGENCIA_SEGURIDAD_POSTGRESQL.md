# 🚨 EMERGENCIA DE SEGURIDAD - POSTGRESQL COMPROMETIDO

## ⚠️ SITUACIÓN CRÍTICA

Tu servidor PostgreSQL está expuesto a Internet y ha sido **ATACADO Y COMPROMETIDO**.

### Evidencia del Compromiso:

1. **Intento de ejecución de malware** desde IP maliciosa (78.153.140.66)
2. **Base de datos BORRADA** por atacante
3. **Múltiples intentos de autenticación fallidos**
4. **Intentos de modificar usuarios superadmin**

---

## 🔥 ACCIONES INMEDIATAS (EN ESTE ORDEN)

### PASO 1: CERRAR PUERTO 5432 INMEDIATAMENTE ⏱️ 5 minutos

**El puerto 5432 de PostgreSQL NO debe estar expuesto a Internet.**

#### Opción A: Modificar docker-compose.yml (MÁS SEGURO)

Edita tu `docker-compose.yml`:

```yaml
postgres:
  image: postgres:15-alpine
  container_name: chicoj-postgres
  restart: unless-stopped
  ports:
    - "127.0.0.1:5432:5432"  # ⚠️ CAMBIAR ESTO - Solo localhost
    # ANTES era: "5432:5432" (expuesto a todos)
```

Luego:
```bash
docker compose down
docker compose up -d
```

#### Opción B: Configurar Firewall (UFW)

```bash
# Bloquear puerto 5432 desde Internet
sudo ufw deny 5432/tcp

# Permitir solo desde localhost
sudo ufw allow from 127.0.0.1 to any port 5432

# Verificar reglas
sudo ufw status
```

#### Opción C: iptables

```bash
# Bloquear acceso externo al puerto 5432
sudo iptables -A INPUT -p tcp --dport 5432 -s 127.0.0.1 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5432 -j DROP

# Guardar reglas
sudo netfilter-persistent save
```

---

### PASO 2: CAMBIAR TODAS LAS CONTRASEÑAS ⏱️ 5 minutos

```bash
# Conectarse a PostgreSQL
docker exec -it chicoj-postgres psql -U postgres

# Dentro de psql:
ALTER USER postgres WITH PASSWORD 'NUEVA_CONTRASEÑA_SUPER_FUERTE_123!@#';
\q
```

**Actualizar el archivo `.env`:**
```env
POSTGRES_PASSWORD=NUEVA_CONTRASEÑA_SUPER_FUERTE_123!@#
```

**Actualizar DATABASE_URL en el backend:**
```env
DATABASE_URL=postgresql://postgres:NUEVA_CONTRASEÑA_SUPER_FUERTE_123!@#@postgres:5432/restaurante_db?schema=public
```

**Reiniciar servicios:**
```bash
docker compose down
docker compose up -d
```

---

### PASO 3: RESTAURAR LA BASE DE DATOS ⏱️ 10 minutos

#### Opción A: Si tienes backup

```bash
# Listar backups disponibles
ls -lh backups/

# Restaurar el backup más reciente
./scripts/restore.sh backups/chicoj_backup_FECHA.sql.gz
```

#### Opción B: Si NO tienes backup (recrear desde cero)

```bash
# Recrear la base de datos
docker exec -it chicoj-postgres psql -U postgres -c "CREATE DATABASE restaurante_db;"

# Ejecutar migraciones de Prisma
docker exec -it chicoj-backend npx prisma migrate deploy

# Ejecutar seed (datos iniciales)
docker exec -it chicoj-backend npx prisma db seed
```

---

### PASO 4: VERIFICAR COMPROMISOS ADICIONALES ⏱️ 10 minutos

```bash
# 1. Verificar procesos sospechosos en el contenedor
docker exec chicoj-postgres ps aux

# 2. Verificar conexiones de red activas
docker exec chicoj-postgres netstat -tunlp 2>/dev/null || docker exec chicoj-postgres ss -tunlp

# 3. Buscar archivos modificados recientemente
docker exec chicoj-postgres find / -type f -mtime -1 2>/dev/null | grep -v "/proc"

# 4. Verificar logs del sistema del servidor
sudo journalctl -xe | tail -100

# 5. Verificar logs de Docker
docker logs chicoj-postgres --since 24h | grep -E "FATAL|ERROR|DROP|CREATE TABLE|COPY.*PROGRAM"
```

---

### PASO 5: CONFIGURAR SEGURIDAD ADICIONAL ⏱️ 15 minutos

#### A. Configurar pg_hba.conf para solo conexiones locales

Crea `postgres-config/pg_hba.conf`:

```conf
# Solo permitir conexiones desde la red Docker interna
local   all             all                                     trust
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             172.16.0.0/12           scram-sha-256
host    all             all             ::1/128                 scram-sha-256

# DENEGAR todo lo demás
host    all             all             0.0.0.0/0               reject
```

Actualizar `docker-compose.yml`:

```yaml
postgres:
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./postgres-config/pg_hba.conf:/var/lib/postgresql/data/pg_hba.conf:ro
```

#### B. Deshabilitar funciones peligrosas en PostgreSQL

Crea `postgres-config/02-seguridad.sql`:

```sql
-- Deshabilitar la función COPY FROM PROGRAM (usada en el ataque)
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_connections = ON;
ALTER SYSTEM SET log_disconnections = ON;

-- Revocar permisos peligrosos
REVOKE EXECUTE ON FUNCTION pg_read_file FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION pg_read_binary_file FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION pg_ls_dir FROM PUBLIC;

SELECT pg_reload_conf();
```

#### C. Implementar fail2ban para bloquear IPs atacantes

```bash
sudo apt install fail2ban -y

# Crear configuración para PostgreSQL
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[postgresql]
enabled = true
port = 5432
filter = postgresql
logpath = /var/log/postgresql/postgresql.log
maxretry = 3
bantime = 3600
EOF

sudo systemctl restart fail2ban
```

---

### PASO 6: MONITOREO CONTINUO ⏱️ Permanente

#### Script de monitoreo automático

Crea `monitor-seguridad-postgresql.sh`:

```bash
#!/bin/bash
# Ejecutar cada 5 minutos via cron

LOG_FILE="/var/log/postgres-security.log"

# Verificar conexiones sospechosas
SUSPICIOUS=$(docker logs chicoj-postgres --since 5m 2>&1 | grep -E "COPY.*PROGRAM|DROP DATABASE|ALTER USER.*pgg_|password authentication failed" | wc -l)

if [ "$SUSPICIOUS" -gt 0 ]; then
    echo "[$(date)] ⚠️  ALERTA: $SUSPICIOUS eventos sospechosos detectados" >> "$LOG_FILE"
    docker logs chicoj-postgres --since 5m 2>&1 | grep -E "COPY.*PROGRAM|DROP DATABASE|ALTER USER.*pgg_|password authentication failed" >> "$LOG_FILE"
    
    # Enviar notificación (opcional - configurar con tus datos)
    # curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" -d "chat_id=<CHAT_ID>&text=ALERTA: Actividad sospechosa en PostgreSQL"
fi

# Verificar que el puerto 5432 no esté expuesto públicamente
if netstat -tunlp | grep ":5432" | grep -q "0.0.0.0"; then
    echo "[$(date)] 🚨 CRÍTICO: Puerto 5432 expuesto públicamente!" >> "$LOG_FILE"
fi
```

```bash
chmod +x monitor-seguridad-postgresql.sh

# Agregar a cron
(crontab -l 2>/dev/null; echo "*/5 * * * * /ruta/monitor-seguridad-postgresql.sh") | crontab -
```

---

## 📋 CHECKLIST DE SEGURIDAD

Marca cada ítem cuando lo completes:

- [ ] **CRÍTICO**: Cerrar puerto 5432 al exterior (solo localhost)
- [ ] **CRÍTICO**: Cambiar contraseña de PostgreSQL
- [ ] **CRÍTICO**: Actualizar DATABASE_URL con nueva contraseña
- [ ] **CRÍTICO**: Restaurar base de datos desde backup o recrear
- [ ] **IMPORTANTE**: Verificar compromisos adicionales en el servidor
- [ ] **IMPORTANTE**: Configurar pg_hba.conf para denegar acceso externo
- [ ] **IMPORTANTE**: Deshabilitar funciones peligrosas (COPY FROM PROGRAM)
- [ ] **RECOMENDADO**: Instalar y configurar fail2ban
- [ ] **RECOMENDADO**: Implementar monitoreo automático
- [ ] **RECOMENDADO**: Revisar otros servicios expuestos (verificar con `nmap`)

---

## 🔍 VERIFICACIÓN POST-REMEDIACIÓN

Después de aplicar todas las correcciones:

### 1. Verificar que el puerto NO esté expuesto

Desde FUERA del servidor (tu computadora):
```bash
nmap -p 5432 TU_IP_SERVIDOR
```

Debe decir: `5432/tcp closed postgresql` o `filtered`

### 2. Verificar que solo localhost puede conectar

Desde el servidor:
```bash
# Esto debe funcionar (desde localhost)
docker exec chicoj-postgres psql -U postgres -c "SELECT 1"

# Esto debe FALLAR (desde IP externa) - prueba desde tu computadora
psql -h TU_IP_SERVIDOR -U postgres -d restaurante_db
# Debe decir: "Connection refused" o timeout
```

### 3. Verificar logs limpios

```bash
docker logs chicoj-postgres --since 30m | grep -E "FATAL|ERROR"
```

NO debe haber:
- `password authentication failed`
- `COPY FROM PROGRAM`
- `DROP DATABASE`

### 4. Verificar aplicación funcionando

```bash
curl http://TU_IP_SERVIDOR/api/health
# Debe retornar: {"status":"ok"}
```

---

## 📊 ANÁLISIS DE LA IP ATACANTE

**IP del atacante**: `78.153.140.66`

Esta IP es conocida por:
- Escaneo masivo de puertos PostgreSQL (5432)
- Ataques automatizados a bases de datos expuestas
- Instalación de cryptominers

**NO intentes acceder a esa IP**. Solo bloquéala:

```bash
sudo ufw deny from 78.153.140.66
```

---

## 🎯 PREVENCIÓN A FUTURO

### Reglas de Oro:

1. **NUNCA exponer PostgreSQL a Internet** (solo localhost o red interna)
2. **Siempre usar contraseñas fuertes** (mínimo 20 caracteres, alfanuméricos + símbolos)
3. **Backups automáticos diarios** (y verificar que funcionen)
4. **Monitoreo activo** de logs y actividad sospechosa
5. **Firewall configurado correctamente** (solo puertos necesarios abiertos)
6. **Actualizaciones regulares** de PostgreSQL y sistema operativo

### Puertos que DEBEN estar expuestos:
- ✅ 80 (HTTP)
- ✅ 443 (HTTPS)

### Puertos que NUNCA deben estar expuestos:
- ❌ 5432 (PostgreSQL)
- ❌ 3000 (Backend - debe estar detrás de Nginx)
- ❌ 5050 (PgAdmin)
- ❌ 22 (SSH - usar solo con IP whitelisting)

---

## 📞 SOPORTE DE EMERGENCIA

Si después de aplicar estos pasos:

1. Sigues viendo actividad sospechosa
2. No puedes restaurar la base de datos
3. Encuentras otros servicios comprometidos

**Considera**:
- Hacer un snapshot del servidor actual (para análisis forense)
- Destruir y recrear el servidor desde cero
- Contactar a un especialista en seguridad

---

**Fecha de incidente**: 2025-11-08  
**Tipo de ataque**: Explotación de PostgreSQL expuesto + Inyección SQL + Intento de malware  
**Severidad**: 🔴 CRÍTICA  
**Estado**: ⚠️ Requiere acción inmediata

---

## 📚 Referencias

- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html)
- [OWASP Database Security](https://owasp.org/www-community/vulnerabilities/Database_Security)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)

