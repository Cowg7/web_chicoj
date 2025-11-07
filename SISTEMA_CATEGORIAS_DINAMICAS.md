# 📂 SISTEMA DE GESTIÓN DE CATEGORÍAS DINÁMICAS

## 🎯 **FUNCIONALIDADES IMPLEMENTADAS**

Se ha implementado un sistema completo que permite a los administradores crear, editar, activar/desactivar y eliminar categorías de platillos de forma dinámica. Las categorías están asociadas a áreas específicas (Cocina, Bebidas, Coffee, etc.).

---

## 📋 **CAMBIOS REALIZADOS**

### **1️⃣ BASE DE DATOS**

#### **Nueva Tabla: `categorias`**
```sql
- id_categoria (PK, SERIAL)
- nombre (VARCHAR 100)
- descripcion (VARCHAR 200, opcional)
- id_area (FK → area.id_area)
- activa (BOOLEAN, default: true)
```

**Restricciones:**
- ✅ Una categoría no puede repetirse en la misma área
- ✅ Si se elimina un área, sus categorías también se eliminan (CASCADE)
- ✅ Si se elimina una categoría, los platillos NO se eliminan (SET NULL)

#### **Tabla `platillos` Actualizada**
```sql
- Se agregó: id_categoria (INT, nullable, FK → categorias.id_categoria)
- Se mantiene: categoria (VARCHAR, para compatibilidad)
```

**Archivos modificados:**
- ✅ `Chicoj_System_R-T/backend/prisma/schema.prisma`
- ✅ `migracion-sistema-categorias.sql` (archivo de migración)

---

### **2️⃣ BACKEND**

#### **Nuevo Controlador: `categorias.controller.js`**

**Endpoints implementados:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/categorias` | Obtener todas las categorías (filtrable por área y estado) |
| GET | `/api/categorias/:id` | Obtener una categoría específica |
| POST | `/api/categorias` | Crear nueva categoría (requiere auth) |
| PATCH | `/api/categorias/:id` | Actualizar categoría (requiere auth) |
| PATCH | `/api/categorias/:id/toggle` | Activar/desactivar categoría (requiere auth) |
| DELETE | `/api/categorias/:id` | Eliminar categoría (requiere auth) |

**Validaciones:**
- ✅ No permite nombres duplicados en la misma área
- ✅ No permite eliminar categorías con platillos asociados
- ✅ Mensajes de error descriptivos

**Archivos creados:**
- ✅ `Chicoj_System_R-T/backend/src/modules/categorias/categorias.controller.js`
- ✅ `Chicoj_System_R-T/backend/src/routes/categorias.routes.js`

**Archivos modificados:**
- ✅ `Chicoj_System_R-T/backend/src/routes/index.js`
- ✅ `Chicoj_System_R-T/backend/src/modules/menu/menu.controller.js`

---

### **3️⃣ FRONTEND**

#### **Vista de Control de Platillos**

**Nuevo botón:** "Gestionar Categorías"
- Ubicación: Header de la tabla de platillos
- Abre un modal completo de gestión

**Modal de Gestión de Categorías incluye:**
1. **Formulario de creación/edición:**
   - Select de área (requerido)
   - Campo de nombre (requerido)
   - Campo de descripción (opcional)
   - Botón guardar/actualizar
   - Botón cancelar (solo en modo edición)

2. **Lista de categorías existentes (tarjetas):**
   - Muestra nombre, área y descripción
   - Badge de estado (ACTIVA/INACTIVA)
   - Contador de platillos asociados
   - Botones de acción:
     - **Editar:** Carga datos en el formulario
     - **Activar/Desactivar:** Cambia el estado
     - **Eliminar:** Solo si no tiene platillos

**Archivos modificados:**
- ✅ `chicoj-frontend/templates/administracion/control-platillos.html`
- ✅ `chicoj-frontend/scripts/control-platillos.js`

#### **Formulario de Platillos**

**Cambios en el campo "Categoría":**
- ✅ Se carga dinámicamente según el área seleccionada
- ✅ Solo muestra categorías activas
- ✅ Se deshabilita si no hay categorías disponibles
- ✅ Muestra mensaje si el área no tiene categorías
- ✅ Opcional: permite crear platillos sin categoría

**Archivos modificados:**
- ✅ `chicoj-frontend/scripts/platillos.js`
- ✅ `chicoj-frontend/scripts/api.js`

---

## 🚀 **INSTRUCCIONES DE INSTALACIÓN**

### **Paso 1: Aplicar Migración a la Base de Datos**

```bash
# Conectarse a PostgreSQL
psql -U tu_usuario -d chicoj_db

# Ejecutar la migración
\i migracion-sistema-categorias.sql

# Verificar que se creó correctamente
SELECT * FROM categorias;
```

### **Paso 2: Actualizar Prisma Client**

```bash
cd Chicoj_System_R-T/backend
npx prisma generate
```

### **Paso 3: Reiniciar el Backend**

```bash
npm run dev
# o
node src/server.js
```

### **Paso 4: Limpiar Caché del Frontend**

```bash
# Ctrl + Shift + R en el navegador
# o borrar caché y cookies del sitio
```

---

## 📖 **CÓMO USAR EL SISTEMA**

### **1. Gestionar Categorías**

1. Ir a: **Administración → Control de Platillos**
2. Clic en botón **"Gestionar Categorías"**
3. En el modal:
   - Seleccionar área
   - Ingresar nombre (ej: "Desayunos", "Licuados")
   - Agregar descripción opcional
   - Clic en **"Guardar Categoría"**

### **2. Editar Categoría**

1. En el modal de categorías, buscar la tarjeta de la categoría
2. Clic en **"Editar"**
3. Modificar campos necesarios
4. Clic en **"Actualizar Categoría"**

### **3. Activar/Desactivar Categoría**

1. Clic en botón **"Desactivar"** o **"Activar"**
2. Confirmar la acción
3. **Nota:** Los platillos que ya tienen esta categoría la conservarán

### **4. Eliminar Categoría**

1. Clic en botón **"Eliminar"**
2. **Solo se puede eliminar si:**
   - ✅ No tiene platillos asociados
   - ❌ Si tiene platillos, se muestra mensaje descriptivo
3. **Recomendación:** Desactivar en lugar de eliminar

### **5. Crear Platillo con Categoría**

1. Ir a: **Agregar Platillo**
2. Seleccionar área
3. El select de categorías se actualiza automáticamente
4. Seleccionar categoría (opcional)
5. Completar demás campos
6. Guardar

---

## ⚠️ **NOTAS IMPORTANTES**

### **Compatibilidad Retroactiva**
- ✅ La migración mantiene la columna antigua `categoria` por seguridad
- ✅ Los platillos existentes se migran automáticamente cuando es posible
- ✅ Si un platillo no tiene coincidencia, queda con `id_categoria = NULL`

### **Eliminación de Columna Antigua**
Después de verificar que todo funciona correctamente, puedes eliminar la columna `categoria` (string):

```sql
-- Verificar primero
SELECT id_platillo, nombre, categoria, id_categoria 
FROM platillos;

-- Si todo está bien, eliminar
ALTER TABLE platillos DROP COLUMN categoria;
```

### **Protecciones Implementadas**

1. **No se puede eliminar:**
   - Categorías con platillos asociados
   - Platillos con órdenes históricas

2. **Mensajes descriptivos:**
   - El usuario recibe mensajes claros sobre por qué no puede eliminar
   - Se sugiere alternativas (desactivar en lugar de eliminar)

3. **Integridad referencial:**
   - Foreign keys con `ON DELETE SET NULL`
   - Permite mantener historial de platillos aunque se elimine la categoría

---

## 🎨 **CARACTERÍSTICAS DEL UI**

### **Modal de Categorías**
- ✅ Diseño moderno con animaciones
- ✅ Responsive (se adapta a móviles)
- ✅ Tarjetas visuales por categoría
- ✅ Badges de estado coloridos
- ✅ Contador de platillos asociados
- ✅ Cierre con ESC o clic fuera

### **Notificaciones**
- ✅ Mensajes de éxito en verde
- ✅ Mensajes de error en rojo (con duración extendida)
- ✅ Soporte para mensajes largos
- ✅ Animaciones suaves

---

## 🔧 **ENDPOINTS DE LA API**

### **Obtener Categorías**
```javascript
GET /api/categorias
Query params:
  - id_area (opcional): filtrar por área
  - activa (opcional): true/false

Respuesta:
{
  "success": true,
  "data": {
    "categorias": [
      {
        "id_categoria": 1,
        "nombre": "Desayunos",
        "descripcion": "Platillos de desayuno",
        "id_area": 1,
        "activa": true,
        "area": { "id_area": 1, "nombre": "Cocina" },
        "_count": { "platillos": 5 }
      }
    ],
    "total": 10
  }
}
```

### **Crear Categoría**
```javascript
POST /api/categorias
Headers: Authorization: Bearer {token}
Body:
{
  "nombre": "Postres",
  "descripcion": "Postres y dulces",
  "id_area": 3
}
```

### **Actualizar Categoría**
```javascript
PATCH /api/categorias/:id
Headers: Authorization: Bearer {token}
Body:
{
  "nombre": "Postres Especiales",
  "descripcion": "Postres gourmet"
}
```

### **Activar/Desactivar**
```javascript
PATCH /api/categorias/:id/toggle
Headers: Authorization: Bearer {token}
Body:
{
  "activa": false
}
```

### **Eliminar Categoría**
```javascript
DELETE /api/categorias/:id
Headers: Authorization: Bearer {token}
```

---

## 📊 **CATEGORÍAS PREDEFINIDAS**

La migración crea automáticamente estas categorías:

**Cocina:**
- Desayunos
- Almuerzos
- Menu Infantil
- Refacciones
- Refacciones Tipicas

**Bebidas:**
- Bebidas Frias
- Licuados
- Cervezas
- Bebidas Desechables

**Coffee:**
- Postres
- Cafe

---

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### **Error: "No se pueden cargar las categorías"**
```bash
# Verificar que el backend esté corriendo
# Verificar que la migración se aplicó correctamente
SELECT COUNT(*) FROM categorias;
```

### **Las categorías no aparecen en el formulario**
```bash
# Verificar que las categorías estén activas
SELECT * FROM categorias WHERE activa = true;

# Limpiar caché del navegador
```

### **Error al crear platillo: "id_categoria no válido"**
```bash
# Verificar que la categoría existe y está activa
SELECT * FROM categorias WHERE id_categoria = X;
```

---

## ✅ **TESTING**

### **Pruebas a Realizar:**

1. ✅ Crear categoría nueva
2. ✅ Editar nombre de categoría
3. ✅ Intentar crear categoría duplicada en misma área (debe fallar)
4. ✅ Crear categoría con mismo nombre en área diferente (debe funcionar)
5. ✅ Desactivar categoría
6. ✅ Verificar que categoría inactiva no aparece en formulario de platillos
7. ✅ Intentar eliminar categoría con platillos (debe fallar con mensaje)
8. ✅ Eliminar categoría sin platillos
9. ✅ Crear platillo sin categoría
10. ✅ Crear platillo con categoría
11. ✅ Editar platillo y cambiar categoría
12. ✅ Verificar que platillos mantienen categoría aunque esta se desactive

---

## 🎉 **BENEFICIOS DEL SISTEMA**

1. **Flexibilidad:** El administrador puede crear categorías según sus necesidades
2. **Organización:** Mejor clasificación de platillos por tipo
3. **Escalabilidad:** Fácil agregar nuevas categorías sin tocar código
4. **Integridad:** Protección contra eliminaciones accidentales
5. **UX Mejorada:** Interfaz intuitiva y visual para gestión
6. **Compatibilidad:** Sistema funciona con datos existentes

---

## 📝 **ARCHIVOS CREADOS/MODIFICADOS**

### **Creados:**
- `Chicoj_System_R-T/backend/src/modules/categorias/categorias.controller.js`
- `Chicoj_System_R-T/backend/src/routes/categorias.routes.js`
- `migracion-sistema-categorias.sql`
- `SISTEMA_CATEGORIAS_DINAMICAS.md` (este archivo)

### **Modificados:**
- `Chicoj_System_R-T/backend/prisma/schema.prisma`
- `Chicoj_System_R-T/backend/src/routes/index.js`
- `Chicoj_System_R-T/backend/src/modules/menu/menu.controller.js`
- `chicoj-frontend/templates/administracion/control-platillos.html`
- `chicoj-frontend/scripts/control-platillos.js`
- `chicoj-frontend/scripts/platillos.js`
- `chicoj-frontend/scripts/api.js`

---

**¡El sistema está listo para usar! 🎊**

