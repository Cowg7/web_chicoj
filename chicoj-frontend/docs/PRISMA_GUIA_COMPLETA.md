# 🗄️ Guía Completa de Prisma - Sistema Chicoj

## 📋 Contenido

1. [Introducción](#introducción)
2. [Archivos Disponibles](#archivos-disponibles)
3. [Comandos Básicos](#comandos-básicos)
4. [Resetear Base de Datos](#resetear-base-de-datos)
5. [Aplicar Migraciones](#aplicar-migraciones)
6. [Crear Nuevas Migraciones](#crear-nuevas-migraciones)
7. [Prisma Studio](#prisma-studio)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

Prisma es el ORM (Object-Relational Mapping) que usamos en el Sistema Chicoj para:
- ✅ Gestionar la estructura de la base de datos
- ✅ Generar migraciones automáticas
- ✅ Crear un cliente type-safe para Node.js
- ✅ Visualizar datos con Prisma Studio

---

## 📂 Archivos Disponibles

### En la raíz del proyecto:

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| `script-base-datos-chicoj.sql` | Script SQL completo | Documentación / Backup |
| `reset-database.ps1` | Resetear BD completa | Primera vez / Reset total |
| `aplicar-migraciones.ps1` | Aplicar migraciones | Actualizar BD existente |
| `ejecutar-seed.ps1` | Poblar con datos | Después de crear BD |

### En `Chicoj_System_R-T/backend/prisma/`:

| Archivo | Descripción |
|---------|-------------|
| `schema.prisma` | Definición del schema |
| `seed.js` | Datos iniciales (41 platillos) |
| `migrations/` | Historial de migraciones |

---

## 🚀 Comandos Básicos

### 1. Generar Cliente Prisma

Después de modificar `schema.prisma`:

```powershell
docker exec chicoj-backend npx prisma generate
```

### 2. Ver Estado de la BD

```powershell
docker exec chicoj-backend npx prisma migrate status
```

### 3. Formatear Schema

```powershell
docker exec chicoj-backend npx prisma format
```

### 4. Validar Schema

```powershell
docker exec chicoj-backend npx prisma validate
```

---

## 🔄 Resetear Base de Datos

### Opción 1: Script PowerShell (Recomendado)

```powershell
.\reset-database.ps1
```

**¿Qué hace?**
1. Elimina TODOS los datos
2. Recrea todas las tablas
3. Ejecuta el seed automáticamente

**¿Cuándo usarlo?**
- Primera vez configurando el sistema
- Cuando necesites empezar desde cero
- Después de cambios mayores en el schema

### Opción 2: Comando Manual

```powershell
# Resetear BD y aplicar schema
docker exec chicoj-backend npx prisma db push --force-reset

# Luego ejecutar seed
docker exec chicoj-backend npm run seed
```

---

## 📦 Aplicar Migraciones

### Opción 1: Script PowerShell (Recomendado)

```powershell
.\aplicar-migraciones.ps1
```

**¿Qué hace?**
1. Genera el cliente Prisma
2. Aplica migraciones pendientes
3. Actualiza la BD sin perder datos

**¿Cuándo usarlo?**
- Al actualizar el código en producción
- Cuando hay nuevas migraciones
- Para sincronizar BD en otro ambiente

### Opción 2: Comando Manual

```powershell
# Aplicar migraciones pendientes
docker exec chicoj-backend npx prisma migrate deploy

# O aplicar y crear si no existen
docker exec chicoj-backend npx prisma migrate dev
```

---

## 🆕 Crear Nuevas Migraciones

### Paso 1: Modificar el Schema

Edita `Chicoj_System_R-T/backend/prisma/schema.prisma`

Ejemplo - Agregar campo `telefono` a empleados:

```prisma
model empleados {
  id_empleado        Int       @id @default(autoincrement())
  nombre             String    @db.VarChar(80)
  apellidos          String    @db.VarChar(120)
  telefono           String?   @db.VarChar(20) // 👈 Nuevo campo
  edad               Int?
  genero             String?   @db.VarChar(20)
  correo_electronico String    @unique @db.VarChar(150)
  usuarios           usuarios?

  @@map("empleados")
}
```

### Paso 2: Crear Migración

```powershell
docker exec chicoj-backend npx prisma migrate dev --name agregar_telefono_empleados
```

### Paso 3: Verificar

```powershell
# Ver migración creada
ls Chicoj_System_R-T/backend/prisma/migrations/

# Aplicar en producción
docker exec chicoj-backend npx prisma migrate deploy
```

---

## 🎨 Prisma Studio

**Prisma Studio** es una interfaz visual para ver y editar datos.

### Abrir Prisma Studio

```powershell
docker exec -d chicoj-backend npx prisma studio --port 5555
```

Luego abre en tu navegador: `http://localhost:5555`

### Características

- ✅ Ver todas las tablas
- ✅ Filtrar y buscar registros
- ✅ Editar datos directamente
- ✅ Ver relaciones entre tablas
- ✅ Ejecutar queries visuales

### Cerrar Prisma Studio

```powershell
# Encuentra el proceso
docker exec chicoj-backend ps aux | grep prisma

# Mata el proceso (reemplaza PID)
docker exec chicoj-backend kill <PID>
```

---

## 🔧 Troubleshooting

### Problema 1: "Can't reach database server"

**Causa**: El contenedor de PostgreSQL no está corriendo o no es accesible.

**Solución**:
```powershell
# Verificar contenedores
docker ps

# Verificar logs de PostgreSQL
docker logs chicoj-postgres

# Reiniciar PostgreSQL
docker restart chicoj-postgres

# Verificar conexión en .env
# DATABASE_URL="postgresql://postgres:tu_password@postgres:5432/restaurante_db"
```

### Problema 2: "Migration failed to apply"

**Causa**: Conflicto con el estado actual de la BD.

**Solución**:
```powershell
# Opción 1: Resetear todo
.\reset-database.ps1

# Opción 2: Resolver conflicto manual
docker exec chicoj-backend npx prisma migrate resolve --applied <nombre_migracion>
```

### Problema 3: "Schema.prisma is invalid"

**Causa**: Error de sintaxis en el schema.

**Solución**:
```powershell
# Validar schema
docker exec chicoj-backend npx prisma validate

# Formatear schema
docker exec chicoj-backend npx prisma format

# Ver error específico en la salida del comando
```

### Problema 4: "Client generation failed"

**Causa**: Error al generar el cliente de Prisma.

**Solución**:
```powershell
# Limpiar node_modules
docker exec chicoj-backend rm -rf node_modules/.prisma

# Reinstalar
docker exec chicoj-backend npm install

# Regenerar cliente
docker exec chicoj-backend npx prisma generate
```

### Problema 5: "Cannot find module '@prisma/client'"

**Causa**: Cliente de Prisma no generado.

**Solución**:
```powershell
# Generar cliente
docker exec chicoj-backend npx prisma generate

# Si persiste, reinstalar
docker exec chicoj-backend npm install @prisma/client
```

---

## 📊 Estructura de la Base de Datos

### Tablas Principales

| Tabla | Descripción | Registros Seed |
|-------|-------------|----------------|
| `roles` | Roles de usuario | 6 roles |
| `empleados` | Información de empleados | 8 empleados |
| `usuarios` | Credenciales de acceso | 8 usuarios |
| `area` | Áreas de preparación | 3 áreas |
| `platillos` | Menú completo | 41 platillos |
| `cuenta` | Órdenes principales | 0 (vacío) |
| `comanda` | Detalle de órdenes | 0 (vacío) |
| `area_registro` | KDS por área | 0 (vacío) |
| `caja_comprobante` | Comprobantes de pago | 0 (vacío) |
| `tour` | Reservas de tours | 0 (vacío) |
| `notificacion` | Notificaciones | 0 (vacío) |

### Categorías de Platillos

#### Cocina (15)
- Desayunos (3)
- Almuerzos (5)
- Menu Infantil (2)
- Refacciones (2)
- Refacciones Tipicas (3)

#### Bebidas (13)
- Bebidas Frias (4)
- Licuados (3)
- Cervezas (3)
- Bebidas Desechables (3)

#### Coffee (13)
- Cafe (7)
- Postres (6)

---

## 🎯 Comandos Útiles Rápidos

```powershell
# Ver todas las tablas
docker exec chicoj-backend npx prisma db pull

# Ejecutar seed
docker exec chicoj-backend npm run seed

# Ver logs del backend
docker logs chicoj-backend -f

# Entrar al contenedor backend
docker exec -it chicoj-backend sh

# Conectarse a PostgreSQL
docker exec -it chicoj-postgres psql -U postgres -d restaurante_db

# Ver versión de Prisma
docker exec chicoj-backend npx prisma --version

# Generar diagrama ER (requiere prisma-erd-generator)
docker exec chicoj-backend npx prisma generate --generator erd
```

---

## 📚 Recursos Adicionales

- [Documentación Oficial de Prisma](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

## ✅ Checklist de Operaciones Comunes

### Primera Instalación
- [ ] Verificar que Docker esté corriendo
- [ ] Configurar `.env` con credenciales correctas
- [ ] Ejecutar `.\reset-database.ps1`
- [ ] Verificar que el seed se ejecutó correctamente
- [ ] Probar login con usuario `admin/admin123`

### Actualizar Schema
- [ ] Modificar `schema.prisma`
- [ ] Ejecutar `npx prisma format`
- [ ] Crear migración con `npx prisma migrate dev`
- [ ] Aplicar en producción con `npx prisma migrate deploy`
- [ ] Regenerar cliente con `npx prisma generate`

### Backup y Restore
- [ ] Exportar schema: `npx prisma db pull`
- [ ] Hacer backup del SQL: Usar `script-base-datos-chicoj.sql`
- [ ] Exportar datos: `pg_dump` desde PostgreSQL
- [ ] Restaurar: Usar `reset-database.ps1` + restore SQL

---

**Última actualización**: Noviembre 3, 2025  
**Versión del Schema**: 2.0 (con categorías y usuario tour)  
**Motor de BD**: PostgreSQL 15+

