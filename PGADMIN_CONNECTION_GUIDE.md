# 🔌 Guía: Conectar PgAdmin a PostgreSQL

## ❌ Error: "connection timeout expired"

Este error ocurre porque PgAdmin no puede conectarse a PostgreSQL. Las causas más comunes:

---

## ✅ SOLUCIÓN (Configuración Correcta)

Cuando configures el servidor en PgAdmin, usa estos valores:

### **1. Pestaña "General":**
- **Name**: `Chicoj Database` (o el que prefieras)
- **Server Group**: `Servers` (deja por defecto)
- **Comments**: (opcional) Descripción

### **2. Pestaña "Connection":**
**⚠️ AQUÍ ESTÁ LA CLAVE:**

| Campo | Valor CORRECTO |
|-------|----------------|
| **Host name/address** | `chicoj-postgres` ✅ |
| **Port** | `5432` |
| **Maintenance database** | `restaurante_db` |
| **Username** | `postgres` |
| **Password** | `[Tu POSTGRES_PASSWORD del archivo .env]` |
| ☑️ **Save password** | Marcar si quieres |

**🚨 IMPORTANTE:**
- **NO uses**: `localhost` ❌
- **NO uses**: `127.0.0.1` ❌
- **NO uses**: `165.227.103.238` ❌
- **USA**: `chicoj-postgres` ✅ (nombre del contenedor Docker)

### **3. Guardar:**
Click en **"Save"**

---

## 🎯 ¿Por Qué `chicoj-postgres`?

Mira tu `docker-compose.yml`:

```yaml
postgres:
  image: postgres:15-alpine
  container_name: chicoj-postgres  ← ESTE ES EL NOMBRE
  ...
```

PgAdmin y PostgreSQL están en la **misma red Docker** (`chicoj-network`), por lo que se comunican por el **nombre del contenedor**, NO por `localhost`.

---

## 🔍 Verificar la Conexión

### **Opción 1: Probar desde PgAdmin**

Una vez guardada la configuración:
1. Expande "Servers" en el panel izquierdo
2. Expande "Chicoj Database"
3. Si ves las bases de datos (`restaurante_db`), **¡funcionó!** ✅

### **Opción 2: Probar desde Terminal**

```bash
# Desde el servidor
cd /opt/chicoj

# Probar conexión desde terminal
docker-compose exec postgres psql -U postgres -d restaurante_db -c "SELECT version();"
```

Si esto funciona, PostgreSQL está bien y el problema es solo la configuración de PgAdmin.

---

## 🛠️ Troubleshooting Adicional

### **Problema 1: PgAdmin no encuentra el contenedor**

**Verificar que ambos están corriendo:**

```bash
cd /opt/chicoj
docker-compose ps
```

Deberías ver:
```
chicoj-postgres    Up
chicoj-pgadmin     Up
```

**Si no están corriendo:**

```bash
# Iniciar todo
docker-compose --profile debug up -d

# O solo postgres y pgadmin
docker-compose up -d postgres
docker-compose --profile debug up -d pgadmin

# Esperar unos segundos
sleep 10

# Verificar
docker-compose ps
```

### **Problema 2: Red Docker**

**Verificar que están en la misma red:**

```bash
# Ver la red Docker
docker network inspect chicoj-system-r-t_chicoj-network
```

Deberías ver ambos contenedores listados:
- `chicoj-postgres`
- `chicoj-pgadmin`

### **Problema 3: PostgreSQL no acepta conexiones**

**Verificar logs de PostgreSQL:**

```bash
docker-compose logs postgres
```

Si ves errores, puede haber un problema con la configuración.

### **Problema 4: Password Incorrecto**

**Verificar el password en .env:**

```bash
# En el servidor
cat .env | grep POSTGRES_PASSWORD
```

Asegúrate de usar **exactamente** ese password en PgAdmin.

---

## 📋 Checklist Completo

- [ ] PgAdmin está corriendo: `docker-compose ps | grep pgadmin`
- [ ] PostgreSQL está corriendo: `docker-compose ps | grep postgres`
- [ ] Password en PgAdmin coincide con `.env`
- [ ] Host name en PgAdmin es: `chicoj-postgres` (NO localhost)
- [ ] Port en PgAdmin es: `5432`
- [ ] Database en PgAdmin es: `restaurante_db`
- [ ] Username en PgAdmin es: `postgres`

---

## 🎉 Configuración Completa

Una vez conectado correctamente, podrás:

1. **Ver todas las tablas:**
   - Expandir: `Servers` → `Chicoj Database` → `Databases` → `restaurante_db` → `Schemas` → `public` → `Tables`

2. **Ver datos:**
   - Click derecho en cualquier tabla → "View/Edit Data" → "First 100 Rows"

3. **Editar datos:**
   - Click derecho en cualquier tabla → "View/Edit Data"
   - Editar directamente en la tabla
   - Click en "Save" para guardar

4. **Ejecutar queries:**
   - Click derecho en la base de datos → "Query Tool"
   - Escribir SQL
   - Click en "Execute" (F5)

---

## 💡 Ejemplos de Uso

### Ver todos los usuarios

```sql
SELECT * FROM usuarios;
```

### Ver usuario específico

```sql
SELECT * FROM usuarios WHERE email = 'admin@chicoj.com';
```

### Ver platillos

```sql
SELECT * FROM platillos;
```

### Ver comandas recientes

```sql
SELECT * FROM comandas 
ORDER BY fecha_creacion DESC 
LIMIT 10;
```

### Actualizar un registro

```sql
UPDATE usuarios 
SET password = 'nuevo_password_hash' 
WHERE id = 1;
```

---

## 🔐 Seguridad

**Para producción:**
- NO expongas PgAdmin al público
- Usa Cloudflare Access (como hablamos)
- O solo accede desde IPs específicas
- O usa SSH tunnel

---

## 📞 ¿Sigue sin funcionar?

Mándame el resultado de estos comandos:

```bash
# 1. Estado de contenedores
docker-compose ps

# 2. Logs de postgres
docker-compose logs postgres --tail=20

# 3. Logs de pgadmin
docker-compose logs pgadmin --tail=20

# 4. Verificar red
docker network inspect chicoj-system-r-t_chicoj-network | grep -A 5 "Containers"
```

Con eso podré ayudarte a identificar el problema específico.

---

**¡Sigue estos pasos y deberías conectarte sin problemas!** 🚀


