# 📤 Archivos para Enviar al Desarrollador de Producción

## 🎯 Resumen del Problema

El sistema está generando **Error 500** al intentar agregar platillos porque falta la columna `categoria` en la base de datos de producción.

---

## 📦 Archivos a Enviar

Envía estos archivos al desarrollador que maneja producción:

### 1. **fix-categoria-produccion.sql** ⭐ (Más importante)
Script SQL que debe ejecutar en producción.

### 2. **INSTRUCCIONES_PARA_PRODUCCION.md**
Guía completa paso a paso con todos los comandos.

### 3. Archivos del Backend Actualizados (Opcional pero recomendado):
```
Chicoj_System_R-T/backend/prisma/schema.prisma
Chicoj_System_R-T/backend/prisma/seed.js
Chicoj_System_R-T/backend/prisma/migrations/20251103_schema_completo/migration.sql
```

---

## ⚡ Comando Rápido para el Desarrollador

Si usa Docker con PostgreSQL:

```bash
# 1. Ejecutar el SQL
docker exec -i <nombre-contenedor-postgres> psql -U postgres -d restaurante_db < fix-categoria-produccion.sql

# 2. Reiniciar backend
docker restart <nombre-contenedor-backend>
```

**Reemplazar**:
- `<nombre-contenedor-postgres>` con el nombre real del contenedor de PostgreSQL
- `<nombre-contenedor-backend>` con el nombre real del contenedor del backend

---

## 🔍 Cómo Encontrar los Nombres de los Contenedores

```bash
# Ver todos los contenedores corriendo
docker ps

# Buscar el de PostgreSQL (aparecerá algo como: postgres, chicoj-postgres, db, etc.)
# Buscar el de Backend (aparecerá algo como: backend, chicoj-backend, api, etc.)
```

---

## ✅ Verificación Rápida

Después de aplicar el fix, el desarrollador puede verificar que funcionó:

```bash
# Ver que la columna existe
docker exec <nombre-contenedor-postgres> psql -U postgres -d restaurante_db -c "\d platillos" | grep categoria

# Debe mostrar algo como:
# categoria | character varying(100) |
```

---

## 📋 Checklist para el Desarrollador

- [ ] Hacer backup de la base de datos (opcional pero recomendado)
- [ ] Ejecutar `fix-categoria-produccion.sql`
- [ ] Reiniciar contenedor del backend
- [ ] Verificar que la columna `categoria` existe
- [ ] Probar agregar un platillo desde el frontend
- [ ] Confirmar que no hay error 500

---

## 🆘 Si Tiene Problemas

Pedirle que envíe:

1. **Logs del backend** (últimas 50 líneas):
   ```bash
   docker logs <nombre-contenedor-backend> --tail 50
   ```

2. **Estructura de la tabla platillos**:
   ```bash
   docker exec <nombre-contenedor-postgres> psql -U postgres -d restaurante_db -c "\d platillos"
   ```

3. **Captura de pantalla** del error en el navegador (F12 > Console)

---

## 📞 Tiempo Estimado

- **Ejecución**: 2-3 minutos
- **Downtime**: ~30 segundos (solo al reiniciar backend)
- **Riesgo**: Muy bajo (solo agrega una columna nueva)

---

## 💡 Alternativa si No Tiene Acceso a Docker

Si el desarrollador tiene acceso directo a PostgreSQL (sin Docker):

```bash
# Ejecutar el SQL directamente
psql -U postgres -d restaurante_db -f fix-categoria-produccion.sql

# Reiniciar el servicio del backend
sudo systemctl restart nombre-servicio-backend
# o
pm2 restart nombre-proceso-backend
```

---

## 📝 Plantilla de Mensaje para Enviar

```
Hola [Nombre],

Necesito que apliques un fix urgente en producción. El sistema está generando 
Error 500 al intentar agregar platillos porque falta una columna en la base de datos.

ARCHIVOS ADJUNTOS:
- fix-categoria-produccion.sql (ejecutar este)
- INSTRUCCIONES_PARA_PRODUCCION.md (guía completa)

COMANDO RÁPIDO:
docker exec -i <contenedor-postgres> psql -U postgres -d restaurante_db < fix-categoria-produccion.sql
docker restart <contenedor-backend>

TIEMPO: 2-3 minutos
DOWNTIME: ~30 segundos
RIESGO: Muy bajo (solo agrega columna nueva)

Por favor confirma cuando lo hayas aplicado y si hubo algún problema.

Gracias!
```

---

## 🎯 Resultado Esperado

Después de aplicar el fix:
- ✅ Los usuarios podrán agregar platillos sin error 500
- ✅ Los platillos tendrán categorías (Desayunos, Almuerzos, Cafe, Postres, etc.)
- ✅ El sistema seguirá funcionando normalmente

---

**IMPORTANTE**: Este fix es **no destructivo**, solo agrega una columna nueva sin afectar datos existentes.

