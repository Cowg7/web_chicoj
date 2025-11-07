# 📤 RESUMEN: ENVIAR BASE DE DATOS A PRODUCCIÓN

## 🎯 OBJETIVO

Hacer una copia completa de tu base de datos local y enviarla al equipo de producción para que la restauren en el servidor.

---

## ⚡ PROCESO RÁPIDO (3 pasos)

### **PASO 1: Hacer backup de tu BD local**

**Windows:**
```powershell
.\hacer-backup-bd.ps1
```

**Linux/Mac:**
```bash
chmod +x hacer-backup-bd.sh
./hacer-backup-bd.sh
```

**Esto crea:** `backups/backup_restaurante_db_XXXXXXXX.sql`

---

### **PASO 2: Comprimir (opcional pero recomendado)**

El script te preguntará si quieres comprimir. Di que **SÍ** para reducir el tamaño.

**Archivo final:** `backups/backup_restaurante_db_XXXXXXXX.zip` (o `.tar.gz`)

---

### **PASO 3: Enviar al equipo de producción**

Envíales por email, Slack, o cualquier medio:

1. **El archivo de backup** (comprimido)
2. **El archivo:** `RESTAURAR_BACKUP_EN_PRODUCCION.md`
3. **Mensaje:**

```
Hola,

Adjunto el backup actualizado de la base de datos con:
- Roles nuevos: Bebidas, Coffee, Tour
- Platillos actualizados (90+)
- Rutas de usuarios con endpoints de roles

Por favor, restauren este backup en producción siguiendo
las instrucciones del archivo RESTAURAR_BACKUP_EN_PRODUCCION.md

El proceso toma ~10 minutos y requiere detener el backend 
temporalmente.

¡Gracias!
```

---

## 📋 QUÉ INCLUYE EL BACKUP

✅ **Estructura completa:**
- Todas las tablas
- Todas las relaciones
- Todos los índices

✅ **Datos actualizados:**
- Roles: Administrador, Mesero, Cocina, Cajero, Bebidas, Coffee, Tour, Gerente
- ~90 platillos organizados por categorías
- Usuarios existentes
- Configuraciones

✅ **Correcciones aplicadas:**
- Columna `categoria` en tabla `platillos`
- Rutas de roles en el backend
- Todos los fixes aplicados

---

## 📊 TAMAÑO APROXIMADO

- **Sin comprimir:** 50-200 KB
- **Comprimido:** 10-50 KB

(Depende de cuántos datos tengas)

---

## ⚠️ IMPORTANTE PARA PRODUCCIÓN

El equipo de producción debe:

1. **Hacer backup de la BD actual** (por seguridad)
2. **Detener el backend** (evitar conexiones)
3. **Restaurar el backup**
4. **Reiniciar el backend**
5. **Verificar que todo funcione**

**Downtime estimado:** 5-10 minutos

---

## 🔒 SEGURIDAD

✅ El backup NO incluye:
- Variables de entorno
- Contraseñas en texto plano (están hasheadas)
- Configuraciones del servidor

✅ El backup SÍ incluye:
- Estructura de la BD
- Todos los datos
- Usuarios con passwords hasheados

**Recomendación:** Envíalo por un canal seguro (no email público).

---

## 📁 ARCHIVOS CREADOS PARA TI

1. **hacer-backup-bd.ps1** - Script para Windows
2. **hacer-backup-bd.sh** - Script para Linux/Mac
3. **RESTAURAR_BACKUP_EN_PRODUCCION.md** - Instrucciones detalladas
4. **ENVIAR_BD_A_PRODUCCION_RESUMEN.md** - Este archivo

---

## 🎬 COMANDOS RÁPIDOS

### **Hacer backup (Windows):**
```powershell
.\hacer-backup-bd.ps1
```

### **Hacer backup (Linux/Mac):**
```bash
chmod +x hacer-backup-bd.sh
./hacer-backup-bd.sh
```

### **Comando manual (si prefieres):**
```bash
# Crear directorio
mkdir -p backups

# Hacer backup
docker exec chicoj-postgres pg_dump -U postgres restaurante_db > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Comprimir
tar -czf backups/backup_$(date +%Y%m%d_%H%M%S).tar.gz -C backups backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## ✅ DESPUÉS DE QUE RESTAUREN EN PRODUCCIÓN

Verifica que funcione:

1. Ve a https://coopechicoj.com
2. Inicia sesión como admin
3. Ve a "Gestionar Usuarios"
4. Intenta crear un nuevo rol
5. Verifica que aparezcan: Bebidas, Coffee, Tour

**Si funciona:** ✅ ¡Todo listo!

**Si sigue error 404:** El equipo de producción también necesita actualizar el código del backend (ver `URGENTE_PRODUCCION_ERROR_404_ROLES.md`)

---

## 🆘 ALTERNATIVA: ACTUALIZAR SOLO LOS ROLES

Si solo quieres enviarles los roles nuevos (sin toda la BD):

```sql
-- Archivo: roles-nuevos.sql
INSERT INTO roles (nombre_rol, descripcion) VALUES 
  ('Bebidas', 'KDS de bebidas (bar y bebidas frías)'),
  ('Coffee', 'KDS de coffee shop (café y postres)'),
  ('Tour', 'Gestión de tours y grupos turísticos')
ON CONFLICT (nombre_rol) DO NOTHING;
```

**Ejecutar en producción:**
```bash
docker exec chicoj-postgres psql -U postgres -d restaurante_db -c "INSERT INTO roles (nombre_rol, descripcion) VALUES ('Bebidas', 'KDS de bebidas'), ('Coffee', 'KDS de coffee shop'), ('Tour', 'Gestión de tours') ON CONFLICT (nombre_rol) DO NOTHING;"
```

---

## 📞 PLANTILLA DE EMAIL

```
Asunto: Backup de BD para restaurar en producción

Hola [Desarrollador],

Te envío el backup actualizado de la base de datos para que lo 
restaures en producción.

ARCHIVO ADJUNTO:
- backup_restaurante_db_XXXXXXXX.zip
- RESTAURAR_BACKUP_EN_PRODUCCION.md (instrucciones)

INCLUYE:
✅ Roles nuevos: Bebidas, Coffee, Tour
✅ 90+ platillos organizados por categorías
✅ Corrección de columna 'categoria'
✅ Todos los datos actualizados

PROCESO:
1. Hacer backup de la BD actual de producción
2. Detener backend
3. Restaurar este backup
4. Reiniciar backend
5. Verificar

TIEMPO: ~10 minutos
DOWNTIME: ~5 minutos

Las instrucciones detalladas están en el archivo adjunto.

¡Gracias!
```

---

## 🎯 TL;DR

```bash
# 1 comando para hacer el backup:
.\hacer-backup-bd.ps1  # Windows
./hacer-backup-bd.sh   # Linux/Mac

# Luego envía:
• El archivo .zip generado
• RESTAURAR_BACKUP_EN_PRODUCCION.md
```

---

**¿Necesitas ayuda? Revisa los otros archivos .md o contáctanos.**

