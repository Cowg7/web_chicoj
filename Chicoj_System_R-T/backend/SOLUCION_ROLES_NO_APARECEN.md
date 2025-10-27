# 🔧 SOLUCIÓN - Rol No Aparece en Select

## 🎯 **PROBLEMA:**
Agregaste un rol nuevo a la base de datos pero no aparece en el select al asignar usuario.

---

## ✅ **SOLUCIONES (De más rápida a más completa):**

### **1️⃣ SOLUCIÓN RÁPIDA - Hard Refresh** ⚡

El navegador probablemente tiene cacheado el JavaScript:

```
1. Abre: http://localhost:8080/templates/administracion/agregar_usuarios.html
2. Presiona: Ctrl + Shift + R (Windows/Linux) o Cmd + Shift + R (Mac)
3. ✅ Los roles deben recargarse
```

---

### **2️⃣ VERIFICAR ROLES DESDE LA WEB** 🌐

Abre esta herramienta de diagnóstico:

```
http://localhost:8080/DIAGNOSTICO_ROLES.html
```

**Funciones:**
- ✅ Muestra todos los roles cargados desde el API
- ✅ Verifica si el nuevo rol está registrado
- ✅ Muestra instrucciones SQL para agregar roles
- ✅ Detecta problemas de autenticación

---

### **3️⃣ VERIFICAR ROLES DESDE TERMINAL** 💻

En la terminal del backend, ejecuta:

```bash
cd backend
node test-roles.js
```

**Esto mostrará:**
- ✅ Lista completa de roles en la BD
- ✅ ID de cada rol
- ✅ Descripción
- ✅ Cuántos usuarios tienen ese rol

---

### **4️⃣ VERIFICAR CON PRISMA STUDIO** 🖥️

Abre la interfaz visual de la base de datos:

```bash
cd backend
npx prisma studio
```

**Pasos:**
1. Se abrirá en `http://localhost:5555`
2. Click en la tabla **"roles"**
3. ✅ Verás todos los roles registrados
4. Puedes agregar, editar o eliminar roles directamente

---

### **5️⃣ AGREGAR ROL MANUALMENTE (Si no existe)** 📝

Si el rol NO aparece en la base de datos, agrégalo:

**Opción A: Usando Prisma Studio**
```
1. npx prisma studio
2. Tabla "roles"
3. Click "+ Add Record"
4. Llenar:
   - nombre_rol: "NombreDelRol"
   - descripcion: "Descripción del rol"
5. Click "Save"
```

**Opción B: SQL Directo**
```sql
-- Conectarse a PostgreSQL y ejecutar:
INSERT INTO roles (nombre_rol, descripcion) 
VALUES ('Nuevo Rol', 'Descripción del nuevo rol');

-- Verificar:
SELECT * FROM roles ORDER BY id_rol;
```

**Opción C: Desde el Seed (para desarrollo)**
```javascript
// Editar backend/prisma/seed.js y agregar:

const rolesData = [
  // ... roles existentes
  {
    nombre_rol: 'Nuevo Rol',
    descripcion: 'Descripción del nuevo rol'
  }
];

// Luego ejecutar:
npm run db:seed
```

---

## 🔍 **DIAGNÓSTICO COMPLETO:**

### **Paso 1: Verificar que el rol existe en BD**
```bash
cd backend
node test-roles.js
```
✅ Si aparece → Continúa al Paso 2
❌ Si NO aparece → Agrégalo (ver sección 5️⃣)

### **Paso 2: Verificar que el API devuelve el rol**
```
Abre: http://localhost:8080/DIAGNOSTICO_ROLES.html
Click: "🔄 Cargar Roles desde API"
```
✅ Si aparece → Continúa al Paso 3
❌ Si NO aparece → Verifica que el backend esté corriendo

### **Paso 3: Limpiar caché del navegador**
```
1. Ctrl + Shift + R (hard refresh)
2. O limpia localStorage:
   - F12 (abrir consola)
   - Ejecutar: localStorage.clear(); location.reload();
```

### **Paso 4: Verificar en el select**
```
1. Ir a: agregar_usuarios.html
2. Ctrl + Shift + R
3. Abrir el select de "Rol"
4. ✅ El nuevo rol debe aparecer
```

---

## 📊 **ROLES POR DEFECTO EN EL SISTEMA:**

El seed crea estos roles automáticamente:

| ID | Nombre        | Descripción                     |
|----|---------------|---------------------------------|
| 1  | Administrador | Acceso total al sistema         |
| 2  | Gerente       | Acceso a reportes y gestión     |
| 3  | Cajero        | Acceso a caja y pagos           |
| 4  | Mesero        | Gestión de órdenes y comandas   |
| 5  | Cocina        | Acceso a KDS área Cocina        |

---

## 💡 **TIPS:**

### **Si agregaste un rol y no aparece:**
1. ✅ Verifica que se guardó en BD: `node test-roles.js`
2. ✅ Haz hard refresh: `Ctrl + Shift + R`
3. ✅ Limpia localStorage y vuelve a login
4. ✅ Verifica que el backend esté corriendo

### **Si quieres agregar múltiples roles:**
1. Edita `backend/prisma/seed.js`
2. Agrega los roles al array `rolesData`
3. Ejecuta: `npm run db:reset` (⚠️ borra datos) o `npm run db:seed`

### **Si necesitas editar un rol existente:**
1. `npx prisma studio`
2. Tabla "roles"
3. Edita el rol
4. Click "Save"
5. Ctrl + Shift + R en el navegador

---

## 🧪 **PRUEBA COMPLETA:**

```bash
# 1. Verificar roles en BD
cd backend
node test-roles.js

# 2. Si necesitas agregar uno:
npx prisma studio
# → Agregar rol en la tabla "roles"

# 3. Verificar en web
# Abre: http://localhost:8080/DIAGNOSTICO_ROLES.html
# Click: "🔄 Cargar Roles desde API"
# ✅ Debe aparecer el nuevo rol

# 4. Probar en el formulario
# Abre: http://localhost:8080/templates/administracion/agregar_usuarios.html
# Ctrl + Shift + R (hard refresh)
# Abrir select de "Rol"
# ✅ El nuevo rol debe estar en la lista
```

---

## 📁 **ARCHIVOS ÚTILES:**

- ✅ `DIAGNOSTICO_ROLES.html` - Herramienta web de diagnóstico
- ✅ `backend/test-roles.js` - Script de verificación de roles
- ✅ `backend/prisma/seed.js` - Seed de roles por defecto
- ✅ `backend/src/modules/users/users.controller.js` - Endpoint `/api/users/roles`

---

## ⚠️ **PROBLEMAS COMUNES:**

### **Error: "No se pudieron cargar los roles"**
**Solución:** Verifica que el backend esté corriendo en `http://localhost:3000`

### **Error: "Token inválido"**
**Solución:** 
```javascript
// En consola del navegador:
localStorage.clear();
location.href = '/templates/login.html';
```

### **El rol aparece en BD pero NO en el select**
**Solución:** 
```
1. Ctrl + Shift + R (hard refresh)
2. Si persiste: Cerrar TODAS las pestañas del sistema
3. Abrir pestaña nueva
4. Login y probar de nuevo
```

---

## ✅ **RESUMEN RÁPIDO:**

```
1. Verificar rol en BD:
   → node test-roles.js

2. Hard refresh:
   → Ctrl + Shift + R

3. Herramienta web:
   → http://localhost:8080/DIAGNOSTICO_ROLES.html

4. Si no existe, agregar con:
   → npx prisma studio
```

**✅ Con estos pasos, el rol debe aparecer en el select** 🚀

